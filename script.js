import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, update, onValue, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAu2hb0v7UgWvCikuOjkx4xzl8Pxnl2Qc",
    authDomain: "a-maini.firebaseapp.com",
    databaseURL: "https://a-maini-default-rtdb.firebaseio.com",
    projectId: "a-maini",
    storageBucket: "a-maini.firebasestorage.app",
    messagingSenderId: "212993168417",
    appId: "1:212993168417:web:44d8aa06d3499032323f60",
    measurementId: "G-FJBHGNG4JY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- SETTINGS ---
const VERSION = "1.0.6";
let eventMultiplier = 1;
let isTsunami = false;
let isQuake = false;
let playerName = prompt("ENTER YOUR EMPIRE NAME:") || "Anon_" + Math.floor(Math.random()*999);

// --- AUDIO ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playASound(freq, type = 'square', duration = 0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// --- STATE ---
let score = 0;
let multiplier = 1.0;

const aElement = document.getElementById('big-a');
const scoreElement = document.getElementById('score-val');
const multiElement = document.getElementById('multi-box');
const eventBar = document.getElementById('event-bar');
const versionTag = document.getElementById('version-tag');

// --- EVENT SYSTEM ---
function stopAllEvents() {
    isTsunami = false;
    isQuake = false;
    eventMultiplier = 1;
    document.body.style.background = "#000";
    document.body.classList.remove('quake-anim');
    eventBar.style.display = "none";
}

function startTsunami() {
    stopAllEvents();
    isTsunami = true;
    eventMultiplier = 5;
    document.body.style.background = "#001a33";
    eventBar.style.display = "block";
    eventBar.innerText = "⚠️ BRAINROT TSUNAMI: 5X POINTS! 🌊";
    eventBar.style.background = "#0077be";
}

function startQuake() {
    stopAllEvents();
    isQuake = true;
    eventMultiplier = 10;
    document.body.classList.add('quake-anim');
    eventBar.style.display = "block";
    eventBar.innerText = "☢️ NEON EARTHQUAKE: 10X POINTS! ☢️";
    eventBar.style.background = "#39ff14";
    eventBar.style.color = "#000";
}

// --- ADMIN PANEL LOGIC ---
const adminPanel = document.createElement('div');
adminPanel.id = "admin-panel";
adminPanel.innerHTML = `
    <div style="border: 2px solid red; background: #000; padding: 10px; position: fixed; bottom: 50px; left: 10px; z-index: 2000; display: none;">
        <b style="color: red;">ADMIN CONSOLE</b><br>
        <button onclick="window.triggerTsunami()">🌊 TSUNAMI</button>
        <button onclick="window.triggerQuake()">☢️ QUAKE</button>
        <button onclick="window.resetEvents()">❌ STOP ALL</button>
    </div>
`;
document.body.appendChild(adminPanel);

// Global functions for the buttons to work
window.triggerTsunami = startTsunami;
window.triggerQuake = startQuake;
window.resetEvents = stopAllEvents;

// --- GAME LOGIC ---
window.addEventListener('keydown', (e) => {
    if (document.activeElement.id === 'chat-input') return;

    // SECRET ADMIN COMMAND: Shift + A + M
    if (e.shiftKey && e.code === 'KeyM') {
        const panel = adminPanel.querySelector('div');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        return;
    }

    // Shift + L Version Check
    if (e.shiftKey && e.key.toLowerCase() === 'l') {
        versionTag.style.display = versionTag.style.display === 'block' ? 'none' : 'block';
        return;
    }

    if (e.key.toLowerCase() === 'a') {
        const points = 1 * eventMultiplier;
        score += points;
        multiplier = Math.min(multiplier + 0.05, 20.0);
        playASound(200 + (multiplier * 20));
        
        scoreElement.innerText = score;
        multiElement.innerText = "x" + multiplier.toFixed(1);
        
        if (isTsunami) {
            aElement.style.transform = `scale(1.2) translateY(${Math.sin(Date.now()/100)*20}px)`;
        } else {
            aElement.style.transform = `scale(${1 + (multiplier * 0.02)})`;
        }

        update(ref(db, 'scores/' + playerName), { score: increment(points) });

    } else if (!['Shift', 'Control', 'Alt', 'Meta', 'L', 'l', 'M', 'm'].includes(e.key)) {
        multiplier = 1.0;
        playASound(80, 'sawtooth');
        multiElement.innerText = "x1.0";
        aElement.innerText = "WRONG";
        document.body.classList.add('wrong-flash');
        if (isTsunami || isQuake) score = Math.max(0, score - 50);
        setTimeout(() => { aElement.innerText = "A"; document.body.classList.remove('wrong-flash'); }, 200);
    }
});

// (Leaderboard and Chat code same as before...)
