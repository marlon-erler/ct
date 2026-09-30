import cryptoRandomString from "crypto-random-string";

const IV_SIZE = 12;
const ENCRYPTION_ALG = "AES-GCM";

// random
export function random(length: number): string {
    return cryptoRandomString({ length });
}

// encrypt
export async function encryptString(
    plaintext: string,
    passphrase: string,
): Promise<string> {
    if (!window.crypto.subtle) return plaintext;

    const iv = generateIV();
    const key = await importKey(passphrase, "encrypt");
    const encryptedArray = await encrypt(iv, key, plaintext);

    const encryptionData = {
        iv: uInt8ToArray(iv),
        encryptedArray: uInt8ToArray(encryptedArray),
    };
    return btoa(JSON.stringify(encryptionData));
}

export async function decryptString(
    cyphertext: string,
    passphrase: string,
): Promise<string> {
    try {
        const encrypionData = JSON.parse(atob(cyphertext));
        const iv = arrayToUint8(encrypionData.iv);
        const encryptedArray = arrayToUint8(encrypionData.encryptedArray);

        const key = await importKey(passphrase, "decrypt");
        return await decrypt(iv, key, encryptedArray);
    } catch {
        return cyphertext;
    }
}

// process
function encode(string: string): Uint8Array {
    return new TextEncoder().encode(string);
}

function decode(array: Uint8Array): string {
    return new TextDecoder("utf-8").decode(array);
}

async function encrypt(
    iv: Uint8Array,
    key: CryptoKey,
    message: string,
): Promise<Uint8Array> {
    const arrayBuffer = await window.crypto.subtle.encrypt(
        { name: ENCRYPTION_ALG, iv },
        key,
        encode(message),
    );
    return new Uint8Array(arrayBuffer);
}

async function decrypt(
    iv: Uint8Array,
    key: CryptoKey,
    cyphertext: Uint8Array,
): Promise<string> {
    const arrayBuffer = await crypto.subtle.decrypt(
        { name: ENCRYPTION_ALG, iv },
        key,
        cyphertext,
    );
    return arrayBufferToString(arrayBuffer);
}

async function hash(encoded: Uint8Array): Promise<ArrayBuffer> {
    return await crypto.subtle.digest("SHA-256", encoded);
}

// iv
function generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(IV_SIZE));
}

function splitMergedString(mergedString: string): [Uint8Array, string] {
    const iv = mergedString.slice(0, IV_SIZE);
    const encryptedString = mergedString.slice(IV_SIZE);

    return [JSON.parse(iv), encryptedString];
}

// key
async function importKey(
    passphrase: string,
    purpose: "encrypt" | "decrypt",
): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
        "raw",
        await hash(encode(passphrase)),
        { name: ENCRYPTION_ALG },
        false,
        [purpose],
    );
}

// conversion
function arrayBufferToString(arrayBuffer: ArrayBuffer): string {
    const uInt8Array = new Uint8Array(arrayBuffer);
    return decode(uInt8Array);
}

function uInt8ToArray(uInt8Array: Uint8Array): number[] {
    return Array.from(uInt8Array);
}

function arrayToUint8(array: number[]): Uint8Array {
    return new Uint8Array(array);
}
