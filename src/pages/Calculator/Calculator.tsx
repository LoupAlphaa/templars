import { useState, useEffect } from 'react';
import {
    loadAlloysData,
    getAlloysNames,
    calculateFromNetherite,
    calculateMaterialsNeeded,
    type CalculationResult,
    type AlloysData,
} from '../../lib/calculatorUtils';
import { getItemIcon } from '../../lib/itemIcons';
import './Calculator.css';


// ── Cascade helpers ──────────────────────────────────────────────────────────
function computeCascadeMaxes(
    chain: string[],
    alloysIngotsMax: Record<string, number>,
    ownedIngots: Record<string, number>,
    isEquipmentMode: boolean,
): Record<string, number> {
    const lastIdx = chain.length - 1;
    const ratios: number[] = chain.map((name, i) => {
        if (i === lastIdx) return 1;
        const thisMax = alloysIngotsMax[name] ?? 1;
        const nextMax = alloysIngotsMax[chain[i + 1]] ?? 1;
        return nextMax > 0 ? thisMax / nextMax : 1;
    });
    const consumedByHigher = (targetIdx: number): number => {
        let consumed = 0;
        for (let j = targetIdx + 1; j <= lastIdx; j++) {
            const ownedAtJ = ownedIngots[chain[j]] ?? 0;
            if (ownedAtJ === 0) continue;
            let cascadeRatio = 1;
            for (let k = targetIdx; k < j; k++) cascadeRatio *= ratios[k];
            consumed += ownedAtJ * cascadeRatio;
        }
        return consumed;
    };
    const result: Record<string, number> = {};
    chain.forEach((name, idx) => {
        const rawMax = alloysIngotsMax[name] ?? 0;
        const baseCap = (isEquipmentMode && idx === lastIdx) ? rawMax - 1 : rawMax;
        result[name] = Math.max(0, baseCap - consumedByHigher(idx));
    });
    return result;
}

