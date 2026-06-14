# 🔍 nanamate 콘텐츠 감사 리포트

> 종합 감사 워크플로우 결과 (40과목 · 363챕터) — 자동 생성

## 실행 요약
- 감사 완료: **39/40 과목** · 미완료: aboutSaju
- 안전 자동수정: **35건** · 사실 지적: **142건**(대부분 경미·방어가능, 기록만) · 구조 지적: **34건** · 빈약(thin) 블록: **14개**

## ✅ 자동 수정된 항목 (34)
- **aboutAI/chapters/09-references.html** [사실/low] easy-version에 '주요 논문 38편'이라 적혀 있으나 ref-list 실제 항목은 39개. 명백한 수치 불일치라 38→39로 수정함.
- **aboutAstronomy/chapters/09-space-exploration.html** [사실/med] Terminology error: '비사본(specific impulse)' is not a real Korean term; standard term is '비추력'. English gloss and formula I_sp=v_e/g0 confirm intent. FIXED to 비추력.
- **aboutBiology/chapters/03-evolution.html** [사실/med] 인명 오류: 대장균 장기 진화 실험(LTEE) 연구자를 '레스키'로 표기 → 'Richard Lenski(렌스키)'가 올바름. '렌스키'로 수정함.
- **aboutDatabase/chapters/07-distributed.html** [사실/high] CAP 정리 서술 오류: 'C, A, P 중 최대 2개만 동시에 만족할 수 없다' → 정리의 의미와 정반대(최대 2개를 만족할 수 있다). '없다'를 '있다'로 수정함.
- **aboutDatabase/chapters/09-patterns.html** [사실/med] 'SQL 2011 TEMPORAL 테이블 (MySQL 5.7.6+, PostgreSQL)' 귀속 오류: MySQL은 SQL:2011 시스템 버전 관리 temporal 테이블을 구현하지 않으며(MariaDB 10.3+가 네이티브 구현), PostgreSQL도 코어 네이티브 미지원. 'MariaDB 10.3+, SQL Server 2016+'로 수정함.
- **aboutEarthScience/chapters/02-plate-tectonics.html** [사실/med] 심화 공식 박스에 '나자르 정리'라는 존재하지 않는 정리명이 기재됨. 같은 줄의 설명('구면 위 강체 운동은 단일 회전축=오일러 극으로 기술')은 오일러 회전 정리를 가리키므로 명백한 오류. '오일러 정리'로 수정함.
- **aboutEconomics/chapters/09-crypto-fintech.html** [구조] 수리모델의 '크립토 3요인' 공식에서 모멘텀 계수가 시장 계수와 동일한 β_M로 표기되어 첨자 충돌. β_MOM로 수정함 (기계적 표기 오류).
- **aboutFear/chapters/02-evolution.html** [사실/high] hard 탭 추가 학습 자료: '"Fear: The Evolution of an Emotion" — Susanna Sparrow'는 제목·저자 모두 가공된 귀속 오류. 실제 책은 Joanna Bourke의 'Fear: A Cultural History'(2005)임. 'Susanna Sparrow'라는 저자는 이 분야에 존재하지 않음. 실제 책/저자로 수정함.
- **aboutFear/chapters/08-regulation.html** [사실/high] hard 탭 최신 동향: 'ketamine 코스피플레이트(에스케타민)'에서 '코스피플레이트'는 깨진/오류 텍스트(코스피는 주가지수). 에스케타민의 실제 제품명은 스프라바토(Spravato)임. '에스케타민(스프라바토)'으로 수정함.
- **aboutFrontend/chapters/08-performance.html** [구조] 중·응용 본문(L765)에 짝 없는 따옴표 오타: <code>preconnect"</code>. <code>rel="preconnect"</code>로 수정함(앞의 rel="preload"와 일관).
- **aboutMusic/chapters/04-melody.html** [사실/med] medium 작품2: 아델 'Someone Like You'를 'A 마이너'로 표기. 실제 원조성은 A 메이저(웹 검증: Wikipedia/MusicNotes 등). 'A 마이너'→'A 메이저'로 수정함.
- **aboutMusic/chapters/08-ear-training.html** [사실/med] hard 블록: '티탈리 언어(중국어, 한국어 같은 성조 언어)' — '티탈리 언어'는 깨진/무의미 토큰이고, 한국어는 성조 언어가 아님(피치 악센트 언어). 도이치 연구 대상은 중국어·베트남어. '성조 언어(중국어, 베트남어 같은 성조 언어)'로 수정함.
- **aboutMusic/chapters/09-modern.html** [사실/med] hard 블록: '트라키 베리오의 전자 보컬' — 작곡가 이름이 깨짐. 베리오의 이름은 루치아노(Luciano Berio). 전자 보컬 작품(Thema/Visage) 맥락과 일치. '루치아노 베리오'로 수정함.
- **aboutNeuroscience/chapters/01-neurons.html** [구조] 중급 블록 '사례 2' info-card 여는 태그가 '<div class="info-card"<h4>'로 '>'가 누락된 깨진 HTML. '<div class="info-card"><h4>'로 수정함.
- **aboutPhilosophy/chapters/04-rationalism.html** [사실/med] 데카르트 심신 이원론 설명에서 '점령 문제'는 표준 철학 용어가 아님 — 솔방울샘 상호작용이 야기하는 것은 '심신 상호작용 문제(mind-body interaction problem)'임. 바로 앞 문장이 '상호작용을 가정해'로 끝나 의도가 명백하여 '심신 상호작용 문제'로 수정함.
- **aboutPhysics/chapters/08-quantum.html** [구조] Line 40: 본문 마지막 단어 '탄생했습니다'가 U+FFFD 대체문자 3개로 손상되어 '탄생했습니'+깨진글자+'.'로 표시됨. '탄생했습니다.'로 복구함.
- **aboutPhysics/chapters/09-nuclear.html** [사실/med] medium 탭(line 109)·hard 탭 도전과제(line 123)의 '반-부등식 공식'은 액체 방울 모형의 반경험적 질량 공식(베테-바이츠제커 공식)을 가리키는 잘못된 용어. 괄호 안 Bethe-Weizsacker 맥락이 명확해 '반경험적 질량 공식'으로 2곳 수정함.
- **aboutPolitics/chapters/01-intro.html** [구조] warning-box(line 37)가 여는 <p> 없이 '...중립적으로 봅니다.</p></div>'로 닫혀 불균형 </p> 존재. 다른 챕터의 동일 박스 패턴과 비교해 stray </p> 제거 → </div>로 정상화.
- **aboutPolitics/chapters/07-public-policy.html** [사실/high] 사회구성주의 정책분석(대상집단을 '가치 있는/없는' 사람으로 구성)의 정설 저자는 Schneider & Ingram(1993). 원문은 '후크네티니·앙카로프'로 가상/왜곡된 인명. 해당 개념의 표준 귀속이 명확해 '슈나이더와 잉그램'으로 수정.
- **aboutPolitics/chapters/07-public-policy.html** [사실/med] 후기실증주의·해석주의 정책분석으로 정책을 권력의 산물로 본 학자는 Frank Fischer(피셔). 원문 '패션'은 '피셔'의 명백한 표기 깨짐 → '피셔'로 수정.
- **aboutPsy/ch10.html** [사실/med] Medium block info-card titled '샤크터와 싱어의 흔들다리 실험' misattributed the suspension-bridge misattribution-of-arousal study to Schachter & Singer; it is Dutton & Aron (1974). Schachter-Singer's study was the 1962 epinephrine experiment. Fixed title to '더턴과 아론의 흔들다리 실험'.
- **aboutSecurity/chapters/04-web-vulns.html** [사실/med] easy 블록의 자격증 예시가 'SECP'로 표기됨. SECP는 실재하지 않는 보안 자격증명. 표준 입문 자격증인 'Security+'로 수정함(CISSP와 짝).
- **aboutSociology/chapters/04-institutions.html** [사실/low] easy 섹션 오타: '만들어주답니다' (탈자) → '만들어준답니다'로 수정. 기계적 탈자 교정.
- **aboutSociology/chapters/07-race.html** [사실/med] medium 섹션: 로버트 파크의 인종관계 사이클을 '접촉, 경쟁, 갈등, 적응, 동화'(5개 항목)로 나열하면서 '4단계 사이클'이라 표기 — 내적 모순. 고전적 4단계(접촉·경쟁·적응·동화)에 맞게 '갈등' 제거. 확신 있는 수정.
- **aboutTOEFL/chapters/02-reading.html** [사실/med] Section 1 stated Reading has '22문항' (22 questions) and computed score thresholds against 22 (18/22≈82%, 20/22=91%), contradicting the same chapter and ch1 which correctly state 2 passages × 10 = 20 questions for the 2023 Enhanced format. Fixed to '20문항 중 16문항 이상(약 80%) ... 18문항 이상(90%)'.
- **aboutTOEIC/chapters/01-listening-part1.html** [구조] Sidebar nav links pointed to chapters/NN-...html and cover to index.html, which from inside chapters/ resolve to nonexistent chapters/chapters/... and chapters/index.html (broken navigation). Corrected to sibling paths NN-...html and cover to ../index.html, matching the sitewide pattern (verified vs aboutAstronomy/aboutBackend).
- **aboutTOEIC/chapters/02-listening-part3.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/03-grammar.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/04-vocabulary.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/05-reading-part5.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/06-reading-part7.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/07-strategies.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/08-business.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
- **aboutTOEIC/chapters/09-practice.html** [구조] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.

