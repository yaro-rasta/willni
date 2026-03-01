import path from "node:path";
import Logger from "@nan0web/log";

/**
 * @param {import('../main.mjs').Context} ctx
 */
export async function runVerse(ctx) {
  const { console, adapter, t, session } = ctx;
  const { db } = session;

  const VERSE_DIR = db.FS.resolve(db.cwd, db.root, "verses");
  const { readdirSync, existsSync } = db.FS;

  if (!existsSync(VERSE_DIR)) {
    console.error(t("No verses found in registry."));
    return;
  }

  const files = readdirSync(VERSE_DIR).filter((f) => f.endsWith(".yaml"));

  if (files.length === 0) {
    console.error(t("No verses found in registry."));
    return;
  }

  const options = files.map((f) => f.replace(".yaml", ""));

  const result = await adapter.requestSelect({
    title: t("Explore Universal Verses:"),
    options,
    console,
  });

  const slug = result.value;
  if (!slug || result.cancelled) return;

  const data = await db.loadDocument(`verses/${slug}.yaml`);

  console.clear();
  console.info(
    Logger.style(` iVerse: ${slug} `, {
      color: Logger.YELLOW,
      bold: true,
    }),
  );
  console.info("");

  if (data.profile) {
    console.success(`📜 ${t("Profile")}`);
    if (data.profile.bio)
      console.info(
        `${Logger.style("Bio:", { bold: true })} ${data.profile.bio}`,
      );
    if (data.profile.quote)
      console.info(
        `${Logger.style("Quote:", { italic: true })} "${data.profile.quote}"`,
      );

    if (data.profile.identifiers && data.profile.identifiers.length > 0) {
      console.info("");
      data.profile.identifiers.forEach((id) => {
        const typeLabel = id.type.replace("_", " ").toUpperCase();
        console.info(
          `${Logger.style(`[${typeLabel}]:`, { color: Logger.MAGENTA })} ${id.value}`,
        );
      });
    }
    console.info("");
  }

  if (data.products && data.products.length > 0) {
    console.success(`🎨 ${t("Products & Art")}`);
    data.products.forEach((p) => {
      console.info(
        ` - ${Logger.style(p.title, { color: Logger.CYAN })} (${p.type})`,
      );
      if (p.description)
        console.info(
          `   ${Logger.style(p.description, { color: Logger.DIM })}`,
        );
      if (p.price) console.info(`   ${t("Price")}: ${p.price} WILLNI`);
    });
    console.info("");
  }

  if (data.chronicles && data.chronicles.length > 0) {
    console.success(`⏳ ${t("Chronology")}`);
    data.chronicles.forEach((c) => {
      console.info(
        ` [${Logger.style(c.date, { color: Logger.GREEN })}] ${c.event}`,
      );
    });
    console.info("");
  }

  if (data.ecosystem) {
    console.success(`⚖️ ${t("Ecosystem Protocol")}`);
    console.info(
      ` ${Logger.style("UBI:", { bold: true })} ${data.ecosystem.ubi}% | ${Logger.style("DEV:", { bold: true })} ${data.ecosystem.dev}% | ${Logger.style("TREASURY:", { bold: true })} ${data.ecosystem.treasury}% | ${Logger.style("FEE:", { bold: true })} ${data.ecosystem.fee}%`,
    );
  }

  await adapter.requestInput({
    prompt: t("Press Enter to return...") + " ",
    console,
  });
}
