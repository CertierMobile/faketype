// MiniType - 10-word typing test
(() => {
  const WORD_COUNT = 10;
  const wordsEl = document.getElementById('words');
  const input = document.getElementById('input');
  const restartBtn = document.getElementById('restart');
  const stats = document.getElementById('stats');
  const timeEl = document.getElementById('time');
  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('acc');

  // small word bank — you can extend this
  const WORD_BANK = `
    time person year way day thing man world life hand part child eye woman place work week case point
    government company system program question work night water room mother area money story fact month lot
    right study book job word business issue side kind head house service friend family school state
  `.trim().split(/\s+/);

  let targetWords = [];
  let targetText = '';
  let startTime = null;
  let ended = false;

  function pickWords() {
    const copy = WORD_BANK.slice();
    const selected = [];
    for (let i = 0; i < WORD_COUNT; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      selected.push(copy.splice(idx, 1)[0]);
    }
    return selected;
  }

  function renderWords(words) {
    wordsEl.innerHTML = '';
    words.forEach((w, wi) => {
      const wspan = document.createElement('span');
      wspan.className = 'word';
      // create character spans for per-char coloring
      for (let i = 0; i < w.length; i++) {
        const cspan = document.createElement('span');
        cspan.className = 'char pending';
        cspan.textContent = w[i];
        wspan.appendChild(cspan);
      }
      // add a visual space character between words
      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'char pending';
        sp.textContent = ' ';
        wspan.appendChild(sp);
      }
      wordsEl.appendChild(wspan);
    });
  }

  function startNewTest() {
    targetWords = pickWords();
    targetText = targetWords.join(' ');
    renderWords(targetWords);
    input.value = '';
    startTime = null;
    ended = false;
    stats.hidden = true;
    timeEl.textContent = '0.00';
    wpmEl.textContent = '0';
    accEl.textContent = '0%';
    input.focus();
  }

  function countCorrectChars(typed) {
    let correct = 0;
    const len = Math.min(typed.length, targetText.length);
    for (let i = 0; i < len; i++) {
      if (typed[i] === targetText[i]) correct++;
    }
    return correct;
  }

  function updateVisuals(typed) {
    const chars = wordsEl.querySelectorAll('.char');
    for (let i = 0; i < chars.length; i++) {
      const span = chars[i];
      const expected = targetText[i] || '';
      const got = typed[i] || '';
      span.classList.remove('correct','incorrect','pending');
      if (!got) {
        span.classList.add('pending');
      } else if (got === expected) {
        span.classList.add('correct');
      } else {
        span.classList.add('incorrect');
      }
    }
  }

  function finishTest(typed) {
    if (ended) return;
    ended = true;
    const endTime = performance.now();
    const elapsedSec = (endTime - startTime) / 1000;
    const minutes = elapsedSec / 60;
    const wpm = minutes > 0 ? (WORD_COUNT / minutes) : 0; // words per minute based on 10 words
    const correctChars = countCorrectChars(typed);
    const accuracy = typed.length > 0 ? (correctChars / typed.length) * 100 : 0;

    stats.hidden = false;
    timeEl.textContent = elapsedSec.toFixed(2);
    wpmEl.textContent = Math.round(wpm);
    accEl.textContent = accuracy.toFixed(1) + '%';
  }

  // prevent paste to keep test honest
  input.addEventListener('paste', (e) => { e.preventDefault(); });

  input.addEventListener('input', (e) => {
    if (ended) return;
    const typed = input.value;
    if (!startTime && typed.length > 0) startTime = performance.now();
    updateVisuals(typed);

    // finish when typed equals target exactly (trim right to tolerate accidental trailing spaces)
    if (typed === targetText || typed.trimEnd() === targetText) {
      if (!startTime) startTime = performance.now();
      finishTest(typed.trimEnd());
    }
  });

  // handy: pressing Enter finishes if identical
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const typed = input.value.trimEnd();
      if (typed.length && !ended) {
        // only finish if they typed everything (or else ignore)
        if (typed === targetText) {
          finishTest(typed);
        }
      }
    }
  });

  restartBtn.addEventListener('click', startNewTest);

  // init
  startNewTest();
})();
