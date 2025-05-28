// --- Références DOM ---
const userSection = document.getElementById("user-section");
const usernameInput = document.getElementById("usernameInput");
const setUsernameBtn = document.getElementById("setUsernameBtn");
const mainApp = document.getElementById("main-app");

const clientName = document.getElementById("clientName");
const clientAddress = document.getElementById("clientAddress");
const clientNPA = document.getElementById("clientNPA");
const clientLocality = document.getElementById("clientLocality");
const clientContact = document.getElementById("clientContact");
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

// --- Variables ---
let username = localStorage.getItem("username") || "";
let clientList = JSON.parse(localStorage.getItem("clients")) || [];
let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = 5000.00;

// --- Affichage ---
function showUserSection() {
  userSection.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp() {
  userSection.classList.add("hidden");
  mainApp.classList.remove("hidden");
}

function renderClientOptions() {
  clientSelect.innerHTML = '<option value="" disabled selected>Choisir un client/fournisseur</option>';
  clientList.forEach((client, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = client.name;
    clientSelect.appendChild(option);
  });
}

function updateTable() {
  transactionsTbody.innerHTML = "";
  balance = 5000.00;

  transactionList.forEach((tx, index) => {
    const signedAmount = tx.type === "Dépôt" ? tx.amount : -tx
