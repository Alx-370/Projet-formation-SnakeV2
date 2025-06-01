const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let tileCount = 20;
let snake = [
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 }
];

let direction = { x: 1, y: 0 };
let typeFood = ["bonus", "malus"]
let penalities = ["speed", "live", "score"]

let food = spawnFood();
let specialFood = spawnSpecialFood();
let lives = 3;
let score = 0;
let level = 1;
let moveInterval = 200; // ms (vitesse de départ)
let gameSpeed = moveInterval;

let gameInterval = null;

let wallsOn = false;
let gameOver = false;

let paused = false;

///////////////////////////////////////////////////////
//Gameloop
function gameLoop() {
    if (gameOver || paused) return;

    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    snake.unshift(head);

    walls(head);
    foodCollision();
    specialFoodCollision();
    draw();
}


///////////////////////////////////////////////////////
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Efface le canvas

    if (gameOver) {
        ctx.fillStyle = "#fff";
        ctx.fillText("GAME OVER", 150, 200)
        return

    }

    snake.map((segment, i) => {
        ctx.fillStyle = (i === 0) ? "#fcd34d" : "#34d399"; // Jaune pour la tête, vert pour le corps
        ctx.fillRect(segment.x * tileCount, segment.y * tileCount, tileCount, tileCount);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * tileCount, food.y * tileCount, tileCount, tileCount);

    ctx.fillStyle = "blue";
    ctx.fillRect(specialFood.x * tileCount, specialFood.y * tileCount, tileCount, tileCount);

    ctx.font = "18px Arial";
    ctx.fillStyle = "#fcd34d";
    ctx.fillText("Score: " + score, 20, 24);

    ctx.fillStyle = "#7dd3fc";
    ctx.fillText("Niveau: " + level, 320, 24);

    ctx.fillStyle = "red";
    ctx.fillText("Vies: " + lives, 180, 24);

}

//////////////////////////////////////////////////////
//definition des touche pour le déplacement
function handleKeyDown(e) {
    if ((e.key === "ArrowLeft" || e.key === "q") && direction.y != 0) direction = { x: -1, y: 0 };
    if ((e.key === "ArrowRight" || e.key === "d") && direction.y != 0) direction = { x: 1, y: 0 };
    if ((e.key === "ArrowUp" || e.key === "z") && direction.x != 0) direction = { x: 0, y: -1 };
    if ((e.key === "ArrowDown" || e.key === "s") && direction.x != 0) direction = { x: 0, y: 1 };

    if (e.code === "Space") {
        togglePause();
    }
}

gameInterval = setInterval(gameLoop, gameSpeed);
document.addEventListener('keydown', handleKeyDown);
///////////////////////////////////////////////////////
function spawnFood() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
    return position;
}
//////////////////////////////////////////////////////////////////
function spawnSpecialFood() {
    let sp;
    do {
        sp = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            type: typeFood[Math.floor(Math.random() * typeFood.length)],
            penality: penalities[Math.floor(Math.random() * penalities.length)]
        };
    } while (snake.some(segment => segment.x === sp.x && segment.y === sp.y));
    return sp;
}

//////////////////////////////////////////////////////////////
function walls(head) {
    if (wallsOn) {
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            lives--
            snake = [
                { x: 9, y: 9 },
                { x: 8, y: 9 },
                { x: 7, y: 9 }
            ];
        }
        if (lives === 0) {
            gameOver = true
        }
    } else {
        head.x = (head.x + tileCount) % tileCount;
        head.y = (head.y + tileCount) % tileCount;
    }
}
////////////////////////////////////////////////////////////////
function setWalls() {
    wallsOn = !wallsOn;
}
////////////////////////////////////////////////////////////////
function setDifficulty(value) {
    console.log("value : " + value);

    switch (value) {
        case 'facile':
            moveInterval = 300;
            wallsOn = false;
            lives = 5;
            break;
        case 'normal':
            moveInterval = 200;
            wallsOn = true;
            lives = 3;
            break;
        case 'difficile':
            moveInterval = 100;
            wallsOn = true;
            lives = 1;
            break;
    }

    clearInterval(gameInterval);
    gameSpeed = moveInterval; // utilise la vitesse choisie
    gameInterval = setInterval(gameLoop, gameSpeed);

}
console.log(setDifficulty)
console.log(gameSpeed);



////////////////////////////////////////////////////////////////////////////
function foodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Pas de pop() = le Snake grandit !

        food = spawnFood()
        updateScoreAndLevel()
    }

    else {
        snake.pop();
    }
}
//////////////////////////////////////////////////////////////////////////////
function specialFoodCollision() {
    if (snake[0].x === specialFood.x && snake[0].y === specialFood.y) {
        // Le serpent grandit (on ne fait pas de .pop())
        console.log("specialfood :" + specialFood.type + " " + specialFood.penality);


        if (specialFood.type === "bonus") {
            switch (specialFood.penality) {
                case "speed": // Bonus vitesse
                    moveInterval = Math.max(50, moveInterval - 50);
                    break;
                case "live": // Bonus vie
                    lives++;
                    break;
                case "score": // Bonus score
                    score += 3;
                    break;
            }
        }
        else {
            switch (specialFood.penality) {
                case "speed": // Bonus vitesse
                    moveInterval = Math.min(1000, moveInterval + 50);
                    break;
                case "live": // Bonus vie
                    lives--;
                    if (lives === 0) gameOver = true;
                    break;
                case "score": // Bonus score
                    score += 3;
                    break;
            }

        }

        clearInterval(gameInterval);
        gameSpeed = moveInterval;
        gameInterval = setInterval(gameLoop, gameSpeed);

        specialFood = spawnSpecialFood(); // Repositionner
    }
}

/////////////////////////////////////////////////////////////////////////////
function updateScoreAndLevel() {
    score++;
    if (score % 5 === 0) {
        level++;
        moveInterval = Math.max(60, moveInterval - 50);// Max Speed 60ms
        
        
        clearInterval(gameInterval);
        gameSpeed = moveInterval;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}
/////////////////////////////////////////////////////////////////////////////////
function togglePause() {
    paused = !paused;
    if (paused) {
        clearInterval(gameInterval);
        gameInterval = null;
    } else if (!gameInterval) {
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

//////////////////////////////////////////////////////////////////////////////////
function startGame() {
    gameSpeed = moveInterval;
    gameInterval = setInterval(gameLoop, gameSpeed);
}
/////////////////////////////////////////////////////////////////////////////////
function restartGame() {
    snake = [
        { x: 8, y: 8 },
        { x: 7, y: 8 },
        { x: 6, y: 8 }
    ];
    direction = { x: 1, y: 0 };
    lives = 3;
    score = 0;
    level = 1;
    moveInterval = 200;
    gameSpeed = moveInterval;
    wallsOn = false;
    gameOver = false;
    paused = false;

    clearInterval(gameInterval); // stoppe ancien intervalle si existant
    gameInterval = setInterval(gameLoop, gameSpeed);

    spawnFood();
    spawnSpecialFood();
}