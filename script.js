/* ═══════════════════════════════════════════════
   GLITCH MOTORE PRINCIPALE — script.js [VERSIONE CORE CORRETTA v5.2]
   Credenziali staff hardcoded incluse.
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

  /* ── HELPERS INTERNI DATO STORAGE ── */
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

  /* ── INTERFACCIA SICUREZZA & CORE AUTENTICAZIONE ── */
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

  /* FindUser: Serve all'accesso e al controllo duplicati */
  function findUser(username, password) {
    var users = getUsers();
    if (password === "") {
      // Se cerchiamo senza password, verifichiamo solo se l'utente esiste già (per la registrazione)
      return users.find(function(u) { return u.username.toLowerCase() === username.toLowerCase(); });
    }
    // Altrimenti eseguiamo il login completo controllando anche la password
    return users.find(function(u) { 
      return u.username.toLowerCase() === username.toLowerCase() && u.password === password; 
    });
  }

  /* RegisterUser: Salva i dati dell'operatore post verifica OTP */
  function registerUser(username, email, password) {
    var users = getUsers();
    if (users.some(function(u) { return u.username.toLowerCase() === username.toLowerCase(); })) {
      return null; // Utente già esistente
    }
    var newUser = {
      username: username,
      email: email,
      password: password,
      registeredAt: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser; // Ritorna l'utente appena creato all'HTML
  }

  /* ── GESTIONE TICKET E CHAT LIVE ── */
  function createTicket(username, subject, firstMessage) {
    var tickets = getTickets();
    var newTicket = {
      id: Math.floor(1000 + Math.random() * 9000),
      username: username,
      subject: subject,
      status: 'open',
      createdAt: Date.now(),
      messages: [
        { sender: 'SYSTEM', role: 'staff', text: 'Connessione crittografata stabilita. Terminale operativo.', time: Date.now() },
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
      ticket.messages.push({
        sender: sender,
        role: role, // 'user' o 'staff'
        text: text,
        time: Date.now()
      });
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

  /* ── ALTRE COMPONENTI DI RETE (NEWS & CLASSIFICA) ── */
  function publishNews(content) {
    var news = getNews();
    news.unshift({
      content: content,
      publishedAt: Date.now()
    });
    saveNews(news);
  }

  function updateLeaderboard(username, points) {
    var lb = getLeaderboard();
    var entry = lb.find(function(e) { return e.username.toLowerCase() === username.toLowerCase(); });
    if (entry) {
      entry.points = points;
    } else {
      lb.push({ username: username, points: points });
    }
    // Ordina la classifica dal punteggio più alto a quello più basso
    lb.sort(function(a, b) { return b.points - a.points; });
    saveLeaderboard(lb);
  }

  /* ── LOGICA DI RENDERING INTERNA PER LA DASHBOARD STAFF ── */
  function renderDashboard() {
    // Controllo sicurezza globale per l'accesso alla pagina della dashboard
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
    const container = document.getElementById('dash-tickets-container');
    if (!container) return;

    var tickets = getTickets();
    var openTickets = tickets.filter(function(t) { return t.status === 'open'; });

    if (openTickets.length === 0) {
      container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem; font-style:italic; padding:10px;">Nessuna richiesta di assistenza in coda.</div>';
      return;
    }

    container.innerHTML = openTickets.map(t => `
      <div style="border: 1px solid rgba(138,43,226,0.3); background: rgba(5,5,16,0.6); padding: 14px; border-radius: 4px; margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">
          <span style="color:var(--neon-red); font-weight:bold;">TICKET BACKLOG #${t.id}</span>
          <span style="color:var(--neon-blue);">Operatore: ${t.username} [${t.subject}]</span>
        </div>
        
        <div id="chat-${t.id}" style="height:140px; overflow-y:auto; background:rgba(0,0,0,0.4); padding:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">
          ${t.messages.map(m => {
            let color = m.role === 'staff' ? 'var(--neon-red)' : 'var(--neon-blue)';
            return `<div style="font-size:0.8rem; margin-bottom:6px;">
              <span style="color:${color}; font-weight:bold;">[${m.sender}]</span> <span style="color:#fff;">${m.text}</span>
            </div>`;
          }).join('')}
        </div>

        <div style="display:flex; gap:8px;">
          <input type="text" id="reply-${t.id}" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 10px; font-family:monospace;" placeholder="Rispondi all'utente..." onkeypress="if(event.key==='Enter')GLITCH.staffReply(${t.id})" autocomplete="off"/>
          <button onclick="GLITCH.staffReply(${t.id})" style="background:var(--neon-blue); border:none; color:#000; padding:6px 16px; font-weight:bold; cursor:pointer; font-family:'Share Tech Mono';">INVIA</button>
          <button onclick="GLITCH.staffClose(${t.id})" style="background:var(--neon-red); border:none; color:#fff; padding:6px 12px; cursor:pointer; font-family:'Share Tech Mono';">CHIUDI</button>
        </div>
      </div>
    `).join('');

    // Auto scroll verso il basso per le chat aperte nella dashboard dello staff
    openTickets.forEach(t => {
      const box = document.getElementById('chat-' + t.id);
      if (box) box.scrollTop = box.scrollHeight;
    });
  }

  function renderLeaderboardAdmin() {
    const tbody = document.getElementById('lb-admin-tbody');
    if (!tbody) return;
    const lb = getLeaderboard();
    if (lb.length === 0) {
      tbody.innerHTML = '<tr><td colspan=\"2\" style=\"color:var(--text-dim);text-align:center;padding:16px;\">Nessuna voce ancora.</td></tr>';
      return;
    }
    tbody.innerHTML = lb.map((e, i) => `
      <tr>
        <td>${i + 1}. ${e.username}</td>
        <td style=\"color:var(--neon-green);\">${e.points}</td>
      </tr>
    `).join('');
  }

  /* ── EVENTI CONTROLLO IN TEMPO REALE ── */
  function staffReply(ticketId) {
    const input = document.getElementById('reply-' + ticketId);
    if (!input || !input.value.trim()) return;
    addTicketMessage(ticketId, 'STAFF', 'staff', input.value.trim());
    input.value = '';
    renderTicketsAdmin();
  }

  function staffClose(ticketId) {
    if (confirm('Vuoi contrassegnare questo ticket come risolto?')) {
      closeTicket(ticketId);
      renderTicketsAdmin();
      renderStats();
    }
  }

  // Inizializzazione automatica dei cicli della Dashboard se siamo nella pagina dello staff
  document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
      renderDashboard();
      setInterval(renderDashboard, 1500); // Ciclo di aggiornamento live automatico (1.5s)
    }
  });

  /* ── ESPOSIZIONE API GLOBALE PUBBLICA ── */
  return {
    isStaffLoggedIn: isStaffLoggedIn,
    staffLogin: staffLogin,
    setStaffSession: setStaffSession,
    staffLogout: staffLogout,
    findUser: findUser,
    registerUser: registerUser,
    createTicket: createTicket,
    addTicketMessage: addTicketMessage,
    getTickets: getTickets,
    closeTicket: closeTicket,
    publishNews: publishNews,
    getNews: getNews,
    updateLeaderboard: updateLeaderboard,
    getLeaderboard: getLeaderboard,
    staffReply: staffReply,
    staffClose: staffClose
  };

})();

// Scorciatoia globale per permettere al pulsante di disconnessione dello staff di funzionare
window.doLogout = function() {
  GLITCH.staffLogout();
};
