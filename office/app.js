/* 숲이의 3D 지휘실 */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const MOTION_KEY = 'office.motion.v1';
  const TODOS_KEY  = 'office.todos.v1';
  const LOUNGE_KEY = 'office.lounge.v1';

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (err) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* private mode */ }
    }
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ── 방 정보 ─────────────────────────────────────────── */
  const ROOMS = {
    hq:     { ico: '👑', name: '지휘실',          sub: '메인 비서 숲이',        active: true  },
    shop:   { ico: '🪙', name: '포인트·쇼핑',     sub: '매일 아침 포인트와 할인', active: true  },
    invest: { ico: '📈', name: '투자·ETF',        sub: '월 적립과 종가 자동 갱신', active: true  },
    life:   { ico: '🌙', name: '생활·기록',       sub: '하루의 시작과 끝',       active: true  },
    lab:    { ico: '🧪', name: '연구소·프로젝트', sub: '직접 만든 웹앱과 할 일', active: true  },
    lounge: { ico: '🛋️', name: '라운지',          sub: '쉬어가는 자리',          active: false },
    brief:  { ico: '🌿', name: 'Lv.3 숲이',       sub: '전체 루틴 요약' }
  };

  const CHEERS = [
    '오늘도 조용히, 하지만 꾸준히 돌고 있어요.',
    '잘 안 풀리는 날은 잠깐 멈춰도 괜찮아요.',
    '작은 체크 하나가 하루를 단단하게 만들어요.',
    '숨 한 번 크게 쉬고, 다시 가볍게 시작해요.',
    '어제보다 반 걸음이면 충분해요.',
    '지금 이 순간도 잘 굴러가고 있어요.',
    '물 한 잔 마시고 어깨 한 번 풀어요.',
    '오늘의 기록은 내일의 나에게 보내는 편지예요.',
    '모르는 건 천천히, 아는 건 차곡차곡.',
    '잘하고 있으니 너무 몰아붙이지 않기로 해요.',
    '해가 짧아졌어요. 따뜻하게 입고 다녀요.',
    '하기 싫은 일 하나만, 딱 5분만 해봐요.'
  ];

  const ROUTINE = [
    { t: '06:58', d: '전체 브리핑', note: '지휘실' },
    { t: '07:00', d: '아침 기록', note: '생활' },
    { t: '09:00', d: '주말 기상 알림', note: '토·일' },
    { t: '10:00', d: '유니클로 할인 체크', note: '포인트' },
    { t: '10:30', d: '네이버페이 포인트', note: '포인트' },
    { t: '10:40', d: 'G마켓 포인트', note: '포인트' },
    { t: '16:10', d: 'ETF 종가 갱신', note: '평일' },
    { t: '19:00', d: '저녁 기록', note: '생활' },
    { t: '19:30', d: '운동 알림', note: '화·목·토' },
    { t: '22:30', d: '밤 이야기', note: '생활' },
    { t: '23:00', d: '독서 알림', note: '생활' },
    { t: '23:50', d: '취침 준비', note: '생활' },
    { t: '27일 09:00', d: 'ETF 월 적립', note: '매월' }
  ];

  const MOODS = [
    { key: 'good',  ico: '😊', label: '좋아요' },
    { key: 'calm',  ico: '🙂', label: '평온' },
    { key: 'soso',  ico: '😐', label: '보통' },
    { key: 'tired', ico: '😴', label: '피곤' },
    { key: 'low',   ico: '😮‍💨', label: '지침' }
  ];

  const ETF_NAMES = [
    ['379800', 'KODEX 미국S&P500'],
    ['379810', 'KODEX 미국나스닥100'],
    ['433980', 'KODEX TDF2040액티브'],
    ['441640', 'KODEX 미국배당커버드콜액티브'],
    ['465580', 'ACE 미국빅테크TOP7 Plus'],
    ['476800', 'KODEX 한국부동산리츠인프라']
  ];

  /* ── 시트 템플릿 ─────────────────────────────────────── */
  const cheerBlock = () => `
    <div class="hero-card">
      <p class="hero-card__k">숲이의 한마디</p>
      <p class="hero-card__t" data-cheer>${pick(CHEERS)}</p>
      <button class="btn btn--ghost btn--sm" type="button" data-act="cheer">한마디 더</button>
    </div>`;

  const kv = (ico, label, value, soft = false) => `
    <div class="kv">
      <span class="kv__k"><span class="ico">${ico}</span><span>${label}</span></span>
      <span class="kv__v${soft ? ' kv__v--soft' : ''}">${value}</span>
    </div>`;

  const TEMPLATES = {
    hq: () => `
      ${cheerBlock()}
      <div class="heart"><span class="heart__dot"></span>하트비트 정상 · 루틴을 조용히 지키는 중</div>
      <div class="sec">
        <p class="sec__title">오늘의 지휘</p>
        ${kv('🌅', '전체 브리핑', '06:58')}
        ${kv('💓', '하트비트 점검', '수시')}
        ${kv('🧩', '가동 파트', '5개', true)}
      </div>
      <button class="btn btn--mint btn--block" type="button" data-act="brief">전체 루틴 요약 보기</button>`,

    brief: () => `
      ${cheerBlock()}
      <div class="sec">
        <p class="sec__title">하루 전체 루틴</p>
        <ul class="timeline">
          ${ROUTINE.map((r) => `
            <li>
              <span class="timeline__t">${r.t}</span>
              <span class="timeline__d">${r.d}<small>${r.note}</small></span>
            </li>`).join('')}
        </ul>
      </div>
      <p class="muted">알림은 그날 사정에 따라 조금씩 움직여요. 시간은 대략의 기준이에요.</p>`,

    shop: () => `
      <div class="sec">
        <p class="sec__title">매일 아침</p>
        ${kv('🧥', '유니클로 할인 체크', '10:00')}
        ${kv('🟢', '네이버페이 포인트', '10:30')}
        ${kv('🛒', 'G마켓 포인트', '10:40')}
      </div>
      <div class="sec">
        <p class="sec__title">바로가기</p>
        <a class="linkcard" href="https://www.uniqlo.com/kr/ko/special-feature/cp/thanksday" target="_blank" rel="noopener">
          <span class="linkcard__ico">🧥</span>
          <span class="linkcard__tx"><b>유니클로 감사제</b><span>할인 품목 바로 보기</span></span>
          <span class="linkcard__arrow">↗</span>
        </a>
      </div>
      <p class="muted">포인트와 할인은 매일 아침 한 번씩만 확인해요. 놓쳐도 큰일 나지 않아요.</p>`,

    invest: () => `
      <div id="etfBox">
        <div class="stamp"><span>기준일 <b>불러오는 중…</b></span><span>평일 16:10 자동 갱신</span></div>
        <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
      </div>
      <div class="sec">
        <p class="sec__title">적립과 갱신</p>
        ${kv('📅', 'ETF 월 적립', '매월 27일 09:00')}
        ${kv('🕓', '종가 자동 갱신', '평일 16:10')}
      </div>
      <a class="btn btn--mint btn--block" href="../etf-calc/">📊 ETF 적립 계산기 열기</a>`,

    life: () => `
      <div class="sec">
        <p class="sec__title">하루</p>
        ${kv('🌅', '아침 기록', '07:00')}
        ${kv('🌆', '저녁 기록', '19:00')}
        ${kv('🌙', '밤 이야기', '22:30')}
        ${kv('📖', '독서 알림', '23:00')}
        ${kv('🛏️', '취침 준비', '23:50')}
      </div>
      <div class="sec">
        <p class="sec__title">주말과 운동</p>
        ${kv('☀️', '주말 기상', '09:00')}
        ${kv('🏃', '운동 루틴', '화·목·토 19:30')}
      </div>
      <p class="muted">기록은 길게 쓰지 않아요. 한 줄이면 충분해요.</p>`,

    lab: () => `
      <div class="sec">
        <p class="sec__title">만든 웹앱</p>
        <a class="linkcard" href="../saju-roast/">
          <span class="linkcard__ico">🔥</span>
          <span class="linkcard__tx"><b>사주 HARD ROAST</b><span>생년월일로 보는 팩폭 사주</span></span>
          <span class="linkcard__arrow">→</span>
        </a>
        <a class="linkcard" href="../etf-calc/">
          <span class="linkcard__ico">📊</span>
          <span class="linkcard__tx"><b>ETF 적립 계산기</b><span>월 적립·IRP 수익 계산</span></span>
          <span class="linkcard__arrow">→</span>
        </a>
      </div>
      <div class="sec">
        <p class="sec__title">오늘의 할 일</p>
        <form class="todoform" data-act="todo-add">
          <input type="text" id="todoInput" maxlength="60" autocomplete="off"
                 placeholder="한 줄로 적어보세요" aria-label="할 일">
          <button class="btn btn--sm" type="submit">추가</button>
        </form>
        <ul class="todos" id="todoList"></ul>
        <p class="empty" id="todoEmpty" hidden>아직 적은 일이 없어요. 한 줄부터 가볍게.</p>
        <p class="muted" style="margin-top:10px">이 브라우저에만 저장돼요. 서버로는 아무것도 보내지 않아요.</p>
      </div>`,

    lounge: () => `
      <div class="sec">
        <p class="sec__title">오늘 기분</p>
        <div class="chips" data-moods>
          ${MOODS.map((m) => `
            <button class="chip" type="button" data-mood="${m.key}">
              <span aria-hidden="true">${m.ico}</span> ${m.label}
            </button>`).join('')}
        </div>
      </div>
      <div class="sec">
        <p class="sec__title">남기고 싶은 한 줄</p>
        <textarea class="memo" id="memo" maxlength="200" placeholder="오늘 기분이나 기억하고 싶은 한 줄"></textarea>
        <div class="row-actions">
          <button class="btn btn--sm" type="button" data-act="memo-save">남기기</button>
          <span class="muted" id="memoStatus"></span>
        </div>
      </div>
      <div class="hero-card">
        <p class="hero-card__k">숲이의 응원</p>
        <p class="hero-card__t" data-cheer>${pick(CHEERS)}</p>
        <button class="btn btn--ghost btn--sm" type="button" data-act="cheer">한마디 더</button>
      </div>`
  };

  /* ── 시트 열고 닫기 ──────────────────────────────────── */
  const sheet = $('#sheet');
  const sheetBody = $('#sheetBody');
  const scrim = $('#scrim');
  const grab = $('#sheetGrab');
  let currentRoom = null;
  let lastFocus = null;

  function renderRoom(key) {
    const room = ROOMS[key];
    if (!room) return;
    $('#sheetIco').textContent = room.ico;
    $('#sheetTitle').textContent = room.name;
    $('#sheetSub').textContent = room.sub;
    sheetBody.innerHTML = TEMPLATES[key]();
    sheetBody.scrollTop = 0;

    if (key === 'lab') renderTodos();
    if (key === 'lounge') renderLounge();
    if (key === 'invest') paintInvest();
  }

  function openSheet(key) {
    if (!ROOMS[key]) return;
    if (!currentRoom) lastFocus = document.activeElement;
    currentRoom = key;
    renderRoom(key);
    scrim.classList.add('is-on');
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open');
    window.setTimeout(() => sheet.focus({ preventScroll: true }), 40);
  }

  function closeSheet() {
    if (!currentRoom) return;
    currentRoom = null;
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    scrim.classList.remove('is-on');
    document.body.classList.remove('sheet-open');
  }

  $$('.badge, .part').forEach((btn) => {
    btn.addEventListener('click', () => openSheet(btn.dataset.room));
  });
  $('#levelBtn').addEventListener('click', () => openSheet('brief'));
  $('#sheetClose').addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentRoom) closeSheet();
  });

  /* 모바일: 손잡이를 아래로 당기면 닫기 */
  let dragStart = null;
  grab.addEventListener('pointerdown', (e) => {
    if (window.innerWidth >= 860) return;
    dragStart = e.clientY;
    try { grab.setPointerCapture(e.pointerId); } catch (err) {}
  });
  grab.addEventListener('pointerup', (e) => {
    if (dragStart != null && e.clientY - dragStart > 55) closeSheet();
    dragStart = null;
  });
  grab.addEventListener('pointercancel', () => { dragStart = null; });

  /* ── 오늘 날짜 ───────────────────────────────────────── */
  function paintToday() {
    const d = new Date();
    const wd = '일월화수목금토'[d.getDay()];
    const p = (n) => String(n).padStart(2, '0');
    const el = $('#todayLabel');
    if (el) el.textContent = `${d.getMonth() + 1}월 ${d.getDate()}일 ${wd}요일 · ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /* ── 모션 토글 ───────────────────────────────────────── */
  function setMotion(on) {
    document.body.classList.toggle('motion-on', on);
    const btn = $('#motionBtn');
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    $('#motionLabel').textContent = on ? '모션 ON' : '모션 OFF';
    store.set(MOTION_KEY, on);
  }
  $('#motionBtn').addEventListener('click', () => {
    setMotion(!document.body.classList.contains('motion-on'));
  });

  /* ── 가동 파트 수 ────────────────────────────────────── */
  const activeCount = Object.values(ROOMS).filter((r) => r.active).length;
  $('#partCount').textContent = String(activeCount);

  /* ── 한마디 ──────────────────────────────────────────── */
  function pick(list, exclude) {
    if (list.length === 1) return list[0];
    let next = list[Math.floor(Math.random() * list.length)];
    let guard = 0;
    while (exclude && next === exclude && guard++ < 12) {
      next = list[Math.floor(Math.random() * list.length)];
    }
    return next;
  }

  function nextCheer() {
    const el = $('[data-cheer]', sheetBody);
    if (!el) return;
    el.textContent = pick(CHEERS, el.textContent);
  }

  /* ── ETF 가격 ────────────────────────────────────────── */
  let priceData = null;

  async function loadPrices(force) {
    if (priceData && !force) return priceData;
    const res = await fetch('../etf-calc/prices.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    priceData = await res.json();
    return priceData;
  }

  function priceHtml(data) {
    const days = Array.isArray(data.days) ? data.days : [];
    const series = data.series || {};
    if (days.length < 2) throw new Error('no data');

    const last = days.length - 1;
    const prev = last - 1;
    const rows = [];

    ETF_NAMES.forEach(([code, name]) => {
      const arr = series[code];
      if (!Array.isArray(arr) || typeof arr[last] !== 'number') return;
      const now = arr[last];
      const before = typeof arr[prev] === 'number' ? arr[prev] : now;
      const pct = before ? (now / before - 1) * 100 : 0;
      const cls = pct > 0.0001 ? 'up' : (pct < -0.0001 ? 'down' : 'flat');
      const sign = pct > 0.0001 ? '+' : '';
      rows.push(`
        <li>
          <span class="nm">${name}</span>
          <span class="px">${Math.round(now).toLocaleString('ko-KR')}</span>
          <span class="chg ${cls}">${sign}${pct.toFixed(2)}%</span>
        </li>`);
    });

    return `
      <div class="stamp">
        <span>기준일 <b>${days[last]}</b> 종가</span>
        <span>전일 대비</span>
      </div>
      <ul class="prices">${rows.join('')}</ul>
      <div class="row-actions" style="justify-content:space-between;margin-bottom:14px">
        <span class="muted">${days.length}거래일 기록 · etf-calc/prices.json</span>
        <button class="btn btn--ghost btn--sm" type="button" data-act="etf-refresh">새로고침</button>
      </div>`;
  }

  async function paintInvest(force) {
    const box = $('#etfBox');
    if (!box) return;
    const isCurrent = () => box.isConnected && currentRoom === 'invest' && $('#etfBox') === box;
    try {
      const data = await loadPrices(force);
      if (!isCurrent()) return;
      box.innerHTML = priceHtml(data);
    } catch (err) {
      if (!isCurrent()) return;
      box.innerHTML = `
        <div class="notice">
          가격 데이터를 불러오지 못했어요. 계산기에서 직접 확인할 수 있어요.
        </div>
        <div class="row-actions" style="margin:0 0 14px">
          <a class="btn btn--ghost btn--sm" href="../etf-calc/">계산기 열기</a>
          <button class="btn btn--ghost btn--sm" type="button" data-act="etf-refresh">다시 시도</button>
        </div>`;
    }
  }

  /* ── 할 일 체크리스트 ────────────────────────────────── */
  function getTodos() {
    const list = store.get(TODOS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function renderTodos() {
    const list = $('#todoList');
    if (!list) return;
    const todos = getTodos();
    list.innerHTML = todos.map((t) => `
      <li class="${t.done ? 'is-done' : ''}">
        <label>
          <input type="checkbox" data-todo="${esc(t.id)}" ${t.done ? 'checked' : ''}>
          <span class="tx">${esc(t.text)}</span>
        </label>
        <button class="del" type="button" data-del="${esc(t.id)}" aria-label="삭제">✕</button>
      </li>`).join('');
    const empty = $('#todoEmpty');
    if (empty) empty.hidden = todos.length > 0;
  }

  function addTodo(text) {
    const value = text.trim();
    if (!value) return;
    const todos = getTodos();
    todos.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: value.slice(0, 60),
      done: false
    });
    store.set(TODOS_KEY, todos.slice(0, 80));
    renderTodos();
  }

  /* ── 라운지 ──────────────────────────────────────────── */
  function loadLounge() {
    const data = store.get(LOUNGE_KEY, null);
    return data && typeof data === 'object' ? data : {};
  }

  function renderLounge() {
    const data = loadLounge();
    $$('[data-mood]', sheetBody).forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.mood === data.mood);
    });
    const memo = $('#memo');
    if (memo) memo.value = data.memo || '';
    const status = $('#memoStatus');
    if (status && data.savedAt) {
      const d = new Date(data.savedAt);
      if (!isNaN(d)) {
        status.textContent = `남겨두었어요 · ${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    }
  }

  function saveLounge(patch) {
    const data = Object.assign(loadLounge(), patch);
    store.set(LOUNGE_KEY, data);
    renderLounge();
  }

  /* ── 시트 내부 동작 ──────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const moodBtn = e.target.closest('[data-mood]');
    if (moodBtn && sheet.contains(moodBtn)) {
      const data = loadLounge();
      saveLounge({ mood: data.mood === moodBtn.dataset.mood ? '' : moodBtn.dataset.mood });
      return;
    }

    const delBtn = e.target.closest('[data-del]');
    if (delBtn && sheet.contains(delBtn)) {
      store.set(TODOS_KEY, getTodos().filter((t) => t.id !== delBtn.dataset.del));
      renderTodos();
      return;
    }

    const actEl = e.target.closest('[data-act]');
    if (!actEl || !sheet.contains(actEl)) return;
    const act = actEl.dataset.act;

    if (act === 'cheer') nextCheer();
    if (act === 'brief') openSheet('brief');
    if (act === 'etf-refresh') paintInvest(true);
    if (act === 'memo-save') {
      const memo = $('#memo');
      const now = new Date();
      saveLounge({ memo: memo ? memo.value.slice(0, 200) : '', savedAt: now.toISOString() });
      const status = $('#memoStatus');
      if (status) {
        status.textContent = `남겨두었어요 · ${now.getMonth() + 1}월 ${now.getDate()}일 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      }
    }
  });

  document.addEventListener('change', (e) => {
    const box = e.target.closest('[data-todo]');
    if (!box || !sheet.contains(box)) return;
    const id = box.dataset.todo;
    const todos = getTodos().map((t) => (t.id === id ? Object.assign({}, t, { done: box.checked }) : t));
    store.set(TODOS_KEY, todos);
    renderTodos();
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('.todoform');
    if (!form) return;
    e.preventDefault();
    const input = $('#todoInput', form);
    if (!input) return;
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  /* ── 시작 ────────────────────────────────────────────── */
  setMotion(store.get(MOTION_KEY, true));
  paintToday();
  window.setInterval(paintToday, 30000);
})();
