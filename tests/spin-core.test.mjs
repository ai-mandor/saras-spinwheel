import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, nextVisitor, randomInteger, reserveSpin, restoreSession, targetRotation } from '../spin-core.mjs';

const prizes = [
  { id: 'a', label: 'Hadiah contoh A', quantity: 1 },
  { id: 'b', label: 'Hadiah contoh B', quantity: 2 },
  { id: 'c', label: 'Hadiah contoh C', quantity: 0 },
];

test('hadiah yang habis tidak ikut diundi dan stok tidak menjadi negatif', () => {
  let state = createSession(prizes);
  for (let i = 0; i < 3; i += 1) {
    state = nextVisitor(reserveSpin(state, () => 0));
  }
  assert.deepEqual(state.history.map(item => item.prizeId), ['a', 'b', 'b']);
  assert.ok(state.prizes.every(prize => prize.quantity === 0));
  assert.throws(() => reserveSpin(state), /habis/);
  assert.equal(prizes[0].quantity, 1);
});

test('hasil tetap sama sesudah refresh dan klik ganda tidak menghabiskan hadiah tambahan', () => {
  const state = reserveSpin(createSession(prizes), () => 1, '2026-11-25T12:00:00.000Z');
  const restored = restoreSession(JSON.stringify(state));
  assert.deepEqual(restored.pending, state.pending);
  assert.throws(() => reserveSpin(restored), /sebelumnya/);
  assert.equal(restored.prizes[1].quantity, 1);
  assert.equal(nextVisitor(restored).pending, null);
});

test('jarum berhenti pada segmen pemenang pada putaran berulang', () => {
  let previous = 0;
  for (let count = 2; count <= 10; count += 1) {
    for (let index = 0; index < count; index += 1) {
      const rotation = targetRotation(index, count, previous);
      assert.ok(rotation - previous >= 6 * 360);
      const pointedAngle = ((360 - rotation % 360) % 360);
      assert.equal(Math.floor(pointedAngle / (360 / count)), index);
      previous = rotation;
    }
  }
});

test('nilai acak di luar batas pembagian diulang agar peluang setiap pilihan sama', () => {
  let calls = 0;
  const fakeCrypto = { getRandomValues(values) { values[0] = calls++ === 0 ? 4294967295 : 4; } };
  assert.equal(randomInteger(3, fakeCrypto), 1);
  assert.equal(calls, 2);
});

test('konfigurasi dan data rusak ditolak', () => {
  assert.throws(() => createSession([{ ...prizes[0], quantity: -1 }, prizes[1]]), /Stok/);
  assert.throws(() => createSession([prizes[0], prizes[0]]), /ID/);
  assert.throws(() => restoreSession('{broken'));
  assert.throws(() => restoreSession(JSON.stringify({ ...createSession(prizes), pending: {} })), /terakhir/);
});
