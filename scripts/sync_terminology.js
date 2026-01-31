#!/usr/bin/env node

/**
 * Скрипт для синхронізації термінології у розділі superintellect
 * Відповідно до правопису з system.md
 */

const fs = require('fs');
const path = require('path');

// Матриця замін: [regex, replacement]
const REPLACEMENTS = [
    // Займенники
    [/\bМи\b/g, 'мИ'],
    [/\bВи\b/g, 'вИ'],
    [/\bТи\b/g, 'тИ'],
    [/\bЯ\b/g, 'Я'],  // вже правильно, але для консистентності

    // AI → Ші (тільки в нетехнічному контексті)
    [/\sAI\s/g, ' Ші '],
    [/\(AI\)/g, '(Ші)'],
    [/\bAI-/g, 'Ші-'],

    // Специфічні випадки
    [/\bІдея\b/g, 'Ідея'],  // залишаємо як є
];

// Файли, які НЕ треба обробляти (технічна документація)
const SKIP_FILES = [
    'PLATFORM_SPEC.md',
    'IMPLEMENTATION.md',
    'TOKENOMICS.md',
    'package.json',
    'package-lock.json'
];

// Директорія для обробки
const TARGET_DIR = path.join(__dirname, '..', 'superintellect');

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
function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = `${TARGET_DIR}.backup.${timestamp}`;

    console.log('📦 Створюю резервну копію...');

    try {
        copyDirSync(TARGET_DIR, backupDir);
        console.log(`✅ Бекап створено: ${backupDir}\n`);
        return backupDir;
    } catch (err) {
        console.error('❌ Помилка створення бекапу:', err.message);
        process.exit(1);
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
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Пропускаємо node_modules та приховані директорії
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
    const originalContent = content;
    let fileReplacements = 0;

    // Застосовуємо всі заміни
    for (let i = 0; i < REPLACEMENTS.length; i += 2) {
        const regex = REPLACEMENTS[i];
        const replacement = REPLACEMENTS[i + 1];
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
    console.log('🔄 Синхронізація термінології Will-n-i');
    console.log('=========================================\n');

    // Перевірка існування директорії
    if (!fs.existsSync(TARGET_DIR)) {
        console.error(`❌ Директорія не знайдена: ${TARGET_DIR}`);
        process.exit(1);
    }

    // Створення бекапу
    const backupDir = createBackup();

    // Пошук файлів
    console.log('🔍 Пошук markdown файлів...');
    const files = findMarkdownFiles(TARGET_DIR);
    console.log(`✅ Знайдено файлів: ${files.length}\n`);

    // Обробка файлів
    console.log('✏️  Виконую термінологічні заміни...\n');
    files.forEach(processFile);

    // Звіт
    console.log('\n=========================================');
    console.log('📊 Результати:');
    console.log(`  • Файлів оброблено: ${stats.filesProcessed}`);
    console.log(`  • Файлів пропущено: ${stats.filesSkipped}`);
    console.log(`  • Всього замін: ${stats.totalReplacements}\n`);

    console.log('📈 Деталі по заміні:');
    for (let [key, count] of Object.entries(stats.replacementsByType)) {
        console.log(`  • ${key}: ${count} замін`);
    }

    console.log('\n✅ Синхронізація завершена!');
    console.log(`\nℹ️  Резервна копія: ${backupDir}`);
    console.log('ℹ️  Перевір результат перед комітом!\n');
}

// Запуск
if (require.main === module) {
    main();
}

module.exports = { REPLACEMENTS, processFile };
