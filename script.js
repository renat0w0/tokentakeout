const KEYS = {
  1: ["1","3","1","2","4","8","6","5","9","7",
      "3","5","8","1","9","1","2","0","7","0",
      "2","7","5","0","1","3","4","4","5","9",
      "5","4","3","7","0","7","6","7","6","7",
      "6","2","9","8","3","9","8","1","1","6",
      "8","1","3","0","2","0","5","9","0","1","3"],

  2: ["3","1","3","3","1","9","2","0","3","1",
      "4","2","0","4","3","7","2","9","6","2",
      "7","3","9","5","4","6","1","8","8","3",
      "2","5","8","6","6","5","7","7","2","5",
      "4","6","7","7","8","4","9","6","3","7",
      "9","7","6","8","0","3","0","5","4","9","1"],

  3: ["1","9","1","0","6","7","8","1","1","0",
      "0","7","5","0","2","3","6","4","0","2",
      "7","6","r","8","0","0","2","7","9","5",
      "5","4","3","6","4","6","7","9","7","6",
      "3","3","4","4","7","3","4","3","5","9",
      "2","2","7","2","2","8","5","5","2","0","0"],
};

(function setupFakeClock() {
  const fake = new URLSearchParams(location.search).get('fake');
  if (!fake) return;
  const m = fake.match(/^(?:(\d{4}-\d{2}-\d{2})[T ])?(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) { console.warn('fake inválido. Ex: ?fake=15:49:50 ou ?fake=2026-04-14T15:49:50'); return; }
  const [, dateStr, hh, mm, ss] = m;
  const base = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  base.setHours(+hh, +mm, ss ? +ss : 0, 0);
  const offset = base.getTime() - Date.now();
  const _D = Date;
  const Faked = function(...a) {
    if (!(this instanceof Faked)) return new _D(_D.now() + offset).toString();
    return a.length ? new _D(...a) : new _D(_D.now() + offset);
  };
  Faked.prototype = _D.prototype;
  Faked.now = () => _D.now() + offset;
  Faked.parse = _D.parse;
  Faked.UTC = _D.UTC;
  window.Date = Faked;
  console.log('[fake clock] base =', new Date().toString());
})();

function calcToken(portaria) {
  const minuto = new Date().getMinutes();
  const CASA1 = minuto < 10 ? parseInt("1" + minuto) : minuto;
  const CASA2 = minuto % 10;
  const CASA3 = CASA1 + 1;
  const key = KEYS[portaria];
  return key[CASA1] + key[CASA2] + key[CASA3];
}

let portaria = null;
let lastMinute = -1;
let lastStandbyMinute = -1;

function isTokenVisible(portaria, now) {
  const dow = now.getDay();
  if (dow === 0 || dow === 6) return false;

  const mins = now.getHours() * 60 + now.getMinutes();
  const inWindow = (start, end) => mins >= start && mins <= end;

  const manhaP1 = inWindow(12 * 60, 12 * 60 + 40);
  const manhaP23 = inWindow(12 * 60 + 10, 12 * 60 + 40);
  const tarde = inWindow(15 * 60 + 50, 16 * 60 + 20);

  const manha = portaria === 1 ? manhaP1 : manhaP23;
  const tt = dow === 2 || dow === 4;

  if (tt && portaria === 3) return manha;
  return manha || tarde;
}

function updateStandby(now) {
  const minuto = now.getMinutes();
  const el = document.getElementById('standby-clock');
  el.textContent =
    String(now.getHours()).padStart(2, '0') + ':' +
    String(minuto).padStart(2, '0');

  if (minuto !== lastStandbyMinute) {
    const top = 5 + Math.random() * 90;
    const left = 5 + Math.random() * 90;
    el.style.top = top + '%';
    el.style.left = left + '%';
    lastStandbyMinute = minuto;
  }
}

function selectPortaria(p) {
  portaria = p;
  const url = new URL(window.location.href);
  url.searchParams.set('portaria', p);
  window.history.replaceState({}, '', url);
  startDisplay();
}

function startDisplay() {
  document.getElementById('selector').style.display = 'none';
  document.getElementById('display').style.display = 'flex';
  document.getElementById('portaria-label').textContent = 'Portaria ' + portaria;
  tick();
  setInterval(tick, 1000);
}

function tick() {
  const now = new Date();
  const minuto = now.getMinutes();
  const segundo = now.getSeconds();

  const visible = isTokenVisible(portaria, now);
  document.getElementById('standby').style.display = visible ? 'none' : 'block';
  document.getElementById('display').style.display = visible ? 'flex' : 'none';

  if (!visible) {
    updateStandby(now);
    lastMinute = -1;
    return;
  }

  document.getElementById('clock').textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(minuto).padStart(2,'0') + ':' +
    String(segundo).padStart(2,'0');

  const bar = document.getElementById('progress-bar');
  const restante = ((60 - segundo) / 60) * 100;
  if (segundo === 0) {
    bar.classList.remove('animate');
    bar.style.width = '100%';
    void bar.offsetWidth;
    bar.classList.add('animate');
  } else {
    bar.classList.add('animate');
    bar.style.width = restante + '%';
  }

  if (minuto !== lastMinute) {
    const el = document.getElementById('token');
    el.classList.add('fade');
    setTimeout(() => {
      el.textContent = calcToken(portaria);
      el.classList.remove('fade');
    }, 250);
    lastMinute = minuto;
  }
}

(function init() {
  const p = parseInt(new URLSearchParams(window.location.search).get('portaria'));
  if (p === 1 || p === 2 || p === 3) {
    portaria = p;
    startDisplay();
  } else {
    document.getElementById('selector').style.display = 'flex';
  }
})();
