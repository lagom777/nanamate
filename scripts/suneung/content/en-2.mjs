// 수능 영어 — 독해 후반 (어법·어휘, 빈칸, 간접 쓰기, 장문)
// 2015 개정, 2027학년도 수능까지. 예문은 직접 작성한 것이다.
import { f, note, warn, tip, tbl, ex } from "../lib.mjs";

export const chapters = [
  {
    file: "04-grammar-vocab.html",
    part: null,
    group: "독해",
    unit: "독해",
    title: "어법·어휘 (29~30번)",
    sub: "어법성 판단과 문맥 어휘",
    lead: `<p>수능 영어는 45문항 100점이고 절대평가라 90점 이상이 1등급입니다. 듣기는 1~17번, 독해는 18~45번이며, 29번은 어법, 30번은 어휘입니다. 두 문항 모두 한 지문에 밑줄이 여러 개 있고, 그중 어색한 한 곳을 고릅니다. 29번은 문장 뼈대의 문법 규칙이 깨진 곳이고, 30번은 앞뒤 논리와 뜻의 방향이 반대인 낱말입니다.</p>`,
    body: `<h2>1. 29번과 30번이 묻는 것</h2>
<p>18번부터 28번까지는 목적, 심경 변화, 주장, 함축 의미, 요지, 주제, 제목, 도표, 내용 일치, 안내문 순으로 배치됩니다. 그 다음이 29·30번입니다. 두 문항은 서로 다른 다섯 문장 중 하나를 고르는 방식이 아니라, 한 지문 속 밑줄 ①~⑤ 가운데 하나를 고릅니다. 읽기 전에 발문부터 봅니다. 어법상 <em>틀린 것</em>인지, 문맥상 낱말의 쓰임이 <em>적절하지 않은 것</em>인지에 따라 점검 기준이 갈립니다.</p>
${tbl(
  ["구분", "29번 어법", "30번 어휘"],
  [
    ["묻는 것", "문법 규칙이 깨진 밑줄", "글의 논리와 방향이 반대인 낱말"],
    ["맞는 네 개", "수·시제·관계사·준동사·병렬이 성립", "앞뒤 문장과 같은 방향의 뜻"],
    ["답 하나", "형태는 비슷해도 성분이 틀린 곳", "뜻이 통할 듯해도 평가가 뒤집힌 곳"],
    ["먼저 볼 것", "주어와 정형동사, 밑줄의 문장 성분", "전환·인과·재진술 표현과 밑줄의 긍정·부정"],
  ],
)}
<p>각 문항은 (1) 무엇을 고르는지 (2) 밑줄이 놓인 구조와 단서 (3) 점검 순서 (4) 정답과 오답이 갈리는 지점 (5) 그 자리에 필요한 문법·표현으로 나누어 익히면 흔들리지 않습니다. 지문 전체를 막힘없이 번역하는 일과, 밑줄 한 칸의 성분과 방향을 판정하는 일은 다릅니다. 29·30번은 그 판정으로 답을 고릅니다.</p>
${note("시간 감각", "29·30번 다음에 바로 31~34번 빈칸이 있습니다. 밑줄 다섯 개를 모두 완벽히 설명하려다 한 문항을 오래 붙잡으면, 배점이 큰 빈칸과 뒤의 장문을 읽을 시간이 줄어듭니다. 네 곳이 설명되고 한 곳만 설명이 안 되면 그 한 곳이 답입니다.")}
${tip("밑줄 밖의 단어가 어려워도 그 단어를 답으로 고를 수는 없습니다. 선택 범위는 밑줄로 표시된 부분뿐입니다. 모르는 단어는 품사만 추정하고, 밑줄의 성분과 방향으로 돌아옵니다.")}

<h2>2. 문장 뼈대를 분석하는 절차</h2>
<p>어법 문항에서 가장 흔한 실수는 멋있는 어휘에서가 아니라, 수식어를 주어로 착각하는 데서 납니다. 영어 문장은 뼈대와 수식어로 나뉩니다. 뼈대는 주어, 정형동사, 필요하면 목적어나 보어입니다. 수식어는 전치사구, 관계절, 분사구, 동격, 삽입어구입니다. 수식어를 걷어 낸 뒤에야 수 일치와 태를 판단할 수 있습니다.</p>
${f("한 절의 뼈대 = 주어 + 정형동사 + (목적어 또는 보어)<br>걷어 낼 것 = 전치사구 · 관계절 · to부정사·분사구 · 동격 · 삽입어구<br>정형동사 = 시제를 가진 동사. to부정사·분사·동명사는 준동사라 절의 본동사가 아닙니다.")}
<p>절차는 다섯 단계입니다.</p>
<ol>
<li><strong>문장 경계를 나눈다.</strong> 마침표, 물음표, 느낌표까지가 한 문장입니다. 밑줄이 어느 문장에 있는지 먼저 표시합니다.</li>
<li><strong>정형동사를 찾고, 절이 몇 개인지 센다.</strong> and, but, or가 주어를 다시 세워 절과 절을 잇으면 동사도 절마다 있습니다. 같은 주어 아래에서 동사만 이어지면 술어의 병렬이라 절은 하나이고 동사는 둘입니다. <em>The coach read the notes and changed the drill</em>은 주어가 coach 하나라 한 절입니다. <em>The coach read the notes, and the captain changed the drill</em>은 주어가 둘이라 두 절입니다.</li>
<li><strong>수식어를 괄호로 걷는다.</strong> of, in, on, for, with로 시작하는 전치사구, who·which·that으로 시작하는 관계절, 콤마 앞뒤의 분사구를 괄호에 넣습니다. 괄호 밖 명사가 주어 후보입니다. 문장 맨 앞의 명사를 곧바로 주어로 확정하지 않습니다. 전치사 뒤에 온 명사는 주어가 아닙니다. There 다음에 오는 명사가 진짜 주어이고, It이 가주어이면 뒤의 to부정사나 that절이 진짜 주어입니다.</li>
<li><strong>밑줄이 뼈대인지 수식인지를 정한다.</strong> 밑줄이 동사이면 주어의 수·시제·태를 봅니다. 밑줄이 관계사이면 선행사와 뒤 절의 빈자리를 봅니다. 밑줄이 분사나 to부정사이면 의미상 주어와 능동·수동을 봅니다. 밑줄이 접속사나 전치사이면 뒤에 절이 오는지 명사구가 오는지를 봅니다.</li>
<li><strong>다섯 밑줄을 같은 순서로 점검하고, 설명이 안 되는 한 곳을 남긴다.</strong> 두 곳이 동시에 틀려 보이면 한쪽은 수식어를 주어로 본 오판일 가능성이 큽니다. 괄호를 다시 친 뒤 한 곳만 남겨야 합니다. 출제된 답은 한 개입니다.</li>
</ol>
<p>다음 네 문장으로 절차만 먼저 밟아 보겠습니다. 이 문단에는 일부러 틀린 밑줄을 넣지 않았습니다.</p>
<p><em>The box of old letters that my grandparents wrote was found in the attic. Although the paper was thin, most of the lines were still clear. Reading them slowly, my mother copied the dates into a notebook. What she wanted was a record her children could trust.</em></p>
<ul>
<li>첫 문장: of old letters와 that my grandparents wrote를 걷으면 주어는 <strong>The box</strong>(단수)이고 동사는 <strong>was found</strong>입니다. that은 letters를 선행사로 하는 목적격 관계대명사라 wrote의 목적어 자리입니다. grandparents에 동사를 맞추면 were가 되어 틀립니다.</li>
<li>둘째 문장: Although 뒤에는 the paper was thin이라는 절이 있습니다. 주절 주어는 most of the lines, 동사는 were입니다. 전치사 of의 목적어 the lines가 수의 기준입니다.</li>
<li>셋째 문장: Reading의 의미상 주어는 주절의 주어 my mother입니다. 어머니가 읽는 동작과 베끼는 동작의 주체가 같습니다.</li>
<li>넷째 문장: What she wanted 전체가 주어이고 동사는 was입니다. what은 선행사를 포함한 관계사라 앞에 명사가 없습니다. a record 뒤 her children could trust는 목적격 관계사가 생략된 관계절입니다.</li>
</ul>
${warn("콤마 사이의 however, for example, I believe 같은 삽입어구는 주어와 동사를 갈라놓습니다. The plan, however, was simple에서 동사는 was이고, however는 동사가 아닙니다. 삽입어구 바로 뒤를 동사로 착각하지 마세요.")}
${tip("시험지에는 주어에 S, 정형동사에 V만 표시해도 충분합니다. 긴 번역을 옆에 쓰지 않습니다. 표시가 끝난 문장부터 밑줄을 판정합니다.")}

<h2>3. 자주 나오는 어법 포인트</h2>
<p>아래 표는 밑줄을 볼 때 먼저 떠올릴 대조입니다. 이어서 각 포인트를 문장 성분 기준으로 설명합니다. 형태를 외우기 전에, 그 형태가 어느 성분일 때 성립하는지를 같이 기억해야 합니다.</p>
${tbl(
  ["포인트", "성립하는 형태", "우선 의심할 형태"],
  [
    ["수 일치", "The number of + 복수명사 + 단수 동사", "of 뒤 복수명사에 동사를 맞춘 복수"],
    ["수 일치", "A number of + 복수명사 + 복수 동사", "number라는 말만 보고 쓴 단수 동사"],
    ["시제", "끝난 시점(yesterday, in 2019)에는 과거", "끝난 시점과 현재완료의 결합"],
    ["관계사 what", "선행사 없이 the thing(s) that", "명사 바로 뒤에 붙은 what"],
    ["관계부사", "선행사 + 성분이 채워진 절", "목적어가 빈 절 앞의 where"],
    ["분사", "스스로 하면 -ing, 당하면 -ed", "감정·수동이 뒤집힌 분사"],
    ["분사구문", "분사의 주체 = 주절의 주어", "다른 명사가 그 동작을 하는 구조"],
    ["준동사", "전치사 뒤에는 동명사", "전치사 뒤의 to부정사"],
    ["병렬", "접속사 앞뒤의 품사가 같음", "앞은 to부정사, 뒤는 동명사"],
    ["대명사", "선행사와 수·성이 같음", "단수 선행사를 받는 they"],
    ["수동", "타동사의 목적어가 주어로 온 be + p.p.", "happen, consist 같은 자동사의 수동"],
    ["접속사·전치사", "although + 절, despite + 명사", "although + 명사, despite + 절"],
  ],
)}

<h3>수 일치</h3>
<p>동사의 수는 주어의 수와 같습니다. 주어와 동사 사이에 긴 수식어가 끼어도 수는 바뀌지 않습니다. <em>The number of students who join the club is rising</em>에서 주절 동사 is의 주어는 number입니다. who join의 주어는 students입니다. 관계절 동사는 선행사에 맞추고, 주절 동사는 주절 주어에 맞춥니다. 둘을 한 번에 보면 joins나 are가 섞입니다.</p>
<p><em>A number of students are waiting</em>에서 a number of는 many에 가깝고 주어의 핵은 students입니다. number라는 철자만 보고 단수 동사를 쓰면 틀립니다. each, every, either, neither가 주어의 핵이면 단수입니다. <em>Each of the players is ready</em>처럼 of 뒤에 복수명사가 있어도 each가 핵이면 단수 동사입니다.</p>
<p>either A or B, neither A nor B, not only A but also B는 동사를 <strong>B</strong>, 곧 동사에 가까운 쪽에 맞춥니다. <em>Neither the players nor the captain is late</em>이고, <em>Neither the captain nor the players are late</em>입니다. and로 단수 주어 둘이 묶이면 복수가 됩니다. 반면 as well as, along with, together with, in addition to는 and처럼 수를 더하지 않습니다. <em>The captain as well as the players is ready</em>에서 동사는 captain에 맞습니다.</p>
<p>There is/are의 진짜 주어는 be 뒤에 있습니다. <em>There are two maps on the desk</em>입니다. news, information, advice처럼 형태와 관계없이 셀 수 없는 말은 단수 취급입니다. <em>The information is useful</em>입니다. 시간을 하나의 양으로 보면 <em>Ten years is a long time</em>처럼 단수 동사를 씁니다.</p>

<h3>시제</h3>
<p>글의 기준 시제를 먼저 정합니다. 지난 대회를 회고하는 문단이면 과거가 기준입니다. 그 기준보다 더 앞선 일만 과거완료 had + p.p.로 표시합니다. <em>The play had already started when we arrived</em>에서 도착보다 시작이 먼저입니다. 순서를 나눌 필요가 없는 두 과거 동작은 둘 다 과거로 둡니다.</p>
<p>현재완료 have/has + p.p.는 지금과 닿아 있는 경험·결과·계속입니다. yesterday, last week, in 2019처럼 이미 끝난 시점 부사와는 같이 쓰지 않습니다. <em>She finished the poster yesterday</em>가 맞고, <em>She has finished the poster yesterday</em>는 틀립니다. 과학적 사실이나 현재에도 유효한 일반 사실은, 주절이 과거여도 현재로 둘 수 있습니다.</p>
<p>가정법의 시제도 어법에서 확인합니다. 지금 사실의 반대는 If + 과거, would/could/might + 원형입니다. be동사는 were를 씁니다. If he were here, he would help처럼입니다. 과거 사실의 반대는 If + had p.p., would have p.p.입니다. 주절의 시점과 if절의 완료 여부가 어긋난 밑줄을 의심합니다. 가정법이 아닌 실제 조건(만약 오면 알려 줘라)과 뒤섞지 않도록, 문장이 사실의 반대인지 먼저 판단합니다.</p>

<h3>관계사</h3>
<p>관계사는 앞의 명사(선행사)를 뒤에서 꾸밉니다. 꾸미는 절 안에 그 명사가 들어갈 빈자리가 주어인지 목적어인지, 아니면 빈자리 없이 장소·시간·이유만 필요한지에 따라 고릅니다.</p>
<ul>
<li><strong>who / whom / whose.</strong> 사람 주어는 who, 사람 목적어는 whom(또는 that)입니다. whose는 소유격이라 사람·사물 모두에 씁니다. whose를 사람 전용으로 보면 the book whose cover가 틀려 보입니다. 이 구조는 맞습니다.</li>
<li><strong>which / that.</strong> 사물은 which 또는 that입니다. 콤마가 있는 계속적 용법(앞 명사나 앞 절 전체를 덧붙여 설명)에는 which를 쓰고 that을 쓰지 않습니다. <em>The drill, which the coach changed, was too long</em>은 가능하고, 콤마 뒤 that은 어법상 틀린 밑줄입니다.</li>
<li><strong>what.</strong> what은 the thing(s) that이라 선행사를 안에 품고 있습니다. 명사 바로 뒤에 what을 붙이지 않습니다. <em>What the coach changed was the order</em>는 맞고, <em>The order what the coach changed</em>는 틀립니다. that절은 접속사 that 뒤에 완전한 절이 오고, what절은 절 안에 빈자리가 있습니다.</li>
<li><strong>where / when / why.</strong> 관계부사 뒤의 절은 주어·동사·목적어가 이미 채워져 있습니다. <em>This is the house where he lived</em>는 lived의 장소가 빈 것뿐이라 where가 맞습니다. <em>This is the house which he bought</em>는 bought의 목적어가 비어 있어 which가 맞습니다. 목적어가 빈 절 앞에 where를 두면 틀립니다. the way how는 쓰지 않고 the way, how, the way that 중 하나로 씁니다. The reason is because보다 The reason is that이 어법 문항의 맞는 형태입니다.</li>
</ul>
<p>주격 관계대명사는 생략하지 않습니다. 목적격 관계대명사는 생략할 수 있습니다. 전치사를 관계사 앞으로 보내면 whom/which를 생략할 수 없습니다. <em>the pen with which she wrote</em>와 <em>the pen she wrote with</em>는 둘 다 가능하고, <em>the pen with she wrote</em>는 불가능합니다. 전치사 뒤의 관계사는 사물이면 which, 사람이면 whom입니다.</p>
${warn("선행사가 사람인지 사물인지만 보고 관계사를 고르면, 뒤 절이 완전한지 빈자리가 있는지를 놓칩니다. 사람·사물은 1차 분류이고, 최종 분류는 뒤 절의 성분입니다.")}

<h3>분사와 분사구문</h3>
<p>현재분사 -ing는 그 명사가 스스로 하는 동작·진행이고, 과거분사 -ed(불규칙이면 p.p.)는 당하는 상태·완료입니다. <em>The leaflet printed for new guides</em>에서 leaflet은 인쇄되는 대상이라 과거분사입니다. <em>A student sitting quietly</em>에서 student는 앉아 있는 주체라 현재분사입니다.</p>
<p>감정 분사는 방향이 반대입니다. interesting, confusing, boring은 그렇게 느끼게 하는 대상이고, interested, confused, bored는 느끼는 사람입니다. <em>One visitor looked confused</em>는 방문객이 혼란을 느끼는 상태라 과거분사가 맞습니다. looked confusing이면 방문객이 남을 혼란스럽게 만든다는 뜻이 됩니다.</p>
<p>분사구문은 부사절을 줄인 형태입니다. 기본 검사는 의미상 주어입니다. 콤마 뒤 주절의 주어가 그 분사의 동작을 할 수 있어야 합니다. <em>Reading the steps aloud, the guide helped the visitors</em>는 안내자가 읽으므로 맞습니다. <em>Reading the steps aloud, the questions became easier</em>는 질문이 읽을 수 없으므로 틀립니다. 이를 dangling modifier라고 부릅니다.</p>
<p>주절과 거의 동시에 일어나는 능동은 -ing, 주절보다 분명히 앞서 완료된 능동은 Having p.p.입니다. <em>Having finished the tour, the guide locked the door</em>에서 잠그기 전에 안내가 끝났습니다. 수동 분사구문은 과거분사로 시작합니다. <em>Written in short sentences, the worksheet was easy to read</em>에서 worksheet가 쓰인 대상입니다. 주절 주어와 분사의 주체가 다를 때는 분사 앞에 의미상 주어를 밝히는 독립 분사구문이 있으나, 밑줄의 분사가 주절 주어와 맞지 않으면 그 밑줄을 먼저 의심하는 것이 29번의 기본 절차입니다.</p>

<h3>to부정사와 동명사</h3>
<p>to부정사는 명사(하고 싶은 일), 형용사(수식: the first to speak), 부사(목적: to ask a question)로 쓰입니다. 동명사는 동사를 명사 자리로 보낸 형태입니다. 전치사 뒤에는 명사가 와야 하므로 동명사가 옵니다. <em>She left without locking the door</em>가 맞고, without to lock은 틀립니다.</p>
<p>동사에 따라 목적어의 형태가 갈립니다. enjoy, finish, avoid, mind, keep, suggest, consider 뒤에는 동명사입니다. decide, hope, plan, refuse, want, promise 뒤에는 to부정사입니다. want는 want + 목적어 + to부정사고, 사역동사처럼 원형부정사를 바로 붙이지 않습니다.</p>
${tbl(
  ["구분", "형태", "뜻"],
  [
    ["stop + to V", "멈추고 다른 일을 하려고", "stop to rest = 쉬려고 멈춤"],
    ["stop + V-ing", "하던 일을 중단", "stop resting = 쉬는 것을 중단"],
    ["remember + to V", "앞으로 할 일", "remember to lock = 잠그는 것을 기억"],
    ["remember + V-ing", "이미 한 일", "remember locking = 잠근 것을 기억"],
    ["try + to V", "하려고 노력", "try to open = 열어 보려고 애씀"],
    ["try + V-ing", "시험 삼아 해 봄", "try opening = 열어 보는 방법을 시도"],
    ["used to + V", "과거의 습관", "used to walk = 예전에 걸었다"],
    ["be used to + V-ing", "익숙함. to는 전치사", "be used to walking = 걷는 데 익숙"],
  ],
)}
<p>look forward to, object to의 to도 전치사라 뒤에는 동명사가 옵니다. to를 보면 무조건 부정사로 단정하지 않고, 앞의 숙어가 전치사 to인지 확인합니다.</p>
<p>사역동사 make, have, let은 목적어 뒤에 동사원형을 둡니다. <em>The guide made the group wait</em>입니다. make가 수동태가 되면 원형이 to부정사로 바뀝니다. <em>The group was made to wait</em>입니다. 지각동사 see, hear, watch는 목적어 뒤에 원형(동작 전체) 또는 현재분사(진행 중인 장면)를 둡니다. 지각동사의 수동은 to부정사입니다. help는 help + 목적어 + 원형과 help + 목적어 + to부정사를 둘 다 씁니다. help만 보고 한쪽을 틀린 밑줄로 고르지 않습니다.</p>
<p>준동사의 의미상 주어가 문장 주어와 다르면 for + 목적격 + to부정사로 밝힙니다. <em>It is hard for him to start</em>에서 to start의 주체는 him이고, It은 가주어입니다. 가주어 It이 보이면 진짜 주어인 to부정사나 that절을 찾아 수 일치를 그 자리에 맞춥니다.</p>

<h3>병렬</h3>
<p>등위접속사와 상관접속사는 앞뒤를 같은 품사·같은 구조로 잇습니다. and, or, but, both A and B, either A or B, neither A nor B, not only A but also B, not A but B가 대표입니다. <em>The guide wanted the group to follow the map and to stay together</em>는 to부정사끼리 병렬이라 맞습니다. to follow and staying처럼 형태가 갈라지면 틀립니다.</p>
<p>비교 구문도 병렬입니다. than, as 앞뒤가 같은 종류의 말이어야 합니다. 문두의 Not only는 조동사와 주어의 도치를 만들 수 있습니다. <em>Not only did she write the note, but she also drew the map</em>입니다. 도치 여부보다, but also 뒤의 품사가 앞과 같은지를 먼저 봅니다. 밑줄이 and의 한쪽에만 있으면 반대쪽 형태를 찾아 맞춥니다.</p>

<h3>대명사 일치</h3>
<p>대명사는 앞에 나온 명사(선행사)와 수·성이 맞아야 하고, 가리키는 대상이 하나여야 합니다. 단수 명사, each, every를 they로 받는 밑줄은 우선 의심합니다. <em>Each player must bring his or her own pencil</em>처럼 단수 선행사에는 단수 대명사를 맞춥니다. 여자가 주어이면 her, 남자가 주어이면 his를 확인하고, 문장 안에서 후보가 둘이면 성별이 다른 후보는 지웁니다.</p>
<p>재귀대명사는 주어와 목적어가 같은 사람일 때 씁니다. <em>The captain blamed himself</em>는 주장이 자기 자신을 탓한 문장입니다. <em>The captain blamed him</em>은 다른 사람입니다. 지시대명사 this, that, these, those는 바로 앞 문장의 명사나 내용과 수가 맞아야 합니다. one은 앞에서 나온 단수 가산명사를 다시 받을 때 씁니다. It이 가주어인지 지시대명사인지도 구분합니다. 가주어이면 앞에 명사를 찾지 않고 뒤의 to부정사·that절을 찾습니다.</p>

<h3>능동과 수동</h3>
<p>수동태는 be + 과거분사입니다. 능동문의 목적어가 수동문의 주어가 되므로, 목적어를 취하는 타동사만 수동이 됩니다. happen, occur, appear, arrive, rise, consist, disappear는 자동사라 수동으로 쓰지 않습니다. <em>The problem happened</em>와 <em>The group consists of four students</em>가 맞고, was happened, is consisted of는 틀립니다.</p>
<p>rise는 스스로 오르는 자동사이고 raise는 무엇을 올리는 타동사입니다. <em>The curtain rose</em>와 <em>She raised her hand</em>를 구분합니다. lie(눕다)의 변화는 lie–lay–lain이고 자동사입니다. lay(놓다)의 변화는 lay–laid–laid이고 타동사입니다. 과거형 lay가 lie의 과거인지 lay의 현재인지는 목적어가 있는지, 뜻이 눕는 것인지 놓는 것인지로 가립니다.</p>
<p>의미상으로도 능동·수동이 갈립니다. 결과가 무엇을 보여 주면 the results show이고, 결과가 누군가에 의해 제시되면 the results are shown입니다. 감정은 사람이 be + 과거분사, 대상이 현재분사 또는 타동사의 능동입니다. <em>Visitors were interested</em>와 <em>The worksheet interested the visitors</em>는 같은 방향입니다. need 뒤에 동명사가 오면 수동의 뜻이 됩니다. <em>The clock needs repairing</em>은 <em>The clock needs to be repaired</em>와 같은 방향입니다.</p>

<h3>접속사와 전치사</h3>
<p>접속사 뒤에는 주어와 동사가 있는 절이 오고, 전치사 뒤에는 명사 또는 동명사가 옵니다. 뜻이 비슷해도 뒤의 형태가 다르면 밑줄이 됩니다.</p>
${tbl(
  ["뒤에 절(주어+동사)", "뒤에 명사·동명사", "관계"],
  [
    ["although, though, even though", "despite, in spite of", "양보·대조"],
    ["because, since, as", "because of, due to, owing to", "원인"],
    ["while", "during", "시간. while은 절 또는 분사, during은 명사"],
    ["but", "however (부사)", "전환. however는 접속사처럼 두 절을 콤마로만 잇지 못함"],
  ],
)}
<p><em>Although the budget was tight, the library stayed open</em>과 <em>Despite the tight budget, the library stayed open</em>은 둘 다 맞습니다. Although the tight budget이나 Despite the budget was tight는 틀립니다. despite of는 없고, in spite of 또는 despite입니다.</p>
<p>however는 두 가지라 형태만 보고 틀리다고 하면 안 됩니다. 부사 however는 문장 앞에 콤마를 두거나 세미콜론 뒤에 와 앞 내용과 전환합니다. <em>The rain stopped. However, the field was wet.</em> 한편 However + 형용사/부사 + 주어 + 동사는 no matter how의 뜻으로 맞습니다. <em>However tired he was, he finished the tour</em>는 양보 부사절이라 맞는 문장입니다. 틀린 경우는 접속사 but의 자리에 however만 넣고 두 독립절을 콤마로 붙이는 구조입니다.</p>

<h2>4. 30번, 문맥상 반의어와 전환 단서</h2>
<p>30번은 밑줄 친 낱말의 철자나 품사를 묻는 문항이 아닙니다. 다섯 낱말은 대개 그 자리의 품사로 들어가고, 그중 하나만 문단이 요구하는 뜻과 반대입니다. 정답은 그 부적절한 낱말이지, 바꿔 넣어야 할 올바른 낱말이 아닙니다. 올바른 말을 떠올린 뒤, 그 말과 반대인 밑줄을 고릅니다.</p>
<p>방향은 밑줄 문장만으로 정하지 않습니다. 바로 앞 문장, 바로 뒤 문장, 그리고 그 사이의 연결 표현을 한 세트로 봅니다. 재진술 표현 뒤의 문장이 긍정인데 앞 문장의 밑줄만 부정이면, 틀린 곳은 그 밑줄입니다.</p>
${tbl(
  ["단서", "논리", "밑줄이 맞으려면"],
  [
    ["however, yet, nevertheless, on the other hand, in contrast, whereas, although", "전환·대조", "앞 문장과 평가가 반대"],
    ["therefore, thus, as a result, consequently, so", "결과", "앞에서 따라 나오는 결론과 같은 방향"],
    ["because, since, due to", "원인", "뒤의 결과를 설명하는 이유"],
    ["for example, for instance", "예시", "앞의 일반 진술과 같은 방향의 구체 사례"],
    ["in other words, that is", "재진술", "바로 앞 문장과 같은 주장"],
    ["similarly, likewise, also", "첨가", "앞과 같은 방향"],
    ["instead, rather", "대체", "방금 부정한 생각 대신 새 방향"],
  ],
)}
<p>반의어 함정은 이 표와 맞물립니다. 글이 연습의 이득을 말하는데 밑줄만 weaken, reduce, hinder처럼 감소·방해 쪽에 있으면 그 밑줄이 답인 경우가 많습니다. 자주 짝으로 뒤집히는 방향은 증가와 감소, 이득과 손해, 유사와 차이, 일시와 영속, 원인과 결과, 장려와 억제, 단순과 복잡, 주관과 객관입니다. 이 목록은 출제 통계가 아니라, 문맥의 긍정·부정을 가를 때 쓰는 의미 축입니다. 시험장의 단어가 이 목록 밖에 있어도 절차는 같습니다. 밑줄의 뜻을 모르는 경우에는 접두사(un-, in-, dis-, mis-)와 품사만 표시하고, 아는 쪽 문장의 방향으로 역산합니다.</p>
<p>30번의 풀이 순서는 다음과 같습니다.</p>
<ol>
<li>발문이 적절하지 않은 낱말인지 확인합니다.</li>
<li>각 밑줄 문장 옆에 그 문장의 주장을 한국어로 짧게 적습니다. 긍정인지 부정인지만 적어도 됩니다.</li>
<li>연결 표현을 동그라미 하고, 앞 문장과 같은 방향이어야 하는지 반대여야 하는지를 화살표로 표시합니다.</li>
<li>재진술(in other words)이 있으면 그 문장을 기준으로 바로 앞 밑줄의 방향을 검산합니다. 재진술은 새 정보가 아니라 같은 말의 반복입니다.</li>
<li>방향이 어긋난 밑줄 하나를 고릅니다. 어려운 단어와 어색한 단어를 구분합니다. 어렵지만 방향이 맞으면 오답(맞는 밑줄)입니다.</li>
</ol>
${warn("30번에서 모르는 단어를 보면 그 밑줄을 답으로 고르기 쉽습니다. 모르는 것은 난이도이고, 부적절한 것은 논리의 방향입니다. 나머지 네 밑줄이 앞뒤와 자연스럽게 이어지는지 먼저 확인하고, 방향이 뒤집힌 한 곳을 찾습니다.")}

<h2>5. 정답·오답의 모습과 자주 하는 착각</h2>
<p>29번의 정답 밑줄은 혼자 보면 그럴듯합니다. 과거분사 자리에 현재분사가 있거나, 단수 주어 자리에 복수 동사가 있거나, 전치사 자리에 접속사가 있습니다. 오답, 곧 틀린 것으로 보이지만 실제로는 맞는 밑줄은 수식어가 길어 어려워 보일 뿐입니다. 맞는 밑줄을 지우개로 지우려 하지 말고, 왜 맞는지를 성분 하나로 설명합니다. 설명이 되는 밑줄은 답이 아닙니다.</p>
<p>수식어 때문에 주어를 잘못 찾는 패턴은 반복됩니다. of 구, 관계절, rather than, as well as 뒤를 주어로 보면 수의 판단이 뒤집힙니다. 이때는 괄호를 다시 치고 핵이 되는 명사 한 단어만 남깁니다. 관계사 오류는 두 갈래입니다. 하나는 what과 that/which를 선행사 유무로 구분하지 않는 것이고, 다른 하나는 where와 which를 뒤 절의 빈자리로 구분하지 않는 것입니다. 사람인지 사물인지만 보면 이 두 갈래를 놓칩니다.</p>
<p>30번의 오답 유혹은 세 가지입니다. 첫째, 지문에 여러 번 나온 소재 단어를 부적절한 말로 오해합니다. 반복은 핵심어의 신호인 경우가 많습니다. 둘째, 전환어를 못 보고 같은 방향의 낱말을 틀린 것으로 고릅니다. 셋째, 한 문장의 사실만 보고 글 전체의 평가와 반대인 낱말을 지나칩니다. 정답 낱말은 그 문장 안에서는 문법적으로 들어가되, 앞이나 뒤의 재진술과 모순됩니다.</p>
${tip("두 밑줄이 고민되면 각각에 ‘왜 맞는가’를 한 구절로 적어 보세요. 성분 설명이 끝나는 쪽은 버리고, 설명이 문장 중간에 멈추는 쪽을 답으로 남깁니다.")}

<h2>6. 시험지 위에서 하는 점검</h2>
<p>개념을 알아도 시험지 위에 표시를 남기지 않으면 수식어에 다시 말려듭니다. 29번은 다음 순서로 종이에 표시합니다.</p>
<ol>
<li>다섯 밑줄에 성분 이름을 적습니다. 동사, 관계사, 분사, to부정사, 접속사, 대명사 중 하나입니다.</li>
<li>동사 밑줄만 모아 주어를 괄호 밖으로 꺼냅니다. 수와 태를 판정합니다.</li>
<li>관계사 밑줄은 선행사가 있는지, 뒤 절에 빈자리가 있는지를 예/아니오로 적습니다.</li>
<li>분사와 분사구문은 의미상 주어와 능동·수동을 적습니다.</li>
<li>접속사·전치사는 뒤 덩어리가 절인지 명사인지 적습니다.</li>
<li>설명이 안 되는 밑줄이 하나인지 확인한 뒤 그 번호를 고릅니다.</li>
</ol>
<p>30번은 성분 이름 대신 화살표를 씁니다. 같은 방향이면 →, 전환이면 ↺처럼 스스로 정한 표시면 됩니다. 재진술 문장에는 등호를 치고, 등호 양쪽의 긍정·부정이 같은지 봅니다. 이 표시가 끝나면 선지를 따로 읽을 필요가 없습니다. 답은 밑줄 번호 자체입니다.</p>
<p>29번에서 쓴 문장 분석은 30번에도 남습니다. 어휘가 반의어로 뒤집혀 있어도, 그 단어가 동사인지 형용사인지는 문장 뼈대 안에서 확인됩니다. 두 문항을 완전히 다른 기술로 보지 말고, 29번은 성분, 30번은 그 성분의 뜻의 방향으로 이어 가면 됩니다.</p>`,
    traps: `<ul>
<li><strong>수식어를 주어로 보기.</strong> of 구, 관계절, rather than 뒤의 복수 명사에 동사를 맞추면 The number of가 단수인 문장도 복수로 보입니다.</li>
<li><strong>관계사를 선행사의 종류만으로 고르기.</strong> 사람·사물만 보고 what, where, which를 정하면 뒤 절의 빈자리를 놓칩니다. 명사 뒤의 what, 완전한 절 앞의 which, 목적어가 빈 절 앞의 where를 의심하세요.</li>
<li><strong>감정 분사의 방향을 바꾸기.</strong> confused는 느끼는 사람이고 confusing은 혼란을 일으키는 대상입니다. 사람 주어 옆의 -ing를 습관처럼 맞다고 보지 마세요.</li>
<li><strong>분사구문의 주체를 확인하지 않기.</strong> 콤마 앞 분사의 동작이 주절 주어의 동작인지 먼저 봅니다. 질문이 읽을 수는 없습니다.</li>
<li><strong>although와 despite의 뒤를 바꾸기.</strong> although 뒤에는 절, despite와 in spite of 뒤에는 명사나 동명사가 옵니다. despite of는 없는 형태입니다.</li>
<li><strong>병렬의 한쪽만 보기.</strong> and, not only A but also B의 반대쪽 품사를 찾아 비교해야 합니다. to부정사와 동명사가 섞이면 그 밑줄이 후보입니다.</li>
<li><strong>자동사를 수동으로 만들기.</strong> happen, occur, consist는 be + p.p.로 쓰지 않습니다. consist of와 be composed of를 한 형태로 합치지 마세요.</li>
<li><strong>30번에서 어려운 단어를 답으로 고르기.</strong> 부적절한 낱말은 난도가 아니라 논리의 방향이 반대인 말입니다. 재진술 문장과 모순되는 밑줄을 찾으세요.</li>
</ul>`,
    examples: [
      ex(
        "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?<br><br>Teachers who coach the debate team ①have noticed a change this semester. The quality of preparation, rather than the number of hours spent in the room, ②determine how calmly students open their speeches. A student ③sitting quietly before the round often starts more smoothly than a student who ④keeps rewriting. What these rehearsals suggest ⑤is that a short pause belongs in the routine.",
        `<p><strong>정답: ②</strong> determine를 determines로 고쳐야 합니다.</p>
<p>1. 둘째 문장에서 rather than the number of hours spent in the room은 비교를 덧붙인 수식어입니다. 괄호로 걷으면 주어의 핵은 quality이고 단수입니다. 동사는 determines가 되어야 합니다.</p>
<p>2. ① have noticed의 주어는 Teachers입니다. who coach the debate team은 Teachers를 꾸미는 관계절이라 주절의 수를 바꾸지 않습니다. 복수 주어와 have가 맞습니다.</p>
<p>3. ③ sitting은 A student를 꾸미는 현재분사입니다. 학생이 스스로 앉아 있는 능동이라 -ing가 맞습니다. than 뒤 a student who keeps에서 who의 선행사는 단수 student이고 ④ keeps도 단수라 맞습니다.</p>
<p>4. ⑤ What these rehearsals suggest는 선행사를 포함한 주어절이고, 동사 is는 그 절을 단수 주어로 받은 것입니다. suggest의 목적어 자리는 what이 이미 담당합니다.</p>
<p>5. 오답 유혹: hours나 students가 보여 ②를 복수로 두고, 오히려 ⑤의 What절을 틀렸다고 보는 경우입니다. 수식어를 걷으면 ②만 주어와 동사의 수가 어긋납니다.</p>`,
      ),
      ex(
        "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?<br><br>City libraries stay open late on weekdays. ①Although the budget is tight, evening hours ②have helped workers who cannot visit in the afternoon. The reason ③which many residents praise the change is that the rooms are quiet after six. Staff members ④were asked to guide first-time visitors. ⑤Despite the extra work, most of them supported the plan.",
        `<p><strong>정답: ③</strong> which를 why 또는 that으로 고쳐야 합니다.</p>
<p>1. The reason 뒤의 절은 many residents praise the change입니다. 주어(residents), 동사(praise), 목적어(the change)가 이미 채워져 있습니다. which가 들어갈 주어 자리나 목적어 자리가 없습니다. 이유의 관계부사 why가 맞습니다. that도 가능하고, 생략도 가능합니다.</p>
<p>2. ① Although 뒤에는 the budget is tight라는 절이 있어 접속사의 형태가 맞습니다. ② have helped의 주어는 evening hours로 복수입니다. who cannot visit의 선행사는 workers입니다.</p>
<p>3. ④ were asked는 타동사 ask의 수동태이고 주어 Staff members가 복수입니다. 안내해 달라는 요청을 받은 대상이라 수동이 맞습니다. ⑤ Despite 뒤에는 the extra work라는 명사구가 있습니다. 전치사의 형태가 맞습니다. them은 staff members를 받습니다.</p>
<p>4. 오답 유혹: ①과 ⑤가 둘 다 ‘양보’라 하나를 틀렸다고 보는 경우입니다. 양보의 뜻은 같아도 Although는 절, Despite는 명사라 둘 다 맞습니다. 성분 설명이 안 되는 곳은 ③뿐입니다.</p>`,
      ),
      ex(
        "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?<br><br>The worksheet ①printed for new guides explains how to start a Saturday tour. ②Reading the steps aloud, the questions became easier for the visitors. One visitor looked ③confused by the word &quot;gallery&quot; and asked what it meant. The guide wanted the group ④to follow the map and ⑤to stay together.",
        `<p><strong>정답: ②</strong> 분사구문의 의미상 주어가 주절 주어와 다릅니다.</p>
<p>1. Reading the steps aloud의 동작을 할 수 있는 주체는 사람입니다. 그런데 주절의 주어는 the questions입니다. 질문이 소리 내어 읽을 수는 없으므로 이 분사구문은 틀립니다. 고치려면 주절 주어를 the guide나 the visitors로 바꾸거나, When the guide read the steps aloud처럼 절의 주어를 밝혀야 합니다.</p>
<p>2. ① printed는 The worksheet를 꾸미는 과거분사입니다. 유인물은 인쇄되는 대상이라 수동의 -ed 형태가 맞습니다. explains의 주어는 worksheet로 단수입니다.</p>
<p>3. ③ confused는 방문객이 느끼는 상태입니다. looked의 보어로 과거분사가 오고, by the word가 혼란의 원인을 보여 줍니다. confusing이면 방문객이 혼란을 일으키는 대상이 되어 문맥과 문법 방향이 같이 어긋납니다. 지금 형태는 맞습니다.</p>
<p>4. ④와 ⑤는 wanted the group 뒤에 이어진 to부정사 병렬입니다. to follow와 to stay의 형태가 같습니다. want는 목적어 뒤에 원형부정사가 아니라 to부정사를 취합니다.</p>
<p>5. it은 the word gallery를 받는 단수 대명사라 맞습니다. 오답 유혹은 ①의 printed를 능동 printing으로 고치고 싶은 경우입니다. 유인물은 스스로 인쇄하지 않으므로 ①은 맞는 수동 분사입니다.</p>`,
      ),
      ex(
        "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?<br><br>A coach told the team that winning once does not ①guarantee a successful season. Careful review of each game, however, can ②weaken the players' judgment. In other words, they see their own mistakes more clearly and choose ③better moves the following week. The coach therefore asks them to watch one short scene twice ④before they talk. Players who accept this slow habit usually ⑤improve faster than those who only celebrate.",
        `<p><strong>정답: ②</strong> weaken은 문맥과 반대입니다. strengthen이나 improve 방향이어야 합니다.</p>
<p>1. 첫 문장은 한 번의 승리가 시즌을 보장하지 않는다는 한계입니다. however는 그 한계와 다른 방향을 예고합니다. 따라서 경기를 꼼꼼히 복기하는 일은 판단에 도움이 되어야 합니다. weaken(약화시키다)은 이 전환과 반대입니다.</p>
<p>2. In other words는 바로 앞 문장을 다시 말합니다. 뒤 내용은 실수를 더 분명히 보고 더 나은 수를 고른다는 긍정입니다. 등호 앞의 weaken과 등호 뒤의 more clearly, better가 모순입니다. 재진술을 기준으로 ②만 방향이 뒤집혀 있습니다.</p>
<p>3. therefore 이하의 코치의 지시(말하기 전에 장면을 두 번 보기)와 ⑤ improve는 복기가 도움이 된다는 결론과 같습니다. ① guarantee는 does not과 함께 ‘한 번의 승리는 충분하지 않다’는 첫 문장에 맞습니다. ③ better, ④ before도 각 문장 안에서 자연스럽습니다.</p>
<p>4. 오답 유혹: guarantee가 어려워 보여 ①을 고르는 경우입니다. ①은 부정어 not과 함께 글의 출발점과 맞고, 논리적으로 어긋난 낱말은 ②입니다. 30번은 바꿔 쓸 철자가 아니라 부적절한 밑줄의 번호를 고르는 문항입니다.</p>`,
      ),
    ].join(""),
    easy: `<h3>한 줄</h3>
<p>29번은 문장 뼈대가 깨진 밑줄, 30번은 글의 방향과 반대인 낱말입니다. 수식어를 괄호로 걷어 주어와 동사를 찾은 다음, 연결 표현의 화살표를 따라가면 됩니다.</p>
<ul>
<li>The number of는 단수, a number of는 복수입니다.</li>
<li>although 뒤에는 절, despite 뒤에는 명사입니다.</li>
<li>however가 있으면 밑줄의 뜻이 앞 문장과 반대인지 확인합니다.</li>
</ul>`,
    hard: `<p>29번은 밑줄마다 성분 이름을 적고, 동사 밑줄은 핵이 되는 주어 한 단어와만 비교합니다. 관계사는 선행사 유무와 뒤 절의 빈자리를 예/아니오로 적습니다. 분사구문은 주절 주어가 그 동작을 할 수 있는지로 판정합니다. 두 곳이 틀려 보이면 수식어를 주어로 본 쪽을 먼저 다시 엽니다. 답이 하나이므로, 설명이 끝나는 네 곳을 남기고 설명이 멈추는 한 곳을 고릅니다.</p>
<p>30번은 문장 번역 전에 연결 표현을 표시하고, in other words나 that is 문장을 기준 등호로 삼아 바로 앞 밑줄의 긍정·부정을 검산합니다. 모르는 단어는 접두사와 품사까지만 적고, 방향이 계산되는 밑줄로 돌아갑니다. 어려운 단어와 부적절한 단어를 같은 것으로 두지 않습니다.</p>`,
    prompt: "어법·어휘의 단서와 판단을 짝지으세요.",
    pairs: [
      { term: "the number of", def: "단수 동사" },
      { term: "a number of", def: "복수 동사" },
      { term: "although", def: "뒤에 절이 온다" },
      { term: "despite", def: "뒤에 명사·동명사" },
      { term: "관계사 what", def: "선행사를 포함" },
      { term: "30번 반의어", def: "논리 방향이 반대" },
    ],
    questions: [
      {
        q: "The number of players who join the club 뒤에서 주절 동사는?",
        choices: ["players에 맞춘 복수", "number에 맞춘 단수", "who절 동사와 항상 동일", "시제에 따라 수가 바뀜"],
        answer: 1,
      },
      {
        q: "although 바로 뒤에 올 수 있는 구조는?",
        choices: ["명사구만", "주어와 동사가 있는 절", "전치사구만", "동명사만"],
        answer: 1,
      },
      {
        q: "명사 바로 뒤에 쓰면 틀린 관계사는?",
        choices: ["which", "that", "what", "who"],
        answer: 2,
      },
      {
        q: "30번에서 답이 되는 밑줄은 어떤 말인가?",
        choices: ["철자가 틀린 말", "품사가 맞지 않는 말", "가장 어려운 말", "문맥과 뜻의 방향이 반대인 말"],
        answer: 3,
      },
      {
        q: "분사구문을 점검할 때 먼저 확인할 것은?",
        choices: ["문장의 단어 수", "주절 주어가 그 분사의 동작을 하는가", "쉼표가 두 개인가", "현재분사인지 과거분사인지만"],
        answer: 1,
      },
    ],
  },
  {
    file: "05-blank.html",
    part: null,
    group: "독해",
    unit: "독해",
    title: "빈칸 추론 (31~34번)",
    sub: "빈칸 추론 문항 접근법",
    lead: `<p>31번부터 34번까지는 빈칸에 들어갈 말을 다섯 개의 영어 선지에서 고릅니다. 빈칸은 단어·구·절일 때도 있고, 사례를 한 단계 위로 올린 추상적 진술일 때도 있으며, 연결어 자체가 빈칸인 경우도 있습니다. 정답은 글의 핵심을 다른 말로 다시 쓰거나, 여러 사례의 공통점을 추상화한 표현인 경우가 많습니다. 선지를 보기 전에 한국어로 한 줄을 예측하고, 부분적 사실·반대·지나친 일반화와 대조하는 것이 이 네 문항의 풀이입니다.</p>`,
    body: `<h2>1. 빈칸 문항이 묻는 것</h2>
<p>29·30번 다음에 빈칸 네 문항이 이어집니다. 발문은 빈칸에 들어갈 말로 가장 적절한 것을 묻습니다. 칸이 하나인 문항이 많고, (A)와 (B) 두 칸을 한 쌍으로 고르는 문항도 있습니다. 31번은 상대적으로 짧은 구인 경우가 많고, 32번부터 34번으로 갈수록 문장에 가까운 추상적 진술인 경우가 많습니다. 해마다 칸의 길이가 완전히 같지는 않습니다. 번호만 보고 난도를 정하지 말고, 빈칸이 그 문장에서 어떤 성분인지를 먼저 봅니다.</p>
<p>유형은 셋입니다. 각 유형은 (1) 묻는 것 (2) 지문의 단서 (3) 풀이 절차 (4) 정답과 오답의 모습 (5) 그 자리에 필요한 표현으로 정리합니다.</p>
${tbl(
  ["유형", "묻는 것", "단서", "정답의 모습", "오답의 모습"],
  [
    ["단어·구·절", "문장의 한 성분", "품사, 앞 동사가 요구하는 형태, 수식어", "성분에 들어가고 글의 방향과 같은 말", "품사는 맞지만 방향이 반대이거나 소재만 같은 말"],
    ["추상 개념", "사례들이 가리키는 상위 주장", "for example, 반복 상황, 마지막 일반화", "사례보다 한 단계 위의 재진술", "사례 하나의 세부, 또는 범위를 키운 말"],
    ["연결사", "앞뒤의 논리 관계", "두 문장의 긍정·부정이 같은지 반대인지", "그 관계의 연결어", "뜻은 비슷해 보여도 방향이 반대인 연결어"],
  ],
)}
<p>단어·구·절 빈칸은 문장 성분을 채웁니다. grow out of 뒤에는 명사구가 오고, because 뒤에는 절이 오며, 빈칸이 to 바로 뒤이면 동사원형이 옵니다. 뜻이 가까워 보여도 그 자리에 들어갈 수 없는 형태는 지웁니다. not A but B, rather than, instead, the same이 빈칸 옆에 있으면, 빈칸은 A와 반대이거나 A를 대체하는 말입니다.</p>
<p>추상 개념 빈칸은 사례의 상위 개념을 묻습니다. 이름, 장소, 숫자 같은 사례의 껍데기가 아니라, 그 사례들이 공통으로 보여 주는 관계입니다. 주인이 단골의 이름을 부르고 늘 같은 빵을 남겨 둔다는 두 장면의 공통점은 ‘개인적인 관계’이고, 빵이라는 단어 자체는 아닙니다. 정답 선지에 bread가 없어도 되고, bread가 있는 선지가 오답일 수 있습니다.</p>
<p>연결사 빈칸은 앞 내용과 뒤 내용의 관계를 묻습니다. however와 therefore는 둘 다 문장 앞에 올 수 있지만 방향이 반대입니다. For example은 일반 진술 뒤에 오고, In other words는 같은 말의 반복 앞에 옵니다. 수능 31~34번에서는 연결어가 빈칸 밖에 있고 빈칸에는 내용이 들어가는 형태가 더 흔합니다. 그때도 연결어가 내용 빈칸의 방향을 결정합니다. 연결어를 장식처럼 읽고 넘어가면 예측이 반대로 갑니다.</p>
<p>두 칸짜리 문항은 칸마다 방향을 따로 적습니다. 다음은 그 연습입니다. <em>The team lost the first match by a wide margin. Players left the field in silence. The loss was (A)________, but the film of the game was (B)________, since it showed exactly what to fix.</em> 패배와 침묵은 (A)를 불쾌·실망 쪽으로 고정합니다. but은 (B)를 (A)와 반대로 놓고, since절은 (B)를 ‘고칠 점을 보여 주어 유용함’으로 고정합니다. painful / useless처럼 (B)만 뒤집힌 짝, welcome / useful처럼 (A)만 뒤집힌 짝이 오답입니다. 한 칸이 맞아 보여도 짝 전체를 답으로 고르지 않습니다.</p>
${note("빈칸의 위치", "빈칸이 글 끝에 있으면 결론인 경우가 많고, 한가운데 있으면 그 문장 앞뒤의 연결어가 역할을 정합니다. 위치 이름보다 연결어를 우선합니다.")}

<h2>2. 전개 방식에서 빈칸의 힌트를 찾는 법</h2>
<p>빈칸 문장은 글 안에서 역할을 맡습니다. 역할은 전개 방식이 알려 줍니다. 대조, 인과, 예시, 재진술이면 빈칸 힌트의 대부분을 읽을 수 있습니다. 표를 외우기보다, 빈칸 문장에서 가장 가까운 표지를 찾아 화살표를 긋는 습관이 필요합니다.</p>
${tbl(
  ["전개", "표지", "빈칸이 가리키는 방향", "놓치기 쉬운 점"],
  [
    ["대조", "however, yet, nevertheless, on the other hand, in contrast, whereas, although, though, rather", "앞 문장과 평가가 반대", "통념을 필자의 결론으로 가져옴"],
    ["인과", "because, since, so, therefore, thus, as a result, consequently", "원인은 이유, 결과는 따라 나오는 결론", "because 앞인지 뒤인지 바꿈"],
    ["예시", "for example, for instance, such as", "일반 진술의 공통점을 구체화하거나, 그 반대로 사례에서 일반 진술로 올라감", "사례의 고유 명사를 일반 진술의 답으로 씀"],
    ["재진술", "in other words, that is, this means, in short", "바로 앞과 같은 주장. 긍정·부정도 같음", "단어가 다르다는 이유로 다른 주장으로 읽음"],
  ],
)}
<p>대조는 통념을 먼저 세우고 빈칸에서 필자가 고치는 구조가 많습니다. People often think X. However, _____. 여기서 예측은 X의 반대쪽 평가입니다. often, many people, it is widely believed가 통념의 표지이고, however 다음이 필자의 주장인 경우가 많습니다. 통념 문장에 나온 단어를 빈칸의 정답으로 가져오면, 필자가 버린 생각을 고른 것이 됩니다.</p>
<p>인과는 빈칸이 이유인지 결과인지를 먼저 가릅니다. They work because _____. 이면 빈칸은 이유입니다. _____, so the path became easier. 이면 빈칸은 결과의 원인 쪽에 가깝고, so 뒤가 결과입니다. because 앞뒤만 바꾸면 선지의 방향이 통째로 뒤집힙니다. 결과 문장에 이미 나온 말을 이유 빈칸에 다시 넣으면 동어 반복이 되어, 출제된 정답처럼 보이지 않습니다. 이유는 결과를 다른 말로 설명합니다.</p>
<p>예시는 일반 진술의 증거입니다. 빈칸이 예시보다 앞에 있으면 사례들의 공통점입니다. 빈칸이 예시 안에 있으면 일반 진술을 한 장면으로 내린 말입니다. 사례가 두 개면 한 사례에만 있는 세부(특정 장소, 특정 숫자, 특정 사물)는 공통점이 아닙니다. 그 세부가 선지에 있으면 부분적 사실 후보로 표시합니다.</p>
<p>재진술은 등호입니다. in other words 뒤 문장이 더 쉬우면, 그 문장을 빈칸의 쉬운 판으로 삼습니다. 단어가 달라도 긍정과 부정은 같습니다. 재진술 문장이 사람이 실수를 더 분명히 본다고 말하는데 빈칸만 ‘판단을 약화시킨다’로 가면, 30번의 반의어 함정과 같은 오류입니다.</p>
<p>한 글에 전개가 섞입니다. 첫 문장이 통념, however가 전환, for example이 근거, in other words가 정리인 글이 흔합니다. 기준은 빈칸 문장에 가장 가까운 표지 하나입니다. 더 앞의 표지는 그 예측을 검산할 때 씁니다. 가까운 표지가 however인데 글 첫 문장의 통념과 같은 방향으로 예측하면, 검산에서 걸립니다.</p>
<p>부정어도 방향을 뒤집습니다. not, never, hardly, rarely, unless, without, few, little이 빈칸 문장이나 바로 옆 문장에 있으면 예측에 부정을 포함합니다. hardly improved는 거의 나아지지 않았다는 뜻입니다. not이 없는 긍정 선지를 고르면 반대 오답이 됩니다.</p>
${warn("rather than, instead of, not A but B는 대조입니다. 빈칸이 B쪽이면 A를 버리고 남은 방향이 답입니다. A에 나온 명사를 빈칸 선지에서 다시 보면 필자가 배제한 쪽을 고르게 됩니다.")}
${tip("표지를 찾았으면 빈칸 옆에 ‘같음’ 또는 ‘반대’만 적어도 됩니다. 긴 번역보다 화살표가 선지를 빨리 지웁니다.")}

<h2>3. 정답 선지와 오답 선지의 전형</h2>
<p>정답은 재진술과 추상화를 함께 가지는 경우가 많습니다. 재진술은 핵심 문장의 관계를 다른 영어로 다시 쓰는 일입니다. 출석이 줄고 숙제를 못 끝냈다는 내용이 backfired, crowded out homework처럼 다른 단어로 돌아옵니다. 추상화는 사례보다 위 층으로 올라가는 일입니다. 두 장면이 정답 한 문장 안에 모두 들어가야 합니다. 한 장면만 담는 선지는 재진술처럼 보여도 범위가 부족합니다.</p>
<p>오답은 다음 셋으로 분류하면 선지를 지우는 이유가 분명해집니다.</p>
${tbl(
  ["오답 유형", "보이는 모습", "지문에서 확인하는 곳"],
  [
    ["부분적 사실", "어느 문장과는 일치", "그 문장이 결론인지, 예시 하나인지, 버려진 통념인지"],
    ["반대", "핵심 단어의 반의어, 또는 not이 빠진 말", "however, but, not, rather than"],
    ["지나친 일반화", "all, every, always, never, only, completely가 선지에만 있음", "지문은 some, often, can, may, a로 한정했는지"],
  ],
)}
<p>부분적 사실은 지문에 실제로 나온 내용이라 매력적입니다. 공원의 표지판 글에서 ‘가족이 호수에 도착한다’는 문장이 있어도, 빈칸이 표지판이 듣는 이유를 물으면 호수 도착은 결과의 일부입니다. 이유 전체를 담지 못하면 그 선지는 부분적 사실입니다. 필자가 However 뒤에서 버린 통념도 지문에 인쇄되어 있으므로 부분적 사실로 남습니다. 인쇄되어 있다는 것과 필자가 결론으로 채택했다는 것을 구분합니다.</p>
<p>반대 오답은 한 단어가 문장 전체를 뒤집습니다. 예측이 ‘방법을 바꾼다’인데 선지가 ‘능력을 고정된 것으로 받아들인다’이면 방향이 반대입니다. not to call oneself unable, but to _____ 에서 but 앞을 빈칸으로 가져오는 실수가 여기 해당합니다.</p>
<p>지나친 일반화는 방향은 맞는데 범위가 큽니다. 지원이 한 동아리의 연습 시간을 말했다면, 모든 학교의 모든 스트레스의 유일한 원인이라는 선지는 범위를 넘습니다. 지문에 often이 있고 선지에만 always가 있으면, 그 always가 지문의 한정과 맞는지 확인합니다. 방향이 맞아도 범위가 크면 오답입니다.</p>
<p>단어 겹침은 위 셋에 겹쳐 나타납니다. 지문의 명사를 많이 포함한 선지가 안전해 보입니다. 명사의 목록이 아니라 명사 사이의 관계(원인, 반대, 조건)가 빈칸과 같은지를 봅니다. 같은 명사에 반대 동사가 붙어 있으면 단어가 겹칠수록 더 위험한 오답입니다.</p>
${f("정답 확인 세 질문<br>1. 예측한 한국어와 방향이 같은가<br>2. 빈칸의 품사와 문법 틀에 들어가는가<br>3. 사례 전체가 들어가고, 지문에 없는 all·always·only는 없는가")}
<p>세 질문 모두 예인 선지를 남깁니다. 하나라도 아니오면 지웁니다. 둘 다 예이면, 더 좁은 범위이면서 빈칸의 역할(결론인지 이유인지)과 같은 쪽을 고릅니다.</p>

<h2>4. 예측한 뒤 선지를 대조하는 절차</h2>
<p>선지를 먼저 읽으면 오답의 표현이 글 안에 있었던 것처럼 남습니다. 빈칸은 선지를 가리고 예측한 다음에 대조합니다. 가계도를 풀 때 우열을 정하기 전에 확률부터 계산하지 않듯이, 빈칸도 순서를 바꾸지 않습니다.</p>
${f("연결어 표시 → 한국어 한 줄 예측 → 방향 대조 → 범위 대조 → 문법 틀 대조")}
<ol>
<li><strong>발문에서 칸의 개수를 확인한다.</strong> 한 칸인지, (A)와 (B)인지 적습니다. 두 칸이면 칸마다 아래 과정을 반복합니다.</li>
<li><strong>빈칸 문장만 먼저 읽고 성분을 적는다.</strong> 주어인지, 동사인지, 보어인지, because의 이유절인지를 표시합니다. 문장 안의 not과 hardly를 동그라미 합니다.</li>
<li><strong>바로 앞 문장과 바로 뒤 문장의 표지를 표시한다.</strong> 같음 또는 반대로 화살표를 긋습니다. 표지가 없으면 대명사 this, such와 정관사 the가 앞 문장을 받는지 봅니다.</li>
<li><strong>예시와 재진술을 역할대로 쓴다.</strong> 예시는 공통점의 재료이고, 재진술은 빈칸의 쉬운 판입니다. 예시의 고유한 세부는 예측 문장에 넣지 않습니다.</li>
<li><strong>선지를 가린 채 한국어 한 구절을 적는다.</strong> 완전한 영어 문장이 아니어도 됩니다. ‘방법을 바꿔 다시 한다’, ‘혼란을 줄여서 효과가 있다’처럼 방향과 역할만 맞으면 됩니다.</li>
<li><strong>선지를 그 구절과 대조한다.</strong> 방향이 다른 것, 품사가 다른 것, all·every·only로 범위가 커진 것을 지웁니다.</li>
<li><strong>두 개가 남으면 역할을 다시 본다.</strong> 빈칸이 결론인지, 버려진 통념인지, 이유인지를 표지로 확정하고 역할이 다른 쪽을 지웁니다.</li>
</ol>
<p>다음 네 문장에 이 순서를 그대로 적용해 보겠습니다.</p>
<p><em>The club raised the practice time from one hour to two. Attendance, however, began to fall. Several members said they could no longer finish their homework. The longer meeting ______.</em></p>
<ul>
<li>칸은 하나입니다. 빈칸은 meeting을 평가하는 동사 자리입니다.</li>
<li>however가 둘째 문장에 있습니다. 시간을 늘린 일과 반대로 출석이 줄었습니다. 셋째 문장은 그 감소의 이유입니다. 숙제를 마치지 못합니다.</li>
<li>예측: 길어진 연습은 숙제 시간을 밀어내고 역효과를 냈다.</li>
<li>① made every member a better player는 출석 감소와 반대이고 every가 범위를 키웁니다. ② backfired because it crowded out homework는 예측의 재진술입니다. ③ was the only cause of all school stress는 숙제 부담이라는 일부만 닿아 있고 only와 all이 범위를 키웁니다. ④ proved that practice time should be unlimited는 시간을 더 늘리자는 방향이라 출석 감소와 반대입니다. ⑤ removed the need for a coach는 지문에 없는 주장입니다.</li>
<li>②만 출석 감소와 숙제 문장을 모두 담고, 지문에 없는 전칭이 없습니다.</li>
</ul>
${tip("예측 문장을 선지 위에 짧게 써서 가려 두면, 단어가 비슷한 선지에 눈이 가지 않습니다. 맞는 선지는 예측과 방향이 같은 것이고, 철자가 예측과 같을 필요는 없습니다.")}

<h2>5. 시간 관리와 어려운 어휘</h2>
<p>영어 영역은 70분, 45문항입니다. 1번부터 17번까지는 듣기 방송에 맞추어 풀고, 방송이 끝나면 18번부터 45번까지를 남은 시간으로 풉니다. 방송이 끝나는 시각은 대본 길이에 따라 조금 달라지므로, 독해에 남는 분을 고정된 숫자로 외우지 않습니다. 순서는 고정되어 있습니다. 빈칸 네 문항 뒤에 35번부터 45번까지 간접 쓰기와 장문이 있습니다. 빈칸 한 문항을 오래 붙잡으면 장문을 읽지 못한 채 답을 고르게 됩니다.</p>
<p>실전에서의 시간 전략은 다음 세 줄입니다. 첫째, 빈칸 문장과 바로 앞·뒤만 읽고 한국어 한 줄을 적는 데까지를 한 세트로 삼습니다. 둘째, 부정어와 연결어를 다시 보아도 선지가 둘 남으면, 범위가 더 좁고 역할이 같은 쪽에 표시만 하고 넘어갑니다. 셋째, 표시한 빈칸은 장문을 끝낸 뒤에 돌아옵니다. 장문을 비워 둔 채 빈칸으로 돌아오지 않습니다. 30번에서 쓰던 방향 화살표를 빈칸에 그대로 씁니다. 31번 앞에서 새로운 읽기 방식을 만들지 않습니다.</p>
<p>어려운 단어는 세 층으로 나누어 처리합니다.</p>
<ul>
<li><strong>빈칸 밖의 어려운 단어.</strong> 예시 표지 안에 있으면 그 단어의 정확한 뜻 없이 ‘사례 하나’로만 표시하고 일반 문장으로 돌아갑니다. 역할이 보이면 뜻의 빈칸을 메우지 않아도 예측이 됩니다.</li>
<li><strong>선지 안의 어려운 단어.</strong> 선지 전체를 몰라도, 아는 부분의 방향만 예측과 비교합니다. 동사, not, 부정 접두사(un-, in-, dis-, mis-)를 먼저 표시합니다. 접두사만으로 답을 확정하지는 않습니다. 접두사가 없는 단어도 문맥상 반의어일 수 있습니다.</li>
<li><strong>반복되는 핵심어.</strong> 두 번 이상 같은 관계로 나오거나, 쉬운 문장으로 다시 풀이되는 말이 핵심어입니다. 한 번만 나온 어려운 수식어보다 핵심어들 사이의 관계가 빈칸을 결정합니다.</li>
</ul>
<p>모르는 문장은 주어와 동사만 한글로 적고 수식어는 괄호로 넘깁니다. 29번의 뼈대 찾기가 빈칸의 어휘 부담을 줄입니다. 핵심 문장의 뼈대가 ‘출석이 줄었다’이면, 수식어 속의 모르는 형용사는 그 뼈대를 바꾸지 못합니다. 뼈대와 모순되는 선지만 지우면 됩니다.</p>
${warn("모르는 단어가 빈칸의 답처럼 느껴지는 순간이 있습니다. 어려운 것과 적절한 것은 다릅니다. 30번과 같이, 방향이 계산되는 선지를 남기고 뜻만 낯선 선지는 방향이 맞은 뒤에 검토합니다.")}

<h2>6. 선지를 가를 때 같이 보는 표현</h2>
<p>연결어는 빈칸의 방향을 정하는 필수 표현입니다. 같은 칸에 넣어 혼동하는 쌍만 따로 기억하면 됩니다.</p>
${tbl(
  ["표현", "관계", "바로 옆 문장과의 방향"],
  [
    ["however / therefore", "전환 / 결과", "반대 / 같은 방향의 결론"],
    ["for example / in other words", "예시 / 재진술", "구체화 / 같은 주장의 반복"],
    ["rather, instead / similarly, also", "대체 / 첨가", "앞을 버림 / 앞과 같은 방향"],
    ["although, while / because", "양보 / 원인", "양보절과 주절은 평가가 어긋날 수 있음 / 이유와 결과는 이어짐"],
  ],
)}
<p>정답 자리에 상위 개념어가 오는 경우가 많습니다. trade-off, balance, perspective, assumption, shift, tendency, constraint, cost처럼 사례의 이름을 벗긴 말입니다. 이 단어들이 정답 목록은 아닙니다. 선지에 이런 말이 보이면, 지문의 사례가 그 말 안에 실제로 들어가는지만 확인합니다. 상위어라도 방향이 반대면 오답입니다. cost가 ‘치러야 할 대가’인지 ‘돈’인지도 문맥으로 정합니다. 빈칸이 시간이 늘자 숙제를 못 했다는 내용이면 cost는 돈 액수가 아니라 잃은 시간입니다.</p>
<p>선지의 범위 단어도 표현으로 취급합니다. all, every, always, never, only, completely, the most가 선지에만 있고 지문은 a, some, often, can, may에 머무르면 그 선지는 일반화 후보입니다. 지문도 분명히 every를 말하면 그 단어는 정답 쪽에 남을 수 있습니다. 선지에 있다고 자동으로 오답은 아니고, 지문의 한정과 비교해 더 넓은지만 봅니다.</p>
<p>마지막 점검은 소리 내어 읽지 않아도 되는 한 줄입니다. 고른 선지를 빈칸에 넣었을 때, 바로 뒤의 재진술 문장과 모순이 없어야 합니다. 모순이 생기면 그 선지는 단어가 익숙해도 답이 아닙니다.</p>`,
    traps: `<ul>
<li><strong>지문 단어를 많이 포함한 선지를 정답으로 보기.</strong> 명사가 겹쳐도 동사나 관계가 반대이면 오답입니다. 겹침은 힌트가 아니라 함정인 경우가 많습니다.</li>
<li><strong>예시 한 문장으로 일반 진술을 채우기.</strong> 사례의 장소·숫자·사물은 그 사례 안에만 있습니다. 빈칸이 일반 문장이면 공통점으로 올라가야 합니다.</li>
<li><strong>however를 못 보고 통념 방향으로 예측하기.</strong> often, many people 다음의 생각은 필자가 곧 고칠 통념일 수 있습니다. 전환 표지 뒤를 필자의 결론으로 읽습니다.</li>
<li><strong>not, hardly, unless를 빼먹기.</strong> 부정어 하나가 예측 전체를 반대로 만듭니다. 빈칸 문장에 표시하지 않은 부정이 없는지 선지를 보기 전에 확인합니다.</li>
<li><strong>버려진 통념을 결론으로 고르기.</strong> 그 문장도 지문에 인쇄되어 있어서 부분적 사실로 남습니다. 필자가 채택한 문장인지 연결어로 가릅니다.</li>
<li><strong>예측 없이 선지 번역부터 하기.</strong> 오답의 표현이 기억에 남으면 지문에 없는 관계를 있는 것처럼 읽게 됩니다. 한국어 한 줄을 먼저 적습니다.</li>
<li><strong>문법 틀이 다른 선지를 뜻이 비슷하다는 이유로 남기기.</strong> because 뒤에 명사구만 있는 선지, 동사 자리에 형용사만 있는 선지는 방향이 맞아 보여도 들어가지 않습니다.</li>
<li><strong>(A)(B)에서 한 칸만 보기.</strong> 한 칸은 맞고 한 칸은 반대인 짝이 가장 흔히 남는 오답입니다. 칸마다 방향이 맞는지 따로 확인합니다.</li>
</ul>`,
    examples: [
      ex(
        "다음 빈칸에 들어갈 말로 가장 적절한 것은?<br><br>People often treat a single failure as proof that they lack ability. A difficult exam, however, can show something else. The score may simply mean that the method did not fit the task. In that case, the useful response is not to call oneself unable, but to ______.<br><br>① accept that ability is fixed<br>② change the method and try again<br>③ avoid every difficult task<br>④ memorize the score for years<br>⑤ blame the teacher for the result",
        `<p><strong>정답: ②</strong></p>
<p>1. 첫 문장은 통념입니다. 실패 한 번을 능력 부족의 증거로 봅니다. however가 둘째 문장에서 그 통념과 다른 방향을 엽니다. something else는 아직 내용이 비어 있고, 셋째 문장이 그 내용을 채웁니다. 점수는 방법이 과제와 맞지 않았다는 뜻일 수 있습니다.</p>
<p>2. 넷째 문장의 not A but B가 빈칸의 방향을 고정합니다. A는 call oneself unable, 곧 첫 문장의 통념입니다. 빈칸은 A를 버린 쪽이라 방법을 바꿔 다시 하는 일입니다. 예측을 한국어로 적으면 ‘방법을 바꾸고 다시 한다’입니다.</p>
<p>3. ①은 A 자체라 반대입니다. ③은 every로 범위를 키우고, 글은 어려운 과제를 피하라고 하지 않습니다. ④는 점수라는 소재만 남긴 부분적 오독입니다. 점수는 방법을 알려 주는 신호이지 외울 대상이 아닙니다. ⑤는 지문에 없는 책임 전가입니다.</p>
<p>4. ②만 셋째 문장의 the method did not fit the task를 재진술하고, but 뒤의 자리에 들어갑니다. 품사도 to 뒤의 동사원형입니다.</p>`,
      ),
      ex(
        "다음 빈칸에 들어갈 말로 가장 적절한 것은?<br><br>When a park adds clear signs, visitors spend less time arguing about the path. Families reach the lake before they get tired, and they leave less litter behind. The signs do not make the walk shorter. They work because ______.<br><br>① the lake is always closer than it looks<br>② clear directions remove the confusion that delays people<br>③ every family learns to love hiking<br>④ litter is illegal in every park<br>⑤ the signs shorten the distance",
        `<p><strong>정답: ②</strong></p>
<p>1. because 뒤가 빈칸이므로 이유는 결과와 다른 말로 적어야 합니다. 결과는 첫째·둘째 문장에 있습니다. 길을 두고 다투는 시간이 줄고, 가족이 지치기 전에 호수에 도착하며, 쓰레기도 덜 남깁니다.</p>
<p>2. 셋째 문장이 오답을 미리 막습니다. The signs do not make the walk shorter. 거리를 줄인다는 예측은 이 문장과 반대입니다. ①의 closer와 ⑤의 shorten the distance가 여기에 걸립니다. always는 ①을 일반화까지 시킵니다.</p>
<p>3. 예측: 표지판이 어느 길로 갈지 알 수 있게 해서 다툼과 지체를 줄인다. ②는 arguing about the path를 confusion that delays people로 재진술한 것입니다. 거리 단축이 아니라 혼란 제거라는 셋째 문장과도 맞습니다.</p>
<p>4. ③은 every와 love hiking이 지문에 없습니다. ④는 litter라는 소재만 가져온 부분적 사실 후보인데, 글은 쓰레기가 불법이라고 하지 않고 덜 남긴다고만 합니다. 원인(혼란 감소)과 결과의 하나(쓰레기)를 바꾼 선지입니다.</p>`,
      ),
      ex(
        "다음 빈칸에 들어갈 말로 가장 적절한 것은?<br><br>A shop that changes its window every week may look busy. Regular customers, though, come back for a different reason. They remember the owner who greets them by name and keeps their favorite bread. For them, loyalty grows out of ______.<br><br>① frequent changes in the window<br>② a personal bond with the owner<br>③ the lowest price in town<br>④ a wider range of new products<br>⑤ the choice to stop selling bread",
        `<p><strong>정답: ②</strong></p>
<p>1. though는 대조입니다. 매주 바뀌는 진열은 바빠 보일 뿐이고, 단골이 돌아오는 이유는 다른 데 있습니다. ①과 ④는 진열·상품 변경이라 통념 쪽입니다. though가 이미 그 방향을 배제했습니다.</p>
<p>2. 셋째 문장이 예시 둘입니다. 이름으로 인사한다, 즐겨 찾는 빵을 남겨 둔다. 공통점은 빵이나 인사가 아니라 손님을 개인적으로 알아본다는 점입니다. 빈칸은 grows out of 뒤의 명사구라 상위 개념이 들어갑니다.</p>
<p>3. 예측: 주인과의 개인적인 관계. ②가 두 예시를 한 단계 위로 올린 재진술입니다. bread라는 단어가 없어도 됩니다.</p>
<p>4. ③은 가격이 지문에 없습니다. ⑤는 favorite bread와 반대입니다. 빵이라는 소재가 보여도 관계가 반대이면 오답입니다. ④의 new products는 every week의 진열 변경과 같은 방향이라 대조의 반대편입니다.</p>`,
      ),
      ex(
        "다음 빈칸에 들어갈 말로 가장 적절한 것은?<br><br>Some wild plants protect themselves with a bitter taste. A goat that bites one leaf often refuses the next leaf from the same bush. The plant does not need to be deadly. ______, a mild bitter taste is enough to keep the animal away.<br><br>① However<br>② For example<br>③ Therefore<br>④ In contrast<br>⑤ Similarly",
        `<p><strong>정답: ③</strong></p>
<p>1. 빈칸은 내용이 아니라 넷째 문장을 앞 논증에 잇는 연결어입니다. 첫째 문장은 일반 진술(쓴맛으로 자신을 지킨다)이고, 둘째 문장은 염소의 예시이며, 셋째 문장은 그 방어가 치명적일 필요는 없다는 한정입니다.</p>
<p>2. 넷째 문장 a mild bitter taste is enough는 둘째·셋째 문장에서 따라 나오는 결론입니다. 한 번 먹고 다음 잎을 거부할 정도면, 죽을 만큼 강하지 않은 쓴맛으로도 충분합니다. 결론을 잇는 말은 Therefore입니다.</p>
<p>3. ① However와 ④ In contrast는 앞과 반대여야 합니다. ‘치명적일 필요 없다’와 ‘약한 쓴맛으로 충분하다’는 반대가 아니라 같은 방향입니다. ② For example이면 넷째 문장이 새 사례여야 하는데, 사례는 이미 둘째 문장의 염소입니다. 넷째 문장은 사례가 아니라 일반화입니다. ⑤ Similarly는 또 다른 비슷한 사례를 더할 때 씁니다. 같은 식물의 결론을 반복하는 자리와는 다릅니다.</p>
<p>4. 연결사 빈칸은 바로 앞 문장 한 줄만이 아니라, 그 문장이 받치고 있는 논증 전체를 받습니다. 예시(염소)와 한정(치명적이어야 하는 것은 아님)이 함께 결론으로 모이므로 ③이 맞습니다.</p>`,
      ),
    ].join(""),
    easy: `<h3>한 줄</h3>
<p>빈칸은 선지를 보기 전에 한국어 한 줄로 예측합니다. however면 앞과 반대로, for example이면 사례의 공통점으로, in other words면 같은 말로 적습니다.</p>
<ul>
<li>정답은 핵심을 다른 말로 쓰거나 한 단계 위로 올린 문장입니다.</li>
<li>지문에 나온 명사만 모은 선지, 방향을 뒤집은 선지, all이나 always로 범위를 키운 선지는 지웁니다.</li>
<li>어려운 단어보다 연결어와 반복되는 핵심어가 힌트입니다.</li>
</ul>`,
    hard: `<p>두 선지가 남으면 빈칸의 역할을 다시 적습니다. 결론인지, 버려진 통념인지, because 뒤의 이유인지에 따라 같은 소재의 선지도 갈립니다. (A)(B)는 칸마다 긍정·부정을 따로 표시해 한 칸만 맞은 짝을 지웁니다. 재진술 문장이 있으면 그 문장을 등호로 삼아, 고른 선지를 넣었을 때 등호 뒤와 모순이 없는지 마지막에 확인합니다.</p>
<p>시간에는 상한을 둡니다. 부정어와 연결어를 다시 본 뒤에도 갈리지 않으면 범위가 좁은 쪽에 표시하고 장문으로 넘어갑니다. 장문을 끝낸 뒤에만 표시한 빈칸으로 돌아옵니다. 모르는 문장은 주어와 동사만 남기고, 그 뼈대와 모순되는 선지부터 지웁니다.</p>`,
    prompt: "빈칸의 단서와 방향을 짝지으세요.",
    pairs: [
      { term: "however", def: "빈칸은 앞과 반대" },
      { term: "therefore", def: "앞 내용의 결론" },
      { term: "for example", def: "일반 진술의 구체화" },
      { term: "in other words", def: "같은 주장의 재진술" },
      { term: "부분적 사실", def: "세부 하나에만 맞음" },
      { term: "지나친 일반화", def: "some을 all로 확대" },
    ],
    questions: [
      {
        q: "빈칸 바로 앞에 however가 있을 때 빈칸의 방향은?",
        choices: ["앞 문장과 같은 평가", "앞 문장과 반대 평가", "반드시 인물 소개", "반드시 숫자 제시"],
        answer: 1,
      },
      {
        q: "예시가 여러 개일 때 일반 진술 자리의 정답은?",
        choices: ["첫 예시의 고유 명사", "예시들의 공통 상위 개념", "가장 긴 예시의 단어 반복", "지문에 없는 반대 사례"],
        answer: 1,
      },
      {
        q: "부분적 사실 오답에 해당하는 것은?",
        choices: ["글 전체 역할은 비고 세부 하나만 맞는 선지", "예측과 같은 방향의 재진술", "빈칸 품사와 맞는 정답", "연결어가 없는 모든 문장"],
        answer: 0,
      },
      {
        q: "선지를 보기 전에 먼저 할 일은?",
        choices: ["가장 짧은 선지를 고른다", "첫 선지부터 번역한다", "빈칸에 들어갈 말을 한국어로 예측한다", "모르는 단어를 모두 찾는다"],
        answer: 2,
      },
      {
        q: "지문은 often인데 선지에만 always가 있으면?",
        choices: ["그 선지는 항상 정답이다", "지나친 일반화인지 확인한다", "연결사 빈칸으로 바뀐다", "어법 오류이므로 정답이다"],
        answer: 1,
      },
    ],
  },
  {
    file: "06-indirect.html",
    part: null,
    group: "독해",
    unit: "독해",
    title: "무관한 문장·순서·삽입·요약 (35~40번)",
    sub: "간접 쓰기 유형",
    lead: `<p>35번부터 40번까지는 간접 쓰기입니다. 글을 직접 쓰지 않고, 흐름에서 벗어난 문장을 빼거나, 단락의 순서를 맞추거나, 한 문장을 끼우거나, 요약의 두 칸을 채웁니다. 공통 단서는 대명사, 정관사, 연결어, 시간의 흐름입니다. 소재 단어가 같다는 이유만으로 문장을 남기면 35번에서 틀리고, 지시어가 가리키는 대상을 확인하지 않으면 36번부터 39번까지 흔들립니다.</p>`,
    body: `<h2>1. 네 유형이 묻는 것</h2>
<p>빈칸 다음이 간접 쓰기입니다. 설명이나 논증 글이 많고, 시간 순서가 있으면 그 표지도 단서가 됩니다. 네 유형은 묻는 형식만 다르고, 글이 한 화제를 유지한 채 이미 나온 정보를 다시 받는지 보는 점은 같습니다. 처음 나온 대상은 a나 무관사로 소개되고, 다시 나올 때는 the, this, such, 대명사로 받습니다. 이 사슬이 끊긴 곳을 찾는 방식이 문항마다 다를 뿐입니다.</p>
${tbl(
  ["문항", "묻는 것", "지문 구조", "정답의 모습", "먼저 표시할 단서"],
  [
    ["35 무관한 문장", "전체 흐름과 관계 없는 문장 하나", "①~⑤가 붙은 한 단락", "빼도 앞뒤가 이어지고, 화제만 벗어난 문장", "첫 문장의 화제, 각 문장의 지시어"],
    ["36~37 순서", "주어진 글 다음에 올 (A)(B)(C)의 배열", "도입 글 + 블록 셋", "지시어가 앞에서 뒤로만 이어지는 배열", "블록 첫 문장의 대명사·the·연결어"],
    ["38~39 삽입", "주어진 문장이 들어갈 자리", "본문 속 ①~⑤ 다섯 자리", "대명사·연결어·the가 바로 앞을 받는 자리", "삽입문 첫머리, 그 자리 앞뒤 문장"],
    ["40 요약", "요약문 (A)(B)의 짝", "본문 + 요약 한 문장", "두 덩어리를 각각 추상화한 짝", "글의 전환점, 두 칸의 관계(but 등)"],
  ],
)}
<p>각 유형은 (1) 무엇을 고르는지 (2) 구조와 단서 (3) 풀이 순서 (4) 정답과 오답의 전형 (5) 그 단서에 쓰이는 표현으로 익힙니다. 아래 네 절이 그 다섯 가지를 유형별로 펼칩니다. 순서를 풀 때 익힌 정관사와 대명사는 삽입에서 그대로 쓰고, 빈칸에서 익힌 추상화는 40번 요약에서 그대로 씁니다.</p>
${note("선지의 형태", "35번은 문장 번호, 36·37번은 (B)-(C)-(A) 같은 배열, 38·39번은 들어갈 자리 번호, 40번은 영어 단어 짝입니다. 내용을 한국어로 고르는 문항이 아니므로, 표시는 영어 단서 위에 합니다.")}

<h2>2. 무관한 문장: 화제 이탈과 소재 유지</h2>
<p>35번은 글의 흐름과 관계 없는 문장을 고릅니다. 문장에는 ①부터 ⑤까지 번호가 붙어 있습니다. 답이 되는 문장은 문법적으로 틀리지 않습니다. 그 문장만 읽으면 사실이거나 자연스러운 영어입니다. 틀린 이유는 이 글의 화제에서 벗어나기 때문입니다.</p>
<p>소재와 화제를 나눕니다. 소재는 글에 등장하는 대상의 이름입니다. 버스, 침묵, 공책처럼 눈에 보이는 단어입니다. 화제는 그 소재로 필자가 말하는 주장입니다. ‘병원 앞을 도는 짧은 버스가 예약 시간을 지키게 한다’처럼 한 줄로 적는 말입니다. 무관 문장은 소재 단어는 나누어 가지면서 화제만 빠져나갑니다. 같은 단어가 있으면 유관하다는 판단이 35번의 가장 흔한 오답입니다.</p>
${f("화제 = 이 글이 밀고 가는 주장 한 줄<br>소재 = 그 안에 등장하는 대상의 이름<br>무관 문장 = 소재는 남고 화제가 바뀌는 문장")}
<p>다음 네 문장에서 둘을 구분해 보겠습니다.</p>
<p><em>① The town added a short bus that loops past the clinic every twenty minutes. ② Riders who used to miss appointments now arrive before the desk closes. ③ Other cities run night buses for airport workers. ④ Because of this loop, the clinic keeps the evening desk open.</em></p>
<ul>
<li>화제: 병원 순환 버스가 예약 시간에 닿게 하고, 그래서 저녁 창구가 유지된다.</li>
<li>①이 버스를 소개하고 ②가 결과를 말합니다. ④의 this loop는 ①의 순환 버스를 다시 받습니다. ③을 빼도 ①②④가 이어집니다.</li>
<li>③은 bus라는 소재를 유지합니다. 그러나 주체가 다른 도시이고, 하는 일이 공항 야간 운행입니다. 병원 순환이라는 화제가 끊깁니다. ④는 ③의 공항 버스를 this loop로 받지 않습니다.</li>
</ul>
<p>판별은 다섯 단계입니다.</p>
<ol>
<li>첫 문장으로 화제를 한국어 한 줄로 적습니다. 첫 문장이 예시이면 그 예시가 받치는 일반 문장을 화제로 적습니다.</li>
<li>각 문장 옆에 역할을 적습니다. 이유, 결과, 예시, 재진술, 전환 중 하나입니다. 역할이 안 적히면 이탈 후보입니다.</li>
<li>this, such, they, the + 명사가 바로 앞의 무엇을 받는지 화살표를 긋습니다. 화살표가 한 문장을 건너뛰면, 건너뛴 문장이 무관 후보입니다.</li>
<li>후보를 빼 보고 앞뒤가 더 자연스러운지 확인합니다. 빼도 뒤 문장의 지시어가 받을 대상을 잃지 않아야 합니다.</li>
<li>뺐을 때 뒤 문장의 대명사가 받을 대상이 사라지면 그 문장은 유관입니다. 어려워 보여도 빼지 않습니다.</li>
</ol>
<p>정답 문장의 전형은 ‘소재 단어 + 다른 분야의 일반 사실’입니다. also, too가 붙어 거짓 연결을 만듭니다. 오답, 곧 유관한데 어려워 보이는 문장은 지시어가 앞 문장을 정확히 받거나, 화제의 이유·결과를 담당합니다. 문장이 길다는 이유, 단어가 어렵다는 이유만으로 무관하다고 고르지 않습니다.</p>
${warn("also가 있으면 앞 문장과 같은 화제의 추가 사례인지 확인합니다. 단어만 같고 주체와 상황이 바뀌면 also는 연결이 아니라 함정입니다.")}
<p>필수 표현은 연결을 만드는 말과 거짓 연결을 만드는 말입니다. this, these, such, the + 이미 나온 명사, because of this는 진짜 연결입니다. also, too, another, similar는 같은 화제 안에서만 진짜 연결입니다. 화제가 바뀌었는데도 이 말이 붙어 있으면 그 문장을 우선 의심합니다.</p>

<h2>3. 글의 순서: 지시어·연결어·시간</h2>
<p>36번과 37번은 주어진 글 다음에 이어질 글의 순서를 고릅니다. (A), (B), (C) 세 블록의 배열이 선지입니다. 두 문항은 같은 단서를 씁니다. 블록이 길면 전체를 반복해 번역하지 않고, 각 블록의 첫 문장과 끝 문장만 먼저 잇습니다.</p>
<p>단서는 네 종류입니다.</p>
<ul>
<li><strong>대명사와 지시어.</strong> it, they, them, this, these, those, such는 이미 나온 명사나 내용을 받습니다. 받을 대상이 주어진 글에 없으면 그 블록은 첫 자리가 되기 어렵습니다. This record는 record가 만들어진 다음 블록입니다.</li>
<li><strong>정관사.</strong> the + 명사는 그 명사가 앞서 소개된 뒤입니다. 부정관사 a, an은 새 대상을 소개할 때 많습니다. 다음은 그 사슬만 보여주는 세 문장입니다. <em>A visitor reported a crack in an old bridge. The crack looked small, but rain leaked through it the next morning. Engineers then closed the bridge for a week.</em> a crack이 먼저 나오고 The crack과 it이 뒤를 잇습니다. the bridge는 an old bridge를 다시 받습니다. 순서가 바뀌어 The crack이 a crack보다 앞에 오면 받을 대상이 없습니다.</li>
<li><strong>연결어.</strong> However는 바로 앞과 대조, For example은 바로 앞이 일반 진술, Therefore는 바로 앞이 이유이거나 근거입니다. 연결어로 시작하는 블록은 그 관계가 성립하는 블록 뒤에만 붙습니다.</li>
<li><strong>시간.</strong> At first, then, later, after, the next day, finally는 이야기나 과정의 순서입니다. At first는 도입 바로 뒤에 오기 쉽고, finally는 마지막 블록에 남습니다. 시간 표지만으로 정하면 지시어와 충돌할 수 있으므로, 시간을 정한 뒤 대명사로 검산합니다.</li>
</ul>
${f("1. 주어진 글이 새로 소개한 명사를 표시<br>2. 블록 첫 문장의 지시어가 그 명사를 받는지 확인<br>3. 앞 블록의 끝이 다음 블록의 첫 지시어를 만드는지 연결<br>4. 시간·연결어로 검산")}
<p>풀이 순서는 위 공식과 같습니다. 첫 블록 후보가 둘이면, 각 후보의 마지막 문장이 무엇을 새로 만드는지 적습니다. 다음 블록의 첫 단어가 그 새 정보를 받지 못하면 그 배열을 지웁니다. 오답 배열의 전형은 소재 단어는 모두 나오는데 This, the, Each처럼 앞을 요구하는 말이 아직 없는 정보를 받는 배열입니다. 정답 배열은 화살표가 앞에서 뒤로만 갑니다. 뒤로 가야 받을 대상이 생기는 배열은 지웁니다.</p>
${tip("블록 전체를 읽기 전에 첫 문장의 첫 두 단어만 보아도 후보가 줄어듭니다. This, They, The, Each, However, At first가 대표입니다.")}

<h2>4. 문장 삽입: 삽입문의 단서와 앞뒤 논리</h2>
<p>38번과 39번은 주어진 한 문장을 본문의 어느 자리에 넣을지 고릅니다. 실제 문항의 자리는 ①부터 ⑤까지 다섯 곳입니다. 순서가 ‘블록을 배열’하는 일이라면, 삽입은 ‘한 문장이 앞과 뒤를 동시에 받는지’ 보는 일입니다. 단서의 종류는 순서와 같습니다. 대명사, 접속·연결어, 정관사입니다.</p>
<p>삽입문 첫머리에서 단서를 읽습니다.</p>
<ul>
<li>They, It, This, These로 시작하면 그 대상이 자리 바로 앞에 있어야 합니다. 성별과 수도 맞아야 합니다. 복수는 복수 명사 뒤에, 단수는 단수 명사 뒤에 넣습니다.</li>
<li>However, Therefore, For example로 시작하면 바로 앞 내용과 그 관계가 성립해야 합니다. However를 같은 방향의 문장 사이에 넣으면 틀립니다.</li>
<li>the + 명사, such + 명사는 그 명사가 이미 소개된 뒤여야 합니다. 글의 맨 앞에 the problem이 오려면 주어진 문장 앞에 problem이 있어야 합니다. 삽입문 자신이 그 소개를 맡는 경우가 아니면, 정관사는 앞을 요구합니다.</li>
<li>also, too는 같은 주체의 앞선 동작이 있을 때 성립합니다. 직전 문장의 주어와 삽입문의 주어가 같은지 확인합니다.</li>
</ul>
<p>자리는 앞만 맞아서는 부족합니다. 삽입문 다음 문장이 삽입문을 받아 주는지도 봅니다. 다음 문장의 this나 the + 명사가 삽입문의 내용을 가리키면 그 자리입니다. 반대로, 삽입문을 넣었을 때 원래 이어지던 두 문장 사이의 지시어가 깨지면 그 자리는 아닙니다. 다섯 자리 옆에 ‘대명사 없음’, ‘대조 없음’, ‘정관사의 선행 없음’, ‘뒤 문장이 안 받음’처럼 탈락 이유를 한 단어로 적습니다. 이유가 안 적히는 자리가 답입니다.</p>
<p>짧은 세 문장으로 앞뒤만 연습합니다. <em>The guide printed a one-page map. Visitors kept stopping at the same statue. They also asked where the exit was.</em> They는 Visitors이고, also는 ‘같은 상에서 멈추는 일’에 더해진 질문입니다. They also asked를 첫 문장 앞에 넣으면 Visitors가 아직 없습니다. 출구 질문을 지도 문장과 statue 문장 사이로 넣으면, also가 받을 앞선 동작이 방문객에게 없습니다. 셋째 자리, 곧 statue 문장 뒤가 맞습니다.</p>
${warn("가장 비슷한 소재 옆에 넣는 것이 삽입의 방법이 아닙니다. 삽입문의 첫 단어가 요구하는 선행 정보가 그 자리 바로 앞에 있는지를 먼저 봅니다.")}
<p>정답 자리의 전형은 삽입문의 대명사·the·연결어가 바로 앞을 받고, 뒤 문장이 그 내용을 이어서 진행하는 곳입니다. 오답 자리의 전형은 소재만 같거나, However가 들어갈 대조가 없거나, They가 가리킬 복수 명사가 아직 없는 곳입니다. 필수 표현은 삽입문 첫머리의 They / This / However / the / also 다섯 개입니다. 이 다섯 개 중 무엇이 쓰였는지 주어진 문장에 먼저 동그라미를 칩니다.</p>

<h2>5. 요약문: 핵심을 추상화하고 (A)(B)를 가르기</h2>
<p>40번은 본문을 한 문장으로 요약한 뒤, 빈칸 (A)와 (B)에 들어갈 짝을 고릅니다. 선지는 영어 단어의 쌍입니다. 빈칸 추론과 같이 재진술·추상화를 쓰되, 칸이 둘이고 두 칸의 관계가 글의 구조와 맞아야 합니다.</p>
<p>글을 두 덩어리로 나눕니다. 자주 쓰이는 나눔은 통념과 반박, 과거와 현재, 문제와 결과, 원인과 결과입니다. 전환 표지 however, but, now, as a result가 나눔의 경계인 경우가 많습니다. (A)는 앞 덩어리의 상위 개념, (B)는 뒤 덩어리의 상위 개념인 경우가 많습니다. 사례 속의 사물 이름을 그대로 넣지 않습니다.</p>
<p>다음 네 문장으로 두 덩어리를 나눠 보겠습니다.</p>
<p><em>The workshop used to lock its tools in a back room. Only the leader could take them out. Members now sign a card and take a tool home overnight. Repairs finish sooner, but the card still keeps track of every item.</em></p>
<ul>
<li>앞 덩어리: 도구가 잠겨 있고 리더만 꺼낼 수 있다. 상위어는 ‘제한된 접근’입니다.</li>
<li>뒤 덩어리: 부원이 집에 가져가 수리는 빨라졌지만 카드가 모든 물건을 추적한다. 상위어는 ‘기록으로 관리되는 대여’입니다. 집에 가져간다는 한 장면만 보면 ‘완전한 개방’으로 오해합니다. but the card still이 그 오해를 막습니다.</li>
<li>요약의 꼴: Tools went from (A) locked storage to borrowing that is still (B) tracked. (A)만 보고 (B)를 unlimited로 고르면 넷째 문장의 카드와 모순됩니다.</li>
</ul>
${f("(A)(B) 절차<br>1. 전환 표지로 글을 두 덩어리로 나눈다<br>2. 각 덩어리를 사례 이름 없이 한 줄로 적는다<br>3. 요약문의 but, and, from–to가 두 줄의 관계와 같은지 본다<br>4. 한 칸이라도 반대이거나 사례에만 머무는 짝을 지운다")}
<p>정답 짝은 두 덩어리를 각각 추상화하고, 요약문 안의 연결어와 방향이 같습니다. from A to B, not A but B이면 두 칸이 대비됩니다. 오답 짝의 전형은 셋입니다. 한 칸은 맞고 한 칸은 반대인 쌍, 앞뒤를 뒤바꾼 쌍, 본문의 사물 이름만 가져온 쌍입니다. 한 칸이 맞아 보여도 짝을 통째로 답으로 고르지 않습니다. 40번은 31~34번의 두 칸 빈칸과 같은 검산을 글 전체 단위로 하는 문항입니다.</p>
${tip("요약문에 먼저 (A)와 (B)의 관계를 표시합니다. but이면 두 칸의 평가가 반대인지, and이면 같은 방향인지를 본문을 읽기 전에 적어 두면 짝을 빨리 지웁니다.")}

<h2>6. 오답 패턴과 풀이 순서</h2>
<p>네 유형의 오답은 한 습관에서 갈라집니다. 단어의 재등장만 보고 연결이 있다고 판단하는 습관입니다. 35번에서는 소재가 같은 문장을 남기고, 36·37번에서는 지시어가 없는 비슷한 블록을 앞에 두며, 38·39번에서는 비슷한 명사 옆에 문장을 넣고, 40번에서는 사례에 나온 단어를 요약의 칸에 넣습니다. 고칠 때는 단어 반복 대신 지시어의 화살표를 긋습니다.</p>
${tbl(
  ["유형", "자주 남는 오답", "지우는 기준"],
  [
    ["35", "소재는 같고 분야·주체가 바뀐 문장", "뺐을 때 뒤 문장의 this/the가 더 또렷하면 그 문장이 답"],
    ["36·37", "This·the·Each가 아직 없는 정보를 받는 배열", "화살표가 뒤로 돌아가지 않는 배열만 남김"],
    ["38·39", "However가 들어갈 대조가 없는 자리, 대명사의 선행이 없는 자리", "삽입문 첫 단어의 요구가 바로 앞에서 충족되는 자리"],
    ["40", "한 칸만 맞거나 앞뒤가 바뀐 짝", "두 덩어리의 상위어가 둘 다 맞는 짝"],
  ],
)}
<p>시험에서의 추천 순서는 표시의 양으로 정합니다. 35번은 화제 한 줄과 이탈 문장이면 끝나므로 먼저 처리하기 좋습니다. 40번은 세부 순서가 아니라 두 덩어리만 보면 되므로 다음에 둡니다. 36·37번은 블록의 첫 문장과 끝 문장만 잇습니다. 38·39번은 다섯 자리를 모두 비교하므로 손이 더 갑니다. 순서에서 이미 쓴 대명사·정관사·연결어를 삽입에 그대로 가져가면, 삽입을 새 유형으로 다시 배우지 않아도 됩니다. 이 순서는 배점표가 아니라 표시량에 맞춘 전략입니다. 한 문항이 막히면 표시하고 다음 유형으로 넘어가, 장문 앞에 시간을 남깁니다.</p>
<p>간접 쓰기에서 외울 표현은 길지 않습니다. 새 정보는 a, 이미 나온 정보는 the, 직전 내용을 받으면 this/these/such, 대조는 however, 예시는 for example, 시간의 시작은 at first, 시간의 끝은 finally입니다. 이 여덟 단어를 문장 첫머리에서 찾는 일이 35번부터 39번까지의 공통 기술이고, 40번은 그 경계로 나뉜 두 덩어리를 상위어로 바꾸는 일입니다.</p>`,
    traps: `<ul>
<li><strong>소재가 같으면 유관하다고 보기.</strong> 같은 명사가 있어도 주체와 주장이 바뀌면 35번의 답입니다. also가 붙어 있어도 화제를 다시 확인합니다.</li>
<li><strong>무관 후보를 뺄 때 뒤 문장을 안 보기.</strong> 뺐더니 뒤 문장의 this나 the가 받을 대상을 잃으면 그 문장은 유관입니다. 빼도 화살표가 남는 문장만 답입니다.</li>
<li><strong>내용이 비슷해 보이는 순서로 블록을 배열하기.</strong> 지시어가 없는 유사성은 오답 배열을 만듭니다. This, the, Each가 받는 대상이 이미 나왔는지가 우선입니다.</li>
<li><strong>정관사 the를 새 정보로 읽기.</strong> the + 명사는 그 명사가 앞에 소개되었다는 표시입니다. a로 소개되기 전에 the 블록을 앞에 두지 않습니다.</li>
<li><strong>However 삽입문을 같은 방향의 자리에 넣기.</strong> 바로 앞 문장과 평가가 반대인 자리만 However가 성립합니다. 예시나 첨가 사이에 넣지 않습니다.</li>
<li><strong>They를 글 전체에서 가장 익숙한 명사에 연결하기.</strong> 삽입문의 대명사는 바로 앞의 수·성이 맞는 명사를 받습니다. 멀리 있는 주인공을 습관으로 고르지 않습니다.</li>
<li><strong>요약에서 한 칸만 보고 짝을 고르기.</strong> 한 칸은 맞고 한 칸은 반대인 쌍이 가장 오래 남습니다. but이면 두 칸의 방향이 둘 다 글과 같은지 확인합니다.</li>
<li><strong>사례의 사물 이름을 요약의 상위어로 쓰기.</strong> 카드, 빵, 버스 같은 구체어는 두 덩어리를 포괄하지 못합니다. 제한, 추적, 접근처럼 한 단계 위의 말을 찾습니다.</li>
</ul>`,
    examples: [
      ex(
        "다음 글에서 전체 흐름과 관계 없는 문장은?<br><br>① Teachers who give students a minute of quiet before a test often see calmer classrooms. ② The pause lets students read the instructions and slow their breathing. ③ Several famous writers also sat in silence before they began a novel. ④ After the quiet minute, students ask fewer panicked questions about the time limit. ⑤ Schools that keep this short routine report smoother starts on exam day.",
        `<p><strong>정답: ③</strong></p>
<p>1. 화제는 ①에 있습니다. 시험 전에 주는 1분의 정적이 교실을 안정시킨다는 주장입니다. 소재는 quiet, silence, minute입니다. 화제와 소재를 나눈 뒤에 ③을 보면, silence라는 소재만 같고 주체가 학생에서 작가로, 상황이 시험에서 소설 집필로 바뀝니다.</p>
<p>2. also는 앞 문장과 같은 화제의 추가처럼 보이게 합니다. 그러나 ②의 the pause는 ①의 minute of quiet를 받고, ④의 the quiet minute와 students는 다시 시험 상황으로 돌아갑니다. ③의 작가는 ④가 받는 대상이 아닙니다.</p>
<p>3. ③을 빼면 ②의 정지가 ④의 ‘그 1분 뒤 질문이 줄어든다’로 바로 이어지고, ⑤의 this short routine은 학교의 시험 루틴을 요약합니다. ③을 남기면 ⑤의 routine이 작가의 습관인지 학교의 절차인지 흐려집니다.</p>
<p>4. ②와 ④는 이유와 결과라 유관입니다. 단어가 쉬워 보여도 빼면 사슬이 끊깁니다. 35번의 답은 어려운 문장이 아니라, 빼도 지시어가 더 또렷해지는 문장입니다.</p>`,
      ),
      ex(
        "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?<br><br>A city library began to lend tools as well as books. Hammers and drills sat on a new shelf near the door.<br><br>(A) This record showed which tools people actually used, so the staff bought more of those items.<br>(B) At first, few residents noticed the shelf, but after a short demonstration they began to borrow the tools.<br>(C) Each borrower wrote the return date on a card.<br><br>① (A)-(C)-(B) &nbsp; ② (B)-(A)-(C) &nbsp; ③ (B)-(C)-(A) &nbsp; ④ (C)-(A)-(B) &nbsp; ⑤ (C)-(B)-(A)",
        `<p><strong>정답: ③ (B)-(C)-(A)</strong></p>
<p>1. 주어진 글이 새로 소개한 것은 tools와 a new shelf입니다. 이용 기록이나 대출자는 아직 없습니다. (A)의 This record와 (C)의 Each borrower는 주어진 글만으로는 받을 대상이 없습니다. 첫 블록은 (B)입니다. the shelf가 주어진 글의 shelf를 받고, At first가 시간상 시작입니다.</p>
<p>2. (B)의 끝이 they began to borrow the tools입니다. 대출자가 여기서 생깁니다. (C)의 Each borrower가 그 사람들을 받습니다. 카드를 쓰면서 record가 생깁니다.</p>
<p>3. (A)의 This record는 (C)의 card를 받습니다. 그래서 순서는 (B)-(C)-(A)입니다. 직원이 많이 빌리는 도구를 더 산다는 문장은 기록이 생긴 뒤에만 가능합니다.</p>
<p>4. ①과 ④, ⑤는 (A)나 (C)가 record·borrower보다 앞에 옵니다. ②는 (B) 다음에 바로 (A)가 와서, 기록이 생기기 전에 This record를 받습니다. 도구라는 소재가 모든 블록에 있어도 지시어가 뒤로 돌아가면 오답입니다.</p>`,
      ),
      ex(
        "글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?<br><br>주어진 문장: They also noticed that the glare on the water was gone.<br><br>The town replaced the bright lamps on the river path with softer ones. ① Within a month, night birds returned to the trees. ② Walkers stopped to look at the sky. ③ The council voted to keep the new lamps. ④ A local paper called the path safe for an evening stroll. ⑤<br><br>번호는 그 자리이며, ⑤는 글의 맨 끝입니다.",
        `<p><strong>정답: ③</strong></p>
<p>1. 삽입문의 They는 복수 사람이고, also는 같은 주체의 앞선 동작이 필요합니다. the glare는 밝은 등이 이미 나온 뒤의 정관사·특정 표현입니다. 등은 첫 문장에 있으므로 정관사는 ① 이후 어디서든 설명됩니다. 자리를 좁히는 단서는 They와 also입니다.</p>
<p>2. ① 앞에는 the town만 있어 They가 받을 복수 사람이 없습니다. ②는 새들이 돌아온 직후입니다. They를 새로 보면 수가 맞지만, 새가 눈부심이 사라졌음을 알아차리고 also가 받을 앞선 관찰이 없습니다. 새의 동작은 returned 하나입니다.</p>
<p>3. ③은 Walkers stopped to look at the sky 다음입니다. They는 walkers, also는 하늘을 본 것에 더해 수면의 눈부심이 사라졌다는 관찰입니다. 그 다음 의회의 결정은 관찰들의 결과로 이어집니다.</p>
<p>4. ④는 투표 다음이라 관찰이 결정보다 뒤로 갑니다. They를 council로 보면 also가 받을 의회의 앞선 관찰이 없습니다. ⑤는 신문이 이미 산책을 안전하다고 쓴 뒤라, 산책하는 사람의 관찰이 너무 늦습니다. 대명사와 시간 순서가 동시에 맞는 자리는 ③입니다.</p>`,
      ),
      ex(
        "윗글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?<br><br>Museums once kept rare objects in closed rooms. Only a few scholars could see them. Many museums now place pictures and short notes online, so students far away can study the same objects. A visit to the building still matters, but it is no longer the only way to learn.<br><br>요약: Access to rare objects used to be (A)________, but online notes have made it more (B)________.<br><br>① limited / open<br>② limited / useless<br>③ expensive / silent<br>④ open / limited<br>⑤ required / optional",
        `<p><strong>정답: ①</strong></p>
<p>1. 글을 두 덩어리로 나눕니다. 앞은 once, closed rooms, only a few scholars입니다. 접근이 제한됩니다. 뒤는 now, online, students far away can study입니다. 접근이 넓어집니다. 마지막 문장은 방문이 여전히 의미 있지만 유일한 방법은 아니라는 한정입니다. 온라인이 방문을 없앤다는 뜻은 아닙니다.</p>
<p>2. 요약문의 but은 두 칸의 대비를 요구합니다. (A)는 앞 덩어리의 상위어 limited, (B)는 뒤 덩어리의 상위어 open입니다. closed rooms와 scholars라는 사례 이름을 벗긴 말입니다.</p>
<p>3. ②는 (A)만 맞고 (B) useless가 students can study와 반대입니다. ④는 두 칸이 모두 반대 방향입니다. ③의 expensive와 silent는 닫힌 방의 소재를 가격과 소음으로 바꾼 것이고 지문에 없습니다. ⑤는 마지막 문장의 only way를 의무(required)로 오독한 부분적 사실입니다. 글은 방문이 의무인지가 아니라 접근의 폭을 말합니다.</p>
<p>4. ①의 open은 ‘온라인만 남는다’가 아닙니다. more open이고, 본문의 no longer the only way와 같습니다. 한 칸만 본 ②를 지우면 ①이 남습니다.</p>`,
      ),
    ].join(""),
    easy: `<h3>한 줄</h3>
<p>간접 쓰기는 새 정보를 a로, 이미 나온 정보를 the·this·대명사로 받는지 보는 문항입니다. 같은 단어가 있어도 화제가 바뀌면 35번의 답입니다.</p>
<ul>
<li>순서는 블록 첫 문장의 This, They, The, At first만 먼저 잇습니다.</li>
<li>삽입은 주어진 문장의 첫 단어가 요구하는 정보가 바로 앞에 있는 자리를 고릅니다.</li>
<li>요약은 글을 두 덩어리로 나누어 각각 한 단계 위로 올립니다.</li>
</ul>`,
    hard: `<p>35번은 후보를 뺀 뒤 다음 문장의 지시어가 살아 있는지까지 확인합니다. 36·37번은 블록 본문을 반복하지 않고, 앞 블록의 끝이 만든 새 정보와 다음 블록의 첫 지시어만 연결합니다. 배열이 둘 남으면 시간 표지와 However의 방향만 검산합니다.</p>
<p>38·39번은 다섯 자리 옆에 탈락 이유를 한 단어로 적고, 이유가 없는 자리를 고릅니다. 40번은 (A)만 맞는 짝을 마지막에 한 번 더 지웁니다. 요약문 안의 but, from–to가 두 칸의 관계와 같은지가 그 기준입니다. 막힌 문항은 표시하고 장문으로 넘어갑니다.</p>`,
    prompt: "간접 쓰기의 단서와 쓰임을 짝지으세요.",
    pairs: [
      { term: "화제 이탈", def: "소재만 같고 주장이 다름" },
      { term: "This + 명사", def: "앞에 나온 내용을 받음" },
      { term: "the + 명사", def: "이미 소개된 대상" },
      { term: "무관 문장", def: "빼도 앞뒤가 이어짐" },
      { term: "요약 (A)(B)", def: "두 덩어리의 추상화" },
      { term: "However 삽입", def: "바로 앞과 대조" },
    ],
    questions: [
      {
        q: "소재 단어가 같은 문장은 35번에서 어떻게 판단하는가?",
        choices: ["항상 흐름과 관계 있다", "화제가 빠지면 무관할 수 있다", "항상 글의 첫 문장이다", "항상 요약의 정답이다"],
        answer: 1,
      },
      {
        q: "This record로 시작하는 블록은 어디에 두는가?",
        choices: ["record가 생기기 전에 둔다", "record가 만들어진 뒤에 둔다", "주어진 글보다 앞에 둔다", "연결어와 상관없이 맨 끝에 둔다"],
        answer: 1,
      },
      {
        q: "삽입문이 They로 시작할 때 먼저 확인할 것은?",
        choices: ["문장의 단어 수", "바로 앞에 복수 대상이 있는가", "가장 어려운 단어", "문단의 개수"],
        answer: 1,
      },
      {
        q: "요약 (A)(B)에서 한 칸만 맞고 한 칸은 반대인 짝은?",
        choices: ["항상 정답으로 남긴다", "우선 지울 오답 후보이다", "어법상 정답이다", "무관 문장의 표시이다"],
        answer: 1,
      },
      {
        q: "정관사 the와 이미 나온 명사가 순서 문항에서 하는 일은?",
        choices: ["새 화제를 연다", "앞 내용과의 연결을 보여 준다", "무관 문장임을 보여 준다", "빈칸의 품사를 정한다"],
        answer: 1,
      },
    ],
  },
  {
    file: "07-long.html",
    part: null,
    group: "독해",
    unit: "독해",
    title: "장문 독해 (41~45번)",
    sub: "장문 1지문 2문항·2지문 3문항 유형",
    lead: `<p>41·42번은 한 지문으로 제목과 어휘를 묻고, 43~45번은 또 다른 한 지문으로 순서, 지칭, 내용 일치를 묻습니다. 부제의 ‘1지문 2문항’은 41·42번, ‘2지문 3문항’은 두 번째 장문인 43~45번을 가리키며, 두 번째 장문도 지문은 하나이고 문항만 셋입니다. 43~45번은 인물이 있는 이야기인 경우가 많고, 설명문이면 문단의 논리 순서로 같은 단서를 씁니다. 한 번 읽으며 인물과 사건 순서를 남겨 두면 문항마다 처음부터 다시 읽지 않아도 됩니다.</p>`,
    body: `<h2>1. 장문 두 세트가 묻는 것</h2>
<p>장문은 독해의 맨 끝입니다. 짧은 독해에서 쓰던 제목, 어휘, 순서, 지칭, 내용 일치를 더 긴 글에 모은 것입니다. 새 과목이 아니라 같은 기술의 연장입니다. 지문이 길어서 어려워 보일 뿐, 한 문장의 단서는 앞 문항과 같습니다.</p>
${tbl(
  ["세트", "문항", "묻는 것", "지문", "선지의 모습"],
  [
    ["장문 1", "41 제목", "글 전체를 한 각도로 압축한 제목", "41·42가 공유하는 한 글. 설명문인 경우가 많음", "영어 제목 다섯 개"],
    ["장문 1", "42 어휘", "문맥과 방향이 반대인 밑줄 낱말", "같은 글", "밑줄 (a)~(e) 가운데 부적절한 것"],
    ["장문 2", "43 순서", "주어진 글 다음의 문단 배열", "43~45가 공유하는 한 글. 이야기인 경우가 많음", "(B)-(C)-(A) 같은 배열"],
    ["장문 2", "44 지칭", "밑줄이 가리키는 인물", "같은 이야기", "인물 이름, 또는 나머지와 다른 밑줄"],
    ["장문 2", "45 내용 일치", "세부 진술이 글과 맞는지", "같은 이야기", "한국어 진술. 불일치를 묻는 발문이 일반적"],
  ],
)}
<p>각 문항은 (1) 무엇을 고르는지 (2) 글의 구조와 단서 (3) 풀이 순서 (4) 정답과 오답의 전형 (5) 필요한 표현·표시로 정리합니다. 41번은 24번 제목과 같은 기준을 긴 글에 적용합니다. 42번은 30번 어휘와 같이 반의어 함정을 봅니다. 43번은 36·37번 순서와 같이 지시어를 잇습니다. 44번과 45번만 장문에서 비중이 커집니다. 인물이 둘 이상이고, 세부가 여러 문장에 흩어져 있기 때문입니다.</p>
${note("한 지문, 여러 문항", "41과 42는 지문을 공유하고, 43·44·45도 지문을 공유합니다. 문항 수만큼 통독하지 않습니다. 첫 읽기에서 남긴 표시로 두 번째, 세 번째 문항의 근거 문장만 찾습니다.")}
<p>44번의 발문은 두 가지를 확인합니다. 밑줄이 하나이면 그 표현이 가리키는 인물을 고릅니다. 밑줄이 여러 개이면 가리키는 대상이 나머지와 다른 하나를 고릅니다. 어느 쪽이든 성별, 수, 그 문장의 동작으로 후보를 지우는 과정은 같습니다. 발문의 ‘다른’이 있는지 먼저 표시합니다. 45번은 윗글과 일치하지 않는 진술을 고르는 발문이 일반적입니다. ‘않는’이 없으면 일치하는 하나를 남기는 문항이므로, 발문을 읽기 전에 선지를 지우지 않습니다.</p>

<h2>2. 41·42번, 제목과 어휘를 한 번에 읽기</h2>
<p>41번이 묻는 것은 소재의 이름이 아니라 글 전체의 주장입니다. 제목은 주제보다 구체적이고, 요지보다 짧습니다. 첫 문장의 소재만으로 정하면 범위가 넓거나, 글이 나중에 버리는 통념을 제목으로 고르게 됩니다. 마지막 문장과 전환 뒤의 문장이 필자의 각도인 경우가 많습니다.</p>
${tbl(
  ["제목 선지", "특징", "판정"],
  [
    ["정답", "글 전체의 주장과 그 주장을 한정하는 각도", "사례가 모두 이 말 안에 들어옴"],
    ["지나치게 넓음", "every, all, 글에 없는 분야", "소재만 같고 주장이 없음"],
    ["지나치게 좁음", "한 문단의 도구·숫자·장소", "수단만 있고 결과가 빠짐"],
    ["반대", "필자가 버린 통념, 또는 부정된 원인", "however 앞이나 not 뒤를 제목으로 씀"],
  ],
)}
<p>다음 네 문장으로 제목의 각도를 잡아 보겠습니다. <em>The choir sounded thin when only the older students knew the harmony. The director then printed the parts and paired each new singer with an older one. After a month the new singers held their notes, and the sound filled the hall. The choir grew stronger because the music was passed on, not because the room was larger.</em></p>
<ul>
<li>소재는 합창입니다. 소재만 보면 How Schools Should Teach Music처럼 범위가 커집니다. 글은 학교 음악 교육 전체를 말하지 않습니다.</li>
<li>인쇄와 짝 활동은 수단입니다. Printing the Harmony Parts는 둘째 문장만 담아 좁습니다.</li>
<li>넷째 문장이 원인을 한정합니다. because the music was passed on, not because the room was larger. ‘더 큰 방이 합창을 살렸다’는 제목은 not 뒤를 가져와 반대입니다.</li>
<li>글 전체를 한 각도로 모으면 ‘음악을 물려주자 합창이 단단해졌다’입니다. 제목에 passed on, shared, stronger가 이 각도를 담으면 정답 후보입니다.</li>
</ul>
<p>42번은 같은 글을 다시 번역하지 않습니다. 30번과 같이, 밑줄 낱말의 긍정·부정이 앞뒤와 같은지만 봅니다. 제목을 정하려고 문단마다 한 줄을 적을 때, 밑줄 옆에도 화살표를 같이 긋습니다. 재진술이나 글의 결말이 긍정인데 밑줄만 weaken, reduce, hinder이면 그 밑줄이 42번의 답입니다. 어려운 밑줄과 부적절한 밑줄을 구분합니다. 품사가 맞는지는 29번의 일이고, 42번은 뜻의 방향입니다.</p>
${f("41·42 한 번의 읽기<br>문단마다 한국어 한 줄 → 그 줄들로 제목의 각도 확정<br>밑줄마다 긍정·부정 화살표 → 결말·재진술과 다른 화살표가 42번의 답")}
<p>제목의 필수 표현은 각도를 담는 동사·명사입니다. share, pass on, trade-off, limit, shift처럼 사례를 포괄하는 말입니다. 어휘의 필수 기술은 30번의 전환 표지입니다. however 뒤의 밑줄은 앞과 반대 방향이어야 하고, in other words 앞뒤의 밑줄은 같은 방향이어야 합니다. 장문이라 표지가 멀어 보여도 기준은 같습니다.</p>
${tip("제목 선지를 먼저 읽으면 글에 없는 각도가 기억에 남습니다. 글을 읽고 한국어 한 줄을 적은 뒤에 선지를 대조합니다. 그 한 줄에 없는 every나 반대 원인은 지웁니다.")}

<h2>3. 이야기의 구조와 인물 정리</h2>
<p>43~45번의 글은 인물이 있는 이야기인 경우가 많습니다. 설명문이면 문단의 주장과 예시로 읽고, 순서 단서는 36·37번과 같습니다. 이야기이면 구조를 네 칸으로 나눕니다. 상황(누가 어디에 있는가), 문제(무엇이 어긋났는가), 행동(누가 무엇을 했는가), 결과(누가 고마워하거나 무엇이 바뀌었는가)입니다. 43번의 순서는 이 네 칸이 시간상 앞뒤로 맞는지와, 대명사·정관사가 앞에서 뒤로 이어지는지를 함께 봅니다.</p>
${tbl(
  ["칸", "이야기에 적는 것", "순서·지칭에서 하는 일"],
  [
    ["상황", "이름, 관계, 장소", "첫 블록. 새 이름은 a 또는 무관사로 소개"],
    ["문제", "실수, 갈등, 부족", "At first, but, however 뒤"],
    ["행동", "누가 도왔는지, 무엇을 옮겼는지", "대명사의 동작. 지칭의 핵심"],
    ["결과", "감사, 귀가, 변화", "finally, then. 일치 문항의 결말 근거"],
  ],
)}
<p>인물은 이름 옆에 역할, 성별, 관계를 적습니다. 대명사가 나오면 화살표를 이름까지 긋습니다. 다음 네 문장이 그 메모의 모델입니다. <em>Ms. Han lent her camera to Jun before she left for the office. Jun dropped it, and his sister Nari picked it up. Nari wiped the lens. When Ms. Han returned, she thanked Nari and checked the camera.</em></p>
<ul>
<li>Ms. Han은 카메라를 빌려 준 사람, 여성, 사무실에 갔다가 돌아옴. Jun은 빌린 사람, 남성. Nari는 Jun의 누나 또는 여동생, 여성, 렌즈를 닦음.</li>
<li>첫째 문장 she left의 she는 그 문장 주어 Ms. Han입니다. 사무실에 간 사람은 한 명입니다.</li>
<li>his sister는 Jun의 누이입니다. Jun이 남성이므로 his가 맞고, Ms. Han이면 her sister가 되어야 합니다.</li>
<li>넷째 문장 she thanked Nari의 she는 Nari가 아닙니다. Nari가 목적어로 다시 적혀 있으므로 주어는 돌아온 Ms. Han입니다. 이름을 목적어로 반복하면 주어와 그 이름은 다른 사람입니다.</li>
</ul>
<p>같은 성별의 인물이 둘이면 가장 가까운 이름만으로 확정하지 않습니다. 그 문장의 동작을 할 수 있는 사람만 남깁니다. 코트 안에 들어가는 사람과 코트를 입혀 주는 사람은 다를 수 있습니다. 성별이 갈리면 he와 she로 절반이 먼저 사라집니다. 수가 갈리면 they와 he/she가 갈립니다. 성별과 수로 지운 뒤에 동작을 보면, 가까운 이름에 이끌리지 않습니다.</p>
${warn("the boy, the man처럼 돌려 말한 표현도 대명사와 같이 추적합니다. 바로 앞에 나온 이름과 같은 사람인지, 그 별칭이 앞에서 정의되어 있는지 확인합니다. the boy가 Ali로 이미 풀렸으면 다음 he를 the boy로 자동 연결하지 않습니다.")}

<h2>4. 시간 배분과 대명사 추적</h2>
<p>영어 영역은 70분입니다. 듣기는 1~17번 방송에 맞추어 풀고, 독해 18~45번은 방송이 끝난 뒤의 시간으로 풉니다. 장문은 41번부터라, 빈칸과 간접 쓰기에서 한 문항에 오래 머물면 이야기를 읽기 전에 시험이 끝납니다. 방송이 끝난 뒤 남은 분을 고정된 숫자로 외우지는 않습니다. 대신 읽기 횟수를 고정합니다.</p>
${f("41·42: 통독 1회. 문단 한 줄 + 밑줄 화살표. 제목 확정 후 방향이 다른 밑줄만 확인<br>43: 문단 첫 문장의 지시어로 순서 확정<br>44: 확정된 순서로 대명사 추적. 밑줄 문장만 다시 읽음<br>45: 선지마다 근거 문장 번호를 적음. 전문을 다시 통독하지 않음")}
<p>43~45번의 시간 배분은 문항 번호 순서를 따릅니다. 문단이 (A)(B)(C)로 나뉘어 있으면 순서를 먼저 맞춥니다. 순서가 틀린 채 대명사를 추적하면 인물의 위치가 섞입니다. 이야기가 이미 이어진 전문으로 44·45가 보이면 그 전문으로 근거를 찾고, 43번은 지시어만 따로 잇습니다. 어느 쪽이든 한 지문을 세 번 처음부터 읽지 않습니다. 두 번째 이후에는 밑줄 문장과 선지가 가리키는 문장만 봅니다.</p>
<p>대명사 추적은 다섯 단계입니다.</p>
<ol>
<li>밑줄 문장의 동작을 한국어로 적습니다. ‘누구에게 코트를 입혔다’, ‘누구에게 감사했다’처럼 동작의 대상도 같이 적습니다.</li>
<li>성별과 수로 후보를 지웁니다. she 자리에 남성 이름을 남기지 않습니다.</li>
<li>그 동작을 논리적으로 할 수 없는 사람을 지웁니다. 목적어로 다시 나온 이름은 주어가 아닙니다. 아직 도착하지 않은 사람은 그 장면의 동작을 하지 못합니다.</li>
<li>가장 가까운 이름은 후보로만 둡니다. 가깝다는 이유만으로 확정하지 않습니다.</li>
<li>앞 문장에서 그 사람의 상태(울고 있음, 방금 도착함, 자리를 비움)와 밑줄의 동작이 맞는지 검산합니다.</li>
</ol>
<p>밑줄이 여러 개이고 발문이 ‘나머지와 다른 대상’이면, 각 밑줄의 화살표를 이름 옆에 모읍니다. 이름이 같은 밑줄이 넷이고 하나만 다른 이름으로 가면 그 다른 밑줄이 답입니다. 넷을 하나씩 번역하는 대신, 이름별로 묶으면 다른 하나가 드러납니다.</p>
${tip("여백에 이름을 세 줄만 적습니다. 이름, 성별, 관계. 이야기 도중에 새 이름이 나와도 줄을 추가하면 되고, 대명사마다 긴 번역을 쓰지 않습니다.")}

<h2>5. 세부 내용 일치, 근거 문장과 대조하기</h2>
<p>45번은 이야기의 세부가 선지와 맞는지를 묻습니다. 선지는 한국어인 경우가 많습니다. 발문이 ‘일치하지 않는 것’이면, 글이 뒷받침하지 않거나 글과 어긋난 한 진술이 답이고 나머지 선지는 글과 같습니다. 발문이 ‘일치하는 것’이면 글과 같은 한 진술만 남깁니다. 장문 45번은 불일치를 묻는 발문이 일반적이므로, ‘않는’을 먼저 동그라미 합니다. 없는 것을 못 보고 맞는 진술을 고르면 정반대 답이 됩니다.</p>
<p>대조는 선지 하나당 근거 문장 하나입니다. 근거가 두 문장에 나뉘면 그 두 문장 번호를 같이 적습니다. 전문을 다시 읽고 느낌을 고르지 않습니다.</p>
${tbl(
  ["비틀리는 자리", "글", "선지에서 의심할 말"],
  [
    ["주체", "Lina가 도구를 가져옴", "Mr. Choi가 가져옴"],
    ["부정", "가스레인지는 다루지 않음", "가스레인지도 고침"],
    ["수·때", "5월에 두 번, 3월에 가입", "한 번, 또는 5월에 가입"],
    ["순서·조건", "주인이 가져가기 전에 확인", "가져온 뒤에 확인"],
    ["범위", "일부, often, a", "모두, 항상, 유일한"],
  ],
)}
<p>절차는 다음과 같습니다.</p>
<ol>
<li>발문의 ‘않는’ 여부를 적습니다. 불일치 문항이면 어긋난 선지를 찾고, 일치 문항이면 그대로인 선지를 찾습니다.</li>
<li>선지의 핵심을 주체, 동작, 수·때, 긍정·부정 네 칸으로 나눕니다.</li>
<li>그 칸과 같은 내용이 있는 영어 문장에 번호를 붙입니다. 없는 내용은 ‘근거 없음’으로 적습니다.</li>
<li>한 칸이라도 글과 다르면 그 선지는 불일치입니다. 불일치 문항의 답은 그런 선지 하나입니다. 나머지 선지는 네 칸이 모두 맞아야 합니다.</li>
<li>근거 없음은 글이 말해 주지 않은 진술입니다. 불일치 문항에서는 답이 될 수 있고, 일치 문항에서는 오답입니다. 느낌이 아니라 문장 번호가 없는 것으로 판정합니다.</li>
</ol>
${f("선지 한 줄 = 주체 + 동작 + 수·때 + 긍정·부정<br>네 칸이 한 문장(또는 인접한 두 문장)과 모두 같으면 일치")}
<p>정답 선지의 전형은 맞는 문장처럼 보이되 주체나 부정이나 숫자 하나만 바뀐 진술입니다. 오답 선지, 곧 불일치 문항에서 답이 아닌 선지는 문장과 네 칸이 같습니다. 단어가 한국어로 바뀌었을 뿐 관계가 같습니다. 영어 단어가 선지에 그대로 나왔다고 해서 일치가 아니고, 한국어로 풀어 썼다고 해서 불일치가 아닙니다. 관계만 봅니다.</p>
${warn("not, no, without이 있는 영어 문장은 부정 칸에 따로 적습니다. 선지가 그 not을 빼면 소재는 같아도 불일치입니다. 가스레인지를 배웠다는 말과 가스레인지를 다루지 않았다는 말은 소재가 같아도 답이 갈립니다.")}

<h2>6. 오답 패턴과 학습법</h2>
<p>장문의 오답은 앞 문항의 오답이 길게 늘어난 것입니다. 제목은 첫 문장 소재에 머물거나 글이 부정한 원인을 살리고, 어휘는 어려운 밑줄을 부적절한 밑줄로 착각합니다. 순서는 지시어 없이 비슷한 사건끼리 붙이고, 지칭은 가장 가까운 이름을 고릅니다. 일치는 한 단어만 바뀐 선지를 지나칩니다. 공통 습관은 표시 없이 통독을 반복하는 것입니다.</p>
${tbl(
  ["문항", "오답 습관", "대신 남길 표시"],
  [
    ["41 제목", "첫 문장이나 수단만 제목으로 봄", "글 전체 한 줄, not 뒤는 제외"],
    ["42 어휘", "29번처럼 품사만 보거나 어려운 단어를 고름", "결말과 다른 긍정·부정 화살표"],
    ["43 순서", "사건 내용의 유사성만 봄", "첫 문장의 대명사·the·At first"],
    ["44 지칭", "가장 가까운 이름", "동작, 성별, 수, 앞 문장의 상태"],
    ["45 일치", "소재가 같으면 일치로 봄", "선지 옆의 문장 번호와 부정 칸"],
  ],
)}
<p>학습은 장문을 별종으로 모으지 않고 앞 기술에 붙입니다. 제목은 짧은 24번과 같은 날 풀고, 어휘는 30번과 같은 날 풉니다. 순서는 36·37번의 지시어 연습 뒤에 이야기 한 편을 붙입니다. 지칭은 짧은 이야기에서 이름 세 줄을 적는 연습으로 충분합니다. 일치는 틀린 선지의 네 칸 중 어느 칸이 바뀌었는지 한 단어로 오답 노트에 적습니다. 정답 번호만 적으면 다음 글에서 같은 주체 바꿈을 다시 합니다.</p>
<p>주 1회는 41번부터 45번까지를 한 세트로 읽고, 통독이 두 번을 넘는지 스스로 확인합니다. 세 번 읽고 있다면 표시가 없는 것입니다. 시간을 재되, 남은 분의 마법 같은 숫자에 맞추기보다 ‘한 번 읽고 근거 문장만 다시 보기’가 지켜졌는지를 봅니다. 막힌 제목은 한국어 한 줄로 돌아오고, 막힌 지칭은 동작 문장으로 돌아옵니다. 장문은 길어서가 아니라 표시 없이 길이를 다시 걸어서 시간을 잃습니다.</p>
${tip("오답 노트에는 문항 번호 옆에 ‘놓친 단서’만 적습니다. not을 못 봄, the boy를 다음 he와 합침, 제목에 수단만 넣음. 다음 세트 전에 그 한 줄을 읽고 시작합니다.")}`,
    traps: `<ul>
<li><strong>제목을 첫 문장 소재로 정하기.</strong> 첫 문장이 통념이거나 실패한 시도일 수 있습니다. 글 전체 한 줄과 not 뒤에 버린 원인을 확인한 뒤에 고릅니다.</li>
<li><strong>한 문단의 도구만 제목으로 고르기.</strong> 악보를 인쇄했다, 노트를 썼다는 수단은 좁은 제목입니다. 그 수단이 만든 결과까지 담기는지 봅니다.</li>
<li><strong>42번을 어법처럼 풀기.</strong> 품사가 맞아도 방향이 반대이면 그 낱말이 답입니다. 어려운 낱말과 부적절한 낱말을 구분합니다.</li>
<li><strong>순서를 맞추기 전에 지칭을 확정하기.</strong> 문단이 섞여 있으면 인물의 위치가 섞입니다. 지시어로 순서를 정한 뒤 대명사를 추적합니다.</li>
<li><strong>가장 가까운 이름을 지칭의 답으로 보기.</strong> 가까워도 성별이 다르거나, 그 문장의 목적어로 다시 나온 이름은 주어가 아닙니다.</li>
<li><strong>같은 성별이라 동작을 안 보기.</strong> 울고 있는 아이와 방금 도착해 코트를 입히는 어른은 둘 다 남성일 수 있습니다. 앞 문장의 상태가 동작을 가릅니다.</li>
<li><strong>일치 선지에서 바뀐 한 칸을 지나치기.</strong> 소재가 같아도 주체, 부정, 횟수, 전후가 하나라도 다르면 불일치입니다. 선지 옆에 문장 번호를 적습니다.</li>
<li><strong>문항마다 전문을 다시 통독하기.</strong> 두 번째부터는 밑줄 문장과 선지의 근거만 봅니다. 통독이 세 번이면 인물 메모가 없는 것입니다.</li>
</ul>`,
    examples: [
      ex(
        "다음 글의 제목으로 가장 적절한 것은?<br><br>A school garden failed when one teacher did all the work. The next year, each class took one month and wrote down what it had planted. Students who inherited the notes made fewer mistakes, and the garden lasted through the fall. The project survived because the knowledge did not stay with a single person.<br><br>① Why Every School Needs a Larger Garden<br>② One Leader Should Run the Whole Garden<br>③ Shared Notes Kept the Garden Alive<br>④ A List of What One Class Planted<br>⑤ Students Should Stop Gardening",
        `<p><strong>정답: ③</strong></p>
<p>1. 첫째 문장은 실패한 방식입니다. 교사 한 사람이 모든 일을 맡아 정원이 실패했습니다. ②는 이 실패를 처방으로 바꾼 반대 제목입니다. ⑤도 정원 포기가 글에 없으므로 반대에 가깝습니다.</p>
<p>2. 둘째·셋째 문장은 수단과 결과입니다. 각 반이 한 달씩 맡고 심은 것을 적었고, 노트를 물려받은 학생의 실수가 줄었으며 가을까지 정원이 유지되었습니다. ④는 목록이라는 수단만 남아 좁습니다. 노트를 왜 썼는지는 없습니다.</p>
<p>3. 넷째 문장이 각도입니다. 지식이 한 사람에게 머물지 않아서 프로젝트가 남았습니다. ①은 Every School과 Larger Garden이 글에 없는 범위 확대입니다. 텃밭의 크기나 모든 학교를 말하지 않습니다.</p>
<p>4. ③ Shared Notes Kept the Garden Alive가 물려 준 노트와 생존을 한 제목으로 모읍니다. 사례(반, 한 달, 가을)를 다 넣지 않아도 주장의 각도가 맞습니다.</p>`,
      ),
      ex(
        "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?<br><br>Mina was nervous before the science fair. She repeated her explanation at home until the words felt ①familiar. That practice ②increased her fear, and on the fair day she spoke in a steady voice. She ③answered every question from the judges. Her teacher said the preparation had ④settled her nerves and made the talk ⑤clear.",
        `<p><strong>정답: ②</strong></p>
<p>1. 이 글의 각도는 ‘연습이 긴장을 가라앉혔다’입니다. 제목으로 잡으면 Practice Settled Mina's Nerves에 가깝습니다. 42번은 그 각도와 다른 방향의 밑줄을 고릅니다.</p>
<p>2. ① familiar는 반복의 결과로 자연스럽습니다. ③ answered와 ⑤ clear는 발표가 되었다는 결말과 같습니다. ④ settled her nerves는 안정된 목소리와 같은 방향이라 맞는 밑줄이고, ②를 검산하는 기준입니다.</p>
<p>3. ② increased her fear는 ④와 모순됩니다. 연습이 두려움을 키웠다면 목소리가 안정되고 긴장이 가라앉았다는 뒤 문장이 성립하지 않습니다. 방향은 reduced 또는 eased여야 합니다. and로 이어져 있어도 앞뒤 평가가 같아야 합니다.</p>
<p>4. 오답 유혹은 ① familiar가 쉬워 보여 ②의 모순을 지나치는 것입니다. 쉬운 결말 문장 ④가 어려운 단어보다 강한 단서입니다. 42번은 부적절한 밑줄의 번호를 고르는 문항이지, 대체 단어를 쓰는 문항이 아닙니다.</p>`,
      ),
      ex(
        "밑줄 친 He가 가리키는 인물로 가장 적절한 것은?<br><br>Mr. Park asked Dana to watch his nephew Ali at the pond. Ali chased a duck and slipped on the wet stones. Dana pulled him back to the grass and called his uncle. The boy was still crying when Mr. Park arrived. He wrapped his own coat around Ali and thanked Dana. The three of them walked home slowly.<br><br>① Dana &nbsp; ② Ali &nbsp; ③ Mr. Park &nbsp; ④ the duck &nbsp; ⑤ the three of them",
        `<p><strong>정답: ③ Mr. Park</strong></p>
<p>1. 메모는 세 줄입니다. Dana는 아이를 보라는 부탁을 받은 사람. Ali는 Mr. Park의 조카, 남성, 오리에 쫓기다 미끄러진 아이. Mr. Park은 삼촌, 남성, 나중에 도착.</p>
<p>2. 셋째 문장 him은 미끄러진 Ali입니다. Dana가 끌어 올렸습니다. his uncle의 his는 Dana가 아닙니다. Dana이면 her uncle이어야 합니다. 남성의 his는 Ali이고, 삼촌은 첫째 문장의 Mr. Park과 만납니다.</p>
<p>3. 넷째 문장 the boy는 아직 울고 있는 Ali입니다. Mr. Park은 그때 도착합니다. 다섯째 문장 He의 동작은 자기 코트를 Ali에게 입히고 Dana에게 감사하는 일입니다.</p>
<p>4. ① Dana는 she여야 합니다. ② Ali는 코트를 입는 대상입니다. around Ali라고 이름을 다시 적었으므로 주어와 Ali는 다른 사람입니다. 울고 있던 아이가 동시에 자신에게 코트를 입히고 감사하는 장면도 아닙니다. ④ 오리는 사람이 아니고 코트가 없습니다. ⑤ He는 단수라 세 명이 아닙니다.</p>
<p>5. 가장 가까운 사람 표현은 the boy이지만, 그 아이는 Ali이고 동작의 대상과 상태가 맞지 않습니다. 방금 도착한 Mr. Park만 자기 코트를 건네고 도와준 Dana에게 감사할 수 있습니다.</p>`,
      ),
      ex(
        "윗글의 내용과 일치하지 않는 것은?<br><br>Lina joined a weekend repair club in March. She learned to fix lamp switches, but she did not work on gas stoves. In May the club met twice, and Lina brought her own small screwdriver. The leader, Mr. Choi, checked every repair before the owner took the item home.<br><br>① Lina는 3월에 수리 동아리에 들어갔다.<br>② Lina는 가스레인지 수리도 맡았다.<br>③ 동아리는 5월에 두 번 모였다.<br>④ Lina는 작은 드라이버를 직접 가져왔다.<br>⑤ 주인이 물건을 가져가기 전에 Mr. Choi가 수리를 확인했다.",
        `<p><strong>정답: ②</strong></p>
<p>1. 발문에 ‘않는’이 있으므로 네 칸이 어긋난 선지 하나를 찾습니다. 각 선지 옆에 문장 번호를 적습니다.</p>
<p>2. ①은 첫째 문장 joined in March와 주체·때가 같습니다. ③은 셋째 문장 met twice, in May와 수가 같습니다. ④는 같은 문장의 Lina brought her own small screwdriver와 주체가 같습니다. Mr. Choi가 가져왔다고 바꾸면 오답이 되지만, 이 선지는 주체를 바꾸지 않았습니다.</p>
<p>3. ⑤는 넷째 문장입니다. 주체는 Mr. Choi, 동작은 checked, 순서는 before the owner took the item home입니다. ‘가져간 뒤’로 바뀌지 않았습니다.</p>
<p>4. ②만 둘째 문장과 부정 칸이 다릅니다. did not work on gas stoves인데 선지는 수리도 맡았다고 합니다. lamp switches라는 맞는 세부 옆에 부정을 빼 둔 전형입니다. 소재가 보여도 부정 칸이 다르면 불일치 문항의 답입니다.</p>`,
      ),
    ].join(""),
    easy: `<h3>한 줄</h3>
<p>장문 1은 한 글로 제목과 어휘를 풀고, 장문 2는 한 이야기로 순서, 지칭, 내용 일치를 풉니다. 통독은 한 번이고 나머지는 표시한 문장만 다시 봅니다.</p>
<ul>
<li>제목은 글 전체 한 줄이고, 수단만 담거나 글이 버린 원인은 지웁니다.</li>
<li>인물은 이름, 성별, 관계 세 줄로 적고 대명사는 동작으로 확인합니다.</li>
<li>일치 선지는 주체, 동작, 수·때, 긍정·부정을 근거 문장과 비교합니다.</li>
</ul>`,
    hard: `<p>41·42는 문단 한 줄과 밑줄 화살표를 같은 읽기에서 남깁니다. 제목 선지는 그 한 줄에 없는 범위와 not으로 버린 원인을 지운 뒤에 고릅니다. 42번은 결말 문장과 방향이 다른 밑줄입니다.</p>
<p>43은 문단 첫 문장의 지시어로 배열을 확정합니다. 44는 그 순서로 성별·수·동작을 적용하고, 가장 가까운 이름은 후보로만 둡니다. 밑줄이 여러 개이면 이름별로 묶어 다른 하나를 고릅니다. 45는 선지마다 문장 번호를 적고, 불일치 발문이면 부정·주체·횟수가 바뀐 한 줄을 답으로 남깁니다. 통독이 두 번을 넘으면 표시를 줄이고 근거 문장만 다시 봅니다.</p>`,
    prompt: "장문 문항과 확인할 대상을 짝지으세요.",
    pairs: [
      { term: "41번", def: "장문 1의 제목" },
      { term: "42번", def: "같은 글의 어휘" },
      { term: "43번", def: "장문 2의 순서" },
      { term: "44번 지칭", def: "밑줄 대명사의 인물" },
      { term: "45번 불일치", def: "비틀린 세부 진술" },
      { term: "가까운 이름", def: "지칭의 후보일 뿐" },
    ],
    questions: [
      {
        q: "41번과 42번이 공유하는 것은?",
        choices: ["서로 다른 지문 두 개", "같은 장문 지문 하나", "듣기 대본", "요약문의 (A)(B) 선지"],
        answer: 1,
      },
      {
        q: "44번에서 가장 가까운 이름을 바로 답으로 삼기 어려운 이유는?",
        choices: ["대명사는 사물만 가리킨다", "동작과 성별과 수가 맞는지를 확인해야 한다", "항상 첫 문장의 인물이다", "장문에는 인물이 한 명뿐이다"],
        answer: 1,
      },
      {
        q: "45번 발문이 일치하지 않는 것을 물을 때 답은?",
        choices: ["근거 문장과 네 칸이 모두 같은 진술", "주체·횟수·부정 중 하나가 비틀린 진술", "가장 적절한 영어 제목", "글의 연결어"],
        answer: 1,
      },
      {
        q: "문단이 (A)(B)(C)로 나뉜 43~45번에서 권장하는 순서는?",
        choices: ["일치 다음 지칭 다음 순서", "순서를 맞춘 뒤 지칭과 일치", "지칭만 먼저 확정", "제목을 먼저 고름"],
        answer: 1,
      },
      {
        q: "장문 제목의 오답으로 흔한 것은?",
        choices: ["글 전체의 각도를 압축한 제목", "한 세부만 담거나 범위를 지나치게 넓힌 제목", "영어 명사로 된 제목", "결과가 포함된 제목"],
        answer: 1,
      },
    ],
  },
];