function clampOwnedIngots(
    chain: string[],
    alloysIngotsMax: Record<string, number>,
    ownedIngots: Record<string, number>,
    isEquipmentMode: boolean,
): Record<string, number> {
    const maxes = computeCascadeMaxes(chain, alloysIngotsMax, ownedIngots, isEquipmentMode);
    const clamped: Record<string, number> = { ...ownedIngots };
    for (const name of chain) {
        const cap = maxes[name] ?? 0;
        if ((clamped[name] ?? 0) > cap) clamped[name] = cap;
    }
    return clamped;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Calculator() {
    const [data, setData] = useState<AlloysData | null>(null);
    const [alloysNames, setAlloysNames] = useState<string[]>([]);
    const [calculatorMode, setCalculatorMode] = useState<'ingots' | 'equipment'>('ingots');

    // Ingots mode
    const [selectedAlloy, setSelectedAlloy] = useState<string>('Bronze');
    const [ingotQuantity, setIngotQuantity] = useState<number>(1);

    // Equipment mode
    const [selectedStartAlloy, setSelectedStartAlloy] = useState<string>('Netherite');
    const [selectedTargetAlloy, setSelectedTargetAlloy] = useState<string>('Bronze');
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>('Helmet');

    // Lingots déjà possédés (commun aux deux modes)
    const [ownedIngots, setOwnedIngots] = useState<Record<string, number>>({});

    const [result, setResult] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSteps, setShowSteps] = useState(false);

    const startIndex = alloysNames.indexOf(selectedStartAlloy);

    // Load alloys data
    useEffect(() => {
        loadAlloysData().then((loadedData) => {
            setData(loadedData);
            setAlloysNames(getAlloysNames(loadedData));
            setLoading(false);
        });
    }, []);

    // Réinitialiser les lingots possédés quand la sélection change
    useEffect(() => {
        setOwnedIngots({});
    }, [calculatorMode, selectedAlloy, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType]);

    // Calculate materials when selections change
    useEffect(() => {
        if (!data) return;

        // First pass with empty owned to get stable alloysIngotsMax and chain order.
        // Second pass with clamped owned to avoid ghost values (values hidden by the UI
        // cap but still in state) incorrectly reducing raw-material totals in calculatorUtils.
        const computeWithClamping = (rawOwned: Record<string, number>) => {
            if (calculatorMode === 'ingots') {
                const raw = calculateMaterialsNeeded(data, 'Netherite', selectedAlloy, 'Lingot', {}, ingotQuantity);
                const chain = raw.fullChain;
                const clamped = clampOwnedIngots(chain, raw.alloysIngotsMax, rawOwned, false);
                return calculateMaterialsNeeded(data, 'Netherite', selectedAlloy, 'Lingot', clamped, ingotQuantity);
            } else {
                const isNetherite = selectedStartAlloy === 'Netherite';
                const raw = isNetherite
                    ? calculateFromNetherite(data, selectedTargetAlloy, selectedEquipmentType, {})
                    : calculateMaterialsNeeded(data, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType, {});
                const chain = raw.fullChain;
                const clamped = clampOwnedIngots(chain, raw.alloysIngotsMax, rawOwned, true);
                return isNetherite
                    ? calculateFromNetherite(data, selectedTargetAlloy, selectedEquipmentType, clamped)
                    : calculateMaterialsNeeded(data, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType, clamped);
            }
        };

        setResult(computeWithClamping(ownedIngots));
    }, [data, calculatorMode, selectedAlloy, ingotQuantity, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType, ownedIngots]);

    if (loading) {
        return <div className="calculator">Chargement des données...</div>;
    }

    const equipmentTypes = ['Helmet', 'Chestplate', 'Leggings', 'Boots', 'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe'];

    return (
        <div className="calculator">
            <div className="calculator-header">
                <h1>Calculateur d'Alliages</h1>
                <p className="calculator-subtitle">Planifiez votre progression d'équipement</p>
            </div>

            <div className="calculator-container">
                {/* Mode Tabs */}
                <div className="mode-tabs">
                    <button
                        className={`mode-tab ${calculatorMode === 'ingots' ? 'active' : ''}`}
                        onClick={() => setCalculatorMode('ingots')}
                    >
                        ⚱️ Lingots
                    </button>
                    <button
                        className={`mode-tab ${calculatorMode === 'equipment' ? 'active' : ''}`}
                        onClick={() => setCalculatorMode('equipment')}
                    >
                        ⚔️ Équipements
                    </button>
                </div>

                {/* Ingots Mode */}
                {calculatorMode === 'ingots' && (
                    <div className="calculator-controls">
                        <div className="control-group">
                            <label htmlFor="alloy-ingot">Alliage</label>
                            <select
                                id="alloy-ingot"
                                value={selectedAlloy}
                                onChange={(e) => setSelectedAlloy(e.target.value)}
                            >
                                {alloysNames.map((alloy) => (
                                    <option key={alloy} value={alloy}>
                                        {alloy}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label htmlFor="quantity">Quantité de lingots</label>
                            <input
                                id="quantity"
                                type="number"
                                min="1"
                                max="999"
                                value={ingotQuantity}
                                onChange={(e) => setIngotQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="quantity-input"
                            />
                        </div>
                    </div>
                )}

                {/* Equipment Mode */}
                {calculatorMode === 'equipment' && (
                    <div className="calculator-controls">
                        <div className="control-group">
                            <label htmlFor="start-alloy">Point de départ</label>
                            <select
                                id="start-alloy"
                                value={selectedStartAlloy}
                                onChange={(e) => {
                                    const newStart = e.target.value;
                                    setSelectedStartAlloy(newStart);
                                    // If start equals target, change target to next alloy in progression
                                    if (newStart === selectedTargetAlloy) {
                                        if (newStart === 'Netherite') {
                                            setSelectedTargetAlloy(alloysNames[0]);
                                        } else {
                                            const startIndex = alloysNames.indexOf(newStart);

                                            if (startIndex >= 0 && startIndex + 1 < alloysNames.length) {
                                                setSelectedTargetAlloy(alloysNames[startIndex + 1]);
                                            }
                                        }
                                    } else {
                                        const startIndex =
                                            newStart === 'Netherite' ? -1 : alloysNames.indexOf(newStart);
                                        const targetIndex =
                                            selectedTargetAlloy === 'Netherite'
                                                ? -1
                                                : alloysNames.indexOf(selectedTargetAlloy);
                                        if (startIndex > targetIndex) {
                                            if (startIndex + 1 < alloysNames.length) {
                                                setSelectedTargetAlloy(alloysNames[startIndex + 1]);
                                            }
                                        }
                                    }
                                }}
                            >
                                <option value="Netherite">Netherite</option>
                                {alloysNames.slice(0, -1).map((alloy) => (
                                    <option key={alloy} value={alloy}>
                                        {alloy}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label htmlFor="target-alloy">Objectif</label>
                            <select
                                id="target-alloy"
                                value={selectedTargetAlloy}
                                onChange={(e) => setSelectedTargetAlloy(e.target.value)}
                            >
                                {alloysNames.map((alloy, index) => (
                                    <option
                                        key={alloy}
                                        value={alloy}
                                        disabled={index <= startIndex}
                                    >
                                        {alloy}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label htmlFor="equipment">Type d'équipement</label>
                            <select
                                id="equipment"
                                value={selectedEquipmentType}
                                onChange={(e) => setSelectedEquipmentType(e.target.value)}
                            >
                                {equipmentTypes.map((eq) => (
                                    <option key={eq} value={eq}>
                                        {eq}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {result && result.totalMaterials.length > 0 && (
                    <div className="calculator-results">

                        {/* ── Lingots possédés ── */}
                        {result.alloysIngots.length > 0 && (() => {
                            const chain = result.fullChain;
                            const lastIdx = chain.length - 1;

                            // ratio[i] = units of chain[i] needed per unit of chain[i+1]
                            const ratios: number[] = chain.map((name, i) => {
                                if (i === lastIdx) return 1;
                                const thisMax = result.alloysIngotsMax[name] ?? 1;
                                const nextMax = result.alloysIngotsMax[chain[i + 1]] ?? 1;
                                return nextMax > 0 ? thisMax / nextMax : 1;
                            });

                            // Units of chain[targetIdx] already covered by owned higher-tier ingots
                            const consumedByHigher = (targetIdx: number): number => {
                                let consumed = 0;
                                for (let j = targetIdx + 1; j <= lastIdx; j++) {
                                    const ownedAtJ = ownedIngots[chain[j]] ?? 0;
                                    if (ownedAtJ === 0) continue;
                                    let cascadeRatio = 1;
                                    for (let k = targetIdx; k < j; k++) cascadeRatio *= ratios[k];
                                    consumed += ownedAtJ * cascadeRatio;
                                }
                                return consumed;
                            };

                            // Input cap: last alloy capped at rawMax-1, intermediates at full rawMax,
                            // both further reduced by what higher-tier owned already covers.
                            const effectiveMax = (idx: number): number => {
                                const rawMax = result.alloysIngotsMax[chain[idx]];
                                const baseCap = idx === lastIdx && calculatorMode === 'equipment' ? rawMax - 1 : rawMax;
                                return Math.max(0, baseCap - consumedByHigher(idx));
                            };

                            return (
                                <div className="owned-ingots-section">
                                    <h3 className="owned-ingots-title">⚗️ Lingots déjà possédés</h3>
                                    <p className="owned-ingots-hint">Indiquez vos lingots disponibles pour déduire les matériaux correspondants du résultat.</p>
                                    <div className="owned-ingots-list">
                                        {chain.map((name, idx) => {
                                            const max = effectiveMax(idx);
                                            const owned = Math.min(ownedIngots[name] ?? 0, max);
                                            return (
                                                <div key={name} className="owned-ingot-row">
                                                    <span className="owned-ingot-name">
                                                        <span className="item-icon">
                                                            {getItemIcon(name)
                                                                ? <img src={getItemIcon(name)} alt={name} />
                                                                : '📦'}
                                                        </span>
                                                        {name}
                                                        <span className="owned-ingot-max">/ {max}</span>
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className="owned-ingot-input"
                                                        min={0}
                                                        max={max}
                                                        value={owned}
                                                        onChange={(e) => {
                                                            const val = Math.min(max, Math.max(0, parseInt(e.target.value) || 0));
                                                            setOwnedIngots((prev) => ({ ...prev, [name]: val }));
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="summary-columns">
                            {/* Matériaux bruts */}
                            <div className="materials-summary">
                                <div className="summary-header">
                                    <h2>Matériaux bruts</h2>
                                    <span className="product-badge">
                                        {calculatorMode === 'ingots' && `⚱️ Lingots x${ingotQuantity} de ${selectedAlloy}`}
                                        {calculatorMode === 'equipment' && `${selectedEquipmentType}`}
                                    </span>
                                </div>
                                <div className="materials-list">
                                    {result.totalMaterials.map((material, idx) => (
                                        <div key={idx} className="material-item">
                                            <span className="material-content">
                                                <span className="item-icon">{getItemIcon(material.name) ? (
                                                    <img src={getItemIcon(material.name)} alt={material.name} />
                                                ) : (
                                                    '📦'
                                                )}</span>
                                                <span className="material-name">{material.name}</span>
                                            </span>
                                            <span className="material-quantity">
                                                {(() => {
                                                    const stackSize = 64;
                                                    const stacks = Math.floor(material.quantity / stackSize);
                                                    const rest = material.quantity % stackSize;

                                                    if (material.name === 'Levels') {
                                                        return (
                                                            material.quantity
                                                        )
                                                    }

                                                    return (
                                                        <>
                                                            {stacks > 0 ? `${stacks} stack${stacks > 1 ? 's' : ''}` : ''}
                                                            {rest > 0 && stacks == 0 ? `${rest}` : rest > 0 ? ` + ${rest}` : ''}
                                                        </>
                                                    );
                                                })()}
                                            </span>


                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lingots d'alliages à forger */}
                            {result.alloysIngots.length > 0 && (() => {
                                const chain = result.fullChain;
                                const lastIdx = chain.length - 1;

                                const ratios: number[] = chain.map((name, i) => {
                                    if (i === lastIdx) return 1;
                                    const thisMax = result.alloysIngotsMax[name] ?? 1;
                                    const nextMax = result.alloysIngotsMax[chain[i + 1]] ?? 1;
                                    return nextMax > 0 ? thisMax / nextMax : 1;
                                });

                                const consumedByHigher = (targetIdx: number): number => {
                                    let consumed = 0;
                                    for (let j = targetIdx + 1; j <= lastIdx; j++) {
                                        const ownedAtJ = ownedIngots[chain[j]] ?? 0;
                                        if (ownedAtJ === 0) continue;
                                        let cascadeRatio = 1;
                                        for (let k = targetIdx; k < j; k++) cascadeRatio *= ratios[k];
                                        consumed += ownedAtJ * cascadeRatio;
                                    }
                                    return consumed;
                                };

                                // rawMax − owned at this tier − consumption from higher-tier owned
                                const remainingToForge = (idx: number): number => {
                                    const rawMax = result.alloysIngotsMax[chain[idx]];
                                    const ownedDirect = Math.min(ownedIngots[chain[idx]] ?? 0, rawMax);
                                    return Math.max(0, rawMax - ownedDirect - consumedByHigher(idx));
                                };

                                // Only display alloys that are part of this session's forge chain.
                                const forgeChain = result.alloysIngots.map((i) => i.name);

                                return (
                                    <div className="materials-summary alloys-ingots-summary">
                                        <div className="summary-header">
                                            <h2>Lingots à forger</h2>
                                            <span className="product-badge forge-badge">🔥 Par ordre de forge</span>
                                        </div>
                                        <div className="materials-list">
                                            {forgeChain.map((name, forgeIdx) => {
                                                const chainIdx = chain.indexOf(name);
                                                return (
                                                <div key={forgeIdx} className="material-item alloy-ingot-item">
                                                    <span className="material-content">
                                                        <span className="forge-step-number">{forgeIdx + 1}</span>
                                                        <span className="item-icon">{getItemIcon(name) ? (
                                                            <img src={getItemIcon(name)} alt={name} />
                                                        ) : (
                                                            '📦'
                                                        )}</span>
                                                        <span className="material-name">{name}</span>
                                                    </span>
                                                    <span className="material-quantity alloy-quantity">{remainingToForge(chainIdx)}</span>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {result.steps.length > 0 && (() => {
                            const chain = result.fullChain;
                            const lastIdx = chain.length - 1;

                            const ratios: number[] = chain.map((name, i) => {
                                if (i === lastIdx) return 1;
                                const thisMax = result.alloysIngotsMax[name] ?? 1;
                                const nextMax = result.alloysIngotsMax[chain[i + 1]] ?? 1;
                                return nextMax > 0 ? thisMax / nextMax : 1;
                            });

                            const consumedByHigher = (targetIdx: number): number => {
                                let consumed = 0;
                                for (let j = targetIdx + 1; j <= lastIdx; j++) {
                                    const ownedAtJ = ownedIngots[chain[j]] ?? 0;
                                    if (ownedAtJ === 0) continue;
                                    let cascadeRatio = 1;
                                    for (let k = targetIdx; k < j; k++) cascadeRatio *= ratios[k];
                                    consumed += ownedAtJ * cascadeRatio;
                                }
                                return consumed;
                            };

                            const remainingToForge = (idx: number): number => {
                                const rawMax = result.alloysIngotsMax[chain[idx]];
                                const ownedDirect = Math.min(ownedIngots[chain[idx]] ?? 0, rawMax);
                                return Math.max(0, rawMax - ownedDirect - consumedByHigher(idx));
                            };

                            return (
                                <div className="steps-section">
                                    <div className="steps-header">
                                        <h2>Étapes d'alliage</h2>
                                        <button
                                            className={`toggle-button ${showSteps ? 'open' : ''}`}
                                            onClick={() => setShowSteps(!showSteps)}
                                            aria-expanded={showSteps}
                                        >
                                            <span className="toggle-icon">{showSteps ? '▼' : '▶'}</span>
                                            {showSteps ? 'Masquer' : 'Afficher'} les étapes
                                        </button>
                                    </div>
                                    {showSteps && (
                                        <div className="steps-list">
                                            {result.steps.map((step, idx) => {
                                                const chainIdx = chain.indexOf(step.alloysName);
                                                const rawMax = result.alloysIngotsMax[step.alloysName] ?? step.ingotCount;
                                                const remaining = chainIdx !== -1 ? remainingToForge(chainIdx) : step.ingotCount;
                                                const scale = rawMax > 0 ? remaining / rawMax : 0;

                                                if (remaining === 0) return null;

                                                return (
                                                    <div key={idx} className="step">
                                                        <div className="step-header">
                                                            <h3>{step.alloysName}</h3>
                                                            <span className="step-number">{idx + 1}</span>
                                                        </div>
                                                        <div className="step-content">
                                                            <div className="equipment-cost">
                                                                <p className="label">Coût de l'équipement:</p>
                                                                <ul>
                                                                    {step.equipmentCost.ingot > 0 && (
                                                                        <li>{step.equipmentCost.ingot}x lingots</li>
                                                                    )}
                                                                    {step.equipmentCost.rod > 0 && (
                                                                        <li>{step.equipmentCost.rod}x bâtons de bois</li>
                                                                    )}
                                                                </ul>
                                                            </div>

                                                            <div className="materials-needed">
                                                                <p className="label">Matériaux pour l'alliage:</p>
                                                                <ul>
                                                                    {step.alloysCost.map((material, midx) => (
                                                                        <li key={midx}>
                                                                            <span className="item-icon">{getItemIcon(material.name) ? (
                                                                                <img src={getItemIcon(material.name)} alt={material.name} />
                                                                            ) : (
                                                                                '📦'
                                                                            )}</span>
                                                                            {Math.ceil(material.quantity * scale)}x {material.name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <div className="thermo-section">
                                                                <p className="label">Thermique:</p>

                                                                <div className="thermo-row">
                                                                    <strong>Température requise:</strong> {step.temperature}
                                                                </div>

                                                                <div className="thermo-row">
                                                                    <strong>Combustibles possibles:</strong>
                                                                    <ul>
                                                                        {step.combustiblesPossible.map((c) => (
                                                                            <li key={c.name}>
                                                                                {c.name} ({c.temperature})
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                <div className="thermo-row">
                                                                    <strong>Refroidisseurs possibles:</strong>
                                                                    <ul>
                                                                        {step.refroidisseursPossible.map((cool) => (
                                                                            <li key={cool.name}>
                                                                                {cool.name} (−{cool.cooling_speed}) → temps: {cool.coolingTime.toFixed(2)}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {result && result.totalMaterials.length === 0 && (
                    <div className="no-results">
                        <p>
                            Veuillez sélectionner des paramètres valides.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}