// --- Initialisation ---
const userSection = document.getElementById("user-section");
const usernameInput = document.getElementById("usernameInput");
const setUsernameBtn = document.getElementById("setUsernameBtn");
const mainApp = document.getElementById("main-app");
const displayUsername = document.getElementById("displayUsername"); // (optional, not used here)

let username = localStorage.getItem("username");

// Clients/fournisseurs
const clientName = document.getElementById("clientName");
const clientAddress = document.getElementById("clientAddress");
const clientNPA = document.getElementById("clientNPA");
const clientLocality = document.getElementById("clientLocality");
const clientContact = document.getElementById("clientContact");
const addClientBtn = document.getElementById("addClientBtn");
const clientSelect = document.getElementById("clientSelect");

// Transactions
const typeSelect = document.getElementById("type");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const clearTransactionsBtn = document.getElementById("clearTransactionsBtn");
const transactionsTbody = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

let balance = 5000.00;
let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let clientList = JSON.parse(localStorage.getItem("clients")) || [];

// --- Fonctions d'affichage et sauvegarde ---

function showUserSection() {
  userSection.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

function showMainApp() {
  userSection.classList.add("hidden");
  mainApp.classList.remove("hidden");
}

function init() {
  if (username && username.trim() !== "") {
    showMainApp();
  } else {
    showUserSection();
  }
  renderClientOptions();
  updateTable();
}

// --- Gestion utilisateurs ---
setUsernameBtn.addEventListener("click", () => {
  const val = usernameInput.value.trim();
  if (!val) {
    alert("Veuillez entrer un nom d'utilisateur.");
    return;
  }
  username = val;
  localStorage.setItem("username", username);
  showMainApp();
});

// --- Gestion clients/fournisseurs ---
function renderClientOptions() {
  clientSelect.innerHTML = '<option value="" disabled selected>Choisir un client/fournisseur</option>';
  clientList.forEach((client, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = client.name;
    clientSelect.appendChild(option);
  });
}

addClientBtn.addEventListener("click", () => {
  const name = clientName.value.trim();
  const address = clientAddress.value.trim();
  const npa = clientNPA.value.trim();
  const locality = clientLocality.value.trim();
  const contact = clientContact.value.trim();

  if (!name || !address || !npa || !locality || !contact) {
    alert("Merci de remplir tous les champs client/fournisseur.");
    return;
  }

  clientList.push({ name, address, npa, locality, contact });
  localStorage.setItem("clients", JSON.stringify(clientList));

  // Reset form
  clientName.value = "";
  clientAddress.value = "";
  clientNPA.value = "";
  clientLocality.value = "";
  clientContact.value = "";

  renderClientOptions();
  alert("Client/fournisseur ajouté !");
});

// --- Gestion transactions ---
function updateTable() {
  transactionsTbody.innerHTML = "";
  balance = 5000.00;

  transactionList.forEach((tx, index) => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    balance += signedAmount;

    const tr = document.createElement("tr");

    // Création des colonnes avec attribut data-label (pour responsive)
    tr.innerHTML = `
      <td data-label="Date">${tx.date}</td>
      <td data-label="Client/Fournisseur">${tx.clientName}</td>
      <td data-label="Type">${tx.type}</td>
      <td data-label="Description">${tx.desc}</td>
      <td data-label="Montant">${signedAmount.toFixed(2)}</td>
      <td data-label="Solde">${balance.toFixed(2)}</td>
      <td data-label="État">
        <i class="fas ${tx.validated ? 'fa-check-circle' : 'fa-times-circle'}" 
           style="color:${tx.validated ? 'green' : 'red'}; cursor:pointer;" 
           onclick="toggleValidation(${index})"></i>
      </td>
      <td data-label="Utilisateur">${tx.username}</td>
    `;

    transactionsTbody.appendChild(tr);
  });

  balanceSpan.textContent = balance.toFixed(2);
}

window.toggleValidation = function(index) {
  transactionList[index].validated = !transactionList[index].validated;
  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();
};

addTransactionBtn.addEventListener("click", () => {
  const clientIndex = clientSelect.value;
  const clientNameSelected = clientIndex !== "" ? clientList[clientIndex]?.name : null;
  const type = typeSelect.value;
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!clientNameSelected) {
    alert("Veuillez sélectionner un client/fournisseur.");
    return;
  }
  if (!desc) {
    alert("Veuillez entrer une description.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Veuillez entrer un montant valide.");
    return;
  }

  const date = new Date().toISOString().split("T")[0];

  transactionList.push({
    date,
    clientName: clientNameSelected,
    type,
    desc,
    amount,
    validated: false,
    username
  });

  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();

  descInput.value = "";
  amountInput.value = "";
  clientSelect.value = "";
});

exportCSVBtn.addEventListener("click", () => {
  const rows = [
    ["Date", "Client/Fournisseur", "Type", "Description", "Montant", "Solde", "État", "Utilisateur"]
  ];
  let runningBalance = 5000.00;

  transactionList.forEach(tx => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    runningBalance += signedAmount;

    rows.push([
      tx.date,
      tx.clientName,
      tx.type,
      tx.desc,
      signedAmount.toFixed(2),
      runningBalance.toFixed(2),
      tx.valid
