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

// Variables globales
let username = null;
let clients = JSON.parse(localStorage.getItem("clients")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = 5000.00;

// Fonction affichage client dans select
function refreshClientOptions() {
  clientSelect.innerHTML = '<option value="">-- Choisir un client/fournisseur --</option>';
  clients.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = c.name;
    clientSelect.appendChild(option);
  });
}

// Afficher transactions
function refreshTransactions() {
  transactionsTbody.innerHTML = "";
  balance = 5000.00;
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

// Sauvegarder dans localStorage
function saveToLocalStorage() {
  localStorage.setItem("clients", JSON.stringify(clients));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Gérer la validation du nom d'utilisateur
setUsernameBtn.onclick = () => {
  const inputVal = usernameInput.value.trim();
  if (!inputVal) {
    alert("Veuillez entrer un nom d'utilisateur valide.");
    return;
  }
  username = inputVal;
  localStorage.setItem("username", username);
  usernameInput.value = "";
  document.querySelector(".username-container").style.display = "none";
  appDiv.style.display = "block";
  userNameDisplay.textContent = username;

  refreshClientOptions();
  refreshTransactions();
};

// Au chargement, on vérifie si un username est déjà stocké
window.onload = () => {
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    username = savedUsername;
    document.querySelector(".username-container").style.display = "none";
    appDiv.style.display = "block";
    userNameDisplay.textContent = username;

    refreshClientOptions();
    refreshTransactions();
  }
};

// Ajouter un client/fournisseur
addClientBtn.onclick = () => {
  const name = clientNameInput.value.trim();
  if (!name) {
    alert("Le nom du client/fournisseur est obligatoire.");
    return;
  }
  clients.push({
    name,
    address: clientAddressInput.value.trim(),
    npa: clientNPAInput.value.trim(),
    locality: clientLocalityInput.value.trim(),
    contact: clientContactInput.value.trim(),
  });
  saveToLocalStorage();
  refreshClientOptions();

  clientNameInput.value = "";
  clientAddressInput.value = "";
  clientNPAInput.value = "";
  clientLocalityInput.value = "";
  clientContactInput.value = "";
};

// Ajouter une transaction
addTransactionBtn.onclick = () => {
  const clientIndex = clientSelect.value;
  const type = typeSelect.value;
  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (clientIndex === "") {
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

  transactions.push({
    date: new Date().toISOString(),
    clientIndex: parseInt(clientIndex),
    type,
    desc,
    amount,
    validated: false,
    user: username
  });

  saveToLocalStorage();
  refreshTransactions();

  descInput.value = "";
  amountInput.value = "";
  clientSelect.value = "";
};

// Export CSV
exportCSVBtn.onclick = () => {
  const rows = [
    ["Date", "Client/Fournisseur", "Type", "Description", "Montant", "Solde", "État", "Utilisateur"],
  ];
  let runningBalance = 5000.00;
  transactions.forEach(tx => {
    let amount = tx.amount;
    if (["Retrait", "Virement", "Paiement QR", "Frais"].includes(tx.type)) amount = -amount;
    runningBalance += amount;
    const clientName = clients[tx.clientIndex]?.name || "N/A";
    rows.push([
      new Date(tx.date).toLocaleString(),
      clientName,
      tx.type,
      tx.desc,
      amount.toFixed(2),
      runningBalance.toFixed(2),
      tx.validated ? "✅" : "❌",
      tx.user
    ]);
  });

  const csvContent = rows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Tout effacer
clearTransactionsBtn.onclick = () => {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    transactions = [];
    clients = [];
    saveToLocalStorage();
    refreshClientOptions();
    refreshTransactions();
  }
};

document.getElementById("exportPDFBtn").addEventListener("click", () => {
  const appContent = document.getElementById("app");
  const originalContent = document.body.innerHTML;
  const printArea = appContent.cloneNode(true);

  // Supprime les boutons pour l'impression
  printArea.querySelectorAll("button").forEach(btn => btn.remove());

  document.body.innerHTML = "";
  document.body.appendChild(printArea);
  window.print();
  document.body.innerHTML = originalContent;
});

document.getElementById("clearTransactionsBtn").addEventListener("click", () => {
  transactions = [];
  localStorage.removeItem("transactions");
  renderTransactions();
});
