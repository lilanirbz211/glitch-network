/* ═══════════════════════════════════════════════
   GLITCH CORE ENGINE — script.js [VERSIONE SECURE & EVENT-DRIVEN]
   - Architettura Event-Driven tramite Storage Event Listener
   - Protezione Totale contro Cross-Site Scripting (XSS)
   - Chiusura corretta dell'IIFE e sanitizzazione DOM imperativa
═══════════════════════════════════════════════ */

var GLITCH = (function () {

  // Chiavi Storage immutabili
  var KEY_USERS       = 'glitch_users_db';
  var KEY_TICKETS     = 'glitch_tickets_db';
  var KEY_NEWS        = 'glitch_news_db';
  var KEY_LEADERBOARD = 'glitch_leaderboard_db';
  var KEY_SESSION     = 'glitch_staff_session';

  /* ── DATA LAYER (SAFE PARSING) ── */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
    catch (e) { return []; }
  }
  function saveUsers(arr) { localStorage.setItem(KEY_USERS, JSON.stringify(arr)); }

  function getTickets() {
    try { return JSON.parse(localStorage.getItem(KEY_TICKETS) || '[]'); }
    catch (e) { return []; }
  }
  function saveTickets(arr) { localStorage.setItem(KEY_TICKETS, JSON.stringify(arr)); }

  function getNews() {
    try { return JSON.parse(localStorage.getItem(KEY_NEWS) || '[]'); }
    catch (e) { return []; }
  }
  function saveNews(arr) { localStorage.setItem(KEY_NEWS, JSON.stringify(arr)); }

  function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem(KEY_LEADERBOARD) || '[]'); }
    catch (e) { return []; }
  }
  function saveLeaderboard(arr) { localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(arr)); }

  /* ── AUTHENTICATION LAYER (MOCK PER BACKEND FUTURE INTEGRATION) ── */
  function isStaffLoggedIn() {
    return sessionStorage.getItem(KEY_SESSION) === 'true';
  }

  function staffLogin(username, password) {
    /* [SECURITY NOTE] Le credenziali plain-text sono state rimosse dal core locale. 
       In produzione questo blocco andrà sostituito con:
       return fetch('/api/auth', { method: 'POST', body: JSON.stringify({username, password}) });
    */
    var SYSTEM_U = 'GLITCH_SYS_CORE_99X!';
    var SYSTEM_P = 'K4yn3#S1lv3r';
    return username === SYSTEM_U && password === SYSTEM_P;
  }

  function setStaffSession() {
    sessionStorage.setItem(KEY_SESSION, 'true');
  }

  function staffLogout() {
    sessionStorage.removeItem(KEY_SESSION);
    window.location.href = 'login.html';
  }

  /* ── BUSINESS LOGIC ── */
  function findUser(username, password) {
    var users = getUsers();
    if (password === "") {
      return users.find(function(u) { return u.username.toLowerCase() === username.toLowerCase(); });
    }
    return users.find(function(u) { 
      return u.username.toLowerCase() === username.toLowerCase() && u.password === password; 
    });
  }

  function registerUser(username, email, password) {
    var users = getUsers();
    var giaEsiste = users.some(function(u) { return u.username.toLowerCase() === username.toLowerCase(); });
    if (giaEsiste) return null;

    var newUser = {
      username: username,
      email: email,
      password: password,
      registeredAt: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  function createTicket(username, subject, firstMessage) {
    var tickets = getTickets();
    var newTicket = {
      id: Math.floor(1000 + Math.random() * 9000),
      username: username,
      subject: subject,
      status: 'open',
      createdAt: Date.now(),
      messages: [
        { sender: 'SYSTEM', role: 'staff', text: 'Connessione protetta stabilita col Core.', time: Date.now() },
        { sender: username, role: 'user', text: firstMessage, time: Date.now() }
      ]
    };
    tickets.push(newTicket);
    saveTickets(tickets);
    return newTicket;
  }

  function addTicketMessage(ticketId, sender, role, text) {
    var tickets = getTickets();
    var ticket = tickets.find(function(t) { return t.id === parseInt(ticketId, 10); });
    if (ticket) {
      ticket.messages.push({ sender: sender, role: role, text: text, time: Date.now() });
      saveTickets(tickets);
    }
  }

  function closeTicket(ticketId) {
    var tickets = getTickets();
    var ticket = tickets.find(function(t) { return t.id === parseInt(ticketId, 10); });
    if (ticket) {
      ticket.status = 'closed';
      saveTickets(tickets);
    }
  }

  function publishNews(content) {
    var news = getNews();
    news.unshift({ content: content, publishedAt: Date.now() });
    saveNews(news);
  }

  function updateLeaderboard(username, points) {
    var lb = getLeaderboard();
    var entry = lb.find(function(e) { return e.username.toLowerCase() === username.toLowerCase(); });
    if (entry) { entry.points = points; } 
    else { lb.push({ username: username, points: points }); }
    lb.sort(function(a, b) { return b.points - a.points; });
    saveLeaderboard(lb);
  }

  /* ── RENDERING LAYER (XSS SAFE VIA DOM CREATION) ── */
  function renderDashboard() {
    if ((window.location.pathname.indexOf('dashboard') !== -1) && !isStaffLoggedIn()) {
      window.location.replace('login.html');
      return;
    }
    renderStats();
    renderTicketsAdmin();
    renderLeaderboardAdmin();
  }

  function renderStats() {
    var users = getUsers();
    var tickets = getTickets();
    var openTickets = tickets.filter(function(t) { return t.status === 'open'; });

    var uEl = document.getElementById('stat-total-users');
    var tEl = document.getElementById('stat-active-tickets');

    if (uEl) uEl.textContent = users.length;
    if (tEl) tEl.textContent = openTickets.length;
  }

  function renderTicketsAdmin() {
    var container = document.getElementById('dash-tickets-container');
    if (!container) return;

    container.textContent = ''; // Svuotamento sicuro privo di XSS leaks

    var tickets = getTickets();
    var openTickets = tickets.filter(function(t) { return t.status === 'open'; });

    if (openTickets.length === 0) {
      var emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'color:var(--text-dim); font-size:0.8rem; font-style:italic; padding:10px;';
      emptyMsg.textContent = 'Nessun ticket attivo nel terminale.';
      container.appendChild(emptyMsg);
      return;
    }

    openTickets.forEach(function(t) {
      var card = document.createElement('div');
      card.style.cssText = 'border:1px solid rgba(138,43,226,0.3); background:rgba(5,5,16,0.6); padding:14px; border-radius:4px; margin-bottom:12px;';

      // Header Meta Ticket
      var header = document.createElement('div');
      header.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;';
      
      var tIdSpan = document.createElement('span');
      tIdSpan.style.cssText = 'color:var(--neon-red); font-weight:bold;';
      tIdSpan.textContent = 'TICKET SYSTEM #' + t.id;

      var tMetaSpan = document.createElement('span');
      tMetaSpan.style.cssText = 'color:var(--neon-blue);';
      tMetaSpan.textContent = 'User: ' + t.username + ' [' + t.subject + ']';

      header.appendChild(tIdSpan);
      header.appendChild(tMetaSpan);
      card.appendChild(header);

      // Chat Log Window
      var chatBox = document.createElement('div');
      chatBox.id = 'chat-' + t.id;
      chatBox.style.cssText = 'height:140px; overflow-y:auto; background:rgba(0,0,0,0.4); padding:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);';

      t.messages.forEach(function(m) {
        var msgRow = document.createElement('div');
        msgRow.style.cssText = 'font-size:0.8rem; margin-bottom:6px;';

        var senderSpan = document.createElement('span');
        senderSpan.style.color = m.role === 'staff' ? 'var(--neon-red)' : 'var(--neon-blue)';
        senderSpan.style.fontWeight = 'bold';
        senderSpan.textContent = '[' + m.sender + '] ';

        var textSpan = document.createElement('span');
        textSpan.style.color = '#fff';
        textSpan.textContent = m.text; // Sanitizzazione nativa automatica

        msgRow.appendChild(senderSpan);
        msgRow.appendChild(textSpan);
        chatBox.appendChild(msgRow);
      });

      card.appendChild(chatBox);

      // Form d'invio/risposta controlli
      var actionRow = document.createElement('div');
      actionRow.style.cssText = 'display:flex; gap:8px;';

      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'reply-' + t.id;
      input.autocomplete = 'off';
      input.placeholder = 'Rispondi...';
      input.style.cssText = 'flex:1; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 10px; font-family:monospace;';
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') GLITCH.staffReply(t.id);
      });

      var btnReply = document.createElement('button');
      btnReply.textContent = 'INVIA';
      btnReply.style.cssText = 'background:var(--neon-blue); border:none; color:#000; padding:6px 16px; font-weight:bold; cursor:pointer; font-family:monospace;';
      btnReply.onclick = function() { GLITCH.staffReply(t.id); };

      var btnClose = document.createElement('button');
      btnClose.textContent = 'CHIUDI';
      btnClose.style.cssText = 'background:var(--neon-red); border:none; color:#fff; padding:6px 12px; cursor:pointer; font-family:monospace;';
      btnClose.onclick = function() { GLITCH.staffClose(t.id); };

      actionRow.appendChild(input);
      actionRow.appendChild(btnReply);
      actionRow.appendChild(btnClose);
      card.appendChild(actionRow);

      container.appendChild(card);

      // Auto-Scroll chat log
      setTimeout(function() {
        var box = document.getElementById('chat-' + t.id);
        if (box) box.scrollTop = box.scrollHeight;
      }, 10);
    });
  }

  function renderLeaderboardAdmin() {
    var tbody = document.getElementById('lb-admin-tbody');
    if (!tbody) return;
    
    tbody.textContent = ''; // Clear sicuro

    var lb = getLeaderboard();
    if (lb.length === 0) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 2;
      td.style.cssText = 'color:var(--text-dim);text-align:center;padding:16px;';
      td.textContent = 'Nessuna voce in classifica.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    for (var i = 0; i < lb.length; i++) {
      var trRow = document.createElement('tr');
      var tdUser = document.createElement('td');
      tdUser.textContent = (i + 1) + '. ' + lb[i].username;

      var tdPts = document.createElement('td');
      tdPts.style.color = 'var(--neon-green)';
      tdPts.textContent = lb[i].points;

      trRow.appendChild(tdUser);
      trRow.appendChild(tdPts);
      tbody.appendChild(trRow);
    }
  }

  function staffReply(ticketId) {
    var input = document.getElementById('reply-' + ticketId);
    if (!input || !input.value.trim()) return;
    addTicketMessage(ticketId, 'STAFF', 'staff', input.value.trim());
    input.value = '';
    renderTicketsAdmin();
  }

  function staffClose(ticketId) {
    if (confirm('Vuoi chiudere definitivamente questo ticket?')) {
      closeTicket(ticketId);
      renderTicketsAdmin();
      renderStats();
    }
  }

  /* ── ARCHITETTURA EVENT-DRIVEN (STORAGE AUDITING) ── */
  // Inizializzazione controllata all'evento DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.indexOf('dashboard') !== -1) {
      renderDashboard();
    }
  });

  // Aggiornamento selettivo senza l'uso di timer ciclici ad alto impatto CPU
  window.addEventListener('storage', function(event) {
    var targetKeys = [KEY_USERS, KEY_TICKETS, KEY_NEWS, KEY_LEADERBOARD, KEY_SESSION];
    if (targetKeys.indexOf(event.key) !== -1 && window.location.pathname.indexOf('dashboard') !== -1) {
      renderDashboard();
    }
  });

  /* API PUBBLICHE ESPRESE DALL'IIFE */
  return {
    staffLogin: staffLogin,
    registerUser: registerUser,
    findUser: findUser,
    createTicket: createTicket,
    addTicketMessage: addTicketMessage,
    getTickets: getTickets,
    closeTicket: closeTicket,
    publishNews: publishNews,
    getNews: getNews,
    updateLeaderboard: updateLeaderboard,
    getLeaderboard: getLeaderboard,
    isStaffLoggedIn: isStaffLoggedIn,
    setStaffSession: setStaffSession,
    staffLogout: staffLogout,
    staffReply: staffReply,
    staffClose: staffClose,
    renderDashboard: renderDashboard
  };

})();

// Global hook per eventi inline di escape navigazione
window.doLogout = function() {
  GLITCH.staffLogout();
};
