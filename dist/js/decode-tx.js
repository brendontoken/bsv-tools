"use strict";
const txDecodedElement = document.getElementById('tx-decoded');
const txInputElement = document.getElementById('tx-input');

const b58ch = bsv.encoding.Base58Check;

function addDecodedRow(txPortion, decoded, showTopSeparator, isAHeading) {
  const row = document.createElement("tr");
  const txCell = document.createElement("td");
  const decodedCell = document.createElement("td")
  const txDiv = document.createElement("div")


  txDiv.className = "monospace";
  txDiv.innerText = txPortion;
  txDiv.style = "width: 50vw; overflow-wrap: break-word";
  decodedCell.innerText = decoded;
  if (showTopSeparator) {
    row.style = "border-top: 1px solid lightgrey"
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
      or = or + lockingScriptRaw.slice(0, 4);
      orCursor = 4;
  
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
  
        const pushDataRaw = lockingScriptRaw.slice(orCursor, orCursor + 2 * pushSize);
        or = or + ` ${pushDataRaw}`
        orCursor += pushSize * 2;
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



txInputElement.addEventListener("input", function onTxInput(event) {
  const content = event.target.value;
  decodeTx(content);
});