## 🪶 빈약(thin) — 보강 후보 (8)
- aboutAstronomy/chapters/07-exoplanets.html → easy, medium, hard
- aboutAstronomy/chapters/08-observational.html → easy, medium, hard
- aboutAstronomy/chapters/09-space-exploration.html → easy, medium, hard
- aboutHistory/chapters/05-revolution.html → medium
- aboutHistory/chapters/06-imperialism.html → medium
- aboutHistory/chapters/07-cold-war.html → medium
- aboutHistory/chapters/08-korean.html → medium
- aboutHistory/chapters/09-future.html → medium

## 📋 과목별 상세 (이슈 있는 챕터만)

### aboutAI (수정 1)
**aboutAI/chapters/04-transformer.html**
- [사실/med/기록] hard 섹션 FlashAttention 설명: 'IO 복잡도를 O(n²d/M)에서 O(n²d²/M)로 개선'이라고 했으나 두 값이 뒤바뀜 — 결과값(O(n²d²/M))이 출발값보다 커서 '개선'과 모순. 표준 어텐션 IO는 O(nd+n²)이고 FlashAttention이 O(n²d²/M)이다. 정확한 표현이 미묘해 주관적 재서술이 필요하므로 수정하지 않고 기록만 함.
**aboutAI/chapters/05-llm.html**
- [사실/low/기록] Kaplan 스케일링 지수 표기 혼재: 본문 식(7.2영역)은 α_N≈0.076, 그림9 주석은 'L ∝ C^(-0.05)', hard 섹션은 α≈0.34·β≈0.28(Chinchilla)로 출처가 서로 다른 값들이 섞여 있음. 각각 원논문 근거가 있어 명백한 오류는 아니나 독자 혼동 가능. 확신 부족으로 기록만 함.
**aboutAI/chapters/06-generative.html**
- [사실/low/기록] VAE 인용 연도 불일치: paper-version은 'Kingma & Welling(2014)', medium 섹션은 'Kingma & Welling, 2013'. 원논문은 arXiv 2013/ICLR 2014라 둘 다 방어 가능 — 오류 아님, 일관성 차원에서 기록만.
**aboutAI/chapters/09-references.html**
- [사실/low/수정됨] easy-version에 '주요 논문 38편'이라 적혀 있으나 ref-list 실제 항목은 39개. 명백한 수치 불일치라 38→39로 수정함.

### aboutAnger (수정 0)
**aboutAnger/chapters/03-neural.html**
- [사실/low/기록] 편도체가 '0.2초 안에 위협을 감지한다'는 구체 수치는 대중과학 통설로, 정확한 합의 수치는 아님. 명백한 오류는 아니어서 수정 안 함.
**aboutAnger/chapters/05-culture.html**
- [사실/low/기록] 호프스테더 power distance index에서 한국 값을 '60(중간 상위)'로 기재. 출처에 따라 한국 PDI는 보통 약 60으로 인용되나 판본별 편차가 있음. 통상 인용 범위 내라 수정 안 함.
**aboutAnger/chapters/06-daily.html**
- [사실/low/기록] '분노 호르몬은 90초 안에 자연 소실된다'는 90초 규칙을 확립된 사실처럼 단정. Jill Bolte Taylor 유래의 대중과학 주장으로 엄밀히 검증된 수치는 아님. 널리 통용되는 비-악성 주장이라 수정 안 함.
**aboutAnger/chapters/09-future.html**
- [사실/low/기록] 'X(트위터)에서 정치적 분노 트윗이 평균 6배 더 리트윗'이라는 구체 수치는 특정 연구(Brady et al. 도덕·정서 단어당 약 20% 증가 등)와 정확히 일치하지 않는 단순화된 인용. 방향성은 맞으나 수치 출처 불명확. 확신 부족으로 수정 안 함.

### aboutAstrology (수정 0)
**aboutAstrology/chapters/01-what-is.html**
- [사실/low/기록] Carlson 1985 Nature 이중맹검 실험 귀속 정확. 프톨레마이오스 2세기 알렉산드리아·테트라비블로스/알마게스트 귀속 정확. 회귀/항성황도 차이 약 24도 정확.
**aboutAstrology/chapters/02-zodiac.html**
- [사실/low/기록] 세차운동 약 2만 6천 년 주기, 13번째 황도 별자리(뱀주인자리) 포함, 사인-별자리 약 한 칸 어긋남 모두 정확.
**aboutAstrology/chapters/03-elements.html**
- [사실/low/기록] 엠페도클레스 4원소(4뿌리)설 귀속 정확. 융 4기능-원소 대응 서술 적절히 '시도'로 표기됨.
**aboutAstrology/chapters/04-planets.html**
- [사실/low/기록] 천왕성 1781·해왕성 1846·명왕성 1930 발견 연도, 명왕성 2006 IAU 왜소행성 재분류, 새턴 리턴 약 29년 모두 정확.
**aboutAstrology/chapters/05-houses.html**
- [사실/low/기록] 홀사인/플라시두스 하우스 시스템, 고위도 플라시두스 왜곡, 앵글(ASC/IC/DSC/MC) 서술 정확.
**aboutAstrology/chapters/06-natal-chart.html**
- [사실/low/기록] 어센던트 약 2시간마다 한 별자리 이동, 5종 메이저 아스펙트 각도, 오브/차트 교정 개념 모두 정확.
**aboutAstrology/chapters/07-big-three.html**
- [사실/low/기록] 달 약 2.5일마다 별자리 이동, Carlson 1985 Nature 귀속, 빅3 개념 서술 정확.
**aboutAstrology/chapters/08-synastry.html**
- [사실/low/기록] 시너스트리/컴포짓/솔라리턴/수성역행/토성리턴 약 29.5년 서술 정확. (medium 탭에 <p> 2개 — 정상, 태그 균형 맞음.)
**aboutAstrology/chapters/09-science.html**
- [사실/low/기록] 포러(바넘) 효과 연도를 '1948년'으로 기재. 포러는 1948년에 학생 대상 실험을 시행하고 1949년에 논문 게재 — 시행 연도 기준 1948은 방어 가능하므로 명백한 오류 아님. 보수적으로 미수정.
- [사실/low/기록] 칼 세이건 비판, 칼 포퍼 반증가능성·구획 문제, 융 동시성, 세차운동·쌍둥이 문제 귀속 모두 정확.

### aboutAstronomy (수정 1)
**aboutAstronomy/chapters/02-solar-system.html**
- [사실/low/기록] Voyager 1 distance stated as '약 160AU'; as of 2024-2025 it is ~165 AU. Conservative/approximate, within acceptable range — not changed.
**aboutAstronomy/chapters/07-exoplanets.html**
- [사실/low/기록] '1992년 최초의 외계행성 발견' refers to pulsar planets (PSR B1257+12), correct as first confirmed exoplanets; 51 Peg b (1995, first around a main-sequence star) is mentioned separately. Defensible — not changed.
- [구조/기록] Easy tab is thinner than chapters 1-6: lacks the '핵심 용어' (core terms) list and '요약' (summary) that the earlier chapters' easy tabs include. Content present is accurate. Flagged, not fabricated.
- [빈약] 보강 후보: easy, medium, hard
**aboutAstronomy/chapters/08-observational.html**
- [구조/기록] Easy tab lacks the '핵심 용어' list and '요약' present in chapters 1-6; medium/hard tabs ~half the length of earlier chapters with fewer worked examples. Accurate but sparse. Flagged, not fabricated.
- [빈약] 보강 후보: easy, medium, hard
**aboutAstronomy/chapters/09-space-exploration.html**
- [사실/med/수정됨] Terminology error: '비사본(specific impulse)' is not a real Korean term; standard term is '비추력'. English gloss and formula I_sp=v_e/g0 confirm intent. FIXED to 비추력.
- [구조/기록] Easy tab lacks the '핵심 용어' list and '요약' present in chapters 1-6; difficulty tabs shorter than earlier chapters. Accurate but sparse. Flagged, not fabricated.
- [빈약] 보강 후보: easy, medium, hard

