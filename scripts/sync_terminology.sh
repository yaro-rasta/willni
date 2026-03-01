#!/bin/bash

# Скрипт для синхронізації термінології у розділі superintellect
# Відповідно до правопису з system.md

DIR="/Users/yaro/i/src/apps/willni/superintellect"
BACKUP_DIR="/Users/yaro/i/src/apps/willni/superintellect.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔄 Синхронізація термінології Will-n-i"
echo "========================================="
echo ""

# 1. Створити бекап
echo "📦 Створюю резервну копію..."
cp -r "$DIR" "$BACKUP_DIR"
echo "✅ Бекап створено: $BACKUP_DIR"
echo ""

# 2. Знайти всі .md файли
echo "🔍 Пошук markdown файлів..."
FILES=$(find "$DIR" -name "*.md" -type f)
FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "✅ Знайдено файлів: $FILE_COUNT"
echo ""

# 3. Виконати заміни
echo "✏️  Виконую термінологічні заміни..."
echo ""

# Лічильники
COUNTER_MI=0
COUNTER_VI=0
COUNTER_AI=0

# Заміна "Ми" → "мИ" (враховуючи контекст)
echo "  • Заміна 'Ми' → 'мИ'..."
for file in $FILES; do
    # Пропускаємо файли з технічною термінологією
    if [[ "$file" == *"PLATFORM_SPEC.md"* ]] || [[ "$file" == *"IMPLEMENTATION.md"* ]]; then
        echo "    ⏭  Пропускаю (технічний): $(basename $file)"
        continue
    fi

    CHANGES=0

    # Заміна на початку речення
    if grep -q "^Ми " "$file" 2>/dev/null; then
        COUNT=$(grep -c "^Ми " "$file")
        sed -i '' 's/^Ми /мИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна після крапки
    if grep -q "\. Ми " "$file" 2>/dev/null; then
        COUNT=$(grep -c "\. Ми " "$file")
        sed -i '' 's/\. Ми /. мИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна в лапках
    if grep -q '"Ми ' "$file" 2>/dev/null; then
        COUNT=$(grep -c '"Ми ' "$file")
        sed -i '' 's/"Ми /"мИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна в дефісі (наприклад "- Ми")
    if grep -q "- Ми " "$file" 2>/dev/null; then
        COUNT=$(grep -c "- Ми " "$file")
        sed -i '' 's/- Ми /- мИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    if [ "$CHANGES" -gt 0 ]; then
        COUNTER_MI=$((COUNTER_MI + CHANGES))
        echo "    ✓ $(basename $file): $CHANGES замін"
    fi
done

echo ""

# Заміна "Ви" → "вИ"
echo "  • Заміна 'Ви' → 'вИ'..."
for file in $FILES; do
    if [[ "$file" == *"PLATFORM_SPEC.md"* ]] || [[ "$file" == *"IMPLEMENTATION.md"* ]]; then
        continue
    fi

    CHANGES=0

    # Заміна на початку речення
    if grep -q "^Ви " "$file" 2>/dev/null; then
        COUNT=$(grep -c "^Ви " "$file")
        sed -i '' 's/^Ви /вИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна після крапки
    if grep -q "\. Ви " "$file" 2>/dev/null; then
        COUNT=$(grep -c "\. Ви " "$file")
        sed -i '' 's/\. Ви /. вИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна в лапках
    if grep -q '"Ви ' "$file" 2>/dev/null; then
        COUNT=$(grep -c '"Ви ' "$file")
        sed -i '' 's/"Ви /"вИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна в дефісі
    if grep -q "- Ви " "$file" 2>/dev/null; then
        COUNT=$(grep -c "- Ви " "$file")
        sed -i '' 's/- Ви /- вИ /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    if [ "$CHANGES" -gt 0 ]; then
        COUNTER_VI=$((COUNTER_VI + CHANGES))
        echo "    ✓ $(basename $file): $CHANGES замін"
    fi
done

echo ""

# Заміна "AI" → "Ші" (обережно, тільки в контексті)
echo "  • Заміна 'AI' → 'Ші' (контекстуально)..."
for file in $FILES; do
    # Пропускаємо технічні файли
    if [[ "$file" == *"PLATFORM_SPEC.md"* ]] || [[ "$file" == *"IMPLEMENTATION.md"* ]] || [[ "$file" == *"TOKENOMICS.md"* ]]; then
        echo "    ⏭  Пропускаю (технічний): $(basename $file)"
        continue
    fi

    CHANGES=0

    # Заміна "AI " → "Ші " (з пробілом після)
    if grep -q " AI " "$file" 2>/dev/null; then
        COUNT=$(grep -c " AI " "$file")
        sed -i '' 's/ AI / Ші /g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    # Заміна "(AI)" → "(Ші)"
    if grep -q "(AI)" "$file" 2>/dev/null; then
        COUNT=$(grep -c "(AI)" "$file")
        sed -i '' 's/(AI)/(Ші)/g' "$file"
        CHANGES=$((CHANGES + COUNT))
    fi

    if [ "$CHANGES" -gt 0 ]; then
        COUNTER_AI=$((COUNTER_AI + CHANGES))
        echo "    ✓ $(basename $file): $CHANGES замін"
    fi
done

echo ""

# Звіт
echo "========================================="
echo "📊 Результати:"
echo "  • 'Ми' → 'мИ': $COUNTER_MI замін"
echo "  • 'Ви' → 'вИ': $COUNTER_VI замін"
echo "  • 'AI' → 'Ші': $COUNTER_AI замін"
echo ""
echo "✅ Синхронізація завершена!"
echo ""
echo "ℹ️  Резервна копія: $BACKUP_DIR"
echo "ℹ️  Перевір результат перед комітом!"
echo ""
