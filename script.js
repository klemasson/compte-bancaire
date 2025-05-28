// Données
let balance = 5000.00;
let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let clients = JSON.parse(localStorage.getItem("clients")) || [];
let fournisseurs = JSON.parse(localStorage.getItem("fournisseurs")) || [];

let username = localStorage.getItem("username") || prompt("Entrez votre nom d'utilisateur :");
if (!username) {
  alert("Un nom d'utilisateur est requis !");
  location.reload();
} else {
  localStorage.setItem("username", username);
}

// Elements DOM
const transactions = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");
const partnerSelect = document.getElementById("partnerSelect");

const togglePartnerFormBtn = document.getElementById("togglePartnerFormBtn");
const partnerFormDiv = document.getElementById("partnerForm");
const addPartnerBtn = document.getElementById("addPartnerBtn");
const cancelPartnerBtn = document.getElementById("cancelPartnerBtn");

// Affiche ou cache le formulaire partenaire
function togglePartnerForm(forceHide = false) {
  if (forceHide) {
    partnerFormDiv.style.display = "none";
    clearPartnerForm();
  } else {
    partnerFormDiv.style.display = partnerFormDiv.style.display === "block" ? "none" : "block";
  }
}

// Vide les champs du formulaire partenaire
function clearPartnerForm() {
  document.getElementById("partnerNom").value = "";
  document.getElementById("partnerAdresse").value = "";
  document.getElementById("partnerNPA").value = "";
  document.getElementById("partnerLocalite").value = "";
  document.getElementById("partnerContact").value = "";
}

// Met à jour le menu déroulant des partenaires
function updatePartnerSelect() {
  partnerSelect.innerHTML = '<option value="">-- Aucun --</option>';
  clients.forEach((c, i) => {
    const option = document.createElement("option");
    option.value = `client:${i}`;
    option.textContent = `${c.nom} (client)`;
    partnerSelect.appendChild(option);
  });
  fournisseurs.forEach((f, i) => {
    const option = document.createElement("option");
    option.value = `fournisseur:${i}`;
    option.textContent = `${f.nom} (fournisseur)`;
    partnerSelect.appendChild(option);
  });
}

// Met à jour le tableau des transactions
function updateTable() {
  transactions.innerHTML = "";
  balance = 5000.00;

  transactionList.forEach((tx, index) => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    balance += signedAmount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.partner ? tx.partner + " - " : ""}${tx.desc}</td>
      <td>${signedAmount.toFixed(2)}</td>
      <td>${balance.toFixed(2)}</td>
      <td>
        <i class="fas ${tx.validated ? 'fa-check-circle' : 'fa-times-circle'}" 
           style="color:${tx.validated ? 'green' : 'red'}" 
           onclick="toggleValidation(${index})"></i>
      </td>
      <td>${tx.username}</td>
    `;
    transactions.appendChild(row);
  });

  balanceSpan.textContent = balance.toFixed(2);
}

// Ajoute une transaction
function addTransaction() {
  const type = document.getElementById("type").value;
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const partnerVal = partnerSelect.value;

  if (isNaN(amount) || amount <= 0) return alert("Veuillez entrer un montant valide.");
  if (!desc) return alert("Veuillez entrer une description.");

  let partnerName = "";
  if (partnerVal) {
    const [typePartner, index] = partnerVal.split(":");
    if (typePartner === "client") partnerName = clients[parseInt(index)].nom;
    else if (typePartner === "fournisseur") partnerName = fournisseurs[parseInt(index)].nom;
  }

  const date = new Date().toISOString().split("T")[0];
  transactionList.push({
    date,
    type,
    desc,
    amount,
    validated: false,
    username,
    partner: partnerName
  });

  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();

  // Reset inputs
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  partnerSelect.value = "";
}

// Toggle validation d'une transaction
function toggleValidation(index) {
  transactionList[index].validated = !transactionList[index].validated;
  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();
}

// Export CSV
function exportCSV() {
  const rows = [
    ["Date", "Type", "Partenaire", "Description", "Montant", "Solde", "État", "Utilisateur"]
  ];
  let runningBalance = 5000.00;
  transactionList.forEach(tx => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    runningBalance += signedAmount;
    rows.push([
      tx.date,
      tx.type,
      tx.partner || "",
      tx.desc,
      signedAmount.toFixed(2),
      runningBalance.toFixed(2),
      tx.validated ? "✅" : "❌",
      tx.username
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
}

// Clear all transactions
function clearTransactions() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    transactionList = [];
    localStorage.removeItem("transactions");
    updateTable();
  }
}

// Evenements boutons formulaire partenaire
togglePartnerFormBtn.addEventListener("click", () => togglePartnerForm());
addPartnerBtn.addEventListener("click", () => {
  const type = document.getElementById("partnerType").value;
  const nom = document.getElementById("partnerNom").value.trim();
  const adresse = document.getElementById("partnerAdresse").value.trim();
  const npa = document.getElementById("partnerNPA").value.trim();
  const localite = document.getElementById("partnerLocalite").value.trim();
  const contact = document.getElementById("partnerContact").value.trim();

  if (!nom) {
    alert("Le nom est obligatoire.");
    return;
  }

  const newPartner = { nom, adresse, npa, localite, contact };

  if (type === "client") {
    clients.push(newPartner);
    localStorage.setItem("clients", JSON.stringify(clients));
  } else {
    fournisseurs.push(newPartner);
    localStorage.setItem("fournisseurs", JSON.stringify(fournisseurs));
  }

  updatePartnerSelect();
  togglePartnerForm(true);
});
cancelPartnerBtn.addEventListener("click", () => togglePartnerForm(true));

// Initialisation page
updatePartnerSelect();
updateTable();

// Expose fonctions au global pour les onclick inline
window.addTransaction = addTransaction;
window.exportCSV = exportCSV;
window.clearTransactions = clearTransactions;
window.toggleValidation = toggleValidation;
