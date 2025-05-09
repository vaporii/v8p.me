// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Statements } from "$lib/types";
import type { Database } from "better-sqlite3";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      filesPath: string;
      stmts: Statements;
      aliasLength: number;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
