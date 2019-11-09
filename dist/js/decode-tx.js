"use strict";
const sampleButton = document.getElementById('sample');
const txDecodedElement = document.getElementById('tx-decoded');
const txIdElement = document.getElementById('tx-id');
const txInputElement = document.getElementById('tx-input');

const b58ch = bsv.encoding.Base58Check;

const sampleTxM1 = "0200000002aa925d16dfaa731f8ce7b09517b443c486374b3691e1f41128d9f682c434ce87000000006a47304402201d98763aae4206f1211020fa3a3744e758425ea1c7ee80574ac10742b8f3e1c902201b340d1a33e65e4f1d14bf7ff42da070da734c80891947559ea7bc2fa67f741c41210372506b7c3e6965e959f1bba50f6df46601fc5e34f0e5ba8d50a711c9797d1ae5ffffffffb2684cf1c88febd3ba2661f71e052bcc9fa67ccc0c0cd8770ed6b0e8b898c8d80100000069463043022021ecbbc769329055377dc0df56bf1cebfdd31ef54d6a73dc759988198129d257021f4cce425635bd47ea19ffd7fa7f144ce3b1a65313f3b38b99c348cf5eb050ac4121039d675257b7ea4d3e97bab93d80050a2202dee3fb31cf9b3ca6a91d998bbb074bffffffff03e8030000000000001976a91469cd66052e7e85b4eb1d8c51efc3475bc9d5cc3c88ac000000000000000031006a02bd000e746573742e746f6b656e697a6564041a024d311712010018ec07220f0a0d547565736461792031313a353744080000000000001976a914519f1998edb2d5fa2d187bee59ac078e4a43e95088ac00000000";
const sampleTxT1 = "0100000002a6d20aa62f5c323385c3fceb30838dedd9faf4eabef8c23c782fe7353d5df81d000000006a47304402203750425479327e894570cf17512afa8257304443726b55f28453670d78148de7022053eac9bcbe8ea2d6b39e2f69607531d3c4d6199b6194ea073ddd4ea7d31b4f9c4121025aee8b104b984fe3ce1d8d32399752384573ff7779ae7c9fa34785827df8c740ffffffff4c89cf64b791760c5bf0e9bf259348a6c12a545ab475f8e83c2fc12b5d6d31dd010000006a47304402205e062ce470e73f0f7f5c34bcc35cb9febd3f298d3bcdda1c50434d2f311e9fa502201c3959677cad2d4c6707aed8e3a18d19c539369275603cb7d20ac458247c3982412102d94cf775589fc3999b844e675c1d9e827233f829feec8b4c776a5ab6dc77c01affffffff03fb070000000000001976a91447c15f74fc4a996b5cbf44b13fd40da8792b4dac88ac000000000000000081006a02bd000e746573742e746f6b656e697a6564041a0254314c660a6412034355521a208b58a577076f296ebe381beed01dac293555f8285463c440b3d0e5ea750a3e78220310b41f2a1a0a152083350a6be002e85705dade092a999e3f64d252e110ea012a1a0a15203b0e8bb470dee872800a572c69bbd0f7679c490210ca1dd1620000000000001976a914747ebce50a768e0f1f796f6649ddd016a80c761488ac00000000";

const sampleTx = sampleTxT1;

// Envelope
const ENV_PUSH_DATA_INDEX_ENV_DATA = 2;
const ENV_PUSH_DATA_INDEX_PAYLOAD = 3;

// Ptotobuf
const PB_WIRE_TYPE_LENGTH_DELIMITED = 2;

function addDecodedRow(txPortion, decoded, options) {
  options = options || {};
  const showTopSeparator = options.showTopSeparator;
  const isAHeading = options.isAHeading;
  const showIntermediateTopSeparator = options.showIntermediateTopSeparator;
  const indented = options.indented;

  const row = document.createElement("tr");
  const txCell = document.createElement("td");
  const decodedCell = document.createElement("td")
  const txDiv = document.createElement("div")

  txDiv.className = "monospace";
  txDiv.innerText = txPortion;
  txDiv.style.width = "50vw"
  txDiv.style.overflowWrap= "break-word";
  decodedCell.innerHTML = decoded;
  if (showTopSeparator) {
    row.style.borderTop = "1px solid lightgrey"
  }
  if (showIntermediateTopSeparator) {
    row.style.borderTop = "1px dashed lightgrey"
  }
  if (isAHeading) {
    decodedCell.style.fontWeight = "bold"
  }
  if (indented) {
    txDiv.style.paddingLeft = "2em"
    decodedCell.style.paddingLeft= "2em"
  }

  txCell.appendChild(txDiv);
  row.appendChild(txCell);
  row.appendChild(decodedCell);
  txDecodedElement.appendChild(row);
}

