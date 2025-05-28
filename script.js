// Déclare les fonctions en global (window.) pour qu'elles soient accessibles depuis le HTML (onclick)

window.username = localStorage.getItem("username") || null;

function askUsername() {
  if (!window.username) {
    window.username = prompt("Entrez votre nom d'utilisateur :");
    if (!window.username) {
      alert("Un nom d'utilisateur est requis !");
      location.reload();
    } else {
      localStorage.setItem("username", window.username);
    }
  }
}

window.transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
window.balance = 5000.00;

const transactions = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

window.updateTable = function() {
  transactions.innerHTML = "";
  window.balance = 5000.00;

  window.transactionList.forEach((tx, index) => {
    const signedAmount = ["Dépôt"].includes(tx.type) ? tx.amount : -tx.amount;
    window.balance += signedAmount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.type}</td>
      <td>${tx.desc}</td>
      <td>${signedAmount.toFixed(2)}</td>
      <td>${window.balance.toFixed(2)}</td>
      <td>
        <i class="fas ${tx.validated ? 'fa-check-circle' : 'fa-times-circle'}" 
           style="color:${tx.validated ? 'green' : 'red'}; cursor:pointer;" 
           onclick="toggleValidation(${index})"></i>
      </td>
      <td>${tx.username}</td>
    `;
    transactions.appendChild(row);
  });

  balanceSpan.textContent = window.balance.toFixed(2);
}

window.toggleValidation = function(index) {
  window.transactionList[index].validated = !window.transactionList[index].validated;
  localStorage.setItem("transactions", JSON.stringify(window.transactionList));
  window.updateTable();
}

window.addTransaction = function() {
  const type = document.getElementById("type").value;
  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  if (isNaN(amount) || amount <= 0) return alert("Veuillez entrer un montant valide.");

  const date = new Date().toISOString().split("T")[0];
  window.transactionList.push({
    date,
    type,
    desc,
    amount,
    validated: false,
    username: window.username
  });

  localStorage.setItem("transactions", JSON.stringify(window.transactionList));
  window.updateTable();

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

window.exportCSV = function() {
  const rows = [
    ["Date", "Type", "Description", "Montant", "Solde", "État", "Utilisateur"]
  ];
  let runningBalance = 5000.00;
  window.transactionList.forEach(tx => {
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

window.clearTransactions = function() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    window.transactionList = [];
    localStorage.removeItem("transactions");
    window.updateTable();
  }
}

// Démarre la demande de username puis update la table
askUsername();
updateTable();
