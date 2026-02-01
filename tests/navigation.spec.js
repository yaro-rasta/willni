import { test, expect } from '@playwright/test';

test.describe('Navigation and Sidebar', () => {
    test('UK version should have a functional sidebar', async ({ page }) => {
        // Navigate to a content page where sidebar should be visible
        await page.goto('/system');

        // Check main title (content of system.md)
        await expect(page.locator('h1')).toContainText('Воля понад усе');

        // Check if sidebar is visible
        const sidebar = page.locator('.VPSidebar');
        await expect(sidebar).toBeVisible();

        // Check for "Основи" section
        await expect(sidebar.getByText('Основи')).toBeVisible();

        // Try navigating using sidebar
        await sidebar.getByText('Правовий фундамент').click();
        await expect(page).toHaveURL(/\/law/);
        await expect(page.locator('h1')).toContainText('Правовий Фундамент');
    });

    test('EN version should have a functional sidebar', async ({ page }) => {
        // Navigate to a content page where sidebar should be visible
        await page.goto('/en/system');

        // Check main title (content of i18n/en/system.md)
        await expect(page.locator('h1')).toContainText('Will above all');

        // Check if sidebar is visible
        const sidebar = page.locator('.VPSidebar');
        await expect(sidebar).toBeVisible();

        // Check for "Foundation" section
        await expect(sidebar.getByText('Foundation', { exact: true })).toBeVisible();

        // Try navigating using sidebar
        await sidebar.getByText('Legal Foundation').click();
        await expect(page).toHaveURL(/.*\/en\/law/);
        await expect(page.locator('h1')).toContainText('Legal Foundation');
    });

    test('Superintellect section navigation', async ({ page }) => {
        await page.goto('/superintellect/');

        const sidebar = page.locator('.VPSidebar');
        await expect(sidebar).toBeVisible();
        await expect(sidebar.getByText('Матриця Superintellect')).toBeVisible();

        // Click on "Економіка"
        await sidebar.getByText('Економіка').click();
        await expect(page).toHaveURL(/\/superintellect\/economy/);

        // Update expected text to match actual content
        await expect(page.locator('h1')).toContainText('Економіка Суперінтелекту');
    });
});
