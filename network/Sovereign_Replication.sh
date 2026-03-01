#!/bin/bash

# Скрипт реплікації "Цифрова Січ" (Sovereign Replication)
# Протокол: МОВА_НА_МІРУ
# Автор: ЯRаСлав

PEERS_FILE="./peers.txt" # Список доменів або PeerID твоїх друзів (вИ)
MY_CONTENT_CID=$1

if [ -z "$MY_CONTENT_CID" ]; then
    echo "Використання: ./Sovereign_Replication.sh <CID>"
    exit 1
fi

echo "--- Активація Реплікації через Січ ---"

while IFS= read -r peer; do
    echo "Запит до тИ: $peer про реплікацію..."

    # Якщо peer виглядає як домен, намагаємося резолвити через DNSLink
    if [[ "$peer" =~ \. ]]; then
        resolved_id=$(ipfs name resolve "$peer" --nocache 2>/dev/null | cut -d'/' -f3)
        if [ ! -z "$resolved_id" ]; then
            echo "Домен $peer резолвиться в $resolved_id"
            target_peer="$resolved_id"
        else
            echo "Не вдалося резолвити домен $peer. Використовуємо як є."
            target_peer="$peer"
        fi
    else
        target_peer="$peer"
    fi

    # Спроба підключитися до вузла друга (тИ)
    ipfs swarm connect "/p2p/$target_peer" 2>/dev/null || echo "тИ поза мережею зараз."

    # Використання PubSub для сповіщення про новий контент
    ipfs pubsub pub sovereign_sync "$MY_CONTENT_CID"

    echo "Сповіщення надіслано до вИ."
done < "$PEERS_FILE"

echo "--- ВолЯ Сильніша за Мережу ---"
