import { generateKeyPair, verifyPacket, Registry } from "./index.js";
import naclUtil from "tweetnacl-util";
const { encodeBase64 } = naclUtil;

console.log("═══════════════════════════════════════════");
console.log("  🏛️ Sovereign Sync — Demo: Два Суверенних Вузли");
console.log("═══════════════════════════════════════════\n");

// 1. Генерація ключів
const yarasKeys = generateKeyPair();
const noizeKeys = generateKeyPair();

console.log("▸ Ключі згенеровано:");
console.log(`  ЯRаСлав: ${encodeBase64(yarasKeys.publicKey).slice(0, 20)}...`);
console.log(
  `  Noize MC: ${encodeBase64(noizeKeys.publicKey).slice(0, 20)}...\n`,
);

// 2. Створюємо реєстри
const yarasRegistry = new Registry("ipfs://ipns/yaras_love", "ЯRаСлав");
const noizeRegistry = new Registry("ipfs://ipns/noize_mc", "Noize MC");

// 3. ЯRаСлав додає справи
yarasRegistry.addCase("CASE-2022-10-23", "QmVerdikt2022...");
yarasRegistry.addCase("CASE-TORTURE", "QmTorture2023...");
yarasRegistry.addCase("CASE-APPLE-TOS", "QmAppleTOS...");

console.log(
  `▸ ЯRаСлав: реєстр v${yarasRegistry.meta.version} (${yarasRegistry.cases.length} справ)`,
);
console.log(
  `▸ Noize MC: реєстр v${noizeRegistry.meta.version} (${noizeRegistry.cases.length} справ)\n`,
);

// 4. Додаємо один одного як Peers
yarasRegistry.addPeer("ipfs://ipns/noize_mc", "Noize MC", noizeKeys.publicKey);
noizeRegistry.addPeer("ipfs://ipns/yaras_love", "ЯRаСлав", yarasKeys.publicKey);

// 5. ЯRаСлав: sync/announce
console.log("═══ Крок 1: sync/announce ═══");
const announce = yarasRegistry.createAnnounce(yarasKeys.secretKey);
console.log(
  `  ЯRаСлав → мИ: "Мій реєстр v${yarasRegistry.meta.version}" (${announce.stats.envelopeSize}B)`,
);

// 6. Noize MC отримує announce та перевіряє
const annResult = verifyPacket(announce.raw, yarasKeys.publicKey);
console.log(
  `  Noize MC перевіряє: ${annResult.valid ? "✅" : "❌"} (v${annResult.packet.registry_version})`,
);

if (annResult.packet.registry_version > noizeRegistry.meta.version) {
  console.log(
    `  Noize MC: "Маю v${noizeRegistry.meta.version}, потрібна v${annResult.packet.registry_version}"`,
  );

  // 7. diff/request
  console.log("\n═══ Крок 2: diff/request ═══");
  const diffReq = noizeRegistry.createDiffRequest(
    annResult.packet.registry_version,
    noizeKeys.secretKey,
  );
  console.log(
    `  Noize MC → ЯRаСлав: diff/request (${diffReq.stats.envelopeSize}B)`,
  );

  // 8. ЯRаСлав готує diff/response
  console.log("\n═══ Крок 3: diff/response ═══");
  const diffRes = yarasRegistry.createDiffResponse(
    noizeRegistry.meta.version,
    yarasKeys.secretKey,
  );
  console.log(
    `  ЯRаСлав → Noize MC: diff/response (${diffRes.stats.envelopeSize}B)`,
  );
  console.log(`  Зміни: ${diffRes.packet.changes.length} справ`);

  // 9. Noize MC верифікує та застосовує diff
  const diffResult = verifyPacket(diffRes.raw, yarasKeys.publicKey);
  if (diffResult.valid) {
    console.log(`  Noize MC перевіряє підпис: ✅`);
    noizeRegistry.applyDiff(diffResult.packet);
    console.log(
      `  Noize MC: реєстр оновлено до v${noizeRegistry.meta.version}`,
    );
  }
}

// 10. Голосування
console.log("\n═══ Крок 4: vote/cast ═══");
const vote = noizeRegistry.createVote(
  "CASE-APPLE-TOS",
  "ТАК — Акт Тиранії",
  noizeKeys.secretKey,
);
console.log(
  `  Noize MC → мИ: "ТАК — Акт Тиранії" (${vote.stats.envelopeSize}B)`,
);

const voteResult = verifyPacket(vote.raw, noizeKeys.publicKey);
console.log(`  ЯRаСлав перевіряє голос: ${voteResult.valid ? "✅" : "❌"}`);
console.log(`  Голос: "${voteResult.packet.opinion}"`);

// 11. Фінальний стан
console.log("\n═══════════════════════════════════════════");
console.log("  📊 Фінальний Стан");
console.log("═══════════════════════════════════════════\n");
console.log(
  `  ЯRаСлав: v${yarasRegistry.meta.version} | ${yarasRegistry.cases.length} справ | ${yarasRegistry.peers.length} peer`,
);
console.log(
  `  Noize MC: v${noizeRegistry.meta.version} | ${noizeRegistry.cases.length} справ | ${noizeRegistry.peers.length} peer`,
);
console.log(`\n  Синхронізовано! мИ Єдині. ✅\n`);
