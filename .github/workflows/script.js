const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

let gameSpeed = 150; // Start slower (approx 6-7 FPS)
let lastRenderTime = 0;
let gameOver = false;

const snake = {
    body: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 }, // Input buffering
    color: '#00ff88',

    draw() {
        snake.body.forEach((segment, index) => {
            ctx.fillStyle = snake.color;
            // Add a slight glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = snake.color;
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
            ctx.shadowBlur = 0; // Reset shadow
        });
    },

    update() {
        const head = { ...snake.body[0] };

        // Update direction from buffer
        snake.direction = snake.nextDirection;

        head.x += snake.direction.x;
        head.y += snake.direction.y;

        // Check Wall Collision
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            checkGameOver();
            return;
        }

        // Check Self Collision
        for (let segment of snake.body) {
            if (head.x === segment.x && head.y === segment.y) {
                checkGameOver();
                return;
            }
        }

        snake.body.unshift(head);

        // Check Food Collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;

            // Adaptive Speed:
            // Stay slow (150ms) until Snake gets long (approx 2 lines worth -> 60 tiles -> 600 score)
            // Then accelerate
            if (score > 600) {
                const speedIncrease = Math.floor((score - 600) / 50);
                // Cap max speed at 40ms (25 FPS)
                gameSpeed = Math.max(40, 150 - speedIncrease);
            }

            food.respawn();

            // Visual feedback could be added here
        } else {
            snake.body.pop();
        }
    }
};

const food = {
    x: 15,
    y: 15,
    color: '#ff0055',

    draw() {
        ctx.fillStyle = food.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = food.color;

        // Draw as a circle/rounded rect for variety
        ctx.beginPath();
        ctx.arc(
            food.x * GRID_SIZE + GRID_SIZE / 2,
            food.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
    },

    respawn() {
        let newX, newY;
        let onSnake;
        do {
            onSnake = false;
            newX = Math.floor(Math.random() * TILE_COUNT);
            newY = Math.floor(Math.random() * TILE_COUNT);

            for (let segment of snake.body) {
                if (segment.x === newX && segment.y === newY) {
                    onSnake = true;
                    break;
                }
            }
        } while (onSnake);

        food.x = newX;
        food.y = newY;
    }
};

function main(currentTime) {
    if (gameOver) return;

    window.requestAnimationFrame(main);

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / (1000 / gameSpeed)) return;

    lastRenderTime = currentTime;

    update();
    draw();
}

function update() {
    snake.update();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    food.draw();
    snake.draw();
}

function checkGameOver() {
    gameOver = true;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function restartGame() {
    snake.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snake.direction = { x: 1, y: 0 };
    snake.nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 150;
    gameOver = false;
    gameOverScreen.classList.add('hidden');
    food.respawn();
    window.requestAnimationFrame(main);
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            if (snake.direction.y !== 0) break;
            snake.nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (snake.direction.y !== 0) break;
            snake.nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (snake.direction.x !== 0) break;
            snake.nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (snake.direction.x !== 0) break;
            snake.nextDirection = { x: 1, y: 0 };
            break;
    }
});

restartBtn.addEventListener('click', restartGame);

// Start game
window.requestAnimationFrame(main);
