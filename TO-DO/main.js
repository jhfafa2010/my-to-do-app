const STORAGE_KEY = 'todos';

let todos = []; // { id: number, text: string, completed: boolean }
let nextId = 1; // 새 항목에 부여할 다음 id
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

// initApp()에서 채워지는 DOM 참조
let listEl;
let emptyMessageEl;
let statsEl;
let filterAreaEl;
let clearCompletedBtn;

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 저장된 데이터를 불러오고, 기존 항목과 겹치지 않도록 nextId를 재계산
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    todos = [];
  }
  nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

// 현재 필터에 맞는 항목만 반환
function getFilteredTodos() {
  if (currentFilter === 'active') return todos.filter((t) => !t.completed);
  if (currentFilter === 'completed') return todos.filter((t) => t.completed);
  return todos;
}

// todos 배열을 기준으로 목록 DOM을 처음부터 다시 그림
function renderTodos() {
  listEl.innerHTML = '';

  const filteredTodos = getFilteredTodos();

  filteredTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;

    // textContent 사용: 사용자 입력을 innerHTML로 넣지 않아 XSS 방지
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });

  // 현재 필터 기준으로 항목이 없을 때만 안내 문구를 보여줌
  emptyMessageEl.classList.toggle('hidden', filteredTodos.length > 0);

  updateStats();
  saveTodos();
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  statsEl.textContent = `전체 ${total}개 · 완료 ${completed}개`;
}

// 입력창 값으로 새 할 일을 추가 (추가 버튼 클릭 / Enter 키 공용)
function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();

  if (!text) {
    alert('할 일을 입력하세요');
    input.focus();
    return;
  }

  const isDuplicate = todos.some((t) => t.text === text);
  if (isDuplicate) {
    alert('이미 등록된 할 일입니다');
    input.focus();
    return;
  }

  todos.push({ id: nextId++, text, completed: false });
  input.value = '';
  input.focus();
  renderTodos();
}

// 체크박스 토글: 완료/미완료 상태를 반전
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    renderTodos();
  }
}

// 삭제 버튼: 해당 id 항목을 배열에서 제거
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  renderTodos();
}

// 필터 버튼 클릭: 필터 상태를 바꾸고 다시 그림
function setFilter(filter) {
  currentFilter = filter;

  [...filterAreaEl.querySelectorAll('.filter-btn')].forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  renderTodos();
}

// 완료된 항목을 한번에 삭제
function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  renderTodos();
}

function initApp() {
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  listEl = document.getElementById('todo-list');
  emptyMessageEl = document.getElementById('empty-message');
  statsEl = document.getElementById('todo-stats');
  filterAreaEl = document.getElementById('filter-area');
  clearCompletedBtn = document.getElementById('clear-completed-btn');

  addBtn.addEventListener('click', addTodo);

  filterAreaEl.addEventListener('click', (e) => {
    if (e.target.matches('.filter-btn')) {
      setFilter(e.target.dataset.filter);
    }
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Enter 키로도 추가 가능하게
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  // 항목(li)이 동적으로 생성/삭제되므로 목록 자체(listEl)에 이벤트를 위임
  listEl.addEventListener('click', (e) => {
    if (e.target.matches('.delete-btn')) {
      const id = Number(e.target.closest('.todo-item').dataset.id);
      deleteTodo(id);
    }
  });

  listEl.addEventListener('change', (e) => {
    if (e.target.matches('.todo-checkbox')) {
      const id = Number(e.target.closest('.todo-item').dataset.id);
      toggleTodo(id);
    }
  });

  loadTodos(); // localStorage에 저장된 데이터 복원
  renderTodos();
}

initApp();
