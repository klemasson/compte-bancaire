let balance = 5000.00;
let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let entityList = JSON.parse(localStorage.getItem("entities")) || [];
let username = localStorage.getItem("username");

const transactions = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

if (!username) {
  document.getElementById("userPrompt").style.display = "block";
}

function setUsername() {
  const input = document.getElementById("usernameInput").value.trim();
  if (input) {
    username = input;
    localStorage.setItem("username", username);
    document.getElementById("userPrompt").style.display = "none";
    updateTable();
    updateEntityDropdown();
  }
}

function updateEntityDropdown() {
  const select = document.getElementById("entitySelect");
  select.innerHTML = "";
  entityList.forEach(ent => {
    const option = document.createElement("option");
    option.value = ent.name;
    option.textContent = ent.name;
    select.appendChild(option);
  });
}

function updateTable() {
  transactions.innerHTML = "";
  balance = 5000.00;

  transactionList.forEach((tx, i) => {
    const signedAmount = tx.type === "Dépôt" ? tx.amount : -tx.amount;
    balance += signedAmount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.entity}</td>
      <td>${tx.desc}</td>
      <td>${signedAmount.toFixed(2)}</td>
      <td>${balance.toFixed(2)}</td>
      <td>
        <input type="checkbox" ${tx.validated ? "checked" : ""} onchange="toggleValidation(${i})" />
      </td>
      <td>${tx.username}</td>
    `;
    transactions.appendChild(row);
  });

  balanceSpan.textContent = balance.toFixed(2);
}

function toggleValidation(index) {
  transactionList[index].validated = !transactionList[index].validated;
  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();
}

function addTransaction() {
  const type = document.getElementById("type").value;
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const entity = document.getElementById("entitySelect").value;

  if (!desc || isNaN(amount) || amount <= 0) return alert("Veuillez remplir tous les champs correctement.");

  const date = new Date().toISOString().split("T")[0];
  transactionList.push({ date, type, desc, amount, validated: false, username, entity });
  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

function exportCSV() {
  const rows = [["Date", "Type", "Client/Fournisseur", "Description", "Montant", "Solde", "État", "Utilisateur"]];
  let runningBalance = 5000.00;
  transactionList.forEach(tx => {
    const signedAmount = tx.type === "Dépôt" ? tx.amount : -tx.amount;
    runningBalance += signedAmount;
    rows.push([
      tx.date, tx.type, tx.entity, tx.desc,
      signedAmount.toFixed(2), runningBalance.toFixed(2),
      tx.validated ? "✅" : "❌", tx.username
    ]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printPDF() {
  const container = document.createElement("div");
  container.innerHTML = `<h2 style="text-align:center;">Liste des Transactions</h2>${document.querySelector("table").outerHTML}`;
  const opt = {
    margin: 0.5,
    filename: `transactions_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
  };
  html2pdf().set(opt).from(container).save();
}

function clearTransactions() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    transactionList = [];
    localStorage.removeItem("transactions");
    updateTable();
  }
}

function openEntityForm() {
  document.getElementById("entityModal").style.display = "block";
}

function closeEntityForm() {
  document.getElementById("entityModal").style.display = "none";
}

function saveEntity() {
  const name = document.getElementById("entityName").value.trim();
  const address = document.getElementById("entityAddress").value.trim();
  const locality = document.getElementById("entityLocality").value.trim();
  const contact = document.getElementById("entityContact").value.trim();
  if (!name || !address || !locality || !contact) return alert("Tous les champs sont requis.");

  entityList.push({ name, address, locality, contact });
  localStorage.setItem("entities", JSON.stringify(entityList));
  closeEntityForm();
  updateEntityDropdown();
}

updateEntityDropdown();
if (username) updateTable();
