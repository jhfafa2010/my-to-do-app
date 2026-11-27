/* =========================================================================
   사주 ROAST — 분석 텍스트 생성기 (analysis.js)
   계산된 원국(chart)을 근거로 6개 섹션 + 학설 비교 + 최종 평가를 만든다.
   원칙: 근거(명리학) → 예상 행동 → ROAST 한마디
   ========================================================================= */
(function (root) {
  'use strict';

  var E = root.SajuEngine;
  var STEMS = E.STEMS, BRANCHES = E.BRANCHES;
  var STEM_KR = E.STEM_KR, BRANCH_KR = E.BRANCH_KR;
  var STEM_EL = E.STEM_EL, BRANCH_EL = E.BRANCH_EL;

  /* ============================================================ 일간 프로필 */
  var STEM_PROFILE = {
    '甲': {
      image: '큰 나무', el: '목',
      essence: '곧게 자라는 큰 나무. 방향이 정해지면 옆을 보지 않고 위로만 뻗는다. 성장 자체가 목적이라 "왜"보다 "어디로"에 먼저 반응한다.',
      outside: '정면승부하는 사람. 말이 곧고 뒤에서 딴말을 하지 않아 신뢰는 두터운 편.',
      inside: '인정받고 싶은 마음이 큰데, 그걸 부탁의 형태로 말하지 못하고 성과로 증명하려 든다.',
      strengths: ['시작하는 힘', '원칙을 지키는 신뢰', '앞장서는 책임감'],
      weaknesses: ['꺾이는 법을 모름', '융통성을 포기로 착각', '도움 요청이 늦음'],
      stress: '부당하다고 느끼면 즉시 예민해지고, 감정보다 논리로 상대를 눌러 이기려 한다.',
      love: '밀당 없이 직진. 상대가 자기 속도를 못 따라오면 "이 사람은 나를 모른다"로 정리해 버린다.',
      work: '조직의 기둥 역할. 다만 위에서 계속 누르면 견디다가 어느 날 한 번에 끊어 버린다.',
      roast: {
        low: '고집이 세다는 말을 들을 수 있어요. 결정을 내리기 전에 "내가 틀릴 수도 있다"를 한 번만 꺼내 보세요.',
        mid: '당신의 신념은 종종 "내가 이미 정했으니 네 말은 듣지 않겠다"의 다른 이름이다.',
        high: '당신은 유연함을 배신으로 착각한다. 그래서 똑똑한데도 자주 혼자 남는다. 꺾이지 않는 게 강함이 아니라, 꺾여도 다시 서는 게 강함이다.'
      }
    },
    '乙': {
      image: '덩굴과 풀', el: '목',
      essence: '바위를 감아 올라가는 덩굴. 정면으로 밀지 않고 틈을 찾아 자란다. 부드러움이 전략이고, 그 전략을 본인도 의식하지 못할 때가 많다.',
      outside: '무던하고 맞춰주는 사람. 웬만한 일엔 "괜찮아요"를 먼저 꺼낸다.',
      inside: '속으로는 상대의 태도를 전부 계산하고 있고, 서운한 지점을 정확히 기억한다.',
      strengths: ['상황 적응력', '눈치와 타이밍', '끈질긴 생존력'],
      weaknesses: ['결정을 미룸', '서운함을 쌓아 두고 터뜨림', '관계에 기대는 습관'],
      stress: '직접 부딪히지 않고 자리를 피한 뒤, 혼자 그 장면을 몇 번씩 다시 돌려본다.',
      love: '상대에게 맞춰 주다가 어느 순간 "나만 맞추고 있다"는 계산이 켜지며 냉각된다.',
      work: '분위기를 읽고 실무를 매끄럽게 만드는 데 강하다. 다만 자기 공을 드러내지 못해 평가에서 밀린다.',
      roast: {
        low: '속마음을 조금 더 일찍 꺼내면 관계가 편해져요. 참는 게 배려는 아니에요.',
        mid: '당신의 "괜찮아요"는 대부분 괜찮지 않다는 뜻이다. 상대는 그걸 모르고, 당신은 그걸로 서운해한다.',
        high: '당신은 맞춰주는 척하다가 계산서를 나중에 한꺼번에 들이미는 타입이다. 그 계산서는 대개 상대가 아니라 관계를 죽인다.'
      }
    },
    '丙': {
      image: '태양', el: '화',
      essence: '한낮의 태양. 숨기지 않고 비추는 힘. 존재 자체가 밝고, 그 밝기로 사람을 끌어당기지만 그림자도 그만큼 짙게 만든다.',
      outside: '에너지가 크고 화끈한 사람. 웃음이 크고 말이 빠르며 분위기를 끌고 간다.',
      inside: '의외로 "나 없으면 이 자리 안 굴러간다"는 불안을 안고 있다. 그래서 더 크게 웃는다.',
      strengths: ['존재감과 추진력', '직관적 판단', '사람을 끌어모으는 힘'],
      weaknesses: ['뒷심 부족', '감정 기복', '디테일 방치'],
      stress: '즉시 말로 터뜨린다. 화는 금방 식지만, 그 말을 들은 사람은 오래 기억한다.',
      love: '빠르게 뜨겁게 시작하고, 권태가 오면 "이게 사랑이 맞나"부터 의심한다.',
      work: '기획·영업·발표처럼 앞에 서는 일에서 강하다. 마무리와 관리 업무는 대개 남에게 넘어간다.',
      roast: {
        low: '시작은 최고인데 마무리에서 힘이 빠져요. 마지막 10%를 남에게 맡기지 마세요.',
        mid: '당신의 열정은 대개 3주짜리다. 시작할 때의 그 말투로 마무리까지 가는 게 진짜 실력이다.',
        high: '당신은 무대가 비면 불안해서 조명을 직접 들고 다닌다. 그래서 늘 바쁜데 아무것도 끝나지 않는다.'
      }
    },
    '丁': {
      image: '촛불·별', el: '화',
      essence: '어둠 속의 촛불. 크지 않지만 그 자리를 정확히 밝힌다. 섬세한 감각과 조용한 집념이 무기이고, 동시에 소모가 빠른 구조다.',
      outside: '차분하고 예의 바른 사람. 감정을 크게 드러내지 않아 속을 알기 어렵다.',
      inside: '한 번 꽂히면 오래 간다. 그 집념이 관계에서는 집착으로 보인다.',
      strengths: ['섬세한 관찰', '한 우물 파는 집념', '분위기 읽기'],
      weaknesses: ['감정을 안 보여줌', '혼자 삭힘', '의심이 많음'],
      stress: '겉은 조용한데 속에서 계속 재생. 말로 꺼내기 전에 이미 결론을 내려 둔다.',
      love: '표현은 적은데 기대는 크다. 상대가 그 기대를 못 읽으면 조용히 실망하고 조용히 멀어진다.',
      work: '전문성·정확성이 필요한 일에 강하다. 다만 사람과의 마찰을 피하려다 문제를 키운다.',
      roast: {
        low: '기대를 말로 해 주세요. 상대는 당신 눈빛을 읽는 능력이 없어요.',
        mid: '당신은 "말 안 해도 알겠지"를 신봉하는데, 그 신앙 때문에 늘 혼자 실망한다.',
        high: '당신의 조용함은 배려가 아니라 회피다. 속으로 재고 또 재다가, 결국 아무 말도 못 하고 관계를 스스로 끊는다.'
      }
    },
    '戊': {
      image: '큰 산', el: '토',
      essence: '움직이지 않는 큰 산. 쉽게 흔들리지 않고, 한번 자리를 잡으면 그 자리를 지킨다. 안정이 무기이고 변화가 약점이다.',
      outside: '묵직하고 믿음직한 사람. 말수가 적고 감정 기복이 적어 보인다.',
      inside: '속으로는 계산이 많고, 손해 보는 상황을 오래 곱씹는다. 겉의 무던함과 속의 예민함이 다르다.',
      strengths: ['버티는 힘', '신뢰감', '책임을 회피하지 않음'],
      weaknesses: ['변화 대응이 느림', '속마음 감춤', '결정 미룸'],
      stress: '겉으로는 아무 일 없는 척하고, 혼자 그 상황을 몇 달씩 곱씹는다.',
      love: '표현이 적어 상대가 "나를 좋아하긴 하나"를 의심하게 만든다.',
      work: '관리·운영·조직 안정에 강하다. 다만 새로운 판을 여는 속도는 느리다.',
      roast: {
        low: '마음에 있는 말을 조금만 더 꺼내 보세요. 무뚝뚝함이 신뢰는 되지만 친밀은 안 돼요.',
        mid: '당신은 안정을 이유로 결정을 미루고, 그 미룸이 더 큰 불안정을 만든다.',
        high: '당신은 "지켜보고 있다"고 말하지만 실제로는 "결정하기 싫다"는 뜻이다. 가만히 있는 동안 판은 이미 바뀐다.'
      }
    },
    '己': {
      image: '논밭의 흙', el: '토',
      essence: '곡식을 기르는 논밭. 화려하지 않지만 실속을 챙기고, 사람을 품는 자리다. 겉은 무던한데 속 기준은 아주 구체적이다.',
      outside: '부드럽고 잘 맞춰주는 사람. 웬만한 일엔 웃으면서 넘긴다.',
      inside: '머릿속에 손익 계산서가 항상 켜져 있다. 손해 본 것을 정확히 기억한다.',
      strengths: ['현실 감각', '포용력', '끝까지 챙기는 실무력'],
      weaknesses: ['속앓이', '계산을 숨김', '결정 지연'],
      stress: '겉은 태연한데 속에서 계속 정리하고, 결정적인 순간에 "그동안 내가 뭘 했는데"가 터진다.',
      love: '잘 챙겨 주다가, 그 챙김이 당연해지면 조용히 마음을 닫는다.',
      work: '실무·관리·조정에서 대체 불가. 대신 공을 남이 가져가도 말을 못 해 손해를 본다.',
      roast: {
        low: '참는 대신 그때그때 짧게 말해 보세요. 쌓아 두면 결국 관계가 먼저 지쳐요.',
        mid: '당신은 "나는 괜찮다"고 말하고 나서, 상대가 진짜 괜찮은 줄 알면 서운해한다. 그건 소통이 아니라 함정이다.',
        high: '당신은 배려라는 이름으로 계산서를 쓰고, 상대가 그 청구서를 못 받았다고 화를 낸다. 애초에 보낸 적이 없다.'
      }
    },
    '庚': {
      image: '원석과 칼', el: '금',
      essence: '쇠를 두드려 만든 칼. 결단과 실행이 빠르고, 불필요한 것을 잘라내는 데 주저함이 없다. 그 칼날이 관계로도 향한다.',
      outside: '직설적이고 시원시원한 사람. 할 말은 하고, 뒤끝은 없다고 믿는다.',
      inside: '인정욕구가 크지만 그걸 감추려고 더 강하게 말한다.',
      strengths: ['결단력', '실행 속도', '위기 대응'],
      weaknesses: ['말이 관계를 벰', '유연성 부족', '인정욕구를 강함으로 위장'],
      stress: '즉시 행동으로 푼다. 문제를 고치는 방식이 대개 "사람을 정리하는 것"이다.',
      love: '직진하고, 상대가 흔들리면 깔끔하게 자른다. 미련을 남기는 쪽을 더 싫어한다.',
      work: '구조조정·프로젝트 돌파에 강하다. 다만 조직을 오래 다듬는 일에는 인내가 부족하다.',
      roast: {
        low: '맞는 말이라도 타이밍과 방식이 있어요. 한 박자는 두고 말해 보세요.',
        mid: '당신은 "뒤끝 없다"고 하지만 상대는 그 말에 계속 아파한다. 뒤끝이 없어서가 아니라 상처를 안 세서다.',
        high: '당신은 사람을 자르는 걸 결단력이라고 부른다. 칼을 잘 쓰는 사람은 칼을 안 쓰고 설득한다.'
      }
    },
    '辛': {
      image: '보석과 바늘', el: '금',
      essence: '세공된 보석. 겉은 고급스럽고 감각적이지만 속은 바늘처럼 날카롭다. 정밀함이 강점이고 예민함이 대가다.',
      outside: '정돈된 취향과 깔끔한 말투. 감정 표현이 절제돼 있다.',
      inside: '사소한 말 한마디를 오래 곱씹고, 품위를 잃는 상황을 특히 싫어한다.',
      strengths: ['미적 감각', '정교한 판단', '디테일 관리'],
      weaknesses: ['예민한 자존심', '뒤에서 곱씹음', '까칠한 말투'],
      stress: '겉은 정색하고, 속에서 그 장면을 계속 재생하며 상대의 말을 하나씩 뜯어본다.',
      love: '이상이 높고, 상대의 사소한 결점이 크게 보인다. 정이 들면 쉽게 못 놓는다.',
      work: '품질·기획·디자인·분석처럼 기준이 높은 일에 강하다. 다만 사람 다루는 데 피로가 크다.',
      roast: {
        low: '지적하고 싶은 순간에 한 번만 참아 보세요. 대부분은 그냥 넘어가도 됩니다.',
        mid: '당신의 기준은 높은 게 아니라 예민한 거다. 둘은 결과가 완전히 다르다.',
        high: '당신은 품위를 지키느라 사람을 밀어내고, 그 결과를 "인연이 없었다"고 정리한다. 그 인연은 당신이 잘랐다.'
      }
    },
    '壬': {
      image: '큰물·바다', el: '수',
      essence: '막힘없이 흐르는 큰물. 스케일이 크고 생각이 유연하며, 틀에 갇히는 것을 견디지 못한다. 방향을 잃으면 범람한다.',
      outside: '여유 있고 유연한 사람. 웬만한 일에 흔들리지 않는 것처럼 보인다.',
      inside: '지루함에 대한 공포가 크고, 그래서 늘 다음 판을 생각한다.',
      strengths: ['큰 그림', '적응력', '사람을 담는 그릇'],
      weaknesses: ['집중 분산', '책임 회피', '방향 상실'],
      stress: '자리를 뜬다. 물리적으로든 정신적으로든 그 상황에서 빠져나오면 정리가 된 것처럼 느낀다.',
      love: '자유를 침해받는다고 느끼면 급격히 멀어진다. 붙잡으려 할수록 더 빨리 빠져나간다.',
      work: '사업·전략·영업처럼 판을 키우는 일에 강하다. 마무리와 세부 관리는 약하다.',
      roast: {
        low: '하기로 한 일의 마지막 10%를 끝까지 붙잡아 보세요. 그게 신뢰를 만듭니다.',
        mid: '당신은 가능성이 많다고 말하지만, 실제로는 시작만 많은 사람이다.',
        high: '당신은 "물은 원래 흐른다"며 자리를 뜨고, 그 자리에 남은 사람이 뒤처리를 한다. 그게 당신이 늘 새로 시작하는 이유다.'
      }
    },
    '癸': {
      image: '비와 이슬', el: '수',
      essence: '조용히 스며드는 물. 섬세하고 영리하며, 눈에 안 보이는 흐름을 먼저 감지한다. 감수성이 무기이고 과잉이 독이 된다.',
      outside: '온순하고 조심스러운 사람. 말수가 적고 눈치가 빠르다.',
      inside: '생각이 많고, 걱정이 먼저 앞선다. 시작 전에 실패 시나리오를 다섯 개쯤 그려 둔다.',
      strengths: ['직관과 감수성', '세밀한 관찰', '조용한 끈기'],
      weaknesses: ['걱정 과다', '우유부단', '감정에 잠김'],
      stress: '회피하거나 몰래 혼자 정리한다. 겉으로는 아무 일 없어 보인다.',
      love: '마음이 깊은데 표현이 느리고, 서운함을 쌓아 두다가 조용히 사라진다.',
      work: '연구·기획·상담·분석처럼 섬세함이 필요한 일에 강하다. 압박이 큰 영업·영업관리는 버겁다.',
      roast: {
        low: '생각이 많다는 건 장점이에요. 다만 결정할 때는 3분 안에 답을 정해 보세요.',
        mid: '당신은 준비가 안 됐다고 말하지만, 실제로는 결정을 미루는 핑계를 찾는 중이다.',
        high: '당신은 파도가 올까 봐 평생 해변에 서 있다. 파도는 이미 왔고, 당신은 발만 적셨다.'
      }
    }
  };

  /* ============================================================ 십성 프로필 */
  var TEN_GOD_PROFILE = {
    '비견': {
      one: '나와 같은 오행·같은 음양. 자존심, 동지, 자기 몫', cls: '비겁',
      over: '비겁 과다 — 내 주장은 강한데 남의 몫을 인정하는 데 인색해진다. 공동 작업에서 "내가 더 했다"는 계산이 먼저 켜지고, 돈이 들어오면 새는 구멍이 생긴다.',
      none: '비겁 부재 — 자기 편이 없다. 힘들어도 남에게 기대는 법을 모르고, 정작 도와주려는 사람의 손을 못 잡는다.',
      job: '자기 이름으로 하는 일, 개인 전문직, 단독 프로젝트'
    },
    '겁재': {
      one: '나와 같은 오행·다른 음양. 경쟁, 승부, 빼앗는 힘', cls: '비겁',
      over: '겁재 과다 — 승부욕이 앞서 관계를 경쟁으로 만들고, 손에 들어온 것도 지키는 데 에너지를 다 쓴다.',
      none: '겁재 부재 — 경쟁 상황을 피하고, 남과 비교하며 스스로를 깎는 쪽이 된다.',
      job: '경쟁이 있는 영업, 스포츠, 투자'
    },
    '식신': {
      one: '내가 생하는 오행·같은 음양. 표현, 여유, 안정적 생산', cls: '식상',
      over: '식신 과다 — 편안함을 추구하는 힘이 커져 실행 속도가 떨어지고, 먹고 즐기는 쪽으로 새는 돈이 늘어난다.',
      none: '식신 부재 — 표현이 서툴고, 잘해 놓고도 티를 못 내 손해를 본다.',
      job: '요리, 콘텐츠, 교육, 의료·돌봄'
    },
    '상관': {
      one: '내가 생하는 오행·다른 음양. 비판, 재기, 기존 질서에 대한 반항', cls: '식상',
      over: '상관 과다 — 말이 칼이 된다. 윗사람·규칙과 부딪히고, 재능은 있는데 조직에서 자리를 못 잡는다.',
      none: '상관 부재 — 하고 싶은 말을 삼키고, 부당한 상황에서도 목소리를 못 낸다.',
      job: '창작, 마케팅, 기획, 강의, 비평'
    },
    '편재': {
      one: '내가 극하는 오행·같은 음양. 유동 자산, 큰돈, 사업수완', cls: '재성',
      over: '편재 과다 — 돈이 크게 들어오고 크게 나간다. 벌 줄은 아는데 모으는 구조가 없다. 이성 문제도 이 자리에서 터지기 쉽다.',
      none: '편재 부재 — 큰 판을 벌이는 감각이 없어 안정적인 월급 구조에 머문다.',
      job: '사업, 영업, 투자, 유통'
    },
    '정재': {
      one: '내가 극하는 오행·다른 음양. 고정 자산, 성실한 소득', cls: '재성',
      over: '정재 과다 — 계산이 지나쳐 결정이 느려지고, 돈 걱정이 관계와 판단을 옥죄다. 신약한데 재성만 많으면 "재다신약"으로 몸과 마음이 먼저 지친다.',
      none: '정재 부재 — 관리 감각이 약해 벌어도 남는 게 없고, 현실 감각이 떨어진다.',
      job: '회계, 금융, 관리, 유통, 자산관리'
    },
    '편관': {
      one: '나를 극하는 오행·같은 음양. 압박, 권력, 승부', cls: '관성',
      over: '편관 과다 — 압박이 상시화된다. 통제당하는 느낌이 들면 반발하거나, 반대로 압박에 익숙해져 스스로를 몰아붙인다.',
      none: '편관 부재 — 판을 정리하는 힘이 약해, 결정을 미루고 갈등을 피한다.',
      job: '군·경·의료·법조, 구조조정, 위기관리'
    },
    '정관': {
      one: '나를 극하는 오행·다른 음양. 규칙, 직책, 사회적 신분', cls: '관성',
      over: '정관 과다 — 체면과 규칙에 눌려 자기 목소리를 못 낸다. 남이 정한 기준에 자신을 계속 맞춘다.',
      none: '정관 부재 — 조직의 규칙을 자기 것으로 만들지 못해, 직장에서 평가가 들쭉날쭉하다.',
      job: '공직, 대기업, 관리직, 행정'
    },
    '편인': {
      one: '나를 생하는 오행·같은 음양. 직관, 비정형 학습, 고립', cls: '인성',
      over: '편인 과다 — 생각이 많고 행동이 늦다. 남이 안 하는 것을 파고들다가 현실의 마감을 놓친다.',
      none: '편인 부재 — 직관을 못 믿고, 남이 정리해 준 틀 없이는 시작을 못 한다.',
      job: '연구, 전문기술, 종교·철학, 데이터'
    },
    '정인': {
      one: '나를 생하는 오행·다른 음양. 학습, 보호, 인정', cls: '인성',
      over: '정인 과다 — 보호받으려는 마음이 커져 결정을 남에게 넘기고, 준비만 하다 시작을 못 한다.',
      none: '정인 부재 — 배움의 뿌리가 약해, 꾸준히 쌓는 힘보다 즉흥에 기댄다.',
      job: '교육, 자격직, 연구, 문서·행정'
    }
  };

  /* ============================================================ 오행 프로필 */
  var ELEMENT_PROFILE = {
    '목': {
      key: '성장·기획·관계의 확장',
      over: '목 과다 — 계획은 많은데 실행이 분산된다. 시작이 잦고 마무리가 적다.',
      lack: '목 부족 — 새로 시작하는 힘과 사람을 키우는 인내가 약하다. 계획을 세워도 첫 단추에서 멈춘다.',
      adv: '새 프로젝트를 벌이기보다 하나를 끝내는 데 집중'
    },
    '화': {
      key: '표현·열정·존재감',
      over: '화 과다 — 감정이 빨리 뜨겁고 빨리 타 버린다. 말이 앞서고 뒷수습이 남는다.',
      lack: '화 부족 — 티를 못 내고 감정을 숨긴다. 잘해도 인정을 못 받고, 관계가 무미건조해진다.',
      adv: '감정과 성과를 말로 드러내는 연습'
    },
    '토': {
      key: '안정·중재·축적',
      over: '토 과다 — 안정에 집착해 변화를 미루고, 걱정이 많아 결정이 느려진다.',
      lack: '토 부족 — 중심이 흔들린다. 중간에서 조율하는 역할을 못 견디고, 약속이 자주 바뀐다.',
      adv: '생활 리듬과 루틴을 고정하는 것'
    },
    '금': {
      key: '결단·정리·기준',
      over: '금 과다 — 자르는 힘이 지나쳐 관계가 끊기고, 완벽 기준에 자신도 못 미쳐 괴롭다.',
      lack: '금 부족 — 결론을 못 내고 미룬다. 정리정돈과 마감이 약해 일이 쌓인다.',
      adv: '결정 기한을 정하고 그날 끝내는 습관'
    },
    '수': {
      key: '지혜·유연·흡수',
      over: '수 과다 — 생각과 걱정이 많아 행동이 늦고, 방향 없이 흘러다닌다.',
      lack: '수 부족 — 유연성이 떨어져 한 가지 방식만 고집한다. 쉬는 법을 몰라 소진된다.',
      adv: '정보를 모으되 결정은 기한 안에'
    }
  };

  /* ============================================================ 격국 프로필 */
  var STRUCTURE_PROFILE = {
    '비견격': { read: '나와 같은 기운이 월령에 앉은 구조. 자기 힘으로 서는 사주다.', career: '개인사업·전문직·프리랜서처럼 자기 이름이 걸리는 일', risk: '동업과 공동소유에서 갈등이 생긴다' },
    '겁재격': { read: '경쟁과 승부가 월령에 앉은 구조. 판을 벌이는 힘은 세다.', career: '영업·투자·경쟁이 있는 시장', risk: '사람과 돈을 동시에 잃는 패턴(보증·동업·투자)' },
    '식신격': { read: '내가 생하는 기운이 월령에 앉은 구조. 꾸준히 만들어 내는 힘이 있다.', career: '생산·콘텐츠·교육·요리·의료', risk: '편안함에 안주해 성장이 멈춘다' },
    '상관격': { read: '재주와 비판이 월령에 앉은 구조. 기존 질서에 물음표를 던진다.', career: '기획·창작·마케팅·강의·비평', risk: '말과 태도로 윗사람과 충돌' },
    '편재격': { read: '유동하는 재물이 월령에 앉은 구조. 큰돈을 다루는 감각이 있다.', career: '사업·영업·유통·투자', risk: '들어온 만큼 나가고, 관계 문제가 돈 문제로 번진다' },
    '정재격': { read: '성실한 재물이 월령에 앉은 구조. 관리와 축적에 강하다.', career: '금융·회계·관리·자산운용', risk: '계산이 지나쳐 기회를 놓친다' },
    '편관격': { read: '압박과 권력이 월령에 앉은 구조. 강한 환경에서 단련된다.', career: '법·의료·군경·위기관리·구조조정', risk: '압박을 견디다 몸과 관계를 잃는다' },
    '정관격': { read: '규칙과 직책이 월령에 앉은 구조. 조직 안에서 인정받는 길이 열려 있다.', career: '공직·대기업·관리직·행정', risk: '체면에 눌려 자기 목소리를 잃는다' },
    '편인격': { read: '비정형의 배움이 월령에 앉은 구조. 남이 안 보는 것을 본다.', career: '연구·전문기술·데이터·철학', risk: '생각만 하다 실행이 늦다' },
    '정인격': { read: '배움과 보호가 월령에 앉은 구조. 신뢰와 자격으로 서는 사주다.', career: '교육·자격직·연구·문서', risk: '보호받으려는 마음이 결정을 미룬다' },
    '양인격': { read: '칼날이 월령에 앉은 구조. 추진력은 최상급이다.', career: '전문직·영업·스포츠·의료', risk: '힘을 쓸 방향을 못 잡으면 자기 몸을 벤다' },
    '건록격': { read: '제 힘으로 서는 뿌리가 월령에 앉은 구조. 자수성가형이다.', career: '자기 이름의 사업·전문직', risk: '남 밑에서 인정받으려다 인정을 못 받는다' }
  };

  /* ============================================================ 헬퍼 */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function pct(n) { return Math.round(n); }
  function tone(chart) { return chart.input.roast || 10; }
  function roastPick(chart, objOrLow, mid, high) {
    var r = tone(chart);
    if (typeof objOrLow === 'object') { mid = objOrLow.mid; high = objOrLow.high; objOrLow = objOrLow.low; }
    return r <= 3 ? objOrLow : r <= 6 ? mid : high;
  }
  function roastLabel(chart) {
    var r = tone(chart);
    return r <= 3 ? '조언' : r <= 6 ? '지적' : r <= 8 ? 'ROAST' : 'HARD ROAST';
  }
  var POS_KR = { year: '년주', month: '월주', day: '일주', hour: '시주' };
  var POS_KR2 = { year: '년지', month: '월지', day: '일지', hour: '시지' };
  var TG_CLS_COLOR = { '비겁': 'bigeop', '식상': 'siksang', '재성': 'jaeseong', '관성': 'gwanseong', '인성': 'inseong' };

  function ins(chart, basis, behavior, roast) {
    return '<div class="insight">' +
      '<div class="ins-line"><span class="tag t-basis">근거</span><span>' + basis + '</span></div>' +
      '<div class="ins-line"><span class="tag t-act">예상 행동</span><span>' + behavior + '</span></div>' +
      '<div class="ins-line roastline"><span class="tag t-roast">' + roastLabel(chart) + '</span><span>' + roast + '</span></div>' +
      '</div>';
  }

  function relUnique(list) {
    var seen = {}, out = [];
    list.forEach(function (r) {
      var k = r.type + r.pair;
      if (!seen[k]) { seen[k] = 1; out.push(r); }
    });
    return out;
  }

  function pillarsText(chart) {
    var p = chart.pillars;
    return '년주 ' + p.year.gz + ' · 월주 ' + p.month.gz + ' · 일주 ' + p.day.gz + (p.hour ? ' · 시주 ' + p.hour.gz : '');
  }

  function tgOf(chart, pos) {
    var p = chart.pillars[pos];
    return p ? p.tenGodGan : null;
  }

  /* 오행별 강약 순위 */
  function elRank(chart) {
    return Object.keys(chart.strength.score).map(function (e) {
      return { el: e, v: chart.strength.score[e] };
    }).sort(function (a, b) { return b.v - a.v; });
  }

  function missingEls(chart) {
    var rank = elRank(chart);
    return rank.filter(function (r) { return r.v < chart.strength.total * 0.06; }).map(function (r) { return r.el; });
  }

  /* 십성 클래스별 세력 */
  function clsPower(chart) {
    var dayEl = chart.dayMaster.el;
    var out = {};
    ['비겁', '식상', '재성', '관성', '인성'].forEach(function (c) { out[c] = 0; });
    Object.keys(chart.strength.score).forEach(function (e) {
      var c;
      if (e === dayEl) c = '비겁';
      else if (e === E.SAENG[dayEl]) c = '식상';
      else if (e === E.GEUK[dayEl]) c = '재성';
      else if (E.GEUK[e] === dayEl) c = '관성';
      else c = '인성';
      out[c] += chart.strength.score[e];
    });
    return out;
  }

  var _pclsCache = null, _pclsChart = null;
  function pcls(chart) {
    if (_pclsChart !== chart) { _pclsChart = chart; _pclsCache = clsPower(chart); }
    return _pclsCache;
  }

  /* ============================================================ ① 원국 */
  function sectionWonkuk(chart) {
    var p = chart.pillars, sp = STEM_PROFILE[p.day.gan];
    var st = chart.strength;
    var html = '';

    /* 만세력 표 */
    html += '<div class="wonkuk-wrap"><table class="wonkuk">';
    html += '<thead><tr><th></th><th>년주</th><th>월주</th><th>일주</th>' + (p.hour ? '<th>시주</th>' : '') + '</tr></thead><tbody>';
    var order = p.hour ? ['year', 'month', 'day', 'hour'] : ['year', 'month', 'day'];

    html += '<tr class="row-tg"><th>십성</th>';
    order.forEach(function (k) {
      var t = k === 'day' ? '일간' : p[k].tenGodGan;
      html += '<td><span class="tg ' + (t === '일간' ? 'ilgan' : TG_CLS_COLOR[E.tenGodClass(t)]) + '">' + t + '</span></td>';
    });
    html += '</tr>';

    html += '<tr class="row-gz"><th>천간</th>';
    order.forEach(function (k) {
      html += '<td><span class="hanja">' + p[k].gan + '</span><span class="hangul">' + p[k].ganKr + '</span></td>';
    });
    html += '</tr>';

    html += '<tr class="row-gz"><th>지지</th>';
    order.forEach(function (k) {
      html += '<td><span class="hanja">' + p[k].zhi + '</span><span class="hangul">' + p[k].zhiKr + '</span></td>';
    });
    html += '</tr>';

    html += '<tr class="row-tg"><th>지지 십성</th>';
    order.forEach(function (k) {
      html += '<td><span class="tg ' + TG_CLS_COLOR[E.tenGodClass(p[k].tenGodZhi)] + '">' + p[k].tenGodZhi + '</span></td>';
    });
    html += '</tr>';

    html += '<tr class="row-hidden"><th>지장간</th>';
    order.forEach(function (k) {
      html += '<td>' + p[k].hidden.map(function (h) {
        return '<span class="hid">' + h.stem + '<i>' + h.tenGod + '</i></span>';
      }).join('') + '</td>';
    });
    html += '</tr>';

    html += '<tr class="row-stage"><th>12운성</th>';
    order.forEach(function (k) { html += '<td>' + p[k].stage + '</td>'; });
    html += '</tr>';
    html += '</tbody></table></div>';

    /* 계산 근거 */
    html += '<div class="calcbox">';
    html += '<div class="calc-title">만세력 계산 근거</div>';
    html += '<ul>';
    html += '<li>양력 <b>' + chart.solar.y + '-' + p2(chart.solar.m) + '-' + p2(chart.solar.d) + '</b> ' +
      (chart.timeKnown ? p2(chart.clock.h) + ':' + p2(chart.clock.mi) : '시간 미상') +
      ' → 음력 ' + chart.lunar.year + '년 ' + (chart.lunar.leap ? '윤' : '') + chart.lunar.month + '월 ' + chart.lunar.day + '일</li>';
    html += '<li>표준시 ' + chart.std.label + (chart.dst.applied ? ' + 서머타임 1시간' : '') + '</li>';
    html += '<li>사주 계산 시각(진태양시) <b>' + chart.sajuTime.y + '-' + p2(chart.sajuTime.m) + '-' + p2(chart.sajuTime.d) + ' ' +
      p2(chart.sajuTime.h) + ':' + p2(chart.sajuTime.mi) + '</b>' +
      (chart.correction.useTrueSolar ? ' (경도 보정 ' + (chart.correction.lonMin > 0 ? '+' : '') + Math.round(chart.correction.lonMin) + '분' + (chart.correction.useEoT ? ', 균시차 ' + Math.round(chart.correction.eot) + '분' : '') + ')' : ' (보정 없음)') + '</li>';
    html += '<li>월주 기준 절입: ' + chart.prevJie.kr + ' ' + E.fmtKst(chart.prevJie.ms) + ' (KST) 이후</li>';
    html += '<li>자시 학파: ' + (chart.jaSiRule === 'ya' ? '야자시(23:00 일주 변경)' : '조자시(00:00 일주 변경)') + '</li>';
    html += '</ul></div>';

    if (chart.warnings.length) {
      html += '<div class="warnbox"><div class="calc-title">계산 불확실성 안내</div><ul>' +
        chart.warnings.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul></div>';
    }

    /* 일간 본질 */
    html += '<h3>일간의 본질 — ' + p.day.gan + ' ' + sp.image + '</h3>';
    html += '<p class="lead">' + sp.essence + '</p>';
    html += '<div class="duo">' +
      '<div class="duo-card"><div class="duo-h">겉으로 보이는 모습</div><p>' + sp.outside + '</p></div>' +
      '<div class="duo-card"><div class="duo-h">속에 있는 것</div><p>' + sp.inside + '</p></div>' +
      '</div>';

    /* 신강약 */
    html += '<h3>신강·신약 — ' + st.level + ' (' + pct(st.ratio * 100) + '%)</h3>';
    html += '<div class="strengthbar"><div class="sb-fill" style="width:' + pct(st.ratio * 100) + '%"></div><span class="sb-label">' + st.level + '</span></div>';
    html += '<div class="badges">' +
      '<span class="badge ' + (st.deukryeong ? 'on' : 'off') + '">득령 ' + (st.deukryeong ? 'O' : 'X') + '</span>' +
      '<span class="badge ' + (st.deukji ? 'on' : 'off') + '">득지 ' + (st.deukji ? 'O' : 'X') + '</span>' +
      '<span class="badge ' + (st.deukse ? 'on' : 'off') + '">득세 ' + (st.deukse ? 'O' : 'X') + '</span>' +
      '</div>';
    html += '<p class="body">' + strengthNarrative(chart) + '</p>';

    /* 격국 */
    var stp = STRUCTURE_PROFILE[chart.structure.name] || { read: '', career: '', risk: '' };
    html += '<h3>격국 — ' + chart.structure.name + '</h3>';
    html += '<p class="body"><b>성립 근거:</b> ' + chart.structure.basis + '. ' + chart.structure.quality + '.</p>';
    if (stp.read) html += '<p class="body">' + stp.read + '</p>';
    if (chart.structure.notes.length) {
      html += '<ul class="bullet warn">' + chart.structure.notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>';
    }
    if (stp.career) html += '<p class="body small">이 격이 힘을 쓰기 좋은 자리: ' + stp.career + '</p>';

    /* 오행 분포 */
    html += '<h3>오행 분포</h3><div class="elbars">';
    chart.elPct.forEach(function (e) {
      html += '<div class="elbar"><span class="elname el-' + e.el + '">' + e.el + '</span>' +
        '<div class="elbar-track"><div class="elbar-fill elbg-' + e.el + '" style="width:' + Math.max(2, pct(e.v)) + '%"></div></div>' +
        '<span class="elpct">' + pct(e.v) + '%</span></div>';
    });
    html += '</div>';
    var rank = elRank(chart);
    var strongest = rank[0], weakest = rank[rank.length - 1];
    html += '<p class="body">가장 강한 기운은 <b>' + strongest.el + '</b>(' + pct(strongest.v / st.total * 100) + '%), 가장 약한 기운은 <b>' + weakest.el + '</b>(' + pct(weakest.v / st.total * 100) + '%)입니다. ' +
      ELEMENT_PROFILE[strongest.el].over + ' ' + ELEMENT_PROFILE[weakest.el].lack + '</p>';

    /* 용신 */
    var y = chart.yongsin;
    html += '<h3>용신·희신·기신</h3><div class="yongsin-cards">' +
      '<div class="ys-card ys-yong"><span>용신</span><b>' + y.yongsin + '</b></div>' +
      '<div class="ys-card ys-hui"><span>희신</span><b>' + y.huisin + '</b></div>' +
      '<div class="ys-card ys-gi"><span>기신</span><b>' + y.gisin + '</b></div></div>';
    html += '<p class="body"><b>' + y.method + '</b><br>' + y.reason + '</p>';
    if (y.johu) {
      html += '<p class="body small">조후로 보면 ' + y.johu.note + (y.johu.need ? ' (조후용신 ' + y.johu.el + ')' : '') + '.</p>';
    }
    if (y.conflict) {
      html += '<p class="body small warn-text">억부용신(' + y.yongsin + ')과 조후용신(' + y.johu.el + ')이 충돌합니다. 학파에 따라 답이 갈리는 지점입니다.</p>';
    }

    /* 유리/불리 */
    html += '<h3>이 사주의 유리한 조건과 불리한 조건</h3>' + conditions(chart);
    return html;
  }

  function p2(n) { return (n < 10 ? '0' : '') + n; }

  function strengthNarrative(chart) {
    var st = chart.strength, dm = chart.dayMaster;
    var s = '일간 ' + dm.stem + '(' + dm.el + ') 기준으로 나를 돕는 세력을 천간·지지·지장간까지 가중해 계산하면 ' + pct(st.ratio * 100) + '%입니다. ';
    if (st.level === '극신강') s += '이건 거의 "내 힘으로 다 해결하려는" 구조입니다. 주변의 도움을 받아들이는 통로가 좁습니다.';
    else if (st.level === '신강') s += '자기 힘이 남보다 우세한 구조로, 밀어붙이면 대개 원하는 데까지 갑니다. 문제는 멈추는 법입니다.';
    else if (st.level === '중화') s += '어느 쪽으로도 치우치지 않은 균형 구조입니다. 대신 스스로 방향을 정하지 않으면 주변에 끌려갑니다.';
    else if (st.level === '신약') s += '나를 누르고 빼앗는 기운이 더 강한 구조입니다. 혼자 밀어붙이기보다 환경과 사람을 고르는 게 중요합니다.';
    else s += '나를 소모시키는 기운이 압도적인 구조입니다. 무리한 승부보다 회복과 지원이 먼저입니다.';
    s += ' 득령 ' + (st.deukryeong ? 'O' : 'X') + ' / 득지 ' + (st.deukji ? 'O' : 'X') + ' / 득세 ' + (st.deukse ? 'O' : 'X') + '.';
    return s;
  }

  function conditions(chart) {
    var good = [], bad = [];
    var st = chart.strength, y = chart.yongsin;
    var rank = elRank(chart);

    if (st.deukryeong) good.push('월령의 뿌리가 있어 시즌을 타지 않고 기본 체력이 유지된다');
    else bad.push('월령의 뿌리가 약해, 환경이 바뀌면 컨디션과 판단이 같이 흔들린다');

    if (st.ratio >= 0.52) good.push('자기 결정으로 밀어붙이는 힘이 있다 — 단독 프로젝트에서 강하다');
    else bad.push('혼자 밀어붙이는 힘이 약하다 — 이해관계자 설득 없이 진행하면 중간에 꺾인다');

    if (st.score[y.yongsin] > st.total * 0.18) good.push('용신 ' + y.yongsin + '이 원국에 실질적으로 존재해, 그 방향으로 움직일 때 성과가 난다');
    else bad.push('용신 ' + y.yongsin + '의 힘이 원국에 약해, 의식적으로 보충하지 않으면 성과가 더디다');

    if (missingEls(chart).length) bad.push('원국에 ' + missingEls(chart).join('·') + ' 기운이 거의 없다 — 그 영역의 감각은 후천적으로 배워야 한다');
    if (chart.relations.filter(function (r) { return r.kind === '충'; }).length) bad.push('충이 ' + chart.relations.filter(function (r) { return r.kind === '충'; }).length + '개 있어 인생의 전환점마다 자리가 한 번씩 바뀐다');
    if (chart.relations.filter(function (r) { return r.kind === '합'; }).length) good.push('합이 있어 사람과 자리가 묶여주는 복이 있다 — 인연이 끊겨도 다시 이어진다');
    if (rank[0].v > st.total * 0.30) bad.push(rank[0].el + ' 기운이 ' + pct(rank[0].v / st.total * 100) + '%로 과다해, 판단이 그쪽으로 쏠린다');

    return '<div class="cond-cols">' +
      '<div class="cond good"><div class="cond-h">유리</div><ul>' + good.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul></div>' +
      '<div class="cond bad"><div class="cond-h">불리</div><ul>' + bad.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul></div>' +
      '</div>';
  }

  /* ============================================================ ② 성격 */
  function sectionPersonality(chart) {
    var p = chart.pillars, sp = STEM_PROFILE[p.day.gan];
    var st = chart.strength, y = chart.yongsin;
    var counts = chart.counts.detail, cls = pcls(chart);
    var out = '';

    /* 1. 겉과 속 */
    var monthTg = p.month.tenGodGan, dayTg = p.day.tenGodZhi;
    var visible = monthTg, inner = dayTg;
    out += ins(chart,
      '월간(겉으로 드러난 자리)에 <b>' + visible + '</b>, 일지(속·배우자궁)에 <b>' + inner + '</b>이 앉았습니다. 사람들은 ' + visible + '의 인상으로 당신을 판단하지만, 실제 판단은 ' + inner + '의 방식으로 합니다.',
      SP_TG_BEHAVIOR[visible] + ' ' + SP_TG_BEHAVIOR[inner],
      roastPick(chart, sp.roast.low, sp.roast.mid, sp.roast.high));

    /* 2. 자존심과 인정욕 */
    var bigyeop = cls['비겁'], inseong = cls['인성'], gwan = cls['관성'];
    out += ins(chart,
      '비겁 세력 ' + pct(bigyeop / st.total * 100) + '%, 인성 ' + pct(inseong / st.total * 100) + '%, 관성 ' + pct(gwan / st.total * 100) + '%의 배치입니다. ' +
      (bigyeop > st.total * 0.25 ? '비겁이 강해 자기 기준이 분명하고, 남이 자기 영역에 들어오는 것을 싫어합니다.' : '비겁이 강하지 않아 남의 평가에 흔들리는 편입니다.') +
      (inseong > st.total * 0.28 ? ' 인성이 두터워 인정받고 싶은 욕구가 학습·준비의 형태로 나타납니다.' : ''),
      bigyeop > st.total * 0.25
        ? '인정 욕구는 큰데 인정하는 방식은 자기 기준입니다. 남이 다르게 인정해 주면 그걸 인정으로 안 칩니다.'
        : '인정받고 싶은데 먼저 나서지 못해, 남이 알아주길 기다리다 타이밍을 놓칩니다.',
      roastPick(chart,
        '자존심이 세서 손해 보는 일이 있을 수 있어요. 도움을 청하는 건 자존심이 아니라 실력이에요.',
        '인정은 받고 싶고 지적은 받기 싫다면, 그건 자존심이 아니라 성장에 붙은 브레이크다.',
        '인정욕은 큰데 수정은 거부한다. 그 조합이면 당신은 늘 "나를 알아주는 사람이 없다"고 말하면서, 알아줄 사람을 계속 지운다.'));

    /* 3. 스트레스 반응 */
    var chungN = chart.relations.filter(function (r) { return r.kind === '충'; }).length;
    var hyungN = chart.relations.filter(function (r) { return r.kind === '형'; }).length;
    out += ins(chart,
      (chungN ? '원국에 충이 ' + chungN + '개' : '충은 없고') + (hyungN ? ', 형이 ' + hyungN + '개' : '') + ' 있습니다. 일간 ' + p.day.gan + '(' + sp.image + ') 기질과 겹쳐 보면 스트레스 반응이 이렇게 나옵니다. ' + sp.stress,
      chungN >= 2 ? '문제가 생기면 환경을 바꾸는 쪽으로 먼저 움직입니다(이직·이사·관계 정리). 그게 해결처럼 느껴지지만 같은 패턴이 다시 옵니다.'
        : '문제를 안고도 자리를 지키려 합니다. 그만큼 안에서 삭이는 시간이 깁니다.',
      roastPick(chart,
        '스트레스가 오면 잠깐 멈추고 몸을 먼저 정리해 보세요. 그게 판단을 살립니다.',
        '당신은 스트레스의 원인을 상대에게서 찾는 데 익숙하다. 정작 바꿔야 할 건 당신의 반응 순서다.',
        '스트레스가 오면 당신은 "상황이 나를 이렇게 만들었다"고 정리한다. 그 문장이 편해서, 당신은 평생 같은 상황을 다시 만든다.'));

    /* 4. 자기모순 */
    var overCls = null, overVal = 0;
    Object.keys(cls).forEach(function (c) { if (cls[c] > overVal) { overVal = cls[c]; overCls = c; } });
    var overTg = dominantTenGod(counts);
    out += ins(chart,
      '가장 두터운 것은 <b>' + overCls + '</b> 계열입니다. 그중 <b>' + overTg + '</b>이 ' + counts[overTg] + '개로 가장 많습니다. ' + TEN_GOD_PROFILE[overTg].over,
      '이 기운이 과하면 ' + overCls + '의 장점이 그대로 과잉이 됩니다. ' + clsOverBehavior(overCls),
      roastPick(chart,
        '강한 기운은 무기지만, 같은 무기를 모든 상황에 쓰면 약점이 돼요.',
        '당신의 문제는 능력이 아니라 "늘 같은 방식으로 푼다"는 점이다.',
        '당신은 자기 강점을 반복해서 쓰다가 그게 안 통하는 상황에서 무너진다. 그리고 그 상황을 "운이 없었다"고 부른다.'));

    /* 5. 약점 — 가장 약한 오행 */
    var weak = elRank(chart)[4];
    out += ins(chart,
      '<b>' + weak.el + '</b> 기운이 ' + pct(weak.v / st.total * 100) + '%로 가장 약합니다. ' + ELEMENT_PROFILE[weak.el].lack,
      '이 영역은 노력해도 감이 안 잡혀서, 대개 남에게 맡기거나 회피합니다. 그런데 인생의 결정적 순간에 정확히 이 영역이 요구됩니다.',
      roastPick(chart,
        '약한 영역은 시스템으로 덮으면 돼요. 습관 하나만 만들어 두세요: ' + ELEMENT_PROFILE[weak.el].adv + '.',
        '당신이 유독 자주 망하는 분야가 있다면 그건 재능 문제가 아니라 ' + weak.el + '을 매번 무시했기 때문이다.',
        '당신은 ' + weak.el + ' 기운이 약한 걸 알면서도 "그건 내 스타일이 아니다"로 넘긴다. 그 스타일 때문에 지금까지 몇 번을 다시 시작했는지 세어 봤나.'));

    /* 6. 대인 피로 */
    out += ins(chart,
      chart.sinsal.list.length
        ? '신살로는 ' + chart.sinsal.list.map(function (s) { return s.name; }).join('·') + '이 있습니다. ' + (chart.sinsal.list[0].desc || '')
        : '두드러진 신살은 없고, 오행·십성 배치만으로 관계의 피로가 결정됩니다.',
      relationFatigue(chart),
      roastPick(chart,
        '관계에서 피곤함을 느끼면 그 자리를 정리하기 전에, 내가 어떤 역할을 자처했는지 먼저 보세요.',
        '당신이 피곤한 관계에는 공통점이 있다. 당신이 늘 "내가 안 하면 안 된다"고 먼저 나선다는 것.',
        '당신은 상대를 피곤하게 만드는 걸 모른 채, 정작 자기가 피곤하다고 말한다. 둘 다 사실인데, 원인은 같은 곳에 있다.'));

    /* 7. 장점이 단점으로 */
    var stage = p.day.stage;
    out += ins(chart,
      '일지 12운성이 <b>' + stage + '</b>입니다. ' + stageMeaning(stage),
      stageOveruse(stage),
      roastPick(chart,
        '강점을 쓰는 건 좋지만, 쓰지 말아야 할 자리도 있어요.',
        '당신의 강점은 대개 "남이 못 견디는 자리"에서 나온다. 그 대가를 본인이 치르고 있다는 걸 알아야 한다.',
        '당신은 버티는 걸 강함이라고 부른다. 그래서 아무도 당신에게 "쉬어도 된다"고 말하지 못하고, 당신은 아무도 못 믿는다.'));

    return out;
  }

  var SP_TG_BEHAVIOR = {
    '비견': '내 기준을 먼저 세우고, 그 기준에 맞는 사람만 들인다.',
    '겁재': '경쟁 구도를 만들고, 이기고 나서야 안심한다.',
    '식신': '편안하게 풀어내고, 사람을 편하게 만든다.',
    '상관': '재치와 비판으로 분위기를 장악한다.',
    '편재': '가능성과 판을 먼저 보고, 크게 잡는다.',
    '정재': '실속과 손익을 먼저 계산한다.',
    '편관': '압박을 견디며 밀어붙인다.',
    '정관': '규칙과 체면을 지키며 신뢰를 쌓는다.',
    '편인': '혼자 파고들고, 남이 안 보는 각도에서 본다.',
    '정인': '배운 것과 검증된 것을 믿고 움직인다.',
    '일간': '자기 판단을 마지막 기준으로 삼는다.'
  };

  function dominantTenGod(counts) {
    var best = '비견', v = -1;
    Object.keys(counts).forEach(function (k) { if (counts[k] > v) { v = counts[k]; best = k; } });
    return best;
  }

  function clsOverBehavior(c) {
    var map = {
      '비겁': '자기 몫을 지키려는 힘이 커져, 협업에서 "내가 더 했다"는 계산이 먼저 든다.',
      '식상': '표현이 넘쳐 말이 먼저 나가고, 해야 할 일보다 하고 싶은 일이 앞선다.',
      '재성': '현실 계산이 앞서 관계를 손익으로 보고, 돈 걱정이 판단을 늦춘다.',
      '관성': '압박에 익숙해져 스스로를 몰아붙이고, 남에게도 같은 기준을 들이댄다.',
      '인성': '생각과 준비가 길어져 시작이 늦고, 결정을 남에게 미룬다.'
    };
    return map[c] || '';
  }

  function relationFatigue(chart) {
    var cls = pcls(chart), st = chart.strength;
    if (cls['비겁'] > st.total * 0.30) return '비겁이 강해 사람을 "내 편/남의 편"으로 나누는 경향이 있습니다. 그래서 대인관계가 편 가르기로 피곤해집니다.';
    if (cls['관성'] > st.total * 0.28) return '관성이 강해 남의 기대에 맞추느라 정작 자기 감정을 뒤로 미룹니다. 이게 쌓이면 어느 순간 관계를 통째로 끊습니다.';
    if (cls['식상'] > st.total * 0.30) return '식상이 강해 말이 앞서고, 상대의 속도보다 빠르게 판단합니다. 그래서 "말이 세다"는 평가가 따라붙습니다.';
    if (cls['인성'] > st.total * 0.30) return '인성이 강해 남의 평가를 오래 곱씹습니다. 그래서 관계를 정리하기 전에 혼자 오래 앓습니다.';
    return '재성이 강해 관계를 손익으로 계산하는 습관이 있습니다. 손해 보는 관계를 오래 유지하지 못합니다.';
  }

  function stageMeaning(stage) {
    var map = {
      '장생': '사람을 끌어들이는 생기. 처음 만나는 자리에서 호감을 산다.',
      '목욕': '감성과 매력이 앞서고, 감정의 기복이 관계를 흔든다.',
      '관대': '성장 욕구가 강하고 남의 평가에 민감하다.',
      '건록': '제 힘으로 서는 자리. 남에게 기대는 법을 모른다.',
      '제왕': '기세가 최고조. 밀어붙이는 힘은 세지만 꺾이는 순간이 크다.',
      '쇠': '경험은 많은데 추진력이 줄어든 자세. 안정과 보수로 간다.',
      '병': '예민하고 신경이 날카롭다. 몸과 감정을 같이 관리해야 한다.',
      '사': '직관과 감수성이 깊다. 사람과 상황의 이면을 먼저 본다.',
      '묘': '공간과 취향, 축적된 것에 끌린다. 혼자만의 세계가 필요하다.',
      '절': '고립과 단절. 스스로 관계를 끊는 습관이 생긴다.',
      '태': '가능성과 잉태. 아직 드러나지 않은 것에 집착한다.',
      '양': '보호받는 자리. 안정은 있으나 결단이 늦다.'
    };
    return map[stage] || '';
  }

  function stageOveruse(stage) {
    var map = {
      '장생': '다만 처음의 호감만으로 관계를 유지하려 하면, 깊어지는 자리에서 도망친다.',
      '목욕': '기분이 좋을 때만 관계를 유지하려 하면, 힘든 구간에서 빨리 식는다.',
      '관대': '성장하지 않는 자리를 못 견뎌서, 안정된 권태를 재능 부족으로 오해한다.',
      '건록': '도움을 청하지 못해, 혼자 감당하다가 한 번에 무너진다.',
      '제왕': '기세에 기대어 판단하고, 꺾이면 이전의 자신을 인정하지 못한다.',
      '쇠': '변화를 두려워해 이미 지난 판에 계속 머문다.',
      '병': '힘들다는 말을 늦게 해서, 주변이 이미 늦게 알아차린다.',
      '사': '사람의 이면을 먼저 봐서, 신뢰하기까지 오래 걸린다.',
      '묘': '혼자만의 세계로 도피해, 해야 할 대화를 계속 미룬다.',
      '절': '관계를 정리하는 방식이 칼 같아서, 남은 사람이 없다.',
      '태': '아직 안 된 것에 집착해, 현실의 성과를 가볍게 본다.',
      '양': '보호받는 위치에 익숙해져, 결정의 책임을 남에게 넘긴다.'
    };
    return map[stage] || '';
  }

  /* ============================================================ ③ 연애 */
  function sectionLove(chart) {
    var p = chart.pillars, sp = STEM_PROFILE[p.day.gan];
    var isMale = chart.input.gender !== 'F';
    var spouseStar = isMale ? '재성' : '관성';
    var cls = pcls(chart), st = chart.strength;
    var dayRel = relUnique(chart.relations.filter(function (r) { return r.pos.indexOf('day') >= 0; }));
    var out = '';

    /* 1. 배우자궁 */
    var relTxt = dayRel.length
      ? dayRel.map(function (r) { return r.type + '(' + r.pair + ')'; }).join(', ') + ' — ' + dayRel.map(function (r) { return r.note; }).join(' ')
      : '일지 ' + p.day.zhi + '에 직접적인 충·형·합이 없습니다. 배우자궁이 비교적 안정적입니다.';
    out += ins(chart,
      '일지(배우자궁)가 <b>' + p.day.zhi + '(' + p.day.tenGodZhi + ')</b>입니다. ' + relTxt,
      dayRel.some(function (r) { return r.kind === '충'; })
        ? '가까운 관계에서 반복되는 긴장이 있습니다. 사귀는 동안에도 "이 사람과 오래 갈까"를 자주 계산합니다.'
        : '관계가 안정적으로 유지되는 대신, 권태가 와도 그냥 두는 편입니다.',
      roastPick(chart,
        '배우자궁의 긴장은 상대 문제가 아니라 내가 그 자리를 어떻게 쓰는지의 문제예요.',
        '당신은 관계가 불편해지면 상대를 바꾸려 한다. 바꿔야 할 건 대화의 순서다.',
        '당신은 배우자궁의 충을 상대 탓으로 돌린다. 같은 자리에서 같은 싸움을 세 번 했다면, 그건 상대가 아니라 당신의 방식이다.'));

    /* 2. 끌리는 사람 */
    var starPow = cls[spouseStar];
    out += ins(chart,
      (isMale ? '남성 기준으로 배우자성은 재성' : '여성 기준으로 배우자성은 관성') + '입니다. 이 사주의 ' + spouseStar + '은 ' + pct(starPow / st.total * 100) + '%로 ' +
      (starPow > st.total * 0.25 ? '강한 편입니다' : starPow < st.total * 0.10 ? '약한 편입니다' : '보통입니다') + '. ' +
      (starPow > st.total * 0.25 ? '이성이 늘 주변에 있고, 선택지가 많아 오히려 결정을 못 합니다.' : starPow < st.total * 0.10 ? '이성에게 먼저 다가가는 편이 아니어서, 인연이 늦거나 스스로 놓칩니다.' : ''),
      starPow > st.total * 0.25
        ? '끌리는 사람은 눈에 띄고 화려한 쪽입니다. 정작 오래 가는 사람은 조용하고 자기 일이 확실한 쪽인데, 그쪽은 처음에 눈에 안 들어옵니다.'
        : '끌리는 사람은 나를 인정해 주는 사람입니다. 그런데 인정해 주는 사람에게는 금방 의존하게 됩니다.',
      roastPick(chart,
        '끌리는 사람과 맞는 사람은 다를 수 있어요. 두 목록을 따로 적어 보세요.',
        '당신이 끌리는 유형은 대개 당신을 지치게 하는 유형이다. 우연이 아니라 취향이다.',
        '당신은 설렘을 기준으로 사람을 고르고, 지친 다음에 "왜 나는 늘 이런 사람만"이라고 말한다. 그 취향을 만든 게 당신이다.'));

    /* 3. 반복 실수 */
    out += ins(chart,
      '일간 ' + p.day.gan + '(' + sp.image + ')의 관계 방식: ' + sp.love + ' 여기에 ' + spouseStar + '의 힘(' + pct(starPow / st.total * 100) + '%)과 일지 ' + p.day.zhi + '의 작용이 겹칩니다.',
      loveRepeat(chart),
      roastPick(chart,
        '관계에서 같은 지점에서 멈춘다면, 그 지점을 미리 말해 두는 연습이 필요해요.',
        '당신의 연애는 늘 같은 순서로 무너진다. 시작이 빠르고, 확인이 없고, 혼자 결론 내린다.',
        '당신은 상대를 이해하려 하지 않고 평가한다. 평가는 빨리 끝나지만, 관계는 평가로 유지되지 않는다.'));

    /* 4. 집착/회피/통제 */
    var gw = chart.sinsal.list.some(function (s) { return s.name === '귀문관살'; });
    var dh = chart.sinsal.list.some(function (s) { return s.name === '도화'; });
    out += ins(chart,
      '관계 패턴은 일지 ' + p.day.zhi + '와 ' + (dh ? '도화' : '신살 구성') + (gw ? ', 귀문관살' : '') + '에서 드러납니다. ' +
      (chart.sinsal.list.filter(function (s) { return s.name === '귀문관살'; }).length ? '귀문관살은 촉이 좋은 대신 그 촉이 의심으로 증폭되는 자리입니다. ' : '') +
      (dh ? '도화는 호감을 끄는 힘이지만, 그 호감이 확인 욕구로 바뀌면 집착이 됩니다.' : ''),
      gw ? '상대의 말투·표정·답장 속도를 읽고 혼자 시나리오를 만듭니다. 확인하기 전에 이미 결론이 나 있습니다.'
        : '확신이 없으면 거리를 두고, 확신이 생기면 과하게 몰입합니다. 중간이 없습니다.',
      roastPick(chart,
        '확인하고 싶을 때는 추측 대신 질문을 하세요. 그게 관계를 살립니다.',
        '당신은 확인을 요구하면서 상대에게는 아무것도 말하지 않는다. 그건 신뢰가 아니라 감시다.',
        '당신은 상대의 답장 시간을 재면서 "나는 쿨한 사람"이라고 생각한다. 그 계산이 이미 집착이다.'));

    /* 5. 가족·직장 */
    var monthRel = relUnique(chart.relations.filter(function (r) { return r.pos.indexOf('month') >= 0; }));
    out += ins(chart,
      '월지 ' + p.month.zhi + '는 부모·직장·사회적 자리입니다. ' + (monthRel.length ? monthRel.map(function (r) { return r.type; }).join('·') + '이 걸려 있어 그 자리에서 긴장이 생깁니다.' : '여기에 직접적인 충은 없어 비교적 무난합니다.'),
      monthRel.length ? '직장이나 가족 안에서 "내 자리"를 두고 반복적으로 마찰이 생깁니다. 권한과 역할이 흐릿할 때 특히 그렇습니다.'
        : '직장에서는 무난하지만, 그 무난함이 인정으로 이어지지 않아 답답함이 쌓입니다.',
      roastPick(chart,
        '직장에서의 갈등은 역할을 명확히 하는 것만으로 절반이 줄어요.',
        '당신은 직장에서 "왜 저 사람이 저렇게까지"라고 생각하지만, 그 자리에서 당신도 같은 방식으로 군다.',
        '당신은 조직에서 인정받지 못하는 이유를 상사에게서 찾는다. 상사는 당신이 말을 안 해서 모른다.'));

    /* 6. 고칠 습관 */
    out += '<div class="fixbox"><div class="fix-h">관계에서 가장 먼저 고쳐야 할 습관</div><p>' + loveFix(chart) + '</p></div>';
    return out;
  }

  function loveRepeat(chart) {
    var cls = pcls(chart);
    if (cls['비겁'] > chart.strength.total * 0.28) return '내 방식이 맞다고 밀어붙이고, 상대가 다르면 "이 사람은 나를 모른다"로 정리합니다. 이게 반복됩니다.';
    if (cls['식상'] > chart.strength.total * 0.30) return '말로 먼저 표현하고, 말로 상처를 줍니다. 감정이 올라오면 문장이 날카로워집니다.';
    if (cls['관성'] > chart.strength.total * 0.28) return '상대의 기대에 맞추다가, 어느 순간 "나만 참았다"로 계산이 뒤집힙니다.';
    if (cls['인성'] > chart.strength.total * 0.30) return '확신이 없어 확인을 미루고, 확인하지 않은 채 혼자 실망합니다.';
    return '상대를 손익으로 평가하고, 손해라고 판단되면 조용히 정리합니다.';
  }

  function loveFix(chart) {
    var r = tone(chart);
    var base = '감정이 올라온 순간에 결론을 내리지 말고, 24시간 뒤에 말하기. ';
    if (chart.relations.some(function (x) { return x.kind === '충' && x.pos.indexOf('day') >= 0; })) {
      base += '일지에 충이 있으니, 다툰 당일의 결론은 대개 후회로 끝납니다.';
    } else {
      base += '확신이 안 서면 추측하지 말고 한 문장으로 물어보기.';
    }
    if (r >= 8) base += ' 그리고 상대가 당신을 떠난 이유를 상대에게 묻는 대신, 당신이 마지막에 한 말을 떠올려 보세요.';
    return base;
  }

  /* ============================================================ ④ 돈·직업 */
  function sectionWork(chart) {
    var cls = pcls(chart), st = chart.strength, y = chart.yongsin;
    var p = chart.pillars;
    var out = '';

    /* 1. 재성 */
    var jae = cls['재성'], gwan = cls['관성'], sik = cls['식상'], in_ = cls['인성'];
    var weak = st.level.indexOf('신약') >= 0;
    out += ins(chart,
      '재성 ' + pct(jae / st.total * 100) + '% · 관성 ' + pct(gwan / st.total * 100) + '% · 식상 ' + pct(sik / st.total * 100) + '% · 인성 ' + pct(in_ / st.total * 100) + '% 구조입니다. ' +
      (jae > st.total * 0.28 && weak ? '재성이 강한데 일간이 약한 전형적인 재다신약 구조입니다. 돈은 보이는데 그걸 감당할 체력이 먼저 달립니다.' : '') +
      (jae < st.total * 0.08 ? '재성이 거의 없어, 돈을 쫓는 방식보다 실력으로 인정받는 방식을 써야 합니다.' : ''),
      jae > st.total * 0.28 && weak
        ? '일이 들어오면 거절하지 못하고 다 받아서 몸이 먼저 상합니다. 돈은 들어오지만 남는 게 없습니다.'
        : jae < st.total * 0.08 ? '돈 얘기를 꺼내는 걸 세련되지 않다고 느껴서, 정작 자기 몫을 못 챙깁니다.'
          : '돈에 대한 감각은 무난하지만, 큰 결정 앞에서 계산이 오래 걸립니다.',
      roastPick(chart,
        '돈은 버는 능력보다 지키는 구조가 중요해요. 통장을 하나 더 만드는 게 시작이에요.',
        '당신은 돈을 벌 줄은 아는데, 돈이 머무는 구조를 안 만든다. 그래서 늘 열심히 사는데 늘 빠듯하다.',
        '당신은 "돈은 쫓으면 안 온다"는 말을 좋아한다. 그 말로 관리 안 하는 습관을 포장하고 있는 건 아닌지 봐라.'));

    /* 2. 조직 vs 독립 */
    var orgScore = gwan / st.total * 100 + (st.level === '신강' || st.level === '극신강' ? -5 : 5);
    var indepScore = sik / st.total * 100 + (cls['비겁'] / st.total * 100);
    out += ins(chart,
      '관성 ' + pct(gwan / st.total * 100) + '%와 식상 ' + pct(sik / st.total * 100) + '%, 신강약(' + st.level + ')을 겹쳐 보면 ' +
      (orgScore > indepScore ? '조직에서 실력을 인정받는 쪽이 유리합니다.' : '조직보다 자기 판을 만드는 쪽이 유리합니다.'),
      orgScore > indepScore
        ? '직장 안에서 직급과 역할이 분명해질 때 성과가 납니다. 불확실한 조직에서 오래 버티면 소모됩니다.'
        : '직장에서는 답답함을 느끼고, 혼자 결정할 수 있는 일에서 에너지가 살아납니다.',
      roastPick(chart,
        '직장이든 독립이든, 내가 결정권을 갖는 범위를 먼저 확인해 두세요.',
        '당신은 조직생활이 안 맞는다고 말하지만, 실제로는 "내 뜻대로 안 되는 상황"이 안 맞는 것이다.',
        '당신은 독립하면 달라질 거라고 믿는다. 하지만 의사결정 구조만 바꾸고 판단 습관은 그대로 두면, 혼자서도 같은 벽에 부딪힌다.'));

    /* 3. 성과 방해 습관 */
    out += ins(chart,
      '용신은 ' + y.yongsin + ', 기신은 ' + y.gisin + '입니다. 성과가 나는 방향과 막히는 방향이 이 둘로 갈립니다.',
      '기신 ' + y.gisin + ' 기운이 강해지는 상황(' + gisinSituation(y.gisin) + ')에서 일이 자주 꼬입니다.',
      roastPick(chart,
        '기신이 강해지는 상황을 미리 피하는 것만으로 절반은 해결돼요.',
        '당신은 잘 풀릴 때 방심하고, 그 방심이 다음 위기의 씨앗이 된다.',
        '당신의 최대 실패 패턴은 무능이 아니라 "잘될 때 정리하지 않는 것"이다.'));

    /* 3-2. 커리어 실패 패턴 */
    out += '<h3>커리어에서 반복될 실패 패턴</h3>';
    out += ins(chart,
      '월지 ' + p.month.zhi + '(직장·사회적 자리)와 격국 ' + chart.structure.name + ', 그리고 ' + dominantTenGod(chart.counts.detail) + ' 과다 구조가 겹치는 지점입니다.',
      repeatPattern(chart) + ' ' + stubLoss(chart),
      roastPick(chart,
        '같은 실패가 반복된다면 그건 실력이 아니라 순서의 문제예요.',
        '당신은 실패할 때마다 원인을 사람에게서 찾는다. 패턴은 사람이 아니라 당신의 판단 순서에서 나온다.',
        '당신은 세 번째 같은 실패에서도 "이번엔 달랐다"고 말한다. 달라진 건 상대의 이름뿐이다.'));

    /* 4. 현실 전략 */
    var strategies = workStrategies(chart);
    out += '<div class="strategy"><div class="fix-h">성취를 높이는 현실 전략</div><ol>' +
      strategies.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>';

    /* 5. 직업 후보 */
    var jobs = jobCandidates(chart);
    out += '<h3>어울리는 직업의 결</h3><div class="jobchips">' +
      jobs.map(function (j) { return '<span class="chip">' + j + '</span>'; }).join('') + '</div>';
    out += '<p class="body small">격국(' + chart.structure.name + ')과 용신(' + y.yongsin + '), 강한 십성(' + dominantTenGod(chart.counts.detail) + ')을 기준으로 추린 것입니다. 직업명보다 "일하는 방식"이 더 중요합니다.</p>';

    return out;
  }

  function gisinSituation(el) {
    var map = {
      '목': '새 일을 계속 벌이고 마무리가 없을 때',
      '화': '감정과 말이 앞서는 자리',
      '토': '결정을 미루고 안정만 찾을 때',
      '금': '결론을 서둘러 사람을 자를 때',
      '수': '생각만 하고 결정을 못 할 때'
    };
    return map[el] || '그 기운이 과해지는 순간';
  }

  function workStrategies(chart) {
    var y = chart.yongsin, st = chart.strength, cls = pcls(chart);
    var list = [];
    list.push('용신 ' + y.yongsin + '의 성질을 일의 방식으로 옮기기 — ' + ELEMENT_PROFILE[y.yongsin].adv);
    if (st.ratio >= 0.55) list.push('결정은 혼자 하되, 실행 전에 한 사람에게 검토를 받는 절차를 고정하기');
    else list.push('큰 결정은 혼자 내리지 말고, 신뢰하는 한 사람의 검토를 기본값으로 두기');
    if (cls['관성'] > chart.strength.total * 0.25) list.push('직장·거래처와의 역할과 권한을 문서로 남기기 (구두 합의 금지)');
    if (cls['재성'] > chart.strength.total * 0.25) list.push('수입의 일정 비율을 자동이체로 분리해 손대지 못하게 만들기');
    if (cls['식상'] > chart.strength.total * 0.25) list.push('아이디어는 노트에, 결정은 기한을 정해 한 개만 실행하기');
    if (cls['인성'] > chart.strength.total * 0.25) list.push('준비 기간을 미리 정하고, 그 기간이 끝나면 완성도와 무관하게 내보내기');
    if (cls['비겁'] > chart.strength.total * 0.25) list.push('동업·공동명의·보증은 원칙적으로 피하고, 하더라도 지분과 청산 규칙을 먼저 문서화하기');
    list.push('3년 단위로 "지금 하는 일이 용신 방향인지" 점검하는 날을 달력에 고정하기');
    return list.slice(0, 5);
  }

  function jobCandidates(chart) {
    var stp = STRUCTURE_PROFILE[chart.structure.name] || {};
    var base = stp.career ? stp.career.split('·') : [];
    var cls = pcls(chart), total = chart.strength.total;
    var extra = [];
    if (cls['식상'] > total * 0.25) extra.push('기획', '콘텐츠', '강의');
    if (cls['재성'] > total * 0.25) extra.push('영업', '사업', '금융');
    if (cls['관성'] > total * 0.25) extra.push('관리', '공공', '법무');
    if (cls['인성'] > total * 0.25) extra.push('연구', '교육', '자격직');
    if (cls['비겁'] > total * 0.25) extra.push('전문직', '프리랜서');
    var y = chart.yongsin.yongsin;
    var yEl = { '목': '교육·출판·바이오', '화': '미디어·마케팅·에너지', '토': '부동산·유통·중개', '금': '금융·제조·법률', '수': 'IT·물류·무역' };
    if (yEl[y]) extra.push(yEl[y]);
    return uniq(base.concat(extra)).slice(0, 10);
  }
  function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }

  /* ============================================================ ⑤ 대운·세운 */
  function sectionDaewoon(chart) {
    var d = chart.daewoon, cur = chart.currentDaewoon;
    var out = '';

    out += '<div class="dwinfo">' +
      '<div class="dw-item"><span>방향</span><b>' + d.dirLabel + '</b></div>' +
      '<div class="dw-item"><span>기산</span><b>' + (d.startAge.years) + '세 ' + (d.startAge.months ? d.startAge.months + '개월' : '') + '</b></div>' +
      '<div class="dw-item"><span>기준</span><b>' + (d.forward ? '다음 ' : '이전 ') + d.targetName + '까지 ' + d.diffDays.toFixed(2) + '일</b></div>' +
      '</div>';
    out += '<p class="body small">대운은 ' + (d.forward ? '월주에서 다음 간지로 순행' : '월주에서 이전 간지로 역행') + '합니다. 기산은 출생 시각과 가장 가까운 ' + (d.forward ? '다음' : '이전') + ' 절입까지의 거리를 3일=1년으로 환산한 값입니다(1일=4개월).</p>';

    /* 타임라인 */
    out += '<div class="timeline">';
    d.list.forEach(function (x, i) {
      var isCur = cur && !cur.preStart && cur.idx === x.idx;
      var stp = TEN_GOD_PROFILE[x.tenGod] ? TEN_GOD_PROFILE[x.tenGod].one : '';
      out += '<div class="dw-card' + (isCur ? ' now' : '') + '">' +
        '<div class="dw-age">' + x.fromAge + '~' + x.toAge + '세</div>' +
        '<div class="dw-gz"><span class="hanja">' + x.gan + '</span><span class="hanja">' + x.zhi + '</span></div>' +
        '<div class="dw-tg">' + x.tenGod + ' · ' + x.favor + '</div>' +
        (isCur ? '<div class="dw-now">현재</div>' : '') +
        '</div>';
    });
    out += '</div>';

    /* 현재 대운 */
    if (cur && !cur.preStart) {
      var curTg = TEN_GOD_PROFILE[cur.tenGod] || {};
      out += '<h3>현재 대운 — ' + cur.gz + ' (' + cur.fromAge + '~' + cur.toAge + '세)</h3>';
      out += '<p class="body">' + curTg.one + '. 이 10년은 이 기질이 전면에 나오는 구간입니다.</p>';
      out += ins(chart,
        '대운 ' + cur.gz + '의 천간 ' + cur.gan + '은 일간에게 ' + cur.tenGod + ', 지지 ' + cur.zhi + ' 쪽은 ' + (chart.pillars.day ? E.tenGod(chart.pillars.day.gan, E.HIDDEN[cur.zhi][E.HIDDEN[cur.zhi].length - 1][0]) : '') + '입니다. 대운의 오행은 ' + cur.el + ' — ' + cur.favor + '에 해당합니다.',
        cur.favor === '용신' || cur.favor === '희신'
          ? '이 10년은 밀어붙이면 성과가 나는 구간입니다. 다만 잘될 때 확장을 멈추지 않으면 다음 대운에서 정리해야 합니다.'
          : cur.favor === '기신'
            ? '이 10년은 확장보다 정비가 맞는 구간입니다. 무리한 투자·이직·동업은 손실로 돌아오기 쉽습니다.'
            : '이 10년은 특정 방향으로 치우치지 않습니다. 선택에 따라 결과가 갈리므로, 용신 방향을 의식적으로 쓰는 게 중요합니다.',
        roastPick(chart,
          '지금 대운의 성질을 알고 움직이면 같은 노력으로 결과가 달라져요.',
          '지금 잘 안 풀린다면 노력이 부족해서가 아니라, 대운의 방향과 반대로 가고 있어서다.',
          '당신은 대운이 바뀔 때마다 같은 실수를 반복한다. 좋을 때 확장하고, 나쁠 때 버티지 못한다. 순서를 바꿔라.'));
    } else if (cur && cur.preStart) {
      out += '<h3>아직 대운 시작 전</h3><p class="body">첫 대운(' + d.list[0].gz + ')이 ' + d.list[0].fromAge + '세에 시작됩니다. 그 전까지는 월주 ' + chart.pillars.month.gz + '의 기운이 배경으로 작동합니다.</p>';
    }

    /* 올해 세운 */
    var sy = chart.seun.thisYear;
    out += '<h3>' + sy.year + '년 세운 — ' + sy.gz + '</h3>';
    out += '<div class="seun-head"><span class="seun-gz">' + sy.gz + '</span><span class="tg ' + TG_CLS_COLOR[E.tenGodClass(sy.tenGod)] + '">' + sy.tenGod + '</span><span class="favor favor-' + sy.favor + '">' + sy.favor + '</span></div>';
    out += '<p class="body">올해 천간 ' + sy.gan + '은 일간에게 ' + sy.tenGod + '으로 작동하고, 올해의 오행은 ' + sy.el + ' — ' + sy.favor + '입니다.' +
      (sy.rels.length ? ' 지지 ' + sy.zhi + ' 쪽이 ' + sy.rels.join(', ') + '이라 그 자리가 흔들립니다.' : '') + '</p>';
    out += ins(chart,
      '세운 ' + sy.gz + ' — 원국과 ' + (sy.rels.length ? sy.rels.join('·') + '의 관계를 맺습니다' : '직접적인 충·합 없이 지나갑니다') + '. ' + sy.tenGod + '의 성질이 1년간 전면에 나옵니다.',
      sy.tenGod === '편관' || sy.tenGod === '정관' ? '올해는 압박·평가·책임이 커지는 해입니다. 직장·계약·시험처럼 "심사받는 일"이 몰립니다.'
        : sy.tenGod === '편재' || sy.tenGod === '정재' ? '올해는 돈이 실제로 움직이는 해입니다. 수입·지출·투자 결정이 몰리고, 그 결정이 3년을 좌우합니다.'
          : sy.tenGod === '식신' || sy.tenGod === '상관' ? '올해는 말과 결과물이 밖으로 나가는 해입니다. 시작한 것을 세상에 내놓기 좋습니다.'
            : sy.tenGod === '편인' || sy.tenGod === '정인' ? '올해는 배우고 정리하는 해입니다. 새로 벌이기보다 자격·문서·공부로 기반을 다지는 쪽이 남습니다.'
              : '올해는 나와 경쟁자, 동료가 전면에 나오는 해입니다. 사람 문제와 몫의 문제가 반복됩니다.',
      roastPick(chart,
        '올해의 기운을 알면 준비할 수 있어요. 그 기운에 맞는 결정을 미리 정해 두세요.',
        '올해는 그 기운이 강하게 오는 해다. 작년에 미룬 결정을 또 미루면, 내년에 두 배로 온다.',
        '당신은 해가 바뀌면 운이 바뀐다고 믿는다. 세운은 바뀌지만 결정 습관은 그대로다.'));

    /* 향후 흐름 */
    out += '<h3>앞으로 10년 흐름</h3><div class="seun-table"><table><thead><tr><th>연도</th><th>간지</th><th>십성</th><th>관계</th><th>흐름</th></tr></thead><tbody>';
    chart.seun.list.forEach(function (s) {
      if (s.year < chart.now.y) return;
      out += '<tr class="' + (s.year === chart.now.y ? 'thisyear' : '') + '"><td>' + s.year + '</td><td>' + s.gz + '</td><td>' + s.tenGod + '</td><td>' + (s.rels.length ? '충·합' : '-') + '</td><td>' + seunFlow(s) + '</td></tr>';
    });
    out += '</tbody></table></div>';
    out += '<p class="body small">흐름 평가는 세운 오행이 용신·희신·기신 중 어디에 해당하는지로 계산했습니다. 사건을 확정하지 않고, 준비의 방향만 제시합니다.</p>';
    return out;
  }

  function seunFlow(s) {
    if (s.favor === '용신') return '밀어붙이면 성과. 확장에 유리';
    if (s.favor === '희신') return '도움과 기회. 사람을 통해 풀린다';
    if (s.favor === '기신') return '확장보다 정비. 무리한 결정 금지';
    return '선택에 따라 갈림. 기한을 정해 움직여라';
  }

  /* ============================================================ ⑥ 매운 ROAST */
  function painCandidates(chart) {
    var p = chart.pillars, st = chart.strength, cls = pcls(chart);
    var list = [];
    var total = st.total;

    var relMap = {};
    chart.relations.forEach(function (r) {
      if (r.kind !== '충' && r.kind !== '형') return;
      var k = r.pair;
      if (!relMap[k]) relMap[k] = { pair: k, types: [], pos: {}, kind: r.kind, note: r.note };
      if (relMap[k].types.indexOf(r.type) < 0) relMap[k].types.push(r.type);
      r.pos.forEach(function (x) { relMap[k].pos[x] = 1; });
    });
    Object.keys(relMap).forEach(function (k) {
      var m = relMap[k];
      var posArr = ['year', 'month', 'day', 'hour'].filter(function (x) { return m.pos[x]; });
      var inDay = posArr.indexOf('day') >= 0, inMonth = posArr.indexOf('month') >= 0;
      var typeName = m.types.map(function (t) { return t === '지지형' ? '형' : t === '지지충' ? '충' : t; }).join('·');
      list.push({
        title: typeName + ' — ' + m.pair + ' (' + posArr.map(function (x) { return POS_KR[x]; }).join('·') + ')',
        basis: m.pair + '의 ' + typeName + '이 ' + posArr.map(function (x) { return POS_KR2[x]; }).join('·') + '에 걸려 있습니다. ' + m.note,
        behavior: inDay ? '가장 가까운 관계에서 같은 갈등이 반복됩니다. 사귀는 사이라면 "또 이 지점"이 나옵니다.'
          : inMonth ? '직장·가족 안에서 역할 갈등이 생깁니다. 권한이 겹치면 반드시 부딪힙니다.'
            : '환경이 바뀌는 시점마다 자리가 흔들립니다. 이직·이사·관계 정리가 주기적으로 옵니다.',
        roast: roastPick(chart, '충·형은 나쁜 게 아니라, 바뀌는 지점을 알려주는 신호예요.',
          '충·형이 있는 자리는 당신이 유독 예민하게 반응하는 자리다. 그 예민함이 문제를 미리 만든다.',
          '당신은 같은 자리에서 같은 방식으로 부딪히고, 매번 "상대가 이상하다"고 결론 낸다. 충은 상대가 아니라 당신의 반응에 걸려 있다.'),
        score: 60 + (inDay ? 15 : 0) + (inMonth ? 10 : 0) + (m.kind === '충' ? 5 : 0),
        strength: inDay ? '높음' : '보통'
      });
    });

    if (cls['비겁'] > total * 0.30) list.push({
      title: '비겁 과다 — 혼자 다 하려는 구조',
      basis: '비겁이 ' + pct(cls['비겁'] / total * 100) + '%로 과다합니다. ' + TEN_GOD_PROFILE['비견'].over,
      behavior: '일을 나눠 주지 못하고, 나눠 주면 불안해합니다. 결국 혼자 다 하고, 혼자 억울해합니다.',
      roast: roastPick(chart, '위임은 신뢰의 문제가 아니라 구조의 문제예요. 작은 일부터 넘겨 보세요.',
        '당신은 남에게 맡기면 일이 망할 거라고 믿는다. 그 믿음이 실제로 일이 망하는 이유다.',
        '당신은 혼자 다 하는 걸 책임감이라고 부른다. 그 책임감 때문에 아무도 성장하지 못하고, 당신은 늘 지친다.'),
      score: 78, strength: '높음'
    });

    if (cls['관성'] > total * 0.28) list.push({
      title: '관성 과다 — 평가에 눌린 구조',
      basis: '관성이 ' + pct(cls['관성'] / total * 100) + '%로 과다하고 일간 세력은 ' + pct(st.ratio * 100) + '%입니다. 남의 기준이 내 판단보다 커집니다.',
      behavior: '결정 전에 "남들이 뭐라고 할까"를 먼저 계산합니다. 그 계산이 늦어지면 기회가 사라집니다.',
      roast: roastPick(chart, '남의 기준을 다 만족시킬 수는 없어요. 내 기준 하나를 먼저 정하세요.',
        '당신은 좋은 사람이 되려고 자기 판단을 계속 미룬다. 그 결과는 좋은 사람이 아니라 판단 없는 사람이다.',
        '당신은 인정받으려고 규칙을 다 지켰는데, 정작 인정은 규칙을 잘 깬 사람에게 갔다. 억울하면 이제 자기 기준을 세워라.'),
      score: 74, strength: '높음'
    });

    if (cls['인성'] > total * 0.30) list.push({
      title: '인성 과다 — 생각이 실행을 이기는 구조',
      basis: '인성이 ' + pct(cls['인성'] / total * 100) + '%로 과다합니다. ' + TEN_GOD_PROFILE['편인'].over,
      behavior: '준비가 끝나면 시작하려는데, 준비는 끝나지 않습니다. 완벽한 타이밍을 기다리다 시장이 바뀝니다.',
      roast: roastPick(chart, '완벽한 준비는 없어요. 70%에서 시작하는 연습을 하세요.',
        '당신의 준비는 준비가 아니라 도피다. 시작하지 않으면 실패하지 않으니까.',
        '당신은 평생 준비 중이다. 그 준비로 남은 건 지식이고, 잃은 건 시간이다.'),
      score: 72, strength: '보통'
    });

    if (cls['재성'] > total * 0.28 && st.ratio < 0.48) list.push({
      title: '재다신약 — 돈은 보이는데 몸이 못 버티는 구조',
      basis: '재성 ' + pct(cls['재성'] / total * 100) + '%인데 일간 세력은 ' + pct(st.ratio * 100) + '%입니다. 전형적인 재다신약입니다.',
      behavior: '일이 들어오면 다 받고, 몸이 먼저 상합니다. 돈은 들어오지만 남는 게 없고, 건강검진에서 숫자가 바뀝니다.',
      roast: roastPick(chart, '일을 고르는 기준에 "내 체력"을 꼭 넣으세요.',
        '당신은 돈이 보이면 체력을 담보로 잡는다. 그 담보는 결국 회수된다.',
        '당신은 돈을 벌기 위해 몸을 쓰고, 번 돈으로 몸을 고친다. 그 순환에서 당신은 한 푼도 남기지 못한다.'),
      score: 80, strength: '높음'
    });

    if (cls['식상'] < total * 0.06) list.push({
      title: '식상 부재 — 표현이 막힌 구조',
      basis: '식상이 ' + pct(cls['식상'] / total * 100) + '%로 거의 없습니다. ' + TEN_GOD_PROFILE['식신'].none,
      behavior: '잘해 놓고도 말을 못 해 공을 뺏깁니다. 속으로는 정확히 기억하고 있습니다.',
      roast: roastPick(chart, '성과를 말로 정리하는 습관만 들여도 평가가 달라져요.',
        '당신은 말하지 않아도 알 거라고 생각한다. 아무도 모른다.',
        '당신은 묵묵함을 미덕이라고 부르지만, 그 묵묵함이 당신 월급을 깎고 있다.'),
      score: 68, strength: '보통'
    });

    if (cls['재성'] < total * 0.06) list.push({
      title: '재성 부재 — 돈 관리 감각의 공백',
      basis: '재성이 ' + pct(cls['재성'] / total * 100) + '%로 거의 없습니다. ' + TEN_GOD_PROFILE['정재'].none,
      behavior: '돈이 들어오면 그때그때 쓰고, 남는 구조를 만들지 않습니다. 큰 돈 앞에서 판단이 흔들립니다.',
      roast: roastPick(chart, '자동이체 하나로 해결되는 문제예요. 지금 설정하세요.',
        '당신은 돈을 안 쫓는 척하면서, 돈 걱정은 제일 많이 한다.',
        '당신은 "돈보다 중요한 게 있다"고 말할 자격을 아직 못 갖췄다. 통장 잔고가 그 말을 비웃고 있다.'),
      score: 66, strength: '보통'
    });

    chart.sinsal.list.forEach(function (s) {
      if (s.name === '귀문관살') list.push({
        title: '귀문관살 — 촉이 의심으로 바뀌는 자리',
        basis: '귀문관살이 ' + s.positions.map(function (x) { return POS_KR[x]; }).join('·') + '에 있습니다. ' + s.desc,
        behavior: '상대의 표정·말투·답장 속도에서 정보를 뽑아 혼자 시나리오를 완성합니다. 확인은 안 합니다.',
        roast: roastPick(chart, '촉이 좋다는 건 장점이에요. 다만 확인 없이 결론 내리면 그 촉이 독이 돼요.',
          '당신의 직감은 대개 맞다. 문제는 맞는지 확인하지 않고 혼자 결론 내린다는 것이다.',
          '당신은 사람 마음을 다 읽었다고 믿는다. 그 확신 때문에 물어볼 기회를 스스로 지운다.'),
        score: 62, strength: '낮음'
      });
      if (s.name === '도화') list.push({
        title: '도화 — 호감이 곧 문제가 되는 자리',
        basis: '도화가 ' + s.positions.map(function (x) { return POS_KR[x]; }).join('·') + '에 있습니다. ' + s.desc,
        behavior: '호감을 얻는 건 쉽고, 그 호감이 관계를 복잡하게 만드는 건 빠릅니다. 선을 긋는 데 서툽니다.',
        roast: roastPick(chart, '호감을 주는 건 좋지만, 선을 긋는 말도 연습이 필요해요.',
          '당신은 인기가 많다고 생각하지만, 정작 오래 남는 사람은 적다. 이유는 선을 안 그어서다.',
          '당신은 호감을 관리하지 않고 받기만 한다. 그 호감이 나중에 당신을 가장 피곤하게 만든다.'),
        score: 58, strength: '낮음'
      });
    });

    if (chart.yongsin.conflict) list.push({
      title: '용신이 갈리는 구조 — 판단 기준의 혼란',
      basis: '억부용신은 ' + chart.yongsin.yongsin + ', 조후용신은 ' + chart.yongsin.johu.el + '로 갈립니다. 학파에 따라 답이 다릅니다.',
      behavior: '조언을 구할 때마다 다른 답을 듣고, 결국 아무것도 못 정합니다.',
      roast: roastPick(chart, '답이 갈릴 때는 내가 이미 기울어 있는 쪽을 고르면 돼요.',
        '당신은 조언을 구하는 게 아니라 결정을 미룰 핑계를 구한다.',
        '당신은 전문가마다 말이 다르다고 불평한다. 전문가들이 갈리는 지점까지 당신이 판단할 능력은 없다는 걸 인정해야 한다.'),
      score: 55, strength: '낮음'
    });

    if (!chart.timeKnown) list.push({
      title: '출생시간 미상 — 시주가 비어 있는 구조',
      basis: '시주를 모르면 자녀·말년·속마음의 자리가 비어 해석의 절반이 가정이 됩니다.',
      behavior: '이 분석의 시주 관련 부분은 실제와 다를 수 있습니다.',
      roast: '시주 없이 단정하는 해석은 사주가 아니라 점쟁이다. 시간을 확인할 수 있으면 확인해라.',
      score: 90, strength: '낮음'
    });

    list.sort(function (a, b) { return b.score - a.score; });
    return list;
  }

  function sectionRoast(chart) {
    var pain = painCandidates(chart).slice(0, 5);
    var sp = STEM_PROFILE[chart.pillars.day.gan];
    var out = '';

    out += '<div class="roast-intro">여기서부터는 근거 강도를 함께 표시합니다. <b>높음</b>은 원국의 구조가 직접적으로 그렇게 말하는 것, <b>보통</b>은 구조에서 합리적으로 유추되는 것, <b>낮음</b>은 학파·경험칙에 따라 갈리는 가설입니다.</div>';

    out += '<h3>골치 아픈 구조 TOP 5</h3><div class="painlist">';
    pain.forEach(function (x, i) {
      out += '<div class="pain">' +
        '<div class="pain-head"><span class="pain-rank">' + (i + 1) + '</span><span class="pain-title">' + x.title + '</span><span class="strength-badge sb-' + x.strength + '">근거 ' + x.strength + '</span></div>' +
        '<div class="ins-line"><span class="tag t-basis">근거</span><span>' + x.basis + '</span></div>' +
        '<div class="ins-line"><span class="tag t-act">예상 행동</span><span>' + x.behavior + '</span></div>' +
        '<div class="ins-line roastline"><span class="tag t-roast">' + roastLabel(chart) + '</span><span>' + x.roast + '</span></div>' +
        '</div>';
    });
    out += '</div>';

    /* 스스로 인생 피곤하게 만드는 이유 */
    out += '<h3>스스로 인생을 피곤하게 만드는 이유</h3>';
    out += ins(chart,
      '일간 ' + chart.pillars.day.gan + '(' + sp.image + ') 기질에 ' + chart.strength.level + ' 구조, 그리고 ' + dominantTenGod(chart.counts.detail) + ' 과다가 겹칩니다.',
      selfTire(chart),
      roastPick(chart,
        '피곤함의 원인을 하나만 정해서 3주만 바꿔 보세요.',
        '당신의 피곤은 일이 많아서가 아니라, 일을 혼자 떠안는 방식 때문에 생긴다.',
        '당신은 인생이 힘들다고 말한다. 맞다. 다만 그 힘든 코스를 매번 당신이 직접 짠다.'));

    /* 남들이 말 못하는 단점 */
    out += '<h3>남들이 차마 말해 주지 않는 단점</h3>';
    out += ins(chart,
      '관성 ' + pct(pcls(chart)['관성'] / chart.strength.total * 100) + '% · 인성 ' + pct(pcls(chart)['인성'] / chart.strength.total * 100) + '% · 비겁 ' + pct(pcls(chart)['비겁'] / chart.strength.total * 100) + '%의 조합에서 나오는 인상입니다.',
      hiddenFlaw(chart),
      roastPick(chart,
        '이건 비난이 아니라 정보예요. 한 가지만 의식해도 관계가 편해져요.',
        '사람들이 이걸 말해 주지 않는 이유는, 말하면 당신이 오래 기억하기 때문이다.',
        '당신은 말대꾸를 논리라고 생각한다. 상대는 논리를 원한 게 아니라 인정을 원했다.'));

    /* 고집 손해 */
    out += '<h3>고집부리다가 손해 보는 지점</h3>';
    out += ins(chart,
      '일간 ' + chart.pillars.day.gan + '의 고집과 ' + chart.strength.level + ' 구조가 결합하면, ' + (chart.strength.ratio > 0.55 ? '"내 판단이 맞다"는 확신이 실제 근거보다 강해집니다.' : '"내가 손해를 보더라도 이 방식"이라는 원칙이 앞섭니다.'),
      stubLoss(chart),
      roastPick(chart,
        '고집을 꺾으라는 게 아니라, 결정을 하루만 미뤄 보라는 거예요.',
        '당신이 지킨 원칙 중에 실제로 이익이 된 게 몇 개인지 세어 봤나.',
        '당신은 원칙을 지키는 사람이라고 생각한다. 원칙을 지키는 것과 융통성 없는 것은 옆에서 보면 구분되지 않는다.'));

    /* 장점 망치는 방식 */
    out += '<h3>장점을 스스로 망치는 방식</h3>';
    out += ins(chart,
      sp.strengths[0] + ', ' + sp.strengths[1] + ' — 이 강점이 ' + dominantTenGod(chart.counts.detail) + ' 과다와 만나면 과잉이 됩니다.',
      spoilStrength(chart),
      roastPick(chart,
        '장점을 아끼는 것도 전략이에요. 늘 최고로 쓰지 마세요.',
        '당신은 강점을 아무 데나 쓴다. 그래서 정작 중요한 곳에서는 힘이 남지 않는다.',
        '당신의 최고 장점은 당신의 최고 단점과 같은 것이다. 달라진 건 상대의 표정뿐이다.'));

    /* 반복 패턴 */
    out += '<h3>인간관계·커리어에서 반복됐을 패턴</h3>';
    out += ins(chart,
      '월지 ' + chart.pillars.month.zhi + '와 일지 ' + chart.pillars.day.zhi + ', ' + dominantTenGod(chart.counts.detail) + ' 과다 구조가 3~7년 주기로 같은 상황을 만듭니다.',
      repeatPattern(chart),
      roastPick(chart,
        '같은 패턴이 보이면, 이번엔 결론 대신 질문을 하나 더 해 보세요.',
        '당신이 반복하는 건 상황이 아니라 선택이다. 상황은 매번 달랐다.',
        '당신은 지금도 새 사람과 옛 문제를 같이 시작하고 있다. 이름만 바뀐 같은 싸움이다.'));

    return out;
  }

  function selfTire(chart) {
    var cls = pcls(chart), total = chart.strength.total;
    if (cls['비겁'] > total * 0.28) return '일을 나눠 주지 못하고, 나눠 주면 다시 확인하느라 시간이 두 배로 듭니다. 결국 남는 건 "내가 다 했다"는 피로입니다.';
    if (cls['인성'] > total * 0.28) return '결정을 하기 전 생각을 오래 합니다. 그 생각의 절반은 아무도 요구하지 않은 시나리오입니다.';
    if (cls['관성'] > total * 0.26) return '남의 기대를 기준으로 일정을 짭니다. 내 일정표에 남의 일이 먼저 들어와 있습니다.';
    if (cls['식상'] > total * 0.28) return '하고 싶은 일이 많아 동시에 벌입니다. 멈추는 타이밍을 못 잡아 마무리가 남에게 넘어갑니다.';
    return '돈과 성과를 먼저 계산합니다. 그 계산이 즐거움을 말려 버려서, 쉬어도 쉰 것 같지 않습니다.';
  }

  function hiddenFlaw(chart) {
    var cls = pcls(chart), total = chart.strength.total;
    if (cls['비겁'] > total * 0.28) return '자기 이야기를 하다가 상대 이야기를 끊는 습관이 있습니다. 본인은 대화라고 생각합니다.';
    if (cls['관성'] > total * 0.26) return '체면 때문에 사과를 늦게 합니다. 미안하다는 말 대신 "그럴 수도 있지"로 넘깁니다.';
    if (cls['식상'] > total * 0.28) return '맞는 말을 기분 나쁘게 합니다. 내용은 맞는데 전달이 남는다는 소리를 듣습니다.';
    if (cls['인성'] > total * 0.28) return '속으로 판단해 놓고 말은 안 합니다. 그래서 주변은 당신이 갑자기 식은 이유를 모릅니다.';
    return '손해 보는 사람을 은근히 무시합니다. 본인은 효율이라고 생각합니다.';
  }

  function stubLoss(chart) {
    var cls = pcls(chart), total = chart.strength.total;
    if (cls['비겁'] > total * 0.28) return '동업·공동명의·보증에서 "설마 그러겠어"로 시작해, 지분과 청산 규칙을 안 정해 손해를 봅니다.';
    if (cls['관성'] > total * 0.26) return '"그 자리까지 가면 인정받는다"는 믿음으로 버팁니다. 그 자리가 당신에게 맞는지는 확인하지 않습니다.';
    if (cls['재성'] > total * 0.28) return '이미 회수하기 어려운 투자에 "여기까지 왔으니"로 추가 투입합니다.';
    if (cls['인성'] > total * 0.28) return '준비가 부족하다는 이유로 기회를 한 번씩 흘려보냅니다. 그 기회는 다시 오지 않습니다.';
    return '한 번 정한 방향을 바꾸지 않아, 판이 바뀐 뒤에도 같은 방식으로 밀어붙입니다.';
  }

  function spoilStrength(chart) {
    var cls = pcls(chart), total = chart.strength.total;
    if (cls['비겁'] > total * 0.28) return '혼자 해내는 힘이 강점인데, 그 힘으로 남의 일까지 가져옵니다. 그 순간 팀은 사라집니다.';
    if (cls['식상'] > total * 0.28) return '재능이 강점인데, 재능으로 사람을 이기려 합니다. 그래서 적이 늘어납니다.';
    if (cls['관성'] > total * 0.26) return '책임감이 강점인데, 그 책임을 혼자 지려다 결정을 놓칩니다.';
    if (cls['재성'] > total * 0.28) return '실행력이 강점인데, 성과가 숫자로만 보여 사람을 숫자로 봅니다.';
    return '깊이가 강점인데, 그 깊이를 설명하지 않아 아무도 그 가치를 모릅니다.';
  }

  function repeatPattern(chart) {
    var cls = pcls(chart), total = chart.strength.total, rels = chart.relations;
    var chungDay = rels.some(function (r) { return r.kind === '충' && r.pos.indexOf('day') >= 0; });
    var chungMonth = rels.some(function (r) { return r.kind === '충' && r.pos.indexOf('month') >= 0; });
    var s = '';
    if (chungMonth) s += '직장에서 "이번엔 다르겠지" 하고 들어갔다가 비슷한 권한 문제로 나오는 일이 반복됩니다. ';
    if (chungDay) s += '가까운 관계에서 같은 지점의 다툼이 반복되고, 그때마다 "이 사람은 원래 이렇다"로 정리합니다. ';
    if (cls['비겁'] > total * 0.28) s += '동업이나 공동 작업에서 몫 문제가 터집니다. ';
    if (cls['관성'] > total * 0.26) s += '평가를 기다리다 지쳐서, 평가 직전에 스스로 포기합니다. ';
    if (!s) s = '큰일을 앞두고 준비를 더 하다가 타이밍을 놓치는 일이 반복됩니다.';
    return s;
  }

  /* ============================================================ 학설 비교 */
  function sectionSchools(chart) {
    var y = chart.yongsin, st = chart.strength, rows = [];
    rows.push({
      topic: '신강·신약',
      trad: '득령·득지·득세를 모두 따져 판단. 이 사주는 ' + (st.deukryeong ? '득령' : '실령') + '·' + (st.deukji ? '득지' : '실지') + '·' + (st.deukse ? '득세' : '실세') + '로 ' + st.level,
      modern: '월간·시간의 투출과 실제 생활 패턴을 더 중시. 계산상 ' + pct(st.ratio * 100) + '%라 큰 틀은 같다',
      net: '"토가 많으면 무조건 신강" 같은 단순 계산은 근거가 약하다',
      pick: '가중 계산과 생활 체감을 함께 보는 쪽이 일관적'
    });
    rows.push({
      topic: '용신',
      trad: '억부용신 우선 — 용신 ' + y.yongsin + ' (신강·신약을 먼저 확정한 뒤 설기·극제 또는 생조를 고름)',
      modern: y.johu ? '조후를 함께 봄 — ' + (y.johu.need ? '조후용신 ' + y.johu.el + ' 병용' : '조후는 결정적이지 않다고 봄') : '실전에서는 조후·통관을 보조로 사용',
      net: '"용신만 맞으면 다 된다"는 식의 단정은 인터넷에서 흔한 과장',
      pick: y.conflict ? '충돌하므로 두 용신을 상황별로 나눠 쓰는 것이 현실적' : '억부용신과 조후가 같은 방향이라 일관적'
    });
    rows.push({
      topic: '격국',
      trad: chart.structure.name + ' — 월지 본기의 투출 여부로 격을 정함',
      modern: '격국보다 실제 직업·행동 패턴을 우선. 이 사주는 ' + (STRUCTURE_PROFILE[chart.structure.name] ? STRUCTURE_PROFILE[chart.structure.name].career : '') + ' 쪽',
      net: '격국 이름만으로 사람을 규정하는 해석은 과장',
      pick: '격은 "쓰이는 자리"를 보는 도구로 쓰는 게 일관적'
    });
    rows.push({
      topic: '신살',
      trad: '신살은 보조로만 보고, 격국·오행을 먼저 본다',
      modern: '도화·역마·귀문을 성격·관계 해석에 적극 사용',
      net: '신살만으로 길흉을 단정하는 것은 근거가 약함',
      pick: '이 사주의 신살(' + (chart.sinsal.list.map(function (s) { return s.name; }).join('·') || '없음') + ')은 보조 지표로만 반영'
    });
    rows.push({
      topic: '자시 일주',
      trad: chart.jaSiRule === 'ya' ? '야자시 — 23:00에 일주가 바뀐다' : '조자시 — 00:00에 일주가 바뀐다',
      modern: '대체로 조자시(00:00 기준)를 쓰는 앱이 늘고 있으나 학파가 갈린다',
      net: '"23시 출생은 무조건 다음 날"이라는 단정은 학파 차이를 무시한 것',
      pick: '두 기준을 모두 계산해 보고, 실제 성향과 맞는 쪽을 택하는 것이 현실적'
    });
    rows.push({
      topic: '진태양시',
      trad: '지방 진태양시로 시주를 보정하는 것이 원칙(경도차). 균시차는 학파에 따라 생략',
      modern: '앱에서는 경도 보정만 적용하는 경우가 많고, 서머타임·표준시 이력은 누락되기 쉽다',
      net: '"한국은 원래 30분 느리다"는 말은 표준시 이력(1954~1961)을 모르고 하는 말',
      pick: '경도차 + 표준시 이력 + 서머타임을 모두 반영한 이 계산이 더 엄밀'
    });

    var html = '<div class="school-table"><table><thead><tr><th>쟁점</th><th>정통 명리</th><th>현대 실전</th><th>인터넷 속설</th><th>이 사주의 채택</th></tr></thead><tbody>';
    rows.forEach(function (r) {
      html += '<tr><td class="topic">' + r.topic + '</td><td>' + r.trad + '</td><td>' + r.modern + '</td><td>' + r.net + '</td><td class="pick">' + r.pick + '</td></tr>';
    });
    html += '</tbody></table></div>';

    html += '<p class="body small">위 비교는 특정 책의 문장을 인용한 것이 아니라, 각 학파에서 널리 쓰이는 원칙을 이 사주에 적용한 결과입니다. 실제 서적 대조 없이 "책에 이렇게 쓰여 있다"고 단정하지 않습니다.</p>';
    return html;
  }

  /* ============================================================ 최종 평가 */
  function sectionFinal(chart) {
    var sp = STEM_PROFILE[chart.pillars.day.gan];
    var st = chart.strength, cls = pcls(chart), total = st.total;
    var pain = painCandidates(chart);

    var good = [];
    good.push(sp.strengths[0] + ' — ' + sp.image + ' 기질에서 나오는 힘. 이건 흉내 낼 수 있는 게 아니다');
    if (chart.structure.name.indexOf('양인') === 0 || chart.structure.name.indexOf('건록') === 0) good.push('제 힘으로 서는 구조(' + chart.structure.name + ') — 남에게 기대지 않고 판을 만드는 힘');
    else good.push(chart.structure.name + '의 구조 — ' + (STRUCTURE_PROFILE[chart.structure.name] || {}).career + ' 쪽에서 강점');
    if (st.score[chart.yongsin.yongsin] > total * 0.15) good.push('용신 ' + chart.yongsin.yongsin + '이 원국에 살아 있어, 방향만 맞으면 성과가 난다');
    else good.push(sp.strengths[1] + ' — 약한 용신을 노력으로 메우는 편');

    var bad = pain.slice(0, 5).map(function (x) { return x.title + ' — ' + x.behavior.split('.')[0] + '.'; });
    while (bad.length < 5) bad.push(['결정을 미루는 습관', '혼자 떠안는 습관', '확인 없이 결론 내리는 습관', '잘될 때 정리하지 않는 습관', '말로 정리하지 않는 습관'][bad.length]);

    var html = '';
    html += '<div class="final-grid">';
    html += '<div class="final-card good"><div class="fc-h">핵심 장점 3</div><ol>' + good.slice(0, 3).map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ol></div>';
    html += '<div class="final-card bad"><div class="fc-h">핵심 약점 5</div><ol>' + bad.slice(0, 5).map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ol></div>';
    html += '</div>';

    html += '<div class="final-card self"><div class="fc-h">가장 경계해야 할 자기파괴적 습관</div><p>' + selfDestruct(chart) + '</p></div>';

    html += '<div class="final-card act"><div class="fc-h">잠재력을 쓰기 위한 현실 행동 5</div><ol>' +
      actions(chart).map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ol></div>';

    html += '<div class="oneline"><div class="ol-h">한 문장 최종 ROAST</div><div class="ol-body">' + oneLine(chart) + '</div><div class="ol-strength">근거 강도: 높음 — 원국 구조와 대운 방향에서 직접 도출</div></div>';

    return html;
  }

  function selfDestruct(chart) {
    var cls = pcls(chart), total = chart.strength.total;
    if (cls['비겁'] > total * 0.28) return '혼자 다 하려다가, 정작 중요한 순간에 도움을 받지 못하는 것. 당신은 늘 "내가 하면 된다"로 시작하고 "왜 나만"으로 끝낸다.';
    if (cls['인성'] > total * 0.28) return '완벽한 준비를 기다리다 기회를 놓치는 것. 준비가 길어질수록 판은 이미 바뀌어 있다.';
    if (cls['관성'] > total * 0.26) return '남의 기대에 맞추다가 자기 판단을 잃는 것. 당신은 좋은 사람이 되려고 결정을 남에게 넘긴다.';
    if (cls['식상'] > total * 0.28) return '말이 앞서 관계를 끊는 것. 내용은 맞는데 전달이 남는 경우가 반복된다.';
    return '잘될 때 정리하지 않는 것. 확장을 멈추지 못해 다음 국면에서 한꺼번에 잃는다.';
  }

  function actions(chart) {
    var y = chart.yongsin, list = [];
    list.push('용신 ' + y.yongsin + '을 일상에 넣기 — ' + ELEMENT_PROFILE[y.yongsin].adv);
    list.push('기신 ' + y.gisin + ' 기운이 강해지는 상황을 피하기 — ' + gisinSituation(y.gisin) + '를 피하는 규칙 하나 정하기');
    list.push('결정 기한을 정하는 습관 — 중요한 결정은 72시간 안에 결론, 이후엔 뒤집지 않기');
    list.push('관계에서 감정이 올라온 날엔 결론을 말하지 않기 — 24시간 뒤에 한 문장으로 말하기');
    list.push('매달 한 번, 이번 달에 한 일을 세 줄로 적기 — 식상이 약한 사주는 기록이 곧 표현이다');
    return list;
  }

  var ONE_LINE = {
    '甲': '당신은 유연함을 배신으로 착각하는 사람이다',
    '乙': '당신은 괜찮다는 말로 계산서를 쌓는 사람이다',
    '丙': '당신은 무대가 비면 불안해서 조명을 직접 드는 사람이다',
    '丁': '당신은 말 안 해도 안다고 믿다가 혼자 실망하는 사람이다',
    '戊': '당신은 결정을 미루면서 그것을 안정이라고 부르는 사람이다',
    '己': '당신은 배려라는 이름으로 계산서를 쓰고 청구서는 보내지 않는 사람이다',
    '庚': '당신은 사람을 자르는 것을 결단력이라고 부르는 사람이다',
    '辛': '당신은 품위를 지키느라 인연을 직접 잘라내는 사람이다',
    '壬': '당신은 새로 시작하는 것을 진보라고 믿는 사람이다',
    '癸': '당신은 파도가 올까 봐 평생 해변에 서 있는 사람이다'
  };

  function oneLine(chart) {
    var core = chart.strength.ratio >= 0.55 ? '힘은 충분한데 방향을 남에게 물어본다' : '방향은 아는데 힘을 남에게 빌리려 한다';
    var punch = ONE_LINE[chart.pillars.day.gan] || '자기 방식을 의심하지 않는 사람이다';
    var r = tone(chart);
    if (r <= 3) return '지금 습관 하나만 바꾸면 훨씬 편해지는 사람 — ' + core + '.';
    if (r <= 6) return punch + ' — ' + core + '.';
    return punch + ' — ' + core + '. 그 둘이 같은 곳에서 나온다는 걸 알면, 바꿀 곳도 하나로 줄어든다.';
  }

  /* ============================================================ 조립 */
  function build(chart) {
    var sections = [
      { id: 'wonkuk', num: '①', title: '사주 원국 해부', body: sectionWonkuk(chart) },
      { id: 'personality', num: '②', title: '성격 팩트폭격', body: sectionPersonality(chart) },
      { id: 'love', num: '③', title: '연애와 인간관계', body: sectionLove(chart) },
      { id: 'work', num: '④', title: '돈, 직업, 성공 가능성', body: sectionWork(chart) },
      { id: 'daewoon', num: '⑤', title: '대운과 세운', body: sectionDaewoon(chart) },
      { id: 'roast', num: '⑥', title: '가장 매운 ROAST', body: sectionRoast(chart) },
      { id: 'schools', num: '⑦', title: '상반된 학설 비교', body: sectionSchools(chart) },
      { id: 'final', num: '⑧', title: '최종 평가', body: sectionFinal(chart) }
    ];
    return {
      headline: headline(chart),
      sections: sections,
      disclaimer: '이 분석은 전통 명리학 체계 내부의 논리를 엄격하게 적용한 해석이며, 과학적으로 검증된 성격 진단이나 미래 예측이 아닙니다. 사주가 보여주는 성향과 실제로 확정된 사실은 구분해서 읽어야 합니다.'
    };
  }

  function headline(chart) {
    var p = chart.pillars, sp = STEM_PROFILE[p.day.gan];
    var tags = [];
    tags.push(p.day.gan + ' ' + sp.image);
    tags.push(chart.strength.level);
    tags.push(chart.structure.name);
    if (chart.currentDaewoon && !chart.currentDaewoon.preStart) tags.push('현재 대운 ' + chart.currentDaewoon.gz);
    tags.push(chart.seun.thisYear.year + ' ' + chart.seun.thisYear.gz);
    return {
      pillars: pillarsText(chart),
      tags: tags,
      sub: p.day.gan + '(' + sp.image + ') · ' + chart.strength.level + ' · ' + chart.structure.name + ' · 용신 ' + chart.yongsin.yongsin
    };
  }

  root.SajuAnalysis = {
    build: build,
    STEM_PROFILE: STEM_PROFILE,
    painCandidates: painCandidates
  };
})(typeof window !== 'undefined' ? window : this);
