const addressFromPublicKeyHashElement = document.getElementById('address-from-pkhash');
const base58CheckFromHexInputElement = document.getElementById('base58check-hex');
const base58CheckFromHexOutputElement = document.getElementById('base58check-from-hex');
const publicKeyHashInputElement = document.getElementById('pkhash');
const reversedOutputElement = document.getElementById('reversed');
const reverseInputElement = document.getElementById('reverse');

const b58ch = bsv.encoding.Base58Check;

function reverseHex(hex) {
  const len = hex.length;

  let bytes = [];
  let i;
  for(i = 0; i < len; i += 2) {
    const byte = hex.slice(i, i + 2);
    bytes.push(byte);
  }
  bytes.reverse();
  const reversed = bytes.join("");
  return reversed;
}

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
  if (content.length === 40) {
    console.log("bsv:", bsv);
    const prefixed = "00" + content;
    const b = bsv.encoding.Base58Check.fromHex(prefixed);
    const addr = b.toString();
    addressFromPublicKeyHashElement.innerText = addr;
  } else {
    addressFromPublicKeyHashElement.innerText = `Input is not 40 characters. (${content.length})`;
  }
});

reverseInputElement.addEventListener("input", function onReverseInput(event) {
  const content = event.target.value;
  if (content.length % 2 === 0) {
    const reversed = reverseHex(content);
    reversedOutputElement.innerText = reversed;
  } else {
    reversedOutputElement.innerText = `Input is not an even number of characters. (${content.length})`;
  }
});

