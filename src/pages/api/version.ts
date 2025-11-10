import type { APIRoute } from "astro";
import { readFileSync } from "fs";
import { join } from "path";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const versionFile = join(process.cwd(), "VERSION");
    const version = readFileSync(versionFile, "utf-8").trim();

    return new Response(
      JSON.stringify({ version }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ version: "unknown" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
