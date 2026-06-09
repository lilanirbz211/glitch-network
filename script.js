/**
 * ── GLITCH OPERATIONS CORE ENGINE v4.0 ──
 * SISTEMA INTEGRATO: OPERATORI, CHAT LIVE, STAFF PORTAL & SECURITY
 */

// Credenziali di accesso Hardcoded per lo Staff Portal (login.html)
const STAFF_USER = "GLITCH_SYS_CORE_99X!";
const STAFF_PASS = "K4yn3#S1lv3r";

// Inizializzazione automatica e controlli di sicurezza al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Controllo Sicurezza per la Dashboard dello Staff (dashboard.html)
    if (window.location.pathname.includes('dashboard.html')) {
        if (sessionStorage.getItem('auth') !== 'true') {
            window.location.replace('login.html');
            return;
        }
        // Caricamento iniziale dei dati della dashboard
        renderUsersInDashboard();
        renderTicketsInDashboard();
    }

    // Aggiornamento dati in tempo reale ogni secondo (Sincronizzazione Chat e Statistiche)
    setInterval(() => {
        if (window.location.pathname.includes('dashboard.html')) {
            renderUsersInDashboard();
            renderTicketsInDashboard();
            updateDashboardStats();
        }
    }, 1000);
});

// ==========================================================
// ── OGGETTO GLOBALE GLITCH (Core Database per assistenza.html) ──
// ==========================================================
window.GLITCH = {
    // Verifica le credenziali dell'utente nel database locale per il Login
    findUser: function(username, password) {
        let usersDb = JSON.parse(localStorage.getItem('glitch_users_db')) || [];
        return usersDb.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    },

    // Salva il nuovo utente nel database locale dopo la verifica OTP
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

    // Recupera lo stato del ticket attivo
    getTickets: function() {
        let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
        return ticket ? [ticket] : [];
    },

    // Inizializza un nuovo ticket di supporto live
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

    // Inserisce un nuovo messaggio all'interno della timeline del ticket
    addTicketMessage: function(ticketId, sender, role, text) {
        let ticket = JSON.parse(localStorage.getItem('glitch_live_ticket'));
        if (ticket) {
            ticket.messages.push({ sender: sender, role: role, text: text, time: Date.now() });
            localStorage.setItem('glitch_live_ticket', JSON.stringify(ticket));
        }
    }
};

// ==========================================================
// ── PANNELLO DI CONTROLLO STAFF & LOGICA DASHBOARD ──
// ==========================================================

// Autenticazione Accesso Staff (login.html)
window.doStaffLogin = function() {
    const u = document.getElementById('user-id').value.trim();
    const p = document.getElementById('pass-key').value.trim();
    const errorBox = document.getElementById('login-error-msg');

    if (u === STAFF_USER && p === STAFF_PASS) {
        sessionStorage.setItem('auth', 'true');
        window.location.href = 'dashboard.html';
    } else {
        if (errorBox) {
            errorBox.innerText = "ACCESSO NEGATO: Chiave crittografica err
