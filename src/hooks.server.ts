import type { Handle, ServerInit } from "@sveltejs/kit";

import cron from "node-cron";
import env from "dotenv";
import { statements } from "$lib/server/database";
import { runBackgroundTasks } from "$lib/server";
env.config();

// delete expired files and run tasks every minute
cron.schedule(
  "* * * * *",
  async () => {
    await runBackgroundTasks(statements);
  },
  { runOnInit: true }
);

export const handle: Handle = async ({ event, resolve }) => {
  if (!event.locals.filesPath) {
    if (!process.env.FILES_DIR) {
      throw new Error("FILES_DIR environment variable not defined");
    }
    event.locals.filesPath = process.env.FILES_DIR;
  }

  if (!event.locals.aliasLength) {
    if (!process.env.ALIAS_LENGTH) {
      // throw new Error('ALIAS_LENGTH environment variable not defined');
      event.locals.aliasLength = 6;
    } else {
      event.locals.aliasLength = Number(process.env.ALIAS_LENGTH);
    }
  }

  if (!event.locals.stmts) {
    event.locals.stmts = statements;
  }

  if (event.url.pathname.startsWith("/api")) {
    if (event.request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }
  }

  const resp = await resolve(event);
  if (event.url.pathname.startsWith("/api")) {
    resp.headers.append("Access-Control-Allow-Origin", "*");
  }

  return resp;
};
