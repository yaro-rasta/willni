#!/usr/bin/env node

/**
 * Скрипт для синхронізації термінології у розділі superintellect та i18n
 * Відповідно до правопису з system.md та англійської локалі
 */

const fs = require('fs');
const path = require('path');

// Матриця замін для української мови
const UK_REPLACEMENTS = [
	// Займенники
	[/\bМи\b/g, 'мИ'],
	[/\bВи\b/g, 'вИ'],
	[/\bТи\b/g, 'тИ'],
	[/\bЯ\b/g, 'Я'],

	// AI → Ші (тільки в нетехнічному контексті)
	[/\sAI\s/g, ' Ші '],
	[/\(AI\)/g, '(Ші)'],
	[/\bAI-/g, 'Ші-'],

	// Специфічні випадки
	[/\bІдея\b/g, 'Ідея'],
];

// Матриця замін для англійської мови
const EN_REPLACEMENTS = [
	// Займенники з прив'язкою до "i" (враховуючи вже стилізовані версії)
	[/\b(w|W)e\b/gi, 'wE-i'],
	[/\b(y|Y)ou\b/gi, 'yOU-i'],
	[/\b(t|T)hou\b/gi, 'tHOU-i'],
	[/\bI\b/g, 'i'],

	// Єдина свідомість
	[/\bi-i\b/gi, 'i-i'],
	[/\bI-I\b/g, 'i-i'],
	[/\bI and I\b/gi, 'i and i'],

	// Will-n-i (назва проєкту не змінюється, але фіксуємо написання)
	[/\bWill-n-i\b/gi, 'Will-n-i'],
	[/\bThe Free\b/g, 'Will-n-i'],

	// AI → Shi (тільки в нетехнічному контексті)
	[/\bAI\b/g, 'Shi'],
];

// Файли, які НЕ треба обробляти (технічна документація)
const SKIP_FILES = [
	'PLATFORM_SPEC.md',
	'IMPLEMENTATION.md',
	'TOKENOMICS.md',
	'package.json',
	'package-lock.json'
];

// Директорії для обробки
const TARGET_DIRS = [
	path.join(__dirname, '..', 'superintellect'),
	path.join(__dirname, '..', 'i18n')
];

// Лічильники
let stats = {
	filesProcessed: 0,
	filesSkipped: 0,
	totalReplacements: 0,
	replacementsByType: {}
};

/**
 * Створює резервну копію директорії
 */
function createBackup(dir) {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
	const dirName = path.basename(dir);
	const backupDir = `${dir}.backup.${timestamp}`;

	console.log(`📦 Створюю резервну копію ${dirName}...`);

	try {
		if (!fs.existsSync(dir)) return null;
		copyDirSync(dir, backupDir);
		console.log(`✅ Бекап створено: ${backupDir}\n`);
		return backupDir;
	} catch (err) {
		console.error(`❌ Помилка створення бекапу ${dirName}:`, err.message);
		return null;
	}
}

/**
 * Рекурсивне копіювання директорії
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
 * Знаходить всі .md файли рекурсивно
 */
function findMarkdownFiles(dir) {
	let results = [];
	if (!fs.existsSync(dir)) return results;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (let entry of entries) {
		const fullPath = path.join(dir, entry.name);

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
 * Перевіряє, чи треба пропустити файл
 */
function shouldSkipFile(filePath) {
	const fileName = path.basename(filePath);
	return SKIP_FILES.includes(fileName);
}

/**
 * Визначає набір замін на основі шляху до файлу
 */
function getReplacementsForFile(filePath) {
	// Якщо шлях містить /i18n/en/ - використовуємо англійські заміни
	if (filePath.includes(path.sep + 'i18n' + path.sep + 'en' + path.sep)) {
		return EN_REPLACEMENTS;
	}
	// За замовчуванням (або якщо в superintellect) - українські
	return UK_REPLACEMENTS;
}

/**
 * Обробляє один файл
 */
function processFile(filePath) {
	const fileName = path.basename(filePath);

	if (shouldSkipFile(filePath)) {
		console.log(`    ⏭  Пропускаю (технічний): ${fileName}`);
		stats.filesSkipped++;
		return;
	}

	let content = fs.readFileSync(filePath, 'utf8');
	const replacements = getReplacementsForFile(filePath);
	let fileReplacements = 0;

	// Застосовуємо всі заміни
	for (let i = 0; i < replacements.length; i++) {
		const [regex, replacement] = replacements[i];
		const matches = content.match(regex);

		if (matches) {
			const count = matches.length;
			content = content.replace(regex, replacement);
			fileReplacements += count;

			// Статистика по типу заміни
			const key = `${regex.source} → ${replacement}`;
			stats.replacementsByType[key] = (stats.replacementsByType[key] || 0) + count;
		}
	}

	// Зберігаємо тільки якщо були зміни
	if (fileReplacements > 0) {
		fs.writeFileSync(filePath, content, 'utf8');
		console.log(`    ✓ ${fileName}: ${fileReplacements} замін`);
		stats.filesProcessed++;
		stats.totalReplacements += fileReplacements;
	}
}

/**
 * Головна функція
 */
function main() {
	console.log('🔄 Синхронізація термінології Will-n-i (UK/EN)');
	console.log('==============================================\n');

	let allFiles = [];

	// Обробка кожної цільової директорії
	TARGET_DIRS.forEach(dir => {
		if (fs.existsSync(dir)) {
			createBackup(dir);
			console.log(`🔍 Пошук markdown файлів у ${path.basename(dir)}...`);
			allFiles = allFiles.concat(findMarkdownFiles(dir));
		}
	});

	console.log(`✅ Всього знайдено файлів: ${allFiles.length}\n`);

	// Обробка файлів
	console.log('✏️  Виконую термінологічні заміни...\n');
	allFiles.forEach(processFile);

	// Звіт
	console.log('\n=========================================');
	console.log('📊 Результати:');
	console.log(`  • Файлів оброблено: ${stats.filesProcessed}`);
	console.log(`  • Файлів пропущено: ${stats.filesSkipped}`);
	console.log(`  • Всього замін: ${stats.totalReplacements}\n`);

	console.log('📈 Деталі по заміні (ТОП):');
	const sortedReplacements = Object.entries(stats.replacementsByType)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 15);

	for (let [key, count] of sortedReplacements) {
		console.log(`  • ${key}: ${count} замін`);
	}

	console.log('\n✅ Синхронізація завершена!');
	console.log('ℹ️  Перевір результат перед комітом!\n');
}

// Запуск
if (require.main === module) {
	main();
}

module.exports = { UK_REPLACEMENTS, EN_REPLACEMENTS, processFile };
