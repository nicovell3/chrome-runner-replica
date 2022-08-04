const fontFamily = "'Courier New', Courier, monospace";
const maxGameSpeed = 20;
const winScore = 2000;
const gravity = 0.75;
const jumpMaxTime = 8;
const initialSpawnTimer = 200;
const jumpForce = 12;
const minObstacleSeparation = 35;

var canvas;
var ctx;

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let obstacles;
let gameSpeed;
let keydown = false;
let gameOverBlock;
let spawnTimer;
let floorY;


// Event Listeners
document.addEventListener('touchstart', function (evt) {
  keydown = true;
});
document.addEventListener('mousedown', function (evt) {
  keydown = true;
});
document.addEventListener('keydown', function (evt) {
  if (evt.code == 'Space' || evt.code == 'ArrowUp') {
    keydown = true;
  }
});

document.addEventListener('touchend', function (evt) {
  keydown = false;
});
document.addEventListener('mouseup', function (evt) {
  keydown = false;
});
document.addEventListener('keyup', function (evt) {
  if (evt.code == 'Space' || evt.code == 'ArrowUp') {
    keydown = false;
  }
});

window.addEventListener('resize', function (evt) {
  window.location.reload();
});

class Player {
  constructor (x, y, w, h, color) {
    this.x = x; //25
    this.y = y; //0
    this.w = w; //50
    this.h = h; //50
    this.c = color; 

    this.fallSpeed = 0;
    this.grounded = true;
    this.jumpTimer = 0;
  }

  Animate () {
    // Jump
    if (keydown) {
      this.Jump();
    } else {
      this.jumpTimer = 0;
    }

    this.y += this.fallSpeed;

    // Gravity
    if (this.y + this.h < floorY) {
      this.fallSpeed += gravity;
      this.grounded = false;
    } else {
      this.fallSpeed = 0;
      this.grounded = true;
      this.y = floorY - this.h;
    }

    this.Draw();
  }

  Jump () {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1;
      this.fallSpeed = -jumpForce;
    } else if (this.jumpTimer > 0 && this.jumpTimer < jumpMaxTime) {
      this.jumpTimer++;
      this.fallSpeed = -jumpForce - (this.jumpTimer / 50);
    }
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Obstacle {
  constructor (x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -gameSpeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Text {
  constructor (t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = this.s + "px "+fontFamily;
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// Game Functions
function SpawnObstacle () {
  let size = RandomIntInRange(20, 70);
  let obstacle = new Obstacle(canvas.width + size, floorY - size, size, size, '#2484E4');

  obstacles.push(obstacle);
}

function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function EndGame() {
  window.localStorage.setItem('highscore', highscore);
  gameOverBlock.style = "display: block;";
  if (score > winScore) {
    document.getElementById("endtext").innerText = "VICTORIA!";
    //setTimeout(function () { window.location = 'invitation.html'; }, 2000);
  }

}

function Start () {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  gameOverBlock = document.getElementById("gameover");
  gameOverBlock.style = "display: none;";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px "+fontFamily;

  gameSpeed = 3;
  floorY = canvas.height/2 + 50;

  obstacles = [];
  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(25, floorY, 50, 50, '#FF5858');

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
  spawnTimer = 0;
}

function Update () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    console.log(obstacles);
    //spawnTimer = RandomIntInRange(minObstacleSeparation, initialSpawnTimer) - gameSpeed * 8;
    spawnTimer = minObstacleSeparation - gameSpeed * 8;
    
    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  player.Animate();

  // Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }

    if ( //Collision
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      EndGame();
      return;
    }
    o.Update();
  }

  if (score > winScore) {
    EndGame();
    return;
  }
  requestAnimationFrame(Update);

  score++;
  scoreText.t = "Score: " + score;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.t = "Highscore: " + highscore;
  }
  
  highscoreText.Draw();

  if (gameSpeed < maxGameSpeed) {
    gameSpeed += 0.003;
  }
}