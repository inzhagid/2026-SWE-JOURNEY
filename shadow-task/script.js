let items = [];
let editingId = null;

const inputText = document.getElementById("inputText");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formSection = document.getElementById("form-section");
const renderList = document.getElementById("render-list");

// ===== ADD =====
function addItem() {
  const inputValue = inputText.value.trim();
  if (!inputValue) return;

  let item = {
    id: Date.now(),
    text: inputValue,
  };

  items.push(item);
}

// ===== DELETE =====
function deleteItem(itemId) {
  const newItems = items.filter((item) => item.id !== itemId);
  items = newItems;
  render();
  resetEditing();
}

// ===== EDIT =====
function startEdit(itemId) {
  const item = items.find((item) => item.id === itemId);
  if (!item) {
    return;
  }
  inputText.value = item.text;
  editingId = item.id;

  if (editingId) {
    addBtn.textContent = "Save";
    cancelBtn.style.display = "block";
  }
}

function saveEdit() {
  const item = items.find((item) => item.id === editingId);
  const inputValue = inputText.value.trim();

  if (inputValue === "") {
    resetEditing();
    return;
  }

  item.text = inputValue;
  render();
  resetEditing();
}

function resetEditing() {
  editingId = null;
  inputText.value = "";
  inputText.focus();
  addBtn.textContent = "Add";
  cancelBtn.style.display = "none";
}

// ===== RENDER =====
function render() {
  renderList.innerHTML = "";
  const ul = document.createElement("ul");

  for (let item of items) {
    const li = document.createElement("li");
    li.textContent = item.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    li.append(deleteBtn);

    deleteBtn.addEventListener("click", function () {
      deleteItem(item.id);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    li.append(editBtn);

    editBtn.addEventListener("click", function () {
      startEdit(item.id);
    });

    ul.append(li);
  }

  renderList.append(ul);
}

// ===== EVENT =====
addBtn.addEventListener("click", function () {
  if (editingId) {
    saveEdit();
  } else {
    addItem();
    render();
  }
});

cancelBtn.addEventListener("click", function () {
  resetEditing();
});
