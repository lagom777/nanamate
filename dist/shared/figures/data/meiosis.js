/* 감수 분열 그림 글 자료 — 2n=4 세포가 n=2 생식세포 4개가 되기까지. */
NMFIG.data('meiosis', {
  title: '감수 분열 — 염색체 수가 반으로 줄어드는 과정',
  lead: '단계나 용어에 마우스를 올려 보세요(휴대폰은 누르기). 슬라이더를 끌면 세포 속 염색체와 DNA 양이 어떻게 변하는지 볼 수 있습니다.',
  idle: '세포는 2n=4(빨강 = 어머니 유래, 파랑 = 아버지 유래)로 단순화했습니다. 감수 1분열에서 상동 염색체가 갈라져 염색체 수가 반감되고, 감수 2분열에서 염색 분체가 갈라집니다.',
  order: [
    'interphase', 'meiosis1', 'prophase1', 'bivalent', 'crossing', 'metaphase1', 'anaphase1', 'telophase1',
    'meiosis2', 'prophase2', 'anaphase2', 'telophase2', 'gamete', 'nuclear_phase', 'dna_rel'
  ],
  parts: {
    interphase: {
      name: '간기 (G₁ → S → G₂)', en: 'Interphase', level: 'core', view: 'steps',
      where: '감수 분열 전, DNA가 복제되는 시기',
      etym: {
        ko: '間期(사이 간, 때 기) → ‘분열과 분열 사이’',
        en: 'inter(사이)+phase(시기)',
        memo: '감수 분열에서도 DNA 복제는 간기의 S기에 딱 1번만 일어난다. 분열은 2번이지만 복제는 1번'
      },
      role: ['S기에 DNA가 복제되어 염색체가 염색 분체 2개씩이 된다', 'G₁기 세포의 DNA 상대량을 1로 하면, G₂기 세포(복제 후)는 2'],
      exam: '감수 분열: DNA 복제 1회, 분열 연속 2회. 이 대응이 DNA 상대량 문제의 출발점입니다.',
      links: ['meiosis1', 'dna_rel']
    },
    meiosis1: {
      name: '감수 1분열', en: 'Meiosis I', level: 'core', view: 'steps',
      where: '상동 염색체가 분리되어 염색체 수가 반으로 줄어드는 분열',
      etym: {
        ko: '減數(덜 감, 셈 수) 第一(차례 제, 한 일) 分裂 → ‘수를 덜어 내는 첫 번째 분열’',
        en: 'meiosis: 그리스어 meioun = 줄이다, 작게 하다. 감수 분열이란 이름은 염색체 수(數)가 감(減)소하는 데서',
        memo: '감수=수가 감소. 2n → n이 일어나는 것은 바로 이 1분열. 상동 염색체가 갈라진다'
      },
      role: ['전기에 2가 염색체를 이루고, 중기에 적도판에 상동 염색체 쌍이 배열', '후기에 상동 염색체가 분리되어 말기 후 핵상이 n인 세포 2개가 된다'],
      exam: '핵상 2n → n이 되는 것은 감수 1분열입니다. 염색 분체 분리는 감수 2분열이라는 점이 단골 함정입니다.',
      links: ['prophase1', 'anaphase1', 'telophase1', 'meiosis2']
    },
    prophase1: {
      name: '감수 1분열 전기', en: 'Prophase I', level: 'core', view: 'steps',
      where: '복제된 상동 염색체가 짝을 짓는 시기',
      etym: {
        ko: '前期(앞 전, 때 기) → ‘분열의 앞 시기’',
        en: '그리스어 pro(앞)+phasis(나타남, 모습). 감수 분열에서는 가장 길고 복잡한 시기',
        memo: '염색체가 뚜렷해지고 상동 염색체끼리 찰싹 붙어 2가 염색체를 만든다'
      },
      role: ['상동 염색체가 접합하여 2가 염색체를 형성한다 (염색 분체 4개)', '이때 교차가 일어날 수 있다'],
      links: ['bivalent', 'crossing', 'metaphase1']
    },
    bivalent: {
      name: '2가 염색체', en: 'Bivalent', level: 'core', view: 'steps',
      where: '상동 염색체 2개가 접합한 구조 (염색 분체 4개)',
      etym: {
        ko: '二價染色體(두 이, 값 가, 염색체) → ‘두 개가 한 묶음인 염색체’. 價=결합하는 수',
        en: 'bi(둘)+valent(라틴어 valere 가치가 있다; 결합가)',
        memo: '상동 염색체 2개가 짝지어 한 묶음(2가)이 됨 — 교차는 이때 일어난다'
      },
      role: ['상동 염색체 두 개가 나란히 붙은 덩어리. 염색 분체는 모두 4개', '중기에 이 상태로 적도판에 배열된다'],
      exam: '2가 염색체는 감수 1분열 전기~중기에만 있습니다. 체세포 분열에서는 만들어지지 않습니다.',
      links: ['prophase1', 'crossing', 'metaphase1']
    },
    crossing: {
      name: '교차', en: 'Crossing over', level: 'core', view: 'steps',
      where: '2가 염색체에서 상동 염색체의 염색 분체 일부가 서로 교환되는 현상',
      etym: {
        ko: '交叉(사귈 교, 갈래 차) → ‘엇갈려 맞바꿈’',
        en: 'crossing over — 염색체가 서로 가로질러(cross) 넘어가(over) 교환',
        memo: '엇갈려 맞바꾸는 ‘X자 교환’ — 유전자 재조합과 유전적 다양성의 원천'
      },
      role: ['상동 염색체의 비자매 염색 분체 사이에서 일부가 교환된다', '새로운 유전자 조합이 생겨 유전적 다양성이 커진다'],
      exam: '수능 DNA 상대량 문제에는 늘 “교차는 고려하지 않는다”가 붙습니다. 그래도 개념은 감수 1분열 전기에 일어난다는 점을 기억하세요.',
      links: ['bivalent', 'prophase1']
    },
    metaphase1: {
      name: '감수 1분열 중기', en: 'Metaphase I', level: 'core', view: 'steps',
      where: '2가 염색체가 적도판에 배열되는 시기',
      etym: {
        ko: '中期(가운데 중, 때 기) → ‘분열의 가운데 시기’',
        en: '그리스어 meta(사이·중간)+phasis',
        memo: '2가 염색체(쌍)가 한 줄로 서는 때 — 쌍마다 방향이 무작위라서 생식세포 종류가 2ⁿ가지'
      },
      role: ['2가 염색체가 적도판에 배열되고 방추사가 붙는다', '각 쌍의 배열 방향이 무작위여서 유전적 다양성이 생긴다'],
      exam: '감수 1분열 중기 세포: 핵상 2n, 염색체 수 2n, 상동 염색체 쌍마다 염색 분체가 4개. 이 세포의 DNA 상대량은 2(G₁기를 1로 할 때)입니다.',
      links: ['bivalent', 'anaphase1']
    },
    anaphase1: {
      name: '감수 1분열 후기', en: 'Anaphase I', level: 'core', view: 'steps',
      where: '상동 염색체가 분리되어 양극으로 이동하는 시기',
      etym: {
        ko: '後期(뒤 후, 때 기) → ‘분열의 뒤 시기’',
        en: '그리스어 ana(위로, 거꾸로)+phasis',
        memo: '“감수 1분열에서 갈라지는 것은 상동 염색체” — 염색 분체는 아직 붙어 있다'
      },
      role: ['상동 염색체가 서로 분리되어 양극으로 끌려간다', '염색 분체는 분리되지 않는다 (염색체 수는 이동 후 각 극에서 n)'],
      exam: '“감수 1분열 후기에 염색 분체가 분리된다”는 보기는 틀립니다. 염색 분체 분리는 감수 2분열 후기입니다.',
      links: ['metaphase1', 'telophase1']
    },
    telophase1: {
      name: '감수 1분열 말기 · 세포질 분열', en: 'Telophase I & Cytokinesis', level: 'core', view: 'steps',
      where: '세포가 둘로 나뉘어 핵상이 n인 세포 2개가 되는 시기',
      etym: {
        ko: '末期(끝 말, 때 기) → ‘분열의 끝 시기’',
        en: '그리스어 telos(끝)+phasis',
        memo: '염색체 수가 반(2n → n)인 세포 2개로 나뉜다. 아직 염색 분체는 붙어 있다 (DNA 상대량 1)'
      },
      role: ['세포질 분열 후 핵상이 n인 세포 2개가 된다', '염색체당 염색 분체가 2개이므로 세포 하나의 DNA 상대량은 1 (G₁을 1로 할 때)'],
      links: ['anaphase1', 'prophase2', 'nuclear_phase']
    },
    meiosis2: {
      name: '감수 2분열', en: 'Meiosis II', level: 'core', view: 'steps',
      where: '염색 분체가 분리되어 생식세포가 만들어지는 분열',
      etym: {
        ko: '減數第二分裂(둘째 이) → ‘수를 덜어 내는 두 번째 분열’. 사실상 체세포 분열과 비슷한 과정',
        en: 'meiosis II — 염색체 수는 그대로 n, 염색 분체가 나뉘는 분열',
        memo: '2분열은 DNA를 복제하지 않고 곧바로 진행 → 염색 분체가 갈라져 딸세포 4개가 완성'
      },
      role: ['감수 1분열이 끝난 세포 2개가 각각 분열하여 총 4개의 생식세포가 된다', '염색 분체가 분리되며 핵상은 n으로 유지'],
      links: ['prophase2', 'anaphase2', 'telophase2', 'gamete']
    },
    prophase2: {
      name: '감수 2분열 전기·중기', en: 'Prophase II & Metaphase II', level: 'core', view: 'steps',
      where: '핵상 n인 세포에서 염색체가 적도판에 한 줄로 서는 시기',
      etym: {
        ko: '前期·中期 → 복제 없이 곧바로 이어지는 2분열의 앞 단계',
        en: 'pro(앞)·meta(중간)+phasis',
        memo: 'n=2개의 염색체가 각각 염색 분체 2개씩 붙은 채 한 줄로 선다 (DNA 상대량 1)'
      },
      role: ['핵상 n, 염색체 수 n, 염색체마다 염색 분체 2개', '세포 하나의 DNA 상대량은 1 (G₁기 세포를 1로 할 때)'],
      exam: '핵상이 n이어도 감수 2분열 중기 세포의 DNA는 복제된 상태입니다. 유전자 A의 DNA 상대량이 2일 수 있다는 뜻입니다.',
      links: ['telophase1', 'anaphase2']
    },
    anaphase2: {
      name: '감수 2분열 후기', en: 'Anaphase II', level: 'core', view: 'steps',
      where: '염색 분체가 분리되어 양극으로 이동하는 시기',
      etym: {
        ko: '後期(뒤 후, 때 기)',
        en: '그리스어 ana(위로, 거꾸로)+phasis',
        memo: '“염색 분체가 갈라지는 것은 감수 2분열 후기” — 이때 세포 속 염색체 수는 일시적으로 2배(n → 2n 개 수)'
      },
      role: ['염색 분체가 분리되어 각각 한 개의 염색체가 된다', '세포 안의 염색체 수가 일시적으로 2배가 된다. DNA 상대량은 여전히 1'],
      exam: '이 시기는 DNA 상대량 표에서 핵상이 n인데 염색체 수가 2n처럼 보이는 유일한 시기입니다.',
      links: ['prophase2', 'telophase2']
    },
    telophase2: {
      name: '감수 2분열 말기 · 세포질 분열', en: 'Telophase II & Cytokinesis', level: 'core', view: 'steps',
      where: '세포 2개가 각각 나뉘어 핵상 n인 세포 4개가 완성되는 시기',
      etym: {
        ko: '末期(끝 말, 때 기) → ‘분열의 끝 시기’',
        en: '그리스어 telos(끝)+phasis',
        memo: '생식세포(정자 또는 난자 등)가 완성 — DNA 상대량 0.5 (G₁기의 절반)'
      },
      role: ['핵상 n인 딸세포 4개가 만들어진다', '각 세포의 DNA 상대량은 G₁기 세포의 절반(0.5)'],
      links: ['gamete', 'anaphase2']
    },
    gamete: {
      name: '생식세포', en: 'Gamete', level: 'core', view: 'steps',
      where: '감수 분열의 결과로 만들어진 핵상 n인 세포 (정자, 난자 등)',
      etym: {
        ko: '生殖細胞(날 생, 불릴 식, 세포) → ‘번식을 위한 세포’',
        en: '그리스어 gamete = 아내, gametes = 남편 (gamos 결혼). monogamy(일부일처)의 gamy도 같은 뿌리',
        memo: 'gamos=결혼. 두 생식세포가 ‘결혼(수정)’해서 2n의 새 개체가 된다'
      },
      role: ['핵상이 n이며 DNA 상대량은 0.5 (G₁기 체세포를 1로 할 때)', '수정으로 핵상 2n의 수정란이 된다'],
      exam: '생식세포 하나에는 상동 염색체 쌍의 한쪽만 들어 있습니다. 사람은 2²³ 가지(교차 제외)로 다양합니다.',
      links: ['telophase2', 'nuclear_phase']
    },
    nuclear_phase: {
      name: '핵상 (2n → n)', en: 'Nuclear phase (ploidy)', level: 'core', view: 'steps',
      where: '세포 속 염색체 구성 상태. 상동 염색체가 쌍이면 2n, 한 벌이면 n',
      etym: {
        ko: '核相(씨 핵, 모양 상) → ‘핵 속 염색체의 모습(상태)’',
        en: 'ploidy: 그리스어 -ploos(~겹의). diploid=2배체, haploid=반수체',
        memo: '2n은 부모에게서 한 벌씩 받은 두 벌(복상), n은 한 벌(단상). 감수 1분열이 끝나면 n'
      },
      role: ['핵상은 상동 염색체가 있는지로 결정하며 염색 분체 수와는 상관없다', '감수 1분열에서 2n → n으로 반감된다'],
      exam: '핵상은 “상동 염색체 쌍이 있는가”로 정합니다. 감수 2분열 중기는 핵상이 n입니다.',
      links: ['meiosis1', 'gamete', 'dna_rel']
    },
    dna_rel: {
      name: 'DNA 상대량', en: 'Relative DNA amount', level: 'core', view: 'steps',
      where: 'G₁기 세포의 DNA 양을 1로 했을 때 세포 하나의 DNA 양',
      etym: {
        ko: '相對量(서로 상, 대할 대, 헤아릴 량) → ‘기준과 비교한 양’',
        en: 'relative: 라틴어 relatus(다시 가져온) — 무엇과 견주어서 정하는 값',
        memo: 'G₁=1 → 복제 후 2 → 감수 1분열 후 1 → 감수 2분열 후 0.5. 염색 분체 수까지 센다'
      },
      role: ['염색 분체 수가 DNA 양을 결정한다 (염색체 수는 동원체 수)', '그래프 모양: 1 → 2 (S기) → 1 (감수 1분열 끝) → 0.5 (감수 2분열 끝)'],
      exam: '합이 4 → 복제된 2n 세포(감수 1분열 전기~중기), 합이 2 → G₁기 또는 감수 2분열 중기(핵상으로 구분), 합이 1 → 생식세포. (유전자형 Aa일 때 A+a의 합)',
      links: ['interphase', 'nuclear_phase']
    }
  },

  scenes: [
    {
      id: 'meiosis', label: '감수 분열 따라가기', view: 'steps',
      steps: [
        { text: 'G₁기: 2n=4. 염색체 4개, DNA 상대량 1입니다.', part: 'interphase', set: { stage: 0 }, ms: 4500 },
        { text: 'S기에 DNA가 복제됩니다. 염색체 수는 그대로 4개, 각각 염색 분체 2개. DNA 상대량 2.', part: 'dna_rel', set: { stage: 1 }, ms: 5500 },
        { text: '감수 1분열 전기: 상동 염색체가 짝을 지어 2가 염색체를 만들고, 교차가 일어날 수 있습니다.', part: 'bivalent', set: { stage: 2 }, ms: 6000 },
        { text: '중기: 2가 염색체가 적도판에 배열됩니다.', part: 'metaphase1', set: { stage: 3 }, ms: 4500 },
        { text: '후기: 상동 염색체가 갈라져 양극으로 갑니다. 염색 분체는 아직 붙어 있습니다.', part: 'anaphase1', set: { stage: 4 }, ms: 5500 },
        { text: '말기·세포질 분열: 핵상이 n인 세포 2개. 각 세포의 DNA 상대량은 1입니다.', part: 'telophase1', set: { stage: 5 }, ms: 5500 },
        { text: '감수 2분열 전·중기: DNA 복제 없이 염색체가 적도판에 한 줄로 섭니다.', part: 'prophase2', set: { stage: 6 }, ms: 5000 },
        { text: '후기: 염색 분체가 분리됩니다. 이 순간 한 세포 안의 염색체 수는 일시적으로 2배입니다.', part: 'anaphase2', set: { stage: 7 }, ms: 6000 },
        { text: '말기·세포질 분열: 핵상 n인 생식세포 4개. 각 세포의 DNA 상대량은 0.5입니다.', part: 'gamete', set: { stage: 8 }, ms: 6000 }
      ]
    }
  ]
});
