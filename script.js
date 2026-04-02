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

const VERSION = "1.0.6";
let score = 0, multiplier = 1.0, eventMult = 1, isTsunami = false, isQuake = false;
let playerName = prompt("EMPIRE NAME:") || "Anon" + Math.floor(Math.random()*99);

const aElem = document.getElementById('big-a');
const bar = document.getElementById('event-bar');

// AUDIO
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function sfx(f) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(0.05, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.1);
}

// ADMIN UI
const adminDiv = document.createElement('div');
adminDiv.id = "admin-panel-ui";
adminDiv.style = "position:fixed; bottom:50px; left:10px; display:none; background:#000; border:2px solid red; padding:10px; z-index:2000;";
adminDiv.innerHTML = `<b style="color:red">ADMIN</b><br>
<button id="btn-t">TSUNAMI</button><button id="btn-q">QUAKE</button><button id="btn-s">STOP</button>`;
document.body.appendChild(adminDiv);

document.getElementById('btn-t').onclick = () => { isTsunami = true; isQuake = false; eventMult = 5; bar.style.display="block"; bar.innerText="🌊 TSUNAMI (5X)"; document.body.style.background="#001a33"; };
document.getElementById('btn-q').onclick = () => { isQuake = true; isTsunami = false; eventMult = 10; bar.style.display="block"; bar.innerText="☢️ QUAKE (10X)"; document.body.classList.add('quake-anim'); };
document.getElementById('btn-s').onclick = () => { isTsunami = false; isQuake = false; eventMult = 1; bar.style.display="none"; document.body.style.background="#000"; document.body.classList.remove('quake-anim'); };

// CORE LOOP
window.addEventListener('keydown', (e) => {
    if (document.activeElement.id === 'chat-input') return;
    if (e.shiftKey && e.code === 'KeyM') adminDiv.style.display = adminDiv.style.display === 'none' ? 'block' : 'none';
    if (e.shiftKey && e.code === 'KeyL') document.getElementById('version-tag').style.display = 'block';

    if (e.key.toLowerCase() === 'a') {
        score += (1 * eventMult);
        multiplier = Math.min(multiplier + 0.05, 20);
        sfx(200 + (multiplier * 20));
        document.getElementById('score-val').innerText = score;
        document.getElementById('multi-box').innerText = "x" + multiplier.toFixed(1);
        aElem.style.transform = isTsunami ? `translateY(${Math.sin(Date.now()/100)*20}px)` : `scale(${1+(multiplier*0.02)})`;
        update(ref(db, 'scores/' + playerName), { score: increment(1 * eventMult) });
    } else if (!['Shift','Control','Alt','Meta','L','M'].includes(e.key)) {
        multiplier = 1; sfx(100); aElem.innerText = "WRONG"; document.body.classList.add('wrong-flash');
        setTimeout(() => { aElem.innerText = "A"; document.body.classList.remove('wrong-flash'); }, 200);
    }
});

// SYNC (Leaderboard/Chat)
onValue(ref(db, 'scores'), (s) => {
    const d = s.val(); if (d) {
        const sorted = Object.entries(d).sort((a,b)=>b[1].score-a[1].score).slice(0,8);
        document.getElementById('top-list').innerHTML = sorted.map((p,i)=>`<div>${i+1}. ${p[0].substring(0,8)}: ${p[1].score}</div>`).join('');
    }
});
