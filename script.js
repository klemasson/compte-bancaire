// Variables globales
let username = "";
let clients = [];
let transactions = [];
let balance = 5000.00;

// DOM
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
const clearTransactionsBtn = document.getElementById("clearTransactionsBtn");
const transactionsTbody = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

// Fonction pour rafraîchir la liste clients
function refreshClientOptions() {
  clientSelect.innerHTML = '<option value="">-- Choisir un client/fournisseur --</option>';
  clients.forEach((c, i) => {
    let opt = document.createElement("option");
    opt.value = i;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });
}

// Rafraîchir le tableau des transactions avec validation
function refreshTransactions() {
  transactionsTbody.innerHTML = "";
  balance = 5000.00;
  transactions.forEach((tx, index) => {
    const tr = document.createElement("tr");
    const dateStr = new Date(tx.date).toLocaleString();
    let clientName = clients[tx.clientIndex] ? clients[tx.clientIndex].name : "N/A";
    let amount = parseFloat(tx.amount);
    if (["Retrait", "Virement", "Paiement QR", "Frais"].includes(tx.type)) amount = -amount;
    balance += amount;

    // Icône validation (cliquable)
    const validationIcon = tx.validated
      ? `<span style="cursor:pointer; color:green;" onclick="toggleValidation(${index})">&#10004;</span>` // ✔
      : `<span style="cursor:pointer; color:red;" onclick="toggleValidation(${index})">&#10006;</span>`;  // ✖

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

// Permettre toggle validation (clic sur icône)
window.toggleValidation = function(index) {
  transactions[index].validated = !transactions[index].validated;
  saveToLocalStorage();
  refreshTransactions();
};

function saveToLocalStorage() {
  localStorage.setItem("clients", JSON.stringify(clients));
 
