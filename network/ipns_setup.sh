#!/bin/bash

# Скрипт для ініціалізації Суверенного IPNS-вузла
# Протокол: МОВА_НА_МІРУ

set -e

KEY_NAME="yaras_love"
CONTENT_PATH="./public" # Шлях до твого сайту/реєстру

echo "--- Ініціалізація Суверенного Вузла ---"

# 1. Створення ключа, якщо його не існує
if ! ipfs key list | grep -q "$KEY_NAME"; then
    echo "Створення нового IPNS ключа: $KEY_NAME..."
    ipfs key gen --type=ed25519 --size=2048 "$KEY_NAME"
else
    echo "Ключ $KEY_NAME вже існує."
fi

# 2. Отримання PeerID / Key ID
KEY_ID=$(ipfs key list -l | grep "$KEY_NAME" | awk '{print $1}')
echo "Твій Суверенний IPNS ID: $KEY_ID"
echo "Це посилання буде вічним: ipfs://ipns/$KEY_ID"

# 3. Завантаження контенту в IPFS
echo "Завантаження контенту в IPFS..."
CID=$(ipfs add -r -Q "$CONTENT_PATH")
echo "Новий CID: $CID"

# 4. Публікація CID на IPNS ключ
echo "Публікація на IPNS (це може зайняти хвилину)..."
ipfs name publish --key="$KEY_NAME" "/ipfs/$CID"

echo "--- Успіх ---"
echo "Сайт доступний за адресою: https://gateway.ipfs.io/ipns/$KEY_ID"
echo "Підключи DNSLink для yaras.love до цього ключа."
