// ======== STATE ========
let items = [];
let movements = [];
let query = "";
let sortBy = "code-asc";
const ITEMS_KEY = "inventory-mini:items";
const MOVEMENTS_KEY = "inventory-mini:movements";

// ======== ELEMENT ========
const formSection = document.getElementById("formSection");
const summarySection = document.getElementById("summarySection");
const listSection = document.getElementById("listSection");
const movementSection = document.getElementById("movementSection");
const reportMovementSection = document.getElementById("reportMovementSection");

const codeInput = document.getElementById("codeInput");
const nameInput = document.getElementById("nameInput");
const qtyInput = document.getElementById("qtyInput");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// ======== FUNCTION ========
function saveAll() {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
}

function loadAll() {
  try {
    const rawItems = localStorage.getItem(ITEMS_KEY);
    items = rawItems ? JSON.parse(rawItems) : [];

    const rawMovements = localStorage.getItem(MOVEMENTS_KEY);
    movements = rawMovements ? JSON.parse(rawMovements) : [];
  } catch {
    items = [];
    movements = [];
  }
}

function init() {
  loadAll();
  render();
}

function addItem() {
  const codeValue = codeInput.value.trim();
  const nameValue = nameInput.value.trim();
  const qtyValue = Number(qtyInput.value);

  if (!codeValue || codeValue === "") return;
  if (!nameValue || nameValue === "") return;
  if (!qtyValue || qtyValue <= 0) return;

  const exists = items.some(
    (item) => item.code.toLowerCase() === codeValue.toLowerCase(),
  );

  if (exists) return;

  let item = {
    id: Date.now(),
    code: codeValue,
    name: nameValue,
    qty: qtyValue,
  };

  items.push(item);
  saveAll();
  resetForm();
}

function deleteItem(itemId) {
  const id = Number(itemId);
  const newItems = items.filter((item) => item.id !== id);
  const newMovements = movements.filter((movement) => movement.itemId !== id);

  items = newItems;
  movements = newMovements;

  saveAll();

  render();
}

function summaryItems() {
  const visible = applySearchAndSort(items);
  return visible.reduce((sum, item) => sum + item.qty, 0);
}

function topMovements() {
  const movedMap = new Map();

  movements.forEach((m) => {
    const prevValue = movedMap.get(m.itemId) || 0;
    movedMap.set(m.itemId, prevValue + m.qty);
  });

  const movedArray = Array.from(movedMap.entries());

  const enrichedData = [];

  for (const [itemId, totalQty] of movedArray) {
    const item = items.find((i) => i.id === itemId);
    if (!item) continue;

    enrichedData.push({
      code: item.code,
      name: item.name,
      totalQty: totalQty,
    });
  }

  const top5Items = enrichedData
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  return top5Items;
}

function renderTable() {
  const visible = applySearchAndSort(items);

  if (visible.length === 0) {
    listSection.innerHTML = "No Data";
    return;
  }

  let table = `<table border="1">
    <thead>
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Qty</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>`;

  visible.forEach((item) => {
    table += `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>
      <button class="in-btn" data-id="${item.id}">+</button>
      <button class="out-btn" data-id="${item.id}">-</button>
      <button class="delete-btn" data-id="${item.id}">Delete</button>
      </td>
    </tr>`;
  });

  table += `</tbody>
  </table>`;

  listSection.innerHTML = table;
}

function renderReportTopMovements() {
  const top5Items = topMovements();
  if (top5Items.length === 0) return;

  let table = `<table border="1">
    <thead>
      <tr>
        <th>Code</th>
        <th>Name</th>
        <th>Total Qty</th>
      </tr>
    </thead>
    <tbody>`;

  top5Items.forEach((item) => {
    table += `<tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.totalQty}</td>
    </tr>`;
  });

  table += `</tbody>
  </table>`;

  reportMovementSection.innerHTML = table;
}

function renderMovements() {
  const lastMovements = movements.slice(-10).reverse();
  if (lastMovements.length == 0) return;

  let table = `<table border="1">
    <thead>
      <tr>
        <th>Time</th>
        <th>Code</th>
        <th>Type</th>
        <th>Qty</th>
      </tr>
    </thead>
    <tbody>`;

  lastMovements.forEach((movement) => {
    const item = items.find((item) => item.id === movement.itemId);
    const code = item ? item.code : "";
    const time = new Date(movement.at).toLocaleString();

    table += `<tr>
      <td>${time}</td>
      <td>${code}</td>
      <td>${movement.type}</td>
      <td>${movement.qty}</td>
    </tr>`;
  });

  table += `</tbody></table>`;

  movementSection.innerHTML = table;
}

function renderSummary() {
  summarySection.innerHTML = `<span>Total Qty: ${summaryItems()} || Total SKU: ${items.length}</span>`;
}

function render() {
  renderTable();
  renderSummary();
  renderMovements();
  renderReportTopMovements();
}

function resetForm() {
  codeInput.value = "";
  nameInput.value = "";
  qtyInput.value = "";
  codeInput.focus();
}

function adjustStock(itemId, type, qty) {
  const item = items.find((item) => item.id === itemId);
  if (!item) return;

  if (!qty || qty <= 0) return;

  if (type === "OUT" && item.qty < qty) {
    alert("insufficient stock");
    return;
  }

  if (type === "IN") item.qty += qty;
  if (type === "OUT") item.qty -= qty;

  let movement = {
    id: Date.now(),
    itemId: item.id,
    type: type,
    qty: qty,
    at: new Date().toISOString(),
  };

  movements.push(movement);
  saveAll();
  render();
}

function handleStock(itemId, type) {
  const input = prompt(`Qty for ${type}:`);
  if (input === null) return;

  const qty = Number(input);
  adjustStock(itemId, type, qty);
}

function applySearchAndSort(list) {
  // Step 1: Filter by query
  let result = list.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  });

  // Step 2: Sort
  result.sort((a, b) => {
    if (sortBy === "code-asc") return a.code.localeCompare(b.code);
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "qty-desc") return b.qty - a.qty;
    return 0;
  });

  return result;
}

// ======== EVENT ========
listSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const itemId = event.target.getAttribute("data-id");
    deleteItem(itemId);
  }

  if (event.target.classList.contains("in-btn")) {
    const itemId = Number(event.target.getAttribute("data-id"));
    handleStock(itemId, "IN");
  }

  if (event.target.classList.contains("out-btn")) {
    const itemId = Number(event.target.getAttribute("data-id"));
    handleStock(itemId, "OUT");
  }
});

searchInput.addEventListener("input", function () {
  query = searchInput.value;
  render();
});

sortSelect.addEventListener("change", function () {
  sortBy = sortSelect.value;
  render();
});

addBtn.addEventListener("click", function () {
  addItem();
  render();
});

init();
