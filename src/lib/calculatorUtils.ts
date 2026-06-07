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

function addToMaterialMap(map: Map<string, number>, material: string, quantity: number) {
    const current = map.get(material) || 0;
    map.set(material, current + quantity);
}

function mapToSortedArray(materialMap: Map<string, number>): MaterialRequirement[] {
    return Array.from(materialMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function isAlloyName(data: AlloysData, itemName: string): boolean {
    const alloysObj = data.alloys[0];
    return Boolean(alloysObj?.[itemName]);
}

/**
 * Expand an "item" into its base materials recursively.
 * - If itemName is an alloy: expand its recipe.
 * - If itemName is not an alloy: treat as a base material.
 *
 * Special case: Netherite Ingot / Netherite Rod are terminal base items.
 */
function expandItemToBaseMaterials(
    data: AlloysData,
    itemName: string,
    quantity: number,
    materialMap: Map<string, number>,
    visitStack: Set<string>
) {
    const terminalNetherite = itemName === 'Netherite Ingot' || itemName === 'Netherite Rod' || itemName.startsWith('Netherite ');

    if (quantity <= 0) return;

    if (terminalNetherite || !isAlloyName(data, itemName)) {
        addToMaterialMap(materialMap, itemName, quantity);
        return;
    }

    // Prevent infinite loops if data is inconsistent
    if (visitStack.has(itemName)) {
        addToMaterialMap(materialMap, itemName, quantity);
        return;
    }

    visitStack.add(itemName);
    const recipe = getAlloyRecipe(data, itemName);
    for (const material of recipe) {
        expandItemToBaseMaterials(data, material.name, material.quantity * quantity, materialMap, visitStack);
    }
    visitStack.delete(itemName);
}

// Calculate all materials needed to go from one alloy to another (equipment mode)
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
    const totalMap = new Map<string, number>();
    const equipmentCost = getEquipmentCost(data, equipmentType);

    // For each step alloy from start to target
    for (let i = startIdx; i <= targetIdx; i++) {
        const alloyName = alloysNames[i];

        // If not the starting alloy, we need the previous alloy's equipment
        const stepAlloysCost: MaterialRequirement[] = [];

        if (i > startIdx) {
            const prevAlloyName = alloysNames[i - 1];
            const prevEquipmentItem = `${prevAlloyName} ${equipmentType}`;
            // This is an item that must be crafted => expand it
            expandItemToBaseMaterials(data, prevEquipmentItem, 1, totalMap, new Set());
            stepAlloysCost.push({ name: prevEquipmentItem, quantity: 1 });
        }

        // Base recipe materials for current alloy
        const recipe = getAlloyRecipe(data, alloyName);
        for (const material of recipe) {
            // Material may itself be an alloy => expand into base materials
            expandItemToBaseMaterials(data, material.name, material.quantity, totalMap, new Set());
            stepAlloysCost.push({ name: material.name, quantity: material.quantity });
        }

        // Equipment cost (ingots/rods) needed to craft the previous alloy equipment
        if (i > startIdx) {
            const prevAlloyName = alloysNames[i - 1];

            if (equipmentCost.ingot > 0) {
                const prevIngotItem = `${prevAlloyName} Ingot`;
                expandItemToBaseMaterials(data, prevIngotItem, equipmentCost.ingot, totalMap, new Set());
                stepAlloysCost.push({ name: prevIngotItem, quantity: equipmentCost.ingot });
            }
            if (equipmentCost.rod > 0) {
                const prevRodItem = `${prevAlloyName} Rod`;
                expandItemToBaseMaterials(data, prevRodItem, equipmentCost.rod, totalMap, new Set());
                stepAlloysCost.push({ name: prevRodItem, quantity: equipmentCost.rod });
            }
        } else {
            // Starting alloy: need Netherite materials to build the first equipment layer
            if (equipmentCost.ingot > 0) {
                expandItemToBaseMaterials(data, 'Netherite Ingot', equipmentCost.ingot, totalMap, new Set());
                stepAlloysCost.push({ name: 'Netherite Ingot', quantity: equipmentCost.ingot });
            }
            if (equipmentCost.rod > 0) {
                expandItemToBaseMaterials(data, 'Netherite Rod', equipmentCost.rod, totalMap, new Set());
                stepAlloysCost.push({ name: 'Netherite Rod', quantity: equipmentCost.rod });
            }
        }

        steps.push({
            alloysName: alloyName,
            equipmentType,
            equipmentCost,
            alloysCost: stepAlloysCost,
        });
    }

    return { steps, totalMaterials: mapToSortedArray(totalMap) };
}

/**
 * Backward-compatible: calculate from Netherite equipment to target.
 * Kept for ingots/rods UI.
 */
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

    // For ingots/rods: just calculate the materials without equipment
    if (productType === 'Lingot' || productType === 'Verge') {
        for (let i = 0; i <= targetIdx; i++) {
            const alloyName = alloysNames[i];
            const recipe = getAlloyRecipe(data, alloyName);

            const stepMaterials: MaterialRequirement[] = [];
            for (const material of recipe) {
                expandItemToBaseMaterials(data, material.name, material.quantity, materialMap, new Set());
                stepMaterials.push({ name: material.name, quantity: material.quantity });
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
            const recipe = getAlloyRecipe(data, alloyName);

            const stepMaterials: MaterialRequirement[] = [];
            for (const material of recipe) {
                expandItemToBaseMaterials(data, material.name, material.quantity, materialMap, new Set());
                stepMaterials.push({ name: material.name, quantity: material.quantity });
            }

            if (i === 0) {
                // For the first alloy, we need Netherite equipment
                stepMaterials.push({ name: `Netherite ${productType}`, quantity: 1 });
                addToMaterialMap(materialMap, `Netherite ${productType}`, 1);
            } else {
                const prevAlloyName = alloysNames[i - 1];
                const prevEquipmentItem = `${prevAlloyName} ${productType}`;
                stepMaterials.push({ name: prevEquipmentItem, quantity: 1 });
                expandItemToBaseMaterials(data, prevEquipmentItem, 1, materialMap, new Set());
            }

            steps.push({
                alloysName: alloyName,
                equipmentType: productType,
                equipmentCost,
                alloysCost: stepMaterials,
            });
        }
    }

    return { steps, totalMaterials: mapToSortedArray(materialMap) };
}

