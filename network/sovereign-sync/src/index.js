import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
const { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } = naclUtil;
import { Encoder, Decoder } from "cbor-x";
import { gzipSync, gunzipSync } from "node:zlib";

const cborEncoder = new Encoder({ structuredClone: true });
const cborDecoder = new Decoder();

/**
 * Генерує пару ключів Ed25519 для Суверена
 * @returns {{ publicKey: Uint8Array, secretKey: Uint8Array }}
 */
export function generateKeyPair() {
  return nacl.sign.keyPair();
}

/**
 * Створює підписаний пакет з типізацією domain/action
 * @param {string} type - Тип пакету (sync/announce, diff/request, diff/response, vote/cast, peer/join)
 * @param {object} payload - Дані пакету
 * @param {Uint8Array} secretKey - Приватний ключ підписувача
 * @returns {{ raw: Uint8Array, packet: object, stats: object }}
 */
export function createPacket(type, payload, secretKey) {
  const packet = {
    type,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  // 1. Серіалізуємо у CBOR
  const cborData = cborEncoder.encode(packet);

  // 2. Стискаємо gzip
  const gzipped = gzipSync(cborData);

  // 3. Підписуємо стиснений блок
  const signature = nacl.sign.detached(gzipped, secretKey);

  // 4. Фінальний конверт: signature + gzipped_cbor
  const envelope = {
    sig: encodeBase64(signature),
    data: encodeBase64(gzipped),
  };

  const envelopeCbor = cborEncoder.encode(envelope);

  const stats = {
    jsonSize: Buffer.byteLength(JSON.stringify(packet)),
    cborSize: cborData.length,
    gzipSize: gzipped.length,
    envelopeSize: envelopeCbor.length,
    compressionRatio: (
      1 -
      gzipped.length / Buffer.byteLength(JSON.stringify(packet))
    ).toFixed(2),
    transmitTime300bps: ((envelopeCbor.length * 8) / 300).toFixed(1) + "s",
  };

  return { raw: envelopeCbor, packet, stats };
}

/**
 * Верифікує та декодує отриманий пакет
 * @param {Uint8Array} envelopeCbor - Отриманий конверт
 * @param {Uint8Array} publicKey - Публічний ключ автора
 * @returns {{ valid: boolean, packet: object|null }}
 */
export function verifyPacket(envelopeCbor, publicKey) {
  const envelope = cborDecoder.decode(envelopeCbor);
  const signature = decodeBase64(envelope.sig);
  const gzipped = decodeBase64(envelope.data);

  // Верифікуємо підпис
  const valid = nacl.sign.detached.verify(gzipped, signature, publicKey);
  if (!valid) return { valid: false, packet: null };

  // Розпаковуємо
  const cborData = gunzipSync(gzipped);
  const packet = cborDecoder.decode(cborData);

  return { valid: true, packet };
}

/**
 * Registry — Реєстр Суверена
 */
export class Registry {
  constructor(nodeId, name) {
    this.meta = {
      version: 0,
      node_id: nodeId,
      name,
      protocol: "MovaNaMiru_v1.0.0",
      updated: new Date().toISOString(),
    };
    this.cases = [];
    this.peers = [];
    this.votes = [];
    this.broadcasts = [];
  }

  /**
   * Додає справу до реєстру
   */
  addCase(id, cid, status = "pending") {
    this.cases.push({ id, cid, status, added: new Date().toISOString() });
    this.meta.version++;
    this.meta.updated = new Date().toISOString();
    return this;
  }

  /**
   * Додає піра (друга) до кола довіри
   */
  addPeer(id, name, publicKey) {
    this.peers.push({
      id,
      name,
      public_key: encodeBase64(publicKey),
      joined: new Date().toISOString(),
    });
    return this;
  }

  /**
   * Генерує sync/announce пакет
   */
  createAnnounce(secretKey) {
    return createPacket(
      "sync/announce",
      {
        node_id: this.meta.node_id,
        registry_version: this.meta.version,
        registry_cid: "Qm" + encodeBase64(new Uint8Array(8)).slice(0, 16),
      },
      secretKey,
    );
  }

  /**
   * Генерує diff/request пакет
   */
  createDiffRequest(targetVersion, secretKey) {
    return createPacket(
      "diff/request",
      {
        node_id: this.meta.node_id,
        my_version: this.meta.version,
        your_version: targetVersion,
      },
      secretKey,
    );
  }

  /**
   * Генерує diff/response пакет на основі змін між версіями
   */
  createDiffResponse(fromVersion, secretKey) {
    const changes = this.cases
      .filter((_, i) => i >= fromVersion)
      .map((c) => ({ action: "add", case_id: c.id, cid: c.cid }));

    return createPacket(
      "diff/response",
      {
        from_version: fromVersion,
        to_version: this.meta.version,
        changes,
      },
      secretKey,
    );
  }

  /**
   * Генерує vote/cast пакет
   */
  createVote(caseId, opinion, secretKey) {
    return createPacket(
      "vote/cast",
      {
        case_id: caseId,
        opinion,
        voter_id: this.meta.node_id,
      },
      secretKey,
    );
  }

  /**
   * Застосовує diff/response до Свого реєстру
   */
  applyDiff(diffPacket) {
    for (const change of diffPacket.changes) {
      if (change.action === "add") {
        const exists = this.cases.find((c) => c.id === change.case_id);
        if (!exists) {
          this.cases.push({
            id: change.case_id,
            cid: change.cid,
            status: "synced",
            added: new Date().toISOString(),
          });
          this.meta.version++;
        }
      }
    }
    this.meta.updated = new Date().toISOString();
    return this;
  }

  toJSON() {
    return {
      meta: this.meta,
      cases: this.cases,
      peers: this.peers,
      votes: this.votes,
      broadcasts: this.broadcasts,
    };
  }
}
