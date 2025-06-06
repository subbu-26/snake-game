const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');

const tileCount = 20;
const tileSize = canvas.width / tileCount;

let snake = [{x:10, y:10}];
let velocity = {x:1, y:0};
let food = {x:5, y:5};
let score = 0;

let gameRunning = false;
let gamePaused = false;
let gameInterval = null;
let gameSpeed = parseInt(difficultySelect.value); // ms interval from difficulty selector

// Sounds - Make sure these files are in the same folder as your html/js/css
const eatSound = new Audio('eat.mp3');
const gameOverSound = new Audio('gameover.mp3');
const restartSound = new Audio('restart.mp3');
const pauseSound = new Audio('pause.mp3');
const resumeSound = new Audio('resume.mp3');
const bgMusic = new Audio('bgmusic.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.1;

function placeFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);

  for(let part of snake) {
    if(part.x === food.x && part.y === food.y) {
      placeFood();
      return;
    }
  }
}

function draw() {
  const head = {x: snake[0].x + velocity.x, y: snake[0].y + velocity.y};

  // Check collisions with wall or self
  if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
     snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = 'Score: ' + score;
    eatSound.play();
    placeFood();
  } else {
    snake.pop();
  }

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw semi-transparent overlay for background visibility
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw food
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(food.x * tileSize + tileSize/2, food.y * tileSize + tileSize/2, tileSize/2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw snake
  for(let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? 'lime' : 'lightgreen';
    ctx.fillRect(snake[i].x * tileSize, snake[i].y * tileSize, tileSize - 2, tileSize - 2);
  }
}

function gameOver() {
  gameRunning = false;
  clearInterval(gameInterval);
  gameOverSound.play();
  bgMusic.pause();
  pauseBtn.textContent = 'Pause';
  pauseBtn.disabled = true;
  restartBtn.disabled = true;
  startBtn.disabled = false;
  alert('Game Over! Your score: ' + score);
}

function gameLoop() {
  if(gameRunning && !gamePaused) {
    draw();
  }
}

function startGame() {
  snake = [{x:10, y:10}];
  velocity = {x:1, y:0};
  score = 0;
  scoreEl.textContent = 'Score: 0';
  placeFood();
  gameRunning = true;
  gamePaused = false;
  pauseBtn.textContent = 'Pause';
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  startBtn.disabled = true;

  // get selected difficulty speed
  gameSpeed = parseInt(difficultySelect.value);

  bgMusic.currentTime = 0;
  bgMusic.play();

  if(gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

// Keyboard controls
document.addEventListener('keydown', e => {
  if(!gameRunning || gamePaused) return;

  switch(e.key) {
    case 'ArrowUp':
      if(velocity.y !== 1) velocity = {x: 0, y: -1};
      break;
    case 'ArrowDown':
      if(velocity.y !== -1) velocity = {x: 0, y: 1};
      break;
    case 'ArrowLeft':
      if(velocity.x !== 1) velocity = {x: -1, y: 0};
      break;
    case 'ArrowRight':
      if(velocity.x !== -1) velocity = {x: 1, y: 0};
      break;
  }
});

// Mobile buttons controls
document.getElementById('btnUp').addEventListener('click', () => {
  if(!gameRunning || gamePaused) return;
  if(velocity.y !== 1) velocity = {x: 0, y: -1};
});

document.getElementById('btnDown').addEventListener('click', () => {
  if(!gameRunning || gamePaused) return;
  if(velocity.y !== -1) velocity = {x: 0, y: 1};
});

document.getElementById('btnLeft').addEventListener('click', () => {
  if(!gameRunning || gamePaused) return;
  if(velocity.x !== 1) velocity = {x: -1, y: 0};
});

document.getElementById('btnRight').addEventListener('click', () => {
  if(!gameRunning || gamePaused) return;
  if(velocity.x !== -1) velocity = {x: 1, y: 0};
});

// Pause button logic
pauseBtn.addEventListener('click', () => {
  if(!gameRunning) return;
  gamePaused = !gamePaused;
  if(gamePaused) {
    pauseSound.play();
    pauseBtn.textContent = 'Resume';
    bgMusic.pause();
  } else {
    resumeSound.play();
    pauseBtn.textContent = 'Pause';
    bgMusic.play();
  }
});

// Restart button logic
restartBtn.addEventListener('click', () => {
  if(!gameRunning) return;
  restartSound.play();
  startGame();
});

// Start button logic
startBtn.addEventListener('click', startGame);

// When difficulty changes, restart game if running
difficultySelect.addEventListener('change', () => {
  if(gameRunning) {
    restartSound.play();
    startGame();
  }
});
