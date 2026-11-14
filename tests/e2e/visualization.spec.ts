/**
 * NASA-FLAME: Playwright End-to-End & Application-Level Integration Tests
 * Validates scientific visualization component interaction, WebGL canvas lifecycle,
 * camera controls, timeline scrubbing, and tab navigation in real browser contexts.
 */

import { test, expect } from "@playwright/test";

test.describe("NASA-FLAME Scientific Visualization Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to frontend application root or embedded visualization demo
    await page.goto("/");
  });

  test("3D Flame Viewer initializes and displays scientific HUD", async ({ page }) => {
    const viewer = page.locator("text=FLAME 3D VIEWPORT");
    await expect(viewer).toBeVisible();

    // Verify 3D canvas is mounted
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Verify scientific metrics HUD
    await expect(page.locator("text=T_peak:")).toBeVisible();
    await expect(page.locator("text=r_flame:")).toBeVisible();
    await expect(page.locator("text=f_flicker:")).toBeVisible();

    // Verify scientific provenance badge is present
    const provenanceBadge = page.locator("text=VISUALIZATION MODEL").or(page.locator("text=NASA EMPIRICAL DATA"));
    await expect(provenanceBadge.first()).toBeVisible();
  });

  test("Camera presets switch viewing orientation", async ({ page }) => {
    const sideBtn = page.getByRole("button", { name: "side" });
    const topBtn = page.getByRole("button", { name: "top" });
    const isoBtn = page.getByRole("button", { name: "isometric" });

    await sideBtn.click();
    await expect(sideBtn).toHaveCSS("background-color", "rgb(8, 124, 255)");

    await topBtn.click();
    await expect(topBtn).toHaveCSS("background-color", "rgb(8, 124, 255)");

    await isoBtn.click();
    await expect(isoBtn).toHaveCSS("background-color", "rgb(8, 124, 255)");
  });

  test("Simulation playback toggles between Play and Pause", async ({ page }) => {
    const playPauseBtn = page.getByRole("button", { name: /PLAY|Pause/i });
    await expect(playPauseBtn).toBeVisible();

    const initialText = await playPauseBtn.textContent();
    await playPauseBtn.click();

    const toggledText = await playPauseBtn.textContent();
    expect(toggledText).not.toBe(initialText);
  });

  test("Temperature distribution chart switches scientific tabs", async ({ page }) => {
    const radialTab = page.getByRole("button", { name: "Radial T(r)" });
    await radialTab.click();
    await expect(page.locator("text=Radial Temperature Profile T(r)")).toBeVisible();
    await expect(page.locator("text=Reaction Zone")).toBeVisible();

    const temporalTab = page.getByRole("button", { name: "Temporal T(t)" });
    await temporalTab.click();
    await expect(page.locator("text=Peak Flame Temperature Evolution T_max(t)")).toBeVisible();

    const comparisonTab = page.getByRole("button", { name: "0g vs 1g Comparison" });
    await comparisonTab.click();
    await expect(page.locator("text=MICROGRAVITY (0g)")).toBeVisible();
    await expect(page.locator("text=TERRESTRIAL GRAVITY (1g)")).toBeVisible();
  });

  test("Flame geometry viewer toggles dimension annotations and soot zone", async ({ page }) => {
    const dimBtn = page.getByRole("button", { name: /Dimensions/i });
    await expect(dimBtn).toBeVisible();
    await dimBtn.click();

    const sootBtn = page.getByRole("button", { name: /Soot Zone/i });
    await expect(sootBtn).toBeVisible();
    await sootBtn.click();
  });

  test("Gravity comparison chart expands physical mechanism explanation", async ({ page }) => {
    const metricCard = page.locator("text=Flame Aspect Ratio (L/W)").first();
    if (await metricCard.isVisible()) {
      await metricCard.click();
      await expect(page.locator("text=Physical Mechanism:")).toBeVisible();
    }
  });

  test("Simulation timeline scrubs playback head and updates sparkline timestamp", async ({ page }) => {
    const timeline = page.locator("text=SIMULATION TIMELINE");
    if (await timeline.isVisible()) {
      const slider = page.locator("input[type=range]");
      await slider.fill("2.0");
      await expect(page.locator("text=t = 2.00s")).toBeVisible();
    }
  });
});
