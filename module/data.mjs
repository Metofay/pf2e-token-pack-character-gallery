/** Arrays of tags, separated out into subcategories; they will be combined below */
const equipment = {
  held: [
    "focus",
    "scroll",
    "tome"
  ],
  weapons: [
    "axe",
    "bludgeon",
    "boat",
    "bomb",
    "bow",
    "brawler",
    "brawling",
    "crossbow",
    "dagger",
    "dart",
    "firearm",
    "flail",
    "hammer",
    "knife",
    "light-source",
    "pick",
    "polearm",
    "shield",
    "sling",
    "starknife",
    "sword"
  ],
  armor: [
    "unarmored",
    "clothing",
    "light",
    "medium",
    "heavy"
  ]
};
const ancestries = {
  common: [
    "boggard",
    "brownie",
    "bugbear",
    "centaur",
    "dero",
    "dwarf",
    "elf",
    "giant",
    "gnome",
    "goblin",
    "halfling",
    "harpy",
    "human",
    "jinkin",
    "leshy",
    "morlock",
    "ogre",
    "orc",
    "wight",
    "zombie"
  ],
  uncommon: [
    "adlet",
    "amurrun",
    "aphorite",
    "azarketi",
    "caligni",
    "cecaelia",
    "duskwalker",
    "fetchling",
    "ganzi",
    "hobgoblin",
    "iruxi",
    "kholo",
    "kitsune",
    "kobold",
    "locathah",
    "merfolk",
    "nagaji",
    "oread",
    "samsaran",
    "sea-devil",
    "shabti",
    "sinspawn",
    "skulk",
    "spriggan",
    "suli",
    "sylph",
    "tengu",
    "tripkee",
    "triton",
    "umasi",
    "undine",
    "vanara",
    "wayang",
    "xulgath",
    "ysoki"
  ],
  rare: [
    "aghollthu",
    "anadi",
    "android",
    "arboreal",
    "athamaru",
    "automaton",
    "cambion",
    "conrasu",
    "dragon",
    "empyrean",
    "fleshwarp",
    "ghoran",
    "goloma",
    "graveknight",
    "gug",
    "jorogumo",
    "kashrishi",
    "lamia",
    "lich",
    "medusa",
    "minotaur",
    "mortic",
    "munavri",
    "myceloid",
    "naari",
    "oni",
    "poppet",
    "redcap",
    "rukh",
    "sekmin",
    "shisk",
    "shoony",
    "skeleton",
    "skelm",
    "sprite",
    "stheno",
    "strix",
    "succubus",
    "swarf",
    "tanuki",
    "urdefhan",
    "velstrac",
    "vishkanya",
    "witchwyrd"
  ],
  versatile: [
    "aiuvarin",
    "beastkin",
    "changeling",
    "dhampir",
    "dromaar",
    "geniekin",
    "ghost",
    "ghoul",
    "mummy",
    "nephilim",
    "vampire"
  ]
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
        "primal",
        "arcane",
        "occult",
        "aberrant",
        "aeon",
        "aesir",
        "agathion",
        "air",
        "amphibian",
        "angel",
        "aquatic",
        "archon",
        "astral",
        "avian",
        "azata",
        "bestial",
        "construct",
        "constructed",
        "daemon",
        "darklands",
        "demon",
        "devil",
        "divine",
        "draconic",
        "dragons",
        "drakes",
        "dream",
        "earth",
        "eldritch",
        "elemental",
        "energy",
        "fey",
        "fiendish",
        "fire",
        "fungal",
        "fungus",
        "genie",
        "giant",
        "golem",
        "gremlin",
        "hag",
        "humanoid",
        "hybrid",
        "invertebrate",
        "kami",
        "linnorms",
        "magical",
        "mammalian",
        "mechanical",
        "monitor",
        "monstrous",
        "mythological",
        "nymph",
        "ooze",
        "petitioner",
        "planar",
        "plant",
        "protean",
        "psychopomp",
        "reptilian",
        "shadow",
        "time",
        "troll",
        "undead",
        "water",
        "werecreature"
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
            tags: [...ancestries.common, "indistinct"]
          },
          uncommon: {
            key: "uncommon",
            tags: ancestries.uncommon
          },
          rare: {
            key: "rare",
            tags: ancestries.rare
          },
          versatile: {
            key: "versatile",
            tags: ancestries.versatile
          }
        },
        collapsed: true
      },
      equipment: {
        key: "equipment",
        tags: [...equipment.weapons, ...equipment.held, ...equipment.armor],
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
        tags: [
          "alchemy",
          "companion",
          "dual-wielding",
          "magic",
          "music",
          "nature",
          "prosthetic",
          "tech",
          "two-handed",
          "winged"
        ],
        collapsed: true
      },
      family: {
        key: "family",
        tags: [
          "affluent",
          "artisan",
          "civilian",
          "courtier",
          "criminal",
          "devotee",
          "downtrodden",
          "explorer",
          "forester",
          "healer",
          "laborer",
          "magistrate",
          "mercenary",
          "mystic",
          "officer",
          "outcast",
          "performer",
          "publican",
          "sage",
          "scholar",
          "seafarer",
          "tradeperson",
          "tradesperson",
          "villain",
          "warrior",
          "worker"
        ],
        collapsed: true
      },
      special: {
        key: "special",
        tags: [
          "bust",
          "deity",
          "iconic",
          "mount",
          "swarm",
          "troop",
          "unique"
        ],
        collapsed: true
      }
    },
    // Each filter is an object with a key (string), a group (string), and a state (0-2)
    // We default the "humanoid" filter to on (it's a character gallery after all)
    filters: {}
  }
};

/**
 * Sorts the tag arrays within GALLERY_DATA.
 * This function should be called after game.i18n is initialized (e.g., in Hooks.once("ready")).
 * @param {object} data The GALLERY_DATA object.
 */
function initializeGalleryDataTags(data) {
    const sortFn = (a, b) => game.i18n.localize(`CharacterGallery.TAGS.${a}`).localeCompare(game.i18n.localize(`CharacterGallery.TAGS.${b}`), game.i18n.lang);

    // Sort top-level tag arrays
    data.TAGS.groups.category.tags.sort(sortFn);
    data.TAGS.groups.ancestry.tags.sort(sortFn);
    data.TAGS.groups.equipment.tags.sort(sortFn);
    data.TAGS.groups.features.tags.sort(sortFn);
    data.TAGS.groups.family.tags.sort(sortFn);
    data.TAGS.groups.special.tags.sort(sortFn);

    // Sort nested ancestry tag arrays
    data.TAGS.groups.ancestry.groups.common.tags.sort(sortFn);
    data.TAGS.groups.ancestry.groups.uncommon.tags.sort(sortFn);
    data.TAGS.groups.ancestry.groups.rare.tags.sort(sortFn);
    data.TAGS.groups.ancestry.groups.versatile.tags.sort(sortFn);

    // Sort nested equipment tag arrays
    data.TAGS.groups.equipment.groups.held.tags.sort(sortFn);
    data.TAGS.groups.equipment.groups.worn.tags.sort(sortFn);
}

export {GALLERY_DATA, initializeGalleryDataTags};