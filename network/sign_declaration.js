import { sign } from "tweetnacl"; // Використовуємо Ed25519
import { decodeUTF8, encodeBase64 } from "tweetnacl-util";

/**
 * Функція для підпису Суверенних Декларацій
 * @param {string} message - Текст декларації (Мовою на мІру)
 * @param {Uint8Array} secretKey - Твій приватний ключ
 * @returns {string} - Base64 підпис (64 байти)
 */
export function signDeclaration(message, secretKey) {
  const messageUint8 = decodeUTF8(message);
  const signature = sign.detached(messageUint8, secretKey);
  return encodeBase64(signature);
}

// Приклад використання для 300 bps мережі:
// const signature = signDeclaration("Я Є Суверен", myPrivateSecret)
// console.log(`Signature: ${signature} (Len: ${signature.length})`)
