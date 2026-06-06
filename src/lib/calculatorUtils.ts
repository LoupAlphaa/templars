// Types for calculator
export interface AlloysData {
    combustibles: any[];
    alloys: any[];
    cooler: any[];
    equipments: any[];
}

export interface MaterialRequirement {
    name: string;
    quantity: number;
}

export interface CalculationResult {
    steps: AlloysStep[];
    totalMaterials: MaterialRequirement[];
}

export interface AlloysStep {
    alloysName: string;
    equipmentType: string;
    equipmentCost: EquipmentCost;
    alloysCost: MaterialRequirement[];
}

export interface EquipmentCost {
    ingot: number;
    rod: number;
}

// Load alloys data
export async function loadAlloysData(): Promise<AlloysData> {
    const response = await fetch('/alloys.json');
    return response.json();
}

// Get all alloy names in order
export function getAlloysNames(data: AlloysData): string[] {
    const alloysObj = data.alloys[0];
    return Object.keys(alloysObj).sort((a, b) => {
        const levelA = alloysObj[a].level || 0;
        const levelB = alloysObj[b].level || 0;
        return levelA - levelB;
    });
}

// Get all equipment types
export function getEquipmentTypes(): string[] {
    return ['Helmet', 'Chestplate', 'Leggings', 'Boots', 'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe'];
}

// Get all product types (equipment + ingots)
export function getProductTypes(): string[] {
    return ['Lingot', 'Verge', 'Helmet', 'Chestplate', 'Leggings', 'Boots', 'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe'];
}

// Get alloy recipe items (raw materials)
export function getAlloyRecipe(data: AlloysData, alloyName: string): MaterialRequirement[] {
    const alloysObj = data.alloys[0];
    const alloy = alloysObj[alloyName];

    if (!alloy || !alloy.items || alloy.items.length === 0) {
        return [];
    }

    const items = alloy.items[0];
    return Object.entries(items).map(([name, quantity]) => ({
        name,
        quantity: quantity as number,
    }));
}

// Get equipment cost
export function getEquipmentCost(data: AlloysData, equipmentType: string): EquipmentCost {
    const equipmentsObj = data.equipments[0];
    return equipmentsObj[equipmentType] || { ingot: 0, rod: 0 };
}

