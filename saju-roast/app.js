/* =========================================================================
   사주 ROAST — 앱 UI (app.js)
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var STORE_KEY = 'saju-roast:input';
  var lastChart = null;

  var BRANCH_OF_HOUR = ['자', '축', '축', '인', '인', '묘', '묘', '진', '진', '사', '사', '오', '오', '미', '미', '신', '신', '유', '유', '술', '술', '해', '해', '자'];

  /* ---------------------------------------------------------- 초기화 */
  function init() {
    var now = new Date();
    $('year').value = 1979;

    for (var m = 1; m <= 12; m++) {
      var o = document.createElement('option');
      o.value = m; o.textContent = m + '월';
      $('month').appendChild(o);
    }
    $('month').value = 7;

    for (var h = 0; h < 24; h++) {
      var oh = document.createElement('option');
      oh.value = h;
      oh.textContent = (h < 10 ? '0' : '') + h + '시 (' + BRANCH_OF_HOUR[h] + '시)';
      $('hour').appendChild(oh);
    }
    $('hour').value = 12;

    SajuEngine.CITIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id; o.textContent = c.name + ' (' + c.lon.toFixed(2) + '°E)';
      $('city').appendChild(o);
    });
    $('city').value = 'seoul';

    refreshDays();

    /* 이벤트 */
    document.querySelectorAll('input[name=calendar]').forEach(function (r) {
      r.addEventListener('change', function () {
        updateCalendarUI();
        refreshDays();
      });
    });
    document.querySelectorAll('.seg label').forEach(function (lb) {
      var inp = lb.querySelector('input');
      if (!inp) return;
      inp.addEventListener('change', function () { syncSeg(); });
    });
    $('leap').addEventListener('change', refreshDays);
    $('minute').addEventListener('change', function () { $('minute').value = Math.max(0, Math.min(59, +$('minute').value || 0)); });
    $('year').addEventListener('input', refreshDays);
    $('month').addEventListener('change', refreshDays);
    $('timeUnknown').addEventListener('change', function () {
      $('timeRow').style.opacity = this.checked ? '.35' : '1';
      $('timeRow').style.pointerEvents = this.checked ? 'none' : 'auto';
    });
    $('city').addEventListener('change', function () {
      $('customLonWrap').style.display = this.value === 'custom' ? 'block' : 'none';
    });
    $('roastInput').addEventListener('input', function () {
      var v = +this.value;
      $('roastNum').textContent = v;
      $('roastLabel').textContent = v <= 3 ? '순한맛' : v <= 6 ? '중간맛' : v <= 8 ? '매운맛' : 'HARD ROAST';
    });
    $('analyzeBtn').addEventListener('click', analyze);
    $('resetBtn').addEventListener('click', resetForm);
    $('loadBtn').addEventListener('click', loadSaved);
    $('copyPromptBtn').addEventListener('click', copyPrompt);
    $('saveBtn').addEventListener('click', function () { saveChart(true); });
    $('printBtn').addEventListener('click', function () { window.print(); });

    updateCalendarUI();
    updateLoadBtn();
  }

  function syncSeg() {
    document.querySelectorAll('.seg label').forEach(function (lb) {
      var inp = lb.querySelector('input');
      lb.classList.toggle('sel', !!(inp && inp.checked));
    });
  }

  function updateCalendarUI() {
    var isLunar = document.querySelector('input[name=calendar]:checked').value === 'lunar';
    $('leapWrap').style.display = isLunar ? 'flex' : 'none';
    $('calHint').textContent = isLunar
      ? '음력 날짜를 그대로 넣으세요. 윤달이면 체크하고, 양력·절기 기준으로 변환합니다.'
      : '양력 날짜를 넣으세요. 절기(입춘 등) 기준으로 년주·월주를 계산합니다.';
  }

  function refreshDays() {
    var y = +$('year').value || 1990;
    var m = +$('month').value;
    var isLunar = document.querySelector('input[name=calendar]:checked').value === 'lunar';
    var max = isLunar ? 30 : new Date(Date.UTC(y, m, 0)).getUTCDate();
    var cur = +$('day').value || 1;
    var sel = $('day');
    sel.innerHTML = '';
    for (var d = 1; d <= max; d++) {
      var o = document.createElement('option');
      o.value = d; o.textContent = d + '일';
      sel.appendChild(o);
    }
    sel.value = Math.min(cur, max);
    $('dateHint').textContent = isLunar
      ? (y < 1900 || y > 2050 ? '음력 변환은 1900~2050년 범위에서 지원됩니다.' : '')
      : '';
  }

  function readInput() {
    var calendar = document.querySelector('input[name=calendar]:checked').value;
    var cityId = $('city').value;
    var city = SajuEngine.CITIES.filter(function (c) { return c.id === cityId; })[0];
    var lon = cityId === 'custom' ? (parseFloat($('customLon').value) || 126.978) : city.lon;
    return {
      calendar: calendar,
      leap: calendar === 'lunar' ? $('leap').checked : false,
      year: +$('year').value,
      month: +$('month').value,
      day: +$('day').value,
      timeKnown: !$('timeUnknown').checked,
      hour: +$('hour').value,
      minute: Math.max(0, Math.min(59, +$('minute').value || 0)),
      gender: document.querySelector('input[name=gender]:checked').value,
      cityId: cityId,
      cityName: city ? city.name : '서울',
      longitude: lon,
      useTrueSolar: $('trueSolar').checked,
      useEoT: $('eot').checked,
      applyTrueSolarToDay: $('applyDay').checked,
      jaSiRule: $('jaSi').value,
      concern: $('concern').value,
      roast: +$('roastInput').value
    };
  }

  /* ---------------------------------------------------------- 분석 */
  function analyze() {
    var input = readInput();
    $('err').textContent = '';
    if (!input.year || input.year < 1900 || input.year > 2035) {
      fail('출생 연도를 1900~2035 사이로 넣어 주세요.');
      return;
    }
    var chart;
    try {
      chart = SajuEngine.compute(input, { now: Date.now() });
    } catch (e) {
      fail(e && e.message ? e.message : '계산 중 오류가 났습니다. 입력값을 확인해 주세요.');
      return;
    }
    render(chart);
    saveChart(false);
  }

  function fail(msg) {
    $('err').textContent = msg;
    toast('⚠️ ' + msg);
  }

  function render(chart) {
    lastChart = chart;
    var out = SajuAnalysis.build(chart);
    var $sum = $('summary');

    var warnHtml = chart.warnings.length
      ? '<div class="warnbox" style="text-align:left;margin-top:12px"><div class="calc-title">먼저 확인하세요</div><ul>' +
        chart.warnings.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>'
      : '';

    var concernHtml = '';
    if (chart.input.concern && chart.input.concern !== '종합') {
      var map = { '성격': 'personality', '연애': 'love', '직업·재물': 'work', '대운·세운': 'daewoon' };
      var cs = SajuAnalysis.concernSummary ? SajuAnalysis.concernSummary(chart) : '';
      concernHtml = (cs || '') + '<div class="hint" style="margin-top:8px">요청 영역: <b>' + chart.input.concern + '</b> — 전체 해석은 <a href="#' + (map[chart.input.concern] || 'wonkuk') + '" style="color:#e6b567">해당 섹션</a>에서 이어집니다.</div>';
    }

    $sum.innerHTML =
      '<div class="pillars">' + out.headline.pillars + '</div>' +
      '<div class="sub">' + out.headline.sub + '</div>' +
      '<div class="tagrow">' + out.headline.tags.map(function (t) { return '<span class="tagchip">' + t + '</span>'; }).join('') + '</div>' +
      '<div class="sub" style="margin-top:10px;font-size:12px">' +
      (chart.solar.y + '-' + pad(chart.solar.m) + '-' + pad(chart.solar.d) + ' ' +
        (chart.timeKnown ? pad(chart.clock.h) + ':' + pad(chart.clock.mi) : '시간 미상') +
        ' · ' + (chart.input.gender === 'F' ? '여' : '남') + ' · ' + chart.input.cityName) +
      '</div>' +
      concernHtml + warnHtml;

    var nav = '<a href="#top">맨 위</a>' + out.sections.map(function (s) {
      return '<a href="#' + s.id + '">' + s.num + ' ' + s.title + '</a>';
    }).join('');
    $('nav').innerHTML = nav;

    $('sections').innerHTML = out.sections.map(function (s) {
      return '<section class="card sec" id="' + s.id + '">' +
        '<h2><span class="num">' + s.num + '</span>' + s.title + '</h2>' + s.body + '</section>';
    }).join('');

    $('disclaimer').innerHTML = '⚠️ ' + out.disclaimer + '<br><br>만세력 계산: lunar-javascript(寿星天文历 기반, MIT 라이선스)를 저장소에 함께 넣어 오프라인에서도 동작합니다. 표준시·서머타임 이력은 IANA tz database(Asia/Seoul)를 따랐습니다.';
    $('result').classList.add('on');
    $('actionbar').style.display = 'flex';
    var target = $('result');
    var y = target.getBoundingClientRect().top + window.pageYOffset - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------------------------------------------------------- 저장 */
  function saveChart(manual) {
    if (!lastChart) return;
    try {
      var input = lastChart.input;
      localStorage.setItem(STORE_KEY, JSON.stringify({ input: input, savedAt: new Date().toISOString() }));
      if (manual) toast('💾 저장했습니다. 다음에 "저장된 결과 불러오기"로 열 수 있어요.');
      updateLoadBtn();
    } catch (e) {
      if (manual) toast('저장 공간을 쓸 수 없습니다.');
    }
  }

  function updateLoadBtn() {
    var btn = $('loadBtn');
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) {}
    btn.disabled = !raw;
    btn.style.opacity = raw ? '1' : '.45';
  }

  function loadSaved() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (!raw) { toast('저장된 결과가 없습니다.'); return; }
    var data;
    try { data = JSON.parse(raw); } catch (e) { toast('저장된 데이터가 손상됐습니다.'); return; }
    var input = data.input;
    document.querySelector('input[name=calendar][value="' + input.calendar + '"]').checked = true;
    $('leap').checked = !!input.leap;
    $('year').value = input.year;
    $('month').value = input.month;
    updateCalendarUI();
    refreshDays();
    $('day').value = input.day;
    $('timeUnknown').checked = !input.timeKnown;
    $('hour').value = input.hour;
    $('minute').value = input.minute;
    $('timeRow').style.opacity = input.timeKnown ? '1' : '.35';
    $('timeRow').style.pointerEvents = input.timeKnown ? 'auto' : 'none';
    document.querySelector('input[name=gender][value="' + input.gender + '"]').checked = true;
    $('city').value = input.cityId || 'seoul';
    $('customLonWrap').style.display = $('city').value === 'custom' ? 'block' : 'none';
    if (input.cityId === 'custom') $('customLon').value = input.longitude;
    $('trueSolar').checked = input.useTrueSolar !== false;
    $('eot').checked = !!input.useEoT;
    $('applyDay').checked = !!input.applyTrueSolarToDay;
    $('jaSi').value = input.jaSiRule || 'jo';
    $('concern').value = input.concern || '종합';
    $('roastInput').value = input.roast || 10;
    $('roastNum').textContent = input.roast || 10;
    $('roastLabel').textContent = (input.roast || 10) <= 3 ? '순한맛' : (input.roast || 10) <= 6 ? '중간맛' : (input.roast || 10) <= 8 ? '매운맛' : 'HARD ROAST';
    analyze();
    toast('📂 저장된 입력으로 다시 계산했습니다.');
  }

  function resetForm() {
    $('year').value = 1979;
    $('month').value = 7;
    refreshDays();
    $('day').value = 21;
    $('timeUnknown').checked = false;
    $('hour').value = 12;
    $('minute').value = 0;
    $('timeRow').style.opacity = '1';
    $('timeRow').style.pointerEvents = 'auto';
    document.querySelector('input[name=calendar][value=solar]').checked = true;
    document.querySelector('input[name=gender][value=M]').checked = true;
    $('city').value = 'seoul';
    $('customLonWrap').style.display = 'none';
    $('trueSolar').checked = true;
    $('eot').checked = false;
    $('applyDay').checked = false;
    $('jaSi').value = 'jo';
    $('concern').value = '종합';
    $('roastInput').value = 10;
    $('roastNum').textContent = '10';
    $('roastLabel').textContent = 'HARD ROAST';
    $('err').textContent = '';
    updateCalendarUI();
    $('result').classList.remove('on');
    $('actionbar').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------------------------------------------------- 프롬프트 복사 */
  function copyPrompt() {
    if (!lastChart) { toast('먼저 분석을 실행하세요.'); return; }
    var text = SajuPrompt.build(lastChart);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('🤖 프롬프트를 복사했습니다. 클로드·제미나이에 붙여넣으세요.');
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    try {
      var ok = document.execCommand('copy');
      toast(ok ? '🤖 프롬프트를 복사했습니다.' : '복사가 막혔습니다. 화면에서 직접 선택해 주세요.');
    } catch (e) {
      toast('복사가 막혔습니다.');
    }
    document.body.removeChild(ta);
  }

  /* ---------------------------------------------------------- 토스트 */
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  var booted = false;
  function boot() { if (booted) return; booted = true; init(); syncSeg(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
