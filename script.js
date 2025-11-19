const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
    x: 180,
    y: 550,
    width: 40,
    height: 40,
    speed: 6
};

let blocks = [];
let gameOver = false;
let score = 0;
let spawnInterval = 800;
let spawnTimer = null;
let difficultyTimer = null;

// Background music
const bgMusic = new Audio("music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5; // adjust 0–1

// Start music when user interacts
document.addEventListener("click", () => {
    if (bgMusic.paused) bgMusic.play();
});


// Create a falling block (always fully inside canvas horizontally)
function createBlock() {
    const size = 40;
    blocks.push({
        x: Math.random() * (canvas.width - size),
        y: -size,                // start a bit above the canvas
        size: size,
        speed: 3 + Math.random() * 3
    });
}

// clean old blocks (optional), update score when a block passes bottom
function cleanupBlocks() {
    blocks = blocks.filter(b => {
        if (b.y > canvas.height) {
            score += 1; // +1 for each block dodged
            return false; // remove it
        }
        return true;
    });
}

// Proper AABB collision detection
function isColliding(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.width > b.x &&
        a.y < b.y + b.size &&
        a.y + a.height > b.y
    );
}

// Start spawning blocks
function startSpawning() {
    if (spawnTimer) clearInterval(spawnTimer);
    spawnTimer = setInterval(createBlock, spawnInterval);
    // gradually increase difficulty
    if (difficultyTimer) clearInterval(difficultyTimer);
    difficultyTimer = setInterval(() => {
        if (spawnInterval > 300) {
            spawnInterval -= 40;
            clearInterval(spawnTimer);
            spawnTimer = setInterval(createBlock, spawnInterval);
        }
    }, 5000);
}

startSpawning();

// Keyboard movement
let keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function update() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    // move player
    if ((keys["ArrowLeft"] || keys["a"]) && player.x > 0) player.x -= player.speed;
    if ((keys["ArrowRight"] || keys["d"]) && player.x < canvas.width - player.width)
        player.x += player.speed;

    // update blocks
    blocks.forEach(b => b.y += b.speed);

    // check collisions using AABB
    for (let b of blocks) {
        if (isColliding(player, b)) {
            gameOver = true;
            break;
        }
    }

    cleanupBlocks();
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Blocks
    ctx.fillStyle = "orange";
    blocks.forEach(b => ctx.fillRect(b.x, b.y, b.size, b.size));

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Score: " + score, 10, 24);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 60, 300);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.fillText("Score: " + score, 165, 340);
    ctx.fillText("Click to restart", 140, 380);
}

// restart on click
canvas.addEventListener("click", () => {
    if (!gameOver) return;
    // reset state
    blocks = [];
    gameOver = false;
    score = 0;
    spawnInterval = 800;
    startSpawning();
    update();
});

// initial call
update();
