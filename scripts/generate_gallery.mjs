import fs from 'node:fs'
import path from 'node:path'

const SNAPSHOT_DIR = './src/play-cli/snapshots'
const OUTPUT_FILE = './CLI_GALLERY.md'

/**
 * Generates a Markdown gallery from CLI snapshots.
 */
function generate() {
	if (!fs.existsSync(SNAPSHOT_DIR)) {
		console.error('❌ Snapshot directory not found:', SNAPSHOT_DIR)
		process.exit(1)
	}

	const files = fs.readdirSync(SNAPSHOT_DIR).filter((f) => f.endsWith('.txt'))

	let gallery = '# Галерея Інтерфейсів (Snapshots Gallery)\n\n'
	gallery +=
		'Цей файл генерується автоматично. Тут зібрані всі еталонні зліпки екранів.\n'
	gallery +=
		'**Як коментувати:** Пишіть коментарі під будь-яким екраном (розділ 💬 Коментарі), і розробник/ШІ їх врахує.\n\n'

	for (const file of files) {
		const name = file.replace('.txt', '').toUpperCase()
		const content = fs.readFileSync(path.join(SNAPSHOT_DIR, file), 'utf8')

		gallery += '---\n\n'
		gallery += `## 🖥 Екран: \`${name}\` (\`${file}\`)\n\n`
		gallery += '```text\n'
		gallery += content + '\n'
		gallery += '```\n\n'
		gallery += `> **💬 Коментарі щодо ${name}:**\n`
		gallery +=
			'> *(напишіть тут що змінити: кольори, відступи, тексти, логіку)*\n\n'
	}

	fs.writeFileSync(OUTPUT_FILE, gallery, 'utf8')
	console.log(`✅ Gallery updated: ${OUTPUT_FILE} (${files.length} snapshots)`)
}

generate()
