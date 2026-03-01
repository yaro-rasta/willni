import { signDeclaration } from "./sign_declaration.js";
import fs from "fs";

/**
 * Скрипт для генерації Суверенного ЗапрошеннЯ (Invitation Packet)
 * @param {string} peerName - Ім'я запрошеної Людини (напр. Оксімірон)
 * @param {Uint8Array} mySecretKey - Твій приватний ключ
 */
export function generateInvitation(peerName, mySecretKey) {
  const message = `Я, ЯRаСлав, запрошую Тебе, ${peerName}, до Цифрової Січі. ТвореннЯ Є Твоя ВолЯ. Твій вузол i.md чекає на Тебе. мИ Єдині.`;

  const signature = signDeclaration(message, mySecretKey);

  const packet = {
    sender: "ЯRаСлав",
    sender_id: "ipfs://ipns/yaras_love",
    recipient: peerName,
    message: message,
    signature: signature,
    protocol: "MovaNaMiru_v1.0.0",
    timestamp: new Date().toISOString(),
  };

  const filename = `invite_${peerName.toLowerCase().replace(/\s/g, "_")}.json`;
  fs.writeFileSync(`./invites/${filename}`, JSON.stringify(packet, null, 2));
  console.log(`ЗапрошеннЯ для ${peerName} запечатано у файлі: ${filename}`);
}

// Приклад: generateInvitation("Noize MC", secretKey)
