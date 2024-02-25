export const generateKey = async (password: string) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("a unique salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const encrypt = async (text: string, password: string) => {
  const key = await generateKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text),
  );
  return { ciphertext: encrypted, iv: iv };
};

export const decrypt = async (
  ciphertext: Uint8Array,
  iv: Uint8Array,
  password: string,
) => {
  const key = await generateKey(password);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
};
