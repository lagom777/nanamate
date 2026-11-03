/* 시험용 샘플 글. demo는 update 그림, demo2는 render만 다시 그리는 그림. */
(function (NMFIG) {
  'use strict';

  NMFIG.data('demo', {
    title: '세포막과 이온 통로',
    lead: '막 위의 부위에 마우스를 올려 보세요. 휴대폰은 누르면 그 자리가 고정됩니다.',
    idle: '시간 슬라이더는 ‘신호’ 보기에서만 나오고, 통로가 얼마나 열렸는지 바꿉니다.',
    order: ['membrane', 'channel', 'nucleus', 'vesicle', 'receptor'],
    parts: {
      membrane: {
        name: '세포막', en: 'Cell membrane', level: 'core',
        where: '세포 안과 밖을 가르는 얇은 경계',
        etym: {
          ko: '막(膜)은 얇게 덮는 껍질이라는 뜻이다.',
          en: 'membrane은 라틴어 membrana(얇은 껍질)에서 왔다.',
          memo: '세포를 감싸는 얇은 비닐 봉지라고 기억하면 된다.'
        },
        role: ['세포 안팎을 가른다.', '통로와 수용체가 꽂히는 바닥이 된다.'],
        exam: '인지질 이중층이라 대부분의 이온은 혼자 통과하지 못한다.',
        links: ['channel', 'receptor'],
        view: 'structure'
      },
      channel: {
        name: '이온 통로', en: 'Ion channel', level: 'core',
        where: '막을 가로지르는 좁은 구멍',
        etym: {
          ko: '통로는 지나다니는 길이고, 이온은 전기를 띤 입자다.',
          en: 'ion은 그리스어 ienai(가다), channel은 라틴어 canalis(홈)에서 왔다.',
          memo: '이온이 드나드는 문이라고 생각하면 된다.'
        },
        role: ['나트륨이나 칼륨이 농도 차이로 드나든다.', '열리고 닫히며 전기 신호를 만든다.'],
        exam: '통로가 열리는 순간과, 이온이 어느 쪽으로 흐르는지를 묻는다.',
        links: ['membrane', 'vesicle'],
        view: 'signal'
      },
      nucleus: {
        name: '핵', en: 'Nucleus', level: 'ref',
        where: '세포 안쪽, 막에서 떨어진 자리',
        etym: {
          ko: '핵(核)은 씨, 중심이라는 뜻이다.',
          en: 'nucleus는 라틴어 nucleus(호두 알, 씨)에서 왔다.',
          memo: '세포의 씨알이 핵이다.'
        },
        role: ['유전 정보를 보관한다.'],
        links: ['membrane'],
        view: 'structure'
      },
      vesicle: {
        name: '소포', en: 'Vesicle', level: 'core',
        where: '막 안쪽, 신호를 전달할 물질을 담은 주머니',
        etym: {
          ko: '소포(小胞)는 작은 주머니라는 뜻이다.',
          en: 'vesicle은 라틴어 vesicula(작은 물집)에서 왔다.',
          memo: '전할 물질을 담아 나르는 택배 상자다.'
        },
        role: ['전달 물질을 막 쪽으로 가져간다.', '막과 융합하면 내용물을 밖으로 낸다.'],
        links: ['membrane', 'channel'],
        view: 'signal'
      },
      receptor: {
        name: '수용체', en: 'Receptor', level: 'ref',
        where: '막 바깥에 고개를 내민 단백질',
        etym: {
          ko: '수용(受容)은 받아 담는다는 뜻이다.',
          en: 'receptor는 라틴어 recipere(받다)에서 왔다.',
          memo: '신호를 잡는 손이라고 기억하면 된다.'
        },
        role: ['밖에 있는 신호 분자를 알아본다.', '맞으면 통로가 열리게 돕는다.'],
        links: ['membrane', 'channel'],
        view: 'structure'
      }
    },
    scenes: [
      {
        id: 'pass',
        label: '신호가 지나갈 때',
        view: 'structure',
        steps: [
          {
            text: '막은 아직 닫혀 있고, 이온은 통로 밖에 머물러 있다.',
            part: 'membrane',
            view: 'structure',
            set: { t: 0, gate: false, ion: 'na' },
            ms: 4500
          },
          {
            text: '나트륨 통로가 열리면서 신호가 커진다.',
            part: 'channel',
            view: 'signal',
            set: { t: 0.92, gate: true, ion: 'na' }
          },
          {
            text: '신호가 지나간 뒤 칼륨 쪽이 열리고, 소포가 막으로 다가간다.',
            part: 'vesicle',
            view: 'signal',
            set: { t: 0.45, ion: 'k', gate: true }
          }
        ]
      }
    ]
  });

  NMFIG.data('demo2', {
    title: '줄에서 일어나는 파동',
    lead: '줄 위의 마루, 골, 파원에 올려 보세요.',
    idle: '진폭을 키우면 마루는 올라가고 골은 내려갑니다. ▶를 누르면 경과 시간이 흐릅니다.',
    order: ['source', 'string', 'crest', 'trough'],
    parts: {
      source: {
        name: '파원', en: 'Source', level: 'core',
        where: '줄의 왼쪽 끝, 흔들림이 시작되는 점',
        etym: {
          ko: '파원(波源)은 파동이 태어나는 곳이다.',
          en: 'source는 라틴어 surgere(솟아오르다)에서 왔다.',
          memo: '흔들림이 처음 솟는 곳이다.'
        },
        role: ['줄을 흔들어 파동을 만든다.'],
        links: ['string']
      },
      string: {
        name: '줄', en: 'String', level: 'core',
        where: '파동이 타고 가는 팽팽한 끈',
        etym: {
          ko: '줄은 양 끝을 당겨 팽팽하게 만든 끈이다.',
          en: 'string은 끈을 뜻하는 영어다.',
          memo: '줄이 출렁이면 파동이 지나간다.'
        },
        role: ['매질이 되어 흔들림을 오른쪽으로 전달한다.'],
        exam: '매질은 파동과 함께 멀리 이동하지 않고 제자리에서 진동한다.',
        links: ['crest', 'trough', 'source']
      },
      crest: {
        name: '마루', en: 'Crest', level: 'core',
        where: '평형에서 가장 높이 올라간 곳',
        etym: {
          ko: '마루는 지붕이나 물결의 가장 높은 곳이다.',
          en: 'crest는 라틴어 crista(벼슬, 꼭대기)에서 왔다.',
          memo: '파도의 봉우리가 마루다.'
        },
        role: ['변위의 최댓값을 보여 준다.'],
        exam: '진폭은 마루에서 평형까지의 높이다. 진동수는 빠르기다.',
        links: ['trough', 'string']
      },
      trough: {
        name: '골', en: 'Trough', level: 'ref',
        where: '평형에서 가장 낮게 내려간 곳',
        etym: {
          ko: '골은 물결이 꺼진 바닥이다.',
          en: 'trough는 길쭉하게 파인 구유를 뜻하는 영어다.',
          memo: '파도가 꺼진 바닥이 골이다.'
        },
        role: ['마루의 반대편, 변위의 최솟값이다.'],
        links: ['crest', 'string']
      }
    }
  });
})(window.NMFIG);
