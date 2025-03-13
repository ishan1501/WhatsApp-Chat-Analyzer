document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("chatInput").value = e.target.result;
      };
      reader.readAsText(file);
    }
  });

// Start analysis only when the "Analyze" button is clicked
document.getElementById("analyzeButton").addEventListener("click", function () {
  const chatText = document.getElementById("chatInput").value;
  processChat(chatText);
});

function processChat(chatText) {
  const chatMessages = document.getElementById("chatMessages");
  const chatMetadata = document.getElementById("chatMetadata");
  chatMessages.innerHTML = "";
  chatMetadata.innerHTML = "";

  const messages = [];
  const lines = chatText.split("\n");
  let currentMessage = null;
  let admissionOfficers = new Set();
  let ewylMentors = new Set();
  let salesCounselors = new Set();
  let studentContacts = new Set();
  let startDate = null;
  let endDate = null;

  lines.forEach((line) => {
    const message = parseMessage(line);
    if (message) {
      if (!startDate) startDate = message.date;
      endDate = message.date;

      let sender = message.sender ? message.sender.toLowerCase() : "";

      if (sender.includes("kam")) {
        admissionOfficers.add(message.sender);
      } else if (sender.includes("ewyl")) {
        ewylMentors.add(message.sender);
      } else if (isPhoneNumber(sender)) {
        studentContacts.add(message.sender);
      } else if (sender !== "") {
        salesCounselors.add(message.sender);
      } else {
        studentContacts.add("Unknown Student/Parent");
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
      <p><strong>Admission Officers (KAM):</strong> ${Array.from(
        admissionOfficers
      ).join(", ")}</p>
      <p><strong>EWYL Mentors:</strong> ${Array.from(ewylMentors).join(
        ", "
      )}</p>
      <p><strong>Sales Counselors:</strong> ${Array.from(salesCounselors).join(
        ", "
      )}</p>
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

// Chat Search Functionality
document.getElementById("chatSearch").addEventListener("input", function () {
  const searchText = this.value.toLowerCase();
  const messages = document.querySelectorAll(".message");

  messages.forEach((msg) => {
    if (msg.textContent.toLowerCase().includes(searchText)) {
      msg.style.display = "block";
    } else {
      msg.style.display = "none";
    }
  });
});

function parseMessage(line) {
  const regex =
    /(\d{2}\/\d{2}\/\d{2}), (\d{1,2}:\d{2}\s?(?:AM|PM|am|pm| [APap][Mm])) - (.+?): (.+)/;
  const match = line.match(regex);
  if (match) {
    return {
      date: match[1],
      time: match[2].replace(/\u202F/g, " "),
      sender: match[3].trim(),
      text: match[4].trim(),
    };
  }
  return null;
}

function createMessageElement(message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  let sender = message.sender ? message.sender.toLowerCase() : "";

  if (sender.includes("kam")) {
    messageDiv.classList.add("admission-officer", "left-align");
  } else if (sender.includes("ewyl")) {
    messageDiv.classList.add("ewyl", "left-align");
  } else if (isPhoneNumber(sender)) {
    messageDiv.classList.add("student", "right-align");
  } else if (sender !== "") {
    messageDiv.classList.add("sales", "left-align");
  } else {
    messageDiv.classList.add("student", "right-align");
  }

  messageDiv.innerHTML = `<strong>${
    message.sender ? message.sender : "Unknown Student/Parent"
  }</strong><br>${message.text.replace(/\n/g, "<br>")}<br>
  <time>${message.date}, ${message.time}</time>`;

  return messageDiv;
}

function isPhoneNumber(sender) {
  return /^\+?\d{7,15}$/.test(sender.replace(/\s+/g, ""));
}

function calculateDaysDifference(start, end) {
  if (!start || !end) return "N/A";

  const [sDay, sMonth, sYear] = start.split("/").map(Number);
  const [eDay, eMonth, eYear] = end.split("/").map(Number);
  const startDate = new Date(2000 + sYear, sMonth - 1, sDay);
  const endDate = new Date(2000 + eYear, eMonth - 1, eDay);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
