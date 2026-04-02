import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, onValue, increment } from "firebase/database";

// YOUR FIREBASE CONFIG GOES HERE
const firebaseConfig = { /* ... your config ... */ };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let count = 0;
let multiplier = 1;
let playerName = "User_" + Math.floor(Math.random() * 9999);

const aDisplay = document.getElementById('big-a');
const countDisplay = document.getElementById('count');
const multiDisplay = document.getElementById('multi');

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'a') {
        // SUCCESS LOGIC
        count++;
        multiplier = Math.min(multiplier + 0.1, 10); // Ramp up multi
        
        // Visuals
        aDisplay.style.transform = `scale(${1 + (multiplier * 0.05)})`;
        countDisplay.innerText = count;
        multiDisplay.innerText = multiplier.toFixed(1);

        // Sync to Firebase
        update(ref(db, 'leaderboard/' + playerName), {
            score: increment(1)
        });

    } else if (key !== 'shift' && key !== 'control') {
        // OPTION 2: THE "WRONG" PENALTY
        multiplier = 1; 
        multiDisplay.innerText = "1";
        document.body.classList.add('wrong');
        aDisplay.innerText = "WRONG";
        
        setTimeout(() => {
            document.body.classList.remove('wrong');
            aDisplay.innerText = "A";
        }, 300);
    }
});

// Update Leaderboard
onValue(ref(db, 'leaderboard'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const sorted = Object.entries(data).sort((a,b) => b[1].score - a[1].score).slice(0, 5);
        document.getElementById('top-list').innerHTML = sorted.map(p => `<div>${p[0]}: ${p[1].score}</div>`).join('');
    }
});
