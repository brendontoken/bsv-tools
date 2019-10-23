"use strict";
const sampleButton = document.getElementById('sample');
const txDecodedElement = document.getElementById('tx-decoded');
const txInputElement = document.getElementById('tx-input');

const b58ch = bsv.encoding.Base58Check;

const sampleTx = "0200000002aa925d16dfaa731f8ce7b09517b443c486374b3691e1f41128d9f682c434ce87000000006a47304402201d98763aae4206f1211020fa3a3744e758425ea1c7ee80574ac10742b8f3e1c902201b340d1a33e65e4f1d14bf7ff42da070da734c80891947559ea7bc2fa67f741c41210372506b7c3e6965e959f1bba50f6df46601fc5e34f0e5ba8d50a711c9797d1ae5ffffffffb2684cf1c88febd3ba2661f71e052bcc9fa67ccc0c0cd8770ed6b0e8b898c8d80100000069463043022021ecbbc769329055377dc0df56bf1cebfdd31ef54d6a73dc759988198129d257021f4cce425635bd47ea19ffd7fa7f144ce3b1a65313f3b38b99c348cf5eb050ac4121039d675257b7ea4d3e97bab93d80050a2202dee3fb31cf9b3ca6a91d998bbb074bffffffff03e8030000000000001976a91469cd66052e7e85b4eb1d8c51efc3475bc9d5cc3c88ac000000000000000031006a02bd000e746573742e746f6b656e697a6564041a024d311712010018ec07220f0a0d547565736461792031313a353744080000000000001976a914519f1998edb2d5fa2d187bee59ac078e4a43e95088ac00000000";

function addDecodedRow(txPortion, decoded, showTopSeparator, isAHeading, showIntermedieateTopSeparator) {
  const row = document.createElement("tr");
  const txCell = document.createElement("td");
  const decodedCell = document.createElement("td")
  const txDiv = document.createElement("div")


  txDiv.className = "monospace";
  txDiv.innerText = txPortion;
  txDiv.style = "width: 50vw; overflow-wrap: break-word";
  decodedCell.innerHTML = decoded;
  if (showTopSeparator) {
    row.style = "border-top: 1px solid lightgrey"
  }
  if (showIntermedieateTopSeparator) {
    row.style = "border-top: 1px dashed lightgrey"
  }
  if (isAHeading) {
    decodedCell.style = "font-weight: bold"
  }

  txCell.appendChild(txDiv);
  row.appendChild(txCell);
  row.appendChild(decodedCell);
  txDecodedElement.appendChild(row);
}

function clearDecodedResults() {
  while (txDecodedElement.firstChild) {
    txDecodedElement.removeChild(txDecodedElement.firstChild)
  }
}

function decodeLockingScript(hex) {
  if (hex.length != 50) {
    return "";
  }

  if (hex.startsWith("76a914") && hex.endsWith("88ac")) { // P2PKH
    const pkh = hex.slice(6, 46);
    const prefixed = "00" + pkh;
    const b = bsv.encoding.Base58Check.fromHex(prefixed);
    const address = b.toString()
    return `Address: ${address}`;
  }

  return "";
}

function decodeHexToString(hex) {
  const hexLen = hex.length;
  const hexLenHalf = hexLen * 0.5;
  let s = [];
  for (let i = 0; i < hexLenHalf; i++) {
    const numberRaw = hex.slice(i * 2, i *2 + 2);
    const number = Number.parseInt(numberRaw, 16);
    const character = String.fromCharCode(number);
    s.push(character);
  }

  return s.join("");
}

