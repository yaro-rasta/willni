import { test, expect } from "@playwright/test";

test.describe("Content Validation", () => {
  test.describe("Thinkers Review", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/THINKERS_REVIEW");
      await expect(page.locator("h1")).toContainText(
        "Superintellect: Оцінка Великих Мислителів",
      );
      await expect(page.locator("main")).toContainText("Нікола Тесла");
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/THINKERS_REVIEW");
      await expect(page.locator("h1")).toContainText(
        "Superintellect: Evaluation of Great Thinkers",
      );
      await expect(page.locator("main")).toContainText("Nikola Tesla");
    });
  });

  test.describe("Series Overview", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/SERIES");
      await expect(page.locator("h1")).toContainText(
        "SUPER INTELLECT SERIES: Будівельні блоки майбутнього себе",
      );
      await expect(page.locator("main")).toContainText("Анатомія Тривоги");
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/SERIES");
      await expect(page.locator("h1")).toContainText(
        "SUPER INTELLECT SERIES: Building Blocks of the Future Self",
      );
      await expect(page.locator("main")).toContainText("Anatomy of Anxiety");
    });
  });

  test.describe("Matrix", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/MATRIX");
      await expect(page.locator("h1")).toContainText(
        "MATRIX: Стратегія Антропологічної Адаптації",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/MATRIX");
      await expect(page.locator("h1")).toContainText(
        "MATRIX: Strategy for Anthropological Adaptation",
      );
    });
  });

  test.describe("Space Law", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/SPACE_LAW");
      await expect(page.locator("h1")).toContainText(
        "Космічне Право: Модель для Цифрової Епохи",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/SPACE_LAW");
      await expect(page.locator("h1")).toContainText(
        "Space Law: A Model for the Digital Age",
      );
    });
  });

  test.describe("Implementation", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/IMPLEMENTATION");
      await expect(page.locator("h1")).toContainText(
        "Технічна Реалізація Проекту Superintellect",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/IMPLEMENTATION");
      await expect(page.locator("h1")).toContainText("Implementation");
    });
  });

  test.describe("Law (Superintellect)", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/LAW");
      await expect(page.locator("h1")).toContainText(
        "МАНИФЕСТ ПРИРОДНОГО ПРАВА (LAW)",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/LAW");
      await expect(page.locator("h1")).toContainText(
        "NATURAL LAW MANIFESTO (LAW)",
      );
    });
  });

  test.describe("Root Law", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("law");
      await expect(page.locator("h1")).toContainText(
        "Правовий Фундамент: Співвідношення Прав",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/law");
      await expect(page.locator("h1")).toContainText(
        "Legal Foundation: Correlation of Rights",
      );
    });
  });

  test.describe("Roadmap", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("roadmap");
      await expect(page.locator("h1")).toContainText(
        "Дорожня Карта та Принципи Реалізації",
      );
    });
  });

  test.describe("Community System", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/community_system");
      await expect(page.locator("h1")).toContainText(
        'Екосистема "Вільні": Спільнота з Дивідендами',
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/community_system");
      await expect(page.locator("h1")).toContainText(
        '"Free" Ecosystem: A Community with Dividends',
      );
    });
  });

  test.describe("Economy", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/economy");
      await expect(page.locator("h1")).toContainText(
        "Економіка Суперінтелекту: Модель 1-33-33-33",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/economy");
      await expect(page.locator("h1")).toContainText(
        "Superintellect Economy: 1-33-33-33 Model",
      );
    });
  });

  test.describe("Governance", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/governance");
      await expect(page.locator("h1")).toContainText(
        "Система Управління: Рада Вільних",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/governance");
      await expect(page.locator("h1")).toContainText(
        "Governance System: Council of the Free",
      );
    });
  });

  test.describe("Mentorship", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/mentorship");
      await expect(page.locator("h1")).toContainText(
        "Система Наставництва: Train the Trainer",
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/mentorship");
      await expect(page.locator("h1")).toContainText(
        "Mentorship System: Train the Trainer",
      );
    });
  });

  test.describe("Transformation Scheme", () => {
    test("UK: Should load and display correct title", async ({ page }) => {
      await page.goto("superintellect/transformation_scheme");
      await expect(page.locator("h1")).toContainText(
        'Програма Трансформації "Суперінтелект": Схема для Команд та VIP',
      );
    });

    test("EN: Should load and display correct title", async ({ page }) => {
      await page.goto("en/superintellect/transformation_scheme");
      await expect(page.locator("h1")).toContainText(
        '"Superintellect" Transformation Program: Scheme for Teams and VIPs',
      );
    });
  });

  test.describe("Series Details", () => {
    test("UK Series 1: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_1");
      await expect(page.locator("h1")).toContainText(
        "Серія 1: Анатомія Тривоги",
      );
    });
    test("EN Series 1: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_1");
      await expect(page.locator("h1")).toContainText(
        "Series 1: Anatomy of Anxiety",
      );
    });

    test("UK Series 2: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_2");
      await expect(page.locator("h1")).toContainText(
        "Серія 2: Ідея — Хто Я і Де Я?",
      );
    });
    test("EN Series 2: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_2");
      await expect(page.locator("h1")).toContainText(
        "Series 2: Idea — Who Am I and Where Am I?",
      );
      await expect(page.locator("main")).toContainText("Lost in Infinity");
      await expect(page.locator("main")).toContainText("Etymology");
      await expect(page.locator("main")).toContainText("Dialogue with Shi");
    });

    test("UK Series 3: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_3");
      await expect(page.locator("h1")).toContainText(
        "Серія 3: Три Стовпи Суперінтелекту",
      );
    });
    test("EN Series 3: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_3");
      await expect(page.locator("h1")).toContainText(
        "Series 3: Three Pillars of Superintellect",
      );
      await expect(page.locator("main")).toContainText("Stoicism");
      await expect(page.locator("main")).toContainText("Rastafarianism");
      await expect(page.locator("main")).toContainText("Solipsism");
    });

    test("UK Series 4: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_4");
      await expect(page.locator("h1")).toContainText(
        "Серія 4: Архітектор vs Робочий",
      );
    });
    test("EN Series 4: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_4");
      await expect(page.locator("h1")).toContainText(
        "Series 4: Architect vs Worker",
      );
      await expect(page.locator("main")).toContainText("Mental Matrix");
      await expect(page.locator("main")).toContainText("1 BTC/Day");
    });

    test("UK Series 5: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_5");
      await expect(page.locator("h1")).toContainText(
        "Серія 5: Місія та Щоденна Дисципліна",
      );
    });
    test("EN Series 5: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_5");
      await expect(page.locator("h1")).toContainText(
        "Series 5: Mission and Daily Discipline",
      );
      await expect(page.locator("main")).toContainText("Kindred Work");
      await expect(page.locator("main")).toContainText("Morning Ritual");
    });

    test("UK Series 6: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("superintellect/series_6");
      await expect(page.locator("h1")).toContainText(
        "Серія 6: Маніфест Вільних",
      );
    });
    test("EN Series 6: Should load and display correct title", async ({
      page,
    }) => {
      await page.goto("en/superintellect/series_6");
      await expect(page.locator("h1")).toContainText(
        'Series 6: Manifesto of the "Free" (Finale)',
      );
      await expect(page.locator("main")).toContainText(
        "Declaration of the Free",
      );
      await expect(page.locator("main")).toContainText("Levels of Freedom");
    });
  });
});
