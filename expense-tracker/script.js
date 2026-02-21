const STORAGE_KEY = "expense-tracker";
let expenses = [];
let filters = {
  category: "All",
  from: "",
  to: "",
};

// ========== SECTION ==========
const formSection = document.getElementById("formSection");
const summarySection = document.getElementById("summarySection");
const listSection = document.getElementById("listSection");

// ========== INPUT ==========
const inputDate = document.getElementById("inputDate");
const inputAmount = document.getElementById("inputAmount");
const selectCategory = document.getElementById("selectCategory");
const inputNote = document.getElementById("inputNote");
const addBtn = document.getElementById("addBtn");

// ========== FILTER ==========
const filterCategory = document.getElementById("filterCategory");
const filterDateFrom = document.getElementById("dateFrom");
const filterDateTo = document.getElementById("dateTo");
const resetFilterBtn = document.getElementById("resetFilterBtn");

const exportCsvBtn = document.getElementById("exportCsvBtn");

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    expenses = raw ? JSON.parse(raw) : [];
  } catch {
    expenses = [];
  }
}

function init() {
  loadExpenses();
  render();
}

// ========== ADD ==========
function addExpense() {
  const dateValue = inputDate.value;
  const amountValue = Number(inputAmount.value);
  const categoryValue = selectCategory.value;
  const noteValue = inputNote.value;

  if (!dateValue) return;
  if (!amountValue || amountValue <= 0) return;
  if (!categoryValue || categoryValue === "") return;

  let expense = {
    id: Date.now(),
    date: dateValue,
    amount: amountValue,
    category: categoryValue,
    note: noteValue,
  };

  expenses.push(expense);
  saveExpenses();
  resetForm();
}

// ========== DELETE ==========
function deleteExpense(expenseId) {
  const newExpenses = expenses.filter(
    (expense) => expense.id !== Number(expenseId),
  );
  expenses = newExpenses;
  saveExpenses();
  render();
}

// ========== SUMMARY ==========
function summaryExpense() {
  let visibleExpenses = applyFilters(expenses, filters);
  return visibleExpenses.reduce(
    (amount, expense) => amount + expense.amount,
    0,
  );
}

function applyFilters(expenseList, currentFilters) {
  let filteredData = expenseList;

  if (currentFilters.category !== "All") {
    filteredData = filteredData.filter(
      (expense) => expense.category === currentFilters.category,
    );
  }

  if (currentFilters.from) {
    filteredData = filteredData.filter(
      (expense) => expense.date >= currentFilters.from,
    );
  }

  if (currentFilters.to) {
    filteredData = filteredData.filter(
      (expense) => expense.date <= currentFilters.to,
    );
  }

  return filteredData;
}

function updateFilters() {
  filters.category = filterCategory.value;
  filters.from = filterDateFrom.value;
  filters.to = filterDateTo.value;

  render();
}

function resetFilters() {
  filters = {
    category: "All",
    from: "",
    to: "",
  };

  filterCategory.value = "All";
  filterDateFrom.value = "";
  filterDateTo.value = "";

  render();
}

function resetForm() {
  inputDate.value = "";
  inputAmount.value = "";
  selectCategory.value = "";
  inputNote.value = "";
}

function convertToCSV(filteredExpenses) {
  const header = "Date,Amount,Category,Note";

  let rows = [];
  filteredExpenses.forEach((expense) => {
    const data = `${expense.date},${expense.amount},${expense.category},${expense.note}`;
    rows.push(data);
  });

  let csvString = [header, ...rows].join("\n");
  return csvString;
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportCSV() {
  const filteredExpenses = applyFilters(expenses, filters);

  if (filteredExpenses.length === 0) {
    alert("No data to export");
    return;
  }
  const csvString = convertToCSV(filteredExpenses);
  downloadFile(csvString, "expenses.csv");
}

// ========== RENDER ==========
function renderTable() {
  let visibleExpenses = applyFilters(expenses, filters);

  if (visibleExpenses.length === 0) {
    listSection.innerHTML = "<span>No Expenses found.</span>";
    return;
  }

  let table = `
        <table border="1">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Note</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

  visibleExpenses.forEach((expense) => {
    table += `
            <tr>
                <td>${expense.date}</td>
                <td>${expense.amount}</td>
                <td>${expense.category}</td>
                <td>${expense.note}</td>
                <td><button class="delete-btn" data-id="${expense.id}">Delete</button></td>
            </tr>
        `;
  });

  table += `</tbody></table>`;

  listSection.innerHTML = table;
}

function renderSummary() {
  summarySection.innerHTML = `Total Expenditures: ${summaryExpense()}`;
}

function render() {
  renderTable();
  renderSummary();
}

// ========== EVENT ==========
listSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const expenseId = event.target.getAttribute("data-id");
    deleteExpense(expenseId);
  }
});

addBtn.addEventListener("click", function () {
  addExpense();
  render();
});

filterCategory.addEventListener("change", updateFilters);
filterDateFrom.addEventListener("change", updateFilters);
filterDateTo.addEventListener("change", updateFilters);
resetFilterBtn.addEventListener("click", resetFilters);

exportCsvBtn.addEventListener("click", exportCSV);

init();
