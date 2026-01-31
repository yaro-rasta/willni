#!/usr/bin/env node

/**
 * Auto-fix для markdown файлів Will-n-i
 * Автоматично виправляє:
 * 1. Правопис: Ми→мИ, Ви→вИ, Ти→тИ, AI→Ші
 * 2. Заборонені продукти: Telegram→Signal, Discord→Revolt
 */

const fs = require('fs');
const path = require('path');

// Правила автовиправлення
const AUTO_FIX_RULES = [
	// Термінологія (чутлива до регістру)
	{ pattern: /\bМи\b/g, replacement: 'мИ' },
	{ pattern: /\bВи\b/g, replacement: 'вИ' },
	{ pattern: /\bТи\b/g, replacement: 'тИ' },
	{ pattern: /\sAI\s/g, replacement: ' Ші ' },
	{ pattern: /\(AI\)/g, replacement: '(Ші)' },

	// Заборонені продукти
	// {
	// 	pattern: /Telegram/g,
	// 	replacement: 'Signal',
	// 	comment: '// Telegram → Signal (підтримує Україну, E2E encryption)'
	// },
	// {
	// 	pattern: /Discord/g,
	// 	replacement: 'Revolt',
	// 	comment: '// Discord → Revolt (open-source альтернатива)'
	// }
];

// Файли для пропуску
const SKIP_PATTERNS = [
	/node_modules/,
	/\.backup/,
	/THINKERS_REVIEW\.md$/,
	/CHANGELOG\.md$/,
	/transcripts\.md$/
];

let stats = {
	filesProcessed: 0,
	filesSkipped: 0,
	totalReplacements: 0,
	replacementsByType: {}
};

/**
 * Створює бекап
 */
function createBackup(dir) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
	const backupDir = `${dir}.backup.${timestamp}`;

	console.log('📦 Створюю резервну копію...');
	copyDirSync(dir, backupDir);
	console.log(`✅ Бекап створено: ${backupDir}\n`);
	return backupDir;
}

/**
 * Рекурсивне копіювання
 */
function copyDirSync(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (let entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirSync(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

/**
 * Знаходить markdown файли
 */
function findMarkdownFiles(dir) {
	let results = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (let entry of entries) {
		const fullPath = path.join(dir, entry.name);

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
 * Виправляє файл
 */
function fixFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf8');
	const original = content;
	let fileReplacements = 0;

	AUTO_FIX_RULES.forEach(rule => {
		const matches = content.match(rule.pattern);
		if (matches) {
			const count = matches.length;
			content = content.replace(rule.pattern, rule.replacement);
			fileReplacements += count;

			const key = `${rule.pattern.source} → ${rule.replacement}`;
			stats.replacementsByType[key] = (stats.replacementsByType[key] || 0) + count;
		}
	});

	if (fileReplacements > 0) {
		fs.writeFileSync(filePath, content, 'utf8');
		console.log(`    ✓ ${path.basename(filePath)}: ${fileReplacements} виправлень`);
		stats.filesProcessed++;
		stats.totalReplacements += fileReplacements;
	}
}

/**
 * Головна функція
 */
function main() {
	const targetDir = process.argv[2] || '.';
	const fullPath = path.resolve(targetDir);

	console.log('🔧 Auto-Fix для Will-n-i Markdown\n');
	console.log('=========================================\n');

	if (!fs.existsSync(fullPath)) {
		console.error(`❌ Директорія не знайдена: ${fullPath}`);
		process.exit(1);
	}

	// Бекап
	const backupDir = createBackup(fullPath);

	// Пошук файлів
	console.log('🔍 Пошук markdown файлів...');
	const files = findMarkdownFiles(fullPath);
	console.log(`✅ Знайдено файлів: ${files.length}\n`);

	// Виправлення
	console.log('✏️  Виконую автовиправлення...\n');
	files.forEach(fixFile);

	// Звіт
	console.log('\n=========================================');
	console.log('📊 Результати:');
	console.log(`  • Файлів оброблено: ${stats.filesProcessed}`);
	console.log(`  • Всього виправлень: ${stats.totalReplacements}\n`);

	if (Object.keys(stats.replacementsByType).length > 0) {
		console.log('📈 Деталі:');
		for (let [key, count] of Object.entries(stats.replacementsByType)) {
			console.log(`  • ${key}: ${count} замін`);
		}
	}

	console.log('\n✅ Автовиправлення завершено!');
	console.log(`\nℹ️  Резервна копія: ${backupDir}`);
	console.log('ℹ️  Перевір зміни перед комітом!\n');
}

if (require.main === module) {
	main();
}

module.exports = { fixFile, AUTO_FIX_RULES };