### aboutBackend (수정 0)
**aboutBackend/chapters/04-auth-security.html**
- [사실/low/기록] easy 탭에서 2017 Equifax 사고 피해 규모를 '1억 4천만 명'(140M)으로 표기. 실제는 약 147M으로 근사치 범위이며 명백한 오류가 아니라 수정하지 않음(기록만).

### aboutBiology (수정 1)
**aboutBiology/chapters/02-dna.html**
- [구조/기록] 탭 위 본문(메인 영역)이 템플릿 보일러플레이트임: 인트로 <p>가 '세포, DNA, 생태계를 직접 탐색하세요'로 챕터 주제와 무관, info-card '핵심 개념'은 'DNA, Genes & Heredity의 기본 원리와 응용을 다룹니다'라는 영문 제목 끼워넣기식 placeholder. 난이도 블록은 충실하나 정적 본문은 부실.
**aboutBiology/chapters/03-evolution.html**
- [사실/med/수정됨] 인명 오류: 대장균 장기 진화 실험(LTEE) 연구자를 '레스키'로 표기 → 'Richard Lenski(렌스키)'가 올바름. '렌스키'로 수정함.
- [구조/기록] 탭 위 본문이 템플릿 보일러플레이트: 인트로 <p>('세포, DNA, 생태계를 직접 탐색하세요')와 info-card '핵심 개념'('Evolution & Natural Selection의 기본 원리와 응용을 다룹니다')이 주제 무관 placeholder. 난이도 블록은 충실.
**aboutBiology/chapters/05-physiology.html**
- [구조/기록] 탭 위 본문이 템플릿 보일러플레이트: 인트로 <p>('세포, DNA, 생태계를 직접 탐색하세요')와 info-card '핵심 개념'('Human Physiology의 기본 원리와 응용을 다룹니다') placeholder. 난이도 블록은 충실.
**aboutBiology/chapters/06-microbiology.html**
- [구조/기록] 탭 위 본문이 템플릿 보일러플레이트: 인트로 <p>('세포, DNA, 생태계를 직접 탐색하세요')와 info-card '핵심 개념'('Microbiology & Viruses의 기본 원리와 응용을 다룹니다') placeholder. 난이도 블록은 충실.
**aboutBiology/chapters/08-zoology.html**
- [사실/med/기록] 용어 깨짐(hard 블록, 라인 97): '캐신 4중복(2R)' — '캐신'은 의미 불명 손상 문구. 의도는 전장 유전체 2회 중복(2R, two rounds of whole-genome duplication)으로 보임. 또한 '2R'은 '2회 중복'인데 '4중복'으로 서술. 정확한 원문 의도 불확실하여 보수적으로 수정 보류.
- [사실/med/기록] 용어 깨짐(hard 블록, 라인 97): '코비드 등 일부 새' — 거울 자기인식·도구 사용 맥락상 '까마귀류(corvid)'를 뜻함. 한글 독자에겐 'COVID'로 오독됨. 'corvid' 의도이나 표기 수정에 확신 부족하여 플래그만.
- [구조/기록] 탭 위 본문이 템플릿 보일러플레이트: 인트로 <p>('세포, DNA, 생태계를 직접 탐색하세요')와 info-card '핵심 개념'('Animal Biology & Classification의 기본 원리와 응용을 다룹니다') placeholder. 난이도 블록은 충실.
**aboutBiology/chapters/09-biotech.html**
- [구조/기록] 탭 위 본문이 템플릿 보일러플레이트: 인트로 <p>('세포, DNA, 생태계를 직접 탐색하세요')와 info-card '핵심 개념'('Biotechnology & Genetic Engineering의 기본 원리와 응용을 다룹니다') placeholder. 난이도 블록은 충실.

### aboutChemistry (수정 0)
**aboutChemistry/chapters/01-atomic-structure.html**
- [사실/low/기록] Electron configurations including Cr ([Ar]3d⁵4s¹) and Cu ([Ar]3d¹⁰4s¹) exceptions are all textbook-correct. Bohr getShells maxPerShell=[2,8,18,8] is a deliberate simplified visual model (caps 4th shell at 8, valid up to Z=36); not an error.
**aboutChemistry/chapters/02-chemical-bonding.html**
- [사실/low/기록] VSEPR geometries, electronegativity polarity thresholds (ΔEN <0.4 nonpolar, 0.4-1.7 polar, ≥1.7 ionic) and bond-type descriptions are all standard and correct.
**aboutChemistry/chapters/03-chemical-reactions.html**
- [사실/low/기록] Reaction types, rate law, Arrhenius equation, activation energy, equilibrium constant and Le Chatelier principle all stated correctly.
**aboutChemistry/chapters/04-thermochemistry.html**
- [사실/low/기록] Exo/endothermic sign conventions (ΔH<0 / ΔH>0), q=mcΔT, ΔG=ΔH-TΔS, Hess's law and Maxwell-Boltzmann distribution all correct.
**aboutChemistry/chapters/05-acid-base.html**
- [사실/low/기록] Bronsted-Lowry/Arrhenius/Lewis definitions, pH+pOH=14 at 25C, Henderson-Hasselbalch, neutralization ΔH=-57.1 kJ/mol, blood pH 7.35-7.45 all correct.
**aboutChemistry/chapters/06-redox.html**
- [사실/low/기록] OIL RIG mnemonic, Zn/Cu half-reactions, oxidation-number rules, galvanic vs electrolysis, Faraday's law and F=96,485 C/mol all correct.
**aboutChemistry/chapters/07-organic.html**
- [사실/low/기록] Alkane CnH2n+2, alkene CnH2n, benzene C6H6, ethylene=ethene, propylene=propene, isobutane=2-methylpropane, functional groups all correct.
**aboutChemistry/chapters/08-polymer.html**
- [사실/low/기록] Addition vs condensation polymerization, thermoplastic/thermoset examples, crystalline/amorphous distinction, biopolymer examples all correct.
**aboutChemistry/chapters/09-biochemistry.html**
- [사실/low/기록] Biomolecule classes, 20 amino acids, peptide bonds, Michaelis-Menten equation, cellular respiration equation, ~36-38 ATP per glucose all correct. Carbohydrate general formula written Cn(H2O)n is a common simplification (more general Cx(H2O)y); acceptable.
**aboutChemistry/chapters/02-chemical-bonds.html**
- [구조/기록] Orphaned duplicate file NOT linked from index.html (index references 02-chemical-bonding.html). This file uses the data-level easy/medium/hard structure and appears superseded. Pre-existing dead file — flagged only, not deleted/edited.
**aboutChemistry/chapters/08-polymers.html**
- [구조/기록] Orphaned duplicate file NOT linked from index.html (index references 08-polymer.html). Uses data-level structure and appears superseded. Pre-existing dead file — flagged only, not deleted/edited.

### aboutChinese (수정 0)
**aboutChinese/chapters/02-basic-grammar.html**
- [사실/low/기록] easy 핵심표현에서 你吃饭吗？(Nǐ chīfàn ma?)를 '밥 먹었어?'(과거)로 번역. 了가 없는 吗-의문문은 보통 현재/일반('밥 먹어?/먹을래?')에 가까움. 번역 어감 문제로 명백한 오류는 아님 — 보수적으로 미수정.
**aboutChinese/chapters/06-hsk4.html**
- [사실/low/기록] medium에서 复合方向补语를 '7쌍'이라 했으나 나열된 上去/下来/出去/进来/回去/过去/起来는 7개 단일 항목이며 起来는 起去 짝이 없음. '쌍'이라는 표현이 다소 부정확하나 예시 자체는 유효 — 보수적으로 미수정.
**aboutChinese/chapters/08-culture.html**
- [사실/low/기록] medium에서 4자성어(成语)가 '5만 개 이상' 존재한다고 서술. 대형 성어사전 표제어 수가 약 1.8만~5만 사이로 출처마다 다름. 최대 사전 기준 5만은 가능한 수치라 명백한 오류는 아님 — 미수정.

