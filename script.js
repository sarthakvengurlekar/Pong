// script.js

// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game elements
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 8;
let ballSpeedY = 8;

let leftPaddleSpeed = 0;
let rightPaddleSpeed = 0;
const paddleMoveSpeed = 6;
const aiPaddleMoveSpeed = 3;

let scorePlayer1 = 0;
let scorePlayer2 = 0;

const scoreLimit = 7;

let lastTime = 0;
const timeStep = 1000 / 60; // 60 updates per second

let gameMode = null;
let gameStarted = false; // "AI" or "Versus"
let gameRunning = false; // Flag to control game loop

document.getElementById('playAI').addEventListener('click', function() {
    startGame('AI');
});

document.getElementById('playVersus').addEventListener('click', function() {
    startGame('Versus');
});

// Function to start the game
function startGame(mode) {
    if (!gameStarted) {
        gameMode = mode;
        gameStarted = true;
        gameRunning = true;
        document.getElementById('startScreen').style.display = 'none';
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners for key down and key up
document.addEventListener('keydown', function(event) {
    if (event.key === 'w') leftPaddleSpeed = -paddleMoveSpeed;
    if (event.key === 's') leftPaddleSpeed = paddleMoveSpeed;
    if (event.key === 'ArrowUp') rightPaddleSpeed = -paddleMoveSpeed;
    if (event.key === 'ArrowDown') rightPaddleSpeed = paddleMoveSpeed;
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'w' || event.key === 's') leftPaddleSpeed = 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') rightPaddleSpeed = 0;
});

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillText(`Player 1: ${scorePlayer1}`, 100, 30);
    ctx.fillText(`Player 2: ${scorePlayer2}`, canvas.width - 200, 30);
}

// Game loop
function gameLoop(timestamp) {

    if (!gameRunning) return; // Stop the game loop if gameRunning is false

    let deltaTime = timestamp - lastTime;
    if (deltaTime >= timeStep) {
        lastTime = timestamp - (deltaTime % timeStep);
        updateGame();
    }

    drawEverything();
    requestAnimationFrame(gameLoop);

}

function updateGame(){

    // Update ball position
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (gameMode === 'AI') {
        let paddleCenter = rightPaddleY + paddleHeight / 2;
        if (ballY > paddleCenter + aiPaddleMoveSpeed) {
            rightPaddleSpeed = aiPaddleMoveSpeed;
        } else if (ballY < paddleCenter - aiPaddleMoveSpeed) {
            rightPaddleSpeed = -aiPaddleMoveSpeed;
        } else {
            rightPaddleSpeed = 0;
        }
    }

    //Update paddle positions
    leftPaddleY += leftPaddleSpeed;
    rightPaddleY += rightPaddleSpeed;

    // Prevent left paddle from going off the screen
    if (leftPaddleY < 0) {
        leftPaddleY = 0;
    } else if (leftPaddleY + paddleHeight > canvas.height) {
        leftPaddleY = canvas.height - paddleHeight;
    }

    // Prevent right paddle from going off the screen
    if (rightPaddleY < 0) {
        rightPaddleY = 0;
    } else if (rightPaddleY + paddleHeight > canvas.height) {
        rightPaddleY = canvas.height - paddleHeight;
    }

    if (ballY - ballSize < 0 || ballY + ballSize > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Collision with paddles
    if ((ballX - ballSize < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
        (ballX + ballSize > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)) {

        // Invert horizontal speed
        ballSpeedX = -ballSpeedX;
        // Calculate hit position on the paddle (0 at center, 1 at edges)
        let hitPosition;
        if (ballX < canvas.width / 2) { // Collision with left paddle
            hitPosition = (ballY - (leftPaddleY + paddleHeight / 2)) / paddleHeight;
        } else { // Collision with right paddle
            hitPosition = (ballY - (rightPaddleY + paddleHeight / 2)) / paddleHeight;
        }

        // Adjust ball's vertical speed based on hit position
        ballSpeedY = hitPosition * 5; // Multiply by a factor to control effect
    }

    // Ball passes paddle (scoring and reset)
    if (ballX < 0 || ballX > canvas.width) {

        // Increment score
        if (ballX < 0) scorePlayer2++;
        else scorePlayer1++;

        // Check for game end
        if(scorePlayer1 >= scoreLimit || scorePlayer2 >= scoreLimit){
            endGame(scorePlayer1 >= scoreLimit ? 'Player 1 wins!' : 'Player 2 wins!');
            return;
        }
        // Reset ball position and speed
        ballX = canvas.width / 2;
        ballY = Math.random() * (canvas.height - ballSize * 2) + ballSize;
        ballSpeedY = 8 * (Math.random() > 0.5 ? 1 : -1); 
        ballSpeedX = 8 * (Math.random() > 0.5 ? 1 : -1); 
        
        // Ensure the game loop doesn't stop prematurely
        if (gameMode === null) {
        return;
        }

    }
    
}

function drawEverything(){
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawScore();
    
    // Draw left paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    
    // Draw right paddle
    ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
}

function endGame(winnerMessage) {

    gameRunning = false; // Stop the game loop
    // Hiding the canvas to prevent further interaction
    canvas.style.display = 'none';

    // Creating a victory message element
    let victoryMessage = document.createElement('div');
    victoryMessage.id = 'victoryMessage';
    victoryMessage.textContent = winnerMessage;

    // Adding a restart button
    let restartButton = document.createElement('button');
    restartButton.textContent = 'Restart';
    restartButton.addEventListener('click', function() {
        document.location.reload(); // Reloads the page to restart the game
    });

    // Append the victory message and restart button to the body
    document.body.appendChild(victoryMessage);
    document.body.appendChild(restartButton);
}

// Reset game state
function resetGame() {
    scorePlayer1 = 0;
    scorePlayer2 = 0;
    gameStarted = true;
    leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    rightPaddleY = canvas.height / 2 - paddleHeight / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 8;
    ballSpeedY = 8;
    document.getElementById('startScreen').style.display = 'none';
    
}

document.getElementById('playAI').addEventListener('click', function() {
    if (!gameStarted) {
        resetGame();
        gameMode = 'AI';
        gameRunning = true;
        gameLoop();
    }
});

document.getElementById('playVersus').addEventListener('click', function() {
    if (!gameStarted) {
        resetGame();
        gameMode = 'Versus';
        gameRunning = true;
        gameLoop();
    }
});


// Start game
//gameLoop();
