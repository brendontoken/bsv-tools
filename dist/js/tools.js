const reversedOutputElement = document.getElementById('reversed');
const reverseInputElement = document.getElementById('reverse');

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

reverseInputElement.addEventListener("input", function onReverseInput(event) {
  const content = event.target.value;
  console.log("On reverse input.", content);
  if (content.length % 2 === 0) {
    const reversed = reverseHex(content);
    reversedOutputElement.innerText = reversed;
  } else {
    reversedOutputElement.innerText = "";
  }
});

