const STORAGE_KEY = 'snakeHighScore';
const GRID_SIZE = 20; // 20x20 격자
const CELL_SIZE = 20; // 격자 한 칸의 픽셀 크기 (400 / 20)
const DEFAULT_TICK_MS = 150; // 난이도 select의 기본값(보통)과 동일하게 맞춤
const LEVEL_SCORE_STEP = 50; // 이 점수만큼 오를 때마다 레벨업
const LEVEL_SPEED_STEP = 10; // 레벨업마다 tick 간격을 줄이는 양(ms) = 속도 증가
const MIN_TICK_MS = 20; // 레벨이 아무리 올라도 이보다 빨라지지는 않도록 하한선을 둠

// 키 이름 → 이동 벡터
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

let snake = []; // { x, y } 배열, snake[0]이 머리
let direction = DIRECTIONS.ArrowRight; // 현재 이동 중인 방향
let nextDirection = DIRECTIONS.ArrowRight; // 키 입력으로 예약된 다음 방향(다음 tick에 반영)
let food = { x: 0, y: 0 };
let score = 0;
let highScore = 0;
let level = 1;
let baseTickMs = DEFAULT_TICK_MS; // 시작 시 난이도 select에서 고른 값
let currentTickMs = DEFAULT_TICK_MS; // 레벨업에 따라 baseTickMs에서 점점 줄어드는 실제 속도
let gameLoopId = null; // setInterval 핸들, 게임 오버/일시정지 시 정리하기 위해 보관
let isRunning = false;
let isPaused = false;

// initApp()에서 채워지는 DOM 참조
let canvas;
let ctx;
let scoreEl;
let highScoreEl;
let levelEl;
let finalScoreEl;
let startBtn;
let restartBtn;
let pauseBtn;
let gameOverPanel;
let difficultySelect;

// localStorage에 저장된 최고 점수를 불러옴 (없거나 잘못된 값이면 0)
function loadHighScore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  highScore = raw ? Number(raw) || 0 : 0;
}

function saveHighScore() {
  localStorage.setItem(STORAGE_KEY, String(highScore));
}

// 뱀이 차지하지 않은 빈 칸 중 하나를 무작위로 골라 먹이를 배치
function spawnFood() {
  const emptyCells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!snake.some((seg) => seg.x === x && seg.y === y)) {
        emptyCells.push({ x, y });
      }
    }
  }
  food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// 캔버스를 지우고 먹이 + 뱀(머리는 다른 색)을 다시 그림
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e05252';
  ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#4caf7d' : '#3f9c6c';
    ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  });
}

function updateScoreDisplay() {
  scoreEl.textContent = String(score);
  highScoreEl.textContent = String(highScore);
}

function updateLevelDisplay() {
  levelEl.textContent = String(level);
}

// 현재 currentTickMs로 tick 루프를 다시 시작 (레벨업으로 속도가 바뀔 때 사용)
function restartLoop() {
  clearInterval(gameLoopId);
  gameLoopId = setInterval(gameTick, currentTickMs);
}

// 매 tick마다 한 칸 전진: 충돌 체크 → 이동 → 먹이 처리 순으로 진행
function gameTick() {
  direction = nextDirection;

  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
  const hitSelf = snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y);

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  snake.unshift(newHead); // 새 머리를 맨 앞에 추가

  if (newHead.x === food.x && newHead.y === food.y) {
    // 먹이를 먹으면 꼬리를 자르지 않아 몸이 한 칸 길어짐
    score += 10;
    updateScoreDisplay();
    checkLevelUp();
    spawnFood();
  } else {
    snake.pop(); // 먹이가 아니면 꼬리를 제거해 길이 유지
  }

  draw();
}

// LEVEL_SCORE_STEP점마다 레벨을 올리고, 그만큼 tick 간격을 줄여 게임 속도를 높임
function checkLevelUp() {
  const newLevel = Math.floor(score / LEVEL_SCORE_STEP) + 1;
  if (newLevel === level) return;

  level = newLevel;
  currentTickMs = Math.max(MIN_TICK_MS, baseTickMs - (level - 1) * LEVEL_SPEED_STEP);
  updateLevelDisplay();
  restartLoop();
}

// 게임 시작/다시 시작 버튼 공용: 상태를 초기화하고 tick 루프를 새로 돎
function startGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = DIRECTIONS.ArrowRight;
  nextDirection = DIRECTIONS.ArrowRight;
  score = 0;
  level = 1;
  baseTickMs = Number(difficultySelect.value); // 시작 시점의 난이도 선택을 고정
  currentTickMs = baseTickMs;
  isRunning = true;
  isPaused = false;

  updateScoreDisplay();
  updateLevelDisplay();
  spawnFood();
  draw();

  gameOverPanel.classList.add('hidden');
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  pauseBtn.textContent = '일시정지';
  difficultySelect.disabled = true; // 진행 중 변경해도 다음 판부터 적용되므로 혼동 방지를 위해 잠금

  if (gameLoopId) clearInterval(gameLoopId); // 재시작 시 이전 루프가 남아있지 않도록 정리
  gameLoopId = setInterval(gameTick, currentTickMs);
}

// 충돌 발생 시 호출: 루프를 멈추고 최고 점수를 갱신한 뒤 게임 오버 화면을 띄움
function endGame() {
  isRunning = false;
  isPaused = false;
  clearInterval(gameLoopId);
  gameLoopId = null;

  if (score > highScore) {
    highScore = score;
    saveHighScore();
    updateScoreDisplay();
  }

  finalScoreEl.textContent = `최종 점수: ${score}`;
  gameOverPanel.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  difficultySelect.disabled = false;
}

// 일시정지 버튼: 루프를 멈추거나 currentTickMs 속도로 재개하고, 버튼 텍스트를 상태에 맞게 바꿈
function togglePause() {
  if (!isRunning) return;

  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(gameLoopId);
    gameLoopId = null;
    pauseBtn.textContent = '계속하기';
  } else {
    gameLoopId = setInterval(gameTick, currentTickMs);
    pauseBtn.textContent = '일시정지';
  }
}

// 진행 중인 방향의 정반대로는 즉시 반전할 수 없도록 막음(자기 몸으로 바로 부딪히는 것 방지)
function handleKeydown(e) {
  if (!isRunning || isPaused) return;

  const newDir = DIRECTIONS[e.key];
  if (!newDir) return;

  const isReverse = newDir.x === -direction.x && newDir.y === -direction.y;
  if (isReverse) return;

  nextDirection = newDir;
}

// DOM 참조를 캐싱하고 이벤트를 연결한 뒤, 시작 전 빈 보드를 한 번 그림
function initApp() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  scoreEl = document.getElementById('score');
  highScoreEl = document.getElementById('high-score');
  levelEl = document.getElementById('level');
  finalScoreEl = document.getElementById('final-score');
  startBtn = document.getElementById('start-btn');
  restartBtn = document.getElementById('restart-btn');
  pauseBtn = document.getElementById('pause-btn');
  gameOverPanel = document.getElementById('game-over-panel');
  difficultySelect = document.getElementById('difficulty-select');

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', togglePause);
  document.addEventListener('keydown', handleKeydown);

  loadHighScore();
  updateScoreDisplay();
  updateLevelDisplay();

  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  food = { x: 15, y: 10 };
  draw();
}

initApp();
