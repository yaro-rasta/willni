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
			{ text: 'Дорожня Карта', link: '/roadmap' }
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