### aboutDatabase (수정 2)
**aboutDatabase/chapters/03-normalization.html**
- [사실/low/기록] 정규화를 'E.F. Codd가 1971년 제안'으로 기술. Codd의 추가 정규화 논문은 1971년 발표(IBM Research Report)로 통용되는 연도라 명백한 오류는 아님. 기록만.
**aboutDatabase/chapters/07-distributed.html**
- [사실/high/수정됨] CAP 정리 서술 오류: 'C, A, P 중 최대 2개만 동시에 만족할 수 없다' → 정리의 의미와 정반대(최대 2개를 만족할 수 있다). '없다'를 '있다'로 수정함.
- [사실/low/기록] CAP 실무 분류에서 MongoDB/HBase를 CP로 분류. 일반적으로 통용되나 단순화된 분류라는 점은 학술적으로 논쟁 여지 있음. 명백한 오류는 아니라 기록만.
**aboutDatabase/chapters/09-patterns.html**
- [사실/med/수정됨] 'SQL 2011 TEMPORAL 테이블 (MySQL 5.7.6+, PostgreSQL)' 귀속 오류: MySQL은 SQL:2011 시스템 버전 관리 temporal 테이블을 구현하지 않으며(MariaDB 10.3+가 네이티브 구현), PostgreSQL도 코어 네이티브 미지원. 'MariaDB 10.3+, SQL Server 2016+'로 수정함.

### aboutDisgust (수정 0)
**aboutDisgust/chapters/06-daily.html**
- [사실/low/기록] Pettigrew & Tropp (2006) 메타분석 효과크기를 'd≈0.21'로 표기. 실제 출판값은 상관계수 r≈-.21(코헨 d가 아님). 크기·방향은 맞으나 통계 지표 라벨이 부정확. 보수적으로 미수정(불확실/문체적 정밀 사항).

### aboutEarthScience (수정 1)
**aboutEarthScience/chapters/02-plate-tectonics.html**
- [사실/med/수정됨] 심화 공식 박스에 '나자르 정리'라는 존재하지 않는 정리명이 기재됨. 같은 줄의 설명('구면 위 강체 운동은 단일 회전축=오일러 극으로 기술')은 오일러 회전 정리를 가리키므로 명백한 오류. '오일러 정리'로 수정함.
**aboutEarthScience/chapters/06-climate-change.html**
- [사실/low/기록] 하 난이도 요약 위 증거 목록에 '물후학적 변화'라는 표현이 있음. 'phenology(생물계절학)'의 비표준 번역으로 보이며 '생물계절학적/계절현상의' 변화가 더 정확. 확신이 낮고 문체/용어 선택 영역이라 수정하지 않고 기록만 함.
**aboutEarthScience/chapters/08-natural-disasters.html**
- [사실/low/기록] 하 난이도 본문에서 홍수 원인으로 '빙하호 결빙 붕괴'라고 표기됨. 실제 현상(GLOF)은 빙하호의 '제방/모레인 붕괴'에 의한 결궤이며 '결빙 붕괴'는 부정확한 표현. 저위험·표현 차원이라 기록만 함.
**aboutEarthScience/chapters/09-resources-environment.html**
- [사실/low/기록] 중 난이도 사례에서 동해 가스전 생산기간을 '2004–2021'로 기재. 통상 알려진 상업생산 기간은 2004년 시작이며 2021년경 고갈/생산종료로 알려져 대체로 부합하나, 종료 연도는 자료에 따라 차이가 있을 수 있어 확신이 낮음. 수정하지 않고 기록만 함.

### aboutEconomics (수정 1)
**aboutEconomics/chapters/01-micro.html**
- [사실/low/기록] 2015년 한국 담배가격 2,500→4,500원, 단기 판매량 약 24% 감소 — 2015년 1월 인상, 판매량 약 23~24% 감소로 사실에 부합.
**aboutEconomics/chapters/02-macro.html**
- [사실/low/기록] 2022 미 연준 CPI 9.1%, 11회 525bp 인상, 한국 기준금리 3.5% — 모두 사실에 부합.
**aboutEconomics/chapters/03-finance.html**
- [사실/low/기록] '복리는 세계 8대 불가사의'를 워렌 버핏의 발언으로 귀속. 이 인용구는 통상 아인슈타인에게 (출처 불명으로) 잘못 귀속되는 미검증 격언으로, 어느 인물에게도 1차 출처가 없음. 인용 귀속이 부정확하나 격언 자체가 검증 불가하여 보수적으로 미수정.
- [사실/low/기록] 버핏 2008년 10년 내기 결과 S&P500 인덱스펀드 연 7.1% vs 헤지펀드 평균 2.2% — 사실에 부합.
**aboutEconomics/chapters/04-trade.html**
- [사실/low/기록] 한-EU FTA 2011년 발효(잠정 적용 2011.7), 미중 무역분쟁 2018년부터 평균 약 19% 추가관세 — 사실 범위 내.
**aboutEconomics/chapters/05-behavioral.html**
- [사실/low/기록] 장기기증 옵트인/옵트아웃 기증율(스페인·오스트리아 90%+ vs 독일·미국 15% 이하) — Johnson&Goldstein 2003 연구와 부합.
**aboutEconomics/chapters/06-development.html**
- [사실/low/기록] 한국 R&D/GDP 4.9% 세계 1~2위 — 2022년 기준 약 4.9~5.0%로 이스라엘과 1~2위, 사실에 부합.
**aboutEconomics/chapters/07-labor.html**
- [사실/low/기록] Card-Krueger 1992 뉴저지 최저임금 연구, Brynjolfsson AI RCT 평균 약 14% 생산성 향상 — 사실에 부합.
**aboutEconomics/chapters/08-public-finance.html**
- [사실/low/기록] 한국 부가가치세 1977년 10% 도입, 스웨덴 탄소세 1991년 도입(톤당 약 130달러대) — 사실에 부합.
**aboutEconomics/chapters/09-crypto-fintech.html**
- [사실/low/기록] Terra/Luna 2022년 5월 붕괴 약 400억 달러 증발, 카카오뱅크 2017년 출범 — 사실에 부합.
- [구조/수정됨] 수리모델의 '크립토 3요인' 공식에서 모멘텀 계수가 시장 계수와 동일한 β_M로 표기되어 첨자 충돌. β_MOM로 수정함 (기계적 표기 오류).

### aboutEnglish — 이슈 없음 ✅ (수정 0)

### aboutFear (수정 2)
**aboutFear/chapters/01-definition.html**
- [사실/med/기록] medium 탭: '한국 성인 사회불안 평생 유병률은 약 25%'는 과장 가능성이 높음. 한국 역학조사(예: 정신질환실태조사)의 사회불안장애 평생 유병률은 대략 1~3% 수준이며, 25%는 출처 불명의 과대 수치로 보임. 확신이 100%는 아니라 수정하지 않고 기록만 함.
**aboutFear/chapters/02-evolution.html**
- [사실/high/수정됨] hard 탭 추가 학습 자료: '"Fear: The Evolution of an Emotion" — Susanna Sparrow'는 제목·저자 모두 가공된 귀속 오류. 실제 책은 Joanna Bourke의 'Fear: A Cultural History'(2005)임. 'Susanna Sparrow'라는 저자는 이 분야에 존재하지 않음. 실제 책/저자로 수정함.
**aboutFear/chapters/04-development.html**
- [사실/med/기록] medium 탭: 'Pat Casey와 BJ Casey의 fMRI 연구'에서 'Pat Casey'는 청소년 편도체-PFC 비대칭 연구와 무관한 가공/중복 인명으로 보임. 해당 분야의 실제 연구자는 BJ Casey(Betty Jo Casey) 단독. 확실치 않아 수정하지 않고 기록만 함('Pat Casey와' 삭제가 유력).
**aboutFear/chapters/07-clinical.html**
- [사실/low/기록] medium 탭: '공황장애 환자는 2017년 14만 명에서 2022년 25만 명으로 거의 두 배' 및 '코로나 이후 진료 30% 이상 증가'는 건강보험심사평가원 통계로 제시되나 정확한 수치 출처를 즉시 검증할 수 없음. 방향성(증가)은 사실이나 구체 수치는 미검증으로 기록만 함.
**aboutFear/chapters/08-regulation.html**
- [사실/high/수정됨] hard 탭 최신 동향: 'ketamine 코스피플레이트(에스케타민)'에서 '코스피플레이트'는 깨진/오류 텍스트(코스피는 주가지수). 에스케타민의 실제 제품명은 스프라바토(Spravato)임. '에스케타민(스프라바토)'으로 수정함.
- [사실/med/기록] hard 탭: MAPS 3상에서 'MDMA 12주 후 67% 진단기준 미충족'은 발표 수치와 대체로 부합하나, 'FDA가 2017년 breakthrough 지정 후 승인 심사 단계'라는 서술은 시점에 따라 부정확해질 수 있음(실제 FDA는 2024년 MDMA 신약을 1차 거부). 시의성 문제로 기록만 함.
**aboutFear/chapters/09-future.html**
- [사실/low/기록] medium 탭: '식약처 디지털 치료제 1·2호로 솜즈(불면증)·웰트아이(불면증) 승인' — 1호 솜즈(에임메드, 불면증), 2호 웰트아이오(웰트, 불면증)는 대체로 맞으나 제품명 표기(웰트아이 vs WELT-I)와 회사 매칭은 미세 검증 필요. 큰 오류는 아니어서 기록만 함.

