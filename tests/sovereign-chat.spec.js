import { test, expect } from "@playwright/test";

test.describe("Sovereign Chat UI Mockup", () => {
  const url = "http://localhost:8080/SovereignChat.html";

  test("Mobile: tabs are at the bottom", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(url);

    const tabs = page.locator(".tabs");
    await expect(tabs).toBeVisible();

    const box = await tabs.boundingBox();
    // Assuming viewport height 667, tabs should be at the bottom (approx 667 - height)
    expect(box.y).toBeGreaterThan(500);
  });

  test("Mobile: panel is full screen height", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(url);

    const panel = page.locator(".panel.active");
    const box = await panel.boundingBox();
    // Header is ~50px, tabs ~50px. calc(100dvh - 120px)
    expect(box.height).toBeGreaterThan(500);
  });

  test("Desktop: resize works and persists", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(url);

    const peersPanel = page.locator("#panel-peers");
    const initialBox = await peersPanel.boundingBox();

    const gutter = page.locator("#gutter-left");
    const gutterBox = await gutter.boundingBox();

    // Drag gutter to the right (+100px)
    await page.mouse.move(gutterBox.x + gutterBox.width / 2, gutterBox.y + 100);
    await page.mouse.down();
    await page.mouse.move(gutterBox.x + 100, gutterBox.y + 100);
    await page.mouse.up();

    const resizedBox = await peersPanel.boundingBox();
    expect(resizedBox.width).toBeGreaterThan(initialBox.width);

    // Refresh page and check if size persists
    await page.reload();
    const persistedBox = await peersPanel.boundingBox();
    expect(persistedBox.width).toBeCloseTo(resizedBox.width, 1);
  });
});
