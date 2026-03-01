/**
 * willni CLI — Course command
 *
 * Shows series catalog with progress, content preview,
 * and allows completing each series sequentially.
 * Content is loaded from superintellect/series_N.md files.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Logger from "@nan0web/log";
import { CourseProgress } from "../../web/src/models/CourseProgress.js";
import { SERIES_CATALOG } from "../../web/src/models/Series.js";
import { saveProgress, loadProgress } from "../db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, "../../superintellect");

/**
 * Load synopsis (first heading + first paragraph) from series markdown.
 * @param {number} seriesNum
 * @returns {string|null}
 */
function loadSynopsis(seriesNum) {
  try {
    const file = resolve(CONTENT_DIR, `series_${seriesNum}.md`);
    const text = readFileSync(file, "utf-8");
    const lines = text.split("\n");
    // Skip title (# heading) and collect first blockquote or paragraph
    let synopsis = "";
    let started = false;
    for (const line of lines) {
      if (!started && line.startsWith("> ")) {
        synopsis += line.slice(2).trim() + " ";
        started = true;
        continue;
      }
      if (started && line.startsWith("> ")) {
        synopsis += line.slice(2).trim() + " ";
        continue;
      }
      if (started && !line.startsWith("> ")) break;
    }
    return synopsis.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Load section titles from series markdown (## headings).
 * @param {number} seriesNum
 * @returns {string[]}
 */
function loadSections(seriesNum) {
  try {
    const file = resolve(CONTENT_DIR, `series_${seriesNum}.md`);
    const text = readFileSync(file, "utf-8");
    return text
      .split("\n")
      .filter((l) => l.startsWith("## "))
      .map((l) => l.replace(/^## /, "").trim());
  } catch {
    return [];
  }
}

/**
 * @param {object} ctx
 */
export async function runCourse(ctx) {
  const { console, adapter, t, session } = ctx;

  console.clear();
  console.success(t("Course: Superintellect.Activation"));
  console.info("");

  const userId = session.currentUser?.email || "demo";
  let progress;
  if (session.db) {
    progress = await loadProgress(session.db, userId);
  }
  if (!progress) {
    progress = new CourseProgress({ userId });
  }

  for (const series of SERIES_CATALOG) {
    const locked = !progress.isUnlocked(series.number);
    const done = progress.completedSeries.includes(series.number);
    const icon = done
      ? Logger.style("✓", { color: Logger.GREEN })
      : locked
        ? Logger.style("✗", { color: Logger.RED })
        : Logger.style("○", { color: Logger.YELLOW });
    const status = done
      ? Logger.style(t("Completed"), { color: Logger.GREEN })
      : locked
        ? Logger.style(t("Locked"), { color: Logger.RED })
        : Logger.style(t("Available"), { color: Logger.YELLOW });
    console.info(
      `  ${icon} ${t("Series")} ${series.number}: ${t(series.title)} — ${status}`,
    );
    console.info(
      Logger.style(`     ${t(series.theme)}`, { color: Logger.DIM }),
    );
  }

  console.info(`\n  ${t("Progress")}: ${progress.progressPercent}%`);

  while (progress.progressPercent < 100) {
    console.info("");
    const current = progress.currentSeries;
    const seriesMeta = SERIES_CATALOG[current - 1];
    const seriesTitle = t(seriesMeta?.title || `Series ${current}`);

    // ─── Show content preview ───────────────────────
    const synopsis = loadSynopsis(current);
    if (synopsis) {
      console.info("");
      console.info(
        Logger.style(`  ╭── ${t("Series")} ${current}: ${seriesTitle} ──`, {
          bold: true,
        }),
      );
      console.info(
        Logger.style(
          `  │ ${synopsis.slice(0, 120)}${synopsis.length > 120 ? "…" : ""}`,
          { color: Logger.DIM },
        ),
      );
      const sections = loadSections(current);
      if (sections.length > 0) {
        console.info(Logger.style(`  │`, { color: Logger.DIM }));
        for (const s of sections.slice(0, 5)) {
          console.info(Logger.style(`  │  · ${s}`, { color: Logger.DIM }));
        }
        if (sections.length > 5) {
          console.info(
            Logger.style(
              `  │  … ${t("and")} ${sections.length - 5} ${t("more")}`,
              { color: Logger.DIM },
            ),
          );
        }
      }
      console.info(
        Logger.style(`  ╰──────────────────────────`, { bold: true }),
      );
    }

    const res = await adapter.requestToggle({
      message: `${t("Complete series")} ${current}: "${seriesTitle}"?`,
      initial: true,
      active: t("yes"),
      inactive: t("no"),
    });

    if (!res.value) break;

    progress.completeSeries(current);
    console.success(`  ${t("Series")} ${current} ${t("completed")}!`);
    console.info(`  ${t("Progress")}: ${progress.progressPercent}%`);

    if (session.db) {
      await saveProgress(session.db, progress);
    }
  }

  if (progress.progressPercent === 100) {
    console.info("");
    console.success(
      Logger.style(`  ☀ ${t("Transformation complete!")} ☀`, {
        color: Logger.YELLOW,
        bold: true,
      }),
    );
  }
}
