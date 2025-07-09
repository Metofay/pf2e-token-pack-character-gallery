import { getActiveModuleId, MODULE_ID } from "./constants.mjs"; // Импортируем оба

// Класс для нового меню настроек
class CharacterGallerySettingsMenu extends FormApplication {
  static get defaultOptions() {
    // ❗️ ИСПРАВЛЕНИЕ: Путь к шаблону всегда использует ID нашего модуля
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "character-gallery-settings-menu",
      title: game.i18n.localize("CharacterGallery.MenuName"),
      template: `modules/${MODULE_ID}/templates/settings-menu.hbs`,
      width: 600,
      height: "auto",
      classes: ["sheet"],
      tabs: [{ navSelector: ".tabs", contentSelector: "form", initial: "general" }],
      closeOnSubmit: true,
    });
  }
  
  // ... (getData, _updateObject и остальные функции остаются без изменений,
  // так как они правильно используют getActiveModuleId для настроек)
    getData(options) {
        const data = super.getData(options);
        const settings = game.settings.settings;
        const moduleId = getActiveModuleId();
        data.settings = {
            galleryAccess: { ...settings.get(`${moduleId}.galleryAccess`),
                value: game.settings.get(moduleId, "galleryAccess"),
            },
            activeColor: { ...settings.get(`${moduleId}.activeColor`),
                value: game.settings.get(moduleId, "activeColor"),
            },
            headerButton: { ...settings.get(`${moduleId}.headerButton`),
                value: game.settings.get(moduleId, "headerButton"),
            },
        };
        return data;
    }
    async _updateObject(event, formData) {
        const moduleId = getActiveModuleId();
        for (const [key, value] of Object.entries(formData)) {
            await game.settings.set(moduleId, key, value);
        }
        this.render();
    }
}
export function registerSettingsMenu() {
    const moduleId = getActiveModuleId();
    game.settings.registerMenu(moduleId, "settingsMenu", {
        name: game.i18n.localize("CharacterGallery.MenuName"),
        label: game.i18n.localize("CharacterGallery.MenuLabel"),
        hint: game.i18n.localize("CharacterGallery.MenuHint"),
        icon: "fas fa-users-cog",
        type: CharacterGallerySettingsMenu,
        restricted: true
    });
}
export function registerSettings() {
    const moduleId = getActiveModuleId();
    game.settings.register(moduleId, "galleryAccess", {
        name: "CharacterGallery.AccessName",
        hint: "CharacterGallery.AccessHint",
        scope: "world",
        config: false,
        type: Number,
        choices: {
            1: "USER.RolePlayer",
            2: "USER.RoleTrusted",
            3: "USER.RoleAssistant",
            4: "USER.RoleGamemaster"
        },
        default: CONST.USER_ROLES.ASSISTANT
    });
    game.settings.register(moduleId, "activeColor", {
        name: "CharacterGallery.ColorName",
        hint: "CharacterGallery.ColorHint",
        scope: "client",
        config: false,
        type: String,
        choices: {
            red: "CharacterGallery.ColorRed",
            green: "CharacterGallery.ColorGreen",
            blue: "CharacterGallery.ColorBlue"
        },
        default: "red",
        onChange: () => {
            if (window.CharacterGallery ?.application) {
                CharacterGallery.application.render({
                    parts: ["tags", "grid"]
                });
            }
        }
    });
    game.settings.register(moduleId, "headerButton", {
        name: "CharacterGallery.HeaderButtonName",
        hint: "CharacterGallery.HeaderButtonHint",
        scope: "world",
        config: false,
        type: Boolean,
        default: true
    });
    const fields = foundry.data.fields;
    const schemaField = new fields.SchemaField({
        moduleId: new fields.StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: undefined
        }),
        sheetId: new fields.StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: undefined
        })
    }, {
        initial: undefined
    });
    game.settings.register(moduleId, "restrictedSheets", {
        name: "CharacterGallery.DatasheetConfigName",
        hint: "",
        scope: "world",
        config: false,
        type: new fields.ArrayField(schemaField),
        default: [],
        onChange: () => {
            if (!game.user.isGM && window.CharacterGallery ?.application) {
                CharacterGallery.application.rebuildDatabase();
            }
        }
    });
    const actorTypes = (Actor.TYPES.filter((t) => t !== "base").sort());
    const defaultType = actorTypes.find((t) => ["adversary", "npc"].includes(t.toLocaleLowerCase("en"))) ?? actorTypes[0];
    game.settings.register(moduleId, "actorType", {
        name: "CharacterGallery.ActorTypeName",
        hint: "CharacterGallery.ActorTypeHint",
        scope: "world",
        config: !["adversary", "npc"].includes(defaultType.toLocaleLowerCase("en")),
        default: defaultType
    });
}