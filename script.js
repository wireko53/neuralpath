/*============================================================
  NeuralPath — AI/ML Learning Dashboard
   ============================================================ */

// ── MOBILE SIDEBAR ─────────────────────────────────────────────────────────

function toggleSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
}

// ── NAVIGATION ─────────────────────────────────────────────────────────────

var panels = ['roadmap', 'papers', 'notebooks', 'quiz', 'timer', 'progress', 'bookmarks'];
var pageTitles = {
  roadmap: 'Roadmap',
  papers: 'Research Papers',
  notebooks: 'Notebooks',
  quiz: 'Flashcards',
  timer: 'Study Timer',
  progress: 'My Progress',
  bookmarks: 'Bookmarks'
};

function go(id, navEl) {
  panels.forEach(function(p) {
    document.getElementById('p-' + p).classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(function(n) {
    n.classList.remove('active');
  });
  document.getElementById('p-' + id).classList.add('active');
  if (navEl) navEl.classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[id] || id;
  closeSidebar();
}

// ── TAB FILTERING ──────────────────────────────────────────────────────────

function filterTab(containerId, btnEl) {
  document.querySelectorAll('#' + containerId + ' .tab').forEach(function(b) {
    b.classList.remove('active');
  });
  btnEl.classList.add('active');
}

function filterRM(f, btn) {
  filterTab('p-roadmap', btn);
  document.querySelectorAll('.rm-row').forEach(function(row) {
    var status = row.getAttribute('data-status');
    row.style.display = (f === 'all' || status === f) ? 'flex' : 'none';
  });
}

function filterP(f, btn) {
  filterTab('p-papers', btn);
  document.querySelectorAll('.paper-card').forEach(function(card) {
    var cat = card.getAttribute('data-cat');
    card.style.display = (f === 'all' || cat === f) ? 'block' : 'none';
  });
}

// ── TOPIC PILLS ────────────────────────────────────────────────────────────

var doneTopics = 0;
var totalTopics = 28;

var phaseTotals = { '1': 6, '2': 7, '3': 8, '4': 7 };
var phaseDone   = { '1': 0, '2': 0, '3': 0, '4': 0 };

function toggleTopic(el) {
  var phase = el.getAttribute('data-phase');
  if (el.classList.contains('done')) {
    el.classList.remove('done');
    doneTopics--;
    if (phase) phaseDone[phase]--;
  } else {
    el.classList.add('done');
    doneTopics++;
    if (phase) phaseDone[phase]++;
  }
  var pct = Math.round((doneTopics / totalTopics) * 100);
  document.getElementById('xpBar').style.width = pct + '%';
  document.getElementById('xpVal').textContent = pct + '%';
  document.getElementById('sDone').textContent = doneTopics;

  // Update phase breakdown bars
  ['1','2','3','4'].forEach(function(p) {
    var done = phaseDone[p];
    var total = phaseTotals[p];
    var barPct = Math.round((done / total) * 100);
    var bar = document.getElementById('bar-phase' + p);
    var count = document.getElementById('count-phase' + p);
    if (bar) bar.style.width = barPct + '%';
    if (count) count.textContent = done + '/' + total;
  });
}

// ── FLASHCARDS ─────────────────────────────────────────────────────────────

var cardIdx = 0;
var cardFlipped = false;
var easyCount = 0;
var hardCount = 0;
var totalCards = 8;

var questions = [
  "What is backpropagation?",
  "What is the vanishing gradient problem?",
  "What does the attention mechanism do?",
  "What is overfitting?",
  "Supervised vs unsupervised learning?",
  "What is a convolutional layer?",
  "What is dropout regularisation?",
  "What is the softmax function?"
];

var answers = [
  "An algorithm computing gradients via the chain rule backwards through the network to update weights.",
  "Gradients shrink exponentially through layers, making early layers learn extremely slowly.",
  "Weights the importance of each input token when encoding each position, enabling long-range dependencies.",
  "The model memorises training data including noise, performing well on train but poorly on new data.",
  "Supervised uses labelled data to learn a mapping. Unsupervised finds patterns without labels.",
  "Applies learned filters across inputs with shared weights to detect local spatial patterns like edges.",
  "Randomly deactivates neurons during training to prevent co-adaptation and reduce overfitting.",
  "Converts raw logits into a probability distribution summing to 1, used in multi-class classification."
];

function updateCard() {
  var el = document.getElementById('cardEl');
  el.classList.remove('revealed');
  document.getElementById('cardChip').textContent = 'Question';
  document.getElementById('cardText').textContent = questions[cardIdx];
  document.getElementById('cardHint').textContent = 'Tap to reveal answer';
  document.getElementById('cardCounter').textContent = 'Card ' + (cardIdx + 1) + ' of ' + totalCards;
  cardFlipped = false;
}

function flipCard() {
  cardFlipped = !cardFlipped;
  var el = document.getElementById('cardEl');
  if (cardFlipped) {
    el.classList.add('revealed');
    document.getElementById('cardChip').textContent = 'Answer';
    document.getElementById('cardText').textContent = answers[cardIdx];
    document.getElementById('cardHint').textContent = '';
  } else {
    updateCard();
  }
}

function nextCard() {
  cardIdx = (cardIdx + 1) % totalCards;
  updateCard();
}

function prevCard() {
  cardIdx = (cardIdx - 1 + totalCards) % totalCards;
  updateCard();
}

function rate(r) {
  if (r === 'easy') {
    easyCount++;
    document.getElementById('easyN').textContent = easyCount;
    document.getElementById('sFlash').textContent = easyCount;
  } else {
    hardCount++;
    document.getElementById('hardN').textContent = hardCount;
  }
  var pct = Math.round((easyCount / totalCards) * 100);
  document.getElementById('qpFill').style.width = pct + '%';
  nextCard();
}

function shuffleCards() {
  cardIdx = Math.floor(Math.random() * totalCards);
  updateCard();
}

// ── TIMER ──────────────────────────────────────────────────────────────────

var timerModes = { pomodoro: 1500, short: 300, long: 900 };
var timerLabels = { pomodoro: 'Focus Time', short: 'Short Break', long: 'Long Break' };
var currentMode = 'pomodoro';
var timerLeft = 1500;
var timerTotal = 1500;
var timerRunning = false;
var timerTick = null;
var sessionsToday = 0;

function setMode(m, btn) {
  clearInterval(timerTick);
  timerRunning = false;
  currentMode = m;
  timerTotal = timerModes[m];
  timerLeft = timerTotal;
  document.querySelectorAll('.mode-pill').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('timerLbl').textContent = timerLabels[m];
  document.getElementById('tStartBtn').textContent = '▶ Start';
  updateTimerDisplay();
}

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerTick);
    timerRunning = false;
    document.getElementById('tStartBtn').textContent = '▶ Resume';
  } else {
    timerRunning = true;
    document.getElementById('tStartBtn').textContent = '⏸ Pause';
    timerTick = setInterval(function() {
      timerLeft--;
      updateTimerDisplay();
      if (timerLeft <= 0) {
        clearInterval(timerTick);
        timerRunning = false;
        document.getElementById('tStartBtn').textContent = '▶ Start';
        if (currentMode === 'pomodoro') { sessionsToday++; updateSessionDots(); }
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerTick);
  timerRunning = false;
  timerLeft = timerTotal;
  document.getElementById('tStartBtn').textContent = '▶ Start';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  var m = String(Math.floor(timerLeft / 60)).padStart(2, '0');
  var s = String(timerLeft % 60).padStart(2, '0');
  document.getElementById('timerDisp').textContent = m + ':' + s;
  var arc = document.getElementById('timerArc');
  var offset = 2 * Math.PI * 88 * (1 - timerLeft / timerTotal);
  arc.style.strokeDashoffset = offset;
  var r = timerLeft / timerTotal;
  arc.style.stroke = r > 0.5 ? '#6effa3' : r > 0.2 ? '#5b8cff' : '#ff6b72';
}

function updateSessionDots() {
  var dots = document.querySelectorAll('.session-dot');
  dots.forEach(function(dot, i) {
    if (i < sessionsToday) dot.classList.add('done');
  });
}

// ── SAVE BUTTON ────────────────────────────────────────────────────────────

function saveItem(btn) {
  btn.textContent = '✓ Saved';
  btn.style.color = '#6effa3';
  btn.style.borderColor = 'rgba(110,255,163,0.3)';
  btn.style.background = 'rgba(110,255,163,0.06)';
  btn.disabled = true;
}

// ── BOOKMARK BUTTON ────────────────────────────────────────────────────────

var bookmarks = [];

function bookmarkItem(btn, title, author, year, url) {
  btn.textContent = '★ Bookmarked';
  btn.style.color = '#ffd166';
  btn.style.borderColor = 'rgba(255,209,102,0.3)';
  btn.style.background = 'rgba(255,209,102,0.06)';
  btn.disabled = true;

  var exists = bookmarks.find(function(b) { return b.title === title; });
  if (!exists) {
    bookmarks.push({ title: title, author: author, year: year, url: url });
    renderBookmarks();
  }
}

function renderBookmarks() {
  var grid = document.getElementById('bookmarks-grid');
  var empty = document.getElementById('bookmarks-empty');
  if (bookmarks.length === 0) {
    empty.style.display = 'block';
    grid.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = bookmarks.map(function(b) {
    return '<div class="paper-card">' +
      '<div class="paper-meta">' +
        '<span class="paper-year">' + b.year + '</span>' +
        '<span style="font-size:10px;color:#ffd166;">★ Bookmarked</span>' +
      '</div>' +
      '<div class="paper-title">' + b.title + '</div>' +
      '<div class="paper-author">' + b.author + '</div>' +
      '<div class="paper-actions">' +
        '<a href="' + b.url + '" target="_blank" class="btn-read">📖 Read</a>' +
        '<button class="btn-action" onclick="removeBookmark(this,\'' + b.title.replace(/'/g, "\\'") + '\')">🗑 Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function removeBookmark(btn, title) {
  bookmarks = bookmarks.filter(function(b) { return b.title !== title; });
  renderBookmarks();
}

// ── SEARCH ─────────────────────────────────────────────────────────────────

var searchIndex = [
  // Topics
  { name: 'Linear Algebra',      type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Calculus',            type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Probability',         type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'NumPy',               type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Pandas',              type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Matplotlib',          type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Linear Regression',   type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Logistic Regression', type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Decision Trees',      type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'SVM',                 type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'K-Means',             type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'PCA',                 type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Cross-Validation',    type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Perceptrons',         type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Backprop',            type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'CNNs',                type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'RNNs',                type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'LSTMs',               type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Dropout',             type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Batch Norm',          type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Adam',                type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Attention',           type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Transformers',        type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'BERT / GPT',          type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Diffusion Models',    type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'RL Basics',           type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Policy Gradient',     type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Fine-Tuning',         type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  // Papers
  { name: 'Attention Is All You Need',   type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Generative Adversarial Networks', type: 'Paper', icon: '📄', panel: 'papers' },
  { name: 'Deep Residual Learning',      type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'GPT-3',                       type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Playing Atari with DRL',      type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'InstructGPT',                 type: 'Paper',    icon: '📄', panel: 'papers' },
  // Notebooks
  { name: 'Intro to Neural Networks',    type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Image Classification CNN',    type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'NLP Sentiment Analysis',      type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'GAN from Scratch',            type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Transformer from Scratch',    type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Q-Learning for CartPole',     type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  // Sections
  { name: 'Flashcards',   type: 'Section', icon: '🃏', panel: 'quiz' },
  { name: 'Study Timer',  type: 'Section', icon: '⏱', panel: 'timer' },
  { name: 'My Progress',  type: 'Section', icon: '📊', panel: 'progress' },
  { name: 'Bookmarks',    type: 'Section', icon: '🔖', panel: 'bookmarks' }
];

var searchFocusIdx = -1;

function runSearch(q) {
  var dropdown = document.getElementById('searchDropdown');
  q = q.trim().toLowerCase();
  searchFocusIdx = -1;

  if (!q) { dropdown.classList.remove('open'); dropdown.innerHTML = ''; return; }

  var results = searchIndex.filter(function(item) {
    return item.name.toLowerCase().indexOf(q) !== -1 || item.type.toLowerCase().indexOf(q) !== -1;
  }).slice(0, 7);

  if (results.length === 0) {
    dropdown.innerHTML = '<div class="search-no-result">No results for "' + q + '"</div>';
  } else {
    dropdown.innerHTML = results.map(function(r, i) {
      return '<div class="search-result" data-panel="' + r.panel + '" data-nav="nav-' + r.panel + '" onclick="selectResult(\'' + r.panel + '\')">' +
        '<span class="search-result-icon">' + r.icon + '</span>' +
        '<span class="search-result-name">' + r.name + '</span>' +
        '<span class="search-result-type">' + r.type + '</span>' +
      '</div>';
    }).join('');
  }
  dropdown.classList.add('open');
}

function selectResult(panel) {
  var navEl = document.getElementById('nav-' + panel);
  go(panel, navEl);
  document.getElementById('searchInput').value = '';
  document.getElementById('searchDropdown').classList.remove('open');
  document.getElementById('searchDropdown').innerHTML = '';
  searchFocusIdx = -1;
}

function searchKeydown(e) {
  var dropdown = document.getElementById('searchDropdown');
  var items = dropdown.querySelectorAll('.search-result');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchFocusIdx = Math.min(searchFocusIdx + 1, items.length - 1);
    highlightSearchItem(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchFocusIdx = Math.max(searchFocusIdx - 1, 0);
    highlightSearchItem(items);
  } else if (e.key === 'Enter') {
    if (searchFocusIdx >= 0 && items[searchFocusIdx]) {
      var panel = items[searchFocusIdx].getAttribute('data-panel');
      selectResult(panel);
    }
  } else if (e.key === 'Escape') {
    dropdown.classList.remove('open');
    searchFocusIdx = -1;
  }
}

function highlightSearchItem(items) {
  items.forEach(function(el, i) {
    el.classList.toggle('focused', i === searchFocusIdx);
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!document.getElementById('searchWrap').contains(e.target)) {
    document.getElementById('searchDropdown').classList.remove('open');
    searchFocusIdx = -1;
  }
});

// ── STREAK ─────────────────────────────────────────────────────────────────

function initStreak() {
  var today    = new Date().toDateString();
  var lastDate = localStorage.getItem('np_lastDate');
  var streak   = parseInt(localStorage.getItem('np_streak') || '0', 10);

  if (lastDate === today) {
    // Same day — streak already counted, just display
  } else if (lastDate) {
    var last = new Date(lastDate);
    var now  = new Date(today);
    var diff = Math.round((now - last) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++; // Visited yesterday — continue streak
    } else {
      streak = 1; // Missed a day — reset to 1 (today counts)
    }
    localStorage.setItem('np_streak', streak);
    localStorage.setItem('np_lastDate', today);
  } else {
    // First ever visit
    streak = 1;
    localStorage.setItem('np_streak', streak);
    localStorage.setItem('np_lastDate', today);
  }

  var label = streak === 1 ? '1 day streak' : streak + ' day streak';
  document.getElementById('streakBadge').textContent = '🔥 ' + label;
  // Keep progress page in sync
  var statEl = document.querySelector('#p-progress .stat-num.c-red');
  if (statEl) statEl.textContent = streak;
}

// ── SEARCH ─────────────────────────────────────────────────────────────────

var searchIndex = [
  { name: 'Linear Algebra',          type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Calculus',                type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Probability',             type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'NumPy',                   type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Pandas',                  type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Matplotlib',              type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Linear Regression',       type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Logistic Regression',     type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Decision Trees',          type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'SVM',                     type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'K-Means',                 type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'PCA',                     type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Cross-Validation',        type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Perceptrons',             type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Backprop',                type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'CNNs',                    type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'RNNs',                    type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'LSTMs',                   type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Dropout',                 type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Batch Norm',              type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Adam',                    type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Attention',               type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Transformers',            type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'BERT / GPT',              type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Diffusion Models',        type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'RL Basics',               type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Policy Gradient',         type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Fine-Tuning',             type: 'Topic',    icon: '🗺', panel: 'roadmap' },
  { name: 'Attention Is All You Need',       type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Generative Adversarial Networks', type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Deep Residual Learning',          type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'GPT-3',                           type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Playing Atari with DRL',          type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'InstructGPT',                     type: 'Paper',    icon: '📄', panel: 'papers' },
  { name: 'Intro to Neural Networks',        type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Image Classification CNN',        type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'NLP Sentiment Analysis',          type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'GAN from Scratch',                type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Transformer from Scratch',        type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Q-Learning for CartPole',         type: 'Notebook', icon: '🧪', panel: 'notebooks' },
  { name: 'Flashcards',  type: 'Section', icon: '🃏', panel: 'quiz' },
  { name: 'Study Timer', type: 'Section', icon: '⏱', panel: 'timer' },
  { name: 'My Progress', type: 'Section', icon: '📊', panel: 'progress' },
  { name: 'Bookmarks',   type: 'Section', icon: '🔖', panel: 'bookmarks' }
];

var searchFocusIdx = -1;

function runSearch(q) {
  var dropdown = document.getElementById('searchDropdown');
  q = q.trim().toLowerCase();
  searchFocusIdx = -1;
  if (!q) { dropdown.classList.remove('open'); dropdown.innerHTML = ''; return; }
  var results = searchIndex.filter(function(item) {
    return item.name.toLowerCase().indexOf(q) !== -1 || item.type.toLowerCase().indexOf(q) !== -1;
  }).slice(0, 7);
  if (results.length === 0) {
    dropdown.innerHTML = '<div class="search-no-result">No results for "' + q + '"</div>';
  } else {
    dropdown.innerHTML = results.map(function(r) {
      return '<div class="search-result" onclick="selectResult(\'' + r.panel + '\')">' +
        '<span class="search-result-icon">' + r.icon + '</span>' +
        '<span class="search-result-name">' + r.name + '</span>' +
        '<span class="search-result-type">' + r.type + '</span>' +
      '</div>';
    }).join('');
  }
  dropdown.classList.add('open');
}

function selectResult(panel) {
  var navEl = document.getElementById('nav-' + panel);
  go(panel, navEl);
  document.getElementById('searchInput').value = '';
  document.getElementById('searchDropdown').classList.remove('open');
  document.getElementById('searchDropdown').innerHTML = '';
  searchFocusIdx = -1;
}

function searchKeydown(e) {
  var dropdown = document.getElementById('searchDropdown');
  var items = dropdown.querySelectorAll('.search-result');
  if (!items.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    searchFocusIdx = Math.min(searchFocusIdx + 1, items.length - 1);
    items.forEach(function(el, i) { el.classList.toggle('focused', i === searchFocusIdx); });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    searchFocusIdx = Math.max(searchFocusIdx - 1, 0);
    items.forEach(function(el, i) { el.classList.toggle('focused', i === searchFocusIdx); });
  } else if (e.key === 'Enter' && searchFocusIdx >= 0 && items[searchFocusIdx]) {
    selectResult(items[searchFocusIdx].getAttribute('onclick').match(/'(\w+)'/)[1]);
  } else if (e.key === 'Escape') {
    dropdown.classList.remove('open');
  }
}

document.addEventListener('click', function(e) {
  var wrap = document.getElementById('searchWrap');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('searchDropdown').classList.remove('open');
  }
});

// ── STREAK ─────────────────────────────────────────────────────────────────

function initStreak() {
  var today    = new Date().toDateString();
  var lastDate = localStorage.getItem('np_lastDate');
  var streak   = parseInt(localStorage.getItem('np_streak') || '0', 10);

  if (lastDate === today) {
    // Same day — already counted, just display
  } else if (lastDate) {
    var diff = Math.round((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
    streak = diff === 1 ? streak + 1 : 1;
    localStorage.setItem('np_streak', streak);
    localStorage.setItem('np_lastDate', today);
  } else {
    streak = 1;
    localStorage.setItem('np_streak', streak);
    localStorage.setItem('np_lastDate', today);
  }

  document.getElementById('streakBadge').textContent = '🔥 ' + streak + ' day streak';
  var statEl = document.querySelector('#p-progress .stat-num.c-red');
  if (statEl) statEl.textContent = streak;
}

// ── INIT ───────────────────────────────────────────────────────────────────
updateCard();
updateTimerDisplay();
initStreak();
initStreak();
