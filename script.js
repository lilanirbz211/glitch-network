/**
 * ── GLITCH OPERATIONS CORE ENGINE v4.2 ──
 * INTERFACCIA COMPATIBILE AL 100% CON PORTALE STAFF & ASSISTENZA
 */

// Credenziali di accesso dello Staff Portal
const STAFF_USER = "GLITCH_SYS_CORE_99X!";
const STAFF_PASS = "K4yn3#S1lv3r";

// Inizializzazione automatica e controlli di sicurezza al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Se siamo nella dashboard e lo staff NON è loggato, rimandalo al login
    if (window.location.pathname.includes('dashboard.html')) {
        if (!window.GLITCH.isStaffLoggedIn()) {
            window.location.replace('login.html');
            return;
        }
        // Caricamento dati iniziali del pannello di controllo
        renderUsersInDashboard();
        renderTicketsInDashboard();
    }

    // Aggiornamento dati in tempo reale ogni secondo per la Dashboard Staff
    setInterval(() => {
        if (window.location.pathname.includes('dashboard.html')) {
            renderUsersInDashboard();
            renderTicketsInDashboard();
            updateDashboardStats();
        }
    }, 1000);
});

// ==========================================================
// ── SINCRO GLOBALE GLITCH (Per login.html e assistenza.html) ──
// ==========================================================
window.GLITCH = {
    // Controlla se la sessione dello staff è attiva (usata da login.html)
    isStaffLoggedIn: function() {
        return sessionStorage.getItem('auth') === 'true';
    },

    // Sincronizza le credenziali con lo script di login.html
    staffLogin: function(username, password) {
        return username === STAFF_USER && password === STAFF_PASS;
    },

    // Attiva la sessione sicura (usata da login.html)
    setStaffSession: function() {
        sessionStorage.setItem('auth', 'true');
    },

    // Verifica le credenziali dell'utente nel database pubblico
    findUser: function(username, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        return usersDb.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    },

    // Registra il nuovo utente nel database locale dopo l'OTP
    registerUser: function(username, email, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        if (usersDb.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Questo operatore esiste già nel core.' };
        }
        let newUser = { username: username, email: email, password: password, regDate: Date.now() };
        usersDb.push(newUser);
        localStorage.setItem('glitch_users_db', JSON.stringify(usersDb));
        return { success: true, user: newUser };
    },

    // Gestione interna della coda ticket
    getTickets: function() {
        let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
        return ticket ? [ticket] : [];
    },

    createTicket: function(username, subject, message) {
        let ticket = {
            id: Math.floor(100 + Math.random() * 900),
            username: username,
            subject: subject,
            status: 'open',
            messages: [
                { sender: 'SYSTEM', role: 'staff', text: 'Connessione protetta stabilita. Attendi risposta dello Staff.', time: Date.now() },
                { sender: username, role: 'user', text: message, time: Date.now() }
            ]
        };
        localStorage.setItem('glitch_live_ticket', JSON.stringify(ticket));
        return ticket;
    },

    addTicketMessage: function(ticketId, sender, role, text) {
        let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
        if (ticket) {
            ticket.messages.push({ sender: sender, role: role, text: text, time: Date.now() });
            localStorage.setItem('glitch_live_ticket', JSON.stringify(ticket));
        }
    }
};

// ==========================================================
// ── FUNZIONI COMPLEMENTARI PER LOGOUT E RENDERING DASHBOARD ──
// ==========================================================

// Logout di sicurezza dello Staff (chiamabile dalla dashboard)
window.doStaffLogout = function() {
    sessionStorage.removeItem('auth');
    window.location.href = 'login.html';
};