function clearDecodedResults() {
  txIdElement.innerHTML = "";
  while (txDecodedElement.firstChild) {
    txDecodedElement.removeChild(txDecodedElement.firstChild)
  }
}

function decodeActionPayload(actionCode, payloadHex) {
  switch(actionCode) {
    case "T1":
      return decodeActionPayloadT1(payloadHex);
    default:
      console.log(`Action code "${actionCode}" not handled.`);
      return [`Action code ${actionCode} not handled.`];
  }

}

function decodeActionPayloadT1(payloadHex) {
  const fieldWire0 = decodePbTag(payloadHex, true);
  if (fieldWire0.fieldNumber === 1) {
    return decodeAssetTransfer(fieldWire0.content)
  }
  console.log("AssetTransfer not found in T1.");
  return null;
}

function decodeAssetTransfer(payloadHex) {
  const length = payloadHex.length;
  const payloadData = [];
  const fields = {};
  const fieldWire0 = decodePbTag(payloadHex, true);
  if (fieldWire0.content) {
    fields[fieldWire0.fieldNumber] = `${fieldWire0.content}`
  }

  let nextIndex = fieldWire0.nextIndex;
  let nextHex = payloadHex;
  if (nextIndex < length) {
    nextHex = nextHex.slice(nextIndex);
    const fieldWire1 = decodePbTag(nextHex, true);
    if (fieldWire1.content) {
      fields[fieldWire1.fieldNumber] = `${fieldWire1.content}`;
    }
    nextIndex = fieldWire1.nextIndex;
  }

  if (nextIndex < length) {
    nextHex = nextHex.slice(nextIndex);
    const fieldWire2 = decodePbTag(nextHex, true);
    if (fieldWire2.content) {
      fields[fieldWire2.fieldNumber] = `${fieldWire2.content}`;
    }
    nextIndex = fieldWire2.nextIndex;
  }

  if (nextIndex < length) {
    nextHex = nextHex.slice(nextIndex);
    const fieldWire3 = decodePbTag(nextHex, true);
    if (fieldWire3.content) {
      fields[fieldWire3.fieldNumber] = `${fieldWire3.content}`;
    }
    nextIndex = fieldWire3.nextIndex;
  }

  if (nextIndex < length) {
    nextHex = nextHex.slice(nextIndex);
    const fieldWire4 = decodePbTag(nextHex, true);
    if (fieldWire4.content) {
      fields[fieldWire4.fieldNumber] = `${fieldWire4.content}`;
    }
    nextIndex = fieldWire4.nextIndex;
  }

  const assetTypeHex = fields[2];
  if (assetTypeHex) {
    console.log("Decoding asset type from " + assetTypeHex);
    fields[2] = "AssetType: " + decodeHexToString(assetTypeHex);
  }

  let i;
  for (i = 0; i < 10; i++) {
    const field = fields[i];
    if (typeof field !== "undefined") {
      payloadData.push(field);
    }
  }

  return payloadData;
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

function decodeLockingScript(hex) {
  if (hex.length != 50) {
    return "";
  }

  if (hex.startsWith("76a914") && hex.endsWith("88ac")) { // P2PKH
    const pkh = hex.slice(6, 46);
    const prefixed = "00" + pkh;
    const b = bsv.encoding.Base58Check.fromHex(prefixed);
    const address = b.toString()
    return `Address: <a href="https://whatsonchain.com/address/${address}" target="_blank">${address}</a>`;
  }

  return "";
}

function decodePbTag(hex, hintIsBinary) {
  hintIsBinary = typeof hintIsBinary === "undefined" ? false : hintIsBinary;
  const tagHex = hex.slice(0, 2);
  const tag = Number.parseInt(tagHex, 16);
  const wireType = tag & 0x07;
  const fieldNumber = tag >> 3;
  console.log("decodePbVarInt() wireType:", wireType, ", fieldNumber:", fieldNumber);
  //const isLengthDelimited = wireType === PB_WIRE_TYPE_LENGTH_DELIMITED;
  switch (wireType) {
    case PB_WIRE_TYPE_LENGTH_DELIMITED:
    const lengthHex = hex.slice(2, 4);
    const length = Number.parseInt(lengthHex, 16);
    console.log("decodePbVarInt() is length delimited, length:", length);
    const startOfNextData = 4 + length * 2
    const dataHex = hex.slice(4, startOfNextData);

    let s;
    if (hintIsBinary) {
      s = dataHex;
    } else {
      // Treat as a string for now
      s = decodeHexToString(dataHex);
    }
    return {
      content: s,
      fieldNumber, 
      nextIndex: startOfNextData
    };
    default:
      console.log(`decodePbVarInt() wireType ${wireType} not handled.`);
  }


  return {
    content: null,
    fieldNumber, 
    nextIndex: 2
  }
}



function decodeTx(tx) {
  clearDecodedResults();

  const txBuf = bsv.util.buffer.hexToBuffer(tx);
  const txHash = bsv.crypto.Hash.sha256sha256(txBuf);
  const txidBuf = bsv.util.buffer.reverse(txHash);
  const txid = txidBuf.toString('hex');
  console.log("txid:", txid);
  txIdElement.innerHTML = `<a href="https://whatsonchain.com/tx/${txid}" target="_blank">${txid}</a>`;

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
    addDecodedRow("", `Input ${i}`, { showTopSeparator: true, isAHeading: true});
    const txidRaw = tx.slice(cursor, cursor + 64);
    const txid = reverseHex(txidRaw);
    console.log(`${txidRaw}  txid: ${txid}`)
    addDecodedRow(`${txidRaw}`, `txid: <a href="https://whatsonchain.com/tx/${txid}" target="_blank">${txid}</a>`);
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
    addDecodedRow("", `Output ${i}`, { showTopSeparator: true, isAHeading: true });
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
  
    let actionCode = null;
    let or = "";
    let orCursor = 0;
    if (lockingScriptRaw.startsWith("006a")) {
      addDecodedRow("006a", "OP_RETURN", { isAHeading: true, showIntermediateTopSeparator: true, indented: true });
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
        addDecodedRow(`${pushSizeRaw}`,`Push data: ${pushSize}`, { indented: true });
  
        const pushDataRaw = lockingScriptRaw.slice(orCursor, orCursor + 2 * pushSize);
        or = or + ` ${pushDataRaw}`
        const interpretedData = interpretData(pushSize, pushDataRaw, pushIndex, actionCode);
        let formatted = interpretedData;
        if (interpretData && pushIndex == ENV_PUSH_DATA_INDEX_ENV_DATA) {
          actionCode = interpretedData;
          formatted = `Envelope Data: "${interpretedData}"`
        }

        addDecodedRow(`${pushDataRaw}`, `${formatted ? `${formatted}` : "Pushed data"}`, { indented: true });
        
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
  addDecodedRow(`${nLockTimeRaw}`, `nLockTime: ${nLockTime}`, { showTopSeparator: true });
}

function interpretData(byteSize, hex, index, actionCode) {
  if (hex.startsWith('bd') && byteSize === 2 && index === 0) {
    const versionRaw = hex.slice(2, 4);
    const version = Number.parseInt(versionRaw, 16);
    return `Envelope v${version}`
  } else if (index === 1) { // Assume envelope Payload Protocol ID
    const s = decodeHexToString(hex);
    return `Payload Protocol ID: ${s}`; 
  } else if (index === ENV_PUSH_DATA_INDEX_ENV_DATA) {   // Assume envelope Envelope Data
    const fieldWire0 = decodePbTag(hex);
    if (fieldWire0.content) {
      return fieldWire0.content;
    }
    return null
  } else if (index === ENV_PUSH_DATA_INDEX_PAYLOAD) {  // Assume envelope Payload
    const payloadData = decodeActionPayload(actionCode, hex);
    /*const payloadData = [];
    const [pd, nextStart] = decodePbTag(hex);
    if (pd) {
      payloadData.push(`"${pd}"`);
    }
    if (nextStart < (byteSize * 2)) {
      const [pd, nextStart2] = decodePbTag(hex.slice(nextStart));
      if (pd) {
        payloadData.push(`"${pd}"`);
      }
    }
    */
    return `Payload: ${payloadData.join(", ")}`
    
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


