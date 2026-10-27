/* 어원 문자열을 말하듯 읽는 문장으로 바꾼다(소리 전용 — 화면의 어원 표시는 그대로).
   're(다시) + videre(보다) → 다시 보고 고치다' → '리는 다시, 비데레는 보다. 그래서 다시 보고 고치다라는 뜻이 됐어요.'
   로마자 어근은 한국어 음성이 더듬지 않게 한글로 옮긴다: 접사·영어 단어는 표(AFFIX·EN), 나머지는 라틴어 읽기 규칙(latinKo).
   규칙으로 어색한 문장은 SAY 에 어원 문자열 그대로를 키로 넣어 통째로 바꾼다. 전체 검토: node scripts/vocab/ety-talk-review.mjs */
(function (root) {
  /* ── 한글 조합·조사 ── */
  const H0 = 0xac00;
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  const isHangul = (c) => c >= '가' && c <= '힣';
  const lastHangul = (s) => { for (let i = s.length - 1; i >= 0; i--) if (isHangul(s[i])) return s[i]; return ''; };
  const hasBatchim = (s) => { const c = lastHangul(s); return !!c && (c.charCodeAt(0) - H0) % 28 > 0; };
  const topic = (s) => s + (hasBatchim(s) ? '은' : '는');
  const quote = (s) => s + (hasBatchim(s) ? '이라는' : '라는');
  const copula = (s) => s + (hasBatchim(s) ? '이에요' : '예요');
  const subj = (s) => s + (hasBatchim(s) ? '이' : '가');
  const withP = (s) => s + (hasBatchim(s) ? '과' : '와');

  /* ── 로마자 → 한글 ──
     접사는 영어식(re 리, ex 엑스), 영어 단어는 우리말 표기, 그 밖(라틴어·그리스어·옛말)은 라틴어처럼 읽는다. */
  const AFFIX = {
    a: '아', ab: '앱', ac: '액', ad: '애드', af: '애프', ag: '애그', an: '안', ana: '아나', ante: '앤티', anti: '안티',
    ap: '앱', as: '애스', at: '앳', auto: '오토', be: '비', bene: '베네', bi: '바이', circum: '서컴', co: '코', col: '콜',
    com: '컴', con: '콘', contra: '콘트라', cor: '코르', counter: '카운터', de: '디', di: '디', dia: '다이아', dis: '디스',
    dys: '디스', e: '이', ec: '엑', ef: '에프', em: '엠', en: '엔', epi: '에피', ex: '엑스', extra: '엑스트라', fore: '포어',
    hemi: '헤미', hyper: '하이퍼', hypo: '하이포', il: '일', im: '임', in: '인', inter: '인터', intra: '인트라', intro: '인트로',
    ir: '이르', kata: '카타', mal: '말', meta: '메타', mis: '미스', mono: '모노', multi: '멀티', non: '논', ob: '옵', oc: '옥',
    op: '옵', out: '아웃', over: '오버', para: '파라', per: '퍼', peri: '페리', post: '포스트', pre: '프리', prae: '프라이',
    pro: '프로', re: '리', retro: '레트로', se: '세', semi: '세미', sub: '서브', suc: '석', suf: '서프', sum: '섬', sup: '서프',
    super: '수퍼', supra: '수프라', sur: '서', sus: '서스', syl: '실', sym: '심', syn: '신', tele: '텔레', trans: '트랜스',
    tri: '트라이', ultra: '울트라', un: '언', under: '언더', uni: '유니', up: '업', with: '위드',
    '-able': '에이블', '-age': '에이지', '-al': '얼', '-arian': '에리언', '-ate': '에이트', '-ative': '에이티브', '-cracy': '크러시',
    '-cule': '큘', '-ed': '에드', '-en': '언', '-er': '어', '-ery': '어리', '-ful': '풀', '-fy': '파이', '-ible': '이블', '-ing': '잉',
    '-ism': '이즘', '-ity': '이티', '-ive': '이브', '-ize': '아이즈', '-less': '리스', '-ly': '리', '-ment': '먼트',
    '-most': '모스트', '-ness': '니스', '-orium': '오리움', '-ous': '어스', '-tude': '튜드', '-ure': '어', '-y': '이',
  };
  const EN = {
    able: '에이블', act: '액트', active: '액티브', adhesive: '애드히시브', afford: '어포드', age: '에이지', apply: '어플라이',
    astonish: '어스토니시', attain: '어테인', auction: '옥션', author: '오서', authority: '오소리티', awe: '오', back: '백',
    bed: '베드', blunt: '블런트', body: '바디', brag: '브래그', breath: '브레스', bribe: '브라이브', bureau: '뷰로',
    burst: '버스트', by: '바이', call: '콜', candidate: '캔디데이트', candle: '캔들', chief: '치프', common: '커먼',
    compass: '컴퍼스', competent: '컴피턴트', complete: '컴플리트', compose: '컴포즈', conscience: '컨션스',
    counter: '카운터', cover: '커버', cuisine: '퀴진', damp: '댐프', date: '데이트', dead: '데드', decision: '디시전',
    deer: '디어', defect: '디펙트', different: '디퍼런트', dispose: '디스포즈', do: '두', dormitory: '도미토리',
    doubt: '다우트', dower: '다워', down: '다운', draw: '드로', drift: '드리프트', drive: '드라이브', dry: '드라이',
    earth: '어스', election: '일렉션', emerge: '이머지', encumber: '인컴버', exhaust: '이그조스트', exist: '이그지스트',
    experience: '익스피리언스', fall: '폴', far: '파', fashion: '패션', fill: '필', firm: '펌', fleet: '플리트',
    flower: '플라워', fluid: '플루이드', folk: '포크', for: '포', forth: '포스', forward: '포워드', found: '파운드',
    frenetic: '프러네틱', frenzy: '프렌지', function: '펑션', gist: '지스트', grace: '그레이스', grief: '그리프',
    guise: '가이즈', halt: '홀트', head: '헤드', heat: '히트', hold: '홀드', human: '휴먼', humble: '험블',
    impede: '임피드', inner: '이너', intricate: '인트리킷', intrinsic: '인트린식', join: '조인', joy: '조이', kind: '카인드',
    arts: '아츠', fine: '파인', land: '랜드', less: '리스', legal: '리걸', leisure: '레저', let: '렛', levitate: '레비테이트', liable: '라이어블', like: '라이크',
    little: '리틀', lock: '락', lore: '로어', loupe: '루페', man: '맨', mandate: '맨데이트', margin: '마진', martial: '마셜',
    mean: '민', mine: '마인', money: '머니', moral: '모럴', most: '모스트', mount: '마운트', mow: '모', need: '니드',
    niche: '니치', note: '노트', notice: '노티스', nutrition: '뉴트리션', obedience: '오비디언스', of: '오브', off: '오프',
    optimism: '옵티미즘', over: '오버', pass: '패스', patron: '페이트런', pave: '페이브', place: '플레이스',
    play: '플레이', pose: '포즈', pot: '팟', private: '프라이빗', produce: '프로듀스', progressive: '프로그레시브',
    proportion: '프로포션', prove: '프루브', quarters: '쿼터스', read: '레드', reap: '립', regard: '리가드',
    relation: '릴레이션', replace: '리플레이스', resource: '리소스', rest: '레스트', ripe: '라이프', rust: '러스트',
    sake: '세이크', sale: '세일', sane: '세인', scarce: '스케어스', scene: '씬', schizophrenia: '스키조프레니아',
    scrape: '스크레이프', see: '시', set: '세트', sewer: '수어', shame: '셰임', ship: '십', siege: '시즈', sight: '사이트',
    sit: '싯', sky: '스카이', slide: '슬라이드', sole: '솔', solo: '솔로', space: '스페이스', spring: '스프링', stand: '스탠드', state: '스테이트',
    stiff: '스티프', straight: '스트레이트', stress: '스트레스', strict: '스트릭트', stroke: '스트로크', suspect: '서스펙트',
    tail: '테일', take: '테이크', testify: '테스티파이', the: '더', thorn: '쏜', true: '트루', turn: '턴', twine: '트와인',
    under: '언더', utility: '유틸리티', vain: '베인', vary: '베리', vulgar: '벌거', wage: '웨이지', while: '와일',
    whole: '홀', wild: '와일드', with: '위드',
  };
  // 프랑스어·옛말처럼 라틴어 규칙으로 읽으면 엉뚱해지는 낱말
  const FOREIGN = {
    gage: '가주', reles: '렐레', ostage: '오스타주', joir: '주아르', granter: '그랑테', garnement: '가르느망', garnir: '가르니르',
    pionnier: '피오니에', pion: '피옹', altruisme: '알트뤼이슴', hasard: '아자르', estout: '에스투', biais: '비에',
    combre: '콩브르', courber: '쿠르베', empestrer: '앙페트레', esmayer: '에스메이에', espreindre: '에스프랭드르',
    estale: '에스탈', estourdi: '에스투르디', estriver: '에스트리베', faire: '페르', fournir: '푸르니르', marquer: '마르케',
    mocquer: '모케', peser: '프제', pincier: '팽시에', tailler: '타이에', tourner: '투르네', trouver: '트루베',
    avaler: '아발레', colper: '콜페', flater: '플라테', frenetique: '프레네티크', froigner: '프루아녜', grouchier: '그루시에',
    cote: '코트', cuisine: '퀴진', snacchen: '스나첸', chiveren: '치베렌', plait: '플레', harer: '아레', niche: '니슈', nicher: '니셰', vie: '비', envier: '앙비에', deveir: '드베이르', barater: '바라테', baraigne: '바라뉴', plege: '플레주', à: '아',
  };

  const MOD = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/[þð]/g, 'th').replace(/[^a-z]/g, '');
  /* 라틴어 읽기: 모음마다 한 음절(au 아우, ae 아에), c·ch 는 ㅋ, qu 는 ㅋ+w, v 는 ㅂ, j 는 y.
     자음은 앞 모음의 받침이 되거나(l m n, 자음 앞 k p) 홀로 '으' 음절이 된다. 모음 사이 l·자음 뒤 l 은 ㄹㄹ(플리카레). */
  const ON = { sh: 'ㅅ', k: 'ㅋ', g: 'ㄱ', t: 'ㅌ', d: 'ㄷ', p: 'ㅍ', b: 'ㅂ', f: 'ㅍ', v: 'ㅂ', s: 'ㅅ', z: 'ㅈ', h: 'ㅎ', m: 'ㅁ', n: 'ㄴ', l: 'ㄹ', r: 'ㄹ', kw: 'ㅋ', y: 'ㅇ', w: 'ㅇ' };
  const VOW = { a: 'ㅏ', e: 'ㅔ', i: 'ㅣ', o: 'ㅗ', u: 'ㅜ' };
  const YV = { a: 'ㅑ', e: 'ㅖ', i: 'ㅣ', o: 'ㅛ', u: 'ㅠ' };
  const WV = { a: 'ㅘ', e: 'ㅞ', i: 'ㅟ', o: 'ㅝ', u: 'ㅜ' };
  function phonemes(w) {
    w = MOD(w).replace(/ck/g, 'k').replace(/sch/g, 'sh').replace(/([bcdfgkprstvxz])\1/g, '$1').replace(/([lmn])\1(?=[^aeiouy]|$)/g, '$1');
    const out = [];
    for (let i = 0; i < w.length; i++) {
      const c = w[i], two = w.slice(i, i + 2);
      if (two === 'sh') { out.push('sh'); i++; } else if (two === 'ch' || two === 'kh') { out.push('k'); i++; } else if (two === 'ph') { out.push('f'); i++; } else if (two === 'th') { out.push('t'); i++; }
      else if (two === 'rh') { out.push('r'); i++; } else if (two === 'qu') { out.push('kw'); i++; }
      else if (c === 'c' || c === 'k' || c === 'q') out.push('k');
      else if (c === 'x') out.push('k', 's');
      else if (c === 'j') out.push('y');
      else if (c === 'y' || (c === 'i' && i === 0)) out.push(i === 0 && /[aeiou]/.test(w[i + 1] || '') ? 'y' : 'i');
      else out.push(c);
    }
    return out;
  }
  const syl = (c, v, t) => String.fromCharCode(H0 + (CHO.indexOf(c) * 21 + JUNG.indexOf(v)) * 28 + JONG.indexOf(t || ' '));
  function latinKo(word) {
    const ps = phonemes(word), S = [];   // S: {c, v, t, real}
    let pend = [];
    const settle = (cons, next) => {   // 모음 사이(또는 끝)에 남은 자음: 받침 또는 '으' 음절
      cons.forEach((x, i) => {
        const prev = S[S.length - 1], after = cons[i + 1] || next;
        if (x === 'g' && !after && next === null && prev && prev.t === 'ㅇ' && i === cons.length - 1) return;
        if (i === 0 && prev && prev.real && !prev.t) {
          if (x === 'l') { prev.t = 'ㄹ'; return; }
          if (x === 'm') { prev.t = 'ㅁ'; return; }
          if (x === 'n') { prev.t = after === 'g' ? 'ㅇ' : 'ㄴ'; return; }
          if (x === 'k' && after !== 'l' && after !== 'r') { prev.t = 'ㄱ'; return; }
          if (x === 'p' && after !== 'l' && after !== 'r') { prev.t = 'ㅂ'; return; }
        }
        if (x === 'y') S.push({ c: 'ㅇ', v: 'ㅣ' });
        else if (x === 'sh') S.push({ c: 'ㅅ', v: 'ㅣ' });
        else if (x === 'w') S.push({ c: 'ㅇ', v: 'ㅜ' });
        else S.push({ c: ON[x] || 'ㅇ', v: 'ㅡ' });
      });
    };
    for (const p of ps) {
      if (!VOW[p]) { pend.push(p); continue; }
      let glide = null, onset = null;
      if (pend.length && (pend[pend.length - 1] === 'y' || pend[pend.length - 1] === 'w')) glide = pend.pop();
      else if (pend.length) onset = pend.pop();
      settle(pend, onset || glide);
      pend = [];
      const prev = S[S.length - 1];
      if (onset === 'l' && prev && !prev.t) prev.t = 'ㄹ';   // 모음 사이·자음 뒤 l 은 ㄹㄹ
      const v = onset === 'kw' ? WV[p] : onset === 'sh' || glide === 'y' ? YV[p] : glide === 'w' ? WV[p] : VOW[p];
      S.push({ c: onset ? ON[onset] : 'ㅇ', v, real: true });
    }
    settle(pend, null);
    return S.map((x) => syl(x.c, x.v, x.t)).join('');
  }
  /* 낱말 하나(로마자) → 한글. part: 'first'(첫 조각=접두사 자리) | 'suffix' | '' */
  function ko(token, part, lang) {
    const t = token.toLowerCase();
    if (part === 'suffix' && AFFIX['-' + t.replace(/^-/, '')]) return AFFIX['-' + t.replace(/^-/, '')];
    if (/^-/.test(t) && AFFIX[t]) return AFFIX[t];
    if (/-$/.test(t) && AFFIX[t.slice(0, -1)]) return AFFIX[t.slice(0, -1)];
    if (part === 'prefix' && AFFIX[t]) return AFFIX[t];
    if (FOREIGN[t]) return FOREIGN[t];
    if (EN[t] && !(lang && !/영어/.test(lang))) return EN[t];
    if (AFFIX[t] && t.length <= 3 && !lang) return AFFIX[t];
    return latinKo(t);
  }
  const koText = (s) => s.replace(/[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]*/g, (m) => ko(m, ''));

  /* ── 어원 문자열 쪼개기 ── */
  function splitTop(s, seps) {   // 괄호 밖에서만 자른다. 반환: [조각, 구분자, 조각, …]
    const out = []; let depth = 0, cur = '';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '(') depth++; else if (c === ')') depth--;
      if (!depth) {
        const sep = seps.find((x) => s.startsWith(x, i));
        if (sep) { out.push(cur, sep); cur = ''; i += sep.length - 1; continue; }
      }
      cur += c;
    }
    out.push(cur);
    return out;
  }
  const LANG = /^((?:고대 북부 |중세 저지 |고대 |중세 |옛 |저지 )?(?:영어|프랑스어|노르드어|네덜란드어|독일어|라틴어|그리스어|이탈리아어|아랍어|스칸디나비아어|게르만어)(?: 계통)?|고대영어)\s*/;
  const LANG_ONLY = /^(?:고대 북부 |중세 저지 |고대 |중세 |옛 |저지 )?(?:영어|프랑스어|노르드어|네덜란드어|독일어|라틴어|그리스어|이탈리아어|아랍어|스칸디나비아어|게르만어)$/;
  const ROMAN = /^[A-Za-z\u00C0-\u024F-][A-Za-z\u00C0-\u024F'-]*(?:\s+[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]*)*/;
  const cleanKo = (s) => s.replace(/~/g, '').replace(/·/g, ', ').replace(/\s+/g, ' ').trim();
  // '~에'처럼 조사만 남는 뜻은 말로 읽으면 끊기므로 뜻이 같은 말로
  const MEAN = { '~에': '향해', '~쪽으로': '향해', '~로': '향해', '~에게': '향해', '~에서': '떨어져', '~로부터': '떨어져', '~쪽에': '곁에', '~옆에': '옆에', '~위에': '위에', '~에 대해': '대하여', '~를 위해': '위해', '~에 따라': '따라' };
  const cleanMean = (s) => cleanKo(MEAN[s.trim()] || s);
  const EMPH = /^강조(의 뜻)?$/;
  const WORD_STEP = /^([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]*(?:\s+[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]*)*)\s*(?:\(([^()]*)\))?$/;
  /* 조각 하나: [언어] 로마자어근 [(뜻 / 언어: 뜻 / 뜻, 하위어근 뜻)] [뒤붙은 말] */
  function parsePart(raw, idx, n) {
    let s = raw.trim(), lang = '';
    const lm = s.match(LANG); if (lm) { lang = lm[1].replace('고대영어', '고대 영어'); s = s.slice(lm[0].length); }
    const rm = s.match(ROMAN); if (!rm) return null;
    const rootTxt = rm[0].trim(); s = s.slice(rm[0].length).trim();
    let inner = '', tail = '';
    if (s.startsWith('(')) { const j = s.indexOf(')'); inner = s.slice(1, j); tail = s.slice(j + 1).trim(); } else tail = s;
    const im = inner.match(/^([가-힣\s]+?어):\s*/); if (im) { lang = lang || im[1]; inner = inner.slice(im[0].length); }
    const isSuffix = /^-/.test(rootTxt) || (idx > 0 && !!AFFIX['-' + rootTxt.toLowerCase()] && (idx === n - 1 || !s.startsWith('(')));
    const pos = isSuffix ? 'suffix' : idx === 0 && n > 1 ? 'prefix' : '';
    const pron = rootTxt.split(/\s+/).map((w) => ko(w.replace(/^-/, isSuffix ? '-' : ''), pos, lang)).join(' ');
    const means = [], subs = [], notes = [];
    for (const it of splitTop(inner, [', ']).filter((_, i) => i % 2 === 0).map((x) => x.trim()).filter(Boolean)) {
      if (LANG_ONLY.test(it)) { lang = lang || it; continue; }   // '(풀밭을 찾아 떠도는, 그리스어)'
      if (/^[A-Za-z]+$/.test(it)) { if (!AFFIX[it.toLowerCase()]) notes.push(ko(it, '') + '에서 나온 말'); continue; }   // 'ir(in, 안으로)', 'placitum(…, placere)'
      const lg = it.match(LANG), rest = lg ? it.slice(lg[0].length).trim() : '';
      if (lg && rest && (rest.match(ROMAN) || [''])[0].trim() === rest) {   // '고대 영어 healdan' → '고대 영어 헤알단에서 왔어요'
        notes.push(lg[1] + ' ' + rest.split(/\s+/).map((w) => ko(w, '')).join(' ') + '에서 왔어요');
        continue;
      }
      // 'stare 서다', 're 다시 + surgere 솟다' 처럼 괄호 안의 하위 어근
      const sp = splitTop(it, [' + ']).filter((_, i) => i % 2 === 0).map((x) => x.trim().match(/^([A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'-]*)\s+([가-힣].*)$/));
      if (sp.every(Boolean)) sp.forEach((sm) => subs.push({ pron: ko(sm[1], AFFIX[sm[1].toLowerCase()] ? 'prefix' : ''), m: cleanMean(sm[2]) }));
      else if (/^[A-Za-z]/.test(it)) notes.push(koText(it));
      else means.push(cleanMean(it));
    }
    // 뒤붙은 말: '…(아래의)의 비교급' → '인페루스의 비교급'
    tail = tail ? koText(cleanKo(tail)) : '';
    if (/^(의|와|과|에서)\s/.test(tail)) tail = pron + tail;
    return { lang, pron, m: means.join(', '), subs, notes, tail, suffix: isSuffix, attach: idx > 0 && !inner && !tail };
  }

  /* 끝말 종류: 다(서술) · 관형(는/ㄴ/의) · 그 밖(명사·부사) */
  const ADN = new Set('는 은 운 한 된 던 인 진 얀 른 친 픈 큰 찬 낸 빈 힌 든 찐 린 긴 쁜 쓴 둔 푼 춘 란 난 간 선 언 먼 의 단 만 깐 낀 랜 넨 딘 띤 렌 뀐 뗀 맨 문 쥔 친 핀 갠 갠'.split(' '));
  const NOUNISH = new Set(['교수진', '착란', '장난', '공간', '인간', '시간', '기간', '자신', '사람인', '자연', '정신', '전진', '노인', '원인', '부인', '주인', '산', '돈', '손', '눈', '신', '선', '판', '반', '관', '안', '땅', '문', '분', '면']);
  const ADN1 = new Set('빈 찬 낸 큰 쓴 긴 짠 든 된 친 흰 센 둔 준 쥔'.split(' '));   // 한 글자 관형형('속이 빈', '가득 찬')
  function endKind(x) {
    const t = x.replace(/[\s.,!?)]+$/, ''), c = t.slice(-1), w = t.split(' ').pop();
    if (c === '다') return 'da';
    if (c === '의' || c === '는' || c === '던') return 'adn';
    if (ADN.has(c) && hasBatchim(c) && !NOUNISH.has(w) && (w.length >= 2 || ADN1.has(w))) return 'adn';
    return 'noun';
  }
  function becomes(x) {   // '… 뜻이 됐어요' 꼴
    const k = endKind(x);
    if (k === 'da') return x + '라는 뜻이 됐어요';
    if (k === 'adn') return x + ' 거라는 뜻이 됐어요';
    return quote(x) + ' 뜻이 됐어요';
  }
  const isNote = (x) => /[A-Za-z]/.test(x) || /(형용사형|명사형|동사형|부사형|분사형?|비교급|최상급|같은 뿌리|줄임말|에서 온 말|옛 형태|옛말)$/.test(x);
  function noteSentence(x) {   // 참고 문장: '스페이스의 형용사형이에요.'
    const t = koText(cleanKo(x)).replace(/\s*\([^()]*\)/g, '').replace(/[.\s]+$/, '');
    if (/^(어원|기원)(은)? 불확실$/.test(t)) return t.replace(/(은)? 불확실$/, '은 확실하지 않아요') + '.';
    if (/불확실$/.test(t)) return t + '해요.';
    if (/관련$/.test(t)) return t + ' 있는 말이에요.';
    if (/반대$/.test(t)) return t.replace(/(의)? 반대$/, '의 반대말') + '이에요.';
    if (/[가-힣]+(다|요)$/.test(t)) return t + '.';
    return copula(t) + '.';
  }

  function etyTalk(e) {
    if (!e) return '';
    if (SAY[e]) return SAY[e];
    const segs = splitTop(e.trim().replace(/[ʿʾ’]/g, ''), [' → ', ' ← ']);
    const head = segs[0];
    // ← : 'A(뜻) ← B(뜻)' 는 'A … B 에서 왔어요'
    let from = null, k = 1;
    let kin = null;
    if (segs[1] === ' ← ') { if (/(와|과) 같은 뿌리$/.test(segs[2])) kin = segs[2].replace(/(와|과) 같은 뿌리$/, ''); else from = segs[2]; k = 3; }
    const chain = [];
    for (; k < segs.length; k += 2) chain.push(segs[k + 1]);

    // 머리(첫 화살표 앞): 괄호 밖 쉼표로 나뉜 덩어리마다 '어근 + 어근' 이거나 참고 말
    const parts = [], early = [], late = [];
    for (const item of splitTop(head, [', ']).filter((_, i) => i % 2 === 0)) {
      const pieces = splitTop(item, [' + ']).filter((_, i) => i % 2 === 0);
      const ps = pieces.map((p, i) => parsePart(p, i, pieces.length));
      if (ps.some((p) => !p)) { if (!parts.length) return fallback(e); late.push(item); continue; }
      if (parts.length && ps.length === 1 && !ps[0].m && !ps[0].subs.length && ps[0].tail) { late.push(ps[0].tail); continue; }
      parts.push(...ps);
    }

    const out = [];
    // 1) 구성: '리는 다시, 비데레는 보다'
    const clauses = [], sfx = [];
    for (const p of parts) {
      const name = (p.lang ? p.lang + ' ' : '') + p.pron;
      late.push(...p.notes);
      if (p.tail) early.push(p.tail);
      if ((p.suffix || p.attach) && !p.m && !p.subs.length) { sfx.push(p.pron); continue; }
      if (p.m) clauses.push(EMPH.test(p.m) ? topic(name) + ' 강조하는 말' : topic(name) + ' ' + p.m);
      else clauses.push(name);
      p.subs.forEach((s) => clauses.push(topic(s.pron) + ' ' + s.m));
    }
    const notes = late;
    let first = clauses.join(', ');
    if (from) {   // '… 인데, ~라는 뜻의 B에서 왔어요'
      const fp = splitTop(from, [' + ']).filter((_, i) => i % 2 === 0).map((p, i, a) => parsePart(p, i, a.length));
      if (fp.some((p) => !p)) return fallback(e);
      const src = fp.map((p) => (p.m ? quote(p.m) + ' 뜻의 ' : '') + (p.lang ? p.lang + ' ' : '') + p.pron).join(', ');
      const lastM = parts[parts.length - 1].m;
      first = lastM && !EMPH.test(lastM) ? first.slice(0, first.length - lastM.length) + quote(lastM) + ' 뜻인데, ' + src + '에서 왔어요' : topic(first) + ' ' + src + '에서 왔어요';
      out.push(first + '.');
    }
    // 2) 뜻의 변화: 낱말 단계('patron(보호자)', 'money')와 뜻 단계, 참고 말('space의 형용사형')로 나눈다
    const steps = [], chainNotes = [];
    for (let x of chain.map((s) => s.trim())) {
      const wm = x.match(WORD_STEP);
      if (wm) { steps.push({ word: wm[1].split(/\s+/).map((w) => ko(w, '')).join(' '), m: wm[2] ? cleanMean(wm[2]) : '' }); continue; }
      const pm = x.match(/\s*\(([^()]*)\)\s*$/);
      if (pm && !/[A-Za-z]/.test(pm[1])) x = x.slice(0, pm.index).trim() + ', 곧 ' + pm[1];
      else if (pm) { notes.push(/^[A-Za-z\s,-]+$/.test(pm[1]) ? withP(koText(pm[1])) + ' 같은 뿌리' : pm[1]); x = x.slice(0, pm.index).trim(); }
      if (isNote(x)) { chainNotes.push(x); continue; }
      steps.push({ text: koText(cleanKo(x.replace(/~쪽으로/g, '어느 쪽으로').replace(/ \/ /g, ', 또는 ').replace(/\(([^()A-Za-z]+)\)/g, ', 곧 $1'))) });
    }
    if (!from) {
      const lp = parts.filter((p) => !(p.suffix && !p.m)).pop() || parts[0], lastM = lp.subs.length ? lp.subs[lp.subs.length - 1].m : lp.m || '';
      const gt = parts.length === 1 && parts[0].m && !parts[0].subs.length && early.length === 1 && early[0].startsWith(parts[0].pron + '의 ');
      if (gt) { out.push(copula(quote(parts[0].m) + ' 뜻의 ' + (parts[0].lang ? parts[0].lang + ' ' : '') + early[0]) + '.'); early.length = 0; }
      else if (steps.length) out.push(first + '.');
      else if (!gt && !lastM && parts.length === 1 && !lp.subs.length && !sfx.length) {   // '중세 영어 snacchen, 어원 불확실'
        const i = notes.findIndex((x) => /^어원 불확실$/.test(x.trim()));
        if (i >= 0) { notes.splice(i, 1); out.push(first + '에서 왔는데, 어원은 확실하지 않아요.'); } else out.push(first + '에서 왔어요.');
      } else if (!gt) out.push(lastM && !EMPH.test(lastM) && clauses.length ? quote(first) + ' 뜻이에요.' : first + '.');
    }
    early.forEach((x) => out.push(noteSentence(x)));
    if (kin) {   // 'rust ← read(붉은)와 같은 뿌리' → '붉은이라는 뜻의 레드와 같은 뿌리예요.'
      const kp = parsePart(kin, 1, 2);
      out.push(kp ? withP((kp.m ? quote(kp.m) + ' 뜻의 ' : '') + kp.pron) + ' 같은 뿌리예요.' : noteSentence(kin + '와 같은 뿌리'));
    }
    if (sfx.length) {
      const s = sfx.join(', ');
      out.push(steps.length ? '여기에 ' + subj(s) + ' 붙어서,' : '여기에 ' + subj(s) + ' 붙은 말이에요.');
    }
    if (steps.length) {
      const mid = (s) => s.text || (s.m ? quote(s.m) + ' 뜻의 ' : '') + subj(s.word) + ' 되고';
      const lastStep = steps[steps.length - 1];
      if (steps.length === 1 && lastStep.word && !lastStep.m) out.push('여기서 ' + quote(lastStep.word) + ' 말이 나왔어요.');
      else {
        const end = lastStep.text ? becomes(lastStep.text) : (lastStep.m ? quote(lastStep.m) + ' 뜻의 ' : '') + subj(lastStep.word) + ' 됐어요';
        const body = steps.length === 1 ? end : steps.slice(0, -1).map(mid).join(', ') + ', 나중에는 ' + end;
        out.push((sfx.length ? '' : '그래서 ') + body + '.');
      }
    }
    chainNotes.forEach((x) => out.push(noteSentence(x)));
    notes.forEach((x) => out.push(noteSentence(x)));
    return out.join(' ').replace(/\s+/g, ' ').replace(/ ,/g, ',').trim();
  }
  function fallback(e) {   // 구조를 못 읽으면: 로마자만 한글로, 기호는 쉼표·마침표로
    return koText(cleanKo(e)).replace(/\s*\(([^()]*)\)/g, ', $1').replace(/\s*[+/]\s*/g, ', ').replace(/\s*[→←↔—]\s*/g, '. ').replace(/,\s*\./g, '.').trim() + '.';
  }

  /* 규칙으로 어색한 것은 통째로 */
  const SAY = {
    '고대영어 furthor, forth(앞으로)의 비교급 → 더 앞으로': '고대 영어 푸르토르에서 왔어요. 앞으로라는 뜻의 포스의 비교급이에요. 그래서 더 앞으로라는 뜻이 됐어요.',
    '프랑스어 avaler(아래로 내려가다, à val 골짜기로)': '프랑스어 아발레는 아래로 내려가다라는 뜻이에요. 아 발, 곧 골짜기로 내려간다는 말에서 왔어요.',
    'Mars(로마의 전쟁 신) → martial arts 무술': '마르스는 로마의 전쟁 신이에요. 그래서 싸움에 관한이라는 뜻이 됐고, 마셜 아츠라고 하면 무술이에요.',
    'sancire(신성하게 하다, 승인하다) → 허가도 되고 처벌도 되는 반대말 겸용 단어': '산키레는 신성하게 하다, 승인하다라는 뜻이에요. 그래서 허가라는 뜻도, 처벌이라는 뜻도 함께 가진 단어가 됐어요.',
    'physis(자연) + logia(학문) → 몸이 작동하는 이치를 연구': '피시스는 자연, 로기아는 학문. 그래서 몸이 작동하는 이치를 연구하는 학문이라는 뜻이 됐어요.',
    'tener(부드러운) / tendere(내밀다) → 내밀다 → 제출하다. 서로 다른 뿌리가 한 철자': '부드러운이라는 뜻은 테네르에서, 내밀다라는 뜻은 텐데레에서 왔어요. 내밀다에서 제출하다라는 뜻이 됐고요. 서로 다른 두 뿌리가 한 철자가 된 거예요.',
    'tener(부드러운) / tendere(내밀다) → 내밀다 → 제출하다': '부드러운이라는 뜻은 테네르에서, 내밀다라는 뜻은 텐데레에서 왔어요. 그래서 내밀다, 나중에는 제출하다라는 뜻이 됐어요.',
    'un(아닌) + encumber(en 안에 + 프랑스어 combre 장애물) → 장애물이 없는': '언은 아닌이라는 뜻이에요. 인컴버는 엔과 프랑스어 콩브르가 합쳐진 말인데, 엔은 안에, 콩브르는 장애물이에요. 그래서 장애물이 없는 거라는 뜻이 됐어요.',
    'pre(미리) + sumere(취하다) → 미리 그렇다고 받아들이다 + able': '프리는 미리, 수메레는 취하다. 그래서 미리 그렇다고 받아들이다라는 뜻이 됐고, 여기에 에이블이 붙은 말이에요.',
    'in(아닌) + competent(com 함께 + petere 구하다 → 알맞은) → 맞는 능력이 없는': '인은 아닌이라는 뜻이에요. 컴피턴트는 알맞은이라는 말인데, 컴은 함께, 페테레는 구하다예요. 그래서 맞는 능력이 없는 거라는 뜻이 됐어요.',
    'dis(반대) + obedience(ob 쪽으로 + audire 듣다) → 귀 기울이지 않음': '디스는 반대라는 뜻이에요. 오비디언스는 귀를 기울여 듣는다는 말인데, 옵은 향해, 아우디레는 듣다예요. 그래서 귀 기울이지 않음이라는 뜻이 됐어요.',
    'licere(허락되다) → leisure(자유 시간) + ly → 서두르지 않는': '리케레는 허락되다. 그래서 자유 시간이라는 뜻의 레저가 되고, 여기에 리가 붙어서 서두르지 않는 거라는 뜻이 됐어요.',
    '뱀처럼 기어가듯 몰래 움직이다 (기원은 불확실)': '뱀처럼 기어가듯 몰래 움직인다는 말이에요. 기원은 확실하지 않아요.',
    'dis(따로) + ponere(놓다) → 따로따로 놓다 → (dispose of) 처리하다': '디스는 따로, 포네레는 놓다. 그래서 따로따로 놓다라는 뜻이 됐어요. 디스포즈 오브라고 하면 처리하다예요.',
    'vanus(빈, 헛된) → 속이 빈 (in vain: 헛되이)': '바누스는 빈, 헛된. 그래서 속이 빈 거라는 뜻이 됐어요. 인 베인이라고 하면 헛되이라는 뜻이에요.',
    '독일어 strolch(떠돌이)에서 왔다고 보는 설 → 어슬렁거리다': '떠돌이라는 뜻의 독일어 스트롤크에서 왔다는 설이 있어요. 그래서 어슬렁거리다라는 뜻이 됐어요.',
    '고대 노르드어 stifla(막다)에서 왔다고 보는 설 → 틀어막다': '막다라는 뜻의 고대 노르드어 스티플라에서 왔다는 설이 있어요. 그래서 틀어막다라는 뜻이 됐어요.',
    '중세 영어, 가볍게 떠는 모습을 나타내는 말 → 가볍게 떨다': '중세 영어에서 가볍게 떠는 모습을 나타내던 말이에요. 그래서 가볍게 떨다라는 뜻이 됐어요.',
    'con(함께) + scire(알다) → 양심(conscience) → 양심에 따라 꼼꼼한': '콘은 함께, 스키레는 알다. 그래서 양심, 곧 컨션스가 되고, 나중에는 양심에 따라 꼼꼼한 거라는 뜻이 됐어요.',
    '소리를 흉내 낸 말(쿵 부딪치는 소리)': '쿵 하고 부딪치는 소리를 흉내 낸 말이에요.',
    '고대 노르드어 krafla(긁다)와 관련된 말로 봄(어원 불확실)': '긁다라는 뜻의 고대 노르드어 크라플라와 관련된 말로 보지만, 어원은 확실하지 않아요.',
    'astonish와 같은 뿌리 → 천둥 맞은 듯 크게 놀라게 함': '어스토니시와 같은 뿌리예요. 그래서 천둥 맞은 듯 크게 놀라게 함이라는 뜻이 됐어요.',
    '고대 영어 sacu(소송, 이유) → for the sake of ~을 위해': '고대 영어 사쿠는 소송, 이유라는 뜻이에요. 그래서 포 더 세이크 오브라고 하면 무엇을 위해라는 뜻이 됐어요.',
    '공자(Confucius)의 가르침에 관한': '공자, 곧 컨퓨셔스의 가르침에 관한 말이에요.',
    '그리스어 hygieia(건강) ← 건강의 여신 Hygieia': '그리스어 히기에이아는 건강이라는 뜻인데, 건강의 여신 히기에이아에서 왔어요.',
    '독일어 halten(멈추다)가 군대 구호 Halt!로 들어옴': '멈추다라는 뜻의 독일어 할텐이 군대 구호 할트로 들어온 말이에요.',
    '18세기 스코틀랜드·북잉글랜드에서 퍼진 말, 어원 불확실': '18세기 스코틀랜드와 북잉글랜드에서 퍼진 말인데, 어원은 확실하지 않아요.',
    '19세기에 퍼진 구어, 어원 불확실': '19세기에 퍼진 구어인데, 어원은 확실하지 않아요.',
    '중세 영어에서 온 말, 어원 불확실': '중세 영어에서 온 말인데, 어원은 확실하지 않아요.',
    '16세기에 쓰이기 시작한 말, 어원 불확실': '16세기에 쓰이기 시작한 말인데, 어원은 확실하지 않아요.',
    '중세 영어, 고대 노르드어 계통, 어원 불확실': '중세 영어에서 온 고대 노르드어 계통의 말인데, 어원은 확실하지 않아요.',
    '울부짖는 소리를 흉내 낸 말, 고대 노르드어에서 들어옴': '울부짖는 소리를 흉내 낸 말로, 고대 노르드어에서 들어왔어요.',
    'in + plere(채우다) → 채워 완성하다 → 실행하다 / 쓰는 도구': '인에 채우다라는 뜻의 플레레가 붙은 말이에요. 그래서 채워 완성하다, 나중에는 실행하다라는 뜻이 됐고, 쓰는 도구라는 뜻도 생겼어요.',
    '고대 영어 rust ← read(붉은)와 같은 뿌리 → 붉은 것': '고대 영어 러스트는 붉은이라는 뜻의 레드와 같은 뿌리예요. 그래서 붉은 것이라는 뜻이 됐어요.',
    'flower와 같은 말 — 가루의 가장 좋은 부분(꽃)': '원래 플라워와 같은 말이에요. 가루에서 가장 좋은 부분, 곧 꽃이라는 뜻이었어요.',
    'censere(평가하다) → censor(검열관) + ship': '켄세레는 평가하다. 그래서 검열관이라는 뜻의 켄소르가 되고, 여기에 십이 붙은 말이에요.',
    '중세 영어 blunt, 어원 불확실 — 날이 무디다 → 말이 거침없다': '중세 영어 블런트에서 왔는데, 어원은 확실하지 않아요. 날이 무디다라는 뜻에서, 나중에는 말이 거침없다라는 뜻이 됐어요.',
    '이탈리아어 ballotta(작은 공) → 작은 공으로 투표하던 데서': '이탈리아어 발로타는 작은 공이라는 뜻이에요. 작은 공으로 투표하던 데서 나온 말이에요.',
    '고대 영어 biddan(요구하다)와 beodan(내놓다)이 합쳐진 말': '요구하다라는 뜻의 고대 영어 비단과 내놓다라는 뜻의 베오단이 합쳐진 말이에요.',
    're(강조) + 고대 프랑스어 joir(기뻐하다) ← joy': '리는 강조하는 말, 고대 프랑스어 주아르는 기뻐하다라는 뜻이에요. 조이와 같은 뿌리예요.',
    '우박은 고대 영어 hagol(우박), 환호하다는 고대 노르드어 heill(건강)에서 — 서로 다른 뿌리': '우박이라는 뜻은 고대 영어 하골, 곧 우박에서 왔고, 환호하다라는 뜻은 고대 노르드어 헤일, 곧 건강에서 왔어요. 서로 다른 뿌리예요.',
    'extrinsecus(밖에서) ↔ intrinsic(내적인)': '엑스트린세쿠스는 밖에서라는 뜻이에요. 반대말은 내적인이라는 뜻의 인트린식이에요.',
    '그리스어 phrēn(마음·정신, 원래는 횡격막) → phrenitis(뇌염, 정신착란) → phrenitikos → 라틴어 phreneticus → 고대 프랑스어 frenetique → 중세 영어 frentik → 정신이 나간 듯 날뛰는 (frenzy·frenetic·schizophrenia의 -phren-과 같은 뿌리)': '그리스어 프렌은 마음, 정신이라는 뜻이에요. 원래는 횡격막을 가리켰어요. 여기서 뇌염, 정신착란이라는 뜻의 프레니티스가 나왔고, 라틴어와 고대 프랑스어, 중세 영어를 거치면서 정신이 나간 듯 날뛰는 거라는 뜻이 됐어요. 프렌지, 프러네틱, 스키조프레니아의 프렌과 같은 뿌리예요.',
    '고대 프랑스어 estout(강한, 용감한) ← 게르만어': '고대 프랑스어 에스투는 강한, 용감한이라는 뜻인데, 게르만어에서 왔어요.',
    '중세 영어 tangilen, 스칸디나비아어 계통 → 얽히다': '중세 영어 탕길렌에서 왔는데, 스칸디나비아어 계통이에요. 그래서 얽히다라는 뜻이 됐어요.',
    'out(밖)의 비교급 → 입 밖으로 내놓다 / 완전히 밖에 있는 → 완전한': '밖이라는 뜻의 아웃의 비교급이에요. 그래서 입 밖으로 내놓다라는 뜻이 되고, 또 완전히 밖에 있는, 곧 완전한이라는 뜻도 됐어요.',
  };

  root.etyTalk = etyTalk;
  root.etyTalkParts = { latinKo, ko, endKind, SAY };
})(typeof window !== 'undefined' ? window : globalThis);
