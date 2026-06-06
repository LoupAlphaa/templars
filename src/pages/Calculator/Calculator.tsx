import { useState, useEffect } from 'react';
import {
    loadAlloysData,
    getAlloysNames,
    calculateFromNetherite,
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
            // For ingots: get recipe for the selected alloy and multiply by quantity
            const recipe = Array.isArray(data.alloys[0][selectedAlloy]?.items)
                ? data.alloys[0][selectedAlloy].items[0]
                : {};
            
            const materialMap = new Map<string, number>();
            
            Object.entries(recipe).forEach(([item, qty]) => {
                const quantity = (qty as number) * ingotQuantity;
                materialMap.set(item, (materialMap.get(item) || 0) + quantity);
            });

            const totalMaterials = Array.from(materialMap.entries())
                .map(([name, quantity]) => ({
                    name,
                    quantity,
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setResult({
                steps: [],
                totalMaterials,
            });
        } else {
            // For equipment
            if (selectedStartAlloy === 'Netherite') {
                const calc = calculateFromNetherite(data, selectedTargetAlloy, selectedEquipmentType);
                setResult(calc);
            }
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
                                onChange={(e) => setSelectedStartAlloy(e.target.value)}
                            >
                                <option value="Netherite">Netherite</option>
                                {alloysNames.map((alloy) => (
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
                                {alloysNames.map((alloy) => (
                                    <option key={alloy} value={alloy}>
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
                        <div className="materials-summary">
                            <div className="summary-header">
                                <h2>Résumé des matériaux</h2>
                                <span className="product-badge">
                                    {calculatorMode === 'ingots' && `⚱️ Lingots x${ingotQuantity} de ${selectedAlloy}`}
                                    {calculatorMode === 'equipment' && `${getItemIcon(selectedEquipmentType)} ${selectedEquipmentType}s`}
                                </span>
                            </div>
                            <div className="materials-list">
                                {result.totalMaterials.map((material, idx) => (
                                    <div key={idx} className="material-item">
                                        <span className="material-content">
                                            <span className="item-icon">{getItemIcon(material.name)}</span>
                                            <span className="material-name">{material.name}</span>
                                        </span>
                                        <span className="material-quantity">{material.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {calculatorMode === 'equipment' && result.steps.length > 0 && (
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
                                                                    <span className="item-icon">{getItemIcon(material.name)}</span>
                                                                    {material.quantity}x {material.name}
                                                                </li>
                                                            ))}
                                                        </ul>
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
