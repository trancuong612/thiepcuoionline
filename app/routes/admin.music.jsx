import { json } from "@remix-run/node";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "../lib/auth.server";

export async function loader({ request }) {
  await requireAdmin(request);

  const musicDir = path.join(process.cwd(), "public", "music");

  try {
    const files = await readdir(musicDir, {
      withFileTypes: true,
    });

    const tracks = files
      .filter(
        (file) => file.isFile() && file.name.toLowerCase().endsWith(".mp3"),
      )
      .map((file) => ({
        name: file.name.replace(/\.mp3$/i, "").replace(/[-_]/g, " "),
        file: file.name,
        url: `/music/${encodeURIComponent(file.name)}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));

    return json({ tracks });
  } catch (error) {
    if (error.code === "ENOENT") {
      return json({ tracks: [] });
    }

    throw error;
  }
}
