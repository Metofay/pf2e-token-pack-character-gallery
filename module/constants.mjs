export const MODULE_ID = "pf2e-token-pack-character-gallery";
export const TAKEOVER_ID = "pf2e-token-pack";

/**
 * Определяет, какой ID модуля использовать.
 * Если модуль 'pf2e-token-pack' активен, используется его ID.
 * В противном случае используется ID этого модуля.
 * @returns {string} Активный ID модуля.
 */
export function getActiveModuleId() {
    return game.modules.get(TAKEOVER_ID)?.active ? TAKEOVER_ID : MODULE_ID;
}