function decodeTx(tx) {
  clearDecodedResults();
  const nVersionRaw = tx.slice(0, 8);
  console.log(`${nVersionRaw}          nVersion`);
  addDecodedRow(`${nVersionRaw}`, "nVersion");

  const vinRaw = tx.slice(8, 10);
  const vin = Number.parseInt(vinRaw, 16);
  console.log(`${vinRaw}                vin (# inputs: ${vin})`);
  addDecodedRow(`${vinRaw}`, `vin (# inputs: ${vin})`);
  
  let cursor = 10;
  let i;
  for (i = 0; i < vin; i++) {
    console.log(`----------------  Input ${i}`);
    addDecodedRow("", `Input ${i}`, true, true);
    const txidRaw = tx.slice(cursor, cursor + 64);
    const txid = reverseHex(txidRaw);
    console.log(`${txidRaw}  txid: ${txid}`)
    addDecodedRow(`${txidRaw}`, `txid: ${txid}`);
    cursor += 64;
  
    const indexRaw = tx.slice(cursor, cursor + 8);
    const indexReversed = reverseHex(indexRaw);
    const index = Number.parseInt(indexReversed, 16);
    console.log(`${indexRaw}          index of output in previous tx: ${index}`);
    addDecodedRow(`${indexRaw}`, `Index of output in previous tx: ${index}`)
    cursor += 8;
  
    const unlockingScriptSizeRaw = tx.slice(cursor, cursor + 2);
    const unlockingScriptSize = Number.parseInt(unlockingScriptSizeRaw, 16);
    console.log(`${unlockingScriptSizeRaw}                unlocking script size: ${unlockingScriptSize}`);
    addDecodedRow(`${unlockingScriptSizeRaw}`, `Unlocking script size: ${unlockingScriptSize}`);
    cursor += 2;
  
    const unlockingScriptRaw = tx.slice(cursor, cursor + unlockingScriptSize * 2);
    console.log(`${unlockingScriptRaw}  unlocking script`);
    addDecodedRow(`${unlockingScriptRaw}`, `Unlocking script`);
    cursor += unlockingScriptSize * 2;
  
    const nSequenceRaw = tx.slice(cursor, cursor + 8);
    const nSequence = nSequenceRaw; // Does this need to be reversed?
    console.log(`${nSequence}          nSequence`);
    addDecodedRow(`${nSequence}`, `nSequence`)
    cursor += 8;
  }
  
  const voutRaw = tx.slice(cursor, cursor + 2);
  const vout = Number.parseInt(voutRaw, 16);
  console.log(`${voutRaw}                vout (# outputs: ${vout})`);
  cursor += 2;
  
  for (i = 0; i < vout; i++) {
    console.log(`----------------  Output ${i}`);
    addDecodedRow("", `Output ${i}`, true, true);
    const nValueRaw = tx.slice(cursor, cursor + 16);
    const nValueReversed = reverseHex(nValueRaw);
    const nValue = Number.parseInt(nValueReversed, 16);
    console.log(`${nValueRaw}  nValue: ${nValue}`);
    addDecodedRow(`${nValueRaw}`, `nValue: ${nValue}`)
    cursor += 16;
  
    const lockingScriptSizeRaw = tx.slice(cursor, cursor + 2);
    const lockingScriptSize = Number.parseInt(lockingScriptSizeRaw, 16);
    console.log(`${lockingScriptSizeRaw}                locking script size: ${lockingScriptSize}`);
    addDecodedRow(`${lockingScriptSizeRaw}`,`Locking script size: ${lockingScriptSize}`);
    cursor += 2;
  
    const lockingScriptRaw = tx.slice(cursor, cursor + lockingScriptSize * 2);
    const decodedLockingScript = decodeLockingScript(lockingScriptRaw);
    console.log(`${lockingScriptRaw}  locking script ${decodedLockingScript}`);
    addDecodedRow(`${lockingScriptRaw}`,`Locking script ${decodedLockingScript}`);
    cursor += lockingScriptSize * 2;
  
    let or = "";
    let orCursor = 0;
    if (lockingScriptRaw.startsWith("006a")) {
      addDecodedRow("006a", "&nbsp;&nbsp;OP_RETURN", false, true, true);
      or = or + lockingScriptRaw.slice(0, 4);
      orCursor = 4;
  
      let pushIndex = 0;
      while (lockingScriptSize * 2 > orCursor) {
        let pushSizeRaw = lockingScriptRaw.slice(orCursor, orCursor + 2);
        let pushSize = Number.parseInt(pushSizeRaw, 16);
        orCursor += 2;
        if (pushSizeRaw == "4c") { // OP_PUSHDATA1
          const byteCountRaw = lockingScriptRaw.slice(orCursor, orCursor + 2);
          orCursor += 2;
          pushSize = Number.parseInt(byteCountRaw, 16);
          pushSizeRaw = pushSizeRaw + byteCountRaw;
        }
        
        or = or + ` ${pushSizeRaw}`;
        
        console.log(`Push size: 0x${pushSizeRaw} (${pushSize})`);
        addDecodedRow(`${pushSizeRaw}`,`&nbsp;&nbsp;Push data: ${pushSize}`);
  
        const pushDataRaw = lockingScriptRaw.slice(orCursor, orCursor + 2 * pushSize);
        or = or + ` ${pushDataRaw}`
        const interpretedData = interpretData(pushSize, pushDataRaw, pushIndex);
        addDecodedRow(`${pushDataRaw}`, `${interpretedData ? `&nbsp;&nbsp;${interpretedData}` : "&nbsp;&nbsp;Pushed data"}`)
        orCursor += pushSize * 2;
        pushIndex += 1;
      }
      console.log(`Byte position at end: ${orCursor * 0.5}, matches size: ${orCursor * 0.5 === lockingScriptSize}`);
  
      console.log(`${or} OP_FALSE OP_RETURN`);
    }
  }
  
  const nLockTimeRaw = tx.slice(cursor, cursor + 8);
  const nLockTimeReversed = reverseHex(nLockTimeRaw);
  const nLockTime = Number.parseInt(nLockTimeReversed, 16);
  console.log(`${nLockTimeRaw}          nLockTime: ${nLockTime}`);
  addDecodedRow(`${nLockTimeRaw}`, `nLockTime: ${nLockTime}`, true);
}

function interpretData(byteSize, hex, index) {
  if (hex.startsWith('bd') && byteSize === 2 && index === 0) {
    const versionRaw = hex.slice(2, 4);
    const version = Number.parseInt(versionRaw, 16);
    return `Envelope v${version}`
  } else if (index === 1) { // Assume envelope payload protocol ID
    const s = decodeHexToString(hex);
    return `Payload Protocol ID: ${s}`;
  }
}

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

sampleButton.addEventListener("click", function onSampleClicked(event) {
  txInputElement.value = sampleTx;
  decodeTx(sampleTx);
});

txInputElement.addEventListener("input", function onTxInput(event) {
  const content = event.target.value;
  decodeTx(content);
});


