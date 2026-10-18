/* 골격근과 근육 원섬유 마디 그림 글 자료 — 구조(근육→마디) / 마디 수축(슬라이더). */
NMFIG.data('sarcomere', {
  title: '골격근 · 근육 원섬유 마디의 수축',
  lead: '부위에 마우스를 올려 보세요(휴대폰은 누르기). ‘마디 수축’ 보기에서 슬라이더를 끌면 마디가 짧아집니다.',
  idle: '근육은 근섬유 다발 → 근섬유 → 근육 원섬유 → 마디(사르코미어) 순으로 작아집니다. 수축하면 어떤 구간의 길이가 변하고, 어떤 구간은 그대로인지 직접 확인해 보세요.',
  order: [
    'muscle', 'fiber', 'myofibril', 'sarcomere',
    'z_line', 'a_band', 'i_band', 'h_zone', 'overlap', 'm_line', 'actin', 'myosin', 'myosin_head'
  ],
  parts: {
    /* ───────── 구조: 근육 → 마디 ───────── */
    muscle: {
      name: '골격근', en: 'Skeletal muscle', level: 'core', view: 'hierarchy',
      where: '뼈에 붙어 몸을 움직이는 근육. 근섬유 다발로 이루어짐',
      etym: {
        ko: '骨格筋(뼈 골, 격식·틀 격, 힘줄·근육 근) → ‘뼈대(骨格)에 붙어 있는 근육’',
        en: 'muscle: 라틴어 musculus = ‘작은 생쥐’(mus=쥐). 팔 근육이 불끈할 때 살갗 밑에서 쥐가 움직이는 것 같아 붙였다는 설이 널리 알려져 있다',
        memo: '골격(骨格)에 붙은 근육 = 골격근. 힘줄로 뼈에 붙어 있고 의지대로 움직이는 수의근'
      },
      role: ['수많은 근섬유가 모인 다발로, 힘줄로 뼈에 붙어 있다', '수축할 때 뼈를 당겨 몸을 움직인다', '자율 신경이 아니라 운동 뉴런의 명령을 받아 수축한다(수의근)'],
      links: ['fiber']
    },
    fiber: {
      name: '근섬유', en: 'Muscle fiber', level: 'core', view: 'hierarchy',
      where: '골격근을 이루는 가늘고 긴 세포 하나',
      etym: {
        ko: '筋纖維(근육 근, 가늘 섬, 벼리 유) → ‘근육의 가는 실’',
        en: 'fiber: 라틴어 fibra = 실, 섬유',
        memo: '근육을 이루는 ‘실 한 가닥’ 정도로 가늘고 긴 세포 — 안에 근육 원섬유가 가득'
      },
      role: ['핵이 여러 개인 가늘고 긴 세포', '세포 안은 근육 원섬유로 가득 차 있다'],
      links: ['muscle', 'myofibril']
    },
    myofibril: {
      name: '근육 원섬유', en: 'Myofibril', level: 'core', view: 'hierarchy',
      where: '근섬유 안을 채운 더 가는 실 모양 구조',
      etym: {
        ko: '筋原纖維(근육 근, 근원 원, 가는 섬유) → ‘근육의 근본이 되는 실’',
        en: 'myo-(그리스어 mys = 근육, 쥐)+fibril(작은 섬유)',
        memo: '근섬유 안의 더 가는 실 — 이 실이 짧아지는 것이 근수축의 실체'
      },
      role: ['근육 원섬유 마디가 길게 이어진 구조', '수축할 때 마디들이 동시에 짧아져 근섬유 전체가 줄어든다'],
      exam: '근육 원섬유는 근육 원섬유 마디(Z선~Z선)가 반복된 구조입니다. 마디가 수축의 기본 단위입니다.',
      links: ['fiber', 'sarcomere']
    },
    sarcomere: {
      name: '근육 원섬유 마디', en: 'Sarcomere', level: 'core', view: 'contract',
      where: '근육 원섬유에서 Z선과 Z선 사이의 한 토막',
      etym: {
        ko: '근육 원섬유의 마디(節) → Z선과 Z선 사이 한 마디',
        en: '그리스어 sarx(살, 근육)+meros(부분) → ‘살(근육)의 한 부분’. 사르코미어',
        memo: '근육이 줄어드는 ‘최소 단위 한 토막’ — 이 마디가 짧아져야 근육이 수축한다'
      },
      role: ['굵은 마이오신 필라멘트와 가는 액틴 필라멘트가 규칙적으로 배열된 단위', '수축하면 길이(Z선~Z선)가 짧아진다'],
      exam: '마디 X의 길이 = ㉠(액틴만) + ㉡(겹침) + ㉢(마이오신만)… 수능은 이 부분 길이의 합과 비로 문제를 만듭니다.',
      links: ['z_line', 'a_band', 'i_band', 'h_zone', 'myofibril']
    },

    /* ───────── 마디 수축 ───────── */
    z_line: {
      name: 'Z선', en: 'Z line', level: 'core', view: 'contract',
      where: '마디의 양쪽 경계. 액틴 필라멘트가 붙어 있다',
      etym: {
        ko: 'Z는 독일어 Zwischenscheibe(사이 원반)의 머리글자. Zwischen=사이, Scheibe=원반',
        en: 'Z-disc / Z-line — 마디와 마디 ‘사이’의 경계선',
        memo: 'Z선과 Z선 ‘사이’가 마디 한 토막. 수축하면 양쪽 Z선이 서로 가까워진다'
      },
      role: ['액틴 필라멘트의 한쪽 끝이 붙어 있는 마디의 경계', '수축할 때 Z선이 마디 중심 쪽으로 끌려온다(마디 길이 감소)'],
      exam: '마디 길이는 Z선 사이의 거리입니다. 수축하면 양쪽 Z선이 각각 중심 쪽으로 이동해 마디 감소량은 Z선 이동량의 2배입니다.',
      links: ['actin', 'sarcomere']
    },
    a_band: {
      name: 'A대 (암대)', en: 'A band (Anisotropic)', level: 'core', view: 'contract',
      where: '마이오신 필라멘트가 있는 전체 구간 (현미경에서 어둡게 보임)',
      etym: {
        ko: '暗帶(어두울 암, 띠 대) → ‘어둡게 보이는 띠’. A는 Anisotropic(비등방성)의 머리글자',
        en: '편광 현미경에서 빛을 한 방향으로만 통과시키는 ‘비등방성(anisotropic)’ 띠라서 어둡게 보인다',
        memo: 'A=Anisotropic=암대(어두움). 굵은 마이오신이 있는 곳이라 수축해도 길이 불변'
      },
      role: ['마이오신 필라멘트가 있는 구간 전체 = 겹침(㉡) + H대(㉢) + 겹침(㉡)', '마이오신 필라멘트의 길이와 같아서 수축해도 변하지 않는다'],
      exam: '수축 때 길이가 변하지 않는 것: A대, 마이오신 필라멘트, 액틴 필라멘트 자체의 길이. 짧아지는 것: 마디, I대, H대.',
      links: ['myosin', 'h_zone', 'overlap']
    },
    i_band: {
      name: 'I대 (명대)', en: 'I band (Isotropic)', level: 'core', view: 'contract',
      where: '액틴 필라멘트만 있는 구간 (현미경에서 밝게 보임)',
      etym: {
        ko: '明帶(밝을 명, 띠 대) → ‘밝게 보이는 띠’. I는 Isotropic(등방성)의 머리글자',
        en: '편광 현미경에서 복굴절이 없는 ‘등방성(isotropic)’ 띠라서 밝게 보인다',
        memo: 'I=Isotropic=명대(밝음). 가는 액틴만 있는 구간이 수축하면 짧아진다 (㉠)'
      },
      role: ['액틴 필라멘트만 있는 부분(㉠). 이웃한 두 마디에 걸쳐 Z선을 중심으로 이어진다', '수축하면 액틴이 마이오신 사이로 들어가 I대가 짧아진다'],
      exam: 'I대 = 마디 길이 − A대 길이. 수축 때 마디가 줄어든 만큼 I대도 줄어듭니다.',
      links: ['actin', 'z_line']
    },
    h_zone: {
      name: 'H대', en: 'H zone', level: 'core', view: 'contract',
      where: 'A대 가운데, 마이오신 필라멘트만 있는 구간',
      etym: {
        ko: 'H는 독일 해부학자 헨젠(Hensen)의 이름에서 따왔다는 설이 일반적이다 (밝다는 뜻의 독일어 Hell에서 왔다는 설도 있음)',
        en: 'Hensen’s zone — 사람 이름이 붙은 구간',
        memo: '마디 한가운데 ‘마이오신만 있는’ 구간. 수축하면 액틴이 밀려와 점점 줄다가 사라진다'
      },
      role: ['액틴 필라멘트가 닿지 않는, 마이오신 필라멘트만 있는 부분(㉢)', '수축하면 액틴 필라멘트 끝이 서로 가까워져 H대가 짧아진다'],
      exam: 'H대 감소량 = 마디 길이 감소량. 이 관계가 수능 근수축 문제를 푸는 열쇠입니다.',
      links: ['myosin', 'a_band', 'overlap']
    },
    overlap: {
      name: '겹침 구간', en: 'Overlap zone', level: 'core', view: 'contract',
      where: 'A대에서 액틴과 마이오신이 함께 있는 양쪽 구간 (㉡)',
      etym: {
        ko: '겹침(순우리말) → 액틴과 마이오신이 서로 겹쳐 있는 구간',
        en: 'overlap: over(위로)+lap(포개다, 접어 겹치다)',
        memo: '수축하면 액틴이 마이오신 사이로 더 들어가 ‘겹침’이 커진다 — 필라멘트는 짧아지지 않고 겹침만 커지는 것'
      },
      role: ['A대에서 H대를 뺀 양쪽 부분. 한쪽 겹침 길이 = (A대 − H대) / 2', '수축할 때 길어지는 유일한 구간(마디·I대·H대는 짧아짐)'],
      exam: '“필라멘트가 짧아진다”는 보기는 틀립니다. 필라멘트는 그대로 두고 겹침(㉡)만 커집니다.',
      links: ['actin', 'myosin', 'a_band']
    },
    m_line: {
      name: 'M선', en: 'M line', level: 'ref', view: 'contract',
      where: '마디 한가운데에서 마이오신 필라멘트를 붙잡아 주는 선',
      etym: {
        ko: 'M은 독일어 Mittelscheibe(가운데 원반)의 머리글자. Mittel=가운데',
        en: 'M-line: Mittelscheibe → ‘마디의 한가운데 선’',
        memo: 'Z선이 ‘사이’의 경계라면 M선은 ‘가운데(Mittel)’ 선'
      },
      role: ['굵은 마이오신 필라멘트의 가운데를 이어 정렬을 유지', '수능에서는 거의 다루지 않는 참고 구조'],
      links: ['myosin', 'h_zone']
    },
    actin: {
      name: '액틴 필라멘트', en: 'Actin filament', level: 'core', view: 'contract',
      where: 'Z선에서 마디 중심 쪽으로 뻗은 가는 필라멘트',
      etym: {
        ko: '액틴(actin)+필라멘트. 가는(細) 필라멘트라고도 부른다',
        en: 'actin: ‘마이오신을 활성화(activate)시키는 단백질’이라는 뜻에서 붙은 이름이라는 설이 널리 알려져 있다. filament: 라틴어 filum = 실',
        memo: 'Z선에 붙은 ‘가는 줄’. 수축 때 마이오신 사이로 미끄러져 들어가지만 자기 길이는 변하지 않는다'
      },
      role: ['한쪽 끝이 Z선에 붙은 가는 필라멘트(마디 한쪽에 1.2 μm)', '마이오신 머리와 결합해 마이오신 사이로 끌려 들어간다(활주설)'],
      exam: '액틴 필라멘트는 수축해도 길이가 변하지 않습니다. Z선과 함께 중심 쪽으로 이동할 뿐입니다.',
      links: ['myosin', 'z_line', 'i_band']
    },
    myosin: {
      name: '마이오신 필라멘트', en: 'Myosin filament', level: 'core', view: 'contract',
      where: '마디 가운데에 있는 굵은 필라멘트 (길이 1.6 μm)',
      etym: {
        ko: '마이오신(myosin)+필라멘트. 굵은(粗) 필라멘트라고도 부른다',
        en: 'myosin: 그리스어 mys(근육)+-in(단백질 이름 끝). 1864년 쿠네가 근육에서 분리해 붙인 이름',
        memo: 'myo-=근육 (myocardium=심근). 굵은 줄 = 마이오신, 가는 줄 = 액틴'
      },
      role: ['굵은 필라멘트로 A대와 같은 길이', '머리 부분이 액틴과 결합했다 떨어지기를 반복하며 액틴을 마디 중심 쪽으로 끌어당긴다(ATP 사용)'],
      exam: 'A대 = 마이오신 필라멘트가 있는 전체 구간이므로 수축해도 변하지 않습니다.',
      links: ['actin', 'a_band', 'myosin_head']
    },
    myosin_head: {
      name: '마이오신 머리', en: 'Myosin head (cross-bridge)', level: 'ref', view: 'contract',
      where: '마이오신 필라멘트 양쪽으로 삐져나온 머리 모양 돌기',
      etym: {
        ko: '머리(순우리말). 액틴과 다리처럼 이어져 ‘가로다리(橋 다리 교)’라고도 부른다',
        en: 'cross-bridge: 가로질러 놓인 다리',
        memo: '노를 젓듯 액틴을 붙잡았다 놓기를 반복 — 이때마다 ATP가 쓰인다'
      },
      role: ['ATP를 분해해 얻은 에너지로 액틴 필라멘트를 당긴다', '수축에는 ATP가 필요하다'],
      exam: '근수축에는 ATP가 필요합니다. 필라멘트가 미끄러져 들어가는 활주설의 힘의 원천입니다.',
      links: ['myosin', 'actin']
    }
  },

  scenes: [
    {
      id: 'contract', label: '근수축 따라가기', view: 'contract',
      steps: [
        { text: '이완한 마디: X 3.0 μm. A대 1.6 μm, I대 1.4 μm, H대 0.6 μm입니다.', part: 'sarcomere', set: { len: 3.0 }, ms: 5000 },
        { text: '액틴이 마이오신 사이로 미끄러져 들어가 Z선이 가까워집니다. X 2.8 μm, I대 1.2 μm, H대 0.4 μm.', part: 'actin', set: { len: 2.8 }, ms: 5500 },
        { text: '더 수축하면 X 2.6 μm, I대 1.0 μm, H대 0.2 μm. A대는 계속 1.6 μm입니다.', part: 'a_band', set: { len: 2.6 }, ms: 5500 },
        { text: '최대 수축: 액틴 끝이 가운데에서 만나 H대가 0이 됩니다. X 2.4 μm. 필라멘트 길이는 그대로이고 겹침만 커졌습니다.', part: 'h_zone', set: { len: 2.4 }, ms: 6500 }
      ]
    },
    {
      id: 'zoom', label: '근육에서 마디까지', view: 'hierarchy',
      steps: [
        { text: '골격근은 수많은 근섬유가 모인 다발입니다.', part: 'muscle', ms: 4000 },
        { text: '근섬유는 핵이 여러 개인 가늘고 긴 세포 한 개입니다.', part: 'fiber', ms: 4000 },
        { text: '근섬유 안은 근육 원섬유로 가득합니다.', part: 'myofibril', ms: 4000 },
        { text: '근육 원섬유는 Z선과 Z선 사이의 마디가 반복된 구조이고, 마디가 수축의 기본 단위입니다.', part: 'sarcomere', ms: 5500 }
      ]
    }
  ]
});
