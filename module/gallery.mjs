import {getActiveModuleId, MODULE_ID} from "./constants.mjs"; // Импортируем оба
import {GALLERY_DATA} from "./data.mjs";
import {updateActorData} from "./helpers.mjs";
import {openGalleryConfigDialog} from "./sheet-config.mjs";

const {ApplicationV2, HandlebarsApplicationMixin} = foundry.applications.api;

/**
 * An Application instance that creates an art gallery / enhanced file picker.
 */
export default class GalleryApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options) {
    super(options);
    Object.defineProperty(this, "database", {value: new Map()});
    this.buildDatabase();
  }
  
  // ... (остальной код до get userHasAccess без изменений) ...
    database;
    session = {
        preview: "portrait",
        targetActor: null,
        selected: null
    };
    #dragDrop = this.#createDragDropHandlers();
    #searchFilter = new SearchFilter({
        inputSelector: "input[type=search]",
        contentSelector: "[data-application-part=grid] > .grid",
        callback: this.#onSearch
    });
    static DEFAULT_OPTIONS = {
        id: "character-gallery",
        sheetConfig: true,
        window: {
            icon: "fa-solid fa-palette",
            title: "Character Gallery",
            frame: true,
            resizable: true,
            controls: [{
                label: "CharacterGallery.BUTTON.configureDatasheets",
                icon: "fa-solid fa-wrench",
                action: "openGallerySourceDialog"
            }]
        },
        position: {
            width: 1170,
            height: 720
        },
        actions: {
            collapseGroup: GalleryApplication.#collapseGroup,
            createActor: GalleryApplication.#createActor,
            openGallerySourceDialog: openGalleryConfigDialog,
            replaceArtwork: GalleryApplication.#replaceArtwork,
            resetTags: GalleryApplication.#resetTags,
            selectImage: GalleryApplication.#selectImage,
            togglePreview: GalleryApplication.#togglePreview,
            inspectImage: GalleryApplication.#inspectImage,
            toggleTag: GalleryApplication.#toggleTag
        },
        dragDrop: [{
            dragSelector: "div.preview"
        }]
    };

  get userHasAccess() {
    return game.user.isGM || game.user.hasRole(game.settings.get(getActiveModuleId(), "galleryAccess"));
  }

  get includedTagColor() {
    return game.settings.get(getActiveModuleId(), "activeColor");
  }

  // ======================================= //
  //               Templates                 //
  // ======================================= //

  /** @override */
  static get PARTS() {
    // ❗️ ИСПРАВЛЕНИЕ: Пути к шаблонам всегда используют ID нашего модуля
    return Object.fromEntries(
        ["search", "tags", "grid", "details"].map((k) => [k, {template: `modules/${MODULE_ID}/templates/${k}.hbs`}])
    );
  }

  // ======================================= //
  //               Data prep                 //
  // ======================================= //
  
  buildDatabase() {
    const datasheets = GALLERY_DATA.SOURCES;
    const moduleId = getActiveModuleId(); // Для настроек и флагов используем динамический ID
    // Only load sources that are enabled
    const excludedSheets = game.user.flags[moduleId]?.excludedSheets ?? [];
    const restrictedSheets = game.user.isGM ? [] : game.settings.get(moduleId, "restrictedSheets");
    const enabledSheets = datasheets.filter(
      (s) =>
        !excludedSheets.some((e) => e.moduleId === s.module.id && e.sheetId === s.id) &&
        !restrictedSheets.some((r) => r.moduleId === s.module.id && r.sheetId === s.id)
    );
    // Collapse all entries from enabled sources into a map
    this.database.clear();
    const allData = enabledSheets.flatMap((s) => s.data).sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));
    for (const data of allData) {
      this.database.set(data.key, data);
    }
  }

  // ... (остальной код до #createActor без изменений) ...
    rebuildDatabase() {
        this.buildDatabase();
        return this.render();
    }
    async _prepareContext(_options = {}) {
        const displayData = Array.from(this.database.values()).map((e) => ({ ...e,
            allTags: Object.values(e.tags).flat().filter((t) => !!t)
        }));
        const selectedKey = this.session.selected;
        const selectedEntry = this.database.get(selectedKey);
        return {
            id: this.id,
            preview: this.session.preview,
            targetActor: this.session.targetActor,
            tagGroups: GALLERY_DATA.TAGS.groups,
            sources: GALLERY_DATA.SOURCES,
            displayData,
            resultsCount: displayData.length,
            selected: selectedEntry,
            activeColor: this.includedTagColor
        };
    }
    #createDragDropHandlers() {
        return this.options.dragDrop.map((dragDrop) => {
            dragDrop.callbacks = {
                dragstart: this.#onDragStart.bind(this),
                drop: this.#onDrop.bind(this)
            };
            return new DragDrop(dragDrop);
        });
    }
    _onRender(context, options) {
        super._onRender(context, options);
        for (const dragDrop of this.#dragDrop) {
            dragDrop.bind(this.element);
        }
        if (options.parts.includes("tags")) {
            const sidebar = this.element.querySelector("aside[data-application-part=search]");
            const tags = this.element.querySelector("[data-application-part=tags]");
            sidebar.appendChild(tags);
            const filters = GALLERY_DATA.TAGS.filters;
            for (const button of this.element.querySelectorAll("button.tag")) {
                const key = button.dataset.tag;
                const tag = filters[key] ?? {
                    state: null
                };
                button.classList.toggle("include", tag.state === "include");
                button.classList.toggle("exclude", tag.state === "exclude");
                button.addEventListener("contextmenu", (event) => {
                    GalleryApplication.#toggleTag.call(this, event, event.currentTarget);
                });
            }
        }
        if (options.parts.includes("grid")) {
            this.#searchFilter.bind(this.element);
            this._updateGridDisplay();
        }
    }
    #onSearch(_event, _str, regex, grid) {
        let resultsCount = 0;
        for (const cell of grid.querySelectorAll(":scope > *")) {
            cell.hidden = !regex.test(cell.dataset.label);
            const isVisible = !cell.hidden && !cell.classList.contains("excluded");
            resultsCount += Number(isVisible);
        }
        const countEl = document.body.querySelector("#character-gallery .results > .count");
        countEl.innerText = resultsCount;
    }
    #onDragStart(event) {
        const key = event.currentTarget.dataset.key;
        const data = this.database.get(key);
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
        const actorSheets = document.querySelectorAll("div.window-app.actor");
        const sidebarEntries = document.querySelectorAll("li.directory-item.actor");
        const dropzones = [...actorSheets, ...sidebarEntries];
        dropzones.forEach((element) => {
            this.#dragDrop[0].bind(element);
        });
    }
    async #onDrop(event) {
        const target = event.currentTarget;
        const actor = ["actor", "sheet"].every((c) => target.classList.contains(c)) ? ui.windows[target.dataset.appid] ?.actor : target.classList.contains("directory-item") ? game.actors.get(target.dataset.documentId) : null;
        if (actor) {
            const data = TextEditor.getDragEventData(event);
            updateActorData(actor, data);
        }
    }
    _toggleTagState(key, group, oldState, direction) {
        const newState = (direction === "forward" ? {
            null: "include",
            include: "exclude",
            exclude: null
        } : {
            null: "exclude",
            include: null,
            exclude: "include"
        })[oldState];
        if (newState === null) {
            delete GALLERY_DATA.TAGS.filters[key];
        } else {
            GALLERY_DATA.TAGS.filters[key] = {
                key,
                state: newState,
                group
            };
        }
        const tagEl = this.parts.tags.querySelector(`button[data-group=${group}][data-tag=${key}]`);
        tagEl.classList.toggle("include", newState === "include");
        tagEl.classList.toggle("exclude", newState === "exclude");
        this._updateGridDisplay();
    }
    _updateGridDisplay() {
        const gridEl = this.parts.grid.firstElementChild;
        const filters = Object.values(Object.values(GALLERY_DATA.TAGS.filters).reduce((byGroup, filter) => {
            const group = (byGroup[filter.group] ??= {
                include: [],
                exclude: []
            });
            group[filter.state].push(filter.key);
            return byGroup;
        }, {}));
        const selectedKey = this.session.selected;
        let resultsCount = 0;
        for (const cell of gridEl.children) {
            const tags = cell.dataset.tags.split(",");
            const isIncluded = filters.every((f) => (f.include.length === 0 || tags.some((t) => f.include.includes(t))) && (f.exclude.length === 0 || tags.every((t) => !f.exclude.includes(t))));
            cell.classList.toggle("excluded", !isIncluded);
            cell.classList.toggle("selected", cell.dataset.key === selectedKey);
            const isVisible = !cell.hidden && isIncluded;
            resultsCount += Number(isVisible);
        }
        const countEl = document.body.querySelector("#character-gallery .results > .count");
        countEl.innerText = resultsCount;
    }

  static async #createActor() {
    const selectedKey = this.session.selected;
    const data = this.database.get(selectedKey);
    const nameCollisions = game.actors.filter((a) => a.name.startsWith(data.label)).length;
    const name = nameCollisions > 0 ? `${data.label} (${nameCollisions})` : data.label;
    await getDocumentClass("Actor").create(
      {
        name,
        type: game.settings.get(getActiveModuleId(), "actorType"), // Для настроек используем динамический ID
        img: data.art.portrait,
        prototypeToken: {
          ring: {
            enabled: true,
            subject: {
              texture: data.art.subject,
              scale: data.art.scale ?? 1
            }
          },
          texture: {
            src: data.art.token,
            scaleX: data.art.scale,
            scaleY: data.art.scale
          }
        }
      },
      {renderSheet: true}
    );
  }
  
  // ... (весь остальной код без изменений) ...
    static async #selectImage(_event, target) {
        this.session.selected = target.dataset.key;
        await this.render({
            parts: ["details"]
        });
        this._updateGridDisplay();
    }
    static async #toggleTag(event, button) {
        const {
            tag: key,
            group
        } = button.dataset;
        const filters = GALLERY_DATA.TAGS.filters;
        const tag = filters[key] ?? {
            state: null
        };
        const direction = event.type === "click" ? "forward" : "backward";
        this._toggleTagState(key, group, tag.state, direction);
    }
    static async #resetTags() {
        GALLERY_DATA.TAGS.filters = {};
        await this.render({
            parts: ["tags", "grid"]
        });
    }
    static async #collapseGroup(_event, target) {
        const group = target.dataset.group;
        GALLERY_DATA.TAGS.groups[group].collapsed = !GALLERY_DATA.TAGS.groups[group].collapsed;
        this.render({
            parts: ["tags"]
        });
    }
    static async #replaceArtwork() {
        const selectedKey = this.session.selected;
        const data = this.database.get(selectedKey);
        const targetActor = this.session.targetActor;
        await updateActorData(targetActor, data);
        this.render({
            parts: ["details"]
        });
    }
    static async #togglePreview() {
        this.session.preview = this.session.preview === "portrait" ? "subject" : "portrait";
        CharacterGallery.application.render({
            parts: ["details"]
        });
    }
    static async #inspectImage() {
        const selectedKey = this.session.selected;
        const data = this.database.get(selectedKey);
        const mode = this.session.preview;
        const imagePopout = new ImagePopout(data.art[mode] || data.art.portrait, {
            title: data.label ?? "",
            shareable: true
        });
        imagePopout.render(true);
    }
}