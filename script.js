// DOM Elements
const usernameInput = document.getElementById("usernameInput");
const setUsernameBtn = document.getElementById("setUsernameBtn");
const appDiv = document.getElementById("app");
const userNameDisplay = document.getElementById("userNameDisplay");

const clientNameInput = document.getElementById("clientName");
const clientAddressInput = document.getElementById("clientAddress");
const clientNPAInput = document.getElementById("clientNPA");
const clientLocalityInput = document.getElementById("clientLocality");
const clientContactInput = document.getElementById("clientContact");
const addClientBtn = document.getElementById("addClientBtn");

const clientSelect = document.getElementById("clientSelect");
const typeSelect = document.getElementById("type");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const exportPDFBtn = document.getElementById("exportPDFBtn");
const clearTransactionsBtn = document.getElementById("clearTransactionsBtn");

const transactionsTbody = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

// Variables
let username = null;
let clients = JSON.parse(localStorage.getItem("clients")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = 5000.0;

// Fonctions de persistance
function saveToLocalStorage() {
  localStorage.setItem("clients", JSON.stringify(clients));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Rafraîchir les options du select client
function refreshClientOptions() {
  clientSelect.innerHTML = '<option value="">-- Choisir un client/fournisseur --</option>';
  clients.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = c.name;
    clientSelect.appendChild(option);
  });
}

// Afficher les transactions
function refreshTransactions() {
  transactionsTbody.innerHTML = "";
  balance = 5000.0;
  transactions.forEach((tx, index) => {
    const tr = document.createElement("tr");
    const dateStr = new Date(tx.date).toLocaleString();
    const clientName = clients[tx.clientIndex]?.name || "N/A";
    let amount = parseFloat(tx.amount);
    if (["Retrait", "Virement", "Paiement QR", "Frais"].includes(tx.type)) amount = -amount;
    balance += amount;

    const validationIcon = tx.validated
      ? `<span style="cursor:pointer; color:green;" onclick="toggleValidation(${index})">&#10004;</span>`
      : `<span style="cursor:pointer; color:red;" onclick="toggleValidation(${index})">&#10006;</span>`;

    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${clientName}</td>
      <td>${tx.type}</td>
      <td>${tx.desc}</td>
      <td>${amount.toFixed(2)}</td>
      <td>${balance.toFixed(2)}</td>
      <td>${validationIcon}</td>
      <td>${tx.user}</td>
    `;
    transactionsTbody.appendChild(tr);
  });
  balanceSpan.textContent = balance.toFixed(2);
}

// Toggle validation
window.toggleValidation = function(index) {
  transactions[index].validated = !transactions[index].validated;
  saveToLocalStorage();
  refreshTransactions();
};

// Ajout client
addClientBtn.addEventListener("click", () => {
  const name = clientNameInput.value.trim();
  if (!name) return;
  clients.push({
    name,
    address: clientAddressInput.value.trim(),
    npa: clientNPAInput.value.trim(),
    locality: clientLocalityInput.value.trim(),
    contact: clientContactInput.value.trim(),
  });
  saveToLocalStorage();
  refreshClientOptions();
  clientNameInput.value = clientAddressInput.value = clientNPAInput.value =
    clientLocalityInput.value = clientContactInput.value = "";
});

// Ajout transaction
addTransactionBtn.addEventListener("click", () => {
  const clientIndex = clientSelect.value;
  const type = typeSelect.value;
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  if (clientIndex === "" || isNaN(amount)) return;

  transactions.push({
    date: new Date().toISOString(),
    clientIndex,
    type,
    desc,
    amount,
    validated: false,
    user: username || "N/A",
  });
  saveToLocalStorage();
  refreshTransactions();
  descInput.value = amountInput.value = "";
});

// Export CSV
exportCSVBtn.addEventListener("click", () => {
  let csv = "Date,Client,Fournisseur,Type,Description,Montant,Solde,État,Utilisateur\\n";
  let tempBalance = 5000.0;
  transactions.forEach(tx => {
    const dateStr = new Date(tx.date).toLocaleString();
    let amount = parseFloat(tx.amount);
    if (["Retrait", "Virement", "Paiement QR", "Frais"].includes(tx.type)) amount = -amount;
    tempBalance += amount;
    const clientName = clients[tx.clientIndex]?.name || "N/A";
    const validated = tx.validated ? "Validé" : "Non validé";
    csv += `${dateStr},${clientName},${tx.type},${tx.desc},${amount.toFixed(2)},${tempBalance.toFixed(2)},${validated},${tx.user}\\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
});

// Export PDF (impression)
exportPDFBtn.addEventListener("click", () => {
  const appContent = document.getElementById("app");
  const originalContent = document.body.innerHTML;
  const printArea = appContent.cloneNode(true);
  printArea.querySelectorAll("button").forEach(btn => btn.remove());
  document.body.innerHTML = "";
  document.body.appendChild(printArea);
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload(); // Recharge le script
});

// Tout effacer
clearTransactionsBtn.addEventListener("click", () => {
  transactions = [];
  localStorage.removeItem("transactions");
  refreshTransactions();
});

// Validation utilisateur
setUsernameBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) return;
  username = name;
  userNameDisplay.textContent = username;
  appDiv.style.display = "block";
});

// Initialisation
refreshClientOptions();
refreshTransactions();
