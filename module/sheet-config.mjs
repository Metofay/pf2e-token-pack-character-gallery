import {getActiveModuleId, MODULE_ID} from "./constants.mjs"; // Импортируем оба
import {GALLERY_DATA} from "./data.mjs";

/**
 * Save world and
 * @param {{element: HTMLElement}} dialog
 */
async function saveSettings(_event, _target, dialog) {
  const element = dialog.element;
  const rows = Array.from(element.querySelectorAll("table[data-sheets] tbody tr"));
  const moduleId = getActiveModuleId();
  const excluded = rows
    .filter((r) => !r.querySelector("input[data-included]").checked)
    .map((row) => {
      const {moduleId, sheetId} = row.dataset;
      return {moduleId, sheetId};
    });

  // Update the user setting and rebuild/rerender if necessary
  const currentFlag = JSON.stringify(game.user.flags[moduleId]?.excludedSheets ?? []);
  await game.user.update({[`flags.${moduleId}.excludedSheets`]: excluded});
  const newFlag = JSON.stringify(game.user.flags[moduleId]?.excludedSheets ?? []);
  if (newFlag !== currentFlag) await CharacterGallery.application.rebuildDatabase();

  if (game.user.isGM) {
    const restricted = rows
      .filter((r) => r.querySelector("input[data-restricted]").checked)
      .map((row) => {
        const {moduleId, sheetId} = row.dataset;
        return {moduleId, sheetId};
      });
    await game.settings.set(moduleId, "restrictedSheets", restricted);
  }
}

/**
 * A function that opens a popout dialog window displaying a list of active sources in the world and allowing them to
 * be individually toggled on and off
 */
async function openGalleryConfigDialog() {
  const application = CharacterGallery.application;
  const moduleId = getActiveModuleId();
  const excludedSheets = game.user.flags[moduleId]?.excludedSheets ?? [];
  const restrictedSheets = game.settings.get(moduleId, "restrictedSheets");
  const data = {
    playersHaveAccess: application.playersHaveAccess,
    user: game.user,
    sheets: Array.from(GALLERY_DATA.SOURCES).map((sheet) => ({
      ...sheet,
      included: !excludedSheets.some((e) => sheet.module.id === e.moduleId && sheet.id === e.sheetId),
      restricted: restrictedSheets.some((r) => sheet.module.id === r.moduleId && sheet.id === r.sheetId)
    }))
  };
  // ❗️ ИСПРАВЛЕНИЕ: Путь к шаблону всегда использует ID нашего модуля
  const content = await renderTemplate(`modules/${MODULE_ID}/templates/sheet-config.hbs`, data);
  return foundry.applications.api.DialogV2.wait({
    id: "character-gallery-sheet-config",
    window: {title: "CharacterGallery.BUTTON.configureDatasheets"},
    position: {width: 800},
    content,
    modal: true,
    buttons: [
      {
        label: game.i18n.localize("CharacterGallery.BUTTON.Cancel"),
        action: "cancel"
      },
      {
        label: game.i18n.localize("CharacterGallery.BUTTON.ResetToDefaults"),
        action: "reset",
        callback: async () => {
          const moduleId = getActiveModuleId();
          await game.user.update({[`flags.${moduleId}.excludedSheets`]: []});
          application.rebuildDatabase();
          if (game.user.isGM) {
            await game.settings.set(moduleId, "restrictedSheets", []);
          }
        }
      },
      {
        label: game.i18n.localize("CharacterGallery.BUTTON.SaveChanges"),
        action: "saveSettings",
        callback: saveSettings
      }
    ]
  });
}

export {openGalleryConfigDialog};