const fontFamily = "'Courier New', Courier, monospace";
const maxGameSpeed = 20;
const winScore = 1500;
const gravity = 0.70;
const jumpMaxTime = 10;
const jumpForce = 12;
const minObstacleSeparation = 10;
const maxObstacleSeparation = 200;
const obstacleSpeedSeparator = 2;
const allowCollisionPixels = 15; //Make it easy

var canvas;
var ctx;

// Variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let obstacles;
let background;
let gameSpeed;
let keydown = false;
let gameOverBlock;
let spawnTimer;
let floorY;
let imageList = {};
let imageLoadCounter = 0;
let gameOver = false;
let victory = false;
let keepSpawningObstacles = true;


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
    this.w = w; //100
    this.h = h; //100
    this.c = color; 

    this.fallSpeed = 0;
    this.grounded = true;
    this.jumpTimer = 0;
  }

  Animate () {
    // Jump
    if (keydown && !victory) {
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
    let spriteImage = Math.floor(Date.now() /200)%2 == 0 ? "Player2" : "Player1";
    if (gameOver) {
      spriteImage = victory ? "HappyHeart" : "Burning";
    }
    ctx.drawImage(imageList[spriteImage].image, this.x, this.y, this.w, this.h);
    //ctx.fillStyle = this.c;
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Obstacle {
  constructor (x, y, w, h, sprite) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.sprite = sprite;
    this.dx = -gameSpeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    ctx.beginPath();
    //ctx.fillStyle = this.c;
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.drawImage(imageList[this.sprite].image, this.x, this.y, this.w, this.h);
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

class Background {
  constructor (x, y, w, h) {
    this.x = 0;
    this.y = floorY-280;
    this.w = 10000;
    this.h = 320;
    this.dx = -gameSpeed;
  }

  Update () {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw () {
    ctx.beginPath();
    ctx.fillStyle = '#7dd5f4'; //Sky
    ctx.fillRect(0, 0, this.w, this.y + this.h/2);
    ctx.closePath();
    ctx.fillStyle = '#5eb681'; //Grass
    ctx.fillRect(0, this.y + this.h/2, this.w, 5000);
    ctx.closePath();
    //ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.drawImage(imageList["Background"].image, this.x, this.y, this.w, this.h);
    ctx.closePath();
    ctx.drawImage(imageList["Background"].image, this.x+this.w, this.y, this.w, this.h);
    ctx.closePath();
  }

}

class Sprite {
  constructor (name) {
    this.name = name;
    this.image = new Image();
    this.image.src = "img/"+this.name+".png";
    this.image.onload = function() {
      StartOnLoad();
    }
  }
}

//Utils
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Game Functions
function SpawnObstacle () {
  obstacles.push(new Obstacle(canvas.width + 50, floorY - 60, 50, 60, 'Fire'));
}

function SpawnAltar() {
  obstacles.push(new Obstacle(canvas.width + 176, floorY - 128, 76, 128, 'Altar'));

}

function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function EndGame() {
  window.localStorage.setItem('highscore', highscore);
  gameOverBlock.style = "display: block;";
  if (victory) {
    document.getElementById("endtext").innerText = "VICTORIA!";
    document.getElementById("repeattext").innerText = "Redirigiendo...";
    setTimeout(function () { redirectOnVictory(); }, 2000);
  }

}

function Start() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  gameOverBlock = document.getElementById("gameover");
  gameOverBlock.style = "display: none;";

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.font = "20px "+fontFamily;

  gameSpeed = 3;
  floorY = canvas.height/2 + 50;
  gameOver = false;
  keepSpawningObstacles = true;
  victory = false;

  obstacles = [];
  score = 0;
  highscore = 0;
  if (localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore');
  }

  player = new Player(25, floorY, 100, 84, '#FF5858');
  background = new Background();

  scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
  highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

  requestAnimationFrame(Update);
  spawnTimer = 0;
}

function Update () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  background.Update();

  if (keepSpawningObstacles && score < winScore) {
    spawnTimer--;
    if (spawnTimer <= 0) {
      SpawnObstacle();
      spawnTimer = RandomIntInRange(minObstacleSeparation, maxObstacleSeparation) - gameSpeed * obstacleSpeedSeparator;
      if (spawnTimer < 60) {
        spawnTimer = 60;
      }
    }
  } else if (obstacles[0].sprite == 'Altar') {
    victory = true;
  }

  // Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];

    if (o.x + o.w < 0) { //Obstacle out of view
      obstacles.splice(i, 1);
      i--;
      continue;
    } else {
      o.Update();
    }

    if ( //Collision
      player.x + allowCollisionPixels < o.x + o.w &&
      player.x + player.w > o.x + allowCollisionPixels &&
      player.y + allowCollisionPixels < o.y + o.h &&
      player.y + player.h > o.y + allowCollisionPixels
    ) {
      gameOver = true;
      player.Animate();
      EndGame();
      return;
    }
  }
  
  player.Animate();
  if (score > winScore + 100 && keepSpawningObstacles) {
    SpawnAltar();
    keepSpawningObstacles = false;
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

//This function should be called each time a image is loaded
function StartOnLoad() {
  imageLoadCounter++;
  if (imageLoadCounter == Object.keys(imageList).length) {
    Start();
  }
}

function StartLoadingImages() {
  var imageNames = [ 'Altar', 'Background', 'Burning', 'Fire', 'GameOver', 'HappyHeart', 'Happy', 'Player0', 'Player1', 'Player2', 'PlayerScared' ];
  imageNames.forEach(function (item) {
    imageList[item] = new Sprite(item);
  });
}