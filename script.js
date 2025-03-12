document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        processChat(e.target.result);
      };
      reader.readAsText(file);
    }
  });

document.getElementById("chatInput").addEventListener("input", function () {
  processChat(this.value);
});

function processChat(chatText) {
  const chatMessages = document.getElementById("chatMessages");
  const chatMetadata = document.getElementById("chatMetadata");
  chatMessages.innerHTML = "";
  chatMetadata.innerHTML = "";

  const messages = [];
  const lines = chatText.split("\n");
  let currentMessage = null;
  let counselors = new Set();
  let studentContacts = new Set();
  let startDate = null;
  let endDate = null;

  lines.forEach((line) => {
    const message = parseMessage(line);
    if (message) {
      if (!startDate) startDate = message.date;
      endDate = message.date;

      if (
        message.sender.includes("Ankit") ||
        message.sender.includes("Piyush")
      ) {
        counselors.add(message.sender);
      } else {
        studentContacts.add(message.sender);
      }

      if (currentMessage) {
        messages.push(currentMessage);
      }
      currentMessage = message;
    } else if (currentMessage) {
      currentMessage.text += "\n" + line;
    }
  });

  if (currentMessage) {
    messages.push(currentMessage);
  }

  const totalDays = calculateDaysDifference(startDate, endDate);

  chatMetadata.innerHTML = `
        <p><strong>Counselors:</strong> ${Array.from(counselors).join(", ")}</p>
        <p><strong>Student/Parent Contacts:</strong> ${Array.from(
          studentContacts
        ).join(", ")}</p>
        <p><strong>Chat Start Date:</strong> ${startDate}</p>
        <p><strong>Chat End Date:</strong> ${endDate}</p>
        <p><strong>Total Days to Completion:</strong> ${totalDays} days</p>
    `;

  messages.forEach((msg) => {
    chatMessages.appendChild(createMessageElement(msg));
  });
}

function parseMessage(line) {
  const regex = /(\d{2}\/\d{2}\/\d{2}), (\d{1,2}:\d{2} [ap]m) - (.+?): (.+)/;
  const match = line.match(regex);
  if (match) {
    return {
      date: match[1],
      time: match[2],
      sender: match[3],
      text: match[4],
    };
  }
  return null;
}

function createMessageElement(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (message.sender.includes("Ankit") || message.sender.includes("Piyush")) {
    messageDiv.classList.add("counselor");
  } else {
    messageDiv.classList.add("student");
  }

  messageDiv.innerHTML = `<strong>${
    message.sender
  }</strong><br>${message.text.replace(/\n/g, "<br>")}<time>${
    message.time
  }</time>`;
  return messageDiv;
}

function calculateDaysDifference(start, end) {
  const [sDay, sMonth, sYear] = start.split("/").map(Number);
  const [eDay, eMonth, eYear] = end.split("/").map(Number);
  const startDate = new Date(2000 + sYear, sMonth - 1, sDay);
  const endDate = new Date(2000 + eYear, eMonth - 1, eDay);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
