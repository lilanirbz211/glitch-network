/**
 * ── GLITCH OPERATIONS CORE ENGINE v5.0 ──
 * INTERFACCIA GLOBALE E CONFIGURAZIONE SICUREZZA
 */

const STAFF_USER = "GLITCH_SYS_CORE_99X!";
const STAFF_PASS = "K4yn3#S1lv3r";

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        if (!window.GLITCH.isStaffLoggedIn()) {
            window.location.replace('login.html');
            return;
        }
        renderUsersInDashboard();
        renderTicketsInDashboard();
    }

    setInterval(() => {
        if (window.location.pathname.includes('dashboard.html')) {
            renderUsersInDashboard();
            renderTicketsInDashboard();
            updateDashboardStats();
        }
    }, 1000);
});

window.GLITCH = {
    isStaffLoggedIn: function() {
        return sessionStorage.getItem('auth') === 'true';
    },

    staffLogin: function(username, password) {
        return username === STAFF_USER && password === STAFF_PASS;
    },

    setStaffSession: function() {
        sessionStorage.setItem('auth', 'true');
    },

    findUser: function(username, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        return usersDb.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    },

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

window.doStaffLogout = function() {
    sessionStorage.removeItem('auth');
    window.location.href = 'login.html';
};

function renderUsersInDashboard() {
    const container = document.getElementById('dash-users-list');
    if (!container) return;

    let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
    if (usersDb.length === 0) {
        container.innerHTML = '<div style="color:rgba(255,255,255,0.25); font-size:0.8rem; font-style:italic;">Nessun operatore nel database.</div>';
        return;
    }

    container.innerHTML = usersDb.map(u => {
        return `<div style="padding:8px 12px; background:rgba(255,255,255,0.02); border-left:2px solid #00d2ff; margin-bottom:6px; font-size:0.8rem; display:flex; justify-content:space-between;">
            <span style="color:#fff; font-family:monospace;">[OP] ${u.username}</span>
            <span style="color:rgba(255,255,255,0.4);">${u.email}</span>
        </div>`;
    }).join('');
}

function renderTicketsInDashboard() {
    const container = document.getElementById('dash-tickets-container');
    if (!container) return;

    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if (!ticket) {
        container.innerHTML = '<div style="color:rgba(255,255,255,0.25); font-size:0.8rem; font-style:italic;">Nessuna richiesta di assistenza in coda.</div>';
        return;
    }

    container.innerHTML = `
        <div style="border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.4); padding: 14px; border-radius: 4px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:0.8rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;">
                <span style="color:#ff0055; font-weight:bold;">TICKET BACKLOG #${ticket.id}</span>
                <span style="color:#00d2ff;">Operatore: ${ticket.username} [${ticket.subject}]</span>
            </div>
            <div id="staff-chat-box" style="height:160px; overflow-y:auto; background:rgba(0,0,0,0.6); padding:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">
                ${ticket.messages.map(m => {
                    let color = (m.sender === "STAFF" || m.sender === "SYSTEM") ? '#ff0055' : '#00d2ff';
                    return `<div style="font-size:0.8rem; margin-bottom:6px;">
                        <span style="color:${color}; font-weight:bold;">[${m.sender}]</span> <span>${m.text}</span>
                    </div>`;
                }).join('')}
            </div>
            <div style="display:flex; gap:8px;">
                <input type="text" id="staff-chat-input" style="flex:1; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 10px;" placeholder="Rispondi all'operatore..." onkeypress="if(event.key==='Enter')sendStaffMessage()" autocomplete="off"/>
                <button onclick="sendStaffMessage()" style="background:#ff0055; border:none; color:#fff; padding:6px 16px; cursor:pointer;">INVIA</button>
                <button onclick="closeLiveTicket()" style="background:rgba(255,255,255,0.08); border:none; color:#bbb; padding:6px 10px; cursor:pointer;">CHIUDI</button>
            </div>
        </div>
    `;
    let box = document.getElementById('staff-chat-box');
    if(box) box.scrollTop = box.scrollHeight;
}

window.sendStaffMessage = function() {
    const input = document.getElementById('staff-chat-input');
    if (!input || !input.value.trim()) return;

    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if (ticket) {
        ticket.messages.push({ sender: "STAFF", role: "staff", text: input.value.trim(), time: Date.now() });
        localStorage.setItem('glitch_live_ticket', JSON.stringify(ticket));
        input.value = '';
        renderTicketsInDashboard();
    }
};

window.closeLiveTicket = function() {
    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if(ticket) {
        localStorage.removeItem('glitch_live_ticket');
        renderTicketsInDashboard();
    }
};

function updateDashboardStats() {
    const totalUsersEl = document.getElementById('stat-total-users');
    const activeTicketsEl = document.getElementById('stat-active-tickets');
    let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
    let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
    if (totalUsersEl) totalUsersEl.textContent = usersDb.length;
    if (activeTicketsEl) activeTicketsEl.textContent = ticket ? "1" : "0";
}
