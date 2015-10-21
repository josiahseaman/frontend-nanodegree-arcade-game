//these are very useful global variables for setting
//the entire play area.  Both engine.js and app.js use
//these variables and this is a rare case where I
//want them globally defined.
'use strict';
this.COL_WIDTH = 101;
this.ROW_HEIGHT = 83;
this.NUM_ROWS = 8; //TODO: detect device window and adjust game
this.NUM_COLS = 12;


/** Returns a random integer between min (inclusive) and max (inclusive)
 * From: http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Enemies our player must avoid
var Enemy = function() {
    this.x = -50; //TODO: random initialization on start
    this.y = getRandomInt(1, NUM_ROWS - 3) * ROW_HEIGHT;
    var backwards = getRandomInt(0, 1) === 0;
    this.speed = Math.random() * 100.0 + 100.0;
    if (backwards) {
        this.speed *= -1;
        this.x += COL_WIDTH * NUM_COLS;
    }

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// Called from Engine.updateEntities
Enemy.prototype.update = function(dt) {
    this.x += dt * this.speed;
    if (this.x > NUM_COLS * COL_WIDTH || this.x < -50) {
        Enemy.call(this);
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y - 20);
};


//The Single player character inherits Mob properties from Enemy
var Player = function() {
    Enemy.call(this);
    this.reset();
    this.sprite = 'images/char-cat-girl.png'; //used by render()
};
Player.prototype = Object.create(Enemy.prototype);
Player.prototype.constructor = Player;

/* Player position resets to bottom center every time. */
Player.prototype.reset = function() {
    this.x = Math.floor(NUM_COLS / 2) * COL_WIDTH;
    this.y = (NUM_ROWS - 1) * ROW_HEIGHT;
    this.reachedTheEnd = false;
};

/*Update does all the collision detection with Enemies.
 * If there was a second category to collide with, I'd break it
 * into more methods.*/
Player.prototype.collidesWithEnemy = function(enemy) {
//players torso is 32px across.  Both images are 101px but the bug fills the whole width
    var myCenter = this.x + COL_WIDTH / 2.0;
    if (this.y == enemy.y &&
        myCenter + 16 > enemy.x &&
        myCenter - 16 < enemy.x + COL_WIDTH) {
        this.reset();
        return true;
    } //this was tested at very slow speed and it looks just right for the torso
    return false;
};
Player.prototype.update = function(dt) {
    for (var i = 0, size = allEnemies.length; i < size; i++) {
        var enemy = allEnemies[i];
        this.collidesWithEnemy(enemy);
    }
};

//Player.prototype.render = function(){ }
//I don't need a custom render because Enemy.render references
//the class variable 'sprite' which is set in the constructor

Player.prototype.handleInput = function(directionString) {
    if (typeof directionString === 'undefined') {
        return;
    }
    var oldX = this.x;
    var oldY = this.y;
    var actions = {//this looks cleaner to me than a series of if statements
        'left': function(player){player.x -= COL_WIDTH;},
        'up': function(player){player.y -= ROW_HEIGHT;},
        'right': function(player){player.x += COL_WIDTH;},
        'down': function(player){player.y += ROW_HEIGHT;}
    };
    actions[directionString](this); //call the appropriate action
    //if anything puts it offscreen, reset the action
    if (0 > this.x || this.x >= COL_WIDTH * NUM_COLS) {
        this.x = oldX;
    }
    if (0 > this.y || this.y >= ROW_HEIGHT * NUM_ROWS) {
        this.y = oldY;
    }

};

/*  Modified from W3 example: http://www.w3schools.com/tags/canvas_filltext.asp
* */
function displayWinState() {
    ctx.font = "120px Impact";
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black'; //drop shadow
    ctx.fillText("You're A Winner!", NUM_COLS * COL_WIDTH / 2 + 4, ROW_HEIGHT * 3 + 4);
    ctx.fillStyle = 'white';
    ctx.fillText("You're A Winner!", NUM_COLS * COL_WIDTH / 2, ROW_HEIGHT * 3);}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for (var i = 0; i < NUM_COLS * NUM_ROWS / 10; i++) {
    allEnemies.push(new Enemy());
}
// Place the player object in a variable called player
var player0 = new Player();
var snake = [player0, new Player(), new Player(), new Player(), new Player()];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    snake.forEach(function (player, index) {
        setTimeout(function() {
            player.handleInput(allowedKeys[e.keyCode]);
        }, index * 200); //increasing the delay through the list of player objects
    });
    //for(let player of snake){
    //    setTimeout(function() {
    //        player.handleInput(allowedKeys[e.keyCode]);
    //    }, i * 500);
    //}
});