### aboutFengshui — 이슈 없음 ✅ (수정 0)

### aboutFrontend (수정 1)
**aboutFrontend/chapters/08-performance.html**
- [구조/수정됨] 중·응용 본문(L765)에 짝 없는 따옴표 오타: <code>preconnect"</code>. <code>rel="preconnect"</code>로 수정함(앞의 rel="preload"와 일관).
**aboutFrontend/chapters/09-build-deploy.html**
- [사실/low/기록] 패키지 관리자 비교표에서 pnpm 출시 연도를 '2016년'으로 표기. pnpm의 첫 npm 배포(v0.x)는 2017년 초로, '출시' 의미에 따라 논쟁 가능. 보수적으로 미수정(플래그만).

### aboutHistory (수정 0)
**aboutHistory/chapters/01-ancient.html**
- [사실/low/기록] medium 탭: 카데시 전투(BC 1274)에서 '인류 최초의 평화조약을 맺습니다'는 전투 연도와 조약 체결(이집트-히타이트 조약, 약 BC 1259)을 한 문장에 압축한 흔한 단순화. 전투 자체는 BC 1274가 맞음.
**aboutHistory/chapters/02-classical.html**
- [사실/med/기록] easy 탭: 마라톤 전투 전령이 '42.195km를 달려'는 시대착오. 마라톤~아테네 전설상 거리는 약 40km이며 42.195km는 1908년 런던 올림픽에서 확정된 수치. 게다가 이 일화(페이디피데스) 자체가 후대 전설이라 숫자만 고치기 애매하여 기록만 함.
- [사실/low/기록] 콘스탄티누스 1세 출생 'AD 272'는 추정치(통상 272~280년대)로 허용 범위. 사망 337·밀라노 칙령 313 정확.
**aboutHistory/chapters/03-medieval.html**
- [사실/low/기록] medium 탭: 고려 1234년 『상정고금예문』을 '세계 최초 금속활자본'이라 단정. 실물이 전하지 않아 '기록상 최초'일 뿐이며 현존 최고(最古) 금속활자본은 직지(1377). 다만 이는 한국 교과서의 관행적 서술이라 확신 부족·논쟁적이라 수정하지 않고 기록만.
**aboutHistory/chapters/04-renaissance.html**
- [사실/low/기록] easy 탭: 콜럼버스 교환을 '5억 년간 단절됐던 구·신대륙 생태계'로 표현(medium에도 동일). 판게아 분열 시점을 고려하면 통상 '약 2억~2억5천만 년'이 더 정확. 다만 대중서에서도 편차가 큰 수사적 표현이라 기록만.
**aboutHistory/chapters/05-revolution.html**
- [빈약] 보강 후보: medium
**aboutHistory/chapters/06-imperialism.html**
- [빈약] 보강 후보: medium
**aboutHistory/chapters/07-cold-war.html**
- [빈약] 보강 후보: medium
**aboutHistory/chapters/08-korean.html**
- [빈약] 보강 후보: medium
**aboutHistory/chapters/09-future.html**
- [빈약] 보강 후보: medium

### aboutIching (수정 0)
**aboutIching/chapters/01-what-is.html**
- [구조/기록] easy 탭 본문(line 52)에 '그 변화에는 일정한 결과 리듬이 있다는 믿음'이라는 어색한 표현. '결과'가 군더더기로 보이나 문체/표현 문제이며 사실오류·HTML버그가 아니므로 보수적으로 미수정(flag만).

### aboutIdeology (수정 0)
**aboutIdeology/chapters/08-totalitarianism.html**
- [사실/med/기록] medium 탭의 info-card '전체주의의 다섯 가지 특징' 중 세 번째 항목이 '공산주의를 주요 적으로 규정하는 강한 반공 성향(스탈린주의는 다름)'을 전체주의 일반의 특징으로 제시한다. 그러나 반공은 파시즘·나치즘의 특징이지, 챕터 스스로 전체주의로 분류한 스탈린주의에는 적용되지 않으므로 '전체주의의 특징' 목록에 넣는 것은 개념적 모순이다. 사실상 파시즘 특유의 속성을 전체주의 범주 특징으로 일반화한 오류. 수정하려면 카드 틀 자체를 다시 써야 해 문체/주관 영역으로 판단, flag만 함.

### aboutJoy (수정 0)
**aboutJoy/chapters/08-regulation.html**
- [사실/low/기록] Hard tab states 'psilocybin은 2개의 phase 3 임상에서 ... FDA breakthrough therapy로 지정' — psilocybin did receive FDA Breakthrough Therapy designation (2018/2019), but as of the knowledge cutoff phase 3 results for treatment-resistant depression were still maturing/not both clearly positive. Minor overstatement of trial status; not a clear-cut error so left unchanged.

### aboutLaw (수정 0)
**aboutLaw/chapters/02-constitutional.html**
- [사실/low/기록] 간통죄 위헌결정 사건번호를 '헌재 2015헌가4'로 표기. 실제 2015.2.26 간통죄 위헌결정의 대표 사건번호는 2009헌바17 등 병합이며 '2015헌가4'는 부정확해 보임. 사건번호는 검증 난도가 있어 저확신으로 flag만.
- [사실/low/기록] 호주제 헌법불합치 사건번호를 '헌재 2005헌가13'으로 표기. 2005.2.3 결정의 대표 사건번호는 2001헌가9 등으로, '2005헌가13'은 의심스러우나 확신 없어 flag만.

### aboutLove (수정 0)
**aboutLove/chapters/01-definition.html**
- [사실/low/기록] Harvard 성인 발달 연구를 '85년 추적'으로 표기. 1938년 시작이라 2026년 기준 약 88년이나, '85년'은 흔한 반올림 인용으로 명백한 오류 아님. 수정 안 함.
**aboutLove/chapters/02-evolution.html**
- [사실/low/기록] '옥시토신은 5억 년 전 척추동물부터 존재' — 척추동물 옥시토신 계열 펩타이드 기원과 대략 일치, 명백한 오류 아님. 수정 안 함.
**aboutLove/chapters/04-development.html**
- [사실/low/기록] easy 탭 용어목록에서 Ainsworth 낯선 상황을 '12분 평가 절차'로 표기. 표준 절차는 8개 에피소드 약 20분이라 '12분'은 사실상 오류(12개월 영아와 혼동 가능성). 다만 본문 핵심 논지에 비핵심이고 확신도가 절대적이지 않아 보수적으로 flag만, 미수정.

### aboutMarketing — 이슈 없음 ✅ (수정 0)

