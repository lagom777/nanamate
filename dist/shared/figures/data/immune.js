/* 특이적 방어 작용(면역 반응) 그림 글 자료 — 반응 흐름 / 1차·2차 면역 반응 그래프. */
NMFIG.data('immune', {
  title: '특이적 방어 작용 — 면역 반응의 흐름',
  lead: '세포나 구조에 마우스를 올려 보세요(휴대폰은 누르기). 이름의 뜻과 면역에서 하는 일이 나옵니다.',
  idle: '‘반응 흐름’에서는 병원체가 들어온 뒤 어떤 세포가 어떤 순서로 일하는지, ‘1차·2차 반응’에서는 같은 항원이 다시 들어올 때 왜 훨씬 빠르고 강한지 볼 수 있습니다.',
  order: [
    'antigen', 'macrophage', 'presentation', 'helper_t', 'b_cell', 'plasma', 'antibody', 'memory', 'killer_t', 'infected', 'humoral', 'cellular',
    'primary', 'latent', 'secondary'
  ],
  parts: {
    /* ───────── 반응 흐름 ───────── */
    antigen: {
      name: '항원', en: 'Antigen', level: 'core', view: 'flow',
      where: '병원체 표면 등에 있는, 면역 반응을 일으키는 물질',
      etym: {
        ko: '抗原(막을 항, 근원 원) → ‘항체를 일으키는 근원’',
        en: 'antigen = antibody generator(항체를 만드는 것). anti(반대)+gen(만들어 냄)',
        memo: '항체(antibody)를 generate(만들어 내게) 하는 것 → anti-gen'
      },
      role: ['특이적 방어에서 림프구가 인식하는 대상(병원체의 단백질 등)', '병원체 한 마리에 항원이 여러 종류 있을 수 있다'],
      exam: '항원은 항체가 결합하는 대상이고, 백신으로 주입하는 것도 항원(약화·사멸 병원체)입니다.',
      links: ['macrophage', 'antibody', 'b_cell']
    },
    macrophage: {
      name: '대식세포', en: 'Macrophage', level: 'core', view: 'flow',
      where: '병원체를 삼켜 분해하는 큰 식세포. 비특이적 방어이면서 특이적 방어의 시작',
      etym: {
        ko: '大食細胞(큰 대, 먹을 식, 가는 세, 세포 포) → ‘크게 먹는 세포’',
        en: '그리스어 makros(큰)+phagein(먹다)+kytos(세포)',
        memo: 'macro(큰)+phage(먹는 것) → ‘큰 먹보 세포’. 식균 작용으로 삼킨 뒤 항원 조각을 겉에 내보인다'
      },
      role: ['식균 작용으로 병원체를 삼켜 분해한다 (비특이적 방어)', '분해한 항원 조각을 세포 표면에 제시해 보조 T 림프구에 알린다 (특이적 방어의 시작)'],
      exam: '식균 작용은 비특이적 방어입니다. 그러나 항원 제시를 통해 특이적 방어를 시작시킵니다.',
      links: ['antigen', 'presentation', 'helper_t']
    },
    presentation: {
      name: '항원 제시', en: 'Antigen presentation', level: 'core', view: 'flow',
      where: '대식세포가 항원 조각을 표면에 내보이는 단계',
      etym: {
        ko: '抗原提示(막을 항, 근원 원, 끌/보일 제, 보일 시) → ‘항원을 눈앞에 내보임’',
        en: 'present: 라틴어 praesentare = 눈앞에 내놓다(prae 앞에+esse 있다)',
        memo: '“이런 적이 침입했습니다!” 하고 적의 조각을 들어 보이는 것 — 보조 T 림프구가 이를 보고 활성화'
      },
      role: ['대식세포가 삼킨 병원체의 항원 조각을 표면에 내보인다', '이를 인식한 보조 T 림프구가 활성화된다'],
      links: ['macrophage', 'helper_t']
    },
    helper_t: {
      name: '보조 T 림프구', en: 'Helper T cell', level: 'core', view: 'flow',
      where: '면역 반응을 지휘하는 T 림프구',
      etym: {
        ko: '輔助(도울 보, 도울 조) T 림프구 → ‘곁에서 돕는 T 림프구’. T는 가슴샘(Thymus)의 머리글자',
        en: 'helper T cell. lymphocyte: 라틴어 lympha(맑은 물)+그리스어 kytos(세포)',
        memo: '스스로 싸우기보다 다른 면역 세포를 ‘돕고 지휘’한다. T=Thymus(가슴샘)에서 성숙. AIDS는 이 세포를 파괴'
      },
      role: ['항원 제시를 받아 활성화되어 B 림프구와 세포독성 T 림프구를 활성화시킨다', '체액성 면역과 세포성 면역 모두에 필요하다'],
      exam: 'HIV가 파괴하는 세포는 보조 T 림프구입니다. 이 세포가 줄면 B 림프구와 세포독성 T 림프구가 제대로 활성화되지 못합니다.',
      links: ['b_cell', 'killer_t', 'presentation']
    },
    b_cell: {
      name: 'B 림프구', en: 'B lymphocyte', level: 'core', view: 'flow',
      where: '골수에서 생성·성숙하는 림프구. 항원을 만나면 분화한다',
      etym: {
        ko: 'B는 골수(Bone marrow)의 머리글자. (조류에서 처음 발견된 파브리시우스 낭 Bursa에서 왔다는 설명도 있음)',
        en: 'B cell — 항체를 만드는 쪽의 림프구',
        memo: 'B=Bone marrow(골수). 골수에서 만들어지고 자라서, 항원을 만나면 형질 세포와 기억 세포로 분화'
      },
      role: ['특정 항원에만 맞는 수용체를 가진 림프구', '보조 T 림프구의 도움으로 활성화되어 형질 세포와 기억 세포로 분화한다'],
      links: ['plasma', 'memory', 'helper_t', 'antigen']
    },
    plasma: {
      name: '형질 세포', en: 'Plasma cell', level: 'core', view: 'flow',
      where: 'B 림프구가 분화한 항체 공장',
      etym: {
        ko: '形質細胞(모양 형, 바탕 질, 세포) → 영어 plasma cell을 옮긴 말',
        en: 'plasma: 그리스어 plassein = 빚다, 모양을 만들다 (혈장·플라스마·플라스틱이 같은 뿌리)',
        memo: '항체를 만들어 쏟아내는 ‘항체 공장’. 항체를 분비하는 것은 기억 세포가 아니라 형질 세포'
      },
      role: ['특정 항원에 맞는 항체를 대량 생산해 분비한다', '체액성 면역을 담당한다'],
      exam: '항체를 분비하는 세포는 형질 세포입니다. 기억 세포는 재침입 때 형질 세포로 분화하는 역할입니다.',
      links: ['antibody', 'b_cell', 'memory']
    },
    antibody: {
      name: '항체', en: 'Antibody', level: 'core', view: 'flow',
      where: '형질 세포가 분비하는 Y자 모양 단백질',
      etym: {
        ko: '抗體(막을 항, 몸 체) → ‘항원에 맞서는 몸’',
        en: 'anti(반대)+body(몸, 물질) → ‘항원에 맞서는 물질’',
        memo: '항원과 열쇠–자물쇠처럼 결합 — 한 종류의 항체는 한 종류의 항원에만 붙는다'
      },
      role: ['특정 항원에 결합해 항원을 무력화하고 제거를 돕는다(항원–항체 반응)', '혈액·림프 같은 체액을 돌아다닌다'],
      exam: '항체는 항원 하나에 하나씩만 맞는 특이성이 있습니다. 혈청 요법은 이 항체를 직접 주입하는 방법입니다.',
      links: ['antigen', 'plasma']
    },
    memory: {
      name: '기억 세포', en: 'Memory cell', level: 'core', view: 'flow',
      where: '1차 반응 때 만들어져 오래 남는 림프구',
      etym: {
        ko: '記憶細胞(기록할 기, 생각할 억, 세포) → ‘기억하는 세포’',
        en: 'memory cell — 한 번 만난 항원을 ‘기억’해 두는 세포',
        memo: '“예전에 본 적이 있는 적이다!” 얼굴을 외워 두는 세포 → 2차 반응이 빠르고 강한 이유'
      },
      role: ['같은 항원이 다시 침입하면 빠르게 분열해 형질 세포로 분화한다', '그 결과 2차 면역 반응은 잠복기가 짧고 항체가 훨씬 많이 생긴다'],
      exam: '기억 세포는 같은 항원에만 반응합니다. 다른 항원이면 1차 면역 반응 그대로입니다.',
      links: ['plasma', 'b_cell', 'secondary']
    },
    killer_t: {
      name: '세포독성 T 림프구', en: 'Cytotoxic T cell', level: 'core', view: 'flow',
      where: '병원체에 감염된 세포를 직접 파괴하는 T 림프구',
      etym: {
        ko: '細胞毒性(세포 세포, 독 독, 성질 성) T 림프구 → ‘세포에 독 같은 작용을 하는 T 림프구’',
        en: 'cyto(그리스어 kytos 세포)+toxic(독)',
        memo: 'cyto(세포)+toxic(독) = 감염된 세포에 ‘독을 주는’ 저격수'
      },
      role: ['보조 T 림프구의 도움으로 활성화된다', '병원체에 감염된 세포를 직접 찾아 파괴한다 (세포성 면역)'],
      links: ['helper_t', 'infected', 'cellular']
    },
    infected: {
      name: '감염된 세포', en: 'Infected cell', level: 'core', view: 'flow',
      where: '바이러스 등 병원체가 안으로 들어온 몸의 세포',
      etym: {
        ko: '感染(느낄 감, 물들 염) → ‘병이 물들 듯 옮음’',
        en: 'infect: 라틴어 inficere = 물들이다, 더럽히다 (in 안에+facere 만들다)',
        memo: '염(染)=물들이다. 항체는 세포 안으로 못 들어가므로 이런 세포는 세포독성 T 림프구가 처리'
      },
      role: ['병원체가 증식하는 장소가 된 몸의 세포', '항체가 닿지 못하기 때문에 세포성 면역으로 파괴해야 한다'],
      links: ['killer_t', 'cellular']
    },
    humoral: {
      name: '체액성 면역', en: 'Humoral immunity', level: 'core', view: 'flow',
      where: 'B 림프구 → 형질 세포 → 항체로 이어지는 경로',
      etym: {
        ko: '體液性(몸 체, 진 액, 성질 성) → ‘몸의 액(혈장·림프)으로 이루어지는’',
        en: 'humoral: 라틴어 humor = 액체. 옛 의학의 네 가지 체액(humor)설에서 유래',
        memo: '체액 속을 항체가 돌아다니며 싸운다. 항체가 주역'
      },
      role: ['형질 세포가 분비한 항체가 항원과 결합해 제거를 돕는다', '보조 T 림프구가 B 림프구를 활성화한다'],
      exam: '체액성 면역은 항체, 세포성 면역은 세포독성 T 림프구로 짝지어 외우세요.',
      links: ['b_cell', 'plasma', 'antibody']
    },
    cellular: {
      name: '세포성 면역', en: 'Cell-mediated immunity', level: 'core', view: 'flow',
      where: '세포독성 T 림프구가 감염된 세포를 직접 파괴하는 경로',
      etym: {
        ko: '細胞性(세포 세포, 성질 성) → ‘세포가 직접 맞서는’',
        en: 'cell-mediated: 세포가 중개(mediate; 라틴어 medius 가운데)하는 면역',
        memo: '항체가 아니라 ‘세포 자체’가 직접 공격 (체액성 면역과 짝)'
      },
      role: ['세포독성 T 림프구가 감염된 세포를 찾아 파괴한다', '이식 장기에 대한 거부 반응도 이 경로로 일어난다'],
      links: ['killer_t', 'infected', 'helper_t']
    },

    /* ───────── 1차·2차 면역 반응 그래프 ───────── */
    primary: {
      name: '1차 면역 반응', en: 'Primary immune response', level: 'core', view: 'graph',
      where: '처음 만난 항원에 대한 반응 (항체량이 천천히, 적게 증가)',
      etym: {
        ko: '一次(한 일, 버금 차) 免疫(면할 면, 전염병 역) 反應 → ‘처음 일어나는 면역 반응’',
        en: 'primary: 라틴어 primus = 첫째. immunity: 라틴어 immunis = 의무를 면제받은',
        memo: 'primus(첫째)에서 prime·primary. 처음이라 준비가 느리고 항체도 적다'
      },
      role: ['항원을 처음 만났을 때: 잠복기가 길고 항체 생성량이 적다', '이때 기억 세포가 만들어져 남는다'],
      exam: '다른 항원이 들어오면 기억 세포가 없으므로 항상 1차 반응입니다.',
      links: ['latent', 'secondary', 'memory']
    },
    latent: {
      name: '잠복기', en: 'Latent period', level: 'core', view: 'graph',
      where: '항원이 들어온 뒤 항체가 늘기 시작하기까지의 시간',
      etym: {
        ko: '潛伏期(잠길 잠, 엎드릴 복, 때 기) → ‘숨어 엎드려 있는 시기’',
        en: 'latent: 라틴어 latere = 숨어 있다',
        memo: '1차 반응은 잠복기가 길고, 2차 반응은 짧다 (기억 세포 덕분)'
      },
      role: ['B 림프구가 활성화되고 분화하는 데 걸리는 시간', '2차 반응에서는 기억 세포가 있어 훨씬 짧다'],
      links: ['primary', 'secondary']
    },
    secondary: {
      name: '2차 면역 반응', en: 'Secondary immune response', level: 'core', view: 'graph',
      where: '같은 항원이 다시 들어왔을 때의 반응 (빠르고 강함)',
      etym: {
        ko: '二次(두 이, 버금 차) 免疫 反應 → ‘두 번째로 일어나는 면역 반응’',
        en: 'secondary: 라틴어 secundus = 뒤따르는, 둘째',
        memo: 'secundus(뒤따르는)에서 second. 기억 세포가 바로 나서서 잠복기가 짧고 항체도 훨씬 많이 만든다'
      },
      role: ['기억 세포가 빠르게 형질 세포로 분화해 짧은 시간에 많은 항체를 만든다', '예방 접종의 원리'],
      exam: '2차 반응이 일어나려면 같은 항원이어야 합니다. 그래프 문항은 “항원 종류와 주사 시점”을 표로 정리한 뒤 1차/2차를 판별합니다.',
      links: ['memory', 'primary', 'latent']
    }
  },

  scenes: [
    {
      id: 'flow', label: '면역 반응 따라가기', view: 'flow',
      steps: [
        { text: '병원체가 몸에 침입했습니다. 항원이 몸 밖에서 들어온 이물질로 인식됩니다.', part: 'antigen', set: { stage: 0 }, ms: 4500 },
        { text: '대식세포가 병원체를 삼켜 분해하고(식균 작용), 항원 조각을 표면에 내보입니다(항원 제시).', part: 'macrophage', set: { stage: 1 }, ms: 6000 },
        { text: '보조 T 림프구가 항원 조각을 인식해 활성화됩니다.', part: 'helper_t', set: { stage: 2 }, ms: 4500 },
        { text: '보조 T 림프구가 B 림프구와 세포독성 T 림프구를 활성화시킵니다.', part: 'b_cell', set: { stage: 3 }, ms: 5000 },
        { text: 'B 림프구는 형질 세포와 기억 세포로 분화하고, 세포독성 T 림프구는 감염된 세포를 공격합니다.', part: 'plasma', set: { stage: 4 }, ms: 6000 },
        { text: '형질 세포가 분비한 항체가 항원에 결합해 제거를 돕습니다(항원–항체 반응).', part: 'antibody', set: { stage: 5 }, ms: 5500 },
        { text: '같은 항원이 다시 침입하면 남아 있던 기억 세포가 바로 형질 세포로 분화해 빠르게 항체를 만듭니다.', part: 'memory', set: { stage: 6 }, ms: 6500 }
      ]
    },
    {
      id: 'graph', label: '1차·2차 반응 비교', view: 'graph',
      steps: [
        { text: '0일: 항원 A를 처음 주사합니다. 항체는 아직 없습니다.', part: 'primary', set: { day: 0 }, ms: 4000 },
        { text: '잠복기가 지난 뒤에야 항체가 천천히 늘어나고, 양도 많지 않습니다(1차 반응). 이때 기억 세포가 만들어집니다.', part: 'latent', set: { day: 14 }, ms: 6000 },
        { text: '28일: A를 다시 주사합니다. 기억 세포가 있어 잠복기가 짧고 항체가 훨씬 많이 만들어집니다(2차 반응).', part: 'secondary', set: { day: 40 }, ms: 6500 },
        { text: '같은 날 처음 주사한 항원 B는 기억 세포가 없으므로 1차 반응처럼 느리고 약하게 반응합니다.', part: 'primary', set: { day: 56, showB: true }, ms: 6500 }
      ]
    }
  ]
});
