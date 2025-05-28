// Variables globales
let balance = 5000.0;
let username = null;

let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let partnersList = JSON.parse(localStorage.getItem("partners")) || [];

// Eléments DOM
const userSection = document.getElementById("user-section");
const usernameInput = document.getElementById("usernameInput");
const setUsernameBtn = document.getElementById("setUsernameBtn");

const mainApp = document.getElementById("main-app");
const balanceSpan = document.getElementById("balance");
const transactionsBody = document.getElementById("transactionsBody");

const partnerSelect = document.getElementById("partnerSelect");
const addPartnerBtn = document.getElementById("addPartnerBtn");

const partnerForm = document.getElementById("partnerForm");
const partnerNameInput = document.getElementById("partnerName");
const partnerAddressInput = document.getElementById("partnerAddress");
const partnerNPAInput = document.getElementById("partnerNPA");
const partnerLocalityInput = document.getElementById("partnerLocality");
const partnerContactInput = document.getElementById("partnerContact");
const savePartnerBtn = document.getElementById("savePartnerBtn");
const cancelPartnerBtn = document.getElementById("cancelPartnerBtn");

const typeSelect = document.getElementById("typeSelect");
const descInput = document.getElementById("descInput");
const amountInput = document.getElementById("amountInput");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const exportCSVBtn = document.getElementById("exportCSVBtn");
const clearTransactionsBtn = document.getElementById("clearTransactionsBtn");

// Initialisation

function init() {
  // Vérifier si username stocké
  username = localStorage.getItem("username");
  if (username) {
    usernameInput.value = username;
    showMainApp();
  } else {
    showUserSection();
  }

  renderPartners();
  updateTable();
}

// Affiche la section user, cache l'app principale
function showUserSection() {
  userSection.classList.remove("hidden");
  mainApp.classList.add("hidden");
}

// Affiche l'app principale, cache la section user
function showMainApp() {
  userSection.classList.add("hidden");
  mainApp.classList.remove("hidden");
  balanceSpan.textContent = balance.toFixed(2);
}

// Sauvegarde username et affiche app principale
setUsernameBtn.onclick = () => {
  const val = usernameInput.value.trim();
  if (!val) {
    alert("Veuillez entrer un nom d'utilisateur.");
    return;
  }
  username = val;
  localStorage.setItem("username", username);
  showMainApp();
};

// Gestion partenaires

addPartnerBtn.onclick = () => {
  partnerForm.classList.remove("hidden");
  addPartnerBtn.disabled = true;
};

cancelPartnerBtn.onclick = () => {
  partnerForm.classList.add("hidden");
  addPartnerBtn.disabled = false;
  clearPartnerForm();
};

savePartnerBtn.onclick = () => {
  const name = partnerNameInput.value.trim();
  const address = partnerAddressInput.value.trim();
  const npa = partnerNPAInput.value.trim();
  const locality = partnerLocalityInput.value.trim();
  const contact = partnerContactInput.value.trim();

  if (!name) {
    alert("Le nom est obligatoire.");
    return;
  }

  partnersList.push({ name, address, npa, locality, contact });
  localStorage.setItem("partners", JSON.stringify(partnersList));
  renderPartners();
  clearPartnerForm();
  partnerForm.classList.add("hidden");
  addPartnerBtn.disabled = false;
};

function clearPartnerForm() {
  partnerNameInput.value = "";
  partnerAddressInput
