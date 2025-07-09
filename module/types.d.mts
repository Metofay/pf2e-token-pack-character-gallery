import type {GALLERY_DATA} from "./data.mjs";

declare global {
  namespace globalThis {
    var CONST: {
      USER_ROLE_NAMES: Record<string, string>;
      USER_ROLES: Record<number, string>;
    };

    /** This `Module` with additional properties attached */
    var CharacterGallery: {
      /** Artwork data for the `GalleryApplication` */
      DATA: typeof GALLERY_DATA;
      /** The application singleton */
      application: GalleryApplication;
    };

    class ImagePopout {
      constructor(src: string, options?: Record<string, unknown>);
    }

    var game: {
      modules: Map<string, object>;
      user: {
        hasRole(role: string): boolean;
        isGM: boolean;
      };
    };
  }

  interface CharacterArtData {
    label: string;
    key: string;
    source: string;
    art: {
      portrait: string;
      thumb: string;
      token: string;
      subject: string;
    };
    tags: {
      ancestry: string[];
      category: string[];
      equipment: string[];
      family: string[];
    };
  }

  interface GalleryApplication {
    id: string;
    element: HTMLElement;
  }
}
