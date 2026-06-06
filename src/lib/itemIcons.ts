// Item emoji icons mapping for Minecraft items
export const ITEM_ICONS: Record<string, string> = {
    // Products
    'Lingot': '⚱️',
    'Wooden rod': '🪵',
    
    // Alloys
    'Bronze': '🟠',
    'Hardened steel': '⚙️',
    'Ombralite': '🟣',
    'Titane': '✨',
    'Forged Obsidian': '⬛',
    'Moonarium': '🌙',
    
    // Base materials
    'Copper Ingot': '🟠',
    'Iron Ingot': '⚪',
    'Resin brick': '🟤',
    'Quartz': '⬜',
    'Gold Ingot': '🟡',
    'Emerald': '💚',
    'Diamond': '💎',
    'Obsidian': '⬛',
    'Netherite Ingot': '◼️',
    'Nethe brick': '🔴',
    'Amethyst cluster': '🟣',
    'Ender pearl': '⚫',
    'Nether star': '⭐',
    
    // Equipment bases
    'Netherite Helmet': '◼️',
    'Netherite Chestplate': '◼️',
    'Netherite Leggings': '◼️',
    'Netherite Boots': '◼️',
    'Netherite Sword': '◼️',
    'Netherite Pickaxe': '◼️',
    'Netherite Axe': '◼️',
    'Netherite Shovel': '◼️',
    'Netherite Hoe': '◼️',
    'Netherite Rod': '◼️',
    
    // Bronze equipment
    'Bronze Helmet': '🟠',
    'Bronze Chestplate': '🟠',
    'Bronze Leggings': '🟠',
    'Bronze Boots': '🟠',
    'Bronze Sword': '🟠',
    'Bronze Pickaxe': '🟠',
    'Bronze Axe': '🟠',
    'Bronze Shovel': '🟠',
    'Bronze Hoe': '🟠',
    'Bronze Rod': '🟠',
    
    // Hardened steel equipment
    'Hardened steel Helmet': '⚙️',
    'Hardened steel Chestplate': '⚙️',
    'Hardened steel Leggings': '⚙️',
    'Hardened steel Boots': '⚙️',
    'Hardened steel Sword': '⚙️',
    'Hardened steel Pickaxe': '⚙️',
    'Hardened steel Axe': '⚙️',
    'Hardened steel Shovel': '⚙️',
    'Hardened steel Hoe': '⚙️',
    'Hardened steel Rod': '⚙️',
    
    // Ombralite equipment
    'Ombralite Helmet': '🟣',
    'Ombralite Chestplate': '🟣',
    'Ombralite Leggings': '🟣',
    'Ombralite Boots': '🟣',
    'Ombralite Sword': '🟣',
    'Ombralite Pickaxe': '🟣',
    'Ombralite Axe': '🟣',
    'Ombralite Shovel': '🟣',
    'Ombralite Hoe': '🟣',
    'Ombralite Rod': '🟣',
    
    // Titane equipment
    'Titane Helmet': '✨',
    'Titane Chestplate': '✨',
    'Titane Leggings': '✨',
    'Titane Boots': '✨',
    'Titane Sword': '✨',
    'Titane Pickaxe': '✨',
    'Titane Axe': '✨',
    'Titane Shovel': '✨',
    'Titane Hoe': '✨',
    'Titane Rod': '✨',
    
    // Forged Obsidian equipment
    'Forged Obsidian Helmet': '⬛',
    'Forged Obsidian Chestplate': '⬛',
    'Forged Obsidian Leggings': '⬛',
    'Forged Obsidian Boots': '⬛',
    'Forged Obsidian Sword': '⬛',
    'Forged Obsidian Pickaxe': '⬛',
    'Forged Obsidian Axe': '⬛',
    'Forged Obsidian Shovel': '⬛',
    'Forged Obsidian Hoe': '⬛',
    'Forged Obsidian Rod': '⬛',
    
    // Moonarium equipment
    'Moonarium Helmet': '🌙',
    'Moonarium Chestplate': '🌙',
    'Moonarium Leggings': '🌙',
    'Moonarium Boots': '🌙',
    'Moonarium Sword': '🌙',
    'Moonarium Pickaxe': '🌙',
    'Moonarium Axe': '🌙',
    'Moonarium Shovel': '🌙',
    'Moonarium Hoe': '🌙',
    'Moonarium Rod': '🌙',
};

export function getItemIcon(itemName: string): string {
    return ITEM_ICONS[itemName] || '📦';
}
