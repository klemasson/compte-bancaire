let balance = 5000.00;
let transactionList = JSON.parse(localStorage.getItem("transactions")) || [];
let username = localStorage.getItem("username") || prompt("Entrez votre nom d'utilisateur :");

if (!username) {
  alert("Un nom d'utilisateur est requis !");
  location.reload();
} else {
  localStorage.setItem("username", username);
}

const transactions = document.getElementById("transactions");
const balanceSpan = document.getElementById("balance");

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
  if (isNaN(amount) || amount <= 0) return alert("Veuillez entrer un montant valide.");

  const date = new Date().toISOString().split("T")[0];
  transactionList.push({
    date,
    type,
    desc,
    amount,
    validated: false,
    username: username
  });

  localStorage.setItem("transactions", JSON.stringify(transactionList));
  updateTable();

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
}

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

function clearTransactions() {
  if (confirm("Voulez-vous vraiment tout effacer ?")) {
    transactionList = [];
    localStorage.removeItem("transactions");
    updateTable();
  }
}

updateTable();
