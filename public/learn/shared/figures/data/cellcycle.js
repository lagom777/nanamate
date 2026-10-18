/* 염색체와 세포 주기·체세포 분열 그림 글 자료 — 염색체 구조 / 세포 주기. (감수 분열은 meiosis.js) */
NMFIG.data('cellcycle', {
  title: '염색체 구조와 세포 주기 · 체세포 분열',
  lead: '부분에 마우스를 올려 보세요(휴대폰은 누르기). 이름의 뜻과 하는 일이 나옵니다.',
  idle: '‘염색체’ 보기에서는 DNA가 어떻게 염색체가 되는지, ‘세포 주기’ 보기에서는 슬라이더를 끌어 시기마다 세포 속 염색체와 DNA 양이 어떻게 변하는지 볼 수 있습니다.',
  order: [
    'dna', 'histone', 'chromatin', 'chromosome', 'chromatid', 'centromere', 'homologous', 'gene', 'allele',
    'interphase', 'g1', 's_phase', 'g2', 'm_phase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis', 'spindle', 'equator'
  ],
  parts: {
    /* ───────── 염색체 구조 ───────── */
    dna: {
      name: 'DNA', en: 'DNA (Deoxyribonucleic acid)', level: 'core', view: 'chromosome',
      where: '유전 정보가 담긴 이중 나선 분자',
      etym: {
        ko: 'DNA = 디옥시리보 핵산. 핵(核)에서 처음 발견된 산(酸)성 물질이라 ‘핵산’, 당이 디옥시리보스라서 ‘디옥시리보’',
        en: 'deoxy(산소가 하나 없는)+ribo(리보스 당)+nucleic acid(핵산). nucleic은 라틴어 nucleus(핵)',
        memo: '핵(nucleus)에서 나온 산(acid) = 핵산. 염기 A–T, G–C가 짝을 이룬 이중 나선'
      },
      role: ['뉴클레오타이드(인산+당+염기)가 이어진 두 가닥이 꼬인 이중 나선', '염기 A=T, G≡C가 상보적으로 결합하며 유전 정보가 염기 서열로 저장된다'],
      exam: '이중 나선에서 A와 T의 수, G와 C의 수는 같습니다(상보성). 한 가닥의 서열을 알면 다른 가닥의 서열이 정해집니다.',
      links: ['histone', 'chromatin', 'gene']
    },
    histone: {
      name: '히스톤', en: 'Histone', level: 'core', view: 'chromosome',
      where: 'DNA가 감겨 있는 단백질 덩어리',
      etym: {
        ko: '히스톤(histone)은 외래어. 단백질 이름 끝 -one이 붙은 말',
        en: '독일어 Histon(1884년 코셀). 그리스어 histos(조직, 천)에서 왔다는 설이 있다',
        memo: '실(DNA)을 감는 ‘실패’ 역할의 단백질 — 길고 가는 DNA를 작게 접어 넣는다'
      },
      role: ['DNA가 히스톤 단백질에 감겨 응축된다', '이 덕분에 길이가 약 2 m인 사람 DNA가 현미경 크기의 핵에 들어간다'],
      links: ['dna', 'chromatin']
    },
    chromatin: {
      name: '염색질', en: 'Chromatin', level: 'core', view: 'chromosome',
      where: '간기 핵 속에서 풀려 있는 DNA + 단백질 (가는 실 모양)',
      etym: {
        ko: '染色質(물들 염, 빛 색, 바탕 질) → ‘염색약에 물드는 물질’. 염색사(絲)라고도 한다',
        en: '그리스어 chroma = 색, 빛깔. 1880년경 플레밍이 염색약에 잘 물드는 물질이라 chromatin이라 부름',
        memo: '염색질이 분열 직전에 똘똘 뭉쳐 응축되면 염색체 — 같은 물질의 풀린 상태 vs 뭉친 상태'
      },
      role: ['간기에는 풀려 있어 유전자가 발현되고 DNA 복제가 일어난다', '분열기에는 응축되어 염색체로 보인다'],
      exam: '염색질과 염색체는 같은 물질이 다른 모습으로 있는 것입니다. 간기=염색질(풀림), 분열기=염색체(응축).',
      links: ['chromosome', 'dna', 'histone']
    },
    chromosome: {
      name: '염색체', en: 'Chromosome', level: 'core', view: 'chromosome',
      where: '분열기에 DNA가 응축되어 나타나는 막대 모양 구조',
      etym: {
        ko: '染色體(물들 염, 빛 색, 몸 체) → ‘염색약에 물들어 보이는 몸’',
        en: '그리스어 chroma(색)+soma(몸) → ‘색깔 있는 몸’',
        memo: 'chroma=색 (monochrome=단색). 염색약에 짙게 물들어 처음 눈에 띈 데서'
      },
      role: ['DNA와 히스톤이 응축된 구조. 사람 체세포에는 46개(2n=46)', '복제된 뒤에는 동원체로 붙은 염색 분체 2개로 이루어진다'],
      exam: '염색체 수는 동원체의 수로 셉니다. 복제되어 염색 분체가 2개여도 염색체는 1개입니다.',
      links: ['chromatid', 'centromere', 'homologous']
    },
    chromatid: {
      name: '염색 분체', en: 'Chromatid', level: 'core', view: 'chromosome',
      where: '복제된 염색체를 이루는, 동원체로 붙은 두 가닥 각각',
      etym: {
        ko: '染色分體(물들 염, 빛 색, 나눌 분, 몸 체) → ‘염색체에서 갈라져 나온 몸’',
        en: 'chromat(그리스어 chroma 색)+-id(작은 것)',
        memo: '복제로 생긴 ‘쌍둥이 가닥’ 한 줄 — 분열 때 갈라지는 단위. 두 가닥은 유전 정보가 같다'
      },
      role: ['S기에 DNA가 복제되면 같은 염색체가 두 가닥(염색 분체)으로 붙어 있다', '체세포 분열 후기에 분리되어 각각 딸세포의 염색체가 된다'],
      exam: '염색 분체의 DNA는 같습니다(자매 염색 분체). 상동 염색체의 두 염색체는 부모 각각에서 온 서로 다른 염색체입니다.',
      links: ['centromere', 'chromosome']
    },
    centromere: {
      name: '동원체', en: 'Centromere', level: 'core', view: 'chromosome',
      where: '염색 분체가 서로 붙어 있는 잘록한 부위',
      etym: {
        ko: '動原體(움직일 동, 근원 원, 몸 체) → ‘염색체를 움직이는 근원’',
        en: 'centromere: 그리스어 kentron(중심)+meros(부분) → ‘중심 부분’',
        memo: '방추사가 달라붙어 염색체를 끌고 가는 ‘손잡이’'
      },
      role: ['두 염색 분체를 이어 주는 부위', '방추사가 붙어 염색체를 적도판으로, 다시 양극으로 끌어당긴다'],
      links: ['chromatid', 'spindle']
    },
    homologous: {
      name: '상동 염색체', en: 'Homologous chromosomes', level: 'core', view: 'chromosome',
      where: '크기·모양이 같은 한 쌍(부계 1, 모계 1)',
      etym: {
        ko: '相同(서로 상, 같을 동) → ‘서로 같은’ 염색체',
        en: '그리스어 homologos = 일치하는 (homos 같은+logos 말, 비율)',
        memo: '아버지·어머니에게서 하나씩 받은 ‘같은 짝’ (복제된 쌍둥이 염색 분체와 다르다)'
      },
      role: ['같은 위치에 같은 형질의 유전자를 가진다 (대립유전자는 다를 수 있음)', '사람의 2n=46은 상염색체 22쌍과 성염색체 1쌍'],
      exam: '상동 염색체는 부모가 각각 준 서로 다른 염색체입니다. 감수 1분열에서 이들이 분리됩니다.',
      links: ['gene', 'allele', 'chromatid']
    },
    gene: {
      name: '유전자', en: 'Gene', level: 'core', view: 'chromosome',
      where: '염색체(DNA)의 특정 구간, 하나의 형질 정보',
      etym: {
        ko: '遺傳子(남길 유, 전할 전, 아들/씨 자) → ‘대대로 전해지는 씨앗’',
        en: 'gene: 1909년 요한센이 만든 말. 그리스어 genos(태어남, 종족)에서. 다윈의 ‘판게네시스’의 pangene에서 따왔다고 알려져 있다',
        memo: 'genos(태어남·종족)에서 generation(세대), genetic(유전의), genesis(기원)까지 한 집안'
      },
      role: ['형질에 대한 정보를 가진 DNA의 한 부분', '염색체 위의 정해진 위치(유전자 자리)에 있다'],
      links: ['allele', 'dna', 'homologous']
    },
    allele: {
      name: '대립유전자', en: 'Allele', level: 'core', view: 'chromosome',
      where: '상동 염색체의 같은 위치에 있는, 한 형질에 대한 다른 형태의 유전자',
      etym: {
        ko: '對立遺傳子(대할 대, 설 립) → ‘서로 맞서는 유전자’',
        en: 'allele: 그리스어 allelon(서로서로)에서. 베이트슨이 allelomorph(서로의 형태)로 부른 데서 줄임',
        memo: '같은 자리를 두고 ‘서로 맞서는’ 유전자 쌍 (A와 a). 상동 염색체의 같은 위치에 하나씩'
      },
      role: ['상동 염색체의 같은 위치에 있는 한 쌍의 유전자 (예: A와 a)', '표현형은 대립유전자의 조합(유전자형)에 의해 결정된다'],
      exam: 'DNA 상대량 문제는 유전자형 Aa에서 A와 a의 DNA 상대량이 복제로 각각 1 → 2가 되는 것을 이용합니다.',
      links: ['gene', 'homologous']
    },

    /* ───────── 세포 주기 ───────── */
    interphase: {
      name: '간기', en: 'Interphase', level: 'core', view: 'cycle',
      where: 'G₁기 + S기 + G₂기. 세포 주기의 대부분(약 90 %)',
      etym: {
        ko: '間期(사이 간, 때 기) → ‘분열과 분열 사이의 시기’',
        en: 'inter(사이)+phase(시기·모습)',
        memo: '‘쉬는 시기’가 아니라 생장과 DNA 복제로 바쁜 시기. 세포 수가 가장 많은 시기가 가장 긴 시기'
      },
      role: ['세포가 생장하고 DNA를 복제하며 분열을 준비하는 시기', '핵막이 뚜렷하고 염색체는 풀린 염색질 상태'],
      exam: '세포 주기에서 간기가 가장 길어, 일정 시점에 관찰한 세포 대부분이 간기입니다.',
      links: ['g1', 's_phase', 'g2', 'm_phase']
    },
    g1: {
      name: 'G₁기', en: 'G₁ phase (Gap 1)', level: 'core', view: 'cycle',
      where: '분열이 끝난 뒤 DNA 복제 전의 시기',
      etym: {
        ko: 'G는 틈·간격을 뜻하는 Gap의 머리글자. M기(분열)와 S기(복제) 사이의 첫 번째 틈',
        en: 'gap: 사이의 틈. G₁ = 첫 번째 gap(DNA 합성 전의 간격)',
        memo: 'G=Gap(틈). 분열 직후 → 복제 전. 이 시기 세포의 핵 1개당 DNA 상대량을 1로 둔다'
      },
      role: ['세포가 자라고 단백질을 합성한다', '핵 1개당 DNA 상대량 = 1 (체세포는 핵상 2n)'],
      links: ['s_phase', 'interphase']
    },
    s_phase: {
      name: 'S기', en: 'S phase (Synthesis)', level: 'core', view: 'cycle',
      where: 'DNA가 복제되는 시기',
      etym: {
        ko: 'S는 합성(Synthesis)의 머리글자. 이 시기에 DNA를 새로 합성한다',
        en: 'synthesis: 그리스어 syn(함께)+thesis(놓음) → 합쳐 놓음',
        memo: 'S=Synthesis(합성)=DNA 복제. 상대량이 1 → 2로 늘어나는 구간'
      },
      role: ['DNA가 복제되어 염색체가 염색 분체 2개로 이루어진다', '핵 1개당 DNA 상대량이 1에서 2로 증가'],
      exam: '그래프에서 DNA 상대량이 1에서 2로 증가하는 구간이 S기입니다. 염색체 수는 변하지 않습니다.',
      links: ['g1', 'g2', 'chromatid']
    },
    g2: {
      name: 'G₂기', en: 'G₂ phase (Gap 2)', level: 'core', view: 'cycle',
      where: 'DNA 복제 뒤 분열 전의 시기',
      etym: {
        ko: 'G는 틈(Gap). S기(복제)와 M기(분열) 사이의 두 번째 틈',
        en: 'gap 2 — 복제를 마치고 분열을 준비하는 간격',
        memo: 'G₂기에는 이미 복제가 끝나 DNA 상대량이 2. 분열 준비(방추사 단백질 합성 등)'
      },
      role: ['분열에 필요한 단백질을 합성하고 DNA 복제 결과를 점검한다', '핵 1개당 DNA 상대량 = 2'],
      links: ['s_phase', 'm_phase']
    },
    m_phase: {
      name: '분열기(M기)', en: 'M phase (Mitosis)', level: 'core', view: 'cycle',
      where: '핵분열(전·중·후·말기)과 세포질 분열이 일어나는 시기',
      etym: {
        ko: 'M은 체세포 분열(Mitosis)의 머리글자. 分裂期(나눌 분, 찢을 렬, 때 기)',
        en: 'mitosis: 그리스어 mitos = 실 (분열 중 보이는 실 모양 구조) + -osis',
        memo: 'M=Mitosis=실. 염색체가 실처럼 보여서. 간기보다 훨씬 짧다'
      },
      role: ['핵분열(전기→중기→후기→말기)과 세포질 분열로 딸세포 2개가 만들어진다', '말기~세포질 분열에서 핵 1개당 DNA 상대량이 2 → 1'],
      links: ['prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis']
    },
    prophase: {
      name: '전기', en: 'Prophase', level: 'core', view: 'cycle',
      where: '분열기의 첫 단계',
      etym: {
        ko: '前期(앞 전, 때 기) → ‘분열의 앞 시기’',
        en: '그리스어 pro(앞)+phasis(나타남, 모습) → ‘앞의 모습’',
        memo: 'pro-=앞 (prologue=머리말). 염색체가 응축되어 처음 모습을 드러내고 핵막이 사라지기 시작'
      },
      role: ['염색체가 응축되어 뚜렷해진다(염색 분체 2개씩)', '핵막이 사라지고 방추사가 형성되기 시작한다'],
      links: ['metaphase', 'spindle']
    },
    metaphase: {
      name: '중기', en: 'Metaphase', level: 'core', view: 'cycle',
      where: '염색체가 세포 중앙에 한 줄로 배열되는 시기',
      etym: {
        ko: '中期(가운데 중, 때 기) → ‘분열의 가운데 시기’',
        en: '그리스어 meta(사이·중간, 또는 ~뒤)+phasis. 분열의 한가운데 모습',
        memo: '염색체가 가장 응축되어 한 줄로 서는 때 — 염색체를 세기 가장 좋은 시기(핵형 분석)'
      },
      role: ['염색체가 적도판에 배열되고 방추사가 동원체에 붙는다', '염색체가 가장 응축되어 핵형 분석에 쓰인다'],
      exam: '체세포 분열 중기에는 상동 염색체가 짝을 짓지 않고 각각 따로 적도판에 한 줄로 섭니다(감수 1분열 중기와 다름).',
      links: ['equator', 'spindle', 'prophase', 'anaphase']
    },
    anaphase: {
      name: '후기', en: 'Anaphase', level: 'core', view: 'cycle',
      where: '염색 분체가 분리되어 양극으로 이동하는 시기',
      etym: {
        ko: '後期(뒤 후, 때 기) → ‘분열의 뒤 시기’',
        en: '그리스어 ana(위로, 거꾸로, 다시)+phasis. 염색체가 양쪽으로 갈라져 올라가는 모습',
        memo: '염색 분체가 분리되어 ‘양극으로 끌려가는’ 때. 이 순간 세포 속 염색체 수는 일시적으로 2배'
      },
      role: ['염색 분체가 분리되어 각각 하나의 염색체가 되고 방추사가 줄어들며 양극으로 이동', '세포 전체의 염색체 수는 일시적으로 2배(예: 2n → 4n 개)'],
      exam: '체세포 분열 후기에 분리되는 것은 염색 분체입니다. 상동 염색체의 분리는 감수 1분열 후기입니다.',
      links: ['chromatid', 'spindle', 'telophase']
    },
    telophase: {
      name: '말기', en: 'Telophase', level: 'core', view: 'cycle',
      where: '양극에 도달한 염색체 둘레에 핵막이 다시 생기는 시기',
      etym: {
        ko: '末期(끝 말, 때 기) → ‘분열의 끝 시기’',
        en: '그리스어 telos(끝, 목적)+phasis. teleology(목적론)와 같은 뿌리',
        memo: 'telos=끝. 핵막이 다시 생기고 염색체는 풀어지기 시작 — 분열의 마무리'
      },
      role: ['양극에서 핵막이 다시 형성되고 염색체가 풀어진다', '이어서 세포질 분열이 일어난다'],
      links: ['cytokinesis', 'anaphase']
    },
    cytokinesis: {
      name: '세포질 분열', en: 'Cytokinesis', level: 'core', view: 'cycle',
      where: '핵분열 뒤 세포질이 갈라져 딸세포 2개가 완성되는 과정',
      etym: {
        ko: '細胞質分裂(가늘 세, 세포 포, 바탕 질, 나눌 분, 찢을 렬) → ‘세포질이 갈라짐’',
        en: '그리스어 kytos(세포)+kinesis(움직임). kinetic(운동의)과 같은 뿌리',
        memo: 'kine-=움직임. 핵이 먼저 나뉘고 세포질이 이어서 갈라진다. 동물은 잘록해지고 식물은 세포판이 생김'
      },
      role: ['동물 세포는 세포막이 안쪽으로 잘록해져 갈라지고, 식물 세포는 가운데에 세포판이 생긴다', '이 과정이 끝나면 딸세포의 핵 1개당 DNA 상대량은 1'],
      exam: 'DNA 상대량 2 → 1의 감소는 딸세포가 2개로 나뉠 때 일어납니다. 체세포 분열 결과 딸세포는 모세포와 유전적으로 같습니다.',
      links: ['telophase', 'g1']
    },
    spindle: {
      name: '방추사', en: 'Spindle fiber', level: 'core', view: 'cycle',
      where: '양극에서 뻗어 동원체에 붙는 실 모양 구조',
      etym: {
        ko: '紡錘絲(길쌈 방, 추 추, 실 사) → ‘실 감는 가락(방추)처럼 생긴 실’',
        en: 'spindle: 실을 감는 막대(가락)',
        memo: '양끝이 뾰족한 물레 가락 모양이라 방추 — 염색체를 ‘끌어당기는 밧줄’'
      },
      role: ['동원체에 붙어 염색체를 적도판에 배열시키고, 후기에 양극으로 끌어당긴다', '분열이 끝나면 사라진다'],
      links: ['centromere', 'metaphase', 'anaphase']
    },
    equator: {
      name: '적도판', en: 'Equatorial plate', level: 'ref', view: 'cycle',
      where: '중기에 염색체가 한 줄로 늘어서는 세포 중앙의 면',
      etym: {
        ko: '赤道板(붉을 적, 길 도, 널 판) → ‘적도 위치의 판’',
        en: 'equator: 라틴어 aequare = 같게 하다(양쪽을 같게 나누는 선)',
        memo: '지구의 적도처럼 세포를 양쪽으로 똑같이 나누는 한가운데 면'
      },
      role: ['염색체가 배열되는 가상의 면 (실제 구조물이 아니다)', '양극에서 오는 방추사의 힘이 균형을 이루는 면'],
      links: ['metaphase', 'spindle']
    }
  },

  scenes: [
    {
      id: 'chromosome', label: 'DNA에서 염색체까지', view: 'chromosome',
      steps: [
        { text: 'DNA는 염기쌍으로 이어진 이중 나선입니다.', part: 'dna', ms: 4500 },
        { text: 'DNA는 히스톤 단백질에 감겨 가는 염색질이 됩니다. 간기에는 이렇게 풀려 있습니다.', part: 'histone', ms: 5500 },
        { text: '분열기가 되면 염색질이 단단히 응축되어 막대 모양의 염색체가 됩니다.', part: 'chromosome', ms: 5500 },
        { text: '복제된 염색체는 동원체로 붙은 두 염색 분체로 이루어집니다. 상동 염색체의 같은 위치에는 대립유전자가 있습니다.', part: 'centromere', ms: 6500 }
      ]
    },
    {
      id: 'cycle', label: '세포 주기 한 바퀴', view: 'cycle',
      steps: [
        { text: 'G₁기: 세포가 자라는 시기. 핵 1개당 DNA 상대량은 1입니다.', part: 'g1', set: { pos: 0.1 }, ms: 5000 },
        { text: 'S기: DNA가 복제되어 상대량이 1에서 2로 늘어납니다. 염색체 수는 그대로입니다.', part: 's_phase', set: { pos: 0.42 }, ms: 5500 },
        { text: 'G₂기: 복제가 끝난 상태로 분열을 준비합니다. 상대량 2.', part: 'g2', set: { pos: 0.65 }, ms: 4500 },
        { text: '전기: 염색체가 응축되고 핵막이 사라집니다.', part: 'prophase', set: { pos: 0.78 }, ms: 4500 },
        { text: '중기: 염색체가 세포 중앙(적도판)에 한 줄로 늘어섭니다.', part: 'metaphase', set: { pos: 0.84 }, ms: 4500 },
        { text: '후기: 염색 분체가 분리되어 양극으로 이동합니다. 염색체 수가 일시적으로 2배.', part: 'anaphase', set: { pos: 0.9 }, ms: 5500 },
        { text: '말기와 세포질 분열: 딸세포 2개가 만들어지고 DNA 상대량은 다시 1이 됩니다.', part: 'cytokinesis', set: { pos: 0.97 }, ms: 5500 }
      ]
    }
  ]
});