// Genera la lista degli utenti registrati per la Dashboard dello Staff
function renderUsersInDashboard() {
    const container = document.getElementById('dash-users-list');
    if (!container) return;

    let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
    if (usersDb.length === 0) {
        container.innerHTML = '<div style="color:rgba(255,255,255,0.25); font-size:0.8rem; font-style:italic;">Nessun operatore memorizzato nel Core Database.</div>';
        return;
    }

    container.innerHTML = usersDb.map(u => {
        return `<div style="padding:8px 12px; background:rgba(255,255,255,0.02); border-left:2px solid #00d2ff; margin-bottom:6px; font-size:0.8rem; display:flex; justify-content:space-between; border-radius: 2px;">
            <span style="color:#fff; font-family:monospace;">[OP] ${u.username}</span>
            <span style="color:rgba(255,255,255,0.4);">${u.email}</span>
        </div>`;
    }).join('');
}

// Genera e aggiorna la Chat Interattiva dei Ticket nella Dashboard dello Staff
function renderTicketsInDashboard() {
    const container = document.getElementById('dash-tickets-container');
    if (!container) return;

    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if (!ticket) {
        container.innerHTML = '<div style="color:rgba(255,255,255,0.25); font-size:0.8rem; font-style:italic;">Nessuna richiesta di assistenza in coda.</div>';
        return;
    }

    container.innerHTML = `
        <div style="border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); padding: 14px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">
                <span style="color:#ff0055; font-weight:bold; letter-spacing:1px;">TICKET BACKLOG #${ticket.id}</span>
                <span style="color:#00d2ff;">Operatore: ${ticket.username} [${ticket.subject}]</span>
            </div>
            
            <div id="staff-chat-box" style="height:160px; overflow-y:auto; background:rgba(0,0,0,0.6); padding:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05); border-radius:2px;">
                ${ticket.messages.map(m => {
                    let labelColor = (m.sender === "STAFF" || m.sender === "SYSTEM") ? '#ff0055' : '#00d2ff';
                    return `<div style="font-size:0.8rem; margin-bottom:6px; line-height:1.4;">
                        <span style="color:${labelColor}; font-weight:bold;">[${m.sender}]</span> 
                        <span style="color:rgba(255,255,255,0.9);">${m.text}</span>
                    </div>`;
                }).join('')}
            </div>

            <div style="display:flex; gap:8px;">
                <input type="text" id="staff-chat-input" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 10px; font-size:0.8rem; border-radius:2px;" placeholder="Digitare stringa di risposta..." onkeypress="if(event.key==='Enter')sendStaffMessage()" autocomplete="off" />
                <button onclick="sendStaffMessage()" style="background:#ff0055; border:none; color:#fff; padding:6px 16px; font-size:0.8rem; font-weight:bold; cursor:pointer; border-radius:2px;">INVIA</button>
                <button onclick="closeLiveTicket()" style="background:rgba(255,255,255,0.08); border:none; color:#bbb; padding:6px 10px; font-size:0.8rem; cursor:pointer; border-radius:2px;">CHIUDI</button>
            </div>
        </div>
    `;
    
    let box = document.getElementById('staff-chat-box');
    if(box) box.scrollTop = box.scrollHeight;
}

// Invia un messaggio di risposta dallo staff all'utente finale
window.sendStaffMessage = function() {
    const input = document.getElementById('staff-chat-input');
    if (!input || !input.value.trim()) return;

    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if (ticket) {
        ticket.messages.push({
            sender: "STAFF",
            role: "staff",
            text: input.value.trim(),
            time: Date.now()
        });
        localStorage.setItem('glitch_live_ticket', JSON.stringify(ticket));
        input.value = '';
        renderTicketsInDashboard();
    }
};

// Archivia il ticket attivo cancellandolo dallo schermo
window.closeLiveTicket = function() {
    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if(ticket) {
        ticket.status = 'closed';
        localStorage.removeItem('glitch_live_ticket');
        renderTicketsInDashboard();
    }
};

// Aggiorna i contatori digitali in alto nella Dashboard
function updateDashboardStats() {
    const totalUsersEl = document.getElementById('stat-total-users');
    const activeTicketsEl = document.getElementById('stat-active-tickets');

    let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));

    if (totalUsersEl) totalUsersEl.textContent = usersDb.length;
    if (activeTicketsEl) activeTicketsEl.textContent = ticket ? "1" : "0";
}
