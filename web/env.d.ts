/* Ambient types for the one build-time variable this site reads.

   Deliberately *not* `/// <reference types="vite/client" />`. tsconfig.web.json
   sets `"types": []` on purpose — nothing ambient unless it is asked for — and
   pulling in the full Vite client types to reach a single string would also
   bring in every asset-module declaration (`*.svg`, `*.css?inline`, …) that
   this codebase does not use and would rather keep un-typed than
   accidentally-valid.

   Declaring only what is used means an unset or misspelled variable is a type
   error rather than `any`. */

interface ImportMetaEnv {
  /**
   * The production origin, no trailing slash — see web/content/site.ts.
   * Optional because it is genuinely unset in development, and the code that
   * reads it is written to cope with that rather than assume it.
   */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ViewTransition {
  readonly ready: Promise<void>;
  readonly finished: Promise<void>;
  readonly updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition?(updateCallback?: () => Promise<void> | void): ViewTransition;
}

interface KeyframeAnimationOptions {
  pseudoElement?: string;
}

