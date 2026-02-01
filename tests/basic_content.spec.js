import { test, expect } from '@playwright/test';

test.describe('Basic Content Check', () => {
    // Тестуємо завантаження кореневої сторінки
    test('Root page should load and contain key content', async ({ page }) => {
        // Спробуємо зачекати на завантаження сторінки
        await page.goto('/', { waitUntil: 'networkidle' });

        // Перевіряємо заголовок сторінки
        await expect(page).toHaveTitle(/Will-n-i/);

        // Перевіряємо наявність головного заголовка з контенту (Will-n-i)
        // У index.md hero.name: "Will-n-i"
        const heroName = page.locator('.VPHero .name');
        await expect(heroName).toContainText('Will-n-i');

        // Перевіряємо слоган
        const heroText = page.locator('.VPHero .text');
        await expect(heroText).toContainText('Цифрова Держава Вільних Людей');
    });

    // Тестуємо завантаження сторінки Маніфесту (контентна сторінка)
    test('System page (Manifesto) should load', async ({ page }) => {
        await page.goto('/system', { waitUntil: 'domcontentloaded' });

        // Перевіряємо H1, який є в Markdown файлі (# Воля понад усе)
        const h1 = page.locator('h1');
        await expect(h1).toHaveText('Воля понад усе');

        // Перевіряємо наявність тексту з тіла статті
        const content = page.locator('.vp-doc');
        await expect(content).toContainText('Проект утвердження священної волі людини');
    });

    // Тестуємо англійську версію
    test('English system page should load', async ({ page }) => {
        await page.goto('/en/system', { waitUntil: 'domcontentloaded' });

        const h1 = page.locator('h1');
        await expect(h1).toHaveText('Will above all');

        const content = page.locator('.vp-doc');
        await expect(content).toContainText('A project for asserting the sacred will of man');
    });
});
