/* ═══════════════════════════════════════════════
   GLITCH MOTORE PRINCIPALE — script.js
═══════════════════════════════════════════════ */

const GLITCH = (function () {

  const STAFF_USERNAME = 'GLITCH_SYS_CORE_99X!';
  const STAFF_PASSWORD = 'K4yn3#S1lv3r';

  const KEY_USERS       = 'glitch_users_db';
  const KEY_TICKETS     = 'glitch_tickets_db';
  const KEY_NEWS        = 'glitch_news_db';
  const KEY_LEADERBOARD = 'glitch_leaderboard_db';
  const KEY_SESSION     = 'glitch_staff_session';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(KEY_USERS) || '[]'); }
    catch { return []; }
  }
  function saveUsers(arr) { 
    try { localStorage.setItem(KEY_USERS, JSON.stringify(arr)); } catch(e) {} 
  }

  function getTickets() {
    try { return JSON.parse(localStorage.getItem(KEY_TICKETS) || '[]'); }
    catch { return []; }
  }
  function saveTickets(arr) { 
    try { localStorage.setItem(KEY_TICKETS, JSON.stringify(arr)); } catch(e) {} 
  }

  function getNews() {
    try { return JSON.parse(localStorage.getItem(KEY_NEWS) || '[]'); }
    catch { return []; }
  }
  function saveNews(arr) { 
    try { localStorage.setItem(KEY_NEWS, JSON.stringify(arr)); } catch(e) {} 
  }

  function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem(KEY_LEADERBOARD) || '[]'); }
    catch { return []; }
  }
  function saveLeaderboard(arr) { 
    try { localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(arr)); } catch(e) {} 
  }

  function isStaffLoggedIn() {
    try { return sessionStorage.getItem(KEY_SESSION) === 'true'; } catch { return false; }
  }

  function staffLogin(username, password) {
    return username === STAFF_USERNAME && password === STAFF_PASSWORD;
  }

  function setStaffSession() {
    try { sessionStorage.setItem(KEY_SESSION) === 'true'; } catch(e) {}
  }

  function staffLogout() {
    try { sessionStorage.removeItem(KEY_SESSION); } catch(e) {}
    window.location.href = 'login.html';
  }

  function findUser(username, password = "") {
    const users = getUsers();
    if (password === "") {
      return users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }
    return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  }

  function registerUser(username, email, password) {
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return null;
    const newUser = { username, email, password, registeredAt: Date.now() };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  function createTicket(username, subject, firstMessage) {
    const tickets = getTickets();
    const newTicket = {
      id: Math.floor(1000 + Math.random() * 9000),
      username,
      subject,
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
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === parseInt(ticketId, 10));
    if (ticket) {
      ticket.messages.push({ sender, role, text, time: Date.now() });
      saveTickets(tickets);
    }
  }

  function closeTicket(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === parseInt(ticketId, 10));
    if (ticket) {
      ticket.status = 'closed';
      saveTickets(tickets);
    }
  }

  function publishNews(content) {
    const news = getNews();
    news.unshift({ content, publishedAt: Date.now() });
    saveNews(news);
  }

  function updateLeaderboard(username, points) {
    const lb = getLeaderboard();
    const entry = lb.find(e => e.username.toLowerCase() === username.toLowerCase());
    if (entry) entry.points = points;
    else lb.push({ username, points });
    lb.sort((a, b) => b.points - a.points);
    saveLeaderboard(lb);
  }

  function renderDashboard() {
    if (!isStaffLoggedIn()) {
      window.location.replace('login.html');
      return;
    }
    renderStats();
    renderTicketsAdmin();
    renderLeaderboardAdmin();
  }

  function renderStats() {
    const users = getUsers();
    const tickets = getTickets();
    const openTickets = tickets.filter(t => t.status === 'open');

    const uEl = document.getElementById('stat-total-users');
    const tEl = document.getElementById('stat-active-tickets');
    if (uEl) uEl.textContent = users.length;
    if (tEl) tEl.textContent = openTickets.length;
  }

  function renderTicketsAdmin() {
    const container = document.getElementById('dash-tickets-container');
    if (!container) return;
    const tickets = getTickets();

    if (tickets.length === 0) {
      container.innerHTML = `<div style="color:var(--text-dim);padding:16px;text-align:center;">Nessun ticket in coda.</div>`;
      return;
    }

    container.innerHTML = tickets.map(t => `
      <div class="card-container" style="margin-bottom:16px; border:1px solid ${t.status === 'open' ? 'rgba(0,210,255,0.2)' : 'rgba(255,0,85,0.1)'};">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.8rem;">
          <span style="color:var(--neon-blue); font-weight:bold;">TICKET #${t.id} — ${t.subject}</span>
          <span style="color:${t.status === 'open' ? 'var(--neon-green)' : 'var(--neon-red)'}; font-weight:bold;">[${t.status.toUpperCase()}]</span>
        </div>
        <div id="chat-${t.id}" style="max-height:150px; overflow-y:auto; background:rgba(0,0,0,0.3); padding:8px; margin-bottom:8px; border-radius:4px; font-family:monospace;">
          ${t.messages.map(m => `
            <div style="font-size:0.8rem; margin-bottom:4px;">
              <span style="color:${m.role === 'staff' ? 'var(--neon-red)' : 'var(--neon-blue)'}">[${m.sender}]</span>
              <span style="color:#fff;">${m.text}</span>
            </div>
          `).join('')}
        </div>
        ${t.status === 'open' ? `
          <div style="display:flex; gap:8px;">
            <input type="text" id="reply-${t.id}" placeholder="Rispondi..." style="flex:1; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:6px;" />
            <button class="btn btn-blue" onclick="GLITCH.staffReply(${t.id})" style="padding:4px 12px; font-size:0.8rem; cursor:pointer;">Invia</button>
            <button class="btn btn-red" onclick="GLITCH.staffClose(${t.id})" style="padding:4px 12px; font-size:0.8rem; cursor:pointer;">Chiudi</button>
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
      tbody.innerHTML = '<tr><td colspan="2" style="color:var(--text-dim);text-align:center;padding:16px;">Nessun utente registrato.</td></tr>';
      return;
    }
    tbody.innerHTML = lb.map((e, i) => `
      <tr>
        <td style="padding:6px 0;">${i + 1}. ${e.username}</td>
        <td style="color:var(--neon-green); text-align:right;">${e.points}</td>
      </tr>
    `).join('');
  }

  function staffReply(ticketId) {
    const input = document.getElementById('reply-' + ticketId);
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

  return {
    staffLogin,
    registerUser,
    findUser,
    createTicket,
    addTicketMessage,
    getTickets,
    closeTicket,
    publishNews,
    getNews,
    updateLeaderboard,
    getLeaderboard,
    isStaffLoggedIn,
    setStaffSession,
    staffLogout,
    staffReply,
    staffClose,
    renderDashboard
  };

})();

window.doLogout = function() {
  GLITCH.staffLogout();
};
