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
const VERSION = "1.0.4";
let eventMultiplier = 1;
let playerName = prompt("ENTER YOUR EMPIRE NAME:") || "Anon_" + Math.floor(Math.random()*999);

// --- AUDIO ENGINE ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playASound(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// --- STATE ---
let score = 0;
let multiplier = 1.0;

const aElement = document.getElementById('big-a');
const scoreElement = document.getElementById('score-val');
const multiElement = document.getElementById('multi-box');
const topList = document.getElementById('top-list');
const chatInput = document.getElementById('chat-input');
const chatDisplay = document.getElementById('chat-display');
const versionTag = document.getElementById('version-tag');
const eventBar = document.getElementById('event-bar');

// --- GAME LOGIC ---
window.addEventListener('keydown', (e) => {
    if (document.activeElement.id === 'chat-input') return;

    // SHIFT + L Version Check
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
        aElement.style.transform = `scale(${1 + (multiplier * 0.02)})`;
        setTimeout(() => aElement.style.transform = "scale(1)", 50);
        
        update(ref(db, 'leaderboard/' + playerName), { clicks: increment(points) });
    } else if (!['Shift', 'Control', 'Alt', 'Meta', 'L', 'l'].includes(e.key)) {
        multiplier = 1.0;
        playASound(100);
        multiElement.innerText = "x1.0";
        aElement.innerText = "WRONG";
        document.body.classList.add('wrong-flash');
        setTimeout(() => {
            aElement.innerText = "A";
            document.body.classList.remove('wrong-flash');
        }, 200);
    }
});

// --- FIREBASE SYNC ---
onValue(ref(db, 'leaderboard'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const sorted = Object.entries(data).sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 8);
        topList.innerHTML = sorted.map((p, i) => `<div>${i+1}. ${p[0].substring(0,10)}: ${p[1].clicks}</div>`).join('');
    }
});

onValue(ref(db, 'currentEvent'), (snapshot) => {
    const event = snapshot.val();
    if (event && event.active) {
        eventMultiplier = event.multiplier || 2;
        eventBar.innerText = event.message || "EVENT ACTIVE!";
        eventBar.style.display = "block";
    } else {
        eventMultiplier = 1;
        eventBar.style.display = "none";
    }
});

// --- CHAT SYSTEM ---
chatInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/[^aA ]/g, ''); });
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && chatInput.value.length > 0) {
        update(ref(db, 'chat/' + Date.now()), { msg: playerName + ": " + chatInput.value });
        chatInput.value = '';
    }
});
onValue(ref(db, 'chat'), (snapshot) => {
    const messages = snapshot.val();
    if (messages) {
        const lastMessages = Object.values(messages).slice(-10);
        chatDisplay.innerHTML = lastMessages.map(m => `<div>${m.msg}</div>`).join('');
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
});
