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

    // Calculate materials when selections change
    useEffect(() => {
        if (!data) return;

        if (calculatorMode === 'ingots') {
            // Pour les lingots: on conserve steps (chaîne des alliages) afin d'afficher les étapes.
            const calc = calculateMaterialsNeeded(data, 'Netherite', selectedAlloy, 'Lingot');
            const scaledTotal = calc.totalMaterials.map((m) => ({ ...m, quantity: m.quantity * ingotQuantity }));
            const scaledIngots = calc.alloysIngots.map((m) => ({ ...m, quantity: m.quantity * ingotQuantity }));

            const scaledSteps = calc.steps.map((s) => ({
                ...s,
                // ingotCount scale (les matériaux bruts & coûts sont déjà calculés pour 1 batch de lingot)
                ingotCount: s.ingotCount * ingotQuantity,
                alloysCost: s.alloysCost.map((c) => ({ ...c, quantity: c.quantity * ingotQuantity })),
                equipmentCost: {
                    ingot: 0,
                    rod: 0,
                },
            }));

            setResult({
                steps: scaledSteps,
                totalMaterials: scaledTotal,
                alloysIngots: scaledIngots,
            });
        } else {
            // For equipment
            const calc =
                selectedStartAlloy === 'Netherite'
                    ? calculateFromNetherite(data, selectedTargetAlloy, selectedEquipmentType)
                    : calculateMaterialsNeeded(data, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType);
            setResult(calc);
        }
    }, [data, calculatorMode, selectedAlloy, ingotQuantity, selectedStartAlloy, selectedTargetAlloy, selectedEquipmentType]);

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
                        disabled
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
                        <div className="summary-columns">
                            {/* Matériaux bruts */}
                            <div className="materials-summary">
                                <div className="summary-header">
                                    <h2>Matériaux bruts</h2>
                                    <span className="product-badge">
                                        {calculatorMode === 'ingots' && `⚱️ Lingots x${ingotQuantity} de ${selectedAlloy}`}
                                        {calculatorMode === 'equipment' && `${getItemIcon(selectedEquipmentType)} ${selectedEquipmentType}s`}
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
                            {result.alloysIngots.length > 0 && (
                                <div className="materials-summary alloys-ingots-summary">
                                    <div className="summary-header">
                                        <h2>Lingots à forger</h2>
                                        <span className="product-badge forge-badge">🔥 Par ordre de forge</span>
                                    </div>
                                    <div className="materials-list">
                                        {result.alloysIngots.map((ingot, idx) => (
                                            <div key={idx} className="material-item alloy-ingot-item">
                                                <span className="material-content">
                                                    <span className="forge-step-number">{idx + 1}</span>
                                                    <span className="item-icon">{getItemIcon(ingot.name) ? (
                                                        <img src={getItemIcon(ingot.name)} alt={ingot.name} />
                                                    ) : (
                                                        '📦'
                                                    )}</span>
                                                    <span className="material-name">{ingot.name}</span>
                                                </span>
                                                <span className="material-quantity alloy-quantity">{ingot.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {result.steps.length > 0 && (
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
                                        {result.steps.map((step, idx) => (
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
                                                                <li>
                                                                    {step.equipmentCost.ingot}x lingots
                                                                </li>
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
                                                                    {material.quantity}x {material.name}
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
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
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