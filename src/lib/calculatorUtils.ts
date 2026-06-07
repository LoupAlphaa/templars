import alloysData from '../assets/alloys.json';

// ============================================================
// calculatorUtils.ts
// Utility functions for the Alloy Calculator
// ============================================================

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AlloysData {
    combustibles: Record<string, { temperature: number }>[];
    alloys: Record<string, AlloyDefinition>[];
    cooler: Record<string, { cooling_speed: number }>[];
    equipments: Record<string, EquipmentDefinition>[];
}

export interface AlloyDefinition {
    items: Record<string, number>[];
    temperature: number;
    time: number;
    success_rate: number;
}

export interface EquipmentDefinition {
    ingot: number;
    wood_rod: number;
}

export interface Material {
    name: string;
    quantity: number;
    /** Optionnel: niveau de l’alliage si le matériau correspond à un alliage (pour affichage) */
    // level?: number;
}

// (préparé pour la conversion stacks/64 si besoin)


export interface CraftingStep {
    /** Name of the alloy being crafted at this step */
    alloysName: string;
    /** How many ingots of this alloy are needed for the next step */
    ingotCount: number;
    /** Raw materials needed to forge this alloy (excluding previous-tier ingots) */
    alloysCost: Material[];
    /** Equipment pieces crafted from this alloy */
    equipmentCost: {
        ingot: number;
        rod: number;
    };

    /** Alloy required temperature */
    temperature: number;
    /** Base crafting time (before cooling factor) */
    time: number;
    success_rate: number;

    /** Combustibles compatibles (température >= temperature) */
    combustiblesPossible: { name: string; temperature: number }[];

    /** Refroidisseurs possibles (triés par cooling_speed desc) */
    refroidisseursPossible: { name: string; cooling_speed: number; coolingTime: number }[];

    /** Valeur “choix par défaut” (optionnel): combustible la plus basse qui convient */
    combustible: {
        name: string;
        temperature: number;
    } | null;
}


export interface CalculationResult {
    steps: CraftingStep[];
    /** Raw (non-alloy) materials needed in total */
    totalMaterials: Material[];
    /** Alloy ingots that must be forged at each step, in progression order */
    alloysIngots: Material[];
}

// ─────────────────────────────────────────────────────────────
// Helpers to flatten the nested array-of-objects JSON format
// ─────────────────────────────────────────────────────────────

function flattenAlloys(data: AlloysData): Record<string, AlloyDefinition> {
    return Object.assign({}, ...data.alloys);
}

function flattenCombustibles(data: AlloysData): Record<string, { temperature: number }> {
    return Object.assign({}, ...data.combustibles);
}

function flattenEquipments(data: AlloysData): Record<string, EquipmentDefinition> {
    return Object.assign({}, ...data.equipments);
}

function flattenCoolers(data: AlloysData): Record<string, { cooling_speed: number }> {
    return Object.assign({}, ...data.cooler);
}

// ─────────────────────────────────────────────────────────────
// Public API: loadAlloysData
// ─────────────────────────────────────────────────────────────

/**
 * Loads the alloys JSON data.
 * Adapt the path / fetch URL to match your project structure.
 */
export async function loadAlloysData(): Promise<AlloysData> {
    // alloysData vient de src/assets/alloys.json : la structure est un objet déjà prêt pour le calcul.
    // Le cast explicite ci-dessous évite l’erreur TS sur les types trop différents.
    return alloysData as unknown as AlloysData;
}


// ─────────────────────────────────────────────────────────────
// Public API: getAlloysNames
// Returns the alloy names sorted by level (ascending).
// ─────────────────────────────────────────────────────────────

export function getAlloysNames(data: AlloysData): string[] {
    const alloys = flattenAlloys(data);
    return Object.entries(alloys)
        .map(([name]) => name);
}

// ─────────────────────────────────────────────────────────────
// Internal: find the cheapest combustible that meets a temperature
// ─────────────────────────────────────────────────────────────

