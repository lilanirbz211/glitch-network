/**
 * GLITCH OPERATIONS CORE ENGINE v2.0 - VERCEL EDITION
 */

// Hardcoded Staff Credentials
const STAFF_USER = "GLITCH_SYS_CORE_99X!";
const STAFF_PASS = "K4yn3#S1lv3r";

// Inizializzazione automatica quando la pagina è pronta
document.addEventListener('DOMContentLoaded', () => {
    // Sicurezza Dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        if (sessionStorage.getItem('auth') !== 'true') {
            window.location.replace('login.html');
            return;
        }
    }

    // Aggiornamento dati in tempo reale ogni secondo
    setInterval(() => {
        if (typeof checkLiveTicketStatus === 'function') checkLiveTicketStatus();
        if (typeof renderUsersInDashboard === 'function') renderUsersInDashboard();
    }, 1000);
});

// Oggetto globale GLITCH per l'interfaccia di assistenza.html
window.GLITCH = {
    // Trova l'utente per il login pubblico
    findUser: function(username, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        return usersDb.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    },

    // Registra l'utente nel database locale dopo l'OTP
    registerUser: function(username, email, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        if (usersDb.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, message: 'Questo operatore esiste già nel core.' };
        }
        let newUser = { username: username, email: email, password: password };
        usersDb.push(newUser);
        localStorage.setItem('glitch_users_db', JSON.stringify(usersDb));
        return { success: true, user: newUser };
    },

    // Gestione dei Ticket
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
                { sender: 'SYSTEM', role: 'staff', text: 'Connessione protetta stabilita. Attendi lo Staff.', time: Date.now() },
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

// Funzione di Login per lo Staff Portal (login.html)
window.doStaffLogin = function() {
    const u = document.getElementById('user-id').value.trim();
    const p = document.getElementById('pass-key').value.trim();
    const errorBox = document.getElementById('login-error-msg');

    if (u === STAFF_USER && p === STAFF_PASS) {
        sessionStorage.setItem('auth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        if (errorBox) {
            errorBox.innerText = "CHIAVE RIFIUTATA: Credenziali Staff Errate.";
            errorBox.style.display = 'block';
        }
    }
};
