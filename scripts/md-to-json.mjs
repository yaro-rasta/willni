import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, relative, basename, dirname, extname } from "node:path";

const FRONTMATTER_SEPARATOR = "---";

/**
 * Parse raw Markdown string with optional YAML frontmatter.
 * Compatible with @nan0web/db-fs parseMD format.
 *
 * @param {string} raw - Raw Markdown text
 * @returns {{ metadata: object, content: string }}
 */
export function parseMD(raw) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith(FRONTMATTER_SEPARATOR)) {
    return { metadata: {}, content: raw };
  }

  const afterFirst = trimmed.indexOf("\n") + 1;
  const closingIndex = trimmed.indexOf(
    "\n" + FRONTMATTER_SEPARATOR,
    afterFirst - 1,
  );

  if (closingIndex < 0 || closingIndex < afterFirst - 1) {
    return { metadata: {}, content: raw };
  }

  const yamlBlock = trimmed.slice(afterFirst, closingIndex);
  const contentStart = closingIndex + 1 + FRONTMATTER_SEPARATOR.length;
  const content = trimmed.slice(contentStart).replace(/^\n+/, "");

  const metadata = parseYAMLSimple(yamlBlock);

  return { metadata, content };
}

/**
 * Simple YAML parser for frontmatter (key: value pairs only).
 * We avoid importing 'yaml' package to keep scripts dependency-free.
 *
 * @param {string} yaml - YAML string
 * @returns {object}
 */
export function parseYAMLSimple(yaml) {
  /** @type {Record<string, string>} */
  const result = {};
  for (const line of yaml.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (!isNaN(value) && value !== "") value = Number(value);
    if (key) result[key] = value;
  }
  return result;
}

/**
 * Convert Markdown content to a $content array (nan0web Document format).
 * Each element represents a content block with a type and data.
 *
 * @param {string} md - Markdown content string
 * @returns {Array<object>} $content array
 */
export function mdToContent(md) {
  /** @type {Array<object>} */
  const content = [];
  const lines = md.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      content.push({
        [`h${headingMatch[1].length}`]: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // Code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      content.push({
        pre: [
          {
            code: codeLines.join("\n"),
            $class: lang ? `language-${lang}` : undefined,
          },
        ],
      });
      i++; // skip closing ```
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      content.push({
        blockquote: [{ p: quoteLines.join("\n") }],
      });
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s+/)) {
        items.push({
          li: lines[i].replace(/^\s*[-*]\s+/, "").trim(),
        });
        i++;
      }
      content.push({
        ul: items,
      });
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        items.push({
          li: lines[i].replace(/^\s*\d+\.\s+/, "").trim(),
        });
        i++;
      }
      content.push({
        ol: items,
      });
      continue;
    }

    // Horizontal rule
    if (line.match(/^(-{3,}|_{3,}|\*{3,})$/)) {
      content.push({ hr: true });
      i++;
      continue;
    }

    // Paragraph (default: collect lines until empty line)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].trimStart().startsWith("```") &&
      !lines[i].trimStart().startsWith("> ") &&
      !lines[i].match(/^\s*[-*]\s+/) &&
      !lines[i].match(/^\s*\d+\.\s+/) &&
      !lines[i].match(/^(-{3,}|_{3,}|\*{3,})$/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      content.push({
        p: paraLines.join("\n"),
      });
    }
  }

  return content;
}

/**
 * Convert a single .md file to nan0web JSON Document.
 *
 * @param {string} mdPath - Path to .md file
 * @returns {object} JSON document with metadata + $content
 */
export function convertFile(mdPath) {
  const raw = readFileSync(mdPath, "utf-8");
  const { metadata, content: rawContent } = parseMD(raw);
  const content = mdToContent(rawContent);

  // If the document does not explicitly define a layout via $content in metadata,
  // we could theoretically provide a default $content here or leave it up to the implementation.
  // We keep metadata intact, and append content.
  return {
    ...metadata,
    content,
  };
}

/**
 * Recursively find all .md files in a directory.
 *
 * @param {string} dir - Directory to scan
 * @param {string[]} [exclude=[]] - Patterns to exclude
 * @returns {string[]} Array of .md file paths
 */
export function findMDFiles(dir, exclude = []) {
  /** @type {string[]} */
  const files = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);

    // Skip excluded
    if (
      exclude.some((pattern) => entry === pattern || fullPath.includes(pattern))
    ) {
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findMDFiles(fullPath, exclude));
    } else if (extname(entry) === ".md") {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Build all .md files from sourceDir into JSON files in outputDir.
 *
 * @param {object} options
 * @param {string} options.sourceDir - Source directory with .md files
 * @param {string} options.outputDir - Output directory for .json files
 * @param {string[]} [options.exclude=[]] - Directories/files to exclude
 * @returns {{ converted: number, files: string[] }}
 */
export function build({ sourceDir, outputDir, exclude = [] }) {
  const mdFiles = findMDFiles(sourceDir, exclude);
  const converted = [];

  for (const mdPath of mdFiles) {
    const relPath = relative(sourceDir, mdPath);
    const jsonPath = join(outputDir, relPath.replace(/\.md$/, ".json"));

    mkdirSync(dirname(jsonPath), { recursive: true });

    const document = convertFile(mdPath);
    writeFileSync(jsonPath, JSON.stringify(document, null, "\t"), "utf-8");

    converted.push(relPath);
  }

  return { converted: converted.length, files: converted };
}
