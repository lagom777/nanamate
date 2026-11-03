/* 콩팥 네프론(오줌 생성) 그림 글 자료 — 여과 · 재흡수 · 분비. */
NMFIG.data('nephron', {
  title: '콩팥의 네프론 — 오줌이 만들어지는 길',
  lead: '부위나 과정에 마우스를 올려 보세요(휴대폰은 누르기). 아래에서 물질을 골라 그 물질이 어디로 가는지 따라가 볼 수 있습니다.',
  idle: '혈액은 사구체에서 걸러지고(여과), 세뇨관에서 필요한 것이 되돌아가고(재흡수), 모자란 노폐물이 더해져서(분비) 오줌이 됩니다. 물질마다 길이 다릅니다.',
  order: ['nephron', 'corpuscle', 'glomerulus', 'bowman', 'tubule', 'capillary', 'collecting', 'filtration', 'reabsorption', 'secretion', 'urine'],
  parts: {
    nephron: {
      name: '네프론', en: 'Nephron', level: 'core',
      where: '콩팥에서 오줌을 만드는 기본 단위 (한 콩팥에 약 100만 개)',
      etym: {
        ko: '콩팥(腎, 콩팥 신)의 기능 단위. 신소체(사구체+보먼주머니)와 그에 이어진 세뇨관을 합쳐 부른다',
        en: '그리스어 nephros = 콩팥 + 단위를 뜻하는 접미사 -on (neuron, electron의 -on도 같은 접미사). nephritis(신장염)도 같은 뿌리',
        memo: 'nephros(콩팥)+on(단위) = ‘콩팥의 최소 단위’. 이 한 개가 혈액을 걸러 오줌을 만드는 작은 공장'
      },
      role: ['신소체(사구체 + 보먼주머니)와 세뇨관으로 이루어진다', '혈액을 걸러(여과) 필요한 것은 되돌리고(재흡수) 노폐물을 더해(분비) 오줌을 만든다'],
      exam: '네프론 = 신소체 + 세뇨관. 집합관은 여러 네프론의 세뇨관이 모이는 관으로, 보통 네프론에 넣지 않습니다.',
      links: ['corpuscle', 'tubule']
    },
    corpuscle: {
      name: '신소체', en: 'Renal corpuscle', level: 'core',
      where: '사구체와 그것을 감싼 보먼주머니를 합한 둥근 부분 (콩팥 겉질에 있음)',
      etym: {
        ko: '腎小體(콩팥 신, 작을 소, 몸 체) → ‘콩팥의 작은 몸’. 말피기 소체라고도 한다',
        en: 'renal: 라틴어 ren = 콩팥. corpuscle: 라틴어 corpusculum = 작은 몸(corpus 몸의 지소형)',
        memo: 'corpus(몸)+-cle(작은 것) = ‘작은 몸’. 혈액 거르는 필터가 들어 있는 공 모양 부분'
      },
      role: ['사구체의 혈액이 보먼주머니로 걸러지는 장소', '여과가 일어나는 곳 (여과 = 신소체)'],
      links: ['glomerulus', 'bowman', 'filtration']
    },
    glomerulus: {
      name: '사구체', en: 'Glomerulus', level: 'core',
      where: '모세 혈관이 실뭉치처럼 뭉친 구조. 보먼주머니 속에 들어 있다',
      etym: {
        ko: '絲球體(실 사, 공 구, 몸 체) → ‘실뭉치 같은 몸’',
        en: '라틴어 glomus(실뭉치)의 지소형 glomerulus → ‘작은 실뭉치’',
        memo: '실타래처럼 엉킨 모세 혈관 공 — 혈액을 거르는 첫 번째 체'
      },
      role: ['콩팥 동맥에서 이어진 모세 혈관이 뭉친 곳으로, 혈압이 높아 여과가 잘 일어난다', '물·포도당·아미노산·요소 같은 작은 물질은 걸러져 나가고, 혈구와 단백질은 크기가 커서 남는다'],
      exam: '사구체에서 보먼주머니로 이동하는 것은 여과이며, 크기가 작은 물질만 이동합니다. 단백질은 정상일 때 여과되지 않습니다.',
      links: ['bowman', 'filtration']
    },
    bowman: {
      name: '보먼주머니', en: 'Bowman’s capsule', level: 'core',
      where: '사구체를 감싸고 있는 컵 모양 주머니. 세뇨관으로 이어진다',
      etym: {
        ko: '19세기 영국의 의사 윌리엄 보먼(William Bowman)의 이름에서 따온 이름',
        en: 'capsule: 라틴어 capsa = 상자, 통 (capsule 캡슐과 같은 뿌리)',
        memo: '발견자 보먼의 이름이 붙은 ‘사구체를 감싼 주머니’ — 여과액(원뇨)이 처음 고이는 곳'
      },
      role: ['사구체에서 걸러진 여과액(원뇨)을 받는다', '여과액은 이어서 세뇨관으로 흘러간다'],
      links: ['glomerulus', 'tubule']
    },
    tubule: {
      name: '세뇨관', en: 'Renal tubule', level: 'core',
      where: '보먼주머니에 이어져 구불구불한 가는 관. 모세 혈관이 둘러싼다',
      etym: {
        ko: '細尿管(가늘 세, 오줌 뇨, 대롱 관) → ‘가는 오줌 관’',
        en: 'tubule: 라틴어 tubulus = 작은 관 (tube의 지소형)',
        memo: '가는(細) 관(管)을 지나는 동안 오줌(尿)이 다듬어진다 — 재흡수와 분비가 일어나는 곳'
      },
      role: ['포도당·아미노산은 정상이면 전부, 물·무기염류는 대부분 재흡수된다', '모세 혈관에서 일부 노폐물이 세뇨관으로 분비된다'],
      exam: '재흡수와 분비는 세뇨관과 주위 모세 혈관 사이에서 일어납니다. 사구체–보먼주머니 사이는 여과입니다.',
      links: ['reabsorption', 'secretion', 'capillary', 'collecting']
    },
    capillary: {
      name: '모세 혈관', en: 'Peritubular capillary', level: 'core',
      where: '세뇨관을 그물처럼 둘러싼 모세 혈관',
      etym: {
        ko: '毛細血管(털 모, 가늘 세, 피 혈, 대롱 관) → ‘털처럼 가는 핏줄’',
        en: 'capillary: 라틴어 capillaris = 머리카락처럼 가는 (capillus 머리카락)',
        memo: '머리털(毛)만큼 가는 핏줄 — 재흡수된 물질을 받아 가고, 분비될 물질을 내보낸다'
      },
      role: ['재흡수된 포도당·물·무기염류를 받아 혈액으로 돌려보낸다', '혈액 속 노폐물 일부를 세뇨관으로 분비하는 출발점'],
      links: ['reabsorption', 'secretion', 'tubule']
    },
    collecting: {
      name: '집합관', en: 'Collecting duct', level: 'ref',
      where: '여러 세뇨관의 끝이 모이는 관. 콩팥 깔때기로 이어진다',
      etym: {
        ko: '集合管(모을 집, 합할 합, 대롱 관) → ‘모여 합쳐지는 관’',
        en: 'collect: 라틴어 colligere(함께 모으다). duct: 라틴어 ductus = 이끌어 감(ducere 이끌다)',
        memo: '여러 네프론의 오줌이 모여 한 줄기로 합쳐지는 ‘합류 관’. 여기서 항이뇨 호르몬(ADH)이 물 재흡수를 조절'
      },
      role: ['세뇨관을 지난 액체가 모여 콩팥 깔때기 → 오줌관 → 방광으로 간다', 'ADH가 많으면 물이 더 재흡수되어 오줌이 진하고 적어진다'],
      links: ['tubule', 'urine']
    },
    filtration: {
      name: '여과', en: 'Filtration', level: 'core',
      where: '사구체 → 보먼주머니 (혈압에 의해 작은 물질이 걸러져 나감)',
      etym: {
        ko: '濾過(거를 려, 지날 과) → ‘걸러서 통과시킴’',
        en: 'filter: 중세 라틴어 filtrum = 펠트(천). 펠트 천으로 거르던 데서',
        memo: '체로 거르듯 크기로 거른다 — 혈구·단백질은 커서 못 빠져나가고, 물·포도당·요소는 빠져나감'
      },
      role: ['혈압(사구체의 높은 압력) 때문에 일어난다. 크기가 작은 물질만 이동', '여과되는 것: 물, 포도당, 아미노산, 무기염류, 요소. 여과되지 않는 것: 혈구, 단백질'],
      exam: '여과량 = 재흡수량 + 배설량(분비가 없을 때). 여과 후 100% 재흡수되는 포도당은 오줌에 없고, 요소는 일부만 재흡수되어 오줌에서 농축됩니다.',
      links: ['glomerulus', 'bowman', 'reabsorption']
    },
    reabsorption: {
      name: '재흡수', en: 'Reabsorption', level: 'core',
      where: '세뇨관 → 모세 혈관 (여과된 물질이 혈액으로 되돌아감)',
      etym: {
        ko: '再吸收(다시 재, 마실 흡, 거둘 수) → ‘다시 거두어들임’',
        en: 're-(다시)+absorb(흡수하다; 라틴어 absorbere 삼키다)',
        memo: '재(再)=다시. 한 번 걸러 낸 것 중 쓸 만한 것을 ‘다시’ 몸으로 되돌림'
      },
      role: ['포도당·아미노산은 정상이면 전부 재흡수된다', '물과 무기염류는 대부분 재흡수된다. 요소는 일부만 재흡수된다'],
      exam: '재흡수량 = 여과량 − 배설량 + 분비량. 이눌린은 재흡수도 분비도 되지 않아 여과량 측정에 쓰입니다.',
      links: ['tubule', 'capillary', 'secretion']
    },
    secretion: {
      name: '분비', en: 'Secretion', level: 'core',
      where: '모세 혈관 → 세뇨관 (혈액의 노폐물이 오줌 쪽으로 더해짐)',
      etym: {
        ko: '分泌(나눌 분, 스며흐를 비) → ‘갈라서 스며 나오게 함’',
        en: 'secrete: 라틴어 se(따로)+cernere(가르다)',
        memo: '분(나눔)+비(스며 나옴) — 여과로 못 나간 노폐물을 세뇨관으로 ‘추가로 내보냄’'
      },
      role: ['여과 때 다 빠져나가지 못한 노폐물(요소 일부, 일부 약물 등)이 세뇨관으로 더해진다', '재흡수와 반대 방향의 이동'],
      exam: '오줌 속 양 = 여과량 − 재흡수량 + 분비량. 수능 그래프에서 분비가 있는 물질은 오줌 배설량이 여과량보다 많이 나올 수도 있습니다.',
      links: ['capillary', 'tubule', 'reabsorption']
    },
    urine: {
      name: '오줌', en: 'Urine', level: 'core',
      where: '집합관에서 콩팥 깔때기로 나가는 최종 결과물',
      etym: {
        ko: '오줌(순우리말). 한자로는 尿(오줌 뇨)',
        en: '라틴어 urina, 그리스어 ouron = 오줌. urine, urea, uric acid, ureter가 모두 같은 뿌리',
        memo: 'ouron(오줌)에서 요소(urea)·요도(urethra)까지 — 오줌 관련 낱말의 공통 조상'
      },
      role: ['오줌 = 여과량 − 재흡수량 + 분비량 (물질별)', '정상인의 오줌에는 포도당·단백질이 거의 없고, 요소는 진하게 들어 있다'],
      exam: '오줌에 포도당이 나온다면 사구체 이상보다는 재흡수 한계를 넘는 고혈당(당뇨병)을 의심합니다. 단백질이 나오면 사구체 손상을 의심합니다.',
      links: ['collecting', 'filtration', 'reabsorption', 'secretion']
    }
  },

  scenes: [
    {
      id: 'urine', label: '오줌이 만들어지는 길',
      steps: [
        { text: '혈액이 콩팥 동맥을 따라 사구체로 흘러 들어옵니다. 사구체는 모세 혈관이 실뭉치처럼 뭉친 곳입니다.', part: 'glomerulus', set: { sub: 'glucose' }, ms: 4500 },
        { text: '여과: 사구체의 높은 혈압 때문에 물·포도당·요소 같은 작은 물질이 보먼주머니로 걸러집니다. 혈구와 단백질은 못 나갑니다.', part: 'filtration', ms: 6000 },
        { text: '재흡수: 세뇨관을 지나는 동안 포도당은 전부, 물과 무기염류는 대부분 모세 혈관으로 되돌아갑니다.', part: 'reabsorption', ms: 6000 },
        { text: '분비: 모세 혈관에서 세뇨관으로 노폐물이 일부 더해집니다.', part: 'secretion', ms: 4500 },
        { text: '집합관에서 합쳐진 액체가 오줌으로 나갑니다. 포도당은 0, 요소는 진하게 농축되어 있습니다.', part: 'urine', ms: 6000 }
      ]
    },
    {
      id: 'substance', label: '물질마다 길이 다르다',
      steps: [
        { text: '단백질: 크기가 커서 여과되지 않습니다. 오줌에도 나오지 않습니다.', part: 'filtration', set: { sub: 'protein' }, ms: 5000 },
        { text: '포도당: 여과되지만 세뇨관에서 전부 재흡수됩니다. 오줌의 포도당은 0입니다.', part: 'reabsorption', set: { sub: 'glucose' }, ms: 5500 },
        { text: '요소: 여과된 뒤 일부만 재흡수됩니다. 물이 더 많이 재흡수되므로 오줌에서 진하게 농축됩니다.', part: 'urine', set: { sub: 'urea' }, ms: 6000 },
        { text: '이눌린: 여과만 되고 재흡수·분비가 없는 물질입니다. 농축된 배율로 물이 얼마나 재흡수되었는지 알 수 있습니다.', part: 'urine', set: { sub: 'inulin' }, ms: 6500 }
      ]
    }
  ]
});