### aboutMusic (수정 3)
**aboutMusic/chapters/03-harmony.html**
- [사실/low/기록] easy 블록에서 I-V-vi-IV 진행에 '캐논 코드'라는 별명을 붙임. 엄밀히는 파헬벨 카논 진행(I-V-vi-iii-IV-I-IV-V)과 다름. 통념적/구어적 별칭이라 단정 불가 — 기록만.
**aboutMusic/chapters/04-melody.html**
- [사실/med/수정됨] medium 작품2: 아델 'Someone Like You'를 'A 마이너'로 표기. 실제 원조성은 A 메이저(웹 검증: Wikipedia/MusicNotes 등). 'A 마이너'→'A 메이저'로 수정함.
**aboutMusic/chapters/08-ear-training.html**
- [사실/med/수정됨] hard 블록: '티탈리 언어(중국어, 한국어 같은 성조 언어)' — '티탈리 언어'는 깨진/무의미 토큰이고, 한국어는 성조 언어가 아님(피치 악센트 언어). 도이치 연구 대상은 중국어·베트남어. '성조 언어(중국어, 베트남어 같은 성조 언어)'로 수정함.
**aboutMusic/chapters/09-modern.html**
- [사실/med/수정됨] hard 블록: '트라키 베리오의 전자 보컬' — 작곡가 이름이 깨짐. 베리오의 이름은 루치아노(Luciano Berio). 전자 보컬 작품(Thema/Visage) 맥락과 일치. '루치아노 베리오'로 수정함.

### aboutNeuroscience (수정 1)
**aboutNeuroscience/chapters/01-neurons.html**
- [사실/low/기록] 심화 블록의 시냅스 단백질 'PSD-95, 셰인크'에서 'Shank'를 '셰인크'로 음역. 통용 표기는 '섕크/샹크'에 가까우나 인식 가능한 수준이라 사실 오류는 아님. 문체/표기 문제로 미수정.
- [구조/수정됨] 중급 블록 '사례 2' info-card 여는 태그가 '<div class="info-card"<h4>'로 '>'가 누락된 깨진 HTML. '<div class="info-card"><h4>'로 수정함.
**aboutNeuroscience/chapters/04-memory.html**
- [사실/low/기록] 심화 블록에서 수면 리플레이 폐회로 자극 연구를 '슈피글 그룹'으로 귀속. 인명 음역이 모호하고 특정 그룹 귀속의 정확성을 확신할 수 없어 미수정(기록만).
**aboutNeuroscience/chapters/06-consciousness.html**
- [사실/low/기록] 심화 블록 최신 연구에서 IIT vs GNWT 적대적 협력을 '코하트 등 다국적 협력'으로 표현. Cogitate 컨소시엄을 가리키는 듯하나 '코하트' 음역이 불명확. 확신 부족으로 미수정.
**aboutNeuroscience/chapters/09-neurotech.html**
- [사실/low/기록] 중급 BrainGate 예제에서 '시니샵스(국내)'를 BCI 칩 개발 기업으로 언급. 실재 여부/표기가 불명확하나 사실 단정이 어려워 미수정(기록만). 2021 손글씨 디코딩 분당 90자, 인공와우 70만명 등 다른 수치는 정확.

### aboutPhilosophy (수정 1)
**aboutPhilosophy/chapters/04-rationalism.html**
- [사실/med/수정됨] 데카르트 심신 이원론 설명에서 '점령 문제'는 표준 철학 용어가 아님 — 솔방울샘 상호작용이 야기하는 것은 '심신 상호작용 문제(mind-body interaction problem)'임. 바로 앞 문장이 '상호작용을 가정해'로 끝나 의도가 명백하여 '심신 상호작용 문제'로 수정함.

### aboutPhysics (수정 3)
**aboutPhysics/chapters/08-quantum.html**
- [구조/수정됨] Line 40: 본문 마지막 단어 '탄생했습니다'가 U+FFFD 대체문자 3개로 손상되어 '탄생했습니'+깨진글자+'.'로 표시됨. '탄생했습니다.'로 복구함.
**aboutPhysics/chapters/09-nuclear.html**
- [사실/med/수정됨] medium 탭(line 109)·hard 탭 도전과제(line 123)의 '반-부등식 공식'은 액체 방울 모형의 반경험적 질량 공식(베테-바이츠제커 공식)을 가리키는 잘못된 용어. 괄호 안 Bethe-Weizsacker 맥락이 명확해 '반경험적 질량 공식'으로 2곳 수정함.
- [사실/low/기록] line 56: '핵융합... 핵분열보다 더 큰 에너지를 방출합니다'는 단위질량(핵자)당 기준으로는 맞지만 반응당 절대량은 U-235 분열(~200 MeV)이 D-T 융합(~17.6 MeV)보다 큼. 대중적 단순화로 통용되는 표현이라 수정하지 않고 기록만 함.

### aboutPolitics (수정 3)
**aboutPolitics/chapters/01-intro.html**
- [구조/수정됨] warning-box(line 37)가 여는 <p> 없이 '...중립적으로 봅니다.</p></div>'로 닫혀 불균형 </p> 존재. 다른 챕터의 동일 박스 패턴과 비교해 stray </p> 제거 → </div>로 정상화.
**aboutPolitics/chapters/05-parties.html**
- [사실/low/기록] '사르토리의 7개 유형(일당독재, 일당우위, 양당제, 온건다당제, 양극다당제, 원자화)' — 숫자 7은 사르토리 분류로 맞으나 괄호 안에 6개만 나열(헤게모니정당/일당제 변형 등 누락). 숫자 자체는 정확하므로 명백한 오류가 아닌 나열 불완전. 보수적으로 미수정.
**aboutPolitics/chapters/07-public-policy.html**
- [사실/high/수정됨] 사회구성주의 정책분석(대상집단을 '가치 있는/없는' 사람으로 구성)의 정설 저자는 Schneider & Ingram(1993). 원문은 '후크네티니·앙카로프'로 가상/왜곡된 인명. 해당 개념의 표준 귀속이 명확해 '슈나이더와 잉그램'으로 수정.
- [사실/med/수정됨] 후기실증주의·해석주의 정책분석으로 정책을 권력의 산물로 본 학자는 Frank Fischer(피셔). 원문 '패션'은 '피셔'의 명백한 표기 깨짐 → '피셔'로 수정.
**aboutPolitics/chapters/09-contemporary.html**
- [사실/low/기록] 후쿠야마 '역사의 종말' 관련 '25년이 지난 지금' 표현은 1989 에세이/1992 저서 기준으로는 30여 년에 가까워 다소 부정확. 단 수사적 framing이고 하드 팩트가 아니라 보수적으로 미수정.

### aboutPrideHope (수정 0)
**aboutPrideHope/chapters/01-definition.html**
- [사실/low/기록] Snyder Adult Hope Scale described as 12문항 자가검사 — instrument is 12 items total (8 scored + 4 filler). Accurate enough; not corrected.
- [사실/low/기록] Tracy & Matsumoto (2008) blind-athlete pride study cited correctly (PNAS); attributions accurate.
**aboutPrideHope/chapters/02-evolution.html**
- [사실/low/기록] Tracy & Matsumoto (2008, PNAS) reported as '30개국 132명' judo athletes — figures are within the actual study's range; not clearly wrong.
**aboutPrideHope/chapters/03-neural.html**
- [사실/low/기록] Takahashi et al. (2008) pride/guilt fMRI, Schultz RPE, Berridge wanting/liking attributions all accurate. 'Lee et al. (2020)' Korean mPFC claim is plausible but unverifiable; not clearly wrong, left as-is.
**aboutPrideHope/chapters/04-development.html**
- [사실/low/기록] Lewis et al. (1992) self-conscious emotion timing, Dweck mindset RCT, Sisk et al. (2018) meta-analysis, Erikson stages all attributed correctly.
**aboutPrideHope/chapters/05-culture.html**
- [사실/low/기록] Hofstede IDV scores (US=91, Korea=18), Markus & Kitayama (1991), Heine et al. (1999) all accurate.
**aboutPrideHope/chapters/06-daily.html**
- [사실/low/기록] Gollwitzer implementation-intention meta-analysis, Lyubomirsky 2009, Three Good Things, Penn Resilience Program (Reivich) all correctly attributed.
**aboutPrideHope/chapters/07-clinical.html**
- [사실/low/기록] Beck Hopelessness Scale (1974, 20 items, cutoff 9) and Beck et al. (1985) suicide-prediction findings accurate. Seligman & Maier 1967 learned-helplessness and 2016 'Learned Helplessness at Fifty' reframing (controllability/vmPFC-DRN) correctly stated.
- [사실/low/기록] K-SCAN Korean suicide model and SNS/ROC 0.85 AI figures are plausible but unverifiable; not clearly wrong, left as-is.
**aboutPrideHope/chapters/08-regulation.html**
- [사실/low/기록] Weis & Speridakos (2011) hope-intervention meta-analysis effect sizes, Jacobson BA (1996), Dimidjian (2006), Fava WBT, Gilbert CFT all attributed correctly.
- [사실/low/기록] Specific Korean RCT figures (Kim et al. 2020 CFT effect sizes) and '솜잠' as Korea's first DTx are plausible/largely accurate but partly unverifiable; not clearly wrong.
**aboutPrideHope/chapters/09-future.html**
- [사실/low/기록] Digital MH app meta-analysis effect sizes, Woebot/SuperBetter, EU AI Act references plausible and not clearly wrong. 'NEJM AI 2024 RCT at 80% of human counselor' is unverifiable but presented as forward-looking; left as-is.

