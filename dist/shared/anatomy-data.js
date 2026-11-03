/* 뇌·내분비 탐험기 데이터 — 화면 코드(anatomy-explorer.js)와 분리된 순수 내용.
 * 어원(etym)은 ko=한자/우리말 풀이, en=영어·라틴어·그리스어 뜻, memo=기억용 한 줄.
 * level: "core"=교과서(수능 생명과학Ⅰ) 핵심, "ref"=참고·교양.
 * targets 의 id 는 몸 그림에 그려지는 표적 기관 id: brain pituitary thyroid adrenal liver kidney heart muscle bone gut breast uterus gonad all
 */
window.ANATOMY_DATA = {
  /* ───────── 뇌 보기 두 가지 ───────── */
  brainViews: [
    { id: "side", label: "바깥에서 보기 (옆면)", parts: ["frontal", "parietal", "temporal", "occipital", "cerebellum", "brainstem"] },
    { id: "mid", label: "반으로 잘라 보기 (정중 단면)", parts: ["cerebrum", "corpus_callosum", "diencephalon", "thalamus", "hypothalamus", "pituitary", "pineal", "hippocampus", "amygdala", "brainstem", "midbrain", "pons", "medulla", "cerebellum", "spinal_cord"] }
  ],

  /* 칩 목록·하이라이트용 묶음: 이 부위를 고르면 members 도 같이 밝힌다 */
  groups: {
    diencephalon: ["thalamus", "hypothalamus"],
    brainstem: ["midbrain", "pons", "medulla"]
  },

  /* ───────── 내분비 그림에 놓일 샘 ───────── */
  glands: ["hypothalamus", "pituitary", "pineal", "thyroid", "parathyroid", "thymus", "adrenal", "pancreas", "ovary", "testis"],

  /* ───────── 부위(뇌 구조 + 샘) ───────── */
  parts: {
    /* ── 뇌: 옆면 ── */
    frontal: {
      name: "전두엽", en: "Frontal lobe", level: "ref",
      where: "대뇌의 앞쪽, 이마 뒤",
      etym: {
        ko: "前(앞 전)+頭(머리 두)+葉(잎 엽) → ‘앞머리 쪽 잎’",
        en: "라틴어 frons(이마)에서 온 frontal. lobe는 그리스어 lobos(둥글게 튀어나온 부분, 귓불)",
        memo: "이마(frons) 뒤에 있으니 전두엽 — 이마 쪽에서 ‘계획’을 세운다고 기억"
      },
      role: ["계획·판단·추론, 충동 억제 (뇌의 ‘사령관’)", "운동 피질: 수의 운동 명령을 내림", "브로카 영역(주로 좌반구): 말을 만들어 내는 영역"],
      links: ["parietal", "temporal", "cerebellum"]
    },
    parietal: {
      name: "두정엽", en: "Parietal lobe", level: "ref",
      where: "대뇌의 위쪽 뒤, 정수리 아래",
      etym: {
        ko: "頭(머리 두)+頂(정수리 정)+葉 → ‘머리 꼭대기 잎’",
        en: "라틴어 paries(벽): 머리뼈의 ‘벽’을 이루는 두정골 아래에 있다는 뜻",
        memo: "정수리(頂)에 있으니 두정엽 — 몸 감각을 받아 ‘공간’을 그려 낸다"
      },
      role: ["체성 감각 피질: 촉각·압각·통증·온도 감각", "공간 지각, 몸의 위치 파악, 감각 정보 통합"],
      links: ["frontal", "occipital"]
    },
    temporal: {
      name: "측두엽", en: "Temporal lobe", level: "ref",
      where: "대뇌의 옆쪽 아래, 귀 높이",
      etym: {
        ko: "側(곁 측)+頭(머리 두)+葉 → ‘옆머리 잎’",
        en: "라틴어 tempora(관자놀이). tempus(시간)와 같은 뿌리로, 관자놀이부터 머리가 세어 시간의 흐름을 알려 준다는 설명이 널리 알려져 있음",
        memo: "옆머리(側頭)에 있고 귀와 가까우니 소리·언어 이해, 해마가 있어 기억까지"
      },
      role: ["청각 피질: 소리 정보 처리", "베르니케 영역(주로 좌반구): 말을 이해하는 영역", "기억(안쪽의 해마)과 얼굴·사물 인식"],
      links: ["frontal", "hippocampus"]
    },
    occipital: {
      name: "후두엽", en: "Occipital lobe", level: "ref",
      where: "대뇌의 맨 뒤쪽, 뒤통수 안쪽",
      etym: {
        ko: "後(뒤 후)+頭(머리 두)+葉 → ‘뒷머리 잎’",
        en: "라틴어 ob-(~쪽으로·뒤쪽에)+caput(머리) → occiput(뒤통수)",
        memo: "뒤통수에 있는데 눈과 연결된 시각 처리 공장 — ‘눈은 앞, 시각 피질은 뒤’"
      },
      role: ["시각 피질: 눈에서 온 정보를 처리해 ‘본다’는 경험을 만듦", "손상되면 눈이 멀쩡해도 앞이 안 보일 수 있음(피질맹)"],
      links: ["parietal", "thalamus"]
    },
    cerebellum: {
      name: "소뇌", en: "Cerebellum", level: "core",
      where: "대뇌 아래 뒤쪽, 뇌줄기 뒤",
      etym: {
        ko: "小(작을 소)+腦(뇌 뇌) → ‘작은 뇌’",
        en: "라틴어 cerebellum = cerebrum(뇌)+-ellum(‘작은 것’을 뜻하는 접미사) → 말 그대로 ‘작은 뇌’",
        memo: "대뇌(大腦)는 큰 뇌, 소뇌(小腦)는 작은 뇌 — 이름이 곧 크기 비교"
      },
      role: ["몸의 균형과 자세 유지", "근육 운동을 부드럽고 정확하게 조절(운동 협응), 운동 학습", "운동을 ‘시작’하는 것은 대뇌, 소뇌는 ‘다듬는’ 역할"],
      exam: "소뇌=몸의 균형·자세. 술에 취해 비틀거리는 것처럼 균형이 무너지면 소뇌 문제로 연결하는 보기가 단골입니다.",
      links: ["pons", "cerebrum", "frontal"]
    },
    brainstem: {
      name: "뇌줄기(뇌간)", en: "Brainstem", level: "ref",
      where: "대뇌 아래에서 척수까지 이어지는 줄기 부분",
      etym: {
        ko: "腦(뇌 뇌)+幹(줄기 간) → ‘뇌의 줄기’",
        en: "brain stem: 나무 줄기(stem)처럼 대뇌를 받치고 척수로 이어진다는 뜻",
        memo: "중간뇌+뇌교+연수 = 뇌줄기. 나무 줄기가 뿌리(척수)와 가지(대뇌)를 잇듯 한다"
      },
      role: ["중간뇌·뇌교·연수를 묶어 부르는 이름", "생명 유지(호흡·심장 박동)와 대뇌–척수 신호의 통로"],
      members: ["midbrain", "pons", "medulla"],
      links: ["cerebellum", "spinal_cord"]
    },

    /* ── 뇌: 정중 단면 ── */
    cerebrum: {
      name: "대뇌", en: "Cerebrum", level: "core",
      where: "뇌의 맨 위·앞·옆을 덮는 가장 큰 부분 (좌우 반구)",
      etym: {
        ko: "大(큰 대)+腦(뇌 뇌) → ‘큰 뇌’",
        en: "라틴어 cerebrum = 뇌. 겉질을 뜻하는 cortex는 ‘나무껍질’이라는 라틴어 — 皮質(껍질 피, 바탕 질)과 같은 발상",
        memo: "큰 뇌(大腦) 겉(皮)에 신경 세포체가 모인 껍질 — 겉은 회색, 속은 흰색"
      },
      role: ["감각 영역·운동 영역·연합 영역이 있는 겉질(피질)", "사고·기억·판단·언어 등 고등 정신 활동의 중추", "수의 운동의 명령을 내림, 겉의 주름은 표면적을 넓힘"],
      exam: "대뇌는 겉질이 회색질(신경 세포체), 속이 백색질(축삭). 척수는 반대로 겉이 백색질, 속이 회색질입니다.",
      links: ["thalamus", "corpus_callosum", "cerebellum"]
    },
    corpus_callosum: {
      name: "뇌량", en: "Corpus callosum", level: "ref",
      where: "좌우 대뇌 반구 사이, 가운데 깊은 곳의 흰 띠",
      etym: {
        ko: "腦(뇌 뇌)+梁(들보 량) → ‘뇌의 대들보’",
        en: "라틴어 corpus(몸)+callosum(단단한, 굳은살 같은) → ‘단단한 몸’",
        memo: "두 집(반구)을 잇는 대들보 — 좌뇌와 우뇌가 정보를 주고받는 다리"
      },
      role: ["좌반구와 우반구를 연결하는 신경 섬유(축삭) 다발", "양쪽 반구가 정보를 공유하게 함"],
      links: ["cerebrum"]
    },
    diencephalon: {
      name: "간뇌", en: "Diencephalon", level: "core",
      where: "대뇌 아래 한가운데, 시상과 시상 하부를 합친 부분",
      etym: {
        ko: "間(사이 간)+腦 → ‘사이에 낀 뇌’ (대뇌와 중간뇌 사이)",
        en: "그리스어 dia(사이)+enkephalos(뇌: en 안+kephale 머리) → ‘사이뇌’",
        memo: "대뇌와 중간뇌 ‘사이’에 끼어 있어서 간뇌 — 시상 + 시상 하부"
      },
      role: ["시상: 감각 정보를 대뇌로 중계", "시상 하부: 항상성(체온·혈당·삼투압) 조절과 호르몬 분비 조절"],
      members: ["thalamus", "hypothalamus"],
      exam: "간뇌 = 시상 + 시상 하부. 체온·혈당·삼투압 조절의 중추는 간뇌의 시상 하부입니다.",
      links: ["cerebrum", "midbrain"]
    },
    thalamus: {
      name: "시상", en: "Thalamus", level: "core",
      where: "간뇌의 위쪽, 뇌 한가운데 깊숙이",
      etym: {
        ko: "視(볼 시)+床(평상 상) → ‘시각 정보가 머무는 평상(침상)’",
        en: "그리스어 thalamos = 안쪽 방, 침실. 옛 해부학자가 시각 신경이 닿는 ‘방’이라 불러 thalamus라 함",
        memo: "감각의 ‘중간 정류장’ — 시각을 비롯한 감각이 이곳(방)에 들렀다 대뇌로 간다"
      },
      role: ["후각을 뺀 거의 모든 감각 정보를 대뇌 겉질로 중계하는 관문", "감각 정보를 걸러서 대뇌로 올려 보냄"],
      exam: "후각은 시상을 거치지 않고 대뇌로 바로 갑니다. ‘모든 감각’이라고 쓰면 틀립니다.",
      links: ["cerebrum", "hypothalamus", "midbrain"]
    },
    hypothalamus: {
      name: "시상 하부", en: "Hypothalamus", level: "core",
      where: "간뇌의 아래쪽, 시상 바로 밑 — 뇌하수체와 줄기로 이어짐",
      etym: {
        ko: "視床(시상)+下(아래 하)+部(부분 부) → ‘시상 아래 부분’",
        en: "그리스어 hypo(아래)+thalamus(안쪽 방) → ‘방 아래’",
        memo: "hypo-는 ‘아래’ (hypodermic = 피부 아래 주사). 시상 밑이니 시상 하부"
      },
      role: ["항상성의 최고 중추: 체온·혈당·삼투압 조절", "식욕·갈증·수면 리듬 조절, 자율 신경 조절", "방출·억제 호르몬으로 뇌하수체 전엽을 조절하고, ADH·옥시토신을 만듦"],
      exam: "체온 조절 중추=시상 하부(대뇌 아님). 신경계와 내분비계가 만나는 곳이라 ‘호르몬 분비 조절’ 문항에도 등장합니다.",
      hormones: [{ label: "조절 호르몬", keys: ["rh"] }],
      links: ["pituitary", "thalamus", "medulla"]
    },
    pituitary: {
      name: "뇌하수체", en: "Pituitary gland", level: "core",
      where: "시상 하부 바로 아래에 달린 완두콩만 한 샘 (전엽·후엽)",
      etym: {
        ko: "腦(뇌 뇌)+下(아래 하)+垂(드리울 수)+體(몸 체) → ‘뇌 아래에 늘어져 달린 몸’",
        en: "pituitary: 라틴어 pituita(점액·콧물). 옛사람들은 뇌의 점액이 이곳을 통해 코로 흘러나온다고 믿음. 다른 이름 hypophysis = hypo(아래)+physis(자라남) → ‘아래로 자란 것’",
        memo: "시상 하부 밑에 ‘매달려(垂)’ 있다 — 이름이 위치를 그대로 말해 줌"
      },
      role: ["전엽: 생장 호르몬, TSH, ACTH, FSH, LH, 프로락틴 등을 분비 — 다른 내분비샘을 지휘", "후엽: 시상 하부에서 만든 ADH·옥시토신을 저장했다가 분비", "‘내분비샘의 사령탑’이라 불림(그 위에 시상 하부가 있음)"],
      exam: "전엽=여러 자극 호르몬(생장 호르몬·TSH 등), 후엽=ADH. ADH는 후엽에서 분비되지만 합성은 시상 하부입니다.",
      hormones: [
        { label: "전엽", keys: ["gh", "tsh", "acth", "fsh", "lh", "prl"] },
        { label: "후엽", keys: ["adh", "oxt"] }
      ],
      links: ["hypothalamus", "thyroid", "adrenal", "gonad"]
    },
    pineal: {
      name: "송과샘", en: "Pineal gland", level: "ref",
      where: "간뇌 뒤쪽 위, 콩알보다 작은 솔방울 모양",
      etym: {
        ko: "松(소나무 송)+果(열매 과)+腺(샘 선) → ‘솔방울 샘’ (송과체라고도 함)",
        en: "라틴어 pinea = 솔방울(pine cone). 솔방울 모양이라 붙은 이름",
        memo: "솔방울(pine cone) 모양 → pineal. 17세기 데카르트는 이곳을 ‘영혼이 깃든 곳’이라 보았음"
      },
      role: ["멜라토닌을 분비해 수면–각성 리듬(일주기 리듬)을 조절", "눈으로 들어온 빛의 양에 따라 분비량이 달라짐"],
      hormones: [{ label: "", keys: ["melatonin"] }],
      links: ["thalamus"]
    },
    hippocampus: {
      name: "해마", en: "Hippocampus", level: "ref",
      where: "측두엽 안쪽 깊은 곳 (좌우 한 쌍, 정중선에서 약간 옆)",
      etym: {
        ko: "海(바다 해)+馬(말 마) → ‘바다의 말’ = 실제 동물 해마(seahorse)",
        en: "그리스어 hippos(말)+kampos(바다 괴물) → ‘바다 말’. 구부러진 모양이 해마를 닮음",
        memo: "이름 그대로 해마(seahorse) 모양 — 새 기억을 만드는 곳"
      },
      role: ["새로운 기억(서술 기억)을 만들어 대뇌 겉질로 보내 저장", "공간 기억·길 찾기", "손상되면 새로운 일을 기억하지 못하게 됨"],
      links: ["amygdala", "temporal"]
    },
    amygdala: {
      name: "편도체", en: "Amygdala", level: "ref",
      where: "측두엽 안쪽, 해마 앞 (좌우 한 쌍)",
      etym: {
        ko: "扁桃(편도=아몬드)+體(몸 체) → ‘아몬드 모양 덩어리’ (扁 넓적할 편, 桃 복숭아 도)",
        en: "그리스어 amygdale = 아몬드. 아몬드처럼 생김",
        memo: "아몬드 모양이라 편도체. 목구멍의 편도선도 같은 이유로 이름이 같지만 서로 다른 기관"
      },
      role: ["공포·불안 등 정서 반응 처리, 위협을 빠르게 알아챔", "정서가 담긴 기억의 평가", "‘투쟁–도피’ 반응을 일으키는 시작점 중 하나"],
      links: ["hippocampus", "hypothalamus"]
    },
    midbrain: {
      name: "중간뇌", en: "Midbrain (Mesencephalon)", level: "core",
      where: "간뇌 바로 아래, 뇌줄기의 맨 위",
      etym: {
        ko: "中間(가운데 중, 사이 간)+腦 → ‘가운데 뇌’",
        en: "그리스어 mesos(가운데)+enkephalos(뇌) → mesencephalon = ‘중간뇌’",
        memo: "뇌줄기 셋 중 맨 위, 이름 그대로 가운데 높이의 뇌"
      },
      role: ["동공 반사(밝기에 따라 동공 크기 조절)의 중추", "안구(눈동자) 운동", "소뇌와 함께 몸의 자세 유지에 관여"],
      exam: "동공 반사 중추=중간뇌, 무릎 반사 중추=척수, 호흡·심장 박동=연수, 체온 조절=시상 하부.",
      links: ["thalamus", "pons"]
    },
    pons: {
      name: "뇌교", en: "Pons", level: "ref",
      where: "중간뇌와 연수 사이 불룩한 부분, 소뇌 앞",
      etym: {
        ko: "腦(뇌 뇌)+橋(다리 교) → ‘뇌의 다리’",
        en: "라틴어 pons = 다리(bridge). 좌우 소뇌를 가로로 잇는 신경 섬유가 다리처럼 보임(16세기 해부학자 바롤리오가 pons Varolii라 부름)",
        memo: "pons = 다리(bridge, pontoon). 대뇌와 소뇌 사이를 이어 주는 다리"
      },
      role: ["대뇌와 소뇌 사이의 신호 중계", "연수와 함께 호흡 리듬 조절을 돕고, 얼굴의 감각·운동에 관여"],
      links: ["cerebellum", "midbrain", "medulla"]
    },
    medulla: {
      name: "연수", en: "Medulla oblongata", level: "core",
      where: "뇌줄기의 맨 아래, 척수와 이어지는 부분",
      etym: {
        ko: "延(늘일 연)+髓(골수 수) → ‘길게 늘어난 골수(속)’",
        en: "라틴어 medulla(골수·속)+oblongata(길쭉하게 늘인) → ‘길쭉한 속’. 연수=oblongata를 그대로 옮긴 말",
        memo: "척수 위로 ‘늘어나(延)’ 이어진 부분 — 생명 유지의 맨 아래 기지"
      },
      role: ["호흡 운동·심장 박동·혈압 조절의 중추", "기침·재채기·삼킴·구토 같은 반사의 중추", "부교감 신경의 일부가 이곳에서 나옴"],
      exam: "연수=호흡·심장 박동·소화 운동 조절. 부교감 신경은 중간뇌·연수·척수의 아래쪽(천수)에서, 교감 신경은 척수의 가운데(흉수·요수)에서 나옵니다.",
      links: ["spinal_cord", "pons", "hypothalamus"]
    },
    spinal_cord: {
      name: "척수", en: "Spinal cord", level: "core",
      where: "연수에서 이어져 등뼈(척추) 속을 지나는 굵은 줄",
      etym: {
        ko: "脊(등마루 척)+髓(골수 수) → ‘등뼈 속의 골수 같은 신경 조직’",
        en: "라틴어 medulla spinalis = ‘등뼈의 속’. spinal은 spina(가시, 등뼈)에서 온 말",
        memo: "등뼈(脊) 속에 들어 있는 속(髓) — 뼈 속 골수처럼 보여 붙은 이름"
      },
      role: ["뇌와 몸 사이 흥분을 전달하는 통로", "무릎 반사·회피 반사 같은 척수 반사의 중추(대뇌를 거치지 않아 빠름)", "속은 회색질(세포체), 겉은 백색질(축삭)"],
      exam: "척수 단면에서 감각 뉴런은 뒤쪽(후근)으로 들어오고, 운동 뉴런은 앞쪽(전근)으로 나갑니다. 겉이 백색질·속이 회색질(대뇌와 반대).",
      links: ["medulla"]
    },

    /* ── 내분비 샘 ── */
    thyroid: {
      name: "갑상샘", en: "Thyroid gland", level: "core",
      where: "목 앞쪽, 숨관(기관) 앞에 나비 모양",
      etym: {
        ko: "甲(갑옷 갑)+狀(모양 상)+腺(샘 선) → ‘갑옷(방패) 모양 샘’ (갑상선의 우리말 순화)",
        en: "그리스어 thyreos(방패)+eidos(모양) → thyreoeides = ‘방패 모양’. 샘 앞의 방패 모양 갑상 연골(목울대)에서 따옴",
        memo: "목울대(방패 모양 연골) 바로 아래의 방패 → 갑상. 이름에 ‘방패’가 들어 있음"
      },
      role: ["티록신을 분비해 세포 호흡(물질대사)을 촉진 → 열 발생·체온 유지", "칼시토닌을 분비해 혈중 칼슘 농도를 낮춤", "재료로 요오드(I)가 필요 — 부족하면 갑상샘이 붓는 ‘갑상샘종’"],
      exam: "티록신 ↑ → 시상 하부·뇌하수체 전엽의 TRH·TSH 분비 ↓ (음성 피드백). 갑상샘 호르몬이 부족해도 TSH가 오히려 많아지는 이유입니다.",
      hormones: [{ label: "", keys: ["t4", "calcitonin"] }],
      links: ["pituitary"]
    },
    parathyroid: {
      name: "부갑상샘", en: "Parathyroid glands", level: "ref",
      where: "갑상샘 뒷면에 붙은 쌀알만 한 샘 4개",
      etym: {
        ko: "副(곁 부)+甲狀腺 → ‘갑상샘 곁에 딸린 샘’",
        en: "그리스어 para-(곁에)+thyroid → ‘갑상샘 옆’",
        memo: "para-는 ‘곁에’ (parallel=나란히, paramedic=의사 곁에). 갑상샘 곁이라 부갑상샘"
      },
      role: ["파라토르몬(PTH)으로 혈중 칼슘(Ca²⁺) 농도를 높임", "갑상샘의 칼시토닌과 반대로 작용해 칼슘 농도를 조절"],
      hormones: [{ label: "", keys: ["pth"] }],
      links: ["thyroid"]
    },
    thymus: {
      name: "가슴샘", en: "Thymus", level: "ref",
      where: "가슴뼈 뒤, 심장 위쪽 (사춘기 이후 점점 작아짐)",
      etym: {
        ko: "胸(가슴 흉)+腺(샘 선) → ‘가슴에 있는 샘’ (흉선)",
        en: "그리스어 thymos에서 왔다는 설(생명력·기운)과 백리향(thyme) 꽃봉오리를 닮아서라는 설이 있음",
        memo: "가슴(胸) 속의 샘 — T 림프구(T는 Thymus의 T)가 이곳에서 성숙한다"
      },
      role: ["T 림프구가 성숙하는 곳(면역 단원과 연결)", "티모신을 분비해 T 림프구의 분화를 도움", "어릴 때 크고 사춘기 이후 퇴화"],
      hormones: [{ label: "", keys: ["thymosin"] }],
      links: []
    },
    adrenal: {
      name: "부신", en: "Adrenal gland", level: "core",
      where: "좌우 콩팥 위에 얹힌 삼각 모자 모양 (겉 피질, 속 수질)",
      etym: {
        ko: "副(곁 부)+腎(콩팥 신) → ‘콩팥에 딸린 것’. 髓質=속질, 皮質=껍질",
        en: "adrenal = ad-(곁에)+renal(콩팥, 라틴어 renes). 같은 뜻의 그리스어 판 epinephros(epi 위+nephros 콩팥)가 에피네프린의 어원",
        memo: "콩팥 위에 올라앉은 샘 — 영어(adrenal)와 그리스어(epinephrine)가 모두 ‘콩팥 곁·위’라는 뜻"
      },
      role: ["수질: 에피네프린·노르에피네프린 — 교감 신경의 자극으로 분비", "피질: 코르티솔(당질 코르티코이드)과 알도스테론(무기질 코르티코이드)", "‘위기 대응(스트레스)’ 샘"],
      exam: "부신 수질 호르몬(에피네프린)은 신경(교감 신경)의 직접 자극으로 분비되고, 부신 피질은 뇌하수체 ACTH의 지배를 받습니다.",
      hormones: [
        { label: "수질", keys: ["epi"] },
        { label: "피질", keys: ["cortisol", "aldosterone"] }
      ],
      links: ["pituitary", "hypothalamus"]
    },
    pancreas: {
      name: "이자", en: "Pancreas", level: "core",
      where: "위 뒤쪽 윗배, 십이지장 옆으로 길게 누운 샘",
      etym: {
        ko: "한자어 췌장(膵臟), 우리말 ‘이자’. 소화액을 만드는 외분비샘이기도 하고, 호르몬을 만드는 내분비샘이기도 한 ‘혼합 샘’",
        en: "그리스어 pan(모두)+kreas(살·고기) → ‘온통 살로 된 것’. 뼈나 연골 없이 부드러운 살덩이로 보여서. 호르몬은 ‘랑게르한스섬’의 세포들이 만듦",
        memo: "호르몬 세포가 바다의 섬처럼 흩어진 ‘랑게르한스섬’에서 인슐린(insulin=섬의 물질)이 나온다"
      },
      role: ["랑게르한스섬의 α세포=글루카곤(혈당↑), β세포=인슐린(혈당↓)", "δ세포=소마토스타틴(인슐린·글루카곤 분비 억제)", "소화 효소를 십이지장으로 내보내는 외분비 기능도 겸함"],
      exam: "혈당 조절의 두 호르몬을 가장 많이 묻습니다. 식후 혈당↑ → 인슐린↑, 공복 혈당↓ → 글루카곤↑. 당뇨병: 1형=β세포 파괴로 인슐린 부족, 2형=표적 세포의 인슐린 반응 저하.",
      hormones: [
        { label: "α세포", keys: ["glucagon"] },
        { label: "β세포", keys: ["insulin"] },
        { label: "δ세포", keys: ["somatostatin"] }
      ],
      links: ["liver"]
    },
    ovary: {
      name: "난소", en: "Ovary", level: "ref",
      where: "여성의 아랫배 좌우, 자궁 양옆",
      etym: {
        ko: "卵(알 란)+巢(둥지 소) → ‘알의 둥지’",
        en: "라틴어 ovum(알)+-arium(~하는 곳) → ‘알이 있는 곳’",
        memo: "ovum(난자)+장소 = ovary — 난자를 품은 ‘알 둥지’"
      },
      role: ["난자를 만들어 배란함", "에스트로젠(난포)과 프로제스테론(황체)을 분비", "월경 주기·임신 유지에 관여"],
      hormones: [{ label: "", keys: ["estrogen", "progesterone"] }],
      links: ["pituitary"]
    },
    testis: {
      name: "정소", en: "Testis", level: "ref",
      where: "남성의 음낭 속 좌우 한 쌍 (고환)",
      etym: {
        ko: "精(정수 정)+巢(둥지 소) → ‘정자의 둥지’ (고환=睾丸)",
        en: "라틴어 testis(고환). 정자를 만드는 곳이라는 뜻의 우리말 정소와 짝",
        memo: "난소=알 둥지(卵巢), 정소=정자 둥지(精巢) — 한 글자만 다름"
      },
      role: ["정자를 만듦", "테스토스테론을 분비해 남성의 2차 성징 발현·정자 형성 촉진"],
      hormones: [{ label: "", keys: ["testosterone"] }],
      links: ["pituitary"]
    }
  },

  /* ───────── 호르몬 ───────── */
  hormones: {
    rh: {
      name: "방출 호르몬·억제 호르몬", abbr: "TRH 등", en: "Releasing / inhibiting hormones", level: "core",
      from: "hypothalamus",
      etym: {
        ko: "放出(내보낼 방, 날 출)=내보내게 함, 抑制(누를 억, 억제할 제)=눌러 막음",
        en: "TRH = Thyrotropin-Releasing Hormone: thyro(갑상샘)+tropin(~로 향하게 하는 것)+releasing",
        memo: "‘시상 하부가 뇌하수체에게 분비를 시키거나(방출) 못 하게(억제) 하는 호르몬’"
      },
      effect: "뇌하수체 전엽에서 각 호르몬이 분비되도록 촉진(방출 호르몬)하거나 막음(억제 호르몬). 예: TRH → TSH 분비 촉진.",
      when: "혈중 티록신 농도가 낮아질 때(TRH↑), 추위 자극을 받을 때",
      targets: ["pituitary"]
    },
    gh: {
      name: "생장 호르몬", abbr: "GH", en: "Growth hormone (somatotropin)", level: "core",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "生長(날 생, 길 장)=나서 자람",
        en: "somatotropin = soma(몸)+tropin(~를 향하게 하는 것) → ‘몸을 키우는 호르몬’",
        memo: "생장 = 자라남 → 뼈와 근육이 쑥쑥 자라게 한다"
      },
      effect: "뼈와 연골의 성장 촉진, 단백질 합성 촉진. 과다: 성장기엔 거인증, 성인엔 말단 비대증. 결핍: 소인증(왜소증).",
      when: "깊은 잠을 잘 때, 운동할 때, 혈당이 낮을 때",
      targets: ["bone", "muscle", "liver"]
    },
    tsh: {
      name: "갑상샘 자극 호르몬", abbr: "TSH", en: "Thyroid-stimulating hormone", level: "core",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "甲狀腺(갑상샘)+刺戟(찌를 자, 창 극)=자극",
        en: "Thyroid + Stimulating + Hormone 의 머리글자",
        memo: "이름이 곧 기능: 갑상샘을 자극하는 호르몬"
      },
      effect: "갑상샘이 티록신을 만들어 분비하도록 자극.",
      when: "TRH 분비 증가 시, 혈중 티록신이 낮을 때",
      targets: ["thyroid"]
    },
    acth: {
      name: "부신 피질 자극 호르몬", abbr: "ACTH", en: "Adrenocorticotropic hormone", level: "ref",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "副腎(부신)+皮質(피질)+刺戟 → 부신 껍질을 자극",
        en: "adreno(부신)+cortico(피질)+tropic(~로 향하는: 그리스어 trope ‘방향 돌림’)+hormone",
        memo: "-tropic = ‘~를 향하는’ → 부신피질을 향해 가서 일하라고 하는 호르몬"
      },
      effect: "부신 피질에서 코르티솔 등 코르티코이드 분비를 촉진.",
      when: "스트레스를 받을 때(CRH ↑)",
      targets: ["adrenal"]
    },
    fsh: {
      name: "난포 자극 호르몬", abbr: "FSH", en: "Follicle-stimulating hormone", level: "ref",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "卵胞(알 란, 주머니 포)=난자를 싼 주머니",
        en: "follicle: 라틴어 folliculus = ‘작은 주머니’ (follis 풀무·가죽 주머니+-culus 작은 것)",
        memo: "난포(작은 알 주머니)를 자극해 키우는 호르몬"
      },
      effect: "여성: 난소에서 난포 성숙 촉진. 남성: 정소에서 정자 형성 촉진.",
      when: "생식 주기, 사춘기",
      targets: ["gonad"]
    },
    lh: {
      name: "황체 형성 호르몬", abbr: "LH", en: "Luteinizing hormone", level: "ref",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "黃體(누를 황, 몸 체)=‘노란 몸’",
        en: "라틴어 luteus = 노란색. 배란 뒤 난포가 노란 황체(corpus luteum)로 변하는 데서",
        memo: "황체(노란 몸)를 만드는(-ize) 호르몬 — 배란을 일으키고 황체를 형성"
      },
      effect: "여성: 배란 유발, 황체 형성. 남성: 정소의 테스토스테론 분비 촉진.",
      when: "배란 직전의 급증(LH 급증), 사춘기",
      targets: ["gonad"]
    },
    prl: {
      name: "프로락틴", abbr: "PRL", en: "Prolactin", level: "ref",
      from: "pituitary", group: "전엽",
      etym: {
        ko: "‘젖 분비를 위한 호르몬’",
        en: "라틴어 pro-(위하여)+lac(젖, lactis) → lactose(젖당), lactic acid(젖산)와 같은 뿌리",
        memo: "lact-는 ‘젖’ — 젖산·젖당·락토 모두 같은 뿌리. 젖을 만드는 호르몬"
      },
      effect: "분만 후 젖샘(유선)에서 젖 생성 촉진.",
      when: "아기가 젖을 빨 때, 임신 말기~수유기",
      targets: ["breast"]
    },
    adh: {
      name: "항이뇨 호르몬", abbr: "ADH", en: "Antidiuretic hormone (vasopressin)", level: "core",
      from: "pituitary", group: "후엽",
      etym: {
        ko: "抗(막을 항)+利尿(이로울 리, 오줌 뇨) → 利尿=오줌을 잘 나오게 함. 즉 ‘오줌이 쏟아지는 것에 맞서는 호르몬’",
        en: "anti-(반대)+diuresis(dia 통과해+ouron 오줌 → 오줌이 쏟아져 나옴). 다른 이름 vasopressin = vaso(혈관)+press(누르다) → 혈관을 수축시켜 혈압을 올림",
        memo: "항이뇨 = 오줌을 막는다 → 물을 몸에 붙잡아 둔다 → 오줌이 줄고 진해짐"
      },
      effect: "콩팥(집합관)에서 물의 재흡수를 촉진 → 오줌량 ↓·오줌 농도 ↑, 혈장 삼투압 ↓. 결핍되면 요붕증(오줌이 아주 많이 나옴).",
      when: "혈장 삼투압이 높아질 때(땀을 많이 흘림, 짠 음식, 물 부족), 혈압이 크게 떨어질 때",
      targets: ["kidney"]
    },
    oxt: {
      name: "옥시토신", abbr: "OXT", en: "Oxytocin", level: "ref",
      from: "pituitary", group: "후엽",
      etym: {
        ko: "‘빠른 출산’",
        en: "그리스어 oxys(빠른)+tokos(출산) → ‘빠른 분만’. 분만을 촉진해 붙은 이름",
        memo: "oxy-는 ‘빠른·날카로운’, toko-는 ‘출산’ → 분만을 빠르게 하는 호르몬"
      },
      effect: "분만 때 자궁 수축 촉진, 수유 때 젖이 나오게 함(젖 사출 반사). 자궁이 늘어날수록 분비가 더 늘어나는 양성 피드백의 예.",
      when: "분만, 아기가 젖을 빨 때",
      targets: ["uterus", "breast"]
    },
    t4: {
      name: "티록신", abbr: "T₄ (T₃)", en: "Thyroxine", level: "core",
      from: "thyroid",
      etym: {
        ko: "‘갑상샘(thyroid)에서 만든 물질’. T₄=요오드 원자 4개가 붙은 호르몬, T₃=3개",
        en: "thyroid+-in. 이름의 숫자는 구조 속 요오드(iodine) 원자의 개수를 가리킴",
        memo: "T₄의 4 = 요오드 4개. 요오드가 모자라면 티록신을 못 만들어 갑상샘이 붓는다"
      },
      effect: "세포 호흡(물질대사) 촉진 → 열 발생 증가, 체온 유지. 과다: 갑상샘 기능 항진증(맥박↑·체중↓·더위 못 참음). 부족: 기능 저하증(피로·추위 탐·체중↑).",
      when: "추울 때(TRH→TSH 경로), 혈중 티록신이 낮을 때",
      targets: ["all"]
    },
    calcitonin: {
      name: "칼시토닌", abbr: "", en: "Calcitonin", level: "ref",
      from: "thyroid",
      etym: {
        ko: "‘칼슘 농도를 내리는 호르몬’",
        en: "calci(칼슘)+-tonin. 혈중 칼슘 농도를 조율(tone)하는 물질이라는 뜻",
        memo: "칼시(칼슘) + 토닌: 칼슘을 ‘톤 다운’ — 혈중 칼슘이 많을 때 분비"
      },
      effect: "혈중 칼슘(Ca²⁺) 농도를 낮춤 — 뼈에 칼슘이 쌓이도록 도움.",
      when: "혈중 Ca²⁺ 농도가 높을 때",
      targets: ["bone"]
    },
    pth: {
      name: "파라토르몬", abbr: "PTH", en: "Parathyroid hormone", level: "ref",
      from: "parathyroid",
      etym: {
        ko: "副甲狀腺 호르몬(부갑상샘 호르몬)",
        en: "para-(곁에)+thyroid+hormone → ‘갑상샘 곁 샘의 호르몬’",
        memo: "칼시토닌(칼슘↓)과 짝을 이루는 반대 호르몬: PTH는 칼슘↑"
      },
      effect: "혈중 칼슘(Ca²⁺) 농도를 높임 — 뼈에서 칼슘 방출, 콩팥에서 재흡수, 장에서 흡수 증가.",
      when: "혈중 Ca²⁺ 농도가 낮을 때",
      targets: ["bone", "kidney", "gut"]
    },
    thymosin: {
      name: "티모신", abbr: "", en: "Thymosin", level: "ref",
      from: "thymus",
      etym: {
        ko: "가슴샘(thymus)에서 만든 물질",
        en: "thymus+-in",
        memo: "T 림프구의 T = Thymus. 티모신은 T 림프구를 키우는 호르몬"
      },
      effect: "T 림프구의 성숙·분화를 도와 면역에 관여.",
      when: "어린 시절에 활발, 사춘기 이후 감소",
      targets: ["all"]
    },
    epi: {
      name: "에피네프린", abbr: "(아드레날린)", en: "Epinephrine (Adrenaline)", level: "core",
      from: "adrenal", group: "수질",
      etym: {
        ko: "‘콩팥 위의 물질’ (같은 뜻의 라틴어 판이 아드레날린)",
        en: "epi-(위)+nephros(콩팥, 그리스어) = epinephrine. ad-(곁)+renal(콩팥, 라틴어) = adrenaline. 부신(adrenal)이 콩팥 위·곁에 있어서",
        memo: "에피네프린 = 아드레날린. 두 이름 모두 ‘콩팥 위(곁)’라는 뜻 — 나라마다 쓰는 언어만 다름"
      },
      effect: "심장 박동·혈압 상승, 간의 글리코젠 분해로 혈당 증가, 기관지 확장, 소화 운동 억제 — ‘투쟁–도피’ 반응.",
      when: "긴장·흥분·위험을 느낄 때 (교감 신경 자극)",
      targets: ["heart", "liver", "muscle"]
    },
    cortisol: {
      name: "코르티솔", abbr: "(당질 코르티코이드)", en: "Cortisol", level: "ref",
      from: "adrenal", group: "피질",
      etym: {
        ko: "皮質(피질=껍질)에서 만든 물질",
        en: "cortex(라틴어 ‘나무껍질’, 겉질)+-ol. 부신 겉질에서 만들어서",
        memo: "cortex(겉질)에서 나온 -ol — 오래 계속되는 스트레스에 대응하는 호르몬"
      },
      effect: "단백질·지방을 분해해 혈당 증가, 염증·면역 반응 억제. 장기 스트레스 대응.",
      when: "스트레스(CRH→ACTH 경로), 아침 무렵 분비 증가",
      targets: ["liver", "muscle"]
    },
    aldosterone: {
      name: "알도스테론", abbr: "(무기질 코르티코이드)", en: "Aldosterone", level: "ref",
      from: "adrenal", group: "피질",
      etym: {
        ko: "‘무기질(소금) 코르티코이드’ 중 대표",
        en: "aldehyde기를 가진 steroid → aldo+sterone. 무기질(Na⁺·K⁺) 균형에 관여",
        memo: "암기용: 알도스테론은 소금(Na⁺)을 ‘아끼는’ 호르몬 — 콩팥에서 Na⁺ 재흡수"
      },
      effect: "콩팥(세뇨관)에서 Na⁺ 재흡수·K⁺ 배설 촉진 → 체액량과 혈압 유지.",
      when: "혈중 Na⁺이 낮거나 혈압이 떨어질 때",
      targets: ["kidney"]
    },
    glucagon: {
      name: "글루카곤", abbr: "", en: "Glucagon", level: "core",
      from: "pancreas", group: "α세포",
      etym: {
        ko: "‘포도당(glucose)을 불러내는 호르몬’",
        en: "1923년 처음 붙인 이름은 glucose agonist(포도당 작용제) → gluco+agon. 포도당 농도를 올리는 쪽으로 이끈다는 뜻",
        memo: "gluco = 포도당, -agon = 이끌다 → 포도당을 ‘꺼내 오는’ 호르몬(혈당 ↑)"
      },
      effect: "간에서 글리코젠을 포도당으로 분해하게 해 혈당 증가.",
      when: "공복·혈당이 낮을 때",
      targets: ["liver"]
    },
    insulin: {
      name: "인슐린", abbr: "", en: "Insulin", level: "core",
      from: "pancreas", group: "β세포",
      etym: {
        ko: "이자 속 호르몬 세포 무리를 ‘섬’에 비유한 랑게르한스섬에서 나온 물질",
        en: "라틴어 insula = 섬 (island) → 이자의 ‘랑게르한스섬(islets of Langerhans)’에서 분비되는 물질",
        memo: "insula = 섬. 인슐린 = ‘섬의 호르몬’. 혈당을 낮추는 유일한 호르몬이라 기억"
      },
      effect: "세포의 포도당 흡수 촉진, 간·근육에서 포도당 → 글리코젠 합성 촉진 → 혈당 감소. 부족·무반응: 당뇨병.",
      when: "식사 후 혈당이 높아질 때",
      targets: ["liver", "muscle"]
    },
    somatostatin: {
      name: "소마토스타틴", abbr: "", en: "Somatostatin", level: "ref",
      from: "pancreas", group: "δ세포",
      etym: {
        ko: "‘몸(성장)을 멈추게 하는 물질’",
        en: "soma(몸)+stat(그리스어 statos ‘멈춰 선’) → 처음엔 생장 호르몬 분비를 막는 물질로 발견됨",
        memo: "stat = 멈춤 (statue 조각상, static 정지). 호르몬 분비에 브레이크를 거는 호르몬"
      },
      effect: "인슐린·글루카곤 분비를 억제(이자 안에서 브레이크 역할).",
      when: "식사 후 영양소가 흡수될 때",
      targets: ["pancreas"]
    },
    estrogen: {
      name: "에스트로젠", abbr: "", en: "Estrogen", level: "ref",
      from: "ovary",
      etym: {
        ko: "‘발정(암컷의 생식 주기)을 일으키는 물질’",
        en: "그리스어 oistros(말파리·광기) → estrus(발정)+-gen(만들어 내다)",
        memo: "-gen = ‘만들어 내다’ (oxygen=산소를 만듦). estro-는 발정 → 여성 주기를 만드는 호르몬"
      },
      effect: "자궁 내막 증식, 여성의 2차 성징 발현, 뼈 밀도 유지.",
      when: "난포가 자라는 시기, 사춘기 이후",
      targets: ["uterus", "breast", "bone"]
    },
    progesterone: {
      name: "프로제스테론", abbr: "", en: "Progesterone", level: "ref",
      from: "ovary",
      etym: {
        ko: "‘임신을 위한 호르몬’",
        en: "pro-(위하여)+gestation(임신)+-sterone(스테로이드계 호르몬 어미) → 임신을 지속시키는 스테로이드",
        memo: "gest-는 ‘임신’ (gestation). 임신 유지를 돕는 호르몬 — 자궁 내막을 유지"
      },
      effect: "자궁 내막 유지, 임신 유지, 배란 억제.",
      when: "배란 후 황체가 형성된 뒤, 임신기",
      targets: ["uterus", "breast"]
    },
    testosterone: {
      name: "테스토스테론", abbr: "", en: "Testosterone", level: "ref",
      from: "testis",
      etym: {
        ko: "‘정소(고환)에서 나오는 스테로이드’",
        en: "testis(고환)+sterol(스테롤)+-one(케톤 어미)",
        memo: "test(is)+sterone: 정소에서 만든 스테로이드 — 이름에 장소가 들어 있음"
      },
      effect: "남성의 2차 성징(목소리·체모·근육) 발현, 정자 형성 촉진, 근육·뼈 발달.",
      when: "사춘기 이후, LH 자극을 받을 때",
      targets: ["muscle", "bone"]
    },
    melatonin: {
      name: "멜라토닌", abbr: "", en: "Melatonin", level: "ref",
      from: "pineal",
      etym: {
        ko: "‘검은 색소 + 세로토닌’",
        en: "melan(그리스어 melas ‘검은’, 멜라닌)+(sero)tonin. 개구리 피부 색소 세포에 작용하는 물질로 발견됐고, 세로토닌에서 만들어짐",
        memo: "멜라닌의 melan + 세로토닌 → 어두워질 때 나오는 밤의 호르몬"
      },
      effect: "졸음을 유도하고 수면–각성 리듬(일주기 리듬)을 맞춤.",
      when: "어두울 때 분비 증가(밤), 밝은 빛에는 감소",
      targets: ["brain"]
    }
  },

  /* ───────── 영상 시나리오: 부위를 차례로 불 켜며 설명 ───────── */
  scenarios: {
    brain: [
      {
        id: "knee", title: "무릎 반사 — 대뇌 없이 척수에서",
        steps: [
          { view: "mid", key: "spinal_cord", text: "① 고무망치로 무릎 아래 힘줄을 치면 허벅지 근육이 갑자기 늘어나고, 이를 느낀 감각 뉴런이 흥분을 척수로 보냅니다." },
          { view: "mid", key: "spinal_cord", text: "② 척수(반사 중추)에서 감각 뉴런이 운동 뉴런으로 바로 이어집니다. 대뇌를 거치지 않아 반응이 아주 빠릅니다." },
          { view: "mid", key: "spinal_cord", text: "③ 운동 뉴런이 허벅지 근육을 수축시켜 다리가 튀어 오릅니다. 여기서 ‘생각’은 필요 없습니다." },
          { view: "mid", key: "medulla", text: "④ 같은 순간 감각 정보는 척수를 타고 올라가 연수를 지나가고," },
          { view: "mid", key: "thalamus", text: "⑤ 시상에서 중계되어," },
          { view: "mid", key: "cerebrum", text: "⑥ 대뇌에 도착해서야 ‘무릎을 쳤구나’ 하고 알게 됩니다. 인식은 다리가 움직인 뒤입니다." }
        ]
      },
      {
        id: "pupil", title: "동공 반사 — 밝은 빛이 들어올 때",
        steps: [
          { view: "mid", key: "midbrain", text: "① 밝은 빛이 망막을 자극하면 시각 신경이 이 신호를 중간뇌로 보냅니다." },
          { view: "mid", key: "midbrain", text: "② 중간뇌(동공 반사 중추)가 부교감 신경을 통해 홍채 근육을 수축시켜 동공이 작아집니다. 어두울 땐 교감 신경이 우세해 동공이 커집니다." },
          { view: "mid", key: "thalamus", text: "③ 한편 시각 정보는 시상을 거쳐" },
          { view: "mid", key: "cerebrum", text: "④ 대뇌(후두엽 쪽)에서 ‘밝다’고 인식됩니다. 반사(중간뇌)와 인식(대뇌)은 따로 일어납니다." }
        ]
      },
      {
        id: "hear", title: "소리를 듣고 대답하기",
        steps: [
          { view: "side", key: "temporal", text: "① 귀로 들어온 소리가 측두엽의 청각 피질에 도착하고, 베르니케 영역에서 말의 뜻을 이해합니다." },
          { view: "side", key: "frontal", text: "② 전두엽이 어떻게 대답할지 판단하고 문장을 만듭니다(브로카 영역)." },
          { view: "side", key: "frontal", text: "③ 전두엽의 운동 피질이 입·혀·후두 근육에 움직이라는 명령을 내립니다." },
          { view: "side", key: "cerebellum", text: "④ 소뇌가 근육의 움직임을 다듬어 발음이 매끄럽게 나오도록 협응시킵니다." },
          { view: "side", key: "brainstem", text: "⑤ 명령은 뇌줄기와 척수를 지나 말초 신경을 따라 근육에 닿고, 대답이 소리로 나옵니다." }
        ]
      },
      {
        id: "heat", title: "더운 곳에서 체온 조절",
        steps: [
          { view: "mid", key: "hypothalamus", text: "① 몸이 더워져 혈액 온도가 올라가면 시상 하부(체온 조절 중추)가 이를 감지합니다." },
          { view: "mid", key: "hypothalamus", text: "② 시상 하부가 자율 신경(교감 신경)을 통해 땀샘에서 땀을 내고, 피부 혈관을 확장하라고 명령합니다. 열 발산량이 늘어납니다." },
          { view: "mid", key: "medulla", text: "③ 명령은 뇌줄기와 척수를 거쳐 몸 곳곳의 자율 신경으로 내려갑니다." },
          { view: "mid", key: "hypothalamus", text: "④ 체온이 내려오면 시상 하부가 명령을 줄입니다. 결과가 원인을 줄이는 음성 피드백입니다." }
        ]
      }
    ],
    endo: [
      {
        id: "glucose", title: "식후 혈당 조절 — 인슐린과 글루카곤",
        steps: [
          { gland: "pancreas", hormone: "insulin", text: "① 식사 후 혈당이 높아지면 이자의 β세포가 인슐린을 분비합니다." },
          { gland: "pancreas", hormone: "insulin", text: "② 인슐린이 혈액을 타고 간과 근육에 가서 포도당 흡수와 글리코젠 합성을 촉진 → 혈당이 내려갑니다." },
          { gland: "pancreas", hormone: "glucagon", text: "③ 반대로 공복에 혈당이 낮아지면 α세포가 글루카곤을 분비해 간의 글리코젠을 포도당으로 분해시킵니다 → 혈당이 올라갑니다." },
          { gland: "pancreas", hormone: null, text: "④ 두 호르몬이 반대 방향으로 일하며 혈당을 일정하게 유지합니다. ‘결과가 원인을 줄이는’ 음성 피드백입니다." }
        ]
      },
      {
        id: "danger", title: "위기 상황 — 에피네프린과 코르티솔",
        steps: [
          { gland: "hypothalamus", hormone: null, text: "① 위험을 느끼면 시상 하부가 교감 신경을 활성화합니다." },
          { gland: "adrenal", hormone: "epi", text: "② 교감 신경의 직접 자극으로 부신 수질이 에피네프린을 분비합니다. 심장 박동·혈압·혈당이 순식간에 올라갑니다(투쟁–도피 반응)." },
          { gland: "hypothalamus", hormone: "rh", text: "③ 스트레스가 오래가면 시상 하부가 방출 호르몬(CRH)을 분비해" },
          { gland: "pituitary", hormone: "acth", text: "④ 뇌하수체 전엽의 ACTH 분비를 촉진하고," },
          { gland: "adrenal", hormone: "cortisol", text: "⑤ ACTH가 부신 피질을 자극해 코르티솔을 분비하게 합니다. 혈당을 올리고 염증을 줄여 장기 스트레스에 대응합니다." }
        ]
      },
      {
        id: "cold", title: "추울 때 — 티록신 분비와 되먹임",
        steps: [
          { gland: "hypothalamus", hormone: "rh", text: "① 추위를 느끼면 시상 하부가 TRH(방출 호르몬)를 분비합니다." },
          { gland: "pituitary", hormone: "tsh", text: "② TRH가 뇌하수체 전엽을 자극해 TSH를 분비하게 합니다." },
          { gland: "thyroid", hormone: "t4", text: "③ TSH가 갑상샘을 자극해 티록신이 분비되고, 티록신이 온몸 세포의 세포 호흡을 촉진해 열이 늘어납니다." },
          { gland: "thyroid", hormone: null, text: "④ 혈중 티록신이 충분해지면 시상 하부와 뇌하수체 전엽의 분비를 억제합니다. 결과가 원인을 줄이는 음성 피드백입니다." }
        ]
      },
      {
        id: "water", title: "땀을 많이 흘린 뒤 — ADH",
        steps: [
          { gland: "hypothalamus", hormone: null, text: "① 땀을 많이 흘려 혈장 삼투압이 높아지면 시상 하부가 이를 감지합니다. ADH는 시상 하부의 신경 세포에서 만들어집니다." },
          { gland: "pituitary", hormone: "adh", text: "② ADH가 뇌하수체 후엽에서 혈액으로 분비되어 콩팥으로 갑니다." },
          { gland: "pituitary", hormone: "adh", text: "③ 콩팥에서 물의 재흡수가 늘어 오줌량이 줄고 오줌이 진해집니다. 혈장 삼투압이 내려갑니다." },
          { gland: "hypothalamus", hormone: null, text: "④ 삼투압이 정상으로 돌아오면 ADH 분비가 줄어듭니다. 음성 피드백입니다." }
        ]
      }
    ]
  }
};
