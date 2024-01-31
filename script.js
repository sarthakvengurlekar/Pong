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
let ballSpeedX = 2;
let ballSpeedY = 2;

let leftPaddleSpeed = 0;
let rightPaddleSpeed = 0;
const paddleMoveSpeed = 3;
const aiPaddleMoveSpeed = 1;

let scorePlayer1 = 0;
let scorePlayer2 = 0;

const scoreLimit = 7;

let gameMode = null; // "AI" or "Versus"
let gameStarted = false;

document.getElementById('playAI').addEventListener('click', function() {
    gameMode = 'AI';
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';
    gameLoop();
});

document.getElementById('playVersus').addEventListener('click', function() {
    gameMode = 'Versus';
    gameStarted = true;
    document.getElementById('startScreen').style.display = 'none';
    gameLoop();
});

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
function gameLoop() {
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

        if (ballX < 0) {
            scorePlayer2++;
            if(scorePlayer2 >= scoreLimit){
                endGame('Player 2 wins!');
                return; //Stop game loop
            }
        } else if (ballX > canvas.width) {
            scorePlayer1++;
            if(scorePlayer1 >= scoreLimit){
                endGame('Player 1 wins!');
                return;
            }
        }
        // Randomize ball spawn position
        ballX = canvas.width / 2;
        ballY = Math.random() * (canvas.height - ballSize * 2) + ballSize;

        // Randomize ball direction
        ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 2;
        ballSpeedY = (Math.random() * 4 - 2); // Random speed between -2 and 2
        

    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

function endGame(winnerMessage) {
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
    document.getElementById('startScreen').style.display = 'none';
    
}

document.getElementById('playAI').addEventListener('click', function() {
    resetGame();
    gameMode = 'AI';
    gameLoop();
});

document.getElementById('playVersus').addEventListener('click', function() {
    resetGame();
    gameMode = 'Versus';
    gameLoop();
});


// Start game
//gameLoop();