function pickCombustible(
    combustibles: Record<string, { temperature: number }>,
    requiredTemp: number
): { name: string; temperature: number } | null {
    const candidates = Object.entries(combustibles)
        .filter(([, c]) => c.temperature >= requiredTemp)
        .sort(([, a], [, b]) => a.temperature - b.temperature);

    if (candidates.length === 0) return null;
    const [name, { temperature }] = candidates[0];
    return { name, temperature };
}

// ─────────────────────────────────────────────────────────────
// Internal: add a quantity to a material list (mutates the map)
// ─────────────────────────────────────────────────────────────

function addMaterial(map: Map<string, number>, name: string, qty: number): void {
    map.set(name, (map.get(name) ?? 0) + qty);
}

function mapToList(map: Map<string, number>): Material[] {
    return Array.from(map.entries()).map(([name, quantity]) => {
        return {
            name,
            quantity,
        };
    });
}


// ─────────────────────────────────────────────────────────────
// Internal: get alloy items as a flat list of { name, quantity }
// ─────────────────────────────────────────────────────────────

function getAlloyIngredients(alloy: AlloyDefinition): Material[] {
    return alloy.items.flatMap((itemRecord) =>
        Object.entries(itemRecord).map(([name, quantity]) => ({ name, quantity }))
    );
}

// ─────────────────────────────────────────────────────────────
// Internal: resolve what alloys are predecessors of a target,
// in progression order (Bronze → Hardened steel → … → target).
// ─────────────────────────────────────────────────────────────

function getProgressionChain(
    alloys: Record<string, AlloyDefinition>,
    startName: string | null, // null means "Netherite" (the very beginning)
    targetName: string
): string[] {
    const sorted = Object.entries(alloys)
        .map(([name]) => name);

    const targetIdx = sorted.indexOf(targetName);
    if (targetIdx === -1) return [];

    const startIdx = startName === null ? -1 : sorted.indexOf(startName);

    // Return every alloy from (startIdx+1) to targetIdx inclusive.
    return sorted.slice(startIdx + 1, targetIdx + 1);
}

// ─────────────────────────────────────────────────────────────
// Internal: for a single alloy step, compute how many raw
// materials of each kind are needed to produce `count` ingots,
// recursively expanding any alloy-ingredient into its own chain.
//
// Returns the flat map of base (non-alloy) materials.
// ─────────────────────────────────────────────────────────────

