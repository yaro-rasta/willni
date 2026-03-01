import {
  generateKeyPair,
  createPacket,
  verifyPacket,
  Registry,
} from "./index.js";
import naclUtil from "tweetnacl-util";
const { encodeBase64 } = naclUtil;

console.log("═══════════════════════════════════════════");
console.log("  📦 Sovereign Sync — Benchmark (CBOR + gzip)");
console.log("═══════════════════════════════════════════\n");

const yaras = generateKeyPair();
const noize = generateKeyPair();

// --- 1. sync/announce ---
console.log("▸ sync/announce");
const announce = createPacket(
  "sync/announce",
  {
    node_id: "ipfs://ipns/yaras_love",
    registry_version: 7,
    registry_cid: "QmXyz123456789abcdef",
  },
  yaras.secretKey,
);

printStats(announce);

// --- 2. diff/request ---
console.log("▸ diff/request");
const diffReq = createPacket(
  "diff/request",
  {
    node_id: "ipfs://ipns/noize_mc",
    my_version: 5,
    your_version: 7,
  },
  noize.secretKey,
);

printStats(diffReq);

// --- 3. diff/response (2 cases) ---
console.log("▸ diff/response (2 справи)");
const diffRes = createPacket(
  "diff/response",
  {
    from_version: 5,
    to_version: 7,
    changes: [
      {
        action: "add",
        case_id: "CASE-APPLE-TOS",
        cid: "QmApple123456789abcdef",
      },
      {
        action: "add",
        case_id: "CASE-BLOCKPOST-TCC",
        cid: "QmBlock123456789abcdef",
      },
    ],
  },
  yaras.secretKey,
);

printStats(diffRes);

// --- 4. vote/cast ---
console.log("▸ vote/cast");
const vote = createPacket(
  "vote/cast",
  {
    case_id: "CASE-APPLE-TOS",
    opinion: "ТАК — Акт Тиранії",
    voter_id: "ipfs://ipns/noize_mc",
  },
  noize.secretKey,
);

printStats(vote);

// --- 5. peer/join ---
console.log("▸ peer/join");
const join = createPacket(
  "peer/join",
  {
    node_id: "ipfs://ipns/oxxxymiron",
    name: "Oxxxymiron",
    public_key: encodeBase64(noize.publicKey),
    invited_by: "ipfs://ipns/yaras_love",
  },
  noize.secretKey,
);

printStats(join);

// --- 6. Верифікація ---
console.log("═══════════════════════════════════════════");
console.log("  🔐 Верифікація підпису");
console.log("═══════════════════════════════════════════\n");

const result = verifyPacket(announce.raw, yaras.publicKey);
console.log(`  Валідний підпис: ${result.valid ? "✅ ТАК" : "❌ НІ"}`);
console.log(`  Тип: ${result.packet.type}`);
console.log(`  Вузол: ${result.packet.node_id}\n`);

// Підроблений ключ
const fake = generateKeyPair();
const fakeResult = verifyPacket(announce.raw, fake.publicKey);
console.log(
  `  Фейковий ключ: ${fakeResult.valid ? "❌ ЗЛАМАНО" : "✅ Відхилено"}\n`,
);

// --- 7. Порівняльна таблиця ---
console.log("═══════════════════════════════════════════");
console.log("  📊 Порівняльна Таблиця Ефективності");
console.log("═══════════════════════════════════════════\n");
console.log(
  "  Тип пакету       │ JSON  │ CBOR  │ gzip  │ Конверт │ LoRa 300bps",
);
console.log(
  "  ─────────────────┼───────┼───────┼───────┼─────────┼────────────",
);

const packets = [
  ["sync/announce  ", announce],
  ["diff/request   ", diffReq],
  ["diff/response  ", diffRes],
  ["vote/cast      ", vote],
  ["peer/join      ", join],
];

for (const [name, p] of packets) {
  const s = p.stats;
  console.log(
    `  ${name} │ ${pad(s.jsonSize)}B │ ${pad(s.cborSize)}B │ ${pad(s.gzipSize)}B │ ${pad(s.envelopeSize)}B   │ ${s.transmitTime300bps}`,
  );
}

console.log("");

function pad(n) {
  return String(n).padStart(4);
}

function printStats(result) {
  const s = result.stats;
  console.log(
    `  JSON: ${s.jsonSize}B → CBOR: ${s.cborSize}B → gzip: ${s.gzipSize}B → Конверт: ${s.envelopeSize}B`,
  );
  console.log(
    `  Стиснення: ${(s.compressionRatio * 100).toFixed(0)}% | Час передачі LoRa: ${s.transmitTime300bps}`,
  );
  console.log("");
}
