// Variables globales
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

const transactionsTbody = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");
const partnerSelect = document.getElementById("partnerSelect");
const partnerFormDiv = document.getElementById("partnerForm");

const togglePartnerFormBtn = document.getElementById("togglePartnerFormBtn");
const addPartnerBtn = document.getElementById("addPartnerBtn");
const cancelPartnerBtn = document.getElementById("cancelPartnerBtn");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const clearTransactionsBtn = document.getElementById("clearTransactionsBtn");

// Met à jour la table des transactions
function updateTable() {
  transactionsTbody.innerHTML = "";
  balance = 5000.00;

  transactionList.forEach((tx, index) => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    balance += signedAmount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.desc}</td>
      <td>${signedAmount.toFixed(2)}</td>
      <td>${balance.toFixed(2)}</td>
      <td>
        <i class="fas ${tx.validated ? 'fa-check-circle' : 'fa-times-circle'}" 
           style="color:${tx.validated ? 'green' : 'red'}" 
           onclick="toggleValidation(${index})"></i>
      </td>
      <td>${tx.username}</td>
    `;
    transactionsTbody.appendChild(row);
  });
  balanceSpan.textContent = balance.toFixed(2);
}

// Basculer la validation d’une transaction
function toggleValidation(index) {
  transactionList[index].validated = !transactionList[index].validated;
  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();
}

// Affiche ou cache le formulaire d’ajout partenaire
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

  function addOptions(list, type) {
    list.forEach((p, i) => {
      const option = document.createElement("option");
      option.value = `${type}:${i}`;
      option.textContent = `${p.nom} (${type})`;
      partnerSelect.appendChild(option);
    });
  }
  addOptions(clients, "client");
  addOptions(fournisseurs, "fournisseur");
}

// Ajouter un nouveau client/fournisseur
function addPartner() {
  const type = document.getElementById("partnerType").value;
  const nom = document.getElementById("partnerNom").value.trim();
  const adresse = document.getElementById("partnerAdresse").value.trim();
  const npa = document.getElementById("partnerNPA").value.trim();
  const localite = document.getElementById("partnerLocalite").value.trim();
  const contact = document.getElementById("partnerContact").value.trim();

  if (!nom) return alert("Le nom est obligatoire.");

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
}

// Ajouter une transaction
function addTransaction() {
  const type = document.getElementById("type").value;
  const descInput = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  if (isNaN(amount) || amount <= 0) return alert("Veuillez entrer un montant valide.");

  // Récupérer le partenaire sélectionné
  const partnerValue = partnerSelect.value;
  let partnerNom = "";
  if (partnerValue) {
    const [typeP, index] = partnerValue.split(":");
    if (typeP === "client") partnerNom = clients[index]?.nom || "";
    else if (typeP === "fournisseur") partnerNom = fournisseurs[index]?.nom || "";
  }

  // Construire la description finale
  const fullDesc = partnerNom ? `[${partnerNom}] ${descInput}` : descInput;

  const date = new Date().toISOString().split("T")[0];
  transactionList.push({
    date,
    type,
    desc: fullDesc,
    amount,
    validated: false,
    username
  });

  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  partnerSelect.value = "";
}

// Export CSV
function exportCSV() {
  const rows = [
    ["Date", "Type", "Description", "Montant", "Solde", "État", "Utilisateur"]
  ];
  let runningBalance = 5000.00;
  transactionList.forEach(tx => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    runningBalance += signedAmount;
    rows.push([
      tx.date,
      tx.type,
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

// Effacer toutes les transactions
function clearTransactions() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    transactionList = [];
    localStorage.removeItem("transactions");
