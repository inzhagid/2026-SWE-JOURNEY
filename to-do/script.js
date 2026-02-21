let todos = [];

const inputTodo = document.getElementById("inputTodo");
const addBtn = document.getElementById("addBtn");

const formSection = document.getElementById("formSection");
const listSection = document.getElementById("listSection");

function addTodo() {
  const todoValue = inputTodo.value.trim();
  if (!todoValue) return alert("Todo is required!");

  let todo = {
    id: Date.now(),
    todo: todoValue,
  };

  todos.push(todo);

  inputTodo.value = "";
  inputTodo.focus();
}

function deleteTodo(todoId) {
  const id = Number(todoId);
  const newTodos = todos.filter((todo) => todo.id !== id);
  todos = newTodos;
  render();
}

function render() {
  let todoList = `<ul>`;

  for (let todo of todos) {
    todoList += `<li>
    ${todo.todo}
    <button class='deleteBtn' data-id=${todo.id}>Delete</button>
    </li>`;
  }

  todoList += `</ul>`;

  listSection.innerHTML = todoList;
}

addBtn.addEventListener("click", function () {
  addTodo();
  render();
});

listSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("deleteBtn")) {
    const todoId = event.target.getAttribute("data-id");
    deleteTodo(todoId);
  }
});
