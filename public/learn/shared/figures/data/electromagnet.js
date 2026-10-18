/* 전류의 자기장과 전자기 유도 그림 글 자료 — 직선 도선 / 두 도선 / 코일 / 전자기 유도. */
NMFIG.data('electromagnet', {
  title: '전류의 자기장과 전자기 유도',
  lead: '부분에 마우스를 올려 보세요(휴대폰은 누르기). 위쪽 버튼으로 ‘직선 도선’, ‘두 도선’, ‘코일’, ‘전자기 유도’ 보기를 바꿉니다.',
  idle: '전류는 자기장을 만들고(오른손), 자기 선속이 변하면 유도 전류가 생깁니다(렌츠·패러데이). 슬라이더와 버튼으로 전류의 세기·방향과 자석의 움직임을 바꿔 보세요.',
  order: [
    'wire', 'current', 'field', 'rhr', 'dotcross', 'strength',
    'wire_a', 'wire_b', 'net_field', 'zero_point',
    'loop', 'solenoid', 'inner_field', 'poles', 'turns',
    'magnet', 'coil', 'galvanometer', 'flux', 'induced', 'lenz', 'faraday'
  ],
  parts: {
    /* ───────── 직선 도선 ───────── */
    wire: {
      name: '직선 도선', en: 'Straight wire', level: 'core', view: 'wire',
      where: '그림 가운데의 점. 도선이 종이 면에 수직으로 놓여 있다',
      etym: {
        ko: '導線(이끌 도, 줄 선) → ‘전기를 이끄는 줄’',
        en: 'wire: 옛 영어 wir = 금속 실. conductor: 라틴어 conducere = 함께 이끌다',
        memo: '도(導)=이끎. 전류를 길게 흘려보내는 줄 — 그 주위에 둥글게 자기장이 생긴다'
      },
      role: ['전류가 흐르면 도선 둘레에 동심원 모양의 자기장이 생긴다', '1820년 외르스테드가 전류가 나침반 바늘을 움직이는 것을 발견'],
      links: ['current', 'field']
    },
    current: {
      name: '전류', en: 'Electric current', level: 'core', view: 'wire',
      where: '도선을 따라 흐르는 전하의 흐름. (+)전하가 움직이는 방향으로 정한다',
      etym: {
        ko: '電流(전기 전, 흐를 류) → ‘전기의 흐름’',
        en: 'current: 라틴어 currere = 달리다 (currency=통화(돌아다니는 돈), current=흐름)',
        memo: '류(流)=흐름. 전류 방향은 (+)전하가 가는 방향 = 전자가 움직이는 방향의 반대'
      },
      role: ['I의 단위는 A(암페어). 세기가 클수록 자기장이 세다', '방향이 바뀌면 자기장의 방향도 반대가 된다'],
      exam: '자기장의 방향은 전류 방향으로 정합니다. 전자의 이동 방향과 반대임에 유의하세요.',
      links: ['field', 'rhr', 'dotcross']
    },
    field: {
      name: '자기장', en: 'Magnetic field', level: 'core', view: 'wire',
      where: '도선을 중심으로 한 동심원(화살표가 방향). 한 점에서의 방향은 그 점을 지나는 원의 접선 방향',
      etym: {
        ko: '磁氣場(자석 자, 기운 기, 마당 장) → ‘자기의 힘이 미치는 마당’. 磁은 원래 慈石(사랑할 자, 돌 석) — ‘쇠를 사랑해 끌어당기는 돌’에서 왔다는 설',
        en: 'magnet: 그리스어 Magnetis lithos = 마그네시아 지방의 돌. field: 옛 영어 feld = 들판, 평평한 땅',
        memo: '장(場)=마당. 마당에 놓이면 작용을 받는 공간 — 전류 둘레의 마당이 자기장'
      },
      role: ['직선 도선 둘레의 자기장은 도선을 감싸는 원 모양', '세기 B는 전류 I에 비례하고 도선까지의 거리 r에 반비례한다'],
      exam: '여러 도선의 자기장은 벡터로 합성합니다. 그림에는 ⊙(지면에서 나옴), ⊗(지면으로 들어감)로 방향을 표시합니다.',
      links: ['rhr', 'strength', 'dotcross']
    },
    rhr: {
      name: '오른손 법칙 (앙페르)', en: 'Right-hand rule', level: 'core', view: 'wire',
      where: '엄지를 전류 방향, 감아쥔 네 손가락을 자기장 방향으로 하는 규칙',
      etym: {
        ko: '프랑스의 물리학자 앙페르(1775~1836)가 정리한 전류와 자기장의 관계. 오른손으로 도선을 감싸 쥐는 모양',
        en: 'Ampère’s right-hand grip rule. 전류의 단위 암페어(A)도 앙페르의 이름에서 나왔다',
        memo: '나사를 오른쪽으로 돌려 박을 때 나사가 가는 방향 = 전류, 돌아가는 방향 = 자기장 (오른나사 법칙)'
      },
      role: ['엄지 = 전류 방향, 네 손가락이 감기는 방향 = 자기장 방향', '전류가 지면에서 나오면(⊙) 자기장은 반시계 방향, 들어가면(⊗) 시계 방향'],
      exam: '직선 도선과 원형 도선·솔레노이드에서 엄지와 네 손가락의 역할이 서로 바뀝니다. 직선: 엄지=전류. 솔레노이드: 네 손가락=전류, 엄지=N극.',
      links: ['current', 'field', 'poles']
    },
    dotcross: {
      name: '⊙ 와 ⊗', en: 'Out-of / into the page', level: 'core', view: 'wire',
      where: '지면에서 나오는 방향(⊙)과 지면으로 들어가는 방향(⊗)을 나타내는 기호',
      etym: {
        ko: '날아오는 화살을 앞에서 보면 화살촉(⊙), 날아가는 화살을 뒤에서 보면 깃(⊗)이 보인다는 데서 온 기호',
        en: 'dot = 점(촉), cross = 십자(깃). 3차원 방향을 2차원 종이에 나타내는 약속',
        memo: '⊙ 화살이 나에게 온다(나옴), ⊗ 화살이 멀어진다(들어감)'
      },
      role: ['전류나 자기장의 방향이 종이 면에 수직일 때 쓴다', '수능 자기장 합성 문제에서 각 도선이 만드는 방향을 ⊙/⊗로 먼저 적는다'],
      links: ['current', 'field']
    },
    strength: {
      name: '세기  B ∝ I / r', en: 'Field strength', level: 'core', view: 'wire',
      where: '두 점 P, Q에서의 자기장 세기 비교 (화살표의 길이)',
      etym: {
        ko: '比例(견줄 비, 법식 례) → ‘일정한 비율’. 反比例는 반대로 비율이 줄어드는 관계',
        en: 'proportional: 라틴어 pro(앞에)+portio(몫). ∝는 비례 기호',
        memo: '전류가 2배면 자기장도 2배(비례), 거리가 2배면 자기장은 1/2배(반비례)'
      },
      role: ['직선 전류: B = kI/r  (k: 상수)', 'P(r)에서 B가 2이면 거리 2r인 Q에서는 1'],
      exam: '전류가 같은 두 점이면 거리비의 역수가 곧 세기 비입니다. 거리가 3배면 세기는 1/3배.',
      links: ['field', 'current']
    },

    /* ───────── 두 도선 ───────── */
    wire_a: {
      name: '도선 A', en: 'Wire A', level: 'core', view: 'two',
      where: '왼쪽 도선 (전류 I)',
      etym: {
        ko: '導線 A → ‘첫째 도선’. 기호 A, B는 대상을 구별하는 이름표',
        en: 'A, B — 기호',
        memo: 'A, B는 알파벳 첫 두 글자. 문제에서는 전류 세기와 방향이 주어진다'
      },
      role: ['A가 만드는 자기장 B_A ∝ I_A / r_A', '다른 점에서는 B_A의 방향이 ⊙ 또는 ⊗로 바뀐다'],
      links: ['wire_b', 'net_field']
    },
    wire_b: {
      name: '도선 B', en: 'Wire B', level: 'core', view: 'two',
      where: '오른쪽 도선 (전류 I_B)',
      etym: {
        ko: '導線 B → ‘둘째 도선’',
        en: 'A, B — 기호',
        memo: 'B_B처럼 자기장 기호 B와 도선 이름 B가 겹치니 헷갈리지 않게 쓰자'
      },
      role: ['B가 만드는 자기장 ∝ I_B / r_B', '같은 방향 전류끼리는 서로 끌어당기고, 반대 방향 전류끼리는 서로 밀어낸다'],
      links: ['wire_a', 'net_field']
    },
    net_field: {
      name: '합성 자기장', en: 'Net field', level: 'core', view: 'two',
      where: '두 도선이 만드는 자기장을 벡터로 더한 값 (그래프의 곡선)',
      etym: {
        ko: '合成(합할 합, 이룰 성) → ‘합쳐서 하나로 만듦’',
        en: 'net: 프랑스어 net = 깨끗한, 남은 것. superposition: 라틴어 super(위에)+ponere(놓다) → 겹쳐 놓음',
        memo: '각 도선이 만드는 자기장을 방향까지 고려해 더한다 (겹침의 원리)'
      },
      role: ['같은 점에서 방향이 같으면 더하고, 반대이면 뺀다', '그래프가 0과 만나는 점이 알짜 자기장이 0인 점'],
      exam: '자기장 합성 문제는 먼저 각 도선의 방향(⊙/⊗)을 쓰고, 크기는 I/r 비로 비교합니다.',
      links: ['zero_point', 'wire_a', 'wire_b']
    },
    zero_point: {
      name: '자기장이 0인 점', en: 'Null point', level: 'core', view: 'two',
      where: '두 도선의 자기장이 크기가 같고 방향이 반대인 점',
      etym: {
        ko: '零(영 영) → 0인 점. ‘알짜 자기장이 0이 되는 위치’',
        en: 'null: 라틴어 nullus = 아무것도 아닌 (ne 아닌+ullus 어떤)',
        memo: '전류 방향이 같으면 두 도선 사이, 반대면 바깥(전류가 작은 도선 쪽)에 있다'
      },
      role: ['같은 방향: I_A / x = I_B / (d − x) → 두 도선 사이, 전류가 작은 쪽에 더 가깝다', '반대 방향: 두 도선 바깥에서 전류가 작은 도선 쪽에 생긴다 (전류가 같으면 없다)'],
      exam: '전류가 I, 2I로 같은 방향이면 0인 점은 I인 도선에서 d/3 떨어진 곳입니다.',
      links: ['net_field', 'wire_a', 'wire_b']
    },

    /* ───────── 코일 ───────── */
    loop: {
      name: '원형 도선', en: 'Circular loop', level: 'core', view: 'coil',
      where: '전류가 흐르는 고리 모양 도선',
      etym: {
        ko: '圓形(둥글 원, 모양 형) 導線 → ‘둥글게 만 도선’',
        en: 'loop: 고리, 올가미',
        memo: '직선 도선을 둥글게 말면 안쪽의 자기장이 한 방향으로 모인다 → 솔레노이드로 발전'
      },
      role: ['중심에서의 자기장 세기 B ∝ I / r (반지름 r)', '네 손가락을 전류 방향으로 감으면 엄지가 중심에서의 자기장 방향'],
      links: ['solenoid', 'rhr']
    },
    solenoid: {
      name: '솔레노이드', en: 'Solenoid', level: 'core', view: 'coil',
      where: '도선을 나선형으로 촘촘히 감은 코일',
      etym: {
        ko: '외래어(solenoid)',
        en: '그리스어 solen(관, 파이프)+eidos(모양) → ‘관 모양의 것’. 1823년 앙페르가 이름 붙였다',
        memo: 'solen=관. 관(대롱)처럼 길게 감은 코일 — 안쪽에 균일한 자기장이 생긴다'
      },
      role: ['내부 자기장 B ∝ nI (n: 단위 길이당 감은 수), 내부에서 균일', '막대자석과 비슷한 자기장 — 한쪽 끝이 N극, 반대쪽 끝이 S극'],
      exam: '솔레노이드에서는 네 손가락으로 전류의 감긴 방향을 따라 쥐면 엄지가 가리키는 쪽이 N극(자기장 방향)입니다.',
      links: ['inner_field', 'poles', 'turns']
    },
    inner_field: {
      name: '내부 자기장', en: 'Inner field', level: 'core', view: 'coil',
      where: '솔레노이드 안쪽의 나란한 자기장선',
      etym: {
        ko: '內部(안 내, 떼 부) 磁氣場 → ‘안쪽의 자기장’',
        en: 'uniform: 라틴어 unus(하나)+forma(모양) → 한결같은',
        memo: '촘촘히 감을수록, 전류가 셀수록 내부 자기장이 세고 일정하다'
      },
      role: ['내부 자기장은 거의 균일하고 축과 나란하다', '바깥쪽 자기장은 약하다'],
      links: ['solenoid', 'turns']
    },
    poles: {
      name: 'N극 · S극', en: 'Poles', level: 'core', view: 'coil',
      where: '자기장이 나오는 끝(N극)과 들어가는 끝(S극)',
      etym: {
        ko: '極(다할 극, 끝 극) → ‘맨 끝’. N은 North(북), S는 South(남)',
        en: 'pole: 그리스어 polos = 축의 끝. North pole은 자석이 북쪽을 가리키는 쪽이라서 붙은 이름',
        memo: '자석의 N극은 북쪽(North)을 가리키는 쪽. 자기장은 N극에서 나와 S극으로 들어간다'
      },
      role: ['솔레노이드 양 끝이 N극과 S극이 된다', '전류 방향이 바뀌면 N극과 S극도 서로 바뀐다'],
      links: ['solenoid', 'rhr']
    },
    turns: {
      name: '감은 수 n', en: 'Number of turns', level: 'core', view: 'coil',
      where: '단위 길이당 코일을 감은 횟수',
      etym: {
        ko: '감다(순우리말)+수(數, 셈 수) → ‘감은 횟수’',
        en: 'turn: 라틴어 tornare = 선반으로 둥글게 깎다, 돌리다',
        memo: '자기장 세기 B ∝ nI. 전류를 2배로 하거나 감은 수를 2배로 하면 B가 2배'
      },
      role: ['많이 감을수록 같은 전류에서 자기장이 세다', 'B ∝ nI 에서 n과 I는 같은 역할을 한다'],
      links: ['solenoid', 'inner_field']
    },

    /* ───────── 전자기 유도 ───────── */
    magnet: {
      name: '막대자석', en: 'Bar magnet', level: 'core', view: 'induction',
      where: '코일에 다가가거나 멀어지는 자석',
      etym: {
        ko: '磁石(자석 자, 돌 석) → ‘쇠를 끌어당기는 돌’. 慈石(사랑할 자)이었다는 설',
        en: 'magnet: 그리스어 Magnetis lithos = 마그네시아 지방의 돌',
        memo: '자석이 코일에 다가가는 속도와 방향이 선속 변화를 만든다'
      },
      role: ['자석이 코일에 가까워지면 코일을 지나는 자기 선속이 증가한다', '멀어지면 선속이 감소한다'],
      links: ['flux', 'coil']
    },
    coil: {
      name: '코일', en: 'Coil', level: 'core', view: 'induction',
      where: '도선을 여러 번 감은 고리, 양 끝은 검류계에 연결',
      etym: {
        ko: '외래어(coil). ‘감은 선’',
        en: 'coil: 라틴어 colligere = 함께 모으다 (col 함께+legere 모으다)',
        memo: '선을 둘둘 말아 한곳에 모은 것 — 감은 수 N이 많을수록 유도 기전력이 크다'
      },
      role: ['자기 선속이 변할 때 유도 기전력이 생기는 도선', '유도 기전력의 크기는 감은 수 N에 비례한다'],
      links: ['magnet', 'induced', 'galvanometer']
    },
    galvanometer: {
      name: '검류계', en: 'Galvanometer', level: 'core', view: 'induction',
      where: '코일에 연결된 바늘 계기. 전류의 방향과 세기를 보여 준다',
      etym: {
        ko: '檢流計(검사할 검, 흐를 류, 셀 계) → ‘전류를 검사하는 기계’',
        en: 'galvanometer: 이탈리아의 갈바니(Luigi Galvani, 1737~1798)의 이름에서. 개구리 다리 실험으로 ‘생체 전기’를 연구했다',
        memo: '바늘이 (+)쪽으로 흔들리면 한 방향, (−)쪽이면 반대 방향, 가운데면 전류 0'
      },
      role: ['유도 전류가 흐르는 동안에만 바늘이 움직인다', '자석이 멈춰 있으면 바늘도 0을 가리킨다'],
      exam: '자석이 코일 속에 멈춰 있어도 선속이 크기만 한 것으로는 유도 전류가 생기지 않습니다. 변해야 합니다.',
      links: ['coil', 'induced']
    },
    flux: {
      name: '자기 선속', en: 'Magnetic flux', level: 'core', view: 'induction',
      where: '코일 면을 수직으로 지나는 자기장선의 다발, Φ = BA cosθ (단위 Wb)',
      etym: {
        ko: '磁氣線束(자석 자, 기운 기, 줄 선, 묶을 속) → ‘자기장 선의 묶음’',
        en: 'flux: 라틴어 fluxus = 흐름 (fluere 흐르다 → fluid 유체, influence 영향이 같은 뿌리). Φ(파이)는 그리스 문자',
        memo: '선속=선(자기장선)의 다발. 코일을 통과하는 선이 많을수록 선속이 크다. Φ–t 그래프의 기울기가 유도 기전력'
      },
      role: ['Φ = BA cosθ: 자기장 B가 세고, 면적 A가 크고, 면에 수직일수록 크다', '유도 기전력의 크기 = Φ–t 그래프 기울기의 크기'],
      exam: '선속이 “크다”가 아니라 선속이 “변한다”가 유도 전류의 조건입니다. Φ–t 그래프가 수평이면 유도 전류는 0.',
      links: ['faraday', 'lenz', 'magnet']
    },
    induced: {
      name: '유도 전류', en: 'Induced current', level: 'core', view: 'induction',
      where: '자기 선속이 변할 때 코일에 흐르는 전류',
      etym: {
        ko: '誘導電流(꾈 유, 이끌 도, 전기 전, 흐를 류) → ‘자기 변화에 이끌려 생긴 전류’',
        en: 'induction: 라틴어 inducere = 안으로 이끌다 (in 안+ducere 이끌다)',
        memo: '유(誘)=꾀어냄. 자기 선속의 변화가 코일의 전하를 “이끌어 내어” 전류가 흐른다'
      },
      role: ['선속이 증가하면 증가를 방해하는 방향, 감소하면 감소를 방해하는 방향으로 흐른다', '자석이 빨리 움직일수록(변화가 빠를수록) 센 전류가 흐른다'],
      links: ['lenz', 'flux', 'galvanometer']
    },
    lenz: {
      name: '렌츠 법칙', en: 'Lenz’s law', level: 'core', view: 'induction',
      where: '유도 전류의 방향을 정하는 법칙: “선속의 변화를 방해하는 방향”',
      etym: {
        ko: '발트 독일계 러시아 물리학자 하인리히 렌츠(1804~1865)가 1834년 발표한 법칙',
        en: 'Lenz’s law — 변화를 “거스르는” 쪽으로 유도 전류가 흐른다',
        memo: '변화가 싫어서 반대로 버틴다! N극이 다가오면 N극으로 밀어내고, 멀어지면 S극으로 끌어당긴다'
      },
      role: ['N극이 다가오면 코일의 자석 쪽 면에 N극이 생기도록 전류가 흐른다 (밀어냄)', '멀어지면 코일의 자석 쪽 면에 S극이 생기도록 흐른다 (끌어당김)'],
      exam: '렌츠 법칙은 “유도 자기장이 항상 원래 자기장과 반대”가 아닙니다. 선속이 감소할 때는 같은 방향의 자기장을 만들어 감소를 방해합니다.',
      links: ['induced', 'flux', 'faraday']
    },
    faraday: {
      name: '패러데이 법칙', en: 'Faraday’s law', level: 'core', view: 'induction',
      where: '유도 기전력의 크기: ε = N · |ΔΦ/Δt|',
      etym: {
        ko: '영국의 과학자 마이클 패러데이(1791~1867)가 1831년 전자기 유도를 발견한 데서',
        en: 'Faraday’s law of induction. 전기 용량의 단위 패럿(F)도 그의 이름에서',
        memo: '변화가 빠를수록(시간이 짧을수록), 감은 수가 많을수록 기전력이 크다'
      },
      role: ['ε = −N ΔΦ/Δt 의 크기 부분: 선속 변화율에 비례', 'Φ–t 그래프에서 기울기의 크기가 기전력의 크기, 기울기 0이면 기전력 0'],
      exam: '0~2 s에 Φ가 0에서 4 Wb로 일정하게 증가하면 ε = 4/2 = 2 V (N=1), 2~4 s에는 0, 4~5 s에 4에서 0으로 감소하면 ε = 4 V이고 방향은 앞 구간과 반대입니다.',
      links: ['flux', 'lenz']
    }
  },

  scenes: [
    {
      id: 'rhr', label: '오른손 법칙', view: 'wire',
      steps: [
        { text: '전류가 지면에서 나오는 방향(⊙)이면 자기장은 도선 둘레를 반시계 방향으로 돕니다.', part: 'rhr', set: { I: 4, dir: false }, ms: 5500 },
        { text: '전류 방향을 반대(⊗, 지면으로 들어감)로 바꾸면 자기장도 시계 방향으로 바뀝니다.', part: 'current', set: { dir: true }, ms: 5500 },
        { text: '세기는 B ∝ I/r. P보다 두 배 먼 Q에서는 자기장이 절반입니다.', part: 'strength', ms: 5500 }
      ]
    },
    {
      id: 'zero', label: '자기장이 0인 점', view: 'two',
      steps: [
        { text: '전류가 I, 2I로 같은 방향이면 두 도선 사이에서 두 자기장이 서로 반대 방향입니다.', part: 'net_field', set: { ratio: 2, rel: 'same' }, ms: 6000 },
        { text: '크기가 같아지는 곳이 0인 점입니다. 전류가 작은 도선에서 d/3 떨어진 곳입니다.', part: 'zero_point', ms: 6000 },
        { text: '전류 방향이 반대이면 0인 점은 바깥으로 나가, 전류가 작은 도선 쪽에 생깁니다.', part: 'zero_point', set: { rel: 'opposite' }, ms: 6000 }
      ]
    },
    {
      id: 'induction', label: '자석과 코일', view: 'induction',
      steps: [
        { text: '0~2 s: N극이 코일에 다가갑니다. 자기 선속이 증가하므로 이를 방해하도록 코일의 자석 쪽에 N극이 생기는 방향으로 유도 전류가 흐릅니다.', part: 'lenz', set: { t: 1, pole: 'N' }, ms: 7000 },
        { text: '2~4 s: 자석이 코일 속에 멈춰 있습니다. 선속이 크지만 변하지 않으므로 유도 전류는 0입니다.', part: 'galvanometer', set: { t: 3 }, ms: 6000 },
        { text: '4~5 s: 자석이 멀어집니다. 선속이 감소하므로 이번에는 자석 쪽에 S극이 생겨 끌어당기는 방향, 즉 앞과 반대 방향으로 전류가 흐릅니다.', part: 'induced', set: { t: 4.5 }, ms: 7000 }
      ]
    }
  ]
});