// Calculate all materials needed to go from one alloy to another
export function calculateMaterialsNeeded(
    data: AlloysData,
    startAlloy: string,
    targetAlloy: string,
    equipmentType: string
): CalculationResult {
    const alloysNames = getAlloysNames(data);
    const startIdx = alloysNames.indexOf(startAlloy);
    const targetIdx = alloysNames.indexOf(targetAlloy);

    if (startIdx === -1 || targetIdx === -1 || startIdx >= targetIdx) {
        return { steps: [], totalMaterials: [] };
    }

    const steps: AlloysStep[] = [];
    const materialMap = new Map<string, number>();

    // For each alloy from start to target
    for (let i = startIdx; i <= targetIdx; i++) {
        const alloyName = alloysNames[i];
        const equipmentCost = getEquipmentCost(data, equipmentType);

        // If not the starting alloy, we need the previous alloy's equipment
        if (i > startIdx) {
            const prevAlloyName = alloysNames[i - 1];
            addToMaterialMap(materialMap, `${prevAlloyName} ${equipmentType}`, 1);
        }

        // Get the recipe for this alloy
        const recipe = getAlloyRecipe(data, alloyName);

        const stepMaterials: MaterialRequirement[] = [];

        // For each material in the recipe
        for (const material of recipe) {
            const quantity = material.quantity;
            addToMaterialMap(materialMap, material.name, quantity);
            stepMaterials.push({
                name: material.name,
                quantity,
            });
        }

        // Add equipment cost (ingots and rods of the previous alloy)
        if (i > startIdx) {
            const prevAlloyName = alloysNames[i - 1];
            if (equipmentCost.ingot > 0) {
                addToMaterialMap(materialMap, `${prevAlloyName} Ingot`, equipmentCost.ingot);
                stepMaterials.push({
                    name: `${prevAlloyName} Ingot`,
                    quantity: equipmentCost.ingot,
                });
            }
            if (equipmentCost.rod > 0) {
                addToMaterialMap(materialMap, `${prevAlloyName} Rod`, equipmentCost.rod);
                stepMaterials.push({
                    name: `${prevAlloyName} Rod`,
                    quantity: equipmentCost.rod,
                });
            }
        } else {
            // For the starting alloy, we need Netherite
            if (equipmentCost.ingot > 0) {
                addToMaterialMap(materialMap, 'Netherite Ingot', equipmentCost.ingot);
                stepMaterials.push({
                    name: 'Netherite Ingot',
                    quantity: equipmentCost.ingot,
                });
            }
            if (equipmentCost.rod > 0) {
                addToMaterialMap(materialMap, 'Netherite Rod', equipmentCost.rod);
                stepMaterials.push({
                    name: 'Netherite Rod',
                    quantity: equipmentCost.rod,
                });
            }
        }

        steps.push({
            alloysName: alloyName,
            equipmentType,
            equipmentCost,
            alloysCost: stepMaterials,
        });
    }

    // Convert material map to array
    const totalMaterials = Array.from(materialMap.entries())
        .map(([name, quantity]) => ({
            name,
            quantity,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { steps, totalMaterials };
}

function addToMaterialMap(map: Map<string, number>, material: string, quantity: number) {
    const current = map.get(material) || 0;
    map.set(material, current + quantity);
}

// Special case: calculate from Netherite equipment to target
export function calculateFromNetherite(
    data: AlloysData,
    targetAlloy: string,
    productType: string
): CalculationResult {
    const alloysNames = getAlloysNames(data);
    const targetIdx = alloysNames.indexOf(targetAlloy);

    if (targetIdx === -1) {
        return { steps: [], totalMaterials: [] };
    }

    const steps: AlloysStep[] = [];
    const materialMap = new Map<string, number>();

    // For ingots/rods, just calculate the materials without equipment
    if (productType === 'Lingot' || productType === 'Verge') {
        for (let i = 0; i <= targetIdx; i++) {
            const alloyName = alloysNames[i];

            // Get the recipe for this alloy
            const recipe = getAlloyRecipe(data, alloyName);

            const stepMaterials: MaterialRequirement[] = [];

            // For each material in the recipe
            for (const material of recipe) {
                const quantity = material.quantity;
                addToMaterialMap(materialMap, material.name, quantity);
                stepMaterials.push({
                    name: material.name,
                    quantity,
                });
            }

            steps.push({
                alloysName: alloyName,
                equipmentType: productType,
                equipmentCost: { ingot: 0, rod: 0 },
                alloysCost: stepMaterials,
            });
        }
    } else {
        // For equipment, include equipment costs
        const equipmentCost = getEquipmentCost(data, productType);

        for (let i = 0; i <= targetIdx; i++) {
            const alloyName = alloysNames[i];

            // Get the recipe for this alloy
            const recipe = getAlloyRecipe(data, alloyName);

            const stepMaterials: MaterialRequirement[] = [];

            // For each material in the recipe
            for (const material of recipe) {
                const quantity = material.quantity;
                addToMaterialMap(materialMap, material.name, quantity);
                stepMaterials.push({
                    name: material.name,
                    quantity,
                });
            }

            // Add equipment cost (in terms of the previous equipment, not ingots)
            if (i === 0) {
                // For the first alloy, we need Netherite equipment
                stepMaterials.push({
                    name: `Netherite ${productType}`,
                    quantity: 1,
                });
                addToMaterialMap(materialMap, `Netherite ${productType}`, 1);
            } else {
                // For other alloys, we need the previous alloy's equipment
                const prevAlloyName = alloysNames[i - 1];
                stepMaterials.push({
                    name: `${prevAlloyName} ${productType}`,
                    quantity: 1,
                });
                addToMaterialMap(materialMap, `${prevAlloyName} ${productType}`, 1);
            }

            steps.push({
                alloysName: alloyName,
                equipmentType: productType,
                equipmentCost,
                alloysCost: stepMaterials,
            });
        }
    }

    // Convert material map to array
    const totalMaterials = Array.from(materialMap.entries())
        .map(([name, quantity]) => ({
            name,
            quantity,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { steps, totalMaterials };
}
