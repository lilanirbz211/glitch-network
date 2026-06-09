/* ═══════════════════════════════════════════════
   GLITCH MOTORE CORE — script.js [VERSIONE REALE INTEGRALE]
   Nessun backtick, nessun loop bloccante, export globale sicuro.
═══════════════════════════════════════════════ */

var GLITCH = (function () {

  /* ── CREDENZIALI STAFF ── */
  var STAFF_USERNAME = 'GLITCH_SYS_CORE_99X!';
  var STAFF_PASSWORD = 'K4yn3#S1lv3r';

  /* ── CHIAVI LOCAL STORAGE ── */
  var KEY_USERS       = 'glitch_users_db';
  var KEY_TICKETS     = 'glitch_tickets_db';
  var KEY_NEWS        = 'glitch_news_db';
  var KEY_LEADERBOARD = 'glitch_leaderboard_db';
  var KEY_SESSION     = 'glitch_staff_session';

  /* ── GETTER E SETTER DATABASE ── */
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

  /* ── GESTIONE AUTENTICAZIONE STAFF ── */
  function isStaffLoggedIn() {
    return sessionStorage.getItem(KEY_SESSION) === 'true';
  }
  function staffLogin(username, password) {
    return username === STAFF_USERNAME && password === STAFF_PASSWORD;
  }
  function setStaffSession() {
    sessionStorage.setItem(KEY_SESSION, 'true');
  }
  function staffLogout() {
    sessionStorage.removeItem(KEY_SESSION);
    window.location.href = 'login.html';
  }

  /* ── GESTIONE ACCOUNT UTENTI (ASSISTENZA) ── */
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

  /* ── GESTIONE TICKET DI ASSISTENZA ── */
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

  /* ── AGGIORNAMENTO LIVELLO NEWS E CLASSIFICA ── */
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

  /* ── SCONGIURA SCHERMO BIANCO (DASHBOARD RENDERING) ── */
  function renderDashboard() {
    if (window.location.pathname.includes('dashboard.html') && !isStaffLoggedIn()) {
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

    var tickets = getTickets();
    var openTickets = tickets.filter(function(t) { return t.status === 'open'; });

    if (openTickets.length === 0) {
      container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem; font-style:italic; padding:10px;">Nessun ticket attivo nel terminale.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < openTickets.length; i++) {
      var t = openTickets[i];
      html += '<div style="border:1px solid rgba(138,43,226,0.3); background:rgba(5,5,16,0.6); padding:14px; border-radius:4px; margin-bottom:12px;">';
      html += '  <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">';
      html += '    <span style="color:var(--neon-red); font-weight:bold;">TICKET SYSTEM #' + t.id + '</span>';
      html += '    <span style="color:var(--neon-blue);">User: ' + t.username + ' [' + t.subject + ']</span>';
      html += '  </div>';
      html += '  <div id="chat-' + t.id + '" style="height:140px; overflow-y:auto; background:rgba(0,0,0,0.4); padding:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">';
      
      for (var j = 0; j < t.messages.length; j++) {
        var m = t.messages[j];
        var color = m.role === 'staff' ? 'var(--neon-red)' : 'var(--neon-blue)';
        html += '    <div style="font-size:0.8rem; margin-bottom:6px;">';
        html += '      <span style="color:' + color + '; font-weight:bold;">[' + m.sender + ']</span> <span style="color:#fff;">' + m.text + '</span>';
        html += '    </div>';
      }
      html += '  </div>';
      html += '  <div style="display:flex; gap:8px;">';
      html += '    <input type="text" id="reply-' + t.id + '" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 10px; font-family:monospace;" placeholder="Rispondi..." onkeypress="if(event.key===\'Enter\')GLITCH.staffReply(' + t.id + ')" autocomplete="off"/>';
      html += '    <button onclick="GLITCH.staffReply(' + t.id + ')" style="background:var(--neon-blue); border:none; color:#000; padding:6px 16px; font-weight:bold; cursor:pointer;">INVIA</button>';
      html += '    <button onclick="GLITCH.staffClose(' + t.id + ')" style="background:var(--neon-red); border:none; color:#fff; padding:6px 12px; cursor:pointer;">CHIUDI</button>';
      html += '  </div>';
      html += '</div>';
    }

    container.innerHTML = html;

    openTickets.forEach(function(t) {
      var box = document.getElementById('chat-' + t.id);
      if (box) box.scrollTop = box.scrollHeight;
    });
  }

  function renderLeaderboardAdmin() {
    var tbody = document.getElementById('lb-admin-tbody');
    if (!tbody) return;
    var lb = getLeaderboard();
    if (lb.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" style="color:var(--text-dim);text-align:center;padding:16px;">Nessuna voce in classifica.</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < lb.length; i++) {
      html += '<tr><td>' + (i + 1) + '. ' + lb[i].username + '</td><td style="color:var(--neon-green);">' + lb[i].points + '</td></tr>';
    }
    tbody.innerHTML = html;
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

  /* LOOP INIZIALIZZAZIONE AUTOMATICA LIVE DASHBOARD */
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
      renderDashboard();
      setInterval(renderDashboard, 1000);
    }
  });

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

window.doLogout = function() {
  GLITCH.staffLogout();
};
