const addressFromPublicKeyHashElement = document.getElementById('address-from-pkhash');
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

publicKeyHashInputElement.addEventListener("input", function onPublicKeyHashInput(event) {
  const content = event.target.value;
  if (content.length === 40) {
    console.log("bsv:", bsv);
    const b = bsv.encoding.Base58Check.fromHex(prefixed);
    const addr = b.toString();
    addressFromPublicKeyHashElement.innerText = addr;
  } else {
    addressFromPublicKeyHashElement.innerText = `Input is not 40 characters. (${content.length})`;
  }
});

reverseInputElement.addEventListener("input", function onReverseInput(event) {
  const content = event.target.value;
  console.log("On reverse input.", content);
  if (content.length % 2 === 0) {
    const reversed = reverseHex(content);
    reversedOutputElement.innerText = reversed;
  } else {
    reversedOutputElement.innerText = `Input is not an even number of characters. (${content.length})`;
  }
});

