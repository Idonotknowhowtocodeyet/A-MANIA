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

let score = 0;
let multiplier = 1.0;
let playerName = prompt("ENTER YOUR EMPIRE NAME:") || "Anon_" + Math.floor(Math.random()*999);

const aElement = document.getElementById('big-a');
const scoreElement = document.getElementById('score-val');
const multiElement = document.getElementById('multi-box');
const topList = document.getElementById('top-list');
const chatInput = document.getElementById('chat-input');
const chatDisplay = document.getElementById('chat-display');

// MASHING LOGIC
window.addEventListener('keydown', (e) => {
    if (document.activeElement.id === 'chat-input') return;

    if (e.key.toLowerCase() === 'a') {
        score++;
        multiplier = Math.min(multiplier + 0.05, 20.0);
        scoreElement.innerText = score;
        multiElement.innerText = "x" + multiplier.toFixed(1);
        aElement.style.transform = `scale(${1 + (multiplier * 0.02)})`;
        setTimeout(() => aElement.style.transform = "scale(1)", 50);
        update(ref(db, 'leaderboard/' + playerName), { clicks: increment(1) });
    } else if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
        multiplier = 1.0;
        multiElement.innerText = "x1.0";
        aElement.innerText = "WRONG";
        document.body.classList.add('wrong-flash');
        setTimeout(() => {
            aElement.innerText = "A";
            document.body.classList.remove('wrong-flash');
        }, 200);
    }
});

// LEADERBOARD UPDATE
onValue(ref(db, 'leaderboard'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const sorted = Object.entries(data).sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 8);
        topList.innerHTML = sorted.map((p, i) => `<div>${i+1}. ${p[0].substring(0,10)}: ${p[1].clicks}</div>`).join('');
    }
});

// CHAT SYSTEM
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
        chatDisplay.innerHTML = Object.values(messages).slice(-10).map(m => `<div>${m.msg}</div>`).join('');
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
});