### aboutPsy (수정 1)
**aboutPsy/ch01.html**
- [사실/low/기록] Timeline figure dates Freud's 꿈의 해석 (Interpretation of Dreams) to 1900. Published late 1899 but cover-dated 1900; conventional citation, acceptable.
**aboutPsy/ch04.html**
- [사실/low/기록] Pavlov's classical conditioning work dated to '1890년대'; his salivation/conditioning research is late 1890s-early 1900s. Acceptable approximation.
**aboutPsy/ch06.html**
- [사실/low/기록] Ainsworth attachment percentages (secure ~60%, avoidant ~20%, resistant ~10%, disorganized ~10%) are commonly cited approximations. Acceptable.
**aboutPsy/ch08.html**
- [사실/low/기록] Asch conformity figure given as ~37% in main body and ~35% in medium block; both within commonly cited range (~37% of responses conformed). Internally slightly inconsistent but factually acceptable.
**aboutPsy/ch10.html**
- [사실/med/수정됨] Medium block info-card titled '샤크터와 싱어의 흔들다리 실험' misattributed the suspension-bridge misattribution-of-arousal study to Schachter & Singer; it is Dutton & Aron (1974). Schachter-Singer's study was the 1962 epinephrine experiment. Fixed title to '더턴과 아론의 흔들다리 실험'.

### aboutReligion (수정 0)
**aboutReligion/chapters/07-zhuangzi.html**
- [사실/low/기록] easy 탭 한 페이지 요약(line 54): '장자는 노자보다 우주 운행보다 개인의 정신적 자유를 더 강조했다'에서 '보다'가 중복되어 어색함. 사실 오류는 아니고 문체 문제라 수정하지 않고 기록만 함.

### aboutSadness (수정 0)
**aboutSadness/chapters/01-definition.html**
- [사실/med/기록] hard 탭에서 slow-wave sleep 중 슬픔 기억 시냅스 다운스케일링 연구를 'Wolfgang Mauerer'에게 귀속. 시냅스 항상성(SHY) 가설의 대표 연구자는 Giulio Tononi·Chiara Cirelli이며 'Wolfgang Mauerer'는 해당 분야 표준 인물로 확인되지 않음(가공 가능성). 다만 확신이 낮아 수정하지 않고 기록만.
- [사실/low/기록] hard 탭 디지털 표현형 사별 예측 연구를 'O'Connor 2023'으로 귀속. Mary-Frances O'Connor는 비탄 신경과학의 실존 연구자이나 해당 특정 연구·연도 귀속은 검증 불가. 구체 인용 신뢰성 낮음, 기록만.
**aboutSadness/chapters/02-evolution.html**
- [사실/low/기록] hard 탭 '비교 게놈 연구는 PANIC/GRIEF 회로 핵심 유전자가 포유류 공통 조상에서 보존됐음을 시사(Insel 2024)'. Thomas Insel은 정신의학 정책·디지털 표현형 인물로, 비교 게놈 보존 연구의 대표 귀속 대상이 아님. 인용 부정확 가능성, 확신 낮아 기록만.
**aboutSadness/chapters/03-neural.html**
- [사실/low/기록] hard 탭 'Helen Mayberg의 1997년 PET 연구'로 sgACC(BA25) 최초 제시 연도를 명시. Mayberg의 우울 sgACC PET 핵심 논문들은 1997~2005년에 걸쳐 있어 1997 단정은 다소 거칠지만 명백한 오류는 아님. 기록만.
**aboutSadness/chapters/04-development.html**
- [사실/low/기록] hard 탭 'ACE 연구(Felitti 1998)는 1만 7천 명 코호트'. 원 Felitti et al. 1998 표본은 약 9,500명 응답(설문 1단계), 후속 확장 코호트가 약 17,000명. '1만 7천 명'은 흔히 인용되는 전체 코호트 규모로 허용 범위. 기록만.
**aboutSadness/chapters/06-daily.html**
- [사실/low/기록] medium 탭 'SMILE 시험(Blumenthal 1999)' 운동 항우울 효과. Blumenthal의 운동 대 sertraline RCT는 실제 1999년(Arch Intern Med) 게재로 연도·귀속 정확. 'SMILE'은 후속 2007 시험명이기도 하나 1999 원시험을 SMILE로 부르는 관행도 있음. 사실상 정확, 기록만.
**aboutSadness/chapters/07-clinical.html**
- [사실/low/기록] STAR*D 첫 SSRI 반응률 약 37%, 4단계 누적 관해율 67%, PHQ-9 절단점(5/10/15/20), esketamine 2019 FDA, PGD 2022 DSM 추가 — 모두 정확. 사실 오류 없음.
**aboutSadness/chapters/08-regulation.html**
- [사실/low/기록] hard 탭 'Psilocybin RCT(NEJM 2022, Carhart-Harris)'. NEJM 2022 치료저항성 우울 실로시빈 RCT는 Goodwin et al.(COMPASS Pathways)이 주저자이며, Carhart-Harris는 별개의 psilocybin vs escitalopram 시험(NEJM 2021) 주도. 저자 귀속 부정확. 다만 Carhart-Harris가 실로시빈 대표 연구자이고 어느 시험을 지칭하는지 모호해 수정은 보류, 기록만.
**aboutSadness/chapters/09-future.html**
- [사실/low/기록] medium 탭 'Woebot은 스탠퍼드 출신 임상심리학자가 만든 CBT 챗봇'. Woebot은 스탠퍼드 심리학자 Alison Darcy가 창업해 정확. Wysa NHS 채택도 사실. 오류 없음.

### aboutSecurity (수정 1)
**aboutSecurity/chapters/03-network.html**
- [사실/low/기록] WireGuard 핸드셰이크를 '1.5-RTT'로 표기. 일반적으로 WireGuard는 1-RTT 핸드셰이크로 설명됨. 해석 차이 여지가 있어 수정 보류, 플래그만.
**aboutSecurity/chapters/04-web-vulns.html**
- [사실/med/수정됨] easy 블록의 자격증 예시가 'SECP'로 표기됨. SECP는 실재하지 않는 보안 자격증명. 표준 입문 자격증인 'Security+'로 수정함(CISSP와 짝).
**aboutSecurity/chapters/05-auth.html**
- [사실/low/기록] '2024년 Google은 14억 개의 Passkey가 발급되었다고 발표' — 구체 수치(14억) 출처 불확실. 명백한 오류는 아니어서 수정 보류, 플래그만.
**aboutSecurity/chapters/06-system.html**
- [사실/low/기록] '2024년 Linux 6.8에 Rust로 작성된 첫 드라이버 머지' — Rust 인프라는 6.1(2022)에 도입되었고 '첫 드라이버'의 기준이 모호함. 부정확하나 해석 여지가 있어 수정 보류, 플래그만.
**aboutSecurity/chapters/09-governance.html**
- [사실/med/기록] Meta 2023 €1.2B 과징금을 '통지 지연이 가중치'로 귀속. 실제 사유는 EU→미국 데이터 이전 위반(GDPR Ch.5)으로, 통지 지연과는 무관. 사실 귀속이 부정확하나 본문의 €1.2B/2023 수치 자체는 정확. 보수적으로 플래그만.

