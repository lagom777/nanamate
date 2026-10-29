/* 뉴런 그림 글 자료 — 구조 / 활동 전위 / 시냅스. 그림 코드(figures/neuron.js)와 분리된 순수 내용.
 * etym: ko=한자/우리말 풀이, en=서양어 어원, memo=기억 팁. 불확실한 어원은 ‘~라는 설’로 표시. */
NMFIG.data('neuron', {
  title: '뉴런의 구조 · 활동 전위 · 시냅스',
  lead: '부위에 마우스를 올려 보세요(휴대폰은 누르기). 이름의 뜻과 하는 일이 나옵니다.',
  idle: '위쪽 버튼으로 ‘뉴런 구조’, ‘활동 전위’, ‘시냅스’ 보기를 바꿉니다. 활동 전위 보기에서는 슬라이더를 끌어 시간에 따라 이온 통로가 열리고 닫히는 모습을 볼 수 있습니다.',
  order: [
    'dendrite', 'soma', 'nucleus', 'axon', 'myelin', 'schwann', 'node', 'terminal',
    'resting', 'threshold', 'depolarization', 'peak', 'repolarization', 'hyperpolarization', 'na_channel', 'k_channel', 'nak_pump',
    'presynaptic', 'vesicle', 'ca_channel', 'neurotransmitter', 'cleft', 'receptor', 'postsynaptic'
  ],
  parts: {
    /* ───────── 뉴런 구조 ───────── */
    dendrite: {
      name: '가지 돌기', en: 'Dendrite', level: 'core', view: 'structure',
      where: '신경 세포체에서 나뭇가지처럼 뻗은 짧은 돌기들',
      etym: {
        ko: '나뭇가지 모양으로 뻗은 돌기라서 ‘가지 돌기’ (한자어로는 樹狀突起, 나무 수+모양 상+돌기)',
        en: '그리스어 dendron = 나무. rhododendron(장미 나무=진달래류), philodendron(나무를 사랑하는 식물)과 같은 뿌리',
        memo: 'dendro-=나무. 나뭇가지처럼 갈라져 다른 뉴런의 신호를 받는 ‘수신 안테나’'
      },
      role: ['다른 뉴런이나 감각기에서 오는 자극(신호)을 받아들인다', '받은 신호는 신경 세포체 쪽으로 향한다(가지 돌기 → 세포체 → 축삭)'],
      exam: '가지 돌기와 세포체는 ‘받는 쪽’, 축삭 돌기는 ‘내보내는 쪽’입니다. 흥분의 전달 방향은 한쪽으로만 정해져 있습니다.',
      links: ['soma', 'axon', 'postsynaptic']
    },
    soma: {
      name: '신경 세포체', en: 'Cell body (soma)', level: 'core', view: 'structure',
      where: '뉴런의 몸통. 핵과 세포 소기관이 모여 있다',
      etym: {
        ko: '神經(정신 신, 지날 경)+細胞體(가늘 세, 세포 포, 몸 체) → ‘신경 세포의 몸통’',
        en: '그리스어 soma = 몸. 몸(soma)에 관한 psychosomatic(심신의)에도 들어 있다',
        memo: '뉴런의 ‘몸통’ — 핵이 있고 단백질 합성·에너지 생산 같은 살림(대사)을 책임진다'
      },
      role: ['핵과 세포 소기관이 모여 있는 뉴런의 대사 중심', '가지 돌기에서 받은 신호를 모아 축삭으로 보낼지 정한다'],
      exam: '핵이 들어 있는 부분은 신경 세포체입니다. 말이집은 축삭 돌기에만 있습니다.',
      links: ['nucleus', 'dendrite', 'axon']
    },
    nucleus: {
      name: '핵', en: 'Nucleus', level: 'ref', view: 'structure',
      where: '신경 세포체 한가운데의 둥근 구조',
      etym: {
        ko: '核(씨 핵) → 과일의 ‘씨’처럼 세포 한가운데 들어 있는 것',
        en: '라틴어 nucleus = 견과의 알맹이, 속살(nux=견과의 지소형). nuclear(핵의)의 어원',
        memo: '호두 속 알맹이처럼 세포 중심에 들어 있는 ‘유전 정보 저장소’'
      },
      role: ['DNA가 들어 있어 단백질 합성을 지시하는 유전 정보의 보관소', '뉴런 한 개에 핵은 하나, 신경 세포체에 있다'],
      links: ['soma']
    },
    axon: {
      name: '축삭 돌기', en: 'Axon', level: 'core', view: 'structure',
      where: '신경 세포체에서 길게 뻗은 한 가닥의 돌기',
      etym: {
        ko: '軸索(굴대 축, 동아줄 삭) → ‘굴대처럼 곧게 뻗은 긴 줄’',
        en: '그리스어 axon = 축, 굴대. axis(축), axle(차축)과 같은 뿌리',
        memo: 'axis(축)와 한 집안 — 몸통에서 곧게 뻗은 한 줄기 ‘송신선’'
      },
      role: ['흥분(활동 전위)을 다음 뉴런이나 반응기(근육·샘)로 전달하는 긴 돌기', '말이집이 있는 것은 유수 축삭, 없는 것은 무수 축삭'],
      exam: '축삭 돌기는 신경 세포체에서 나가는 쪽입니다. 말이집 유무에 따라 전도 속도가 달라집니다.',
      links: ['myelin', 'node', 'terminal']
    },
    myelin: {
      name: '말이집', en: 'Myelin sheath', level: 'core', view: 'structure',
      where: '축삭을 마디마디 감싸고 있는 흰 절연막',
      etym: {
        ko: '髓鞘(골수 수, 칼집 초)의 우리말 순화어. ‘돌돌 말아 싼 집(껍질)’이라는 뜻',
        en: '그리스어 myelos = 골수, 속. 1854년 독일의 피르호가 신경을 감싼 흰 지방질 막에 myelin이라 이름 붙임',
        memo: '전선의 피복처럼 축삭을 감싼 ‘절연 껍질’ — 이 때문에 전기 신호가 새지 않고 빨리 달린다'
      },
      role: ['전기적 절연체 역할: 말이집 부분에서는 이온이 막을 드나들지 못한다', '그 덕분에 활동 전위가 마디(랑비에 결절)에서만 생겨 도약 전도가 일어난다'],
      exam: '말이집이 있으면 같은 굵기의 무수 신경보다 전도 속도가 빠르고 에너지도 덜 듭니다.',
      links: ['schwann', 'node']
    },
    schwann: {
      name: '슈반 세포', en: 'Schwann cell', level: 'ref', view: 'structure',
      where: '말이집을 이루는 세포. 말초 신경에서 축삭을 감싼다',
      etym: {
        ko: '독일의 생리학자 테오도어 슈반(1810~1882)의 이름에서. 그는 ‘모든 동물은 세포로 이루어져 있다’는 세포설도 제안했다',
        en: 'Schwann cell — 사람 이름(Schwann)이 그대로 붙은 이름',
        memo: '슈반 세포가 축삭을 ‘돌돌 말아’ 만든 껍질이 말이집'
      },
      role: ['말초 신경에서 축삭을 여러 겹으로 감싸 말이집을 만든다', '중추 신경에서는 비슷한 일을 희소 돌기 아교세포가 한다'],
      links: ['myelin']
    },
    node: {
      name: '랑비에 결절', en: 'Node of Ranvier', level: 'core', view: 'structure',
      where: '말이집과 말이집 사이, 축삭이 드러난 마디',
      etym: {
        ko: '프랑스 해부학자 루이앙투안 랑비에(1835~1922)가 발견해 붙은 이름. 結節(맺을 결, 마디 절) = 매듭, 마디',
        en: 'node: 라틴어 nodus = 매듭, 혹. 신경의 ‘매듭’이라는 뜻',
        memo: '전선 피복이 끊겨 맨살이 드러난 마디 — 활동 전위는 이 ‘맨살 마디’에서만 생긴다'
      },
      role: ['말이집이 끊겨 축삭이 노출된 부위. Na⁺·K⁺ 통로가 모여 있다', '활동 전위는 마디에서 마디로 건너뛰듯 일어난다(도약 전도)'],
      exam: '말이집 뉴런에서 활동 전위(막전위 변화)가 발생하는 곳은 랑비에 결절뿐입니다. 말이집으로 덮인 부분에서는 이온 이동이 일어나지 않습니다.',
      links: ['myelin', 'axon']
    },
    terminal: {
      name: '축삭 말단', en: 'Axon terminal', level: 'core', view: 'structure',
      where: '축삭 맨 끝의 부푼 곳. 다음 뉴런과 시냅스를 이룬다',
      etym: {
        ko: '軸索末端(굴대 축, 동아줄 삭, 끝 말, 끝 단) → ‘축삭의 맨 끝’',
        en: 'terminal: 라틴어 terminus = 경계, 끝 (terminal 역, terminate=끝내다와 같은 뿌리)',
        memo: '종착역(terminal)처럼 흥분이 마지막으로 도착하는 곳 — 여기서 신경 전달 물질이 나간다'
      },
      role: ['신경 전달 물질이 든 시냅스 소포가 모여 있다', '흥분이 도달하면 Ca²⁺이 들어오고 전달 물질이 시냅스 틈으로 방출된다'],
      links: ['axon', 'vesicle', 'presynaptic']
    },

    /* ───────── 활동 전위 (막전위 그래프) ───────── */
    resting: {
      name: '휴지 전위', en: 'Resting potential', level: 'core', view: 'ap',
      where: '자극이 없을 때의 막전위, 약 −70 mV (세포 안쪽이 바깥보다 음)',
      etym: {
        ko: '休止電位(쉴 휴, 그칠 지, 전기 전, 자리 위) → ‘쉬고 있을 때의 전기 높이’',
        en: 'resting(쉬는)+potential(전위; 라틴어 potentia = 힘, 가능성)',
        memo: '휴(休)=쉼. 신호가 없어도 막은 −70 mV로 ‘출발선에 서 있는’ 상태'
      },
      role: ['K⁺이 조금씩 새어 나가고 Na⁺–K⁺ 펌프가 계속 일해서 유지되는 안쪽 (−) 상태', '이온이 아주 안 움직이는 게 아니라 ‘들어오고 나가는 양이 균형’을 이룬 동적 상태'],
      exam: '휴지 전위에서는 K⁺ 통로가 일부 열려 K⁺이 확산으로 나가고, 펌프가 Na⁺·K⁺을 능동 수송합니다(ATP 소모).',
      links: ['nak_pump', 'depolarization']
    },
    threshold: {
      name: '역치', en: 'Threshold', level: 'core', view: 'ap',
      where: '활동 전위가 일어나기 위해 막전위가 넘어야 하는 값 (그림의 점선, 약 −55 mV)',
      etym: {
        ko: '閾値(문지방 역, 값 치) → ‘문턱 값’',
        en: 'threshold = 문턱, 문지방. 앞부분 thresh는 ‘밟다’를 뜻하는 옛 영어에서 왔다는 설이 있다',
        memo: '문턱을 넘어야 집 안으로 들어가듯, 역치를 넘어야 활동 전위가 생긴다. 못 넘으면 아무 일 없음'
      },
      role: ['활동 전위를 일으키는 최소 자극의 세기(막전위가 도달해야 하는 값)', '역치 미만이면 발생하지 않고, 역치 이상이면 자극이 세도 같은 크기의 활동 전위(실무율)'],
      exam: '자극이 세면 활동 전위의 ‘크기’가 커지는 것이 아니라 발생 ‘빈도’가 늘어납니다.',
      links: ['depolarization', 'peak']
    },
    depolarization: {
      name: '탈분극', en: 'Depolarization', level: 'core', view: 'ap',
      where: '막전위가 −70 mV에서 +30 mV 쪽으로 오르는 구간',
      etym: {
        ko: '脫分極(벗을 탈, 나눌 분, 극 극) → ‘분극(안 −, 밖 +)에서 벗어남’',
        en: 'de-(벗어남)+polarization(극을 이룸). polar는 그리스어 polos = 축, 극',
        memo: '탈(脫)=벗어남. 안이 (−)로 정돈돼 있던 극이 풀리며 (+) 쪽으로 가는 ‘오르막’'
      },
      role: ['Na⁺ 통로가 열려 Na⁺이 세포 안으로 확산해 들어온다', '안쪽이 (+) 쪽으로 바뀌며 막전위가 빠르게 올라간다'],
      exam: '그래프에서 오르는 구간 = 탈분극 = Na⁺ 유입이 우세한 구간입니다.',
      links: ['na_channel', 'peak']
    },
    peak: {
      name: '정점', en: 'Peak (+30 mV)', level: 'ref', view: 'ap',
      where: '활동 전위의 꼭대기, 약 +30 mV',
      etym: {
        ko: '頂點(정수리 정, 점 점) → ‘꼭대기 점’',
        en: 'peak: 뾰족하게 솟은 꼭대기를 뜻하는 말',
        memo: '여기서 Na⁺ 통로가 닫히고 K⁺ 통로가 열리며 방향이 뒤집힌다'
      },
      role: ['탈분극이 끝나고 재분극이 시작되는 지점', '이때 Na⁺ 통로는 닫히고 K⁺ 통로가 열린다'],
      links: ['depolarization', 'repolarization']
    },
    repolarization: {
      name: '재분극', en: 'Repolarization', level: 'core', view: 'ap',
      where: '막전위가 정점에서 다시 아래로 내려오는 구간',
      etym: {
        ko: '再分極(다시 재, 나눌 분, 극 극) → ‘다시 분극 상태로 돌아감’',
        en: 're-(다시)+polarization',
        memo: '재(再)=다시. K⁺이 빠져나가 (−)극이 ‘다시’ 세워지는 내리막'
      },
      role: ['K⁺ 통로가 열려 K⁺이 세포 밖으로 확산해 나간다', '안쪽의 (+) 전하가 줄어 막전위가 −70 mV 쪽으로 내려간다'],
      exam: '그래프에서 내리는 구간 = 재분극 = K⁺ 유출이 우세한 구간입니다. Na⁺ 통로는 이미 닫혀 있습니다.',
      links: ['k_channel', 'hyperpolarization']
    },
    hyperpolarization: {
      name: '과분극', en: 'Hyperpolarization', level: 'core', view: 'ap',
      where: '막전위가 휴지 전위(−70 mV)보다 더 낮아졌다가 돌아오는 구간',
      etym: {
        ko: '過分極(지날 과, 나눌 분, 극 극) → ‘극이 지나치게 벌어짐’',
        en: '그리스어 hyper = 위로, 지나치게 (hyperactive = 지나치게 활동적인)',
        memo: 'hyper-=넘침. K⁺ 통로가 늦게 닫혀 K⁺이 ‘좀 더’ 나가서 휴지 전위보다 더 음수가 된다'
      },
      role: ['재분극 후에도 K⁺ 통로가 잠깐 더 열려 있어 막전위가 −70 mV 아래(약 −80 mV)로 내려간다', '이후 K⁺ 통로가 닫히고 펌프와 누수로 −70 mV로 회복'],
      exam: '이 시기에는 같은 세기의 자극으로는 활동 전위가 잘 생기지 않습니다(불응기와 연결).',
      links: ['k_channel', 'resting']
    },
    na_channel: {
      name: 'Na⁺ 통로', en: 'Voltage-gated Na⁺ channel', level: 'core', view: 'ap',
      where: '세포막에 박힌 통로 단백질. 탈분극 때 열린다',
      etym: {
        ko: 'Na⁺(나트륨 이온)+통로. 나트륨은 소금·소다의 성분. 이온(ion)은 전기를 띤 원자',
        en: 'natrium: 라틴어 이름(원소 기호 Na의 유래; 영어 sodium은 soda에서). ion: 그리스어 ion = ‘가는 것’(전극으로 이동해 감; 1834년 패러데이)',
        memo: 'Na=natrium. 문(통로)이 열리면 바깥에 많은 Na⁺이 농도 차로 ‘쏟아져’ 들어온다'
      },
      role: ['막전위가 역치에 이르면 열려 Na⁺이 세포 안으로 유입 → 탈분극', '정점에서 닫혀 더 이상 Na⁺이 들어오지 않는다'],
      exam: '탈분극 구간에서는 Na⁺ 통로가 열려 있고, 재분극 구간에서는 Na⁺ 통로가 닫혀 있습니다.',
      links: ['depolarization', 'k_channel']
    },
    k_channel: {
      name: 'K⁺ 통로', en: 'Voltage-gated K⁺ channel', level: 'core', view: 'ap',
      where: '세포막의 통로 단백질. 재분극 때 열린다',
      etym: {
        ko: 'K⁺(칼륨 이온)+통로. 칼륨은 식물 재(잿물)에서 얻은 알칼리 성분',
        en: 'kalium: 아랍어 qali(재, 잿물)에서 온 라틴어 이름(원소 기호 K의 유래; 영어 potassium은 potash=솥의 재). alkali도 같은 뿌리',
        memo: 'K=kalium. 안쪽에 많은 K⁺이 문이 열리면 밖으로 ‘새어 나가며’ 막전위를 다시 끌어내린다'
      },
      role: ['탈분극이 진행되면 열려 K⁺이 세포 밖으로 유출 → 재분극', '닫히는 속도가 느려 과분극이 생긴다'],
      exam: '재분극 구간은 K⁺ 통로가 열린 구간입니다. 오르는 구간 = Na⁺ 유입, 내리는 구간 = K⁺ 유출로 외우세요.',
      links: ['repolarization', 'hyperpolarization', 'na_channel']
    },
    nak_pump: {
      name: 'Na⁺–K⁺ 펌프', en: 'Sodium–potassium pump', level: 'core', view: 'ap',
      where: '세포막의 단백질. 농도 차를 거슬러 Na⁺·K⁺을 옮긴다',
      etym: {
        ko: '나트륨(Na)+칼륨(K)+펌프 → ‘나트륨과 칼륨을 퍼 나르는 장치’',
        en: 'pump: 물을 퍼 올리는 장치. ‘능동 수송’은 에너지(ATP)를 써서 농도 차를 거슬러 이동시킴',
        memo: 'Na⁺ 3개는 밖으로, K⁺ 2개는 안으로 — ATP를 쓰며 휴지 전위의 농도 차를 계속 되살린다'
      },
      role: ['ATP를 써서 Na⁺ 3개를 밖으로, K⁺ 2개를 안으로 능동 수송', '활동 전위 직후 무너진 이온 농도 차를 원래대로 회복시킨다'],
      exam: '펌프는 ATP가 필요한 능동 수송, Na⁺·K⁺ 통로를 통한 이동은 에너지가 필요 없는 확산(촉진 확산)입니다.',
      links: ['resting', 'na_channel', 'k_channel']
    },

    /* ───────── 시냅스 ───────── */
    presynaptic: {
      name: '시냅스 이전 뉴런', en: 'Presynaptic neuron', level: 'core', view: 'synapse',
      where: '신경 전달 물질을 내보내는 쪽 뉴런의 축삭 말단',
      etym: {
        ko: '시냅스 이전(以前, 써 이, 앞 전) → ‘시냅스를 이루기 앞쪽의 뉴런’',
        en: 'pre-(앞)+synaptic(시냅스의). synapse: 그리스어 syn(함께)+haptein(붙잡다) → ‘서로 붙잡음’ (1897년 영국의 셰링턴)',
        memo: 'pre-=앞. 신호를 ‘먼저’ 보내는 쪽. syn-=함께 (synchronize=함께 맞춤)'
      },
      role: ['축삭 말단에 시냅스 소포를 가지고 있다', '활동 전위가 도달하면 신경 전달 물질을 시냅스 틈으로 방출'],
      exam: '시냅스 이전 뉴런 → 시냅스 이후 뉴런의 한 방향으로만 전달됩니다. 소포가 말단에만 있기 때문입니다.',
      links: ['vesicle', 'cleft', 'postsynaptic']
    },
    vesicle: {
      name: '시냅스 소포', en: 'Synaptic vesicle', level: 'core', view: 'synapse',
      where: '축삭 말단 안에 가득한 작은 주머니',
      etym: {
        ko: '小胞(작을 소, 주머니 포) → ‘작은 주머니’',
        en: 'vesicle: 라틴어 vesicula = 작은 방광, 물집 (vesica=방광)',
        memo: '신경 전달 물질을 담은 ‘작은 택배 상자’ — 터지듯 막에 합쳐지며 내용물을 쏟는다'
      },
      role: ['신경 전달 물질이 들어 있다', 'Ca²⁺이 유입되면 시냅스 이전 뉴런의 막과 융합해 전달 물질을 시냅스 틈으로 내보낸다(세포 외 배출)'],
      links: ['neurotransmitter', 'ca_channel']
    },
    ca_channel: {
      name: 'Ca²⁺ 통로', en: 'Ca²⁺ channel', level: 'core', view: 'synapse',
      where: '축삭 말단 막의 통로. 활동 전위가 도달하면 열린다',
      etym: {
        ko: 'Ca²⁺(칼슘 이온)+통로. 칼슘은 석회(石灰)에서 얻은 원소',
        en: 'calcium: 라틴어 calx(석회, 작은 돌 → calculus(계산, 결석)와도 한집안)',
        memo: '흥분이 말단에 도착 → Ca²⁺ 통로 열림 → Ca²⁺ 유입 → 소포가 터진다: 신호 전달의 ‘방아쇠’'
      },
      role: ['활동 전위가 말단에 이르면 열려 Ca²⁺이 시냅스 이전 뉴런 안으로 유입', 'Ca²⁺이 시냅스 소포의 방출을 일으킨다'],
      exam: '순서: 흥분 도달 → Ca²⁺ 유입 → 소포가 막과 융합 → 신경 전달 물질 방출 → 수용체에 결합.',
      links: ['vesicle', 'presynaptic']
    },
    neurotransmitter: {
      name: '신경 전달 물질', en: 'Neurotransmitter', level: 'core', view: 'synapse',
      where: '시냅스 틈을 건너는 화학 물질 (아세틸콜린, 노르에피네프린 등)',
      etym: {
        ko: '神經傳達物質(신경 신, 지날 경, 전할 전, 통달할 달, 물질 물, 바탕 질) → ‘신경 사이를 전해 주는 물질’',
        en: 'neuro(신경)+transmitter(trans 건너+mittere 보내다 → ‘건너 보내는 것’)',
        memo: '전기 신호는 틈을 건너지 못하니 ‘화학 택배’로 바꿔 건너 보낸다'
      },
      role: ['시냅스 틈으로 확산해 시냅스 이후 뉴런의 수용체에 결합', '흥분성이면 탈분극, 억제성이면 과분극을 일으킨다', '사용 후에는 분해되거나 다시 흡수되어 신호가 끝난다'],
      exam: '신경 전달 물질은 시냅스 이전 뉴런에서만 분비되므로 흥분 전달은 한 방향입니다. 전도(뉴런 안)보다 전달(시냅스)이 느립니다.',
      links: ['receptor', 'cleft']
    },
    cleft: {
      name: '시냅스 틈', en: 'Synaptic cleft', level: 'core', view: 'synapse',
      where: '두 뉴런 사이의 아주 좁은 틈(약 20 nm)',
      etym: {
        ko: '틈(순우리말) → 두 뉴런 사이의 벌어진 자리',
        en: 'cleft: 갈라진 틈. cleave(쪼개다·가르다)와 같은 뿌리',
        memo: '두 뉴런은 맞닿지 않고 아주 좁은 ‘틈’을 둔다 — 그래서 화학 물질로 건너야 한다'
      },
      role: ['신경 전달 물질이 확산해 건너는 좁은 공간', '뉴런이 서로 붙어 있지 않으므로 전기 신호가 직접 건너지 못한다'],
      links: ['neurotransmitter', 'presynaptic', 'postsynaptic']
    },
    receptor: {
      name: '수용체', en: 'Receptor', level: 'core', view: 'synapse',
      where: '시냅스 이후 뉴런 막에 있는 단백질. 전달 물질이 결합한다',
      etym: {
        ko: '受容體(받을 수, 받아들일 용, 몸 체) → ‘받아들이는 몸체’',
        en: 'receptor: 라틴어 recipere = 받다 (receive, recipe와 같은 뿌리)',
        memo: '열쇠(신경 전달 물질)에 꼭 맞는 ‘자물쇠’ — 맞는 수용체가 있는 세포만 신호에 반응한다'
      },
      role: ['신경 전달 물질이 결합하면 이온 통로가 열려 시냅스 이후 뉴런의 막전위가 변한다', '수용체는 가지 돌기나 세포체 쪽에 있다(축삭 말단 쪽에는 없다)'],
      exam: '수용체는 시냅스 이후 뉴런에만 있어, 전달 방향이 한쪽으로 정해집니다.',
      links: ['neurotransmitter', 'postsynaptic']
    },
    postsynaptic: {
      name: '시냅스 이후 뉴런', en: 'Postsynaptic neuron', level: 'core', view: 'synapse',
      where: '신경 전달 물질을 받는 쪽 뉴런의 가지 돌기·세포체',
      etym: {
        ko: '시냅스 이후(以後, 써 이, 뒤 후) → ‘시냅스 뒤쪽의 뉴런’',
        en: 'post-(뒤)+synaptic. post-는 postscript(추신), postpone(미루다)에도 쓰인다',
        memo: 'post-=뒤. 신호를 ‘나중에’ 받는 쪽. 막전위가 변하면 새 활동 전위가 생길 수 있다'
      },
      role: ['수용체로 신경 전달 물질을 받아 막전위가 변한다', '흥분성 전달이면 탈분극, 역치를 넘으면 새 활동 전위를 일으킨다'],
      links: ['receptor', 'presynaptic', 'dendrite']
    }
  },

  scenes: [
    {
      id: 'ap', label: '활동 전위 따라가기', view: 'ap',
      steps: [
        { text: '자극이 없는 휴지 상태. 막전위는 약 −70 mV이고, Na⁺–K⁺ 펌프가 이온 농도 차를 유지합니다.', part: 'resting', set: { t: 0.2 }, ms: 4500 },
        { text: '자극으로 막전위가 역치(약 −55 mV)에 도달하면 Na⁺ 통로가 열립니다.', part: 'threshold', set: { t: 0.8 }, ms: 4500 },
        { text: '탈분극: Na⁺이 세포 안으로 들어와 막전위가 +30 mV 부근까지 빠르게 올라갑니다.', part: 'depolarization', set: { t: 1.1 }, ms: 4500 },
        { text: '정점에서 Na⁺ 통로가 닫히고 K⁺ 통로가 열리기 시작합니다.', part: 'peak', set: { t: 1.3 }, ms: 4500 },
        { text: '재분극: K⁺이 세포 밖으로 나가면서 막전위가 다시 내려옵니다.', part: 'repolarization', set: { t: 2.0 }, ms: 4500 },
        { text: '과분극: K⁺ 통로가 늦게 닫혀 막전위가 −70 mV보다 잠깐 더 낮아졌다가 펌프와 누수로 휴지 전위를 되찾습니다.', part: 'hyperpolarization', set: { t: 3.5 }, ms: 5500 }
      ]
    },
    {
      id: 'conduct', label: '흥분의 전도 → 전달', view: 'structure',
      steps: [
        { text: '가지 돌기와 신경 세포체가 자극을 받습니다.', part: 'dendrite', set: { pulse: 0.04 }, ms: 4000 },
        { text: '신경 세포체를 지난 흥분이 축삭 돌기로 나갑니다.', part: 'soma', set: { pulse: 0.2 }, ms: 4000 },
        { text: '말이집으로 덮인 부분은 절연되어 있어, 활동 전위는 랑비에 결절에서만 일어나며 마디에서 마디로 건너뜁니다(도약 전도).', part: 'node', set: { pulse: 0.55 }, ms: 6000 },
        { text: '흥분이 축삭 말단에 도달하면 시냅스에서 신경 전달 물질이 방출되어 다음 뉴런으로 전달됩니다.', part: 'terminal', set: { pulse: 0.97 }, ms: 5500 }
      ]
    },
    {
      id: 'synapse', label: '시냅스 전달', view: 'synapse',
      steps: [
        { text: '활동 전위가 시냅스 이전 뉴런의 축삭 말단에 도달합니다.', part: 'presynaptic', set: { s: 0.05 }, ms: 4000 },
        { text: 'Ca²⁺ 통로가 열려 Ca²⁺이 말단 안으로 들어옵니다.', part: 'ca_channel', set: { s: 0.25 }, ms: 4000 },
        { text: '시냅스 소포가 막과 융합해 신경 전달 물질을 시냅스 틈으로 방출합니다.', part: 'vesicle', set: { s: 0.5 }, ms: 4500 },
        { text: '신경 전달 물질이 틈을 확산해 시냅스 이후 뉴런의 수용체에 결합하고, 막전위가 변합니다. 전달은 한 방향입니다.', part: 'receptor', set: { s: 0.85 }, ms: 6000 }
      ]
    }
  ]
});
