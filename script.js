/* ═══════════════════════════════════════════════
   GLITCH MOTORE PRINCIPALE — script.js
   Credenziali staff hardcoded sotto.
   Tutto lo stato è sincronizzato via localStorage/sessionStorage.
═══════════════════════════════════════════════ */

const GLITCH = (function () {

  /* ── CREDENZIALI STAFF ── */
  const STAFF_USERNAME = 'GLITCH_SYS_CORE_99X!';
  const STAFF_PASSWORD = 'K4yn3#S1lv3r';

  /* ── CHIAVI STORAGE ── */
  const KEY_USERS       = 'glitch_users_db';
  const KEY_TICKETS     = 'glitch_tickets_db';
  const KEY_NEWS        = 'glitch_news_db';
  const KEY_LEADERBOARD = 'glitch_leaderboard_db';
  const KEY_SESSION     = 'glitch_staff_session';

  /* ── HELPERS ── */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
    catch { return []; }
  }

  function saveUsers(arr) {
    localStorage.setItem(KEY_USERS, JSON.stringify(arr));
  }

  function getTickets() {
    try { return JSON.parse(localStorage.getItem(KEY_TICKETS) || '[]'); }
    catch { return []; }
  }

  function saveTickets(arr) {
    localStorage.setItem(KEY_TICKETS, JSON.stringify(arr));
  }

  function getNews() {
    try { return JSON.parse(localStorage.getItem(KEY_NEWS) || '[]'); }
    catch { return []; }
  }

  function saveNews(arr) {
    localStorage.setItem(KEY_NEWS, JSON.stringify(arr));
  }

  function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem(KEY_LEADERBOARD) || '[]'); }
    catch { return []; }
  }

  function saveLeaderboard(arr) {
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(arr));
  }

  function isStaffLoggedIn() {
    return sessionStorage.getItem(KEY_SESSION) === 'authenticated';
  }

  function setStaffSession() {
    sessionStorage.setItem(KEY_SESSION, 'authenticated');
  }

  function clearStaffSession() {
    sessionStorage.removeItem(KEY_SESSION);
  }

  /* ── LOGIN STAFF ── */
  function staffLogin(username, password) {
    return username === STAFF_USERNAME && password === STAFF_PASSWORD;
  }

  /* ── REGISTRAZIONE UTENTE ── */
  function registerUser(username, email, password) {
    const users = getUsers();
    const exists = users.find(u => u.username === username || u.email === email);
    if (exists) return { success: false, message: 'Nome utente o email già esistente.' };
    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      registeredAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
  }

  function findUser(username, password) {
    const users = getUsers();
    return users.find(u => u.username === username && u.password === password) || null;
  }

  /* ── GESTIONE TICKET ── */
  function createTicket(username, subject, message) {
    const tickets = getTickets();
    const ticket = {
      id: Date.now(),
      username,
      subject,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        { sender: username, role: 'user', text: message, time: new Date().toISOString() }
      ]
    };
    tickets.push(ticket);
    saveTickets(tickets);
    return ticket;
  }

  function addTicketMessage(ticketId, sender, role, text) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return false;
    ticket.messages.push({ sender, role, text, time: new Date().toISOString() });
    saveTickets(tickets);
    return true;
  }

  function closeTicket(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return false;
    ticket.status = 'closed';
    saveTickets(tickets);
    return true;
  }

  /* ── CLASSIFICA ── */
  function updateLeaderboard(username, points) {
    const lb = getLeaderboard();
    const idx = lb.findIndex(e => e.username === username);
    if (idx > -1) {
      lb[idx].points = points;
    } else {
      lb.push({ username, points: parseInt(points, 10) || 0 });
    }
    lb.sort((a, b) => b.points - a.points);
    saveLeaderboard(lb);
    return lb;
  }

  /* ── NOTIZIE ── */
  function publishNews(content) {
    const news = getNews();
    news.unshift({ id: Date.now(), content, publishedAt: new Date().toISOString() });
    if (news.length > 20) news.pop();
    saveNews(news);
    return news;
  }

  /* ── LOOP RENDER DASHBOARD ── */
  function startDashboardLoop() {
    function tick() {
      renderUserTable();
      renderTicketPanel();
      renderLeaderboardAdmin();
    }
    tick();
    setInterval(tick, 1000);
  }

  function renderUserTable() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    const users = getUsers();
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-dim);text-align:center;padding:20px">Nessun utente registrato.</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td style="color:var(--neon-red);letter-spacing:2px;">${u.password}</td>
        <td>${new Date(u.registeredAt).toLocaleString('it-IT')}</td>
      </tr>
    `).join('');
  }

  function renderTicketPanel() {
    const container = document.getElementById('tickets-list');
    if (!container) return;
    const tickets = getTickets();
    if (tickets.length === 0) {
      container.innerHTML = '<p style="color:var(--text-dim);font-size:0.8rem;">Nessun ticket aperto.</p>';
      return;
    }
    container.innerHTML = tickets.map(t => `
      <div class="panel" style="margin-bottom:16px;padding:16px;" id="ticket-${t.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-family:Orbitron,sans-serif;font-size:0.75rem;letter-spacing:2px;color:var(--neon-blue);">
            #${t.id} — ${t.subject}
          </span>
          <span class="badge ${t.status === 'open' ? 'badge-open' : 'badge-closed'}">${t.status === 'open' ? 'APERTO' : 'CHIUSO'}</span>
        </div>
        <div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:12px;">Utente: <strong style="color:#e0d0ff">${t.username}</strong></div>
        <div class="chat-box" id="chat-${t.id}">
          ${t.messages.map(m => `
            <div class="chat-msg">
              <span class="msg-${m.role === 'staff' ? 'staff' : 'user'}">[${m.sender}]</span>
              <span class="msg-text"> ${m.text}</span>
              <span style="font-size:0.65rem;color:rgba(180,160,220,0.4);margin-left:8px;">${new Date(m.time).toLocaleTimeString('it-IT')}</span>
            </div>
          `).join('')}
        </div>
        ${t.status === 'open' ? `
          <div class="admin-input-row">
            <input type="text" id="reply-${t.id}" placeholder="Scrivi risposta staff..." />
            <button class="btn btn-green" onclick="GLITCH.staffReply(${t.id})">Rispondi</button>
            <button class="btn btn-red" onclick="GLITCH.staffClose(${t.id})">Chiudi</button>
          </div>
        ` : ''}
      </div>
    `).join('');

    tickets.forEach(t => {
      const box = document.getElementById('chat-' + t.id);
      if (box) box.scrollTop = box.scrollHeight;
    });
  }

  function renderLeaderboardAdmin() {
    const tbody = document.getElementById('lb-admin-tbody');
    if (!tbody) return;
    const lb = getLeaderboard();
    if (lb.length === 0) {
      tbody.innerHTML = '<tr><td colspan="2" style="color:var(--text-dim);text-align:center;padding:16px;">Nessuna voce ancora.</td></tr>';
      return;
    }
    tbody.innerHTML = lb.map((e, i) => `
      <tr>
        <td>${i + 1}. ${e.username}</td>
        <td style="color:var(--neon-green);">${e.points}</td>
      </tr>
    `).join('');
  }

  /* ── API PUBBLICA ── */
  function staffReply(ticketId) {
    const input = document.getElementById('reply-' + ticketId);
    if (!input || !input.value.trim()) return;
    addTicketMessage(ticketId, 'STAFF', 'staff', input.value.trim());
    input.value = '';
  }

  function staffClose(ticketId) {
    if (confirm('Vuoi chiudere questo ticket?')) {
      closeTicket(ticketId);
    }
  }

  return {
    staffLogin,
    registerUser,
    findUser,
    createTicket,
    addTicketMessage,
    closeTicket,
    updateLeaderboard,
    publishNews,
    getNews,
    getLeaderboard,
    getTickets,
    getUsers,
    isStaffLoggedIn,
    setStaffSession,
    clearStaffSession,
    startDashboardLoop,
    staffReply,
    staffClose
  };
})();

window.GLITCH = GLITCH;
