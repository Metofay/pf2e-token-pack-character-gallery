import {MODULE_ID, getActiveModuleId} from "./constants.mjs";
import GalleryApplication from "./gallery.mjs";
import {importDatasheets} from "./helpers.mjs";
import {registerSettings, registerSettingsMenu} from "./settings.mjs";

/** @import from "./types.d.mjs"; */

/* -------------------------------------------- */
/* Hooks                                       */
/* -------------------------------------------- */

Hooks.once("init", () => {
  // Сначала регистрируем настройки
  registerSettings();
  // Затем регистрируем кнопку меню для этих настроек
  registerSettingsMenu();

  // Создаем глобальную ссылку на данные модуля для легкого доступа.
  // Здесь мы используем исходный ID, чтобы получить именно наш модуль.
  globalThis.CharacterGallery = game.modules.get(MODULE_ID);
});

Hooks.once("ready", async () => {
  // Initialize the gallery application
  await importDatasheets();
  CharacterGallery.application = new GalleryApplication();
});

Hooks.on("renderActorDirectory", (app) => {
  // Application isn't yet available on initial load
  const minimumRole = game.settings.get(getActiveModuleId(), "galleryAccess");
  if (!game.user.hasRole(minimumRole)) return;
  // Check if button already exists
  if (document.getElementById("characterGalleryButton")) return;
  // Create button
  const button = document.createElement("button");
  button.innerHTML = '<i class="fa-solid fa-palette fa-fw"></i> <span>Character Gallery</span>';
  button.id = "characterGalleryButton"
  button.addEventListener("click", () => {
    CharacterGallery.application.render({force: true});
  });
  const footer = app.element.querySelector("footer.directory-footer");
  footer?.append(button);
});

/** Wait for the actor sheet render hook, add a header button that opens the NPC gallery */
Hooks.on("getActorSheetHeaderButtons", (app, buttons) => {
  if (CharacterGallery.application.userHasAccess && game.settings.get(getActiveModuleId(), "headerButton")) {
    buttons.unshift({
      class: "render-gallery",
      icon: "fa-solid fa-palette",
      label: game.i18n.localize("CharacterGallery.GalleryLabel"),
      onclick: () => {
        const gallery = CharacterGallery.application;
        gallery.session.targetActor = app.actor;
        gallery.render({force: true});
      }
    });
  }
});