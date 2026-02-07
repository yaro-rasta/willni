import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    title: "Will-n-i",
    description: "Superintellect Series & Mental Matrix",
    base: "/willni/",

    // Rewrites: мапимо файли з i18n/ у корінь для красивих URL
    rewrites: {
      "i18n/:lang/:file(.*)": ":lang/:file",
    },

    srcExclude: [
      "**/*.backup.*",
      "scripts/**",
      "playwright-report/**",
      "test-results/**",
      "Наталія.Яілатан/**",
      "chat/**",
    ],

    locales: {
      root: {
        label: "Українська",
        lang: "uk-UA",
        themeConfig: {
          // Локалізація інтерфейсу
          outline: { label: "На цій сторінці" },
          docFooter: { prev: "Попередня сторінка", next: "Наступна сторінка" },
          returnToTopLabel: "Нагору",
          sidebarMenuLabel: "Меню",
          darkModeSwitchLabel: "Тема",
          lastUpdatedText: "Останнє оновлення",

          nav: [
            { text: "Матриця", link: "/superintellect/" },
            { text: "Реєстрація", link: "/registration" },
            { text: "Платформи", link: "/PLATFORMS" },
          ],
          sidebar: [
            {
              text: "Основи",
              items: [
                { text: "Маніфест", link: "/system" },
                { text: "Правовий фундамент", link: "/law" },
                { text: "Шлях переходу", link: "/transition" },
                { text: "Платформи", link: "/PLATFORMS" },
                {
                  text: "Технічна Реалізація",
                  link: "/superintellect/IMPLEMENTATION",
                },
              ],
            },
            {
              text: "Матриця Superintellect",
              items: [
                { text: "Навігація", link: "/superintellect/" },
                { text: "Огляд Серій", link: "/superintellect/SERIES" },
                {
                  text: "Епізоди",
                  collapsed: false,
                  items: [
                    {
                      text: "Серія 1: Тривога",
                      link: "/superintellect/series_1",
                    },
                    {
                      text: "Серія 2: І де Я",
                      link: "/superintellect/series_2",
                    },
                    {
                      text: "Серія 3: Стовпи",
                      link: "/superintellect/series_3",
                    },
                    {
                      text: "Серія 4: Архітектор",
                      link: "/superintellect/series_4",
                    },
                    {
                      text: "Серія 5: Місія",
                      link: "/superintellect/series_5",
                    },
                    {
                      text: "Серія 6: Маніфест",
                      link: "/superintellect/series_6",
                    },
                  ],
                },
                { text: "Економіка", link: "/superintellect/economy" },
                { text: "Управління", link: "/superintellect/governance" },
                { text: "Наставництво", link: "/superintellect/mentorship" },
                {
                  text: "Thinkers Review",
                  link: "/superintellect/THINKERS_REVIEW",
                },
                { text: "Космічне Право", link: "/superintellect/SPACE_LAW" },
              ],
            },
          ],
        },
      },
      en: {
        label: "English",
        lang: "en-US",
        link: "/en/",
        themeConfig: {
          nav: [
            { text: "Matrix", link: "/en/superintellect/" },
            { text: "Registration", link: "/en/registration" },
            { text: "Platforms", link: "/en/PLATFORMS" },
          ],
          sidebar: [
            {
              text: "Foundation",
              items: [
                { text: "Manifesto", link: "/en/system" },
                { text: "Legal Foundation", link: "/en/law" },
                { text: "Transition Guide", link: "/en/transition" },
                { text: "Platforms", link: "/en/PLATFORMS" },
                {
                  text: "Implementation",
                  link: "/en/superintellect/IMPLEMENTATION",
                },
              ],
            },
            {
              text: "Superintellect Matrix",
              items: [
                { text: "Navigation", link: "/en/superintellect/" },
                { text: "Series Overview", link: "/en/superintellect/SERIES" },
                {
                  text: "Episodes",
                  collapsed: false,
                  items: [
                    {
                      text: "Series 1: Anxiety",
                      link: "/en/superintellect/series_1",
                    },
                    {
                      text: "Series 2: I-where-am-I",
                      link: "/en/superintellect/series_2",
                    },
                    {
                      text: "Series 3: Pillars",
                      link: "/en/superintellect/series_3",
                    },
                    {
                      text: "Series 4: Architect",
                      link: "/en/superintellect/series_4",
                    },
                    {
                      text: "Series 5: Mission",
                      link: "/en/superintellect/series_5",
                    },
                    {
                      text: "Series 6: Manifesto",
                      link: "/en/superintellect/series_6",
                    },
                  ],
                },
                { text: "Economy", link: "/en/superintellect/economy" },
                { text: "Governance", link: "/en/superintellect/governance" },
                { text: "Mentorship", link: "/en/superintellect/mentorship" },
                {
                  text: "Thinkers Review",
                  link: "/en/superintellect/THINKERS_REVIEW",
                },
                { text: "Space Law", link: "/en/superintellect/SPACE_LAW" },
              ],
            },
          ],
        },
      },
    },

    themeConfig: {
      logo: "/logo.png",

      socialLinks: [
        { icon: "github", link: "https://github.com/yaro-rasta/willni" },
      ],

      footer: {
        message: "мИ обираємо бути Вільними.",
        copyright: 'Copyright © 2026 Спільнота "Вільні"',
      },
    },

    mermaid: {
      // mermaid config
    },
  }),
);
