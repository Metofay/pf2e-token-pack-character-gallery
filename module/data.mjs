/** Arrays of tags, separated out into subcategories; they will be combined below */
const equipment = {
  held: ["tome", "scroll", "focus"],
  weapons: [
    "axe",
    "bludgeon",
    "bomb",
    "bow",
    "brawling",
    "crossbow",
    "dart",
    "firearm",
    "flail",
    "knife",
    "pick",
    "polearm",
    "shield",
    "sling",
    "sword"
  ],
  armor: ["unarmored", "clothing", "light", "medium", "heavy"]
};
const ancestries = {
  common: ["dwarf", "elf", "gnome", "goblin", "halfling", "human", "leshy", "orc"],
  uncommon: [
    "azarketi",
    "amurrun",
    "fetchling",
    "kholo",
    "hobgoblin",
    "kitsune",
    "kobold",
    "iruxi",
    "nagaji",
    "tripkee",
    "ysoki",
    "tengu",
    "vanara"
  ],
  rare: [
    "anadi",
    "android",
    "automaton",
    "conrasu",
    "fleshwarp",
    "ghoran",
    "goloma",
    "kashrishi",
    "poppet",
    "shisk",
    "shoony",
    "skeleton",
    "sprite",
    "strix",
    "vishkanya"
  ],
  versatile: ["aiuvarin", "dromaar", "changeling", "dhampir", "geniekin", "nephilim", "beastkin"]
};

/** Data to be provided to the application by this module */
const GALLERY_DATA = {
  // The array to which datasheets will be pushed by the importDatasheets() function
  SOURCES: [],
  /**
   * The tags & tag groups that are displayed in the application's "filters" panel
   * They can then be used as toggles to filter the entries that will be displayed in the gallery
   * Datasheets can still tag entries with tags not on that list, but those will only be displayed in the selection's
   * showcase panel and won't appear in the  filters list
   */
  TAGS: {
    groups: {
      category: {
        key: "category", // Type? Group? Family? Classification? Trait? Category?
        tags: [
          "humanoid",
          "aberrant",
          "aquatic",
          "bestial",
          "constructed",
          "divine",
          "draconic",
          "elemental",
          "fey",
          "fiendish",
          "fungal",
          "monitor",
          "planar",
          "plant",
          "undead"
        ],
        collapsed: true
      },
      // Some groups (including Ancestry) are special for having sub-groups that are listed separately from each other
      // in the app, but we still include the whole array as well
      ancestry: {
        key: "ancestry",
        tags: [...ancestries.common, ...ancestries.uncommon, ...ancestries.rare, ...ancestries.versatile, "indistinct"],
        groups: {
          common: {
            key: "common",
            tags: [...ancestries.common.sort(), "indistinct"]
          },
          uncommon: {
            key: "uncommon",
            tags: ancestries.uncommon.sort()
          },
          rare: {
            key: "rare",
            tags: ancestries.rare.sort()
          },
          versatile: {
            key: "versatile",
            tags: ancestries.versatile.sort()
          }
        },
        collapsed: true
      },
      equipment: {
        key: "equipment",
        tags: [...equipment.weapons, ...equipment.held, ...equipment.armor].sort(),
        groups: {
          held: {
            key: "held",
            tags: [...equipment.weapons, ...equipment.held]
          },
          worn: {
            key: "worn",
            tags: equipment.armor
          }
        },
        collapsed: true
      },
      features: {
        key: "features",
        tags: ["magic", "music", "alchemy", "companion", "dual-wielding", "prosthetic", "nature", "tech", "winged"],
        collapsed: true
      },
      family: {
        key: "family",
        tags: ["civilian", "warrior", "sage", "seafarer", "officer", "outcast", "worker", "artisan", "affluent"],
        collapsed: true
      },
      special: {
        key: "special",
        tags: ["bust", "unique", "iconic", "deity"],
        collapsed: true
      }
    },
    // Each filter is an object with a key (string), a group (string), and a state (0-2)
    // We default the "humanoid" filter to on (it's a character gallery after all)
    filters: {}
  }
};

export {GALLERY_DATA};
