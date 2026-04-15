(function () {
  "use strict";

  const STORAGE_KEY = "todo-app-data";

  const $input = document.getElementById("todoInput");
  const $addBtn = document.getElementById("addBtn");
  const $list = document.getElementById("todoList");
  const $counter = document.getElementById("counter");
  const $footer = document.getElementById("footer");
  const $clearBtn = document.getElementById("clearCompleted");
  const $emptyState = document.getElementById("emptyState");
  const $filterBtns = document.querySelectorAll(".filter-btn");

  let todos = loadTodos();
  let currentFilter = "all";

  /* ---- Persistence ---- */

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* ---- Render ---- */

  function render() {
    const filtered = todos.filter((t) => {
      if (currentFilter === "active") return !t.completed;
      if (currentFilter === "completed") return t.completed;
      return true;
    });

    $list.innerHTML = "";

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      li.innerHTML = `
        <div class="checkbox" title="切换完成状态"></div>
        <span class="todo-text">${escapeHTML(todo.text)}</span>
        <div class="actions">
          <button class="btn-edit" title="编辑">✏️</button>
          <button class="btn-delete" title="删除">🗑️</button>
        </div>
      `;

      $list.appendChild(li);
    });

    const activeCount = todos.filter((t) => !t.completed).length;
    $counter.textContent = `${activeCount} 项待办`;

    const hasCompleted = todos.some((t) => t.completed);
    $clearBtn.style.display = hasCompleted ? "inline" : "none";

    $footer.classList.toggle("hidden", todos.length === 0);
    $emptyState.classList.toggle("hidden", filtered.length > 0);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---- Actions ---- */

  function addTodo() {
    const text = $input.value.trim();
    if (!text) return;

    todos.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
    });

    $input.value = "";
    saveTodos();
    render();
    $input.focus();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    const li = $list.querySelector(`[data-id="${id}"]`);
    if (li) {
      li.classList.add("removing");
      li.addEventListener("animationend", () => {
        todos = todos.filter((t) => t.id !== id);
        saveTodos();
        render();
      });
    }
  }

  function startEdit(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const li = $list.querySelector(`[data-id="${id}"]`);
    const textSpan = li.querySelector(".todo-text");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = todo.text;

    textSpan.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
      const newText = input.value.trim();
      if (newText && newText !== todo.text) {
        todo.text = newText;
        saveTodos();
      }
      render();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        input.removeEventListener("blur", commit);
        render();
      }
    });
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;
    $filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    render();
  }

  /* ---- Event Listeners ---- */

  $addBtn.addEventListener("click", addTodo);

  $input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
  });

  $list.addEventListener("click", (e) => {
    const li = e.target.closest(".todo-item");
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.closest(".checkbox")) return toggleTodo(id);
    if (e.target.closest(".btn-delete")) return deleteTodo(id);
    if (e.target.closest(".btn-edit")) return startEdit(id);
  });

  $clearBtn.addEventListener("click", clearCompleted);

  $filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  /* ---- Init ---- */
  render();
})();
