/* 그림 엔진 계약과 figures 자료·그림 일치를 확인한다. DOM 없이 돈다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { Script, createContext } from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const figDir = resolve(dir, 'figures');
const dataDir = resolve(figDir, 'data');

function sandbox() {
  const box = { console };
  box.window = box;
  return box;
}

function run(box, file) {
  if (!box._ctx) box._ctx = createContext(box);
  new Script(readFileSync(file, 'utf8'), { filename: file }).runInContext(box._ctx);
}

function loadEngine() {
  const box = sandbox();
  run(box, resolve(dir, 'figure-explorer.js'));
  return box;
}

function jsFiles(folder) {
  return readdirSync(folder).filter((name) => name.endsWith('.js')).sort();
}

function loadAll() {
  const box = loadEngine();
  for (const name of jsFiles(dataDir)) run(box, resolve(dataDir, name));
  for (const name of jsFiles(figDir)) run(box, resolve(figDir, name));
  return box.NMFIG;
}

function viewList(def) {
  if (def.views && def.views.length) return def.views;
  return [{ id: 'main', label: '' }];
}

function defaultV(def) {
  const v = {};
  for (const c of def.controls || []) {
    if (c.type === 'range') v[c.id] = Number(c.value);
    else if (c.type === 'toggle') v[c.id] = !!c.value;
    else v[c.id] = c.value;
  }
  return v;
}

function collectParts(svg) {
  return [...svg.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]);
}

function pairedIds(api) {
  const ids = new Set([...Object.keys(api._defs), ...Object.keys(api._data)]);
  return [...ids].filter((fid) => api._defs[fid] && api._data[fid]).sort();
}

const engineSrc = readFileSync(resolve(dir, 'figure-explorer.js'), 'utf8');
const nm = loadAll();

test('엔진은 document 없이 로드된다', () => {
  const box = loadEngine();
  assert.equal(typeof box.NMFIG.define, 'function');
  assert.equal(typeof box.NMFIG.data, 'function');
  assert.equal(typeof box.NMFIG.mountAll, 'function');
  assert.equal(typeof box.NMFIG.mount, 'function');
  assert.deepEqual(Object.keys(box.NMFIG._defs), []);
  assert.deepEqual(Object.keys(box.NMFIG._data), []);
  assert.doesNotThrow(() => box.NMFIG.mountAll());
});

test('define과 data는 id로 저장한다', () => {
  const box = loadEngine();
  const def = { viewBox: [10, 10], render: function () { return ''; } };
  const data = { title: 't' };
  box.NMFIG.define('x', def);
  box.NMFIG.data('x', data);
  assert.equal(box.NMFIG._defs.x, def);
  assert.equal(box.NMFIG._data.x, data);
});

test('마운트 가드와 SVG만 innerHTML', () => {
  assert.ok(engineSrc.includes('data-fg-mounted'));
  assert.ok(engineSrc.includes('그림 자료를 불러오지 못했습니다.'));
  assert.ok(engineSrc.includes('typeof document'));
  assert.equal(engineSrc.split('innerHTML').length - 1, 1);
  assert.ok(engineSrc.includes('svg.innerHTML'));
});

test('한쪽만 있는 id는 검사에서 빠진다', () => {
  const box = loadEngine();
  box.NMFIG.data('only-data', { title: 'x' });
  box.NMFIG.define('only-def', { render: function () { return ''; } });
  box.NMFIG.define('both', { render: function () { return ''; } });
  box.NMFIG.data('both', { title: 'y' });
  assert.deepEqual(pairedIds(box.NMFIG), ['both']);
});

test('샘플 그림이 등록된다', () => {
  assert.ok(nm._defs.demo && nm._data.demo);
  assert.ok(nm._defs.demo2 && nm._data.demo2);
  assert.equal(typeof nm._defs.demo.update, 'function');
  assert.equal(nm._defs.demo2.update, undefined);
  assert.equal(nm._defs.demo2.live, true);
  assert.equal(nm._defs.demo.animate.control, 't');
  assert.equal(nm._defs.demo.views.length, 2);
  const steps = nm._data.demo.scenes[0].steps;
  assert.ok(steps.some((s) => s.set && s.view && s.part));
});

test('demo 얇은 선에 투명 히트 영역', () => {
  const html = nm._defs.demo.render(defaultV(nm._defs.demo), 'structure');
  assert.ok(/fill="transparent"/.test(html));
  assert.ok(/data-part="channel"/.test(html));
  assert.ok(/width="28"/.test(html));
});

test('demo2 render는 진폭을 반영한다', () => {
  const def = nm._defs.demo2;
  const v = defaultV(def);
  const low = def.render(Object.assign({}, v, { amp: 0.2 }), 'main');
  const high = def.render(Object.assign({}, v, { amp: 1 }), 'main');
  assert.equal(typeof low, 'string');
  assert.notEqual(low, high);
  assert.ok(/fill="transparent"/.test(low));
});

test('자료와 그림이 맞다', () => {
  const ids = pairedIds(nm);
  assert.ok(ids.length >= 1, '검사할 그림이 없다');
  for (const id of ids) {
    const data = nm._data[id];
    const def = nm._defs[id];
    assert.equal(typeof def.render, 'function', id + ' render');
    assert.ok(Array.isArray(def.viewBox) || typeof def.viewBox === 'string', id + ' viewBox');
    if (def.update != null) assert.equal(typeof def.update, 'function', id + ' update');

    const views = viewList(def);
    const viewIds = new Set(views.map((v) => v.id));
    for (const view of views) assert.ok(view.id, id + ' view id');

    const controlIds = new Set();
    for (const c of def.controls || []) {
      assert.ok(c.id, id + ' control id');
      assert.ok(!controlIds.has(c.id), id + ' control 중복 ' + c.id);
      controlIds.add(c.id);
      assert.ok(c.type === 'range' || c.type === 'choice' || c.type === 'toggle', id + ' ' + c.type);
      if (c.type === 'choice') assert.ok(Array.isArray(c.options) && c.options.length, id + ' ' + c.id);
      if (c.views) {
        for (const vid of c.views) assert.ok(viewIds.has(vid), id + ' control view ' + vid);
      }
    }
    /* animate 는 객체 하나 또는 객체 배열(보기마다 따로) */
    for (const an of [].concat(def.animate || [])) {
      assert.ok(controlIds.has(an.control), id + ' animate ' + an.control);
      const ctl = (def.controls || []).find((c) => c.id === an.control);
      assert.equal(ctl.type, 'range', id + ' animate');
      if (an.views) {
        for (const vid of an.views) assert.ok(viewIds.has(vid), id + ' animate view ' + vid);
      }
    }

    assert.ok(data.parts && typeof data.parts === 'object', id + ' parts');
    assert.ok(Array.isArray(data.order), id + ' order');
    for (const [key, p] of Object.entries(data.parts)) {
      assert.equal(typeof p.name, 'string', key);
      assert.ok(p.name.length > 0, key);
      assert.equal(typeof p.en, 'string', key);
      assert.ok(p.en.length > 0, key);
      assert.ok(p.level === 'core' || p.level === 'ref', key + ' level');
      assert.equal(typeof p.where, 'string', key);
      assert.ok(p.where.length > 0, key);
      assert.ok(p.etym && p.etym.ko && p.etym.en && p.etym.memo, key + ' etym');
      assert.ok(Array.isArray(p.role) && p.role.length >= 1, key + ' role');
      for (const line of p.role) assert.equal(typeof line, 'string', key);
      for (const lk of p.links || []) assert.ok(data.parts[lk], key + ' link ' + lk);
      if (p.view) assert.ok(viewIds.has(p.view), key + ' view ' + p.view);
    }
    for (const pid of data.order) assert.ok(data.parts[pid], id + ' order ' + pid);

    const seen = new Set();
    const v0 = defaultV(def);
    for (const view of views) {
      const html = def.render(v0, view.id);
      assert.equal(typeof html, 'string', id + ' ' + view.id);
      assert.ok(!/<svg[\s>]/i.test(html), id + ' ' + view.id + ' 루트 svg');
      assert.ok(!/<script/i.test(html), id + ' script');
      for (const pid of collectParts(html)) {
        assert.ok(data.parts[pid], id + ' 모르는 부위 ' + pid + ' @ ' + view.id);
        seen.add(pid);
      }
    }
    for (const pid of data.order) assert.ok(seen.has(pid), id + ' 보기에 없는 부위 ' + pid);

    for (const sc of data.scenes || []) {
      assert.ok(sc.id && sc.label, id + ' scene');
      assert.ok(Array.isArray(sc.steps) && sc.steps.length, id + ' steps');
      if (sc.view) assert.ok(viewIds.has(sc.view), id + ' scene view ' + sc.view);
      for (const step of sc.steps) {
        assert.equal(typeof step.text, 'string', id + ' step text');
        if (step.part) assert.ok(data.parts[step.part], id + ' step part ' + step.part);
        if (step.view) assert.ok(viewIds.has(step.view), id + ' step view ' + step.view);
        if (step.set != null) {
          assert.equal(typeof step.set, 'object', id);
          for (const key of Object.keys(step.set)) {
            assert.ok(controlIds.has(key), id + ' set ' + key);
          }
        }
      }
    }
  }
});
