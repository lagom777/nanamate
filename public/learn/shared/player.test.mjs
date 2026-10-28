/* 그림 재생기 장면 정의 검증 — node --test public/learn/shared/player.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function load(name) {
  const window = {};
  vm.runInContext(readFileSync(new URL('./' + name, import.meta.url), 'utf8'), vm.createContext({ window }));
  return window.NM_PLAYERS;
}
const phon = load('players/phon.js').phon;
const diff = load('players/diff.js').diff;

test('음절 조합: 첫소리 ㅇ 은 칸이 없고 겹받침도 묶인다', () => {
  const { compose, syllables, parse } = phon.lib;
  assert.equal(compose(['ㄱ', 'ㅜ', 'ㄱ']), '국');
  assert.equal(compose(['ㅣ']), '이');
  assert.equal(compose(['ㅣ', 'ㅍ']), '잎');
  assert.equal(compose(['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ']), '닭');
  const p = parse('ㄱㅜㄱ|ㅁㅜㄹ');
  assert.equal(syllables(p.seq, p.groups), '국물');
});

test('음운 변동: 칸 조작을 따라가면 표준 발음이 나온다', () => {
  const { syllables, parse } = phon.lib;
  const want = { nasal: '국물', liquid: '신라', palatal: '같이', tense: '국밥', cluster: '닭', hdrop: '좋아', nadd: '솜이불', aspir: '좋고', multi: '꽃잎', counter: '국이' };
  for (const sc of phon.scenes) {
    if (sc.intro) continue;
    const p = parse(sc.word);
    assert.equal(syllables(p.seq, p.groups), want[sc.id], sc.id + ' 표기');
    assert.equal(syllables(sc.final.seq, sc.final.groups), sc.say, sc.id + ' 발음');
    assert.equal(sc.final.groups.reduce((a, b) => a + b, 0), sc.final.seq.length, sc.id + ' 묶음 합');
    for (const st of sc.steps) {
      if (st.to) assert.ok(parse(st.to).seq.length > 0);
    }
  }
});

test('음운 변동: 이름과 개수 변화가 맞는다', () => {
  const delta = { 교체: 0, 탈락: -1, 첨가: 1, 축약: -1 };
  for (const sc of phon.scenes) {
    if (sc.intro) continue;
    const n0 = phon.lib.parse(sc.word).seq.length;
    const exp = sc.steps.reduce((a, st) => a + (st.kind ? delta[st.kind] : 0), 0);
    assert.equal(sc.final.seq.length - n0, exp, sc.id);
    const res = sc.beats[sc.beats.length - 1];
    assert.equal(res.k, 'res');
    assert.equal(res.chain[res.chain.length - 1].v, '[' + sc.say + ']');
    assert.ok(res.sylText.join('') === sc.say, sc.id + ' 결과 음절');
  }
});

test('박자는 시간순이고 장면 길이 안에 들어간다', () => {
  for (const def of [phon, diff]) {
    const total = def.scenes.reduce((a, s) => a + s.dur, 0);
    assert.ok(total >= 50 && total <= 120, def.title + ' ' + total);
    for (const sc of def.scenes) {
      assert.ok(sc.text && sc.text.length > 8, sc.id + ' text');
      sc.beats.forEach((b, i) => {
        if (i) assert.ok(b.t > sc.beats[i - 1].t, sc.id + ' 박자 순서');
        assert.ok(b.t < sc.dur - 2, sc.id + ' 마지막 박자 뒤 읽을 시간');
      });
    }
  }
});

test('선지 대조: 핵심어가 선지와 맞는 지문 문장에 있다', () => {
  const { plain, parse } = diff.lib;
  for (const sc of diff.scenes) {
    if (sc.intro) { assert.equal(sc.steps.length, 4); continue; }
    assert.ok(plain(sc.opt).includes(sc.key), sc.id + ' 선지 핵심어');
    assert.ok(plain(sc.pass[sc.hit]).includes(sc.key), sc.id + ' 지문 핵심어');
    sc.pass.slice(0, sc.hit).forEach((s) => assert.ok(!plain(s).includes(sc.key), sc.id + ' 앞 문장에서 먼저 멈추지 않음'));
    assert.ok(parse(sc.opt).some((x) => x.m), sc.id + ' 선지에 바뀐 곳 표시');
    assert.equal(typeof sc.ok, 'boolean');
  }
  assert.ok(diff.scenes.some((s) => s.ok === true), '맞는 선지(○) 예도 하나');
});
