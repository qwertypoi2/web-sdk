const symbols = ['📖', '☕', '🎧', '🕯️', '🌿', '🐱'];
const reels = document.querySelectorAll('.reel');
const spinButton = document.querySelector('button');
const balanceDisplay = document.querySelector('.stats');

let balance = 1000;

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (balance < 10) {
        alert("Not enough credits!");
        return;
    }

    balance -= 10;
    balanceDisplay.innerText = `Balance: $${balance}`;
    spinButton.disabled = true;

    reels.forEach((reel, index) => {
        // Start a fast "blur" animation by changing symbols rapidly
        const interval = setInterval(() => {
            reel.innerText = getRandomSymbol();
        }, 100);

        // Staggered stop: Reel 0 stops at 1s, Reel 1 at 1.5s, Reel 2 at 2s
        setTimeout(() => {
            clearInterval(interval);
            reel.innerText = getRandomSymbol();
            
            // If it's the last reel, re-enable the button and check win
            if (index === reels.length - 1) {
                spinButton.disabled = false;
                checkWin();
            }
        }, 1000 + (index * 500));
    });
}

function checkWin() {
    const results = Array.from(reels).map(r => r.innerText);
    if (results[0] === results[1] && results[1] === results[2]) {
        balance += 100;
        balanceDisplay.innerText = `Balance: $${balance} - YOU WIN!`;
    }
}

spinButton.addEventListener('click', spin);
