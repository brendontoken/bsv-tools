"use strict";
const sampleButton = document.getElementById('sample');
const statusElement = document.getElementById('status');
const xpubInputElement = document.getElementById('xpub-input');
const addressesTable = document.getElementById('addresses-table');

const sampleXpub = "xpub6ECqg3zAc1QXSmwex7D9vPsiLEBfnQSLVjBeXfeBKQTLZJbtstvUscv1Q11671RZhwoBnYUH72E2wbgRXjucp9CFN34dZuyyBbL6qx5napw";



async function displayAddresses(pk) {
    const startIndex = 0;
    let i;
    let lastUsedOrInUse = startIndex;
    for (i = startIndex; i < 500; i++) {
      const externalPath = `m/0/${i}`
      displayChild(pk, externalPath);
      const internalPath = `m/1/${i}`
      displayChild(pk, internalPath);
    }
    statusElement.innerText = "Finished";
}

function displayChild(pk, path) {
    statusElement.innerText = path;
    const child = pk.deriveChild(path);
    const childPk = child.publicKey;
    const address = childPk.toAddress();

    // Add row
    const row = document.createElement("tr");
    const pathCell = document.createElement("td");
    const addressCell = document.createElement("td");

    pathCell.innerText = path;
    addressCell.innerHTML = `<a href="https://whatsonchain.com/address/${address}" target="_blank">${address}</a>`;

    row.appendChild(pathCell);
    row.appendChild(addressCell);

    addressesTable.appendChild(row);
}


function makeRequest(method, url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        //xhr.setRequestHeader("api_key", BITINDEX_API_KEY);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function onXpub(xpub) {
    const pubKey = new bsv.HDPublicKey(xpub);
    console.log("pubKey:", pubKey);

    displayAddresses(pubKey);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

sampleButton.addEventListener("click", function onSampleButtonClick(event) {
    xpubInputElement.value = sampleXpub;
    onXpub(sampleXpub);
});

xpubInputElement.addEventListener("input", function onXpubInput(event) {
    const content = event.target.value;
    console.log("xpub:", content);
    onXpub(content);
});