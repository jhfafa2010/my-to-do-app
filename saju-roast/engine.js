/* =========================================================================
   사주 ROAST — 만세력 계산 엔진 (engine.js)
   - 음력/양력 변환·절기 계산: lunar-javascript (로컬 번들 lunar.js, MIT)
   - 년주·월주: 절기(절입) 절대시각 기준, 일주·시주: 보정된 지방 진태양시 기준
   - 한국 표준시 이력(1908~)과 서머타임 12구간 반영
   ========================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- 상수 */
  var STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var STEM_KR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var BRANCH_KR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  var STEM_EL = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];
  var BRANCH_EL = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'];
  var ELS = ['목', '화', '토', '금', '수'];
  var SAENG = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  var GEUK = { '목': '토', '토': '수', '수': '화', '화': '금', '금': '목' };

  var GAN_W = { year: 1.0, month: 1.2, day: 1.0, hour: 0.9 };
  var ZHI_W = { year: 1.0, month: 1.8, day: 1.3, hour: 0.9 };

  var HIDDEN = {
    '子': [['癸', 1.0]],
    '丑': [['癸', 0.2], ['辛', 0.3], ['己', 0.5]],
    '寅': [['戊', 0.2], ['丙', 0.3], ['甲', 0.5]],
    '卯': [['乙', 1.0]],
    '辰': [['乙', 0.2], ['癸', 0.3], ['戊', 0.5]],
    '巳': [['戊', 0.2], ['庚', 0.3], ['丙', 0.5]],
    '午': [['丁', 0.7], ['己', 0.3]],
    '未': [['乙', 0.2], ['丁', 0.3], ['己', 0.5]],
    '申': [['戊', 0.2], ['壬', 0.3], ['庚', 0.5]],
    '酉': [['辛', 1.0]],
    '戌': [['辛', 0.2], ['丁', 0.3], ['戊', 0.5]],
    '亥': [['壬', 0.7], ['甲', 0.3]]
  };

  var STAGES = ['장생', '목욕', '관대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양'];
  var STAGE_START = { '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅', '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯' };

  var YANGIN = { '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子' };
  var GEONROK = { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' };
  var MUNCHANG = { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' };
  var CHEONEUL = { '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'], '乙': ['子', '申'], '己': ['子', '申'], '丙': ['亥', '酉'], '丁': ['亥', '酉'], '壬': ['巳', '卯'], '癸': ['巳', '卯'], '辛': ['寅', '午'] };
  var HONGYEOM = { '甲': '午', '乙': '午', '丙': '寅', '丁': '未', '戊': '辰', '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申' };

  var SAMHAP = [
    { branches: ['寅', '午', '戌'], el: '화', dohwa: '卯', yeokma: '申', hwagae: '戌' },
    { branches: ['申', '子', '辰'], el: '수', dohwa: '酉', yeokma: '寅', hwagae: '辰' },
    { branches: ['巳', '酉', '丑'], el: '금', dohwa: '午', yeokma: '亥', hwagae: '丑' },
    { branches: ['亥', '卯', '未'], el: '목', dohwa: '子', yeokma: '巳', hwagae: '未' }
  ];
  var YUKHAP = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
  var CHUNG = [['子', '午'], ['丑', '未'], ['寅', '申'], ['卯', '酉'], ['辰', '戌'], ['巳', '亥']];
  var PA = [['子', '酉'], ['丑', '辰'], ['寅', '亥'], ['卯', '午'], ['巳', '申'], ['未', '戌']];
  var HAE = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];
  var HYUNG_3 = [['寅', '巳', '申'], ['丑', '戌', '未']];
  var HYUNG_2 = [['子', '卯']];
  var HYUNG_SELF = ['辰', '午', '酉', '亥'];
  var GAN_HAP = [['甲', '己'], ['乙', '庚'], ['丙', '辛'], ['丁', '壬'], ['戊', '癸']];
  var GAN_HAP_EL = { '甲己': '토', '乙庚': '금', '丙辛': '수', '丁壬': '목', '戊癸': '화' };
  var GAN_CHUNG = [['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']];

  /* 한국 표준시 이력 (분) — IANA tzdb Asia/Seoul */
  var STD_PERIODS = [
    { from: [1908, 4, 1], to: [1912, 1, 1], min: 510, label: 'UTC+8:30 (동경 127.5°)' },
    { from: [1912, 1, 1], to: [1954, 3, 21], min: 540, label: 'UTC+9 (동경 135°)' },
    { from: [1954, 3, 21], to: [1961, 8, 10], min: 510, label: 'UTC+8:30 (동경 127.5°)' },
    { from: [1961, 8, 10], to: [2100, 1, 1], min: 540, label: 'UTC+9 (동경 135°)' }
  ];
  /* 서머타임 12구간 (시계 기준) */
  var DST_PERIODS = [
    { y: 1948, from: [1948, 6, 1, 0, 0], to: [1948, 9, 13, 0, 0] },
    { y: 1949, from: [1949, 4, 3, 0, 0], to: [1949, 9, 11, 0, 0] },
    { y: 1950, from: [1950, 4, 1, 0, 0], to: [1950, 9, 10, 0, 0] },
    { y: 1951, from: [1951, 5, 6, 0, 0], to: [1951, 9, 9, 0, 0] },
    { y: 1955, from: [1955, 5, 5, 0, 0], to: [1955, 9, 9, 0, 0] },
    { y: 1956, from: [1956, 5, 20, 0, 0], to: [1956, 9, 30, 0, 0] },
    { y: 1957, from: [1957, 5, 5, 0, 0], to: [1957, 9, 22, 0, 0] },
    { y: 1958, from: [1958, 5, 4, 0, 0], to: [1958, 9, 21, 0, 0] },
    { y: 1959, from: [1959, 5, 3, 0, 0], to: [1959, 9, 20, 0, 0] },
    { y: 1960, from: [1960, 5, 1, 0, 0], to: [1960, 9, 18, 0, 0] },
    { y: 1987, from: [1987, 5, 10, 2, 0], to: [1987, 10, 11, 3, 0] },
    { y: 1988, from: [1988, 5, 8, 2, 0], to: [1988, 10, 9, 3, 0] }
  ];

  /* 도시 프리셋 (경도) */
  var CITIES = [
    { id: 'seoul', name: '서울', lon: 126.978 },
    { id: 'incheon', name: '인천', lon: 126.705 },
    { id: 'busan', name: '부산', lon: 129.075 },
    { id: 'daegu', name: '대구', lon: 128.601 },
    { id: 'daejeon', name: '대전', lon: 127.385 },
    { id: 'gwangju', name: '광주', lon: 126.852 },
    { id: 'ulsan', name: '울산', lon: 129.311 },
    { id: 'sejong', name: '세종', lon: 127.289 },
    { id: 'suwon', name: '수원', lon: 127.029 },
    { id: 'cheongju', name: '청주', lon: 127.489 },
    { id: 'jeonju', name: '전주', lon: 127.148 },
    { id: 'changwon', name: '창원', lon: 128.681 },
    { id: 'jeju', name: '제주', lon: 126.532 },
    { id: 'gangneung', name: '강릉', lon: 128.896 },
    { id: 'mokpo', name: '목포', lon: 126.392 },
    { id: 'pohang', name: '포항', lon: 129.365 },
    { id: 'chuncheon', name: '춘천', lon: 127.734 },
    { id: 'custom', name: '직접 입력', lon: 127.0 }
  ];

  /* 24절기 이름 정규화 (lunar-javascript 표기 혼용) */
  var JIEQI_PINYIN = {
    'DA_XUE': '大雪', 'DONG_ZHI': '冬至', 'XIAO_HAN': '小寒', 'DA_HAN': '大寒',
    'LI_CHUN': '立春', 'YU_SHUI': '雨水', 'JING_ZHE': '惊蛰', 'CHUN_FEN': '春分',
    'QING_MING': '清明', 'GU_YU': '谷雨', 'LI_XIA': '立夏', 'XIAO_MAN': '小满',
    'MANG_ZHONG': '芒种', 'XIA_ZHI': '夏至', 'XIAO_SHU': '小暑', 'DA_SHU': '大暑',
    'LI_QIU': '立秋', 'CHU_SHU': '处暑', 'BAI_LU': '白露', 'QIU_FEN': '秋分',
    'HAN_LU': '寒露', 'SHUANG_JIANG': '霜降', 'LI_DONG': '立冬', 'XIAO_XUE': '小雪'
  };
  /* 12절(节) — 월건을 가르는 절입. 순서대로 인월~축월 */
  var JIE_ORDER = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];
  var JIE_KR = {
    '立春': '입춘', '惊蛰': '경칩', '清明': '청명', '立夏': '입하', '芒种': '망종', '小暑': '소서',
    '立秋': '입추', '白露': '백로', '寒露': '한로', '立冬': '입동', '大雪': '대설', '小寒': '소한',
    '雨水': '우수', '春分': '춘분', '谷雨': '곡우', '小满': '소만', '夏至': '하지', '大暑': '대서',
    '处暑': '처서', '秋分': '추분', '霜降': '상강', '小雪': '소설', '冬至': '동지', '大寒': '대한'
  };

  /* ------------------------------------------------------------ 유틸 */
  function mod(n, m) { return ((n % m) + m) % m; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function utcOf(y, m, d, h, mi, s) { return Date.UTC(y, m - 1, d, h || 0, mi || 0, s || 0); }
  function partsOf(ms) {
    var d = new Date(ms);
    return {
      y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
      h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(),
      wd: d.getUTCDay()
    };
  }
  function jdn(y, m, d) {
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function dayIndex(y, m, d) { return mod(jdn(y, m, d) + 49, 60); }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function formatHM(minutes) {
    var sign = minutes < 0 ? '-' : '+';
    var a = Math.abs(minutes);
    var h = Math.floor(a / 60), mi = Math.round(a % 60);
    return sign + h + ':' + pad2(mi);
  }

  function standardOffsetMin(wallMs) {
    var p = partsOf(wallMs);
    var best = { min: 540, label: 'UTC+9 (동경 135°)' };
    for (var i = 0; i < STD_PERIODS.length; i++) {
      var s = STD_PERIODS[i];
      var from = utcOf(s.from[0], s.from[1], s.from[2], 0, 0);
      var to = utcOf(s.to[0], s.to[1], s.to[2], 0, 0);
      if (wallMs >= from && wallMs < to) { best = { min: s.min, label: s.label }; break; }
    }
    if (wallMs < utcOf(1908, 4, 1, 0, 0)) {
      best = { min: 507 + 52 / 60, label: '지방평균시 (서울 기준 약 UTC+8:27:52)' };
    }
    return best;
  }

  function dstInfo(wallMs) {
    var p = partsOf(wallMs);
    for (var i = 0; i < DST_PERIODS.length; i++) {
      var s = DST_PERIODS[i];
      if (s.y !== p.y) continue;
      var from = utcOf.apply(null, s.from);
      var to = utcOf.apply(null, s.to);
      if (wallMs >= from && wallMs < to) {
        return { applied: true, min: 60, from: s.from, to: s.to, year: s.y };
      }
      /* 서머타임 시작 직후 1시간(없는 시각) / 종료 직후 1시간(중복 시각) 감지 */
      if (s.y >= 1987) {
        if (wallMs >= from && wallMs < from + 3600000) return { applied: true, min: 60, from: s.from, to: s.to, year: s.y, gap: true };
        if (wallMs >= to && wallMs < to + 3600000) return { applied: true, min: 60, from: s.from, to: s.to, year: s.y, ambiguous: true };
      }
    }
    return { applied: false, min: 0 };
  }

  function equationOfTimeMin(ms) {
    var p = partsOf(ms);
    var start = Date.UTC(p.y, 0, 1);
    var n = Math.floor((Date.UTC(p.y, p.m - 1, p.d) - start) / 86400000) + 1;
    var b = 2 * Math.PI * (n - 81) / 364;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  }

  /* ------------------------------------------------------- 십성/오행 */
  function tenGod(dayStem, otherStem) {
    var de = STEM_EL[STEMS.indexOf(dayStem)], oe = STEM_EL[STEMS.indexOf(otherStem)];
    var same = (STEMS.indexOf(dayStem) % 2) === (STEMS.indexOf(otherStem) % 2);
    if (de === oe) return same ? '비견' : '겁재';
    if (SAENG[de] === oe) return same ? '식신' : '상관';
    if (GEUK[de] === oe) return same ? '편재' : '정재';
    if (GEUK[oe] === de) return same ? '편관' : '정관';
    return same ? '편인' : '정인';
  }
  function tenGodClass(tg) {
    if (tg === '비견' || tg === '겁재') return '비겁';
    if (tg === '식신' || tg === '상관') return '식상';
    if (tg === '편재' || tg === '정재') return '재성';
    if (tg === '편관' || tg === '정관') return '관성';
    return '인성';
  }
  function elementOfTenGod(dayEl, tg) {
    var c = tenGodClass(tg);
    if (c === '비겁') return dayEl;
    if (c === '식상') return SAENG[dayEl];
    if (c === '재성') return GEUK[dayEl];
    if (c === '관성') return Object.keys(GEUK).filter(function (k) { return GEUK[k] === dayEl; })[0];
    return Object.keys(SAENG).filter(function (k) { return SAENG[k] === dayEl; })[0];
  }
  function stageOf(dayStem, branch) {
    var start = BRANCHES.indexOf(STAGE_START[dayStem]);
    var dir = STEMS.indexOf(dayStem) % 2 === 0 ? 1 : -1;
    return STAGES[mod((BRANCHES.indexOf(branch) - start) * dir, 12)];
  }
  function ganOf(i) { return STEMS[mod(i, 10)] + BRANCHES[mod(i, 12)]; }
  function gzObj(gz) {
    return { text: gz, gan: gz.charAt(0), zhi: gz.charAt(1), ganEl: STEM_EL[STEMS.indexOf(gz.charAt(0))], zhiEl: BRANCH_EL[BRANCHES.indexOf(gz.charAt(1))] };
  }

  /* --------------------------------------------------------- 절기 수집 */
  function collectJieQi(aroundMs) {
    var p = partsOf(aroundMs);
    var years = [p.y - 1, p.y, p.y + 1];
    var out = [], seen = {};
    for (var i = 0; i < years.length; i++) {
      var y = years[i];
      for (var mm = 1; mm <= 12; mm += 5) {
        var lunar;
        try { lunar = Solar.fromYmd(y, mm, 15).getLunar(); } catch (e) { continue; }
        var table = lunar.getJieQiTable();
        for (var k in table) {
          if (!Object.prototype.hasOwnProperty.call(table, k)) continue;
          var name = JIEQI_PINYIN[k] || k;
          var sol = table[k];
          var inst = utcOf(sol.getYear(), sol.getMonth(), sol.getDay(), sol.getHour(), sol.getMinute(), sol.getSecond()) - 8 * 3600000;
          var key = name + '|' + inst;
          if (seen[key]) continue;
          seen[key] = 1;
          out.push({ name: name, kr: JIE_KR[name] || name, ms: inst });
        }
      }
    }
    out.sort(function (a, b) { return a.ms - b.ms; });
    return out;
  }

  function jieInstants(aroundMs) {
    return collectJieQi(aroundMs).filter(function (t) { return JIE_ORDER.indexOf(t.name) >= 0; });
  }

  /* -------------------------------------------------------- 신살 계산 */
  function samhapOf(branch) {
    for (var i = 0; i < SAMHAP.length; i++) if (SAMHAP[i].branches.indexOf(branch) >= 0) return SAMHAP[i];
    return null;
  }

  function computeSinsal(pillars, hourKnown) {
    var list = [];
    var all = [];
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      if (!pillars[k]) return;
      all.push({ pos: k, zhi: pillars[k].zhi });
    });
    var dayStem = pillars.day.gan;
    var yearZhi = pillars.year.zhi, dayZhi = pillars.day.zhi;

    function push(name, desc, positions, strength) {
      list.push({ name: name, desc: desc, positions: positions, strength: strength });
    }

    /* 도화·역마·화개: 년지/일지 삼합 기준 */
    ['도화', '역마', '화개'].forEach(function (kind) {
      var found = {};
      [['년지', yearZhi], ['일지', dayZhi]].forEach(function (base) {
        var s = samhapOf(base[1]);
        if (!s) return;
        var target = kind === '도화' ? s.dohwa : kind === '역마' ? s.yeokma : s.hwagae;
        all.forEach(function (a) {
          if (a.zhi === target) found[base[0] + '→' + a.pos] = a.pos;
        });
      });
      var pos = Object.keys(found).map(function (k) { return found[k]; });
      if (pos.length) {
        var desc = kind === '도화' ? '호감·주목을 끄는 자리. 인기와 구설이 같이 온다.'
          : kind === '역마' ? '이동·변동·출장·이사. 한자리에 오래 머물지 못하는 자리.'
          : '몰입과 은둔, 취향의 깊이. 혼자만의 세계로 도피하는 자리.';
        push(kind, desc, uniq(pos), kind === '도화' ? '보통' : '낮음');
      }
    });

    /* 홍염 */
    if (HONGYEOM[dayStem]) {
      var hy = all.filter(function (a) { return a.zhi === HONGYEOM[dayStem]; }).map(function (a) { return a.pos; });
      if (hy.length) push('홍염', '이성의 시선을 끄는 매력. 다만 관계를 흔드는 쪽으로도 작동한다.', uniq(hy), '낮음');
    }
    /* 양인 */
    if (YANGIN[dayStem]) {
      var yi = all.filter(function (a) { return a.zhi === YANGIN[dayStem]; }).map(function (a) { return a.pos; });
      if (yi.length) push('양인', '강한 추진력과 승부욕. 칼날이 자기 쪽으로 돌아오기 쉬운 자리.', uniq(yi), '보통');
    }
    /* 건록 */
    var gr = all.filter(function (a) { return a.zhi === GEONROK[dayStem]; }).map(function (a) { return a.pos; });
    if (gr.length) push('건록', '자수성가의 뿌리. 남에게 기대기보다 직접 해먹는 힘.', uniq(gr), '보통');
    /* 문창 */
    var mc = all.filter(function (a) { return a.zhi === MUNCHANG[dayStem]; }).map(function (a) { return a.pos; });
    if (mc.length) push('문창', '글·말·기획으로 먹고사는 재주.', uniq(mc), '낮음');
    /* 천을귀인 */
    var ce = all.filter(function (a) { return (CHEONEUL[dayStem] || []).indexOf(a.zhi) >= 0; }).map(function (a) { return a.pos; });
    if (ce.length) push('천을귀인', '막힐 때 누군가 손을 잡아주는 자리. 위기에서 이상하게 살아남는다.', uniq(ce), '낮음');

    /* 귀문관살 */
    var pairs = [['子', '酉'], ['丑', '午'], ['寅', '未'], ['卯', '申'], ['辰', '亥'], ['巳', '戌']];
    var gw = [];
    for (var i = 0; i < all.length; i++) {
      for (var j = i + 1; j < all.length; j++) {
        for (var k = 0; k < pairs.length; k++) {
          if ((all[i].zhi === pairs[k][0] && all[j].zhi === pairs[k][1]) || (all[i].zhi === pairs[k][1] && all[j].zhi === pairs[k][0])) {
            gw.push(all[i].pos); gw.push(all[j].pos);
          }
        }
      }
    }
    if (gw.length) push('귀문관살', '촉이 비상하게 좋고, 그 촉이 공포·의심·집착으로 증폭되기 쉽다.', uniq(gw), '낮음');

    /* 공망 */
    var dayGzText = pillars.day.gan + pillars.day.zhi;
    var dIdx = sexIndex(dayGzText);
    var gong = [BRANCHES[mod(dIdx + 10, 12)], BRANCHES[mod(dIdx + 11, 12)]];
    var gm = all.filter(function (a) { return gong.indexOf(a.zhi) >= 0; }).map(function (a) { return a.pos; });
    if (gm.length) push('공망', '그 자리의 결실이 허해지기 쉽다. 애써도 손에 안 남는 느낌.', uniq(gm), '보통');

    return { list: list, gongmang: gong };
  }

  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }
  function sexIndex(gz) {
    var g = STEMS.indexOf(gz.charAt(0)), b = BRANCHES.indexOf(gz.charAt(1));
    for (var i = 0; i < 60; i++) if (i % 10 === g && i % 12 === b) return i;
    return 0;
  }

  /* ------------------------------------------------------- 관계 계산 */
  function computeRelations(pillars) {
    var posKeys = ['year', 'month', 'day', 'hour'];
    var items = [], i, j, k;
    var gans = [], zhis = [];
    posKeys.forEach(function (p) {
      if (pillars[p]) { gans.push({ pos: p, v: pillars[p].gan }); zhis.push({ pos: p, v: pillars[p].zhi }); }
    });

    /* 천간합 */
    for (i = 0; i < gans.length; i++) for (j = i + 1; j < gans.length; j++) {
      for (k = 0; k < GAN_HAP.length; k++) {
        var a = GAN_HAP[k][0], b = GAN_HAP[k][1];
        if ((gans[i].v === a && gans[j].v === b) || (gans[i].v === b && gans[j].v === a)) {
          items.push({ type: '천간합', kind: '합', pair: gans[i].v + gans[j].v, pos: [gans[i].pos, gans[j].pos], note: '합화(化) 여부는 월령 지지에 따라 갈린다. 합이 성립하면 두 글자의 작용이 묶인다.' });
        }
      }
      for (k = 0; k < GAN_CHUNG.length; k++) {
        var c = GAN_CHUNG[k][0], d = GAN_CHUNG[k][1];
        if ((gans[i].v === c && gans[j].v === d) || (gans[i].v === d && gans[j].v === c)) {
          items.push({ type: '천간충', kind: '충', pair: gans[i].v + gans[j].v, pos: [gans[i].pos, gans[j].pos], note: '겉으로 드러나는 갈등·경쟁·변동.' });
        }
      }
    }

    /* 지지 육합·충·파·해 */
    for (i = 0; i < zhis.length; i++) for (j = i + 1; j < zhis.length; j++) {
      var p1 = zhis[i].v, p2 = zhis[j].v;
      var defs = [['육합', YUKHAP, '합'], ['충', CHUNG, '충'], ['파', PA, '파'], ['해', HAE, '해']];
      for (k = 0; k < defs.length; k++) {
        var target = defs[k];
        for (var t = 0; t < target[1].length; t++) {
          if ((p1 === target[1][t][0] && p2 === target[1][t][1]) || (p1 === target[1][t][1] && p2 === target[1][t][0])) {
            items.push({ type: '지지' + target[0], kind: target[2], pair: p1 + p2, pos: [zhis[i].pos, zhis[j].pos], note: relNote(target[0]) });
          }
        }
      }
      /* 형 */
      for (k = 0; k < HYUNG_3.length; k++) {
        if (p1 !== p2 && HYUNG_3[k].indexOf(p1) >= 0 && HYUNG_3[k].indexOf(p2) >= 0) {
          items.push({ type: '지지형', kind: '형', pair: p1 + p2, pos: [zhis[i].pos, zhis[j].pos], note: '삼형 중 2자. 견제·수술·법적 분쟁·관계의 삭마.' });
        }
      }
      if ((p1 === '子' && p2 === '卯') || (p1 === '卯' && p2 === '子')) {
        items.push({ type: '지지형', kind: '형', pair: '子卯', pos: [zhis[i].pos, zhis[j].pos], note: '상형(相刑). 예의·체면 문제로 어긋나기 쉽다.' });
      }
      if (HYUNG_SELF.indexOf(p1) >= 0 && p1 === p2) {
        items.push({ type: '지지형', kind: '형', pair: p1 + p2, pos: [zhis[i].pos, zhis[j].pos], note: '자형(自刑). 자기 안에서 같은 문제를 반복한다.' });
      }
    }

    /* 삼합·방합 (3자) */
    var zset = zhis.map(function (z) { return z.v; });
    SAMHAP.forEach(function (s) {
      if (s.branches.every(function (b) { return zset.indexOf(b) >= 0; })) {
        items.push({ type: '삼합', kind: '합', pair: s.branches.join(''), pos: s.branches.map(posOf), note: s.el + ' 기운으로 결속. 그 오행이 사주에서 강해진다.' });
      }
    });
    [['寅', '卯', '辰', '목'], ['巳', '午', '未', '화'], ['申', '酉', '戌', '금'], ['亥', '子', '丑', '수']].forEach(function (f) {
      if (zset.indexOf(f[0]) >= 0 && zset.indexOf(f[1]) >= 0 && zset.indexOf(f[2]) >= 0) {
        items.push({ type: '방합', kind: '합', pair: f[0] + f[1] + f[2], pos: f.slice(0, 3).map(posOf), note: f[3] + ' 기운이 한 방향으로 뭉친다.' });
      }
    });

    function posOf(zhi) {
      for (var q = 0; q < zhis.length; q++) if (zhis[q].v === zhi) return zhis[q].pos;
      return null;
    }
    return items;
  }

  function relNote(name) {
    var map = {
      '육합': '서로 묶여 떨어지기 어렵다. 정(情)과 집착이 같이 생긴다.',
      '충': '정면 충돌·이동·교체. 그 자리의 것이 흔들린다.',
      '파': '틈이 벌어지고 약속이 어긋난다. 결정적인 파열보다 잔금.',
      '해': '은근한 배신감·서운함. 표면은 멀쩡한데 속이 상한다.'
    };
    return map[name] || '';
  }

  /* ------------------------------------------------------- 신강/신약 */
  function computeStrength(pillars, dayStem) {
    var dayEl = STEM_EL[STEMS.indexOf(dayStem)];
    var inEl = Object.keys(SAENG).filter(function (k) { return SAENG[k] === dayEl; })[0];
    var score = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
    var detail = { gan: 0, zhi: 0 };

    ['year', 'month', 'day', 'hour'].forEach(function (pos) {
      var p = pillars[pos];
      if (!p) return;
      score[STEM_EL[STEMS.indexOf(p.gan)]] += GAN_W[pos];
      detail.gan += GAN_W[pos];
      HIDDEN[p.zhi].forEach(function (h) {
        var w = ZHI_W[pos] * h[1];
        score[STEM_EL[STEMS.indexOf(h[0])]] += w;
        detail.zhi += w;
      });
    });

    var support = score[dayEl] + score[inEl];
    var total = ELS.reduce(function (a, e) { return a + score[e]; }, 0);
    var ratio = support / total;

    var level = ratio >= 0.60 ? '극신강' : ratio >= 0.52 ? '신강' : ratio >= 0.46 ? '중화' : ratio >= 0.38 ? '신약' : '극신약';
    var monthMain = HIDDEN[pillars.month.zhi][HIDDEN[pillars.month.zhi].length - 1][0];
    var dayMain = HIDDEN[pillars.day.zhi][HIDDEN[pillars.day.zhi].length - 1][0];
    var deukryeong = STEM_EL[STEMS.indexOf(monthMain)] === dayEl || SAENG[STEM_EL[STEMS.indexOf(monthMain)]] === dayEl;
    var deukji = STEM_EL[STEMS.indexOf(dayMain)] === dayEl || SAENG[STEM_EL[STEMS.indexOf(dayMain)]] === dayEl;
    var deukse = ratio >= 0.50;

    return {
      score: score, total: total, ratio: ratio, level: level,
      support: support, oppose: total - support,
      deukryeong: deukryeong, deukji: deukji, deukse: deukse,
      pct: ELS.map(function (e) { return { el: e, v: score[e] / total * 100 }; })
    };
  }

  /* ------------------------------------------------------------ 격국 */
  function computeStructure(pillars, dayStem, strength) {
    var monthZhi = pillars.month.zhi;
    var hidden = HIDDEN[monthZhi];
    var main = hidden[hidden.length - 1][0];
    var mid = hidden.length > 1 ? hidden[hidden.length - 2][0] : main;
    var transparent = [];
    ['year', 'month', 'hour'].forEach(function (pos) {
      if (!pillars[pos]) return;
      if (pillars[pos].gan === main || pillars[pos].gan === mid) {
        transparent.push({ pos: pos, gan: pillars[pos].gan, tg: tenGod(dayStem, pillars[pos].gan) });
      }
    });

    var name, basis, quality;
    if (YANGIN[dayStem] === monthZhi) {
      name = '양인격';
      basis = '월지 ' + monthZhi + '가 일간 ' + dayStem + '의 양인(刃) 자리';
      quality = '추진력은 최강, 다만 힘을 쓰는 방향을 못 잡으면 자기 몸을 벤다';
    } else if (GEONROK[dayStem] === monthZhi) {
      name = '건록격';
      basis = '월지 ' + monthZhi + '가 일간 ' + dayStem + '의 건록 자리';
      quality = '자립 구조. 남 밑에서 인정받기보다 자기 이름으로 해야 사는 격';
    } else {
      var tg = transparent.length ? transparent[0].tg : tenGod(dayStem, main);
      name = tg + '격';
      basis = transparent.length
        ? '월지 ' + monthZhi + '의 ' + (mid === transparent[0].gan ? '중기' : '정기') + ' ' + transparent[0].gan + '가 ' + posKr(transparent[0].pos) + '에 투출'
        : '월지 ' + monthZhi + '의 정기 ' + main + '가 천간에 투출하지 않아 월지 본기로 격을 잡음(미투출)';
      quality = transparent.length ? '격이 천간에 드러나 작동 방식이 분명하다' : '격은 있으나 드러나지 않아 쓰임이 둔하다';
    }

    /* 파격 기미: 격을 잡은 글자가 충·합으로 흔들리는지 */
    var notes = [];
    var rels = computeRelations(pillars);
    var seen = {};
    rels.forEach(function (r) {
      if (r.kind === '충' && (r.pair.indexOf(monthZhi) >= 0)) {
        var t1 = '월지가 ' + r.pair + ' 충을 맞아 격의 뿌리가 흔들린다';
        if (!seen[t1]) { seen[t1] = 1; notes.push(t1); }
      }
      if (r.type === '천간합' && transparent.length && r.pair.indexOf(transparent[0].gan) >= 0) {
        var t2 = '격을 투출한 ' + transparent[0].gan + '가 합에 묶여 제 역할을 못 한다';
        if (!seen[t2]) { seen[t2] = 1; notes.push(t2); }
      }
    });
    if (name.indexOf('편관') === 0 && strength.level.indexOf('신약') >= 0) notes.push('신약한데 편관격 — 관이 나를 누르는 쪽으로만 작동한다');

    return { name: name, basis: basis, quality: quality, transparent: transparent, main: main, mid: mid, notes: notes };
  }

  function posKr(p) { return { year: '년간', month: '월간', day: '일간', hour: '시간' }[p] || p; }

  /* ------------------------------------------------------------ 용신 */
  function computeYongsin(pillars, dayStem, strength) {
    var dayEl = STEM_EL[STEMS.indexOf(dayStem)];
    var sik = SAENG[dayEl], jae = GEUK[dayEl];
    var gwan = Object.keys(GEUK).filter(function (k) { return GEUK[k] === dayEl; })[0];
    var inEl = Object.keys(SAENG).filter(function (k) { return SAENG[k] === dayEl; })[0];
    var strong = strength.ratio >= 0.52;

    function sc(e) { return strength.score[e] || 0; }
    var yong, hui, gi, method, reason;

    if (strong) {
      var cands = [
        { el: sik, cls: '식상', s: sc(sik) },
        { el: jae, cls: '재성', s: sc(jae) },
        { el: gwan, cls: '관성', s: sc(gwan) }
      ].sort(function (a, b) { return b.s - a.s; });
      yong = cands[0].el;
      /* 희신: 용신의 작용을 이어 주는 오행 (식상→재성, 재성→식상, 관성→재성) */
      var huiMap = { '식상': jae, '재성': sik, '관성': jae };
      hui = huiMap[cands[0].cls] || cands[1].el;
      gi = sc(inEl) >= sc(dayEl) ? inEl : dayEl;
      method = '억부용신 (신강 → 설기·극제)';
      reason = '일간 ' + dayStem + '(' + dayEl + ') 세력이 ' + Math.round(strength.ratio * 100) + '%로 강해, 같은 편을 더 키우면 과잉이다. ' + cands.map(function (c) {
        return c.cls + '(' + c.el + ') ' + c.s.toFixed(1);
      }).join(', ') + ' 중 가장 힘이 실린 ' + cands[0].cls + ' ' + yong + '을 쓴다.';
    } else {
      var cands2 = [
        { el: inEl, cls: '인성', s: sc(inEl) },
        { el: dayEl, cls: '비겁', s: sc(dayEl) }
      ].sort(function (a, b) { return b.s - a.s; });
      yong = cands2[0].el;
      hui = cands2[1].el;
      gi = sc(jae) >= sc(gwan) ? jae : gwan;
      method = '억부용신 (신약 → 생조)';
      reason = '일간 ' + dayStem + '(' + dayEl + ') 세력이 ' + Math.round(strength.ratio * 100) + '%로 약해, 나를 눌러대는 ' + (sc(jae) >= sc(gwan) ? '재성 ' + jae : '관성 ' + gwan) + '보다 나를 살리는 ' + yong + '이 급하다.';
    }

    /* 조후 */
    var monthZhi = pillars.month.zhi;
    var winter = ['亥', '子', '丑'].indexOf(monthZhi) >= 0;
    var summer = ['巳', '午', '未'].indexOf(monthZhi) >= 0;
    var johu = null;
    if (winter) {
      johu = { el: '화', need: sc('화') < strength.total * 0.10, note: '해자축월 출생 — 火가 거의 없어 조후로는 火가 급하다' };
    } else if (summer) {
      johu = { el: '수', need: sc('수') < strength.total * 0.10, note: '사오미월 출생 — 水가 거의 없어 조후로는 水가 급하다' };
    }
    var conflict = johu && johu.need && johu.el !== yong;

    return {
      yongsin: yong, huisin: hui, gisin: gi, method: method, reason: reason,
      johu: johu, conflict: !!conflict,
      dayEl: dayEl, sikEl: sik, jaeEl: jae, gwanEl: gwan, inEl: inEl
    };
  }

  /* ------------------------------------------------------------ 대운 */
  function computeDaewoon(birthMs, yearStem, monthGz, gender, jieList) {
    var yangYear = STEMS.indexOf(yearStem) % 2 === 0;
    var forward = (yangYear && gender === 'M') || (!yangYear && gender === 'F');
    var prev = null, next = null;
    for (var i = 0; i < jieList.length; i++) {
      if (jieList[i].ms <= birthMs) prev = jieList[i];
      else { next = jieList[i]; break; }
    }
    var target = forward ? next : prev;
    var diffDays = Math.abs((target ? target.ms : birthMs) - birthMs) / 86400000;
    var startMonths = Math.round(diffDays / 3 * 12);
    var startAge = { years: Math.floor(startMonths / 12), months: startMonths % 12 };
    var startYearsFloat = startMonths / 12;

    var mIdx = sexIndex(monthGz);
    var list = [];
    for (var k = 0; k < 10; k++) {
      var idx = forward ? mIdx + (k + 1) : mIdx - (k + 1);
      var gz = ganOf(idx);
      var fromAge = Math.floor(startYearsFloat) + k * 10;
      list.push({
        idx: k, gz: gz, gan: gz.charAt(0), zhi: gz.charAt(1),
        fromAge: fromAge, toAge: fromAge + 10,
        startYear: null, endYear: null
      });
    }
    return {
      forward: forward, dirLabel: forward ? '순행(順行)' : '역행(逆行)',
      targetName: target ? target.kr : null, targetNameCn: target ? target.name : null,
      diffDays: diffDays, startAge: startAge, startYearsFloat: startYearsFloat,
      startMonths: startMonths, list: list
    };
  }

  /* ------------------------------------------------------- 세운 계산 */
  function computeSeun(year, dayStem, pillars, yongsin) {
    var gz = ganOf(year - 4);
    var g = gz.charAt(0), b = gz.charAt(1);
    var tg = tenGod(dayStem, g);
    var el = STEM_EL[STEMS.indexOf(g)];
    var rels = [];
    ['year', 'month', 'day', 'hour'].forEach(function (pos) {
      if (!pillars[pos]) return;
      var zhi = pillars[pos].zhi;
      if (b !== zhi && CHUNG.some(function (c) { return c.indexOf(b) >= 0 && c.indexOf(zhi) >= 0; })) rels.push(({ year: '년지', month: '월지', day: '일지', hour: '시지' })[pos] + ' ' + zhi + '와 충');
      if (b !== zhi && YUKHAP.some(function (c) { return c.indexOf(b) >= 0 && c.indexOf(zhi) >= 0; })) rels.push(({ year: '년지', month: '월지', day: '일지', hour: '시지' })[pos] + ' ' + zhi + '와 육합');
      if (b === zhi && HYUNG_SELF.indexOf(b) >= 0) rels.push(({ year: '년지', month: '월지', day: '일지', hour: '시지' })[pos] + ' ' + zhi + '와 자형');
    });
    var favor = el === yongsin.yongsin ? '용신' : el === yongsin.huisin ? '희신' : el === yongsin.gisin ? '기신' : '중립';
    return { year: year, gz: gz, gan: g, zhi: b, tenGod: tg, el: el, favor: favor, rels: rels };
  }

  /* ======================================================== 메인 계산 */
  function compute(input, opts) {
    opts = opts || {};
    var warnings = [], notes = [];
    var nowMs = opts.now ? opts.now : Date.now();

    /* 1) 입력 날짜 → 양력 확정 */
    var solarY = input.year, solarM = input.month, solarD = input.day;
    var lunarInfo = null;
    if (input.calendar === 'lunar') {
      var leap = !!input.leap;
      var lunarObj;
      try {
        lunarObj = Lunar.fromYmd(input.year, leap ? -input.month : input.month, input.day);
      } catch (e) {
        throw new Error('음력 ' + input.year + '년 ' + (leap ? '윤' : '') + input.month + '월 ' + input.day + '일은 존재하지 않는 날짜입니다. 윤달 여부를 확인해 주세요.');
      }
      var s = lunarObj.getSolar();
      solarY = s.getYear(); solarM = s.getMonth(); solarD = s.getDay();
      lunarInfo = { year: input.year, month: input.month, day: input.day, leap: leap };
    } else {
      if (input.month < 1 || input.month > 12 || input.day < 1 || input.day > daysInMonth(input.year, input.month)) {
        throw new Error('존재하지 않는 양력 날짜입니다.');
      }
      var lo = Solar.fromYmd(solarY, solarM, solarD).getLunar();
      lunarInfo = { year: lo.getYear(), month: Math.abs(lo.getMonth()), day: lo.getDay(), leap: lo.getMonth() < 0 };
    }

    /* 2) 시각 */
    var timeKnown = input.timeKnown !== false;
    var clockH = timeKnown ? (input.hour | 0) : 12;
    var clockMi = timeKnown ? (input.minute | 0) : 0;
    var wallMs = utcOf(solarY, solarM, solarD, clockH, clockMi);

    /* 3) 표준시 이력 + 서머타임 */
    var std = standardOffsetMin(wallMs);
    var dst = dstInfo(wallMs);
    if (dst.applied) {
      notes.push('서머타임 적용: ' + dst.year + '년 서머타임 기간(' + fmtDateArr(dst.from) + ' ~ ' + fmtDateArr(dst.to) + ')에 태어나 입력 시각에서 1시간을 빼고 계산했습니다.');
      if (dst.gap) warnings.push('입력한 시각은 서머타임이 시작되며 사라진 시간대입니다(존재하지 않는 시각). 실제 출생 기록을 다시 확인해 주세요.');
      if (dst.ambiguous) warnings.push('입력한 시각은 서머타임이 끝나며 두 번 지나간 시간대입니다. 어느 쪽 시각인지에 따라 시주가 달라질 수 있습니다.');
    }
    if (std.min !== 540) {
      notes.push('당시 표준시는 ' + std.label + '였습니다. 지금 기준 UTC+9와 ' + Math.abs(std.min - 540) + '분 차이가 있어 자동 보정했습니다.');
    }

    var instantMs = wallMs - (std.min + dst.min) * 60000;

    /* 4) 진태양시 보정 */
    var cityLon = input.longitude != null ? input.longitude : 126.978;
    var useTrueSolar = input.useTrueSolar !== false;
    var useEoT = !!input.useEoT;
    var applyToDay = !!input.applyTrueSolarToDay;
    var lonMin = (cityLon - 135) * 4;
    var eot = useEoT ? equationOfTimeMin(instantMs) : 0;
    var correctionMin = 0;
    var civilMs = instantMs + std.min * 60000;      /* 표준시(서머타임 제거) 기준 시계 */
    var servTimeMs = useTrueSolar ? (instantMs + cityLon * 4 * 60000 + eot * 60000) : civilMs;
    if (useTrueSolar) {
      correctionMin = Math.round((cityLon * 4 - std.min + eot));
      if (Math.abs(lonMin) >= 1) {
        notes.push('진태양시 보정: ' + cityLon.toFixed(3) + '°E 기준 경도차 ' + (lonMin > 0 ? '+' : '') + Math.round(lonMin) + '분' + (useEoT ? ', 균시차 ' + (eot > 0 ? '+' : '') + Math.round(eot) + '분' : '') + '을 시주 계산에 적용했습니다.');
      }
    }
    var lp = partsOf(servTimeMs);
    var cp = partsOf(civilMs);

    /* 5) 자시 학파 — 일주는 기본적으로 표준시 기준 '그 날'의 일진 */
    var jaRule = input.jaSiRule === 'ya' ? 'ya' : 'jo';
    var dayBase = applyToDay ? lp : cp;
    var dayY = dayBase.y, dayM = dayBase.m, dayD = dayBase.d;
    var jaSiWarning = null;
    if (clockH === 23) {
      if (jaRule === 'ya') {
        var nx = partsOf(Date.UTC(dayY, dayM - 1, dayD) + 86400000);
        dayY = nx.y; dayM = nx.m; dayD = nx.d;
        jaSiWarning = '23시대 출생 — 야자시 기준(23:00에 일주가 바뀜)을 적용해 일주를 다음 날로 계산했습니다. 조자시 기준과 결과가 다를 수 있습니다.';
      } else {
        jaSiWarning = '23시대 출생 — 조자시 기준(00:00에 일주가 바뀜)을 적용했습니다. 야자시 기준과 결과가 다를 수 있습니다.';
      }
      warnings.push(jaSiWarning);
    }
    if (clockH !== 23 && lp.h === 23) {
      warnings.push('진태양시 보정 결과 보정 시각은 23시대인데 기록된 출생 시각은 ' + pad2(clockH) + '시대입니다. 자시 학파(조자시/야자시) 설정에 따라 일주가 달라질 수 있습니다.');
    }
    if (useTrueSolar && (applyToDay ? (lp.d !== cp.d || lp.m !== cp.m) : false)) {
      notes.push('진태양시 보정으로 날짜가 ' + cp.y + '-' + pad2(cp.m) + '-' + pad2(cp.d) + ' → ' + lp.y + '-' + pad2(lp.m) + '-' + pad2(lp.d) + '로 넘어가, 일주도 보정 시각 기준으로 계산했습니다.');
    }
    if (cp.h === 0 && lp.h === 23) {
      warnings.push('자정 직후 출생인데 진태양시 보정을 하면 전날 23시대로 넘어갑니다. 학파에 따라 일주가 하루 달라질 수 있으니 야자시/조자시 설정을 함께 확인하세요.');
    }

    /* 6) 사주 4주 */
    var dIdx = dayIndex(dayY, dayM, dayD);
    var dayGz = ganOf(dIdx);
    var dayStem = dayGz.charAt(0);

    var hourBranchIdx = Math.floor(((lp.h + 1) % 24) / 2);
    var hourStemIdx = mod((STEMS.indexOf(dayStem) % 5) * 2 + hourBranchIdx, 10);
    var hourGz = STEMS[hourStemIdx] + BRANCHES[hourBranchIdx];

    /* 년주·월주: 실제 절기 절대시각 기준 (베이징 표준시로 환산해 라이브러리 조회) */
    var bj = partsOf(instantMs + 8 * 3600000);
    var bjLunar = Solar.fromYmdHms(bj.y, bj.m, bj.d, bj.h, bj.mi, 0).getLunar();
    var yearGz = bjLunar.getYearInGanZhiExact();
    var monthGz = bjLunar.getMonthInGanZhiExact();

    /* 6) 절기 정보 */
    var jieAll = collectJieQi(instantMs);
    var jieList = jieAll.filter(function (t) { return JIE_ORDER.indexOf(t.name) >= 0; });
    var prevJie = null, nextJie = null;
    jieList.forEach(function (t) {
      if (t.ms <= instantMs) prevJie = t;
      else if (!nextJie) nextJie = t;
    });
    if (nextJie && (nextJie.ms - instantMs) < 2 * 3600000) {
      warnings.push('출생 시각이 ' + nextJie.kr + ' 절입(' + fmtKst(nextJie.ms) + ')까지 2시간 이내입니다. 절입 경계에서는 몇 분 차이로 월주가 바뀌므로 출생 시각을 다시 확인하세요.');
    }
    if (prevJie && (instantMs - prevJie.ms) < 2 * 3600000) {
      warnings.push('출생 시각이 ' + prevJie.kr + ' 절입 직후 2시간 이내입니다. 절입 경계에서는 몇 분 차이로 월주가 바뀌므로 출생 시각을 다시 확인하세요.');
    }
    if (!timeKnown) {
      warnings.push('출생시간 미상 — 시주 없이 3주(6글자)로 계산했습니다. 시주·시간 관련 해석은 생략되며, 대운 기산은 정오(12:00)를 가정했습니다.');
    }

    /* 7) 기둥 데이터 구성 */
    function buildPillar(pos, gz, withTime) {
      var gan = gz.charAt(0), zhi = gz.charAt(1);
      var hidden = HIDDEN[zhi].map(function (h) {
        return { stem: h[0], el: STEM_EL[STEMS.indexOf(h[0])], tenGod: tenGod(dayStem, h[0]), weight: h[1] };
      });
      return {
        pos: pos, gz: gz, gan: gan, zhi: zhi, ganKr: STEM_KR[STEMS.indexOf(gan)], zhiKr: BRANCH_KR[BRANCHES.indexOf(zhi)],
        ganEl: STEM_EL[STEMS.indexOf(gan)], zhiEl: BRANCH_EL[BRANCHES.indexOf(zhi)],
        tenGodGan: pos === 'day' ? '일간' : tenGod(dayStem, gan),
        tenGodZhi: tenGod(dayStem, hidden[hidden.length - 1].stem),
        hidden: hidden, stage: stageOf(dayStem, zhi),
        yinYang: STEMS.indexOf(gan) % 2 === 0 ? '양' : '음'
      };
    }
    var pillars = {
      year: buildPillar('year', yearGz),
      month: buildPillar('month', monthGz),
      day: buildPillar('day', dayGz),
      hour: timeKnown ? buildPillar('hour', hourGz) : null
    };

    var strength = computeStrength(pillars, dayStem);
    var structure = computeStructure(pillars, dayStem, strength);
    var yongsin = computeYongsin(pillars, dayStem, strength);
    var relations = computeRelations(pillars);
    var sinsal = computeSinsal(pillars, timeKnown);

    /* 8) 대운 */
    var daewoon = computeDaewoon(instantMs, yearGz.charAt(0), monthGz, input.gender === 'F' ? 'F' : 'M', jieList);
    var birthParts = partsOf(instantMs);
    var startDateMs = utcOf(solarY + daewoon.startAge.years, solarM, solarD) + daewoon.startAge.months * 30.4 * 86400000;
    daewoon.list.forEach(function (d, i) {
      var s = partsOf(startDateMs + i * 10 * 365.2425 * 86400000);
      d.startYear = s.y;
      d.endYear = s.y + 10;
      d.tenGod = tenGod(dayStem, d.gan);
      d.el = STEM_EL[STEMS.indexOf(d.gan)];
      d.favor = d.el === yongsin.yongsin ? '용신' : d.el === yongsin.huisin ? '희신' : d.el === yongsin.gisin ? '기신' : '중립';
    });

    /* 현재 나이 */
    var nowP = partsOf(nowMs);
    var age = nowP.y - solarY;
    var hadBirthday = (nowP.m > solarM) || (nowP.m === solarM && nowP.d >= solarD);
    if (!hadBirthday) age -= 1;
    var ageExact = (nowMs - instantMs) / (365.2425 * 86400000);

    var current = null;
    for (var i = 0; i < daewoon.list.length; i++) {
      var d = daewoon.list[i];
      if (ageExact >= d.fromAge && ageExact < d.toAge) { current = d; break; }
    }
    if (!current && ageExact < daewoon.list[0].fromAge) current = { preStart: true, fromAge: 0, toAge: daewoon.list[0].fromAge, gz: monthGz };
    if (!current) current = daewoon.list[daewoon.list.length - 1];

    /* 9) 세운 (올해부터 12년) */
    var seunList = [];
    for (var y = nowP.y - 1; y <= nowP.y + 10; y++) seunList.push(computeSeun(y, dayStem, pillars, yongsin));
    var thisYear = seunList.filter(function (s) { return s.year === nowP.y; })[0];

    var chart = {
      input: input,
      now: { y: nowP.y, m: nowP.m, d: nowP.d, age: age, ageExact: ageExact },
      solar: { y: solarY, m: solarM, d: solarD, h: clockH, mi: clockMi },
      lunar: lunarInfo,
      timeKnown: timeKnown,
      std: std, dst: dst,
      instantMs: instantMs,
      clock: { h: clockH, mi: clockMi },
      sajuTime: { y: lp.y, m: lp.m, d: lp.d, h: lp.h, mi: lp.mi },
      civilTime: { y: cp.y, m: cp.m, d: cp.d, h: cp.h, mi: cp.mi },
      correction: { useTrueSolar: useTrueSolar, useEoT: useEoT, lon: cityLon, lonMin: lonMin, eot: eot, totalMin: correctionMin, applyToDay: applyToDay },
      jaSiRule: jaRule,
      pillars: pillars,
      dayMaster: {
        stem: dayStem, stemKr: STEM_KR[STEMS.indexOf(dayStem)], el: STEM_EL[STEMS.indexOf(dayStem)],
        yinYang: STEMS.indexOf(dayStem) % 2 === 0 ? '양' : '음',
        inEl: yongsin.inEl, sikEl: yongsin.sikEl, jaeEl: yongsin.jaeEl, gwanEl: yongsin.gwanEl
      },
      strength: strength,
      structure: structure,
      yongsin: yongsin,
      relations: relations,
      sinsal: sinsal,
      daewoon: daewoon,
      currentDaewoon: current,
      seun: { thisYear: thisYear, list: seunList },
      prevJie: prevJie, nextJie: nextJie, jieList: jieList,
      warnings: warnings, notes: notes
    };

    chart.counts = countTenGods(pillars);
    chart.elPct = strength.pct;
    return chart;
  }

  function countTenGods(pillars) {
    var c = { 비견: 0, 겁재: 0, 식신: 0, 상관: 0, 편재: 0, 정재: 0, 편관: 0, 정관: 0, 편인: 0, 정인: 0 };
    ['year', 'month', 'day', 'hour'].forEach(function (p) {
      if (!pillars[p]) return;
      if (p !== 'day') c[pillars[p].tenGodGan] += 1;
      pillars[p].hidden.forEach(function (h) { c[h.tenGod] += 1; });
    });
    var cls = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
    Object.keys(c).forEach(function (k) { cls[tenGodClass(k)] += c[k]; });
    return { detail: c, cls: cls };
  }

  function fmtDateArr(a) { return a[0] + '-' + pad2(a[1]) + '-' + pad2(a[2]); }
  function fmtDateTime(ms) {
    var p = partsOf(ms);
    return p.y + '-' + pad2(p.m) + '-' + pad2(p.d) + ' ' + pad2(p.h) + ':' + pad2(p.mi);
  }
  function fmtKst(ms) { return fmtDateTime(ms + 9 * 3600000); }

  /* ------------------------------------------------------------ export */
  root.SajuEngine = {
    compute: compute,
    tenGod: tenGod,
    tenGodClass: tenGodClass,
    elementOfTenGod: elementOfTenGod,
    stageOf: stageOf,
    ganOf: ganOf,
    sexIndex: sexIndex,
    dayIndex: dayIndex,
    mod: mod,
    CITIES: CITIES,
    STEMS: STEMS, STEM_KR: STEM_KR, BRANCHES: BRANCHES, BRANCH_KR: BRANCH_KR,
    STEM_EL: STEM_EL, BRANCH_EL: BRANCH_EL, ELS: ELS, SAENG: SAENG, GEUK: GEUK,
    HIDDEN: HIDDEN, STAGES: STAGES,
    JIE_ORDER: JIE_ORDER, JIE_KR: JIE_KR,
    collectJieQi: collectJieQi,
    stdOffset: standardOffsetMin,
    dstInfo: dstInfo,
    equationOfTimeMin: equationOfTimeMin,
    fmtDateTime: fmtDateTime,
    fmtKst: fmtKst,
    _internal: { computeRelations: computeRelations, computeStrength: computeStrength, computeStructure: computeStructure, computeYongsin: computeYongsin, computeSinsal: computeSinsal, computeDaewoon: computeDaewoon, countTenGods: countTenGods, jdn: jdn }
  };
})(typeof window !== 'undefined' ? window : this);
