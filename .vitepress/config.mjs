import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
	title: "Will-n-i",
	description: "Цифрова Держава Суверенних Громадян",
	lang: 'uk-UA',
	// Якщо репозиторій називається 'willni', розкоментуй наступний рядок:
	base: '/willni/',

	// Увімкнення темної теми
	appearance: 'dark',

	// Налаштування пошуку
	search: {
		provider: 'local'
	},

	themeConfig: {
		logo: '/logo.png',
		nav: [
			{ text: 'Головна', link: '/' },
			{ text: 'Маніфест', link: '/system' },
			{ text: 'Дорожня Карта', link: '/roadmap' },
			{ text: '🧠 Суперінтелект', link: '/superintellect/' }
		],
		sidebar: [
			{
				text: 'Фундамент',
				items: [
					{ text: '🔄 Перехід', link: '/transition' },
					{ text: '⚖️ Правовий Фундамент', link: '/law' },
					{ text: '🧠 Філософія', link: '/philosophy' }
				]
			},
			{
				text: 'Реалізація',
				items: [
					{ text: '🌐 Мережа', link: '/network' },
					{ text: '🛣 Дорожня Карта', link: '/roadmap' },
					{ text: '📜 Маніфест', link: '/system' },
					{ text: '⚖️ Справедливість', link: '/justice' }
				]
			},
			{
				text: '🧠 Суперінтелект',
				collapsed: false,
				items: [
					{ text: '📖 Огляд', link: '/superintellect/' },
					{ text: '📺 Серії', link: '/superintellect/SERIES' },
					{
						text: '🎬 Епізоди',
						collapsed: true,
						items: [
							{ text: 'Серія 1: Анатомія Тривоги', link: '/superintellect/series_1' },
							{ text: 'Серія 2: Ідея (І-де-я)', link: '/superintellect/series_2' },
							{ text: 'Серія 3: Три Стовпи', link: '/superintellect/series_3' },
							{ text: 'Серія 4: Архітектор vs Робочий', link: '/superintellect/series_4' },
							{ text: 'Серія 5: Місія та Дисципліна', link: '/superintellect/series_5' },
							{ text: 'Серія 6: Маніфест Вільних', link: '/superintellect/series_6' }
						]
					},
					{ text: '⚖️ Природне Право', link: '/superintellect/LAW' },
					{ text: '🌟 Етичний Кодекс', link: '/superintellect/ETHICS' },
					{ text: '🧩 Ментальна Матриця', link: '/superintellect/MATRIX' },
					{ text: '💰 Економіка', link: '/superintellect/economy' }
				]
			},
			{
				text: '🌍 Голоси Спільноти',
				collapsed: true,
				items: [
					{ text: '📖 Про розділ', link: '/community/' },
					{ text: 'Наталія: ВОЛЯ vs Вільна', link: '/community/Наталія.Яілатан/post' }
				]
			},
			{
				text: 'Публікація',
				items: [
					{ text: '🚀 Космодрому', link: '/PUBLISH' }
				]
			}
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/yaro/willni' }
		],
		footer: {
			message: 'Will-n-i: Воля понад усе',
			copyright: 'мИ є Народ'
		},
		outline: {
			label: 'На цій сторінці',
			level: [2, 3]
		},
		docFooter: {
			prev: 'Назад',
			next: 'Далі'
		}
	},
	markdown: {
		lineNumbers: true
	},
	// Налаштування Mermaid
	mermaid: {
		// Опціонально: налаштування теми
	},
	mermaidPlugin: {
		class: "mermaid"
	}
}))
