import crypto from "crypto";

export function sha256(data) {
  return crypto.createHash("sha256").update(data).digest();
}

export function uniqueRid() {
  return Math.floor(Math.random() * 10e12);
}

export function validateRid(decryptedData, rid) {
  if (decryptedData.rid !== rid) {
    throw new Error("RequestID mismatch");
  }
  return decryptedData;
}

export function decrypt(data, ivKey) {
  const iv = ivKey.slice(0, ivKey.length / 2);
  const key = ivKey.slice(ivKey.length / 2, ivKey.length);
  const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  return Buffer.concat([cipher.update(data, "base64"), cipher.final()]).toString();
}

export function createEncryptionToken(oldTokenBuff, updateToken) {
  const updateTokenBuff = Buffer.from(updateToken, "hex");
  const mergedBuffer = Buffer.concat([oldTokenBuff, updateTokenBuff], oldTokenBuff.length + updateTokenBuff.length);
  return sha256(mergedBuffer);
}

export function encrypt(data, ivKey) {
  if (typeof data !== "string") {
    throw new Error("data no es un string");
  }
  if (!(ivKey instanceof Buffer)) {
    throw new Error("ivKey no es un buffer");
  }
  if (ivKey.length !== 32) {
    throw new Error("ivKey tiene que tener tamaño 32");
  }
  const stringIVKey = ivKey.toString("hex");
  const stringIV = stringIVKey.substring(0, stringIVKey.length / 2);
  const stringKey = stringIVKey.substring(stringIVKey.length / 2, stringIVKey.length);
  const iv = Buffer.from(stringIV, "hex");
  const key = Buffer.from(stringKey, "hex");
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  return cipher.update(data, "utf8", "base64") + cipher.final("base64");
}
