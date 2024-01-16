const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

let paddleWidth = 10;
let paddleHeight = 100;
let ballRadius = 10;

// Paddle positions
let paddleY = (canvas.height - paddleHeight) / 2;
let opponentPaddleY = paddleY;

// Ball position and velocity
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 2;
let ballSpeedY = 2;

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles and ball
    // ...

    requestAnimationFrame(draw);
}

draw();
