#!/usr/bin/env node

/**
 * Markdown Linter для Will-n-i проєкту
 * Перевіряє:
 * 1. Позитивні формулювання (мінімум слів "не", "ні")
 * 2. Правопис: мИ, вИ, тИ, Ші
 * 3. Використання продуктів, що підтримують Україну
 */

const fs = require('fs');
const path = require('path');

// Правила перевірки
const RULES = {
	// Термінологія (регістрочутлива)
	terminology: [
		{ pattern: /\bМи\b/g, correct: 'мИ', severity: 'error' },
		{ pattern: /\bВи\b/g, correct: 'вИ', severity: 'error' },
		{ pattern: /\bТи\b/g, correct: 'тИ', severity: 'error' },
		{ pattern: /\sAI\s/g, correct: ' Ші ', severity: 'warning' },
		{ pattern: /\(AI\)/g, correct: '(Ші)', severity: 'warning' },
	],

	// Заборонені продукти (ті, що не підтримують Україну)
	bannedProducts: [
		// {
		//     pattern: /Telegram/gi,
		//     message: 'Telegram контролюється РФ. Використовуй Signal, Element (Matrix), або Revolt',
		//     severity: 'error'
		// },
		// {
		//     pattern: /Discord/gi,
		//     message: 'Discord має проблеми з приватністю. Розглянь Revolt, Element (Matrix), або Mattermost',
		//     severity: 'warning'
		// }
	],

	// Негативні формулювання
	negativePatterns: [
		{
			pattern: /\bне\s+(\w+)/gi,
			message: 'Уникай негативних формулювань. Використовуй позитивні',
			severity: 'warning',
			suggestions: {
				'не тиранія': 'замість тиранії / Природне Право',
				'не хочу': 'прагну',
				'не можу': 'здатний / навчуся',
				'не вірю': 'сумніваюся / шукаю підтвердження'
			}
		}
	]
};

// Пропуски (технічні файли, бекапи)
const SKIP_PATTERNS = [
	/node_modules/,
	/\.backup/,
	/THINKERS_REVIEW\.md$/,  // Цитати від інших мислителів
	/CHANGELOG\.md$/,         // Історичні записи
	/transcripts\.md$/        // Транскрипти
];

let errors = [];
let warnings = [];

/**
 * Перевірка одного файлу
 */
function lintFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const lines = content.split('\n');
	const fileErrors = [];
	const fileWarnings = [];

	lines.forEach((line, index) => {
		const lineNum = index + 1;

		// Перевірка термінології
		RULES.terminology.forEach(rule => {
			const matches = line.match(rule.pattern);
			if (matches) {
				const issue = {
					file: filePath,
					line: lineNum,
					column: line.indexOf(matches[0]),
					message: `Неправильний правопис: "${matches[0]}" → "${rule.correct}"`,
					actual: matches[0],
					expected: rule.correct
				};

				if (rule.severity === 'error') {
					fileErrors.push(issue);
				} else {
					fileWarnings.push(issue);
				}
			}
		});

		// Перевірка заборонених продуктів
		RULES.bannedProducts.forEach(rule => {
			const matches = line.match(rule.pattern);
			if (matches) {
				const issue = {
					file: filePath,
					line: lineNum,
					column: line.indexOf(matches[0]),
					message: rule.message,
					actual: matches[0]
				};

				if (rule.severity === 'error') {
					fileErrors.push(issue);
				} else {
					fileWarnings.push(issue);
				}
			}
		});

		// Перевірка негативних формулювань
		RULES.negativePatterns.forEach(rule => {
			const matches = line.matchAll(rule.pattern);
			for (const match of matches) {
				const phrase = match[0].toLowerCase();
				const suggestion = rule.suggestions[phrase] || 'використовуй позитивне формулювання';

				fileWarnings.push({
					file: filePath,
					line: lineNum,
					column: match.index,
					message: `${rule.message}: "${match[0]}"`,
					suggestion: suggestion
				});
			}
		});
	});

	return { errors: fileErrors, warnings: fileWarnings };
}

/**
 * Знаходить всі .md файли
 */
function findMarkdownFiles(dir) {
	let results = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (let entry of entries) {
		const fullPath = path.join(dir, entry.name);

		// Пропускаємо за патернами
		if (SKIP_PATTERNS.some(pattern => pattern.test(fullPath))) {
			continue;
		}

		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
				continue;
			}
			results = results.concat(findMarkdownFiles(fullPath));
		} else if (entry.name.endsWith('.md')) {
			results.push(fullPath);
		}
	}

	return results;
}

/**
 * Виводить результати
 */
function printResults() {
	console.log('🔍 Markdown Linter для Will-n-i\n');

	if (errors.length === 0 && warnings.length === 0) {
		console.log('✅ Всі перевірки пройдені!\n');
		return 0;
	}

	// Помилки
	if (errors.length > 0) {
		console.log(`❌ Знайдено ${errors.length} помилок:\n`);
		errors.forEach(err => {
			console.log(`  ${err.file}:${err.line}:${err.column}`);
			console.log(`    ${err.message}`);
			if (err.expected) {
				console.log(`    Виправлення: "${err.actual}" → "${err.expected}"`);
			}
			console.log('');
		});
	}

	// Попередження
	if (warnings.length > 0) {
		console.log(`⚠️  Знайдено ${warnings.length} попереджень:\n`);
		warnings.forEach(warn => {
			console.log(`  ${warn.file}:${warn.line}:${warn.column}`);
			console.log(`    ${warn.message}`);
			if (warn.suggestion) {
				console.log(`    Рекомендація: ${warn.suggestion}`);
			}
			console.log('');
		});
	}

	return errors.length > 0 ? 1 : 0;
}

/**
 * Головна функція
 */
function main() {
	const targetDir = process.argv[2] || '.';
	const fullPath = path.resolve(targetDir);

	if (!fs.existsSync(fullPath)) {
		console.error(`❌ Директорія не знайдена: ${fullPath}`);
		process.exit(1);
	}

	console.log(`Перевіряю директорію: ${fullPath}\n`);

	const files = findMarkdownFiles(fullPath);
	console.log(`Знайдено ${files.length} markdown файлів\n`);

	files.forEach(file => {
		const result = lintFile(file);
		errors = errors.concat(result.errors);
		warnings = warnings.concat(result.warnings);
	});

	const exitCode = printResults();
	process.exit(exitCode);
}

// Запуск
if (require.main === module) {
	main();
}

module.exports = { lintFile, RULES };
