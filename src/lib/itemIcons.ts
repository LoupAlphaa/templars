import Copper from '../assets/Copper_Ingot.png'
import Iron from '../assets/Iron_Ingot.png'
import Resin from '../assets/Resin_Brick.png'
import Quartz from '../assets/Nether_Quartz.png'
import Gold from '../assets/Gold_Ingot.png'
import Emerald from '../assets/Emerald.png'
import Obsidian from '../assets/Obsidian.png'
import Diamond from '../assets/Diamond.png'
import Netherite from '../assets/Netherite_Ingot.png'
import Nether_Brick from '../assets/Nether_Brick.png'
import Amethyst from '../assets/Amethyst_Cluster.png'
import Pearl from '../assets/Ender_Pearl.png'
import Star from '../assets/Nether_Star.gif'
import Shard from '../assets/Moonarium.png'

// Item emoji icons mapping for Minecraft items
export const ITEM_ICONS: Record<string, string> = {
    // Products
    'Lingot': '⚱️',
    'Wooden rod': '🪵',
    
    // Alloys
    'Bronze': Copper,
    'Hardened steel': Iron,
    'Ombralite': Nether_Brick,
    'Titane': Diamond,
    'Forged Obsidian': Obsidian,
    'Moonarium': Shard,
    
    // Base materials
    'Copper Ingot': Copper,
    'Iron Ingot': Iron,
    'Resin brick': Resin,
    'Quartz': Quartz,
    'Gold Ingot': Gold,
    'Emerald': Emerald,
    'Diamond': Diamond,
    'Obsidian': Obsidian,
    'Netherite Ingot': Netherite,
    'Netherack brick': Nether_Brick,
    'Amethyst cluster': Amethyst,
    'Ender pearl': Pearl,
    'Nether star': Star,
    
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

export function getItemIcon(itemName: string): string | undefined {
    return ITEM_ICONS[itemName];
}
