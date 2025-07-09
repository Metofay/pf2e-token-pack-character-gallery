import {GALLERY_DATA} from "./data.mjs";

/**
 * Function that updates an actor with the data from a given entry
 * @type {method}
 * @param {object} actor An actor document
 * @param {object} data A single entry from the database
 */
async function updateActorData(actor, data) {
  const art = data.art;

  // Create a confirmation popup before overwriting the image
const userPrompt = foundry.applications.api.DialogV2.confirm({
  id: "character-gallery-confirmation",
  window: {
    title: game.i18n.localize("CharacterGallery.ReplaceArtworkTitle"),
    width: 400
  },
  content: `
    <section>
      <p>${game.i18n.format("CharacterGallery.ChangeImagePrompt1", { actorName: actor.name })}</p>
      <p>${game.i18n.localize("CharacterGallery.ChangeImagePrompt2")}</p>
    <section>
    <section class="flexrow">
      <figure>
        <img width="160" alt="${game.i18n.localize("CharacterGallery.CurrentPortrait")}" src="${actor.img}">
        <figcaption>${game.i18n.localize("CharacterGallery.CurrentPortrait")}</figcaption>
      </figure>
      <img class="arrow" width="32" alt="${game.i18n.localize("CharacterGallery.ArrowAlt")}" src="icons/svg/upgrade.svg">
      <figure>
        <img width="160" alt="${game.i18n.localize("CharacterGallery.NewPortrait")}" src="${art.portrait}">
        <figcaption>${game.i18n.localize("CharacterGallery.NewPortrait")}</figcaption>
      </figure>
    </section>
  `,
  modal: true
});

  if ((await userPrompt) === false) {
    return;
  }

  // Apply the new settings to the actor
  const flags = game.system.id === "pf2e" ? {pf2e: {autoscale: false}} : {};
  const tokenUpdates = {
    ring: {
      enabled: true,
      subject: {
        texture: art.subject,
        scale: art.scale ?? 1
      }
    },
    texture: {
      src: art.token,
      scaleX: art.scale ?? 1,
      scaleY: art.scale ?? 1
    },
    lockRotation: true, // Doesn't seem to actually work and I'm not sure why, but this can also be set by the user in the prototype overrides
    flags
  };
  await actor.update({
    img: art.portrait,
    prototypeToken: tokenUpdates
  });
  for (const token of actor.getActiveTokens(true, true)) {
    await token.update(tokenUpdates);
  }
  ui.notifications.info(game.i18n.format("CharacterGallery.NotifyNewArtAssigned", {actor: actor.name}));
  CharacterGallery.application.render({parts: ["details"]});
}

/** Load datasheets, including those added by other modules. */
async function importDatasheets() {
  const database =
    /** @type {{id: string, label: string, hint: string, module: {id: string, title: string}, data: Promise<unknown>}[]} */ ([]);
  // Loop through active modules
  for (const module of game.modules.filter((m) => m.active)) {
    const sheetRefs = module.flags.galleryDatasheets ?? {};
    for (const [id, {sheet: path, label = module.title, hint}] of Object.entries(sheetRefs)) {
      const datasheet = foundry.utils.fetchJsonWithTimeout(path);
      // Push datasheet & its metadata to the database
      database.push({id, label, hint, module: {id: module.id, title: module.title}, data: datasheet});
    }
  }
  // Add successfully loaded sheets and notify about failed ones
  await Promise.allSettled(database.map((p) => p.data));
  for (const promise of database) {
    const {id, label, hint, module} = promise;
    promise.data
      .then((data) => {
        if (Array.isArray(data) && data.every((d) => d instanceof Object && d.art instanceof Object)) {
          GALLERY_DATA.SOURCES.push({id, label, hint, module, data});
        } else {
          console.error(game.i18n.format("CharacterGallery.ErrorMalformedData", { datasheetId: id, moduleId: promise.module.id }));
        }
      })
      .catch(() => {
        console.error(game.i18n.format("CharacterGallery.ErrorFailedToLoad", { datasheetId: id, moduleId: promise.module.id }));
      });
  }
}

export {importDatasheets, updateActorData};
