// ─── Tabelas de chaves (idênticas ao ASP original) ──────────────────────
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

// ─── Algoritmo idêntico ao ASP original ─────────────────────────────────
function calcToken(portaria) {
  const minuto = new Date().getMinutes();
  const CASA1 = minuto < 10 ? parseInt("1" + minuto) : minuto;
  const CASA2 = minuto % 10;
  const CASA3 = CASA1 + 1;
  const key = KEYS[portaria];
  return key[CASA1] + key[CASA2] + key[CASA3];
}

// ─── Estado ─────────────────────────────────────────────────────────────
let portaria = null;
let lastMinute = -1;

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

  // Relógio
  document.getElementById('clock').textContent =
    String(now.getHours()).padStart(2,'0') + ':' +
    String(minuto).padStart(2,'0') + ':' +
    String(segundo).padStart(2,'0');

  // Barra de progresso — esvazia de 100% até 0% ao longo do minuto
  const bar = document.getElementById('progress-bar');
  const restante = ((60 - segundo) / 60) * 100;
  if (segundo === 0) {
    // reseta sem animar para voltar a 100% instantaneamente
    bar.classList.remove('animate');
    bar.style.width = '100%';
    // força reflow e religa a transição
    void bar.offsetWidth;
    bar.classList.add('animate');
  } else {
    bar.classList.add('animate');
    bar.style.width = restante + '%';
  }

  // Atualiza token só quando o minuto muda
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

// ─── Init ───────────────────────────────────────────────────────────────
(function init() {
  const p = parseInt(new URLSearchParams(window.location.search).get('portaria'));
  if (p === 1 || p === 2 || p === 3) {
    portaria = p;
    startDisplay();
  } else {
    document.getElementById('selector').style.display = 'flex';
  }
})();
