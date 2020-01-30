const addressFromPublicKeyHashElement = document.getElementById('address-from-pkhash');
const addressInputElement = document.getElementById('address-input');
const addressInterpretedElement = document.getElementById('address-interpreted');
const base58CheckFromHexInputElement = document.getElementById('base58check-hex');
const base58CheckFromHexOutputElement = document.getElementById('base58check-from-hex');
const encodedPublicKeyHashOutputElement = document.getElementById('encoded-pkhash-from-address');
const publicKeyHashInputElement = document.getElementById('pkhash');
const reversedOutputElement = document.getElementById('reversed');
const reverseInputElement = document.getElementById('reverse');
const xpubFromDbElement = document.getElementById('xpub-from-db-hex');
const xpubFromDbInput = document.getElementById('xpub-db-hex');

const b58ch = bsv.encoding.Base58Check;

function reverseHex(hex) {
  const trimmed = trimQuotes(hex);
  const len = trimmed.length;

  let bytes = [];
  let i;
  for(i = 0; i < len; i += 2) {
    const byte = trimmed.slice(i, i + 2);
    bytes.push(byte);
  }
  bytes.reverse();
  const reversed = bytes.join("");
  return reversed;
}

function trimQuotes(s) {
  if (s.startsWith('"')) {
    s = s.slice(1);
  }

  if (s.endsWith('"')) {
    s = s.slice(0, -1);
  }

  return s;
}

addressInputElement.addEventListener("input", function onPublicKeyHashInput(event) {
  const content = event.target.value;
  const trimmed = trimQuotes(content);

  const buf = bsv.encoding.Base58Check.fromString(trimmed).toBuffer();
  const str = buf.toString('hex');
  if (str.length <= 2) {
    encodedPublicKeyHashOutputElement.innerText = "Not long enough."
    return;
  }
  const withoutPrefix = str.substring(2);

  // PKH
  const encoded = '20' + withoutPrefix;
  encodedPublicKeyHashOutputElement.innerText = encoded;
});

base58CheckFromHexInputElement.addEventListener("input", function onBase58CheckInput(event) {
  const content = event.target.value;
  try {
    const b = bsv.encoding.Base58Check.fromHex(content);
    const encoded = b.toString();
    base58CheckFromHexOutputElement.innerText = encoded;
  } catch (e) {
    base58CheckFromHexOutputElement.innerText = "Error: " + e;
  }
});

publicKeyHashInputElement.addEventListener("input", function onPublicKeyHashInput(event) {
  const content = event.target.value;
  let trimmed = trimQuotes(content);

  let interpreted = "";
  // Remove leading type indicator
  if (trimmed.length === 42 && trimmed.startsWith("20")) {
    trimmed = trimmed.slice(2);
    interpreted = `20 ${trimmed}`;
  }

  // Handle full P2PKH locking script, ie 76a914c002c97c1c86d9f243bb03c647bc6492dc12bc7688ac
  if (trimmed.length === 50 && trimmed.startsWith("76a914") && trimmed.endsWith("88ac")) {
    trimmed = trimmed.slice(6, -4);
    interpreted = `76 a9 14 ${trimmed} 88 ac`;
  }

  if (trimmed.length === 40) {
    console.log("bsv:", bsv);
    const prefixed = "00" + trimmed;
    const b = bsv.encoding.Base58Check.fromHex(prefixed);
    const addr = b.toString();
    addressFromPublicKeyHashElement.innerHTML = `<a href="https://whatsonchain.com/address/${addr}" target="_blank">${addr}</a>`;
  } else {
    addressFromPublicKeyHashElement.innerText = `Input is not 40 characters (${content.length}), or full P2PKH locking script.`;
  }

  addressInterpretedElement.innerText = interpreted;
});

reverseInputElement.addEventListener("input", function onReverseInput(event) {
  const content = event.target.value;
  if (content.length % 2 === 0) {
    const reversed = reverseHex(content);
    if (reversed.length === 64) { // Treat as txid
      const txid = reversed;
      reversedOutputElement.innerHTML = `<a href="https://whatsonchain.com/tx/${txid}" target="_blank">${txid}</a>`;
    } else {
      reversedOutputElement.innerText = reversed;
    }
  } else {
    reversedOutputElement.innerText = `Input is not an even number of characters. (${content.length})`;
  }
});

xpubFromDbInput.addEventListener("input", function onXpubFromDbInput(event) {
  const content = event.target.value;
  const VALID_LENGTH = 152;

  if (content.length !== VALID_LENGTH) {
    xpubFromDbElement.innerText = `Not ${VALID_LENGTH} characters long, is ${content.length}.`;
    return
  }

  xpubHex = '0488B21E' + content.slice(4);

  try {
    const b = bsv.encoding.Base58Check.fromHex(xpubHex);
    const encoded = b.toString();
    xpubFromDbElement.innerText = encoded;
  } catch (e) {
    xpubFromDbElement.innerText = "Error: " + e;
  }
});