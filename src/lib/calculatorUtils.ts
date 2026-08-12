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
    cooler?: string[];
}

export interface EquipmentDefinition {
    ingot: number;
    wood_rod?: number;
    string?: number;
    [material: string]: number | undefined;
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
    equipmentCost: Record<string, number>;

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
    /**
     * Lingots d'alliages disponibles pour déduction.
     * Contient le max déductible pour chaque alliage de la chaîne.
     * Clé = nom alliage, valeur = quantité totale nécessaire (plafond).
     */
    alloysIngotsMax: Record<string, number>;
    /**
     * Full chain from the very first alloy (Bronze) to the target, in progression order.
     * Used by the UI to display owned-ingot inputs for all pre-start alloys too.
     */
    fullChain: string[];
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

    if (startName === null) {
        // Starting from Netherite means include from the first alloy (index 0).
        return sorted.slice(0, targetIdx + 1);
    }

    const startIdx = sorted.indexOf(startName);
    if (startIdx === -1) return [];

    // Return every alloy strictly after the start alloy up to the target inclusive.
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
    equipmentCost: Record<string, number>
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
        equipmentCost,
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
    equipmentType: string | 'Lingot',
    ownedIngots: Record<string, number> = {},
    quantity: number = 1
): CalculationResult {
    const alloys = flattenAlloys(data);
    const combustibles = flattenCombustibles(data);
    const coolers = flattenCoolers(data);
    const equipments = flattenEquipments(data);


    const chain = getProgressionChain(alloys, startName, targetName);
    if (chain.length === 0) return {
        steps: [],
        totalMaterials: [],
        alloysIngots: [],
        alloysIngotsMax: {},
        fullChain: [],
    };

    const isLingot = equipmentType === 'Lingot';
    const equipment = isLingot ? null : (equipments[equipmentType] ?? null);

    // For each step, we need to know how many ingots to produce.
    // The final alloy provides ingots for:
    //   - the equipment (if any)
    //   - nothing else (first alloy in chain uses 1 base set of ingredients)
    // Intermediate alloys are consumed by the next alloy's recipe.
    //
    // We walk the chain in reverse to propagate counts upward.

    // Step 1: determine how many ingots of the TARGET alloy we need.
    let targetIngotCount = quantity;
    if (equipment) {
        targetIngotCount = equipment.ingot * quantity;
    }

    // Step 2: walk chain in reverse et compute ingot counts par step.
    // Pour chaque tier i (sauf le dernier) :
    //   ingotCounts[i] = lingots consommés par la RECETTE de chain[i+1]
    //                  + lingots pour upgrader l'ÉQUIPEMENT à ce tier intermédiaire
    const ingotCounts: number[] = new Array(chain.length).fill(0);
    ingotCounts[chain.length - 1] = targetIngotCount;

    for (let i = chain.length - 2; i >= 0; i--) {
        const nextAlloy = alloys[chain[i + 1]];
        const ingr = getAlloyIngredients(nextAlloy).find((m) => m.name === chain[i]);
        const consumedByRecipe = (ingr ? ingr.quantity : 0) * ingotCounts[i + 1];
        // Only include equipment ingot consumption for tiers when starting from Netherite
        // (startName === null). If the player already starts at a given alloy, they
        // don't need to craft equipment at lower tiers.
        const consumedByEquip = equipment ? equipment.ingot * quantity : 0;
        ingotCounts[i] = consumedByRecipe + consumedByEquip;
    }

    // Step 3: build steps and accumulate total materials.
    const steps: CraftingStep[] = [];
    const totalMap = new Map<string, number>();
    const alloysIngotsMap = new Map<string, number>();

    for (let i = 0; i < chain.length; i++) {
        const alloysName = chain[i];
        const ingotCount = ingotCounts[i];
        const isTarget = i === chain.length - 1;

        // Le coût d'ingots s'applique à TOUS les tiers (chaque upgrade d'équipement).
        // Les matériaux non-ingots (wood_rod, string…) uniquement au tier final.
        const equipmentCostForStep: Record<string, number> = equipment
            ? Object.fromEntries(
                Object.entries(equipment)
                    .filter(([, qty]) => qty && qty > 0)
                    .map(([key, qty]) => [key, (qty ?? 0) * quantity])
            )
            : {};

        // Add an alloy pearl per equipment for alloys above Bronze.
        if (equipment && alloysName !== 'Bronze' && equipmentType !== "Fishing rod") {
            const pearlName = `Perle d'${alloysName}`;
            equipmentCostForStep[pearlName] = ((equipmentCostForStep[pearlName] ?? 0) + quantity)*3;
        }

        const step = buildStep(
            alloys,
            combustibles,
            chain.slice(0, i + 1),
            alloysName,
            ingotCount,
            equipmentCostForStep
        );

        // Remplit les refroidisseurs possibles pour ce step.
        // Si l'alliage définit une liste "cooler", on filtre sur ces noms uniquement.
        const alloyForStep = alloys[step.alloysName];
        const allowedCoolers = alloyForStep?.cooler ?? null;
        step.refroidisseursPossible = Object.entries(coolers)
            .filter(([name]) => allowedCoolers === null || allowedCoolers.includes(name))
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
        // - Alliage dans la chain → produit par une étape précédente, on skip (pas de doublon).
        // - Alliage hors-chain (ex: Bronze quand on part du Hardened Steel) → le joueur doit
        //   le fabriquer aussi : on l'expand récursivement jusqu'aux matériaux de base.
        // - Matériau brut → on l'ajoute directement.
        const alloy = alloys[alloysName];
        const ingredients = getAlloyIngredients(alloy);

        const expandToBase = (name: string, qty: number) => {
            if (alloys[name]) {
                if (chain.includes(name)) {
                    // Produit par la chaîne courante → ne pas doubler.
                    return;
                }
                // Alliage hors-chain → expand récursivement ses ingrédients.
                for (const { name: subName, quantity: subQty } of getAlloyIngredients(alloys[name])) {
                    expandToBase(subName, qty * subQty);
                }
            } else {
                // Matériau brut.
                addMaterial(totalMap, name, qty);
            }
        };

        for (const { name, quantity } of ingredients) {
            expandToBase(name, quantity * ingotCount);
        }

        // Matériaux non-lingots pour l'équipement final uniquement.
        if (isTarget && equipment) {
            for (const [materialName, materialQty] of Object.entries(equipment)) {
                if (materialName === 'ingot' || materialQty === undefined || materialQty <= 0) continue;
                const displayName = materialName === 'wood_rod' ? 'Wood rod' : materialName === 'string' ? 'String' : materialName;
                addMaterial(totalMap, displayName, materialQty * quantity * chain.length);
            }
        }
    }

    // alloysIngotsMax : contient le max déclarable pour chaque alliage dans "Lingots possédés".
    //
    // Pour les alliages DE LA CHAIN (chain active) : on prend directement alloysIngotsMap
    // qui contient les bons comptes (avec consumedByEquip intermédiaires inclus).
    //
    // Pour les alliages HORS-CHAIN (avant startName, ex: Bronze quand on part d'Acier trempé) :
    // ces upgrades d'équipement ont déjà été faits par le joueur — on ne compte que ce que
    // la RECETTE du premier maillon de la chain consomme, sans consumedByEquip.
    const fullChain = getProgressionChain(alloys, null, targetName);
    const alloysIngotsMax: Record<string, number> = {};

    // Alliages de la chain active : valeurs exactes depuis alloysIngotsMap.
    for (const [name, count] of alloysIngotsMap.entries()) {
        alloysIngotsMax[name] = count;
    }

    // Alliages hors-chain : on remonte depuis le premier maillon en ne comptant
    // que ce que les recettes consomment (pas les upgrades déjà effectués).
    const firstChainIdx = fullChain.indexOf(chain[0]);
    for (let i = firstChainIdx - 1; i >= 0; i--) {
        const nextName = fullChain[i + 1];
        const nextCount = alloysIngotsMax[nextName] ?? 0;
        const ingr = getAlloyIngredients(alloys[nextName]).find((m) => m.name === fullChain[i]);
        alloysIngotsMax[fullChain[i]] = (ingr ? ingr.quantity : 0) * nextCount;
    }

    // alloysIngots : quantités à forger dans cette session, avec déduction des possédés.
    // - Mode lingot : tous les alliages de la chain sauf le dernier (celui qu'on fabrique).
    // - Mode équipement : tous les alliages de fullChain sauf le dernier (l'objectif),
    //   pour inclure les alliages hors-chain (ex: Bronze quand on part d'Acier trempé).
    const displayChain = isLingot ? chain.slice(0, -1) : fullChain.slice(0);
    const alloysIngots: Material[] = displayChain.map((name) => {
        const total = alloysIngotsMap.get(name) ?? alloysIngotsMax[name] ?? 0;
        const owned = Math.min(ownedIngots[name] ?? 0, total);
        return { name, quantity: Math.max(0, total - owned) };
    });

    // Soustraire les lingots possédés des matériaux bruts nécessaires.
    // Pour chaque lingot possédé d'un alliage, on retranche les matériaux bruts
    // que ce lingot aurait coûté de la totalMap.
    for (const [alloysName, ownedQty] of Object.entries(ownedIngots)) {
        if (!alloys[alloysName] || ownedQty <= 0) continue;

        // Calculer le coût brut par lingot de cet alliage (expansion récursive).
        const costPerIngot = new Map<string, number>();
        const expandOne = (name: string, qty: number) => {
            if (alloys[name]) {
                for (const { name: sub, quantity: subQty } of getAlloyIngredients(alloys[name])) {
                    expandOne(sub, qty * subQty);
                }
            } else {
                costPerIngot.set(name, (costPerIngot.get(name) ?? 0) + qty);
            }
        };
        expandOne(alloysName, 1);

        // Soustraire (plafonné à 0) pour chaque matériau brut.
        const effectiveOwned = Math.min(ownedQty, alloysIngotsMax[alloysName] ?? 0);
        for (const [matName, costPerUnit] of costPerIngot.entries()) {
            const toDeduct = costPerUnit * effectiveOwned;
            const current = totalMap.get(matName) ?? 0;
            const newVal = Math.max(0, current - toDeduct);
            if (newVal === 0) totalMap.delete(matName);
            else totalMap.set(matName, newVal);
        }
    }

    return {
        steps,
        totalMaterials: mapToList(totalMap).sort((a, b) => b.quantity - a.quantity),
        alloysIngots,
        alloysIngotsMax,
        fullChain,
    };
}

// ─────────────────────────────────────────────────────────────
// Public API: calculateFromNetherite
// Start from Netherite (no prior equipment) → target alloy
// ─────────────────────────────────────────────────────────────

export function calculateFromNetherite(
    data: AlloysData,
    targetAlloy: string,
    equipmentType: string,
    ownedIngots: Record<string, number> = {},
    quantity: number = 1
): CalculationResult {
    return computeResult(data, null, targetAlloy, equipmentType, ownedIngots, quantity);
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
    equipmentType: string,
    ownedIngots: Record<string, number> = {},
    quantity: number = 1
): CalculationResult {
    const startName = startAlloy === 'Netherite' ? null : startAlloy;
    return computeResult(data, startName, targetAlloy, equipmentType, ownedIngots, quantity);
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