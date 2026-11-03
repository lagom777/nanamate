/* 수소 원자의 에너지 준위와 선 스펙트럼 그림 글 자료. E_n = −13.6/n² eV, λ(nm) ≈ 1240/ΔE(eV). */
NMFIG.data('hlevel', {
  title: '수소 원자의 에너지 준위와 스펙트럼',
  lead: '준위나 용어에 마우스를 올려 보세요(휴대폰은 누르기). 아래에서 시작 준위와 나중 준위를 골라 전이를 만들어 보세요.',
  idle: '전자가 높은 준위에서 낮은 준위로 내려가면 그 에너지 차이만큼의 빛(광자)을 방출하고, 낮은 준위에서 높은 준위로 올라가려면 같은 에너지의 빛을 흡수합니다. ΔE가 클수록 파장이 짧습니다.',
  order: [
    'bohr', 'quantum_n', 'level', 'ground', 'excited', 'ionization', 'emission', 'absorption', 'photon', 'energy_gap',
    'lyman', 'balmer', 'paschen', 'spectrum'
  ],
  parts: {
    bohr: {
      name: '보어 모형', en: 'Bohr model', level: 'core',
      where: '전자가 정해진 원 궤도(에너지 준위)에서만 운동한다고 본 수소 원자 모형 (1913년)',
      etym: {
        ko: '덴마크의 물리학자 닐스 보어(1885~1962)의 이름에서. ‘모형(模型)’은 본떠 만든 틀',
        en: 'Bohr model — 보어는 이 업적으로 1922년 노벨 물리학상을 받았다',
        memo: '전자는 “계단(준위)”에만 설 수 있고 계단 사이에는 서 있을 수 없다'
      },
      role: ['전자는 불연속적인 에너지 준위에서만 존재하고, 준위 사이를 이동(전이)할 때만 광자를 흡수·방출한다', '수소 원자의 선 스펙트럼을 설명했다'],
      exam: '러더퍼드 모형은 원자핵 발견, 보어 모형은 수소 선 스펙트럼 설명이 근거 실험입니다.',
      links: ['level', 'spectrum']
    },
    quantum_n: {
      name: '양자수 n', en: 'Quantum number n', level: 'core',
      where: '에너지 준위의 번호. n = 1, 2, 3, … (자연수)',
      etym: {
        ko: '量子數(헤아릴 량, 아들·알갱이 자, 셈 수) → ‘덩어리(알갱이)의 수’',
        en: 'quantum: 라틴어 quantus = 얼마나 많은. 에너지가 덩어리(양)로만 존재한다는 뜻',
        memo: 'n이 클수록 핵에서 먼 궤도·높은 에너지. E_n = −13.6/n² (eV)'
      },
      role: ['n이 작을수록 에너지가 낮다(E는 음수이므로 −가 더 큰 쪽이 낮다)', 'n = ∞ 일 때 E = 0 (이온화)'],
      exam: '준위 사이 간격은 n이 클수록 좁아집니다. 에너지 준위 값은 음수이므로 ΔE는 절댓값(|E_i − E_f|)으로 씁니다.',
      links: ['level', 'ionization']
    },
    level: {
      name: '에너지 준위', en: 'Energy level', level: 'core',
      where: '그림의 가로선 하나하나. 원자가 가질 수 있는 에너지 값',
      etym: {
        ko: '準位(준할 준, 자리 위) → ‘기준이 되는 자리(높이)’',
        en: 'energy: 그리스어 energeia = 활동, 작용 (en 안+ergon 일). level: 라틴어 libella = 작은 저울(수평)',
        memo: '건물 층(floor)처럼 정해진 높이만 있고 층 사이에는 못 선다 — 그래서 선 스펙트럼'
      },
      role: ['수소 원자의 에너지 E_n = −13.6/n² eV', 'n = 1: −13.6, n = 2: −3.40, n = 3: −1.51, n = 4: −0.85, n = 5: −0.54, n = 6: −0.38 (eV)'],
      exam: '준위 그림에서 화살표 길이가 곧 ΔE입니다. 화살표가 길수록 광자 에너지가 크고 파장이 짧습니다.',
      links: ['quantum_n', 'ground', 'excited', 'energy_gap']
    },
    ground: {
      name: '바닥 상태', en: 'Ground state', level: 'core',
      where: '에너지가 가장 낮은 상태 (n = 1, −13.6 eV)',
      etym: {
        ko: '바닥(순우리말) 상태. 한자어로는 基底(터 기, 밑 저) 상태 → ‘가장 밑바닥 상태’',
        en: 'ground: 옛 영어 grund = 바닥, 토대',
        memo: '가장 안정한 “1층”. 원자는 에너지를 받지 않으면 이 상태에 있다'
      },
      role: ['전자가 n = 1 준위에 있는 가장 안정한 상태', '여기서 위 준위로 올라가려면 에너지를 흡수해야 한다 (예: 1 → 2는 10.2 eV)'],
      links: ['excited', 'level']
    },
    excited: {
      name: '들뜬 상태', en: 'Excited state', level: 'core',
      where: '바닥 상태보다 에너지가 높은 상태 (n ≥ 2)',
      etym: {
        ko: '들뜨다(순우리말) → ‘차분하지 못하고 위로 뜬’ 상태. 한자어로는 勵起(힘쓸 려, 일어날 기) 상태',
        en: 'excite: 라틴어 excitare = 불러일으키다 (ex 밖으로+citare 불러내다)',
        memo: '에너지를 받아 위층으로 “들떠” 올라간 상태 — 오래 못 머물고 곧 내려오며 빛을 낸다'
      },
      role: ['빛이나 충돌로 에너지를 흡수하면 만들어진다', '불안정해서 곧 낮은 준위로 내려오며 광자를 방출한다'],
      links: ['ground', 'emission']
    },
    ionization: {
      name: '이온화 (n = ∞, 0 eV)', en: 'Ionization', level: 'ref',
      where: '그림 맨 위의 점선. 전자가 원자핵의 구속에서 완전히 벗어난 상태',
      etym: {
        ko: '이온(ion)+化(될 화) → ‘이온이 됨’',
        en: 'ion: 그리스어 ion = ‘가는 것’ (전극 쪽으로 이동해 가서; 1834년 패러데이). ionize = 이온으로 만들다',
        memo: '바닥 상태에서 전자를 떼어 내는 데 13.6 eV가 필요하다 — 이것이 수소의 이온화 에너지'
      },
      role: ['E = 0 으로 정한 기준선. 이보다 아래(음수)는 핵에 묶인 상태', '13.6 eV 이상의 광자를 흡수하면 전자가 원자를 떠난다'],
      links: ['ground', 'quantum_n']
    },
    emission: {
      name: '방출', en: 'Emission', level: 'core',
      where: '높은 준위 → 낮은 준위로 내려오며 광자를 내보내는 전이',
      etym: {
        ko: '放出(놓을 방, 날 출) → ‘밖으로 내놓음’',
        en: 'emit: 라틴어 emittere = 내보내다 (e 밖으로+mittere 보내다)',
        memo: '위층에서 아래층으로 내려오며 차이만큼을 “빛으로 버린다” → 방출 스펙트럼의 밝은 선'
      },
      role: ['hf = E_i − E_f (i > f). 에너지 차이만큼의 광자가 나온다', '방출선이 모여 방출 스펙트럼(밝은 선)을 이룬다'],
      links: ['absorption', 'photon', 'energy_gap']
    },
    absorption: {
      name: '흡수', en: 'Absorption', level: 'core',
      where: '낮은 준위 → 높은 준위로 올라가며 광자를 받아들이는 전이',
      etym: {
        ko: '吸收(마실 흡, 거둘 수) → ‘빨아들여 거둠’',
        en: 'absorb: 라틴어 absorbere = 삼키다, 빨아들이다',
        memo: '위층으로 올라가려면 층 사이의 차이와 정확히 같은 에너지의 빛만 삼킬 수 있다'
      },
      role: ['hf = E_f − E_i (f > i). 정확히 그 에너지의 광자만 흡수된다', '흡수 스펙트럼의 검은 선 위치는 방출선의 위치와 같다'],
      exam: '“흡수선의 파장은 방출선과 다르다”는 보기는 틀립니다. 같은 두 준위 사이이므로 파장이 같습니다.',
      links: ['emission', 'photon']
    },
    photon: {
      name: '광자', en: 'Photon', level: 'core',
      where: '빛의 알갱이. 전이에서 흡수·방출되는 에너지 hf를 가진다',
      etym: {
        ko: '光子(빛 광, 아들·알갱이 자) → ‘빛의 알갱이’',
        en: '그리스어 phos(빛, 속격 photos)+입자를 뜻하는 -on. 아인슈타인은 광양자(light quantum)라 불렀고, photon은 1926년 길버트 루이스가 붙인 이름',
        memo: 'photo-=빛 (photograph=빛으로 그린 것). 광자 에너지 E = hf = 1240/λ(nm) eV'
      },
      role: ['광자 하나의 에너지는 hf = hc/λ', '전이 에너지와 광자 에너지가 일치할 때만 흡수·방출'],
      links: ['energy_gap', 'emission', 'absorption']
    },
    energy_gap: {
      name: '에너지 차이 ΔE', en: 'Energy difference ΔE', level: 'core',
      where: '두 준위 사이의 높이 차이. 화살표의 길이',
      etym: {
        ko: 'Δ(델타)는 “차이”를 뜻하는 그리스 문자. ΔE = |E_i − E_f|',
        en: 'delta(Δ): 그리스어 알파벳 네 번째 글자. 변화량·차이를 나타내는 기호로 쓰임',
        memo: 'ΔE가 크면 → 진동수 f↑, 파장 λ↓ (λ ≈ 1240 / ΔE). 화살표가 길수록 파장은 짧다'
      },
      role: ['전이 에너지 = 방출·흡수되는 광자의 에너지', 'ΔE(eV)를 알면 λ(nm) ≈ 1240/ΔE'],
      exam: '세 준위 사이에서 ΔE_a = ΔE_b + ΔE_c 이면 1/λ_a = 1/λ_b + 1/λ_c 입니다. (가장 긴 화살표 = 나머지 두 개의 합)',
      links: ['level', 'photon', 'spectrum']
    },
    lyman: {
      name: '라이먼 계열 (n → 1)', en: 'Lyman series', level: 'core',
      where: '바닥 상태 n = 1로 내려오는 전이들, 자외선 영역',
      etym: {
        ko: '미국의 물리학자 시어도어 라이먼(1874~1954)이 1906~1914년에 발견한 자외선 계열에서',
        en: 'Lyman series — ‘시리즈(series)’는 라틴어 serere(이어 놓다)에서, 이어진 선들',
        memo: 'n=1 도착 = 라이먼 = 자외선(에너지가 가장 큼). 예: 2 → 1은 10.2 eV, 약 121.6 nm'
      },
      role: ['ΔE가 10.2 eV 이상이라 파장이 약 91.2~121.6 nm로 모두 자외선', '눈에 보이지 않는다'],
      links: ['balmer', 'ground', 'spectrum']
    },
    balmer: {
      name: '발머 계열 (n → 2)', en: 'Balmer series', level: 'core',
      where: 'n = 2로 내려오는 전이들, 가시광선(처음 몇 개)',
      etym: {
        ko: '스위스의 수학 교사 요한 발머(1825~1898)가 1885년 스펙트럼 선의 파장 규칙을 밝힌 데서',
        en: 'Balmer series — 발머는 이 규칙을 수식으로 먼저 찾았고, 나중에 보어가 이유를 설명했다',
        memo: 'n=2 도착 = 발머 = 가시광선. 3 → 2는 1.89 eV, 약 656 nm(붉은색)'
      },
      role: ['3→2: 656 nm(붉은색), 4→2: 486 nm(청록), 5→2: 434 nm(남색), 6→2: 410 nm(보라)', '계열 극한에 가까운 선들은 자외선 영역으로 들어간다'],
      exam: '“발머 계열은 모두 가시광선”이라는 보기는 틀립니다. 처음 몇 개만 가시광선이고 나머지는 자외선입니다.',
      links: ['lyman', 'paschen', 'spectrum']
    },
    paschen: {
      name: '파셴 계열 (n → 3)', en: 'Paschen series', level: 'core',
      where: 'n = 3으로 내려오는 전이들, 적외선 영역',
      etym: {
        ko: '독일의 물리학자 프리드리히 파셴(1865~1947)이 1908년 발견한 적외선 계열에서',
        en: 'Paschen series',
        memo: 'n=3 도착 = 파셴 = 적외선(에너지가 작음). 예: 4 → 3은 0.66 eV, 약 1875 nm'
      },
      role: ['ΔE가 1.51 eV 이하이므로 파장이 약 820 nm 이상으로 모두 적외선', '눈에 보이지 않는다'],
      links: ['balmer', 'spectrum']
    },
    spectrum: {
      name: '선 스펙트럼', en: 'Line spectrum', level: 'core',
      where: '그림 아래 띠. 광자의 파장을 따라 선으로 나타낸 것',
      etym: {
        ko: '線(줄 선) 스펙트럼 → ‘줄무늬로 나타나는 스펙트럼’',
        en: 'spectrum: 라틴어 spectrum = 모습, 환영 (specere 보다 → inspect, spectacle과 같은 뿌리). 1671년 뉴턴이 색의 띠에 처음 붙임',
        memo: '연속 스펙트럼은 무지개처럼 이어진 띠, 선 스펙트럼은 특정 색에만 선이 있다 — 원자의 지문'
      },
      role: ['원소마다 선의 위치가 달라 원자를 구별하는 “지문”이 된다', '선 스펙트럼은 에너지 준위가 불연속적임을 보여 주는 증거이다'],
      exam: '방출 스펙트럼은 어두운 바탕의 밝은 선, 흡수 스펙트럼은 연속 스펙트럼 바탕의 어두운 선. 선의 위치는 같습니다.',
      links: ['energy_gap', 'bohr', 'lyman', 'balmer', 'paschen']
    }
  },

  scenes: [
    {
      id: 'balmer', label: '발머 계열 따라가기',
      steps: [
        { text: '3 → 2 전이: ΔE = 1.89 eV, λ ≈ 1240/1.89 ≈ 656 nm. 붉은색 가시광선입니다.', part: 'balmer', set: { ni: 3, nf: 2, show: 'one' }, ms: 6000 },
        { text: '4 → 2 전이: ΔE = 2.55 eV, λ ≈ 486 nm (청록색). 위쪽 준위에서 내려올수록 ΔE가 커져 파장이 짧아집니다.', part: 'energy_gap', set: { ni: 4, nf: 2, show: 'one' }, ms: 6000 },
        { text: '발머 계열 전체: n=2로 내려오는 모든 전이의 선들이 스펙트럼에 나란히 나타납니다.', part: 'spectrum', set: { show: 'balmer' }, ms: 6000 }
      ]
    },
    {
      id: 'series', label: '라이먼·발머·파셴 비교',
      steps: [
        { text: '라이먼 계열: n=1로 내려오는 전이. ΔE가 크므로 파장이 짧은 자외선 영역입니다.', part: 'lyman', set: { show: 'lyman' }, ms: 5500 },
        { text: '발머 계열: n=2로 내려오는 전이. 처음 몇 개가 가시광선입니다.', part: 'balmer', set: { show: 'balmer' }, ms: 5500 },
        { text: '파셴 계열: n=3으로 내려오는 전이. ΔE가 작아 파장이 긴 적외선입니다.', part: 'paschen', set: { show: 'paschen' }, ms: 5500 }
      ]
    },
    {
      id: 'absorb', label: '방출과 흡수',
      steps: [
        { text: '2 → 1 방출: 10.2 eV의 광자가 나옵니다 (121.6 nm, 자외선).', part: 'emission', set: { ni: 2, nf: 1, show: 'one' }, ms: 5500 },
        { text: '1 → 2 흡수: 정확히 10.2 eV의 광자만 흡수할 수 있고, 흡수선의 위치는 방출선과 같습니다.', part: 'absorption', set: { ni: 1, nf: 2, show: 'one' }, ms: 6000 }
      ]
    }
  ]
});
