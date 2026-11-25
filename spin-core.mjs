export function randomInteger(limit, cryptoProvider = globalThis.crypto) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 2 ** 32) {
    throw new RangeError('Jumlah pilihan tidak valid.');
  }
  const values = new Uint32Array(1);
  const ceiling = Math.floor(2 ** 32 / limit) * limit;
  do {
    cryptoProvider.getRandomValues(values);
  } while (values[0] >= ceiling);
  return values[0] % limit;
}

export function createSession(prizes) {
  if (!Array.isArray(prizes) || prizes.length < 2 || prizes.length > 10) {
    throw new Error('Isi 2 sampai 10 jenis hadiah.');
  }
  const ids = new Set();
  for (const prize of prizes) {
    if (typeof prize.id !== 'string' || !prize.id || ids.has(prize.id)) {
      throw new Error('Setiap hadiah harus memiliki ID yang berbeda.');
    }
    if (typeof prize.label !== 'string' || !prize.label.trim() || prize.label.trim().length > 28) {
      throw new Error('Nama hadiah harus berisi 1 sampai 28 karakter.');
    }
    if (!Number.isSafeInteger(prize.quantity) || prize.quantity < 0 || prize.quantity > 9999) {
      throw new Error('Stok hadiah harus berupa angka bulat antara 0 dan 9999.');
    }
    ids.add(prize.id);
  }
  return {
    version: 1,
    prizes: prizes.map(prize => ({ id: prize.id, label: prize.label.trim(), quantity: prize.quantity })),
    history: [],
    pending: null,
  };
}

export function reserveSpin(session, pick = randomInteger, timestamp = new Date().toISOString()) {
  if (session.pending) throw new Error('Selesaikan giliran sebelumnya dulu.');
  const available = session.prizes.filter(prize => prize.quantity > 0);
  if (!available.length) throw new Error('Semua hadiah sudah habis.');
  const index = pick(available.length);
  if (!Number.isInteger(index) || index < 0 || index >= available.length) {
    throw new Error('Hasil undian tidak valid. Coba lagi.');
  }
  const winner = available[index];
  const result = { number: session.history.length + 1, prizeId: winner.id, label: winner.label, timestamp };
  return {
    ...session,
    prizes: session.prizes.map(prize => prize.id === winner.id ? { ...prize, quantity: prize.quantity - 1 } : { ...prize }),
    history: [...session.history, result],
    pending: result,
  };
}

export function nextVisitor(session) {
  return { ...session, pending: null };
}

export function targetRotation(index, count, previous = 0, turns = 6) {
  if (!Number.isInteger(index) || !Number.isInteger(count) || count < 1 || index < 0 || index >= count) {
    throw new RangeError('Posisi roda tidak valid.');
  }
  const center = (index + 0.5) * (360 / count);
  const target = (360 - center) % 360;
  const current = ((previous % 360) + 360) % 360;
  return previous + turns * 360 + ((target - current + 360) % 360);
}

export function restoreSession(text) {
  const session = JSON.parse(text);
  if (!session || session.version !== 1) throw new Error('Format data undian tidak dikenali.');
  createSession(session.prizes);
  if (!Array.isArray(session.history)) throw new Error('Riwayat undian tidak valid.');
  for (const [index, result] of session.history.entries()) {
    if (result.number !== index + 1 || typeof result.label !== 'string' || typeof result.timestamp !== 'string' || !session.prizes.some(prize => prize.id === result.prizeId)) {
      throw new Error('Riwayat undian tidak valid.');
    }
  }
  if (session.pending !== null && (!session.history.length || JSON.stringify(session.pending) !== JSON.stringify(session.history.at(-1)))) {
    throw new Error('Giliran terakhir tidak valid.');
  }
  return session;
}
