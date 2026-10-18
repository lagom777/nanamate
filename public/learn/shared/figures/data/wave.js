/* 파동의 성질 그림 글 자료 — 마루·골·파장·진폭·주기·진동수 / 횡파·종파. v = fλ. */
NMFIG.data('wave', {
  title: '파동의 용어 — 마루 · 골 · 파장 · 진폭',
  lead: '파동의 부분에 마우스를 올려 보세요(휴대폰은 누르기). 슬라이더로 파장·진폭·진동수를 바꿀 수 있습니다.',
  idle: '‘공간 그래프’는 한 순간의 모양(파장을 읽음), ‘시간 그래프’는 한 지점의 진동(주기를 읽음), ‘종파’는 소리처럼 진행 방향과 나란히 진동하는 파동입니다. 매질의 입자는 제자리에서 진동할 뿐 파동과 함께 이동하지 않습니다.',
  order: [
    'crest', 'trough', 'amplitude', 'wavelength', 'equilibrium', 'particle', 'direction', 'medium',
    'period', 'frequency', 'speed', 'transverse', 'longitudinal', 'compression', 'rarefaction'
  ],
  parts: {
    crest: {
      name: '마루', en: 'Crest', level: 'core', view: 'space',
      where: '파동에서 변위가 (+) 방향으로 가장 큰 곳, 가장 높은 점',
      etym: {
        ko: '마루(순우리말) = 가장 높은 곳. 산마루(산등성이), 용마루(지붕 꼭대기)의 그 마루',
        en: 'crest: 라틴어 crista = 닭의 볏, 깃 장식. 투구 위의 장식(볏)처럼 가장 높이 솟은 곳',
        memo: '산 위의 산마루처럼 파동이 가장 높이 솟은 곳. 마루와 마루 사이가 1파장'
      },
      role: ['변위가 최대인 (+)쪽 꼭대기', '이웃한 마루와 마루 사이의 거리가 파장'],
      exam: '물결파 사진에서 마루와 마루가 만나는 곳이 보강 간섭, 마루와 골이 만나는 곳이 상쇄 간섭입니다.',
      links: ['trough', 'wavelength', 'amplitude']
    },
    trough: {
      name: '골', en: 'Trough', level: 'core', view: 'space',
      where: '변위가 (−) 방향으로 가장 큰 곳, 가장 낮은 점',
      etym: {
        ko: '골(순우리말) = 움푹 들어간 곳. 골짜기, 고랑의 그 골',
        en: 'trough: 옛 영어 trog = 구유, 여물통. 파도 사이가 구유처럼 오목해서',
        memo: '골짜기(골)처럼 푹 꺼진 곳. 골과 골 사이도 1파장'
      },
      role: ['변위가 최소인 (−)쪽 가장 낮은 점', '마루와 골은 반 파장(λ/2) 떨어져 있다'],
      links: ['crest', 'wavelength', 'amplitude']
    },
    amplitude: {
      name: '진폭', en: 'Amplitude', level: 'core', view: 'space',
      where: '평형 위치(중심선)에서 마루(또는 골)까지의 거리',
      etym: {
        ko: '振幅(떨칠 진, 폭 폭) → ‘흔들리는 폭’',
        en: 'amplitude: 라틴어 amplitudo = 넓음, 크기 (amplus 넓은; amplifier=증폭기도 같은 뿌리)',
        memo: '진(振)=흔들림, 폭(幅)=너비. 진폭이 클수록 파동의 에너지가 크다 (소리는 크게, 빛은 밝게)'
      },
      role: ['중심선에서 마루까지의 높이 A (마루–골 사이 높이의 절반)', '진폭이 클수록 파동이 전달하는 에너지가 크다'],
      exam: '마루–골 높이 차를 진폭으로 착각하기 쉽습니다. 진폭은 중심선에서 한쪽 끝까지, 즉 절반입니다. 진폭은 파장·진동수·속력과는 무관합니다.',
      links: ['crest', 'trough', 'equilibrium']
    },
    wavelength: {
      name: '파장', en: 'Wavelength', level: 'core', view: 'space',
      where: '이웃한 마루와 마루(또는 골과 골) 사이의 거리, 기호 λ',
      etym: {
        ko: '波長(물결 파, 길 장) → ‘물결의 길이’',
        en: 'wavelength: wave(파)+length(길이). 기호 λ(람다)는 그리스 문자',
        memo: '파(波)=물결, 장(長)=길이. 파동이 한 번 진동하는 동안 진행한 거리. 공간 그래프에서 읽는다'
      },
      role: ['파동의 한 사이클이 차지하는 공간의 길이 (단위 m)', 'v = fλ 이므로 속력이 같으면 진동수가 클수록 파장이 짧다'],
      exam: '매질이 바뀌면 진동수는 그대로이고 속력과 파장이 함께 변합니다. 변위–위치 그래프에서만 파장을 읽을 수 있습니다.',
      links: ['crest', 'period', 'speed']
    },
    equilibrium: {
      name: '평형 위치', en: 'Equilibrium position', level: 'core', view: 'space',
      where: '파동이 없을 때 매질이 있던 자리 (그림의 가운데 직선, 변위 0)',
      etym: {
        ko: '平衡位置(평평할 평, 저울대 형, 자리 위, 둘 치) → ‘저울이 수평일 때의 자리’',
        en: 'equilibrium: 라틴어 aequus(같은)+libra(저울) → 양쪽이 같은 상태',
        memo: '저울이 수평이면 기울지 않듯, 파동이 없을 때 가만히 있는 자리. 변위는 여기서부터 잰다'
      },
      role: ['변위를 재는 기준선(변위 = 0)', '매질의 각 입자는 이 자리를 중심으로 위아래로 진동한다'],
      links: ['amplitude', 'particle']
    },
    particle: {
      name: '매질의 입자', en: 'Medium particle', level: 'core', view: 'space',
      where: '그림의 한 점(빨간 점). 제자리에서 위아래로만 진동한다',
      etym: {
        ko: '粒子(낟알 립, 아들 자) → ‘낟알 같은 작은 조각’. 매질의 한 부분',
        en: 'particle: 라틴어 particula = 작은 부분 (pars 부분의 지소형)',
        memo: '“파동은 이동해도 매질은 이동하지 않는다” — 관중의 파도타기에서 사람은 제자리에서 일어났다 앉을 뿐'
      },
      role: ['파동이 지나갈 때 평형 위치를 중심으로 진동만 한다', '횡파에서는 진행 방향에 수직으로, 종파에서는 나란히 진동'],
      exam: '“매질이 파동과 함께 이동한다”는 보기는 틀립니다. 파동은 에너지와 진동 상태를 전달할 뿐 매질은 제자리입니다.',
      links: ['equilibrium', 'medium', 'period']
    },
    direction: {
      name: '진행 방향', en: 'Direction of propagation', level: 'core', view: 'space',
      where: '파동이 나아가는 방향 (그림의 화살표)',
      etym: {
        ko: '進行方向(나아갈 진, 갈 행, 모 방, 향할 향) → ‘나아가는 쪽’',
        en: 'propagate: 라틴어 propagare = 퍼뜨리다, 번식시키다',
        memo: '파동의 모양이 오른쪽으로 밀려가는 것처럼 보여도, 점들은 위아래로만 움직인다'
      },
      role: ['파동의 모양(에너지)이 전달되는 방향', '횡파는 진동 방향 ⊥ 진행 방향, 종파는 진동 방향 ∥ 진행 방향'],
      exam: '그래프로 한 점의 다음 진동 방향을 묻는 문제는, 진행 방향으로 파형을 아주 조금 밀어 보고 그 점이 올라가는지 내려가는지를 봅니다.',
      links: ['particle', 'transverse', 'longitudinal']
    },
    medium: {
      name: '매질', en: 'Medium', level: 'core', view: 'space',
      where: '파동을 전달해 주는 물질 (물결파의 물, 소리의 공기, 줄의 줄)',
      etym: {
        ko: '媒質(중매 매, 바탕 질) → ‘파동을 중매하는(이어 주는) 물질’',
        en: 'medium: 라틴어 medius = 가운데. 가운데에서 전하는 것',
        memo: '매(媒)=중매. 파동이 한 곳에서 다른 곳으로 가도록 ‘이어 주는 물질’. 소리는 매질이 필수, 전자기파는 진공도 가능'
      },
      role: ['파동의 속력은 매질이 정한다 (진동수는 파원이 정함)', '소리(역학적 파동)는 매질이 있어야 전달되고, 빛(전자기파)은 진공에서도 전달'],
      links: ['speed', 'particle']
    },
    period: {
      name: '주기', en: 'Period', level: 'core', view: 'time',
      where: '한 점이 한 번 진동하는 데 걸리는 시간, 기호 T (단위 s)',
      etym: {
        ko: '周期(두루 주, 기약할 기) → ‘한 바퀴 도는 데 걸리는 때’',
        en: 'period: 그리스어 periodos = 한 바퀴 돎, 순환 (peri 둘레+hodos 길)',
        memo: '주(周)=한 바퀴. 변위–시간 그래프에서 마루에서 마루까지 시간. T = 1/f'
      },
      role: ['한 번 진동(마루→골→마루)하는 시간 T', '시간 그래프에서 읽는다: 마루와 마루 사이의 시간 간격'],
      exam: '변위–시간 그래프의 가로축은 시간이므로 읽을 수 있는 것은 주기(T)입니다. 파장은 읽을 수 없습니다.',
      links: ['frequency', 'wavelength', 'speed']
    },
    frequency: {
      name: '진동수', en: 'Frequency', level: 'core', view: 'time',
      where: '1초 동안 진동하는 횟수, 기호 f (단위 Hz)',
      etym: {
        ko: '振動數(떨칠 진, 움직일 동, 셈 수) → ‘흔들리는 횟수’. 단위 헤르츠(Hz)는 독일 물리학자 하인리히 헤르츠(1857~1894)의 이름',
        en: 'frequency: 라틴어 frequentia = 자주 일어남 (frequens 빈번한 → frequent)',
        memo: 'frequent(자주)에서 온 말 — “1초에 얼마나 자주 흔들리나”. f = 1/T. 진동수는 파원이 정한다'
      },
      role: ['1초 동안 지나가는 파동의 개수 = 1/주기', '매질이 바뀌어도 진동수는 변하지 않는다'],
      links: ['period', 'speed']
    },
    speed: {
      name: '파동의 속력 v = fλ', en: 'Wave speed', level: 'core',
      where: '파동의 모양이 나아가는 빠르기',
      etym: {
        ko: '速力(빠를 속, 힘 력) → ‘빠르기의 크기’. v는 속도(velocity)의 머리글자',
        en: 'speed: 옛 영어 spēd = 성공, 번영, 빠름. v = f × λ',
        memo: '1초에 f개의 파동이, 한 개마다 λ만큼 → 1초에 fλ만큼 나아간다 (v = λ/T 와 같은 식)'
      },
      role: ['v = fλ = λ/T', '속력은 매질이 정하고, 진동수는 파원이 정한다. 그래서 매질이 바뀌면 f는 그대로, v와 λ가 함께 변한다'],
      exam: '“f가 두 배가 되면 v도 두 배”라는 보기는 틀립니다. 같은 매질에서 f가 커지면 λ가 짧아지고 속력은 그대로입니다.',
      links: ['frequency', 'wavelength', 'medium']
    },
    transverse: {
      name: '횡파', en: 'Transverse wave', level: 'core', view: 'space',
      where: '매질의 진동 방향이 진행 방향에 수직인 파동 (물결, 줄의 파동, 빛)',
      etym: {
        ko: '橫波(가로 횡, 물결 파) → ‘가로로 흔들리는 파동’',
        en: 'transverse: 라틴어 trans(가로질러)+vertere(돌리다) → ‘가로지르는’',
        memo: '횡(橫)=가로. 줄을 위아래로 흔들면 파동은 옆으로 간다 — 마루와 골이 보이는 파동'
      },
      role: ['마루와 골이 있다', '예: 줄의 파동, 물결파(근사적으로), 빛 등 전자기파'],
      links: ['longitudinal', 'crest', 'trough']
    },
    longitudinal: {
      name: '종파', en: 'Longitudinal wave', level: 'core', view: 'long',
      where: '매질의 진동 방향이 진행 방향과 나란한 파동 (소리, 용수철의 소밀파)',
      etym: {
        ko: '縱波(세로 종, 물결 파) → ‘세로(진행 방향)로 흔들리는 파동’',
        en: 'longitudinal: 라틴어 longitudo = 길이 (longus 긴) → ‘길이 방향의’',
        memo: '종(縱)=세로. 소리는 공기가 앞뒤로 밀렸다 당겨지며 가는 종파라서 매질이 꼭 필요하다'
      },
      role: ['매질이 촘촘한 곳(밀)과 성긴 곳(소)이 번갈아 나타난다 (소밀파)', '예: 소리, 용수철을 앞뒤로 밀고 당길 때, 지진파의 P파'],
      exam: '종파에서 파장은 이웃한 밀한 곳 사이의 거리입니다. 마루와 골은 변위–위치 그래프로 바꿔 그렸을 때의 표현입니다.',
      links: ['compression', 'rarefaction', 'transverse']
    },
    compression: {
      name: '밀', en: 'Compression', level: 'core', view: 'long',
      where: '종파에서 매질이 가장 촘촘히 모인 곳',
      etym: {
        ko: '密(빽빽할 밀) → ‘빽빽한 곳’',
        en: 'compression: 라틴어 comprimere = 함께 누르다 (com 함께+premere 누르다)',
        memo: '밀(密)=빽빽함. 소밀파의 “밀” — 압력이 높은 곳'
      },
      role: ['입자들이 모여 압력과 밀도가 높은 곳', '이웃한 밀과 밀 사이의 거리가 파장'],
      links: ['rarefaction', 'longitudinal']
    },
    rarefaction: {
      name: '소', en: 'Rarefaction', level: 'core', view: 'long',
      where: '종파에서 매질이 가장 성긴 곳',
      etym: {
        ko: '疏(성길 소) → ‘성긴(듬성한) 곳’',
        en: 'rarefaction: 라틴어 rarefacere = 성기게 하다 (rarus 드문+facere 만들다) → rare(드문)와 같은 뿌리',
        memo: '소(疏)=성김. 소밀파의 “소” — 압력이 낮은 곳'
      },
      role: ['입자들이 흩어져 압력과 밀도가 낮은 곳', '밀과 소는 반 파장(λ/2) 간격으로 번갈아 나타난다'],
      links: ['compression', 'longitudinal']
    }
  },

  scenes: [
    {
      id: 'terms', label: '용어 알아보기', view: 'space',
      steps: [
        { text: '마루는 변위가 (+)로 가장 큰 곳, 골은 (−)로 가장 큰 곳입니다.', part: 'crest', set: { wl: 2, amp: 0.6 }, ms: 4500 },
        { text: '진폭은 평형 위치에서 마루(또는 골)까지의 거리입니다. 마루–골 높이 차의 절반입니다.', part: 'amplitude', set: { amp: 1.0 }, ms: 5000 },
        { text: '파장은 이웃한 마루와 마루 사이의 거리입니다. 파장이 길면 같은 속력에서 진동수가 작습니다.', part: 'wavelength', set: { wl: 3.0 }, ms: 5500 },
        { text: '붉은 점은 매질의 한 입자입니다. 파동은 오른쪽으로 가지만 점은 제자리에서 위아래로만 움직입니다.', part: 'particle', ms: 5500 }
      ]
    },
    {
      id: 'graphs', label: '두 그래프 구별', view: 'time',
      steps: [
        { text: '변위–시간 그래프는 한 지점의 진동을 시간 순서로 그린 것입니다. 마루에서 마루까지 시간이 주기 T입니다.', part: 'period', ms: 6000 },
        { text: '주기와 진동수는 역수입니다: f = 1/T. 파장은 이 그래프에서 읽을 수 없습니다.', part: 'frequency', ms: 5500 },
        { text: '속력 v = fλ. 공간 그래프에서 λ를, 시간 그래프에서 T를 읽어 속력을 구합니다.', part: 'speed', ms: 6000 }
      ]
    },
    {
      id: 'sound', label: '소리(종파)', view: 'long',
      steps: [
        { text: '종파에서는 매질이 진행 방향과 나란히 진동하며 촘촘한 곳(밀)과 성긴 곳(소)이 번갈아 지나갑니다.', part: 'longitudinal', ms: 6000 },
        { text: '밀과 밀 사이의 거리가 파장입니다. 소리는 이처럼 매질이 있어야 전달되는 종파입니다.', part: 'compression', ms: 5500 }
      ]
    }
  ]
});