### aboutShameGuilt (수정 0)
**aboutShameGuilt/chapters/02-evolution.html**
- [구조/기록] hard 탭 success-box가 <strong> 래퍼 없이 '<div class="success-box">🎓 도전 과제:'로 시작 — 다른 박스들의 <strong>💡/⚠️/🎓 패턴과 불일치(문체 일관성 이슈, 렌더링/태그 균형엔 문제 없음). 기계적 버그 아님이라 미수정.
**aboutShameGuilt/chapters/03-neural.html**
- [구조/기록] medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈일 뿐 박스는 정상적으로 </div>로 닫힘. 미수정.
**aboutShameGuilt/chapters/04-development.html**
- [구조/기록] medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 태그 균형/클래스 정상. 미수정.
**aboutShameGuilt/chapters/05-culture.html**
- [구조/기록] medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 미수정.
**aboutShameGuilt/chapters/06-daily.html**
- [사실/low/기록] easy 탭에서 효과적 사과를 '다섯 단계'/5단계로 서술하나, 같은 챕터(개요·핵심용어·medium)에서는 Lewicki의 '사과의 6요소'로 일관 서술. easy는 후회·사과를 한 묶음으로 합쳐 5단계로 압축한 것으로 보이며 내부 약간의 불일치. 명백한 오류라기보다 단순화 표현이라 미수정.
- [구조/기록] easy study-tip, medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 박스 닫힘/클래스/태그 균형 정상. 미수정.
**aboutShameGuilt/chapters/07-clinical.html**
- [구조/기록] easy study-tip, medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 미수정.
**aboutShameGuilt/chapters/08-regulation.html**
- [구조/기록] easy study-tip, medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 미수정.
**aboutShameGuilt/chapters/09-future.html**
- [사실/med/기록] medium 탭: '회복적 정의는 1970년대 뉴질랜드 마오리족의 family group conference에서 유래'. 뉴질랜드 FGC는 1989년 법제화(1980년대)이고, 현대 회복적 정의 운동의 1970년대 기원은 캐나다 온타리오 VORP(1974) 등 다른 사례. 연도와 기원지를 혼동한 귀속 부정확. 단일 숫자가 아니라 문장 전체 재서술이 필요하고 확신 100%는 아니라 보수적으로 미수정·플래그만.
- [사실/low/기록] hard 탭: 'GPT-5·Claude 4 같은 모델' — 본문 작성 시점 기준 미래/가설 모델 명칭을 단정적으로 예시. 사실 오류라기보다 미래 예시 표현이라 미수정.
- [구조/기록] easy study-tip, medium warning-box, hard success-box가 <strong> 래퍼 없이 시작 — 문체 일관성 이슈. 태그 균형/클래스 정상. 미수정.

### aboutSociology (수정 2)
**aboutSociology/chapters/04-institutions.html**
- [사실/low/수정됨] easy 섹션 오타: '만들어주답니다' (탈자) → '만들어준답니다'로 수정. 기계적 탈자 교정.
**aboutSociology/chapters/07-race.html**
- [사실/med/수정됨] medium 섹션: 로버트 파크의 인종관계 사이클을 '접촉, 경쟁, 갈등, 적응, 동화'(5개 항목)로 나열하면서 '4단계 사이클'이라 표기 — 내적 모순. 고전적 4단계(접촉·경쟁·적응·동화)에 맞게 '갈등' 제거. 확신 있는 수정.
**aboutSociology/chapters/08-urban.html**
- [사실/low/기록] hard 섹션: '딕시미 지수'는 거주지 분리 측정의 dissimilarity index(Duncan & Duncan)의 깨진 음역으로 보임. 올바른 한국어 표기가 불확실해 미수정, 기록만.
**aboutSociology/chapters/09-digital.html**
- [사실/low/기록] Cathy O'Neil 음역 불일치: medium 섹션 '캐시 오닐' vs hard 섹션 '케이시 오닐'. 둘 다 가능한 음역이라 문체/일관성 사안으로 미수정, 기록만.

### aboutStartup (수정 0)
**aboutStartup/chapters/01-ideation.html**
- [사실/low/기록] CB Insights 스타트업 실패 원인 1위('no market need') 35% 인용. CB Insights 보고서 연도에 따라 42%(2014)·35%(2021)로 모두 실재하는 수치라 방어 가능. 수정 안 함.
**aboutStartup/chapters/03-business-model.html**
- [사실/low/기록] 마켓플레이스 take rate 'Airbnb ~14%, Uber 25-30%' 및 'Snowflake 사용량 기반 NRR 170%'. 모두 통상 인용 범위 내 정확. 수정 불필요.
**aboutStartup/chapters/04-funding.html**
- [사실/low/기록] '당근마켓 글로벌 시리즈 D 3조 원 밸류'(2021)·'토스 시리즈 A~H 1조 원 이상 유치' 모두 사실에 부합. 수정 불필요.
**aboutStartup/chapters/08-legal.html**
- [사실/low/기록] 스톡옵션 연간 비과세 한도·행사 조건(2년 이상 재직 등) 한국 세제 인용. 세법 개정이 잦아 시점에 따라 한도 수치가 달라질 수 있으나 본문이 '매년 확인 필요'라고 명시해 방어적. 명백한 오류는 아님. 수정 안 함.
**aboutStartup/chapters/09-exit.html**
- [사실/low/기록] '우아한형제들 — 2019년 딜리버리히어로가 약 4.75조에 인수'. 발표는 2019.12, 규제 승인 후 실제 클로징은 2021. '2019'는 발표 시점 기준이며 4.75조 금액도 통상 인용치라 방어 가능. 수정 안 함.
- [사실/low/기록] '카카오 2014년 다음과 합병 후 상장'을 IPO 예시로 제시. 실제로는 상장사 다음과의 합병(우회상장)이라 전통적 IPO와 다름. 다만 본문이 '합병 후 상장'으로 정확히 기술해 명백한 오류 아님. 수정 안 함.
- [사실/low/기록] 'GitHub(MS 75억 달러)'·'Figma(Adobe 200억→규제로 좌절)' 모두 정확($7.5B 2018, $20B 합의 후 2023.12 규제로 종료). 수정 불필요.

### aboutSurprise (수정 0)
**aboutSurprise/chapters/01-definition.html**
- [사실/low/기록] Hard block cites '(Wilcox 2023)' for LLM perplexity vs human surprise/reading-time; chapter 9 cites the same body of work as '(Wilcox 2024)'. Internal year inconsistency. Both years plausibly exist in this research line, so not edited (ambiguous).
**aboutSurprise/chapters/09-future.html**
- [사실/low/기록] Hard block cites '(Wilcox 2024)' for LLM perplexity vs human reading-time/N400; chapter 1 cites the same finding as '(Wilcox 2023)'. Internal year inconsistency between the two chapters. Not edited (ambiguous which is correct).

### aboutTOEFL (수정 1)
**aboutTOEFL/chapters/01-overview.html**
- [사실/low/기록] Hard tab gives an IELTS↔TOEFL polynomial conversion formula (4.27·IELTS²−18.16·IELTS+38.6); it is explicitly labeled '근사'(approximation) and is illustrative, not an official ETS figure. Not a clear error; left as-is.
**aboutTOEFL/chapters/02-reading.html**
- [사실/med/수정됨] Section 1 stated Reading has '22문항' (22 questions) and computed score thresholds against 22 (18/22≈82%, 20/22=91%), contradicting the same chapter and ch1 which correctly state 2 passages × 10 = 20 questions for the 2023 Enhanced format. Fixed to '20문항 중 16문항 이상(약 80%) ... 18문항 이상(90%)'.

### aboutTOEIC (수정 9)
**aboutTOEIC/chapters/01-listening-part1.html**
- [구조/수정됨] Sidebar nav links pointed to chapters/NN-...html and cover to index.html, which from inside chapters/ resolve to nonexistent chapters/chapters/... and chapters/index.html (broken navigation). Corrected to sibling paths NN-...html and cover to ../index.html, matching the sitewide pattern (verified vs aboutAstronomy/aboutBackend).
**aboutTOEIC/chapters/02-listening-part3.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/03-grammar.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/04-vocabulary.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/05-reading-part5.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/06-reading-part7.html**
- [사실/low/기록] Easy-tab study-tip (line 42) describes Part 7 single passages as '약 14문항', but the real test (and ch.7 line 39) states single passages = 29 questions across 10 passages. Internal inconsistency; the ch.6 figure is an illustrative simplification rather than a clear-cut hard error, so flagged not edited.
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/07-strategies.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/08-business.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
**aboutTOEIC/chapters/09-practice.html**
- [구조/수정됨] Broken sidebar nav: chapters/NN-...html and index.html cover link resolved to nonexistent targets from within chapters/. Fixed to sibling paths and ../index.html.
