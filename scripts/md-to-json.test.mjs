import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseMD,
  parseYAMLSimple,
  mdToContent,
  convertFile,
  findMDFiles,
  build,
} from "./md-to-json.mjs";
import {
  writeFileSync,
  mkdirSync,
  rmSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";

describe("md-to-json", () => {
  describe("parseYAMLSimple", () => {
    it("should parse key-value pairs", () => {
      const result = parseYAMLSimple("title: Hello\nlayout: page");
      assert.deepStrictEqual(result, { title: "Hello", layout: "page" });
    });

    it("should handle quoted values", () => {
      const result = parseYAMLSimple("title: \"Hello World\"\ndesc: 'Test'");
      assert.deepStrictEqual(result, { title: "Hello World", desc: "Test" });
    });

    it("should parse boolean and number values", () => {
      const result = parseYAMLSimple("active: true\ncount: 42\nlabel: false");
      assert.deepStrictEqual(result, { active: true, count: 42, label: false });
    });

    it("should skip lines without colon", () => {
      const result = parseYAMLSimple("title: OK\nno_colon_here\nkey: val");
      assert.deepStrictEqual(result, { title: "OK", key: "val" });
    });
  });

  describe("parseMD", () => {
    it("should parse frontmatter + content", () => {
      const raw = "---\ntitle: Test\nlayout: page\n---\n# Hello\n\nWorld";
      const { metadata, content } = parseMD(raw);
      assert.deepStrictEqual(metadata, { title: "Test", layout: "page" });
      assert.strictEqual(content, "# Hello\n\nWorld");
    });

    it("should handle MD without frontmatter", () => {
      const raw = "# Just text\n\nNo frontmatter here.";
      const { metadata, content } = parseMD(raw);
      assert.deepStrictEqual(metadata, {});
      assert.strictEqual(content, raw);
    });

    it("should handle empty frontmatter block", () => {
      const raw = "---\n---\nContent only";
      const { metadata, content } = parseMD(raw);
      assert.deepStrictEqual(metadata, {});
      assert.strictEqual(content, "Content only");
    });

    it("should handle unclosed frontmatter as plain content", () => {
      const raw = "---\ntitle: Broken";
      const { metadata, content } = parseMD(raw);
      assert.deepStrictEqual(metadata, {});
      assert.strictEqual(content, raw);
    });
  });

  describe("mdToContent", () => {
    it("should parse headings", () => {
      const result = mdToContent("# H1\n## H2\n### H3");
      assert.strictEqual(result.length, 3);
      assert.deepStrictEqual(result[0], {
        h1: "H1",
      });
      assert.deepStrictEqual(result[1], {
        h2: "H2",
      });
      assert.deepStrictEqual(result[2], {
        h3: "H3",
      });
    });

    it("should parse paragraphs", () => {
      const result = mdToContent(
        "Hello world.\nThis is text.\n\nNew paragraph.",
      );
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].p, "Hello world.\nThis is text.");
      assert.strictEqual(result[1].p, "New paragraph.");
    });

    it("should parse code blocks", () => {
      const result = mdToContent("```js\nconst x = 1\n```");
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        pre: [
          {
            code: "const x = 1",
            $class: "language-js",
          },
        ],
      });
    });

    it("should parse code blocks without language", () => {
      const result = mdToContent("```\nplain code\n```");
      assert.strictEqual(Array.isArray(result[0].pre), true);
      assert.strictEqual(result[0].pre[0].code, "plain code");
      assert.strictEqual(result[0].pre[0].$class, undefined);
    });

    it("should parse blockquotes", () => {
      const result = mdToContent("> Quote line 1\n> Quote line 2");
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        blockquote: [{ p: "Quote line 1\nQuote line 2" }],
      });
    });

    it("should parse unordered lists", () => {
      const result = mdToContent("- Item A\n- Item B\n- Item C");
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        ul: [{ li: "Item A" }, { li: "Item B" }, { li: "Item C" }],
      });
    });

    it("should parse ordered lists", () => {
      const result = mdToContent("1. First\n2. Second\n3. Third");
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], {
        ol: [{ li: "First" }, { li: "Second" }, { li: "Third" }],
      });
    });

    it("should parse horizontal rules", () => {
      const result = mdToContent("---");
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], { hr: true });
    });

    it("should parse complex mixed content", () => {
      const md = [
        "# Title",
        "",
        "Intro paragraph.",
        "",
        "## Section",
        "",
        "- item 1",
        "- item 2",
        "",
        "> A quote",
        "",
        "```bash",
        "echo hello",
        "```",
        "",
        "---",
        "",
        "Final text.",
      ].join("\n");

      const result = mdToContent(md);

      assert.strictEqual(result[0].h1, "Title");
      assert.strictEqual(result[1].p, "Intro paragraph.");
      assert.strictEqual(result[2].h2, "Section");

      assert.deepStrictEqual(result[3].ul, [
        { li: "item 1" },
        { li: "item 2" },
      ]);

      assert.deepStrictEqual(result[4].blockquote, [{ p: "A quote" }]);

      assert.strictEqual(result[5].pre[0].code, "echo hello");
      assert.strictEqual(result[5].pre[0].$class, "language-bash");

      assert.strictEqual(result[6].hr, true);

      assert.strictEqual(result[7].p, "Final text.");
    });
  });

  describe("convertFile", () => {
    const tmpDir = join(import.meta.dirname, ".tmp-test-convert");

    it("should convert .md file to JSON document with content", () => {
      mkdirSync(tmpDir, { recursive: true });
      const mdPath = join(tmpDir, "test.md");
      writeFileSync(mdPath, "---\ntitle: Demo\n---\n# Hello\n\nWorld\n");

      const doc = convertFile(mdPath);
      assert.strictEqual(doc.title, "Demo");
      assert.ok(Array.isArray(doc.content));
      assert.strictEqual(doc.content[0].h1, "Hello");
      assert.strictEqual(doc.content[1].p, "World");

      rmSync(tmpDir, { recursive: true });
    });
  });

  describe("findMDFiles", () => {
    const tmpDir = join(import.meta.dirname, ".tmp-test-find");

    it("should find all .md files recursively", () => {
      mkdirSync(join(tmpDir, "sub"), { recursive: true });
      writeFileSync(join(tmpDir, "a.md"), "# A");
      writeFileSync(join(tmpDir, "b.txt"), "not md");
      writeFileSync(join(tmpDir, "sub", "c.md"), "# C");

      const files = findMDFiles(tmpDir);
      assert.strictEqual(files.length, 2);
      assert.ok(files.some((f) => f.endsWith("a.md")));
      assert.ok(files.some((f) => f.endsWith("c.md")));

      rmSync(tmpDir, { recursive: true });
    });

    it("should exclude specified patterns", () => {
      mkdirSync(join(tmpDir, "node_modules"), { recursive: true });
      writeFileSync(join(tmpDir, "good.md"), "# Good");
      writeFileSync(join(tmpDir, "node_modules", "bad.md"), "# Bad");

      const files = findMDFiles(tmpDir, ["node_modules"]);
      assert.strictEqual(files.length, 1);
      assert.ok(files[0].endsWith("good.md"));

      rmSync(tmpDir, { recursive: true });
    });
  });

  describe("build", () => {
    const srcDir = join(import.meta.dirname, ".tmp-test-build-src");
    const outDir = join(import.meta.dirname, ".tmp-test-build-out");

    it("should convert all .md to .json in output directory", () => {
      // Clean slate
      rmSync(srcDir, { recursive: true, force: true });
      rmSync(outDir, { recursive: true, force: true });
      mkdirSync(join(srcDir, "sub"), { recursive: true });
      writeFileSync(
        join(srcDir, "index.md"),
        "---\ntitle: Home\n---\n# Welcome\n",
      );
      writeFileSync(
        join(srcDir, "sub", "page.md"),
        "---\ntitle: Page\n---\n## Sub Page\n\nContent here.\n",
      );

      const result = build({
        sourceDir: srcDir,
        outputDir: outDir,
        exclude: ["node_modules", ".vitepress"],
      });

      assert.strictEqual(result.converted, 2);
      assert.ok(result.files.includes("index.md"));
      assert.ok(result.files.includes(join("sub", "page.md")));

      // Verify JSON output
      const indexJson = JSON.parse(
        readFileSync(join(outDir, "index.json"), "utf-8"),
      );
      assert.strictEqual(indexJson.title, "Home");
      assert.ok(Array.isArray(indexJson.content));
      assert.strictEqual(indexJson.content[0].h1, "Welcome");

      const pageJson = JSON.parse(
        readFileSync(join(outDir, "sub", "page.json"), "utf-8"),
      );
      assert.strictEqual(pageJson.title, "Page");
      assert.strictEqual(pageJson.content[0].h2 !== undefined, true);
      assert.strictEqual(pageJson.content[1].p !== undefined, true);

      rmSync(srcDir, { recursive: true });
      rmSync(outDir, { recursive: true });
    });
  });
});
