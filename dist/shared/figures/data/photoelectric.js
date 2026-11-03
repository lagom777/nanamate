/* 광전 효과 그림 글 자료 — 장치 / K–f 그래프. K_max = hf − W (h = 4.14×10⁻¹⁵ eV·s). */
NMFIG.data('photoelectric', {
  title: '광전 효과 — 빛의 진동수와 세기',
  lead: '장치나 그래프의 부분에 마우스를 올려 보세요(휴대폰은 누르기). 슬라이더로 빛의 진동수와 세기, 금속 종류를 바꿔 볼 수 있습니다.',
  idle: '금속판에 빛을 비추면 전자가 튀어나올 수 있습니다. 튀어나오느냐는 빛의 진동수가 정하고, 몇 개가 튀어나오느냐는 빛의 세기가 정합니다.',
  order: [
    'photon', 'metal', 'electron', 'frequency', 'intensity', 'work_function', 'threshold', 'kmax', 'planck', 'kf_line', 'stopping'
  ],
  parts: {
    photon: {
      name: '광자', en: 'Photon', level: 'core', view: 'device',
      where: '빛을 이루는 알갱이. 에너지 E = hf',
      etym: {
        ko: '光子(빛 광, 아들·알갱이 자) → ‘빛의 알갱이’',
        en: '그리스어 phos(빛, 속격 photos)+입자를 뜻하는 -on. 아인슈타인은 광양자(light quantum)라 불렀고, photon은 1926년 길버트 루이스가 붙인 이름',
        memo: 'photo-=빛 (photograph=빛으로 그린 것). 알갱이 하나의 에너지는 진동수에 비례: E = hf'
      },
      role: ['광자 1개의 에너지는 hf (h: 플랑크 상수, f: 진동수)', '전자 1개는 광자 1개를 통째로 흡수하거나 아예 흡수하지 않는다(한 번에 하나씩)'],
      exam: '빛의 세기는 광자의 개수에 비례하고, 광자 하나의 에너지는 진동수가 정합니다. 둘을 구분하는 것이 광전 효과 문제의 핵심입니다.',
      links: ['frequency', 'intensity', 'electron']
    },
    metal: {
      name: '금속판', en: 'Metal plate', level: 'core', view: 'device',
      where: '빛을 받아 전자를 내놓는 금속 (그림 아래의 판)',
      etym: {
        ko: '金屬板(쇠 금, 무리 속, 널 판) → ‘금속으로 된 판’. 金屬은 ‘쇠붙이 무리’',
        en: 'metal: 그리스어 metallon = 광산, 광석, 캐낸 것 (metallan 캐내다)',
        memo: '금속마다 전자를 붙잡는 세기(일함수 W)가 다르다 → 문턱 진동수도 다르다'
      },
      role: ['금속 속의 자유 전자를 가지고 있다', '일함수 W보다 큰 에너지를 가진 광자를 만나면 전자가 튀어나온다'],
      exam: '금속이 달라지면 일함수와 문턱 진동수가 달라집니다. K–f 그래프의 기울기(h)는 모두 같습니다.',
      links: ['work_function', 'electron']
    },
    electron: {
      name: '광전자', en: 'Photoelectron', level: 'core', view: 'device',
      where: '빛을 받아 금속 밖으로 튀어나온 전자',
      etym: {
        ko: '光電子(빛 광, 전기 전, 아들·알갱이 자) → ‘빛 때문에 튀어나온 전자’',
        en: 'electron: 그리스어 elektron = 호박(琥珀). 호박을 문지르면 정전기가 생기는 데서 전기(electricity)·전자의 이름이 나왔다',
        memo: '호박(elektron)에서 전기가 나왔으니, 광전자 = “빛(photo)이 끌어낸 호박(전기)의 알갱이”'
      },
      role: ['K = hf − W 의 운동 에너지로 튀어나온다 (최대값 K_max)', '튀어나오는 개수는 빛의 세기(광자 수)에 비례한다'],
      exam: '광전자의 수 ↔ 빛의 세기(진동수가 문턱 이상일 때), 광전자의 최대 운동 에너지 ↔ 진동수. 이 대응을 반드시 기억하세요.',
      links: ['kmax', 'intensity', 'photon']
    },
    frequency: {
      name: '빛의 진동수', en: 'Frequency of light', level: 'core', view: 'device',
      where: '슬라이더로 바꾸는 값 f (단위 Hz, 그림에서는 ×10¹⁴ Hz). 색깔을 정한다',
      etym: {
        ko: '振動數(떨칠 진, 움직일 동, 셈 수) → ‘1초에 흔들리는 횟수’',
        en: 'frequency: 라틴어 frequentia = 자주 일어남. 단위 Hz는 독일 물리학자 하인리히 헤르츠의 이름',
        memo: '진동수가 클수록 광자 하나의 에너지가 크다 (E = hf). 빨강 < 초록 < 파랑 < 보라 < 자외선 순으로 커진다'
      },
      role: ['f가 문턱 진동수 f₀ 이상이어야 광전자가 나온다', 'f가 클수록 광전자의 최대 운동 에너지도 크다 (K_max = hf − W)'],
      exam: 'f < f₀ 이면 빛을 아무리 세게, 오래 비춰도 광전자는 나오지 않습니다.',
      links: ['threshold', 'photon', 'kmax']
    },
    intensity: {
      name: '빛의 세기', en: 'Intensity of light', level: 'core', view: 'device',
      where: '슬라이더로 바꾸는 값. 단위 시간당 금속판에 닿는 광자의 수',
      etym: {
        ko: '세기(순우리말) → ‘힘이 센 정도’. 한자어로는 强度(강할 강, 법도 도)',
        en: 'intensity: 라틴어 intensus = 팽팽한, 강한 (intendere 팽팽히 당기다)',
        memo: '빛이 “센” 것은 알갱이(광자)가 “많이” 오는 것 — 알갱이 하나가 센 것이 아니다'
      },
      role: ['광자의 개수에 비례한다 (진동수가 같다면)', 'f ≥ f₀ 일 때 세기가 클수록 광전자 수가 늘어 광전류가 커진다'],
      exam: '빛의 세기를 키워도 K_max는 변하지 않습니다. 광전자의 수만 늘어납니다.',
      links: ['photon', 'electron']
    },
    work_function: {
      name: '일함수 W', en: 'Work function', level: 'core', view: 'device',
      where: '금속에서 전자를 떼어 내는 데 필요한 최소 에너지 (금속마다 다름)',
      etym: {
        ko: '일(work)+함수(函數, function). 금속마다 정해지는 값이라서 붙은 이름이며, 에너지 단위 eV로 나타낸다',
        en: 'work function: 전자를 떼어 내는 데 해야 하는 일(work). function은 ‘기능·함수’를 뜻하는 말로, 금속에 따라 정해지는 값이라는 의미',
        memo: '전자가 금속 속에 “붙잡혀 있는 값”. 이 값(W)보다 큰 에너지의 광자만 전자를 꺼낼 수 있다'
      },
      role: ['W = hf₀ (f₀: 문턱 진동수)', '그래프에서 세로축 절편이 −W이다'],
      exam: '일함수가 큰 금속일수록 K–f 그래프의 가로축 절편(f₀)이 크고, 같은 빛에서 K_max가 작습니다.',
      links: ['threshold', 'kmax', 'metal']
    },
    threshold: {
      name: '문턱 진동수 f₀', en: 'Threshold frequency', level: 'core', view: 'graph',
      where: '광전자가 나오기 시작하는 최소 진동수 (K–f 그래프가 가로축과 만나는 점)',
      etym: {
        ko: '문턱(순우리말) → 문 아래의 턱. 한자어로는 限界(한할 한, 지경 계) 진동수라고도 한다',
        en: 'threshold: 문턱, 문지방 (역치와 같은 영어 단어). 앞부분 thresh는 ‘밟다’를 뜻하는 옛 영어에서 왔다는 설이 있다',
        memo: '문턱을 넘어야 집에 들어가듯, f₀를 넘어야 전자가 튀어나온다. f₀ = W/h'
      },
      role: ['f < f₀ 이면 광전자가 나오지 않는다', 'f₀ = W/h 는 금속마다 다르다'],
      exam: '금속 A, B의 그래프는 기울기(h)가 같은 평행선이고, 가로축 절편 f₀만 다릅니다.',
      links: ['work_function', 'kf_line', 'frequency']
    },
    kmax: {
      name: '최대 운동 에너지', en: 'Maximum kinetic energy', level: 'core', view: 'graph',
      where: '튀어나온 광전자의 운동 에너지 중 가장 큰 값 K_max = hf − W',
      etym: {
        ko: '最大運動(가장 최, 큰 대, 옮길 운, 움직일 동) 에너지 → ‘가장 큰 움직임의 에너지’',
        en: 'kinetic: 그리스어 kinein = 움직이다 (cinema=움직이는 그림과 같은 뿌리). energy: 그리스어 energeia = 활동',
        memo: '금속 표면의 전자가 W만 치르고 나오면 나머지 hf − W가 모두 운동 에너지. 안쪽 전자는 더 쓰므로 “최대”'
      },
      role: ['K_max = hf − W (광자 에너지에서 일함수를 뺀 값)', '진동수에만 의존한다(세기와 무관)'],
      exam: 'K_max = hf − W 는 직선이므로 f에 대해 1차 함수입니다. 정지 전압 V_s = K_max / e 로 측정합니다.',
      links: ['kf_line', 'work_function', 'stopping']
    },
    planck: {
      name: '플랑크 상수 h (기울기)', en: 'Planck constant', level: 'core', view: 'graph',
      where: 'K–f 그래프 직선의 기울기. h = 6.63×10⁻³⁴ J·s = 4.14×10⁻¹⁵ eV·s',
      etym: {
        ko: '독일의 물리학자 막스 플랑크(1858~1947)의 이름에서. 常數(항상 상, 셈 수) = 항상 같은 값',
        en: 'Planck constant — 1900년 플랑크가 에너지는 hf의 덩어리(양자, 라틴어 quantum=얼마나 많은)로만 주고받는다고 가정한 데서',
        memo: '금속이 달라도 기울기는 항상 h — 그래프가 평행한 이유. 자연이 정한 에너지 알갱이의 크기'
      },
      role: ['E = hf 의 비례상수', '금속 종류와 상관없이 K–f 그래프의 기울기가 모두 h로 같다'],
      exam: '서로 다른 두 금속의 K–f 그래프가 평행하다는 사실은 “기울기가 같다 = h가 같다” 라는 뜻입니다.',
      links: ['kf_line', 'photon']
    },
    kf_line: {
      name: 'K–f 그래프', en: 'K–f graph', level: 'core', view: 'graph',
      where: '진동수(가로) 대 최대 운동 에너지(세로)의 직선',
      etym: {
        ko: 'K는 운동 에너지(Kinetic energy)의 머리글자, f는 진동수(frequency). 그래프는 ‘그린 것’',
        en: 'graph: 그리스어 graphein = 쓰다, 그리다',
        memo: 'K = hf − W 는 y = ax + b 꼴의 직선: 기울기 h, 가로 절편 f₀, 세로 절편 −W'
      },
      role: ['기울기 = h, 가로 절편 = f₀, 세로 절편 = −W', 'f₀보다 왼쪽에서는 K_max가 존재하지 않는다(광전자 없음)'],
      exam: '금속 A, B의 직선은 평행합니다. 가로 절편이 더 큰 쪽이 일함수가 큰 금속이고, 같은 f에서 K_max가 작습니다.',
      links: ['planck', 'threshold', 'work_function', 'kmax']
    },
    stopping: {
      name: '정지 전압', en: 'Stopping voltage', level: 'ref', view: 'graph',
      where: '광전자를 멈추게 하는 데 필요한 최소 역방향 전압 V_s = K_max / e',
      etym: {
        ko: '停止電壓(머무를 정, 그칠 지, 전기 전, 누를 압) → ‘멈추게 하는 전압’',
        en: 'stopping potential: 전자의 운동 에너지를 전기장이 모두 빼앗아 멈추게 하는 전위차',
        memo: 'K_max = eV_s. 정지 전압을 재면 K_max를 알 수 있고, 진동수가 클수록 정지 전압도 크다'
      },
      role: ['광전 효과에서 K_max를 실험으로 재는 방법', 'K_max가 1.5 eV이면 정지 전압은 1.5 V'],
      links: ['kmax']
    }
  },

  scenes: [
    {
      id: 'frequency', label: '진동수가 정한다', view: 'device',
      steps: [
        { text: '진동수가 문턱 진동수보다 작으면 광자 하나의 에너지가 일함수보다 작아 광전자가 나오지 않습니다. 세게, 오래 비춰도 마찬가지입니다.', part: 'threshold', set: { f: 3, I: 5, metal: 'na' }, ms: 6500 },
        { text: '진동수가 문턱 진동수를 넘으면 광전자가 튀어나옵니다. 남는 에너지 hf − W가 운동 에너지가 됩니다.', part: 'kmax', set: { f: 7, I: 5, metal: 'na' }, ms: 6500 },
        { text: '진동수를 더 높이면 광자 에너지가 커져 광전자의 최대 운동 에너지도 커집니다.', part: 'frequency', set: { f: 11, I: 5, metal: 'na' }, ms: 6000 }
      ]
    },
    {
      id: 'intensity', label: '세기가 정한다', view: 'device',
      steps: [
        { text: '진동수는 같게 두고 빛의 세기를 약하게 하면 광자 수가 적어 광전자도 적게 나옵니다.', part: 'intensity', set: { f: 8, I: 2, metal: 'na' }, ms: 6000 },
        { text: '빛을 세게 하면 광자 수가 늘어 광전자가 더 많이 나오지만, 광전자 하나하나의 최대 운동 에너지는 그대로입니다.', part: 'electron', set: { f: 8, I: 9, metal: 'na' }, ms: 6500 }
      ]
    },
    {
      id: 'graph', label: 'K–f 그래프 읽기', view: 'graph',
      steps: [
        { text: 'K_max = hf − W 는 직선입니다. 기울기는 플랑크 상수 h입니다.', part: 'planck', set: { metal: 'na', f: 8 }, ms: 5500 },
        { text: '가로 절편이 문턱 진동수 f₀, 세로 절편이 −W입니다.', part: 'threshold', ms: 5500 },
        { text: '금속을 바꾸면 직선이 평행 이동합니다. 일함수가 클수록 오른쪽으로 이동하고 기울기는 그대로입니다.', part: 'kf_line', set: { metal: 'zn' }, ms: 6500 }
      ]
    }
  ]
});