function expandAlloyCost(
    alloys: Record<string, AlloyDefinition>,
    alloysChain: string[], // the progression up to the current alloy
    alloysName: string,
    count: number,
    totals: Map<string, number>
): void {
    const alloy = alloys[alloysName];
    if (!alloy) return;

    const ingredients = getAlloyIngredients(alloy);

    for (const { name, quantity } of ingredients) {
        const scaledQty = quantity * count;
        if (alloys[name]) {
            // This ingredient is itself an alloy – recurse only if it's in our chain
            expandAlloyCost(alloys, alloysChain, name, scaledQty, totals);
        } else {
            addMaterial(totals, name, scaledQty);
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Internal: build one CraftingStep for a given alloy name,
// given how many ingots of it we need and the equipment cost.
// ─────────────────────────────────────────────────────────────

function buildStep(
    alloys: Record<string, AlloyDefinition>,
    combustibles: Record<string, { temperature: number }>,
    alloysChain: string[],
    alloysName: string,
    ingotCount: number,
    equipmentIngots: number,
    equipmentRods: number
): CraftingStep {
    const alloy = alloys[alloysName];
    const ingredients = getAlloyIngredients(alloy);

    // For the step display we only show direct ingredients (scaled by ingotCount),
    // but we expand alloy-type ingredients into their base materials for totals later.
    const directCost: Material[] = ingredients.map(({ name, quantity }) => ({
        name,
        quantity: quantity * ingotCount,
    }));

    // Raw base materials cost (non-alloy ingredients only, scaled)
    const rawMap = new Map<string, number>();
    for (const { name, quantity } of ingredients) {
        const scaledQty = quantity * ingotCount;
        if (alloys[name]) {
            // An alloy ingredient — expand it recursively into base materials
            expandAlloyCost(alloys, alloysChain, name, scaledQty, rawMap);
        } else {
            addMaterial(rawMap, name, scaledQty);
        }
    }

    const combustible = pickCombustible(combustibles, alloy.temperature);

    const combustiblesPossible = Object.entries(combustibles)
        .filter(([, c]) => c.temperature >= alloy.temperature)
        .map(([name, { temperature }]) => ({ name, temperature }))
        .sort((a, b) => a.temperature - b.temperature);

    return {
        alloysName,
        ingotCount,
        alloysCost: directCost,
        equipmentCost: {
            ingot: equipmentIngots,
            rod: equipmentRods,
        },
        combustible,
        combustiblesPossible,
        refroidisseursPossible: [], // rempli dans computeResult
        temperature: alloy.temperature,
        time: alloy.time,
        success_rate: alloy.success_rate
    };
}

// ─────────────────────────────────────────────────────────────
// Internal: compute full result for a given progression
// ─────────────────────────────────────────────────────────────

function computeResult(
    data: AlloysData,
    startName: string | null,
    targetName: string,
    equipmentType: string | 'Lingot'
): CalculationResult {
    const alloys = flattenAlloys(data);
    const combustibles = flattenCombustibles(data);
    const coolers = flattenCoolers(data);
    const equipments = flattenEquipments(data);


    const chain = getProgressionChain(alloys, startName, targetName);
    if (chain.length === 0) return {
    steps: [],
    totalMaterials: [],
    alloysIngots: []
};

    const isLingot = equipmentType === 'Lingot';
    const equipment = isLingot ? null : (equipments[equipmentType] ?? null);

    // ── Logique de calcul des lingots nécessaires ──────────────
    //
    // Pour upgrader un équipement à chaque palier, le joueur a besoin :
    //   1. De X lingots de l'alliage COURANT pour forger/upgrader l'équipement
    //      (equipmentDef.ingot pour CHAQUE étape intermédiaire, pas seulement la finale)
    //   2. Des lingots d'alliage COURANT consommés par la RECETTE de l'alliage suivant
    //      (ex: Hardened Steel a besoin de 2× Bronze dans sa recette)
    //
    // Donc pour chaque étape i (sauf la dernière) :
    //   ingotCount[i] = equipIngots (pour upgrader à ce tier)
    //                 + (quantité consommée par la recette de chain[i+1]) * ingotCount[i+1]
    //
    // Pour la dernière étape :
    //   ingotCount[last] = equipIngots (pour l'équipement final)

    const equipIngotCount = equipment ? equipment.ingot : 1; // lingots pour 1 équipement

    // On calcule de droite à gauche.
    const ingotCounts: number[] = new Array(chain.length).fill(0);
    ingotCounts[chain.length - 1] = equipIngotCount;

    for (let i = chain.length - 2; i >= 0; i--) {
        const nextAlloyName = chain[i + 1];
        const nextAlloy = alloys[nextAlloyName];
        const ingredients = getAlloyIngredients(nextAlloy);
        // Combien de lingots de chain[i] la recette de chain[i+1] consomme par batch ?
        const ingr = ingredients.find((m) => m.name === chain[i]);
        const consumedByNextRecipe = (ingr ? ingr.quantity : 0) * ingotCounts[i + 1];
        // Lingots nécessaires pour upgrader l'équipement à CE palier intermédiaire
        const consumedByEquipUpgrade = equipment ? equipment.ingot : 0;
        ingotCounts[i] = consumedByNextRecipe + consumedByEquipUpgrade;
    }

    // equipmentCost par étape :
    //   - toutes les étapes (intermédiaires ET finale) consomment equipment.ingot lingots
    //   - seule la dernière consomme les bâtons de bois
    const equipCostPerStep = (isTarget: boolean) => ({
        ingot: equipment ? equipment.ingot : 0,
        rod: isTarget && equipment ? equipment.wood_rod : 0,
    });

    // Step 3: build steps and accumulate total materials.
    const steps: CraftingStep[] = [];
    const totalMap = new Map<string, number>();
    const alloysIngotsMap = new Map<string, number>();

    for (let i = 0; i < chain.length; i++) {
        const alloysName = chain[i];
        const ingotCount = ingotCounts[i];
        const isTarget = i === chain.length - 1;

        const { ingot: equipIngots, rod: equipRods } = equipCostPerStep(isTarget);

        const step = buildStep(
            alloys,
            combustibles,
            chain.slice(0, i + 1),
            alloysName,
            ingotCount,
            equipIngots,
            equipRods
        );

        // Remplit les refroidisseurs possibles pour ce step.
        step.refroidisseursPossible = Object.entries(coolers)
            .map(([name, { cooling_speed }]) => ({
                name,
                cooling_speed,
                coolingTime: step.time * (1 - cooling_speed),
            }))
            .sort((a, b) => b.cooling_speed - a.cooling_speed);

        steps.push(step);


        // Record how many ingots of this alloy must be forged.
        alloysIngotsMap.set(alloysName, ingotCount);

        // Accumulate materials into totalMap.
        // Règle : un ingrédient est "produit par cette chaîne" uniquement s'il est dans chain.
        // Les alliages hors-chain (ex: Bronze quand on part du Bronze) sont des inputs requis.
        const alloy = alloys[alloysName];
        const ingredients = getAlloyIngredients(alloy);

        for (const { name, quantity } of ingredients) {
            const scaledQty = quantity * ingotCount;
            if (alloys[name] && chain.includes(name)) {
                // Produit par une étape précédente de la chaîne — ne pas doubler.
            } else {
                // Matériau brut OU alliage extérieur à la chaîne → input requis.
                addMaterial(totalMap, name, scaledQty);
            }
        }

        // Lingots d'équipement à chaque étape intermédiaire : déjà comptés dans ingotCount
        // (ils sont inclus dans le total des lingots produits à ce tier).
        // Les bâtons de bois pour l'équipement final :
        if (isTarget && equipment && equipment.wood_rod > 0) {
            addMaterial(totalMap, 'Wood rod', equipment.wood_rod);
        }
    }

    // Build alloysIngots list in chain order (lowest tier first → target last)
    const alloysIngots: Material[] = chain.map((name) => ({
        name,
        quantity: alloysIngotsMap.get(name) ?? 0,
    }));

    return {
        steps,
        totalMaterials: mapToList(totalMap).sort((a, b) => b.quantity - a.quantity),
        alloysIngots,
    };
}

// ─────────────────────────────────────────────────────────────
// Public API: calculateFromNetherite
// Start from Netherite (no prior equipment) → target alloy
// ─────────────────────────────────────────────────────────────

export function calculateFromNetherite(
    data: AlloysData,
    targetAlloy: string,
    equipmentType: string
): CalculationResult {
    return computeResult(data, null, targetAlloy, equipmentType);
}

// ─────────────────────────────────────────────────────────────
// Public API: calculateMaterialsNeeded
// Start from a specific alloy (you already have that tier equipment)
// and calculate what you still need to reach the target.
// Also used for lingot-only calculations (pass equipmentType = 'Lingot').
// ─────────────────────────────────────────────────────────────

export function calculateMaterialsNeeded(
    data: AlloysData,
    startAlloy: string,
    targetAlloy: string,
    equipmentType: string
): CalculationResult {
    const startName = startAlloy === 'Netherite' ? null : startAlloy;
    return computeResult(data, startName, targetAlloy, equipmentType);
}

// ─────────────────────────────────────────────────────────────
// Public API: getCombustibles
// Returns all combustibles sorted by temperature ascending.
// ─────────────────────────────────────────────────────────────

export function getCombustibles(data: AlloysData): { name: string; temperature: number }[] {
    return Object.entries(flattenCombustibles(data))
        .map(([name, { temperature }]) => ({ name, temperature }))
        .sort((a, b) => a.temperature - b.temperature);
}

// ─────────────────────────────────────────────────────────────
// Public API: getCoolers
// Returns all coolers sorted by cooling_speed descending.
// ─────────────────────────────────────────────────────────────

export function getCoolers(data: AlloysData): { name: string; cooling_speed: number }[] {
    return Object.entries(flattenCoolers(data))
        .map(([name, { cooling_speed }]) => ({ name, cooling_speed }))
        .sort((a, b) => b.cooling_speed - a.cooling_speed);
}