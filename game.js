const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const characterImg = new Image();
characterImg.src = 'andy.png'; // Replace with your character image path

const goodObjectImg = new Image();
goodObjectImg.src = 'milk.avif'; // Replace with your good object image path

const badObjectImg = new Image();
badObjectImg.src = 'cow.png'; // Replace with your bad object image path

// Game variables
let score = 0;
let lives = 3;
const objects = [];
const objectFrequency = 1000; // milliseconds
let lastObjectTime = Date.now();
let gameOver = false;

// Character properties
const character = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 80,
    height: 80,
    speed: 7,
    dx: 0
};

// Touch controls
let touchX = null;

function drawCharacter() {
    ctx.drawImage(characterImg, character.x, character.y, character.width, character.height);
}

function drawObjects() {
    objects.forEach(obj => {
        if (obj.type === 'good') {
            ctx.drawImage(goodObjectImg, obj.x, obj.y, obj.width, obj.height);
        } else {
            ctx.drawImage(badObjectImg, obj.x, obj.y, obj.width, obj.height);
        }
    });
}

function updateCharacter() {
    character.x += character.dx;

    // Boundary detection
    if (character.x < 0) {
        character.x = 0;
    }
    if (character.x + character.width > canvas.width) {
        character.x = canvas.width - character.width;
    }
}

function createObject() {
    const type = Math.random() < 0.7 ? 'good' : 'bad'; // 70% good, 30% bad
    const size = 50;
    const obj = {
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 3 + 2,
        type: type
    };
    objects.push(obj);
}

function updateObjects() {
    objects.forEach((obj, index) => {
        obj.y += obj.speed;

        // Collision detection
        if (
            obj.x < character.x + character.width &&
            obj.x + obj.width > character.x &&
            obj.y < character.y + character.height &&
            obj.y + obj.height > character.y
        ) {
            if (obj.type === 'good') {
                score += 1;
            } else {
                lives -= 1;
                if (lives <= 0) {
                    gameOver = true;
                }
            }
            objects.splice(index, 1);
        }

        // Remove objects that go off screen
        if (obj.y > canvas.height) {
            objects.splice(index, 1);
        }
    });
}

function drawScore() {
    const scoreBoard = document.getElementById('scoreBoard');
    scoreBoard.innerText = `Score: ${score} | Lives: ${lives}`;
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    if (gameOver) {
        alert(`Game Over! Your score: ${score}`);
        document.location.reload();
        return;
    }

    clear();
    drawCharacter();
    drawObjects();
    updateCharacter();
    updateObjects();
    drawScore();

    requestAnimationFrame(update);
}

function handleKeys(e) {
    if (e.type === 'keydown') {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            character.dx = character.speed;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            character.dx = -character.speed;
        }
    } else if (e.type === 'keyup') {
        if (
            e.key === 'ArrowRight' ||
            e.key === 'ArrowLeft' ||
            e.key === 'd' ||
            e.key === 'a'
        ) {
            character.dx = 0;
        }
    }
}

function handleTouchStart(e) {
    touchX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    if (touchX === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchX;
    character.x += deltaX;
    touchX = currentX;

    // Boundary detection
    if (character.x < 0) {
        character.x = 0;
    }
    if (character.x + character.width > canvas.width) {
        character.x = canvas.width - character.width;
    }
}

function handleTouchEnd(e) {
    touchX = null;
}

window.addEventListener('keydown', handleKeys);
window.addEventListener('keyup', handleKeys);

// Mobile touch controls
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

// Object generation
setInterval(() => {
    if (!gameOver) {
        createObject();
    }
}, objectFrequency);

// Start the game when images are loaded
let imagesLoaded = 0;
const totalImages = 3;

[characterImg, goodObjectImg, badObjectImg].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            update();
        }
    };
});

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    character.y = canvas.height - 100;
});
