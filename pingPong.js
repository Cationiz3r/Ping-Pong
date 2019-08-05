
/*

    Made by Cationizer :) on Aug 5 2019
    P/S: To enable PowerUps (MutiBalls 4 now)
        switch upEnable to true :D

*/ 

var upEnable = false;

var secHTML = document.getElementById("secState");
canvas.focus();

var muted = false;

var players = [];
function playSFX(name) {
    if (!muted) {
        players.unshift(new Audio(`${name}.wav`));
        players[0].play();
    }
}

var flashContent = "white", flashScreen = "black";
var cColor = "black", sColor = "white";

const numberSize = { // Const
    long: 60,
    short: 15,
}
const numbers = [
    [0, 1, 2, 3, 4, 6],
    [3, 4],
    [0, 3, 5, 2, 6],
    [0, 3, 4, 5, 6],
    [1, 5, 3, 4],
    [0, 1, 5, 4, 6],
    [0, 1, 2, 5, 4, 6],
    [0, 3, 4],
    [0, 1, 2, 3, 4, 5, 6],
    [0, 1, 3, 4, 5, 6],
    [0, 1, 2, 5, 6]
];

const boardSize = { // const
    w: 20,
    h: 120,
};

function drawNumber(x, y, n) {
    ctx.fillStyle = cColor;
    if (n < 0 || n > 9)
        n = numbers.length - 1;
    let number = numbers[n];
    for (var i=0; i<number.length; ++i) {
        switch(number[i]) {
            case 0:
                ctx.fillRect(x, y, numberSize.long, numberSize.short);
                break;
            case 5:
                ctx.fillRect(x, y + numberSize.long - numberSize.short, numberSize.long, numberSize.short);
                break;
            case 6:
                ctx.fillRect(x, y + (numberSize.long - numberSize.short) * 2, numberSize.long, numberSize.short);
                break;
            case 1:
                ctx.fillRect(x, y, numberSize.short, numberSize.long);
                break;
            case 2:
                ctx.fillRect(x, y + numberSize.long - numberSize.short, numberSize.short, numberSize.long);
                break;
            case 3:
                ctx.fillRect(x + numberSize.long - numberSize.short, y, numberSize.short, numberSize.long);
                break;
            case 4:
                ctx.fillRect(x + numberSize.long - numberSize.short, y + numberSize.long - numberSize.short, numberSize.short, numberSize.long);
                break;
            case 7:
                ctx.fillRect(x + (numberSize.long - numberSize.short) / 2 , y + numberSize.long - numberSize.short, numberSize.short, numberSize.short);
                break;
        }
    }
}

var offset_x = 15, offset_y = 15;
function displayScore() {
    // Player
    let display_val = playerScore;
    let spacing = -numberSize.long;
    if (display_val == 0) {
        drawNumber((canvas.width - middle.stroke) / 2 - offset_x + spacing, offset_y, 0);
    } else 
        while (display_val > 0) {
            drawNumber((canvas.width - middle.stroke) / 2 - offset_x + spacing, offset_y, display_val % 10);

            spacing -= numberSize.long + numberSize.short;
            display_val = Math.floor(display_val / 10);
        }

    // Enemy
    let display_val_pre = enemyScore;
    let zeros = 0, its_zero = true;
    display_val = 0;

    while (display_val_pre > 0) {
        if (display_val_pre % 10 == 0 && its_zero)
            zeros++;
        else
            its_zero = false;
        //console.log(display_val_pre % 10);
        display_val = display_val * 10 + display_val_pre % 10;
        display_val_pre = Math.floor(display_val_pre / 10)
    }
    spacing = 0;
    if (display_val == 0) {
        drawNumber((canvas.width + middle.stroke) / 2 + offset_x, offset_y, 0);
    } else 
        while (display_val > 0) {
            drawNumber((canvas.width + middle.stroke) / 2 + offset_x + spacing, offset_y, display_val % 10);

            spacing += numberSize.long + numberSize.short;
            display_val = Math.floor(display_val / 10);
        }
    for (let i=0; i<zeros; i++) {
        drawNumber((canvas.width + middle.stroke) / 2 + offset_x + spacing, offset_y, 0);
        spacing += numberSize.long + numberSize.short;
    }
}

class screenStripe {
    constructor(vel, stroke, more=1, amount, color="") {
        this.pos = 0;
        this.vel = vel;
        this.stroke = stroke;
        this.more = more;
        this.amount = amount;

        this.color = color;
    }

    display() {
        let drawX = (canvas.width - this.stroke) / 2;
        let strokeY = canvas.height / this.amount / 2;
        for (let i=-1; i<this.amount; ++i) {
            let drawY = i* (canvas.height / this.amount) + this.pos;
            if (this.color=="")
                rect(drawX, drawY, this.stroke, strokeY*this.more, cColor);
            else 
                rect(drawX, drawY, this.stroke, strokeY*this.more, this.color);

        }

        // console.log(drawX, strokeY);
    }

    move() {
        this.pos += this.vel / fps;
        this.pos %= canvas.height / this.amount;
    }
}

class board {
    constructor(x, y=(canvas.height - boardSize.h) / 2, moveSpeed=200, clamp=10) {
        this.x = x;
        this.y = y;
        this.mSpeed = moveSpeed;
        this.clampT = clamp;
    }

    display() {
        rect(this.x, this.y, boardSize.w, boardSize.h, cColor);
    }

    clamp() {
        if (this.y < this.clampT)
            this.y = this.clampT;
        else if (this.y > canvas.height - boardSize.h - this.clampT)
            this.y = canvas.height - boardSize.h - this.clampT;
    }

    moveUp() {
        this.y -= this.mSpeed / fps;
        this.clamp();
    }
    moveDown() {
        this.y += this.mSpeed / fps;
        this.clamp();
    }
}

const upNames = [
    "mutiBall"
    // "widen",
    // "shorted"
];

class powerUp {
    constructor(type, x, y) {
        this.type = type;

        this.x = x;
        this.y = y;

        this.angle = 60;
        this.sVel = 30;

        this.beginSpin = Date.now();
        this.alpha = 0;
    }

    centerSquare(x, y, width, height) {
        let c;
        if (cColor == flashContent)
            c = 255 * this.alpha;
        else
            c = 255 * (1 - this.alpha);
        rect(x-width/2, y-height/2, width, height, `rgb(${c},${c},${c})`);
    }

    display() {
        let stroke = {w: 18, h: 3.5};
        switch (this.type) {
            case "mutiBall":

                let radius = 8, sqrWidth = 8;
                for (let i=0; i<3; ++i) {
                    let sqrX = this.x - radius * Math.sin(radian(i*120 + this.angle));
                    let sqrY = this.y + radius * Math.cos(radian(i*120 + this.angle));

                    this.centerSquare(sqrX, sqrY, sqrWidth, sqrWidth)
                }
            
                // this.y -= this.vel * Math.sin(radian(this.ang)) / fps;
                // this.x += this.vel * Math.cos(radian(this.ang)) / fps;

                break;
            // case "widen":
            //     this.centerSquare(this.x, this.y, stroke.w, stroke.h);
            //     this.centerSquare(this.x, this.y, stroke.h, stroke.w);
            //     break;
            // case "shorten":
            //     this.centerSquare(this.x, this.y, stroke.w, stroke.h);
            //     break;
        }
    }

    spin() {
        this.sVel += Math.sin((Date.now() - this.beginSpin) / 800) * 300 / fps;
        this.angle += this.sVel / fps;

        // console.log(Math.sin((Date.now() - this.beginSpin) / 800) * 300);
    }
    alphaTransit() {
        let duration = 2;
        this.alpha += 1 / fps / duration;
        this.alpha = Math.min(this.alpha, 1);
    }
}

var globalMinVel = 250;
var playerScore = 0, enemyScore = 0;
var gameBalls = [];
class ball {
    constructor(width, acc, fromPower=false, bX, bY, bV) { 
        this.width = width;
        this.acc = acc;

        this.vel = 300;

        this.dEd = false;

        this.fromPower = fromPower;
        this.bX = bX;
        this.bY = bY;
        this.bV = bV;

        this.lastBoard = "none";

        this.reset();
    }

    display(fade = true) {
        if (fade) {
            let fadeDisplay = Math.min(this.fadeList.length, this.fadeCount);
            for (let i=fadeDisplay-1; i>=0; --i) {
                let fadeIntensity = (fadeDisplay-i-1) / fadeDisplay;

                let c;
                if (cColor == flashContent)
                    c = 255 * fadeIntensity;
                else
                    c = 255 * (1 - fadeIntensity);

                let fadeColor = `rgb(${c},${c},${c})`;
                // let fadeColor = `rgba(0,0,0, ${fadeIntensity})`


                let fade = this.fadeList[i];
                rect(fade.x, fade.y, this.width, this.width, fadeColor);
            }
        }

        rect(this.x, this.y, this.width, this.width, cColor);
    }

    reset() {
        if (this.fromPower) {
            this.x = this.bX;
            this.y = this.bY;
        } else {
            this.x = (canvas.width - this.width) / 2;
            // this.y = (canvas.height - this.width) / 2;
            this.y = Math.random() * (canvas.height - this.width);
        } 
    
        this.ang = Math.random() * 360;

        this.lastBounce = true;
        this.tooLate = false;

        if (this.fromPower)
            this.vel = this.bV;
        else
            this.vel *= .85;
        this.bounced = -1;

        this.fadeList = [];
        this.fadeEach = 1;
        this.fadePassed = 0;
        this.fadeCount = 5;
    }

    accelerate() {
        this.vel += this.acc / fps;
        this.vel = Math.max(this.vel, globalMinVel);

        // Update (FasterBall = MoreFade)
        this.fadeCount = Math.floor((this.vel - 300) / 25);
        // this.fadeEach = Math.floor(4 * 200 / this.vel);

        // console.log(this.fadeCount, this.fadeEach);
    }

    move() {
        this.y -= this.vel * Math.sin(radian(this.ang)) / fps;
        this.x += this.vel * Math.cos(radian(this.ang)) / fps;

        this.checkBounce();

        // Get Fade
        this.fadePassed++;
        if (this.fadePassed >= this.fadeEach) {
            this.fadePassed %= this.fadeEach;

            this.fadeList.unshift({
                x: this.x,
                y: this.y
            });

            while(this.fadeList > this.fadeCount)
                this.fadeList.pop();
        }
    }

    checkBoardBounce(board, from) {
        // console.log(this.tooLate);
        let passedRight = board.x + boardSize.w > this.x;
        let passedLeft = board.x < this.x + this.width;
        let successfulDeflect = false;
        if (board.y < this.y + this.width && board.y + boardSize.h > this.y && 
            ((passedLeft && from=="left") || (passedRight && from=="right"))) {
            if (this.tooLate) {
                if (this.lastBounce) {
                    this.ang = -this.ang;
                    this.lastBounce = false;
                }
            } else {
                // angle = 180 - angle;
                this.bounced = 0;

                let dif = board.y + boardSize.h / 2 - this.y - this.width / 2;
                if (passedRight && from=="right") {
                    this.ang = dif / 80 * 90;     
                    // Set ball out of board after a successful deflect (Double bounce Fix)
                    this.x = board.x + boardSize.w;
                    this.lastBoard = "player";
                } else if (passedLeft && from=="left") {
                    this.ang = 180 - (dif / 80 * 90);
                    this.x = board.x - this.width;
                    this.lastBoard = "enemy";
                }

                successfulDeflect = true;
            }

            playSFX("hit");
        }
        if (successfulDeflect)
            this.tooLate = false;
        else
            this.tooLate = this.tooLate || ((passedLeft && from=="left") || (passedRight && from=="right"));
    }

    checkSide() {
        if (this.x < 0) { // Lose
            enemyScore++;

            playSFX("lose");

            flash();
            this.reset();
            this.dEd = gameBalls.length > 1;
        }
        else if (this.x > canvas.width - this.width) { // Win
            playerScore++;

            playSFX("win");

            flash();
            this.reset();
            this.dEd = gameBalls.length > 1;
        }

        if (!this.dEd && gameBalls.length <= 1)
            this.fromPower = false;
    }
    checkBounce() {        
        if (this.y < 0 || this.y > canvas.height - this.width) { // Bounce
            this.ang = -this.ang;
            this.bounced++;
            if (this.bounced >= 8) {
                this.ang = Math.random() * 360;
                this.bounced -= 3;
            }
            playSFX("hit");

            this.lastBounce = true;
        }

        if (this.y < 0)
            this.y = 0;
        else if (this.y > canvas.height - this.width)
            this.y = canvas.height - this.width;
    }

    checkPowerUps() {
        let checkX = this.x + this.width/2;
        let checkY = this.y + this.width/2;

        for (let i=0; i<ups.length; ++i) {
            if (Math.hypot(checkX-ups[i].x, checkY-ups[i].y) <= 20) {
                switch (ups[i].type) {
                    case "mutiBall":
                        spawnMutiBall(true, this, 2);
                        ups.splice(i, 1);

                        playSFX("split");
                        break;
                        
                    // case "widen": 
                    //     // if (this.lastBoard == "player")
                    //     //     player
                    //     break;
                    // case "shorten":

                    //     break;
                }
            }
        }
    }
}

var flashDuration = .12, flashBegin;
function flash(on = true) {
    if (on) {
        flashBegin = Date.now();
        body.style.backgroundColor = flashContent;
        sColor = flashScreen;
        cColor = flashContent;
    } else {
        body.style.backgroundColor = flashScreen;
        sColor = flashContent;
        cColor = flashScreen;
    }
}

function spawnMutiBall(fromAll, from, many) {
    // console.log(from);
    if (fromAll) {
        let prevLength = gameBalls.length;
        for (j=0; j<prevLength; ++j) {
            let from = gameBalls[j];
            for (let i=0; i<many; ++i)
                gameBalls.push(new ball(20, 5, true, from.x, from.y, from.vel));
        }
    } else 
        for (let i=0; i<many; ++i)
            gameBalls.push(new ball(20, 5, true, from.x, from.y, from.vel));

}
var bUpSpawn = Date.now(), spawnWait = Math.random()*4 + 4;
function spawnUp(specName = "") {
    let offset = 50;
    let x = Math.random() * (canvas.width - offset*2) + offset;
    let y = Math.random() * (canvas.height - offset*2) + offset;

    let name;
    if (upNames.indexOf(specName) != -1)
        name = specName;
    else
        name = upNames[Math.floor(Math.random() * upNames.length)];

    ups.push(new powerUp(name, x, y));
}

var player = new board(20);
var enemy = new board(canvas.width-boardSize.w-20);

gameBalls.push(new ball(20, 5));
// for (let i=0; i<99; ++i)
//     gameBalls.push(new ball(20, 5, true));

var middle = new screenStripe(22.5, 8, 1.2, 8);
var scanLine = new screenStripe(9, canvas.width, 1, 50, "rgba(0, 0, 0, .1)");

var ups = [];
// new powerUp("mutiBall", 300, 300);

var menu = -1, eLvl = 1;
function loop() {
    if (menu == -1) {
        startMenu();
    } else if (menu == 0) { // main game
        display();
        logic();
    } else if (menu == 1) {
        infoMenu();
    }
    
    // Clear Audio Queue
    for (let i=players.length-1; i>=0; --i)
        if (players[i].currentTime >= players[i].duration)
            players.splice(i, 1);

    // end();
}

function display() {
    clearScreen(sColor);

    for (let i=0; i<ups.length; ++i)
        ups[i].display();

    for (let i=0; i<gameBalls.length; ++i)
        gameBalls[i].display();

    player.display();
    enemy.display();

    displayScore();


    middle.display();
    scanLine.display();
}

function logic() {
    if (keyPressed.KeyW == true)
        player.moveUp();
    if (keyPressed.KeyS == true)
        player.moveDown();

    // enemyAI(player, 3, "left");
    enemyAI(enemy, eLvl, "right");

    for (let i=0; i<gameBalls.length; ++i) {
        gameBalls[i].accelerate();
        gameBalls[i].move();

        gameBalls[i].checkPowerUps();

        gameBalls[i].checkBoardBounce(player, "right");
        gameBalls[i].checkBoardBounce(enemy, "left");
        gameBalls[i].checkSide();

        if (gameBalls[i].dEd)
            gameBalls.splice(i, 1);
    }
    // console.log(gameBalls.length);

    if (Date.now() - flashBegin >= flashDuration * 1000)    
        flash(false);

    middle.move();
    scanLine.move();

    // console.log(keyPressed);

    // console.log(gameBalls[0].ang);

    for (let i=0; i<ups.length; ++i) {
        ups[i].spin();
        ups[i].alphaTransit();
    }
    // Test if spawn ok
    if (Date.now() - bUpSpawn >= spawnWait*1000 && upEnable) {
        bUpSpawn = Date.now();
        spawnWait = Math.random()*5 + 15;
        spawnUp();

        // console.log("Spawn Now..");
    }

    // console.log(Math.round(gameBalls[0].vel));
}

function enemyAI(board, level, type) {
    let ball = gameBalls[0];
    for (let i=1; i<gameBalls.length; ++i)
        if (ball.x < gameBalls[i].x && gameBalls[i].x+gameBalls[i].width < board.x && type == "right")
            ball = gameBalls[i];
        else if (ball.x > gameBalls[i].x && gameBalls[i].x > board.x+boardSize.w && type == "left")
        ball = gameBalls[i];
    if (level == 0) {
        if (keyPressed.KeyI == true)
            board.moveUp();
        if (keyPressed.KeyK == true)
            board.moveDown();
    } else if (level == 1) {
        if (board.y + boardSize.h / 2 > ball.y + ball.width / 2 + 20)
            board.moveUp();
        else if (board.y + boardSize.h / 2 < ball.y + ball.width / 2 - 20)
            board.moveDown();
    } else if (level >= 2) {
        let angle = ball.ang;
        while (angle > 180) angle -= 360;
        while (angle < -180) angle += 360;
        if (angle > -90 && angle < 90 && type == "right") {
            let calcBall = -(board.x - ball.x - ball.width) * Math.tan(radian(angle)) + ball.y;
            let bounceRange = canvas.height - ball.width;

            // let bounces = Math.floor( Math.abs(calcBall) / bounceRange );
            // if (calcBall < 0) bounces++;

            let easeRange;
            if (level == 2)
                easeRange = 40;
            else if (level == 3)
                easeRange = 100;

            while (calcBall > bounceRange*2)
                calcBall -= bounceRange*2;
            while (calcBall < 0)
                calcBall += bounceRange*2;

            if (calcBall > bounceRange)
                calcBall = bounceRange*2 - calcBall;

            if (board.y + boardSize.h / 2 > calcBall + ball.width / 2 + easeRange/2)
                board.moveUp();
            else if (board.y + boardSize.h / 2 < calcBall + ball.width / 2 - easeRange/2)
                board.moveDown();

            // console.log(calcBall);
        } else if (type == "left") {
            let calcBall = -(board.x - ball.x + boardSize.w) * Math.tan(radian(angle)) + ball.y;
            let bounceRange = canvas.height - ball.width;

            let easeRange;
            if (level == 2)
                easeRange = 40;
            else if (level == 3)
                easeRange = 100;

            while (calcBall > bounceRange*2)
                calcBall -= bounceRange*2;
            while (calcBall < 0)
                calcBall += bounceRange*2;

            if (calcBall > bounceRange)
                calcBall = bounceRange*2 - calcBall;

            if (board.y + boardSize.h / 2 > calcBall + ball.width / 2 + easeRange/2)
                board.moveUp();
            else if (board.y + boardSize.h / 2 < calcBall + ball.width / 2 - easeRange/2)
                board.moveDown();
        }
    }
}





//---------------------------<Other Menus>---------------------------

// Manual Labor cuz im lazy






function drawPingPong(x=0, y=0, color="") {

    let textColor;
    if (color == "")
        textColor = cColor;
    else 
        textColor = color;

    let scale = canvas.width/820 * .9;
    x += (canvas.width * .1) / 2;
    y += canvas.height * .15;

    rect(x, y, 30*scale,150*scale, textColor);
    rect(x+10*scale, y-10*scale, 100*scale, 30*scale, textColor);    
    rect(x+90*scale, y, 30*scale, 75*scale, textColor);
    rect(x+10*scale, y+55*scale, 100*scale, 30*scale, textColor);

    rect(x+130*scale, y+80*scale, 30*scale, 70*scale, textColor);
    rect(x+130*scale, y+40*scale, 30*scale, 30*scale, textColor);

    rect(x+170*scale, y+50*scale, 30*scale, 100*scale, textColor);
    rect(x+180*scale, y+40*scale, 70*scale, 30*scale, textColor);
    rect(x+230*scale, y+40*scale, 30*scale, 110*scale, textColor);

    rect(x+270*scale, y+50*scale, 30*scale, 100*scale, textColor);
    rect(x+280*scale, y+40*scale, 80*scale, 30*scale, textColor);
    rect(x+330*scale, y+40*scale, 30*scale, 180*scale, textColor);
    rect(x+270*scale, y+120*scale, 80*scale, 30*scale, textColor);
    rect(x+270*scale, y+200*scale, 80*scale, 30*scale, textColor);

    x += 400 * scale;

    rect(x, y, 30*scale,150*scale, textColor);
    rect(x+10*scale, y-10*scale, 100*scale, 30*scale, textColor);    
    rect(x+90*scale, y, 30*scale, 75*scale, textColor);
    rect(x+10*scale, y+55*scale, 100*scale, 30*scale, textColor);

    rect(x+130*scale, y+50*scale, 30*scale, 100*scale, textColor);
    rect(x+140*scale, y+40*scale, 60*scale, 30*scale, textColor);
    rect(x+190*scale, y+40*scale, 30*scale, 110*scale, textColor);
    rect(x+140*scale, y+120*scale, 60*scale, 30*scale, textColor);

    x += 60 * scale;

    rect(x+170*scale, y+50*scale, 30*scale, 100*scale, textColor);
    rect(x+180*scale, y+40*scale, 70*scale, 30*scale, textColor);
    rect(x+230*scale, y+40*scale, 30*scale, 110*scale, textColor);

    rect(x+270*scale, y+50*scale, 30*scale, 100*scale, textColor);
    rect(x+280*scale, y+40*scale, 80*scale, 30*scale, textColor);
    rect(x+330*scale, y+40*scale, 30*scale, 180*scale, textColor);
    rect(x+270*scale, y+120*scale, 80*scale, 30*scale, textColor);
    rect(x+270*scale, y+200*scale, 80*scale, 30*scale, textColor);

}

function startMenu() {
    clearScreen();

    let shadow = .4;
    let c = 255 * (1 - shadow);
    drawPingPong(10, 10, `rgb(${c}, ${c}, ${c})`);
    drawPingPong();

    let TextWidth = 240;
    rect((canvas.width-TextWidth)/2+10, canvas.height*.75+10, TextWidth, 40, `rgb(${c}, ${c}, ${c})`);
    rect((canvas.width-TextWidth)/2, canvas.height*.75, TextWidth, 40, cColor);
    ctx.font = "30px Consolas"
    ctx.fillStyle = sColor;
    ctx.fillText("Press Any Key!", (canvas.width-TextWidth)/2+5, canvas.height*.75+27.5);

    scanLine.display();
    scanLine.move();

    // end();
}
function infoMenu() {
    clearScreen();

    middle.display();
    middle.move();

    let shadow = .4;
    let c = 255 * (1 - shadow);
    let shColor = `rgb(${c}, ${c}, ${c})`;

    let pauseText = 195;
    rect((canvas.width-pauseText)/2+5, canvas.height/50+5, pauseText, 50, shColor);
    rect((canvas.width-pauseText)/2, canvas.height/50, pauseText, 50, cColor);
    ctx.font = "50px Consolas";
    ctx.fillStyle = sColor;
    ctx.fillText("PAUSED!", (canvas.width-pauseText)/2+5, canvas.height/50+40);

    let keyText = 120;    
    rect((canvas.width/2-keyText)/2+5, canvas.height/50+65, keyText, 50, shColor);
    rect((canvas.width/2-keyText)/2, canvas.height/50+60, keyText, 50, cColor);
    ctx.fillStyle = sColor;
    ctx.fillText("KEYS", (canvas.width/2-keyText)/2+5, canvas.height/50+100);

    let scale = 1.3 * canvas.width / 800;
    ctx.font = `${22*scale}px Consolas`;
    ctx.fillStyle = cColor;

    let x = 10;
    let y = canvas.height/50+120;

    let border = 2;
    ctx.fillRect(x+125*scale, y+11*scale, 160*scale, 128*scale);
    ctx.fillStyle = sColor;
    ctx.fillRect(x+(125+border)*scale, y+(11+border)*scale, (160-border*2)*scale, (128-border*2)*scale);
    ctx.fillStyle = cColor;
    ctx.font = `${20*scale}px Consolas`;
    ctx.fillText("W", x+130*scale, y+30*scale);
    ctx.fillText("S", x+130*scale, y+133*scale);
    ctx.fillText("I", x+270*scale, y+30*scale);
    ctx.fillText("K", x+270*scale, y+133*scale);
    ctx.fillRect(x+132*scale, y+50*scale, 4*scale, 30*scale);
    ctx.fillRect(x+274*scale, y+70*scale, 4*scale, 30*scale);
    ctx.fillRect(x+183*scale, y+100*scale, 4*scale, 4*scale); y += 2*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    ctx.fillRect(x+203*scale, y+11*scale, 3*scale, 12*scale); y += 16*scale;
    
    ctx.font = `${22*scale}px Consolas`;
    y = canvas.height/50+120;

    ctx.fillRect(x, y+10*scale, 25*scale, 25*scale);
    ctx.fillText("P1 Up", x+30*scale, y+30*scale);
    ctx.fillRect(x, y+45*scale, 25*scale, 25*scale);
    ctx.fillText("P1 Down", x+30*scale, y+65*scale);    y += 70*scale;
    ctx.fillRect(x, y+10*scale, 25*scale, 25*scale);
    ctx.fillText("P2 Up", x+30*scale, y+30*scale);
    ctx.fillRect(x, y+45*scale, 25*scale, 25*scale);
    ctx.fillText("P2 Down", x+30*scale, y+65*scale);    y += 90*scale;
    ctx.fillRect(x, y+10*scale, 50*scale, 25*scale);
    ctx.fillText("Pause/Unpause", x+55*scale, y+30*scale);
    ctx.fillRect(x, y+45*scale, 75*scale, 25*scale);
    ctx.fillText("Enable/Disable P2", x+80*scale, y+65*scale); 

    x = 10;
    y = canvas.height/50+120;

    ctx.fillStyle = sColor;
    ctx.fillText("W", x+6*scale, y+30*scale);
    ctx.fillText("S", x+6*scale, y+65*scale);           y += 70*scale;
    ctx.fillText("I", x+6*scale, y+30*scale);
    ctx.fillText("K", x+6*scale, y+65*scale);           y += 90*scale;
    ctx.fillText("Esc", x+6*scale, y+30*scale);
    ctx.fillText("Space", x+6*scale, y+65*scale); 

    
    let infoText = 200;    
    rect((canvas.width*1.5-infoText)/2+5, canvas.height/50+65, infoText, 50, shColor);
    rect((canvas.width*1.5-infoText)/2, canvas.height/50+60, infoText, 50, cColor);
    ctx.fillStyle = sColor;
    ctx.font = "50px Consolas";
    ctx.fillText("CREDITS", (canvas.width*1.5-infoText)/2+5, canvas.height/50+100);

    scale = 1.3 * canvas.width / 800;

    ctx.font = `${22*scale}px Consolas`;
    ctx.fillStyle = cColor;
    
    x = (canvas.width+middle.stroke) /2 + 15;
    y = canvas.height/50+120;
    
    ctx.fillRect(x, y+10*scale, 85*scale, 25*scale);
    ctx.fillText("Cationizer", x+90*scale, y+30*scale); y += 35*scale;
    ctx.fillRect(x, y+10*scale, 95*scale, 25*scale);
    ctx.fillText("Cationizer", x+100*scale, y+30*scale); y += 35*scale;
    ctx.fillRect(x, y+10*scale, 50*scale, 25*scale);
    ctx.fillText("Cationizer", x+55*scale, y+30*scale); y += 50*scale;
    ctx.fillRect(x, y+10*scale, 125*scale, 25*scale);
    ctx.fillText("August 5 2019", x+130*scale, y+30*scale); y += 50*scale;
    ctx.fillRect(x, y+10*scale, 265*scale, 25*scale);   y += 25*scale;
    ctx.fillText("-none-", x+140*scale, y+30*scale);

    x = (canvas.width+middle.stroke) /2 + 15;
    y = canvas.height/50+120;

    ctx.fillStyle = sColor;
    ctx.fillText("Coding", x+6*scale, y+30*scale);      y += 35*scale;
    ctx.fillText("Graphic", x+6*scale, y+30*scale);     y += 35*scale;
    ctx.fillText("SFX", x+6*scale, y+30*scale);     y += 50*scale;
    ctx.fillText("Fin. Date", x+6*scale, y+30*scale);     y += 50*scale;
    ctx.fillText("Other Project Members", x+6*scale, y+30*scale);    

    scanLine.display();
    scanLine.move();
}

var changed = false;
canvas.addEventListener("keydown", function(event) {
    if (menu == -1)
        menu = 0;
    else if (menu == 0 && keyPressed.Escape == true && !changed) {
        menu = 1;
        changed = true;
        flash(false);
    } else if (menu == 1 && keyPressed.Escape == true && !changed) {
        menu = 0;
        changed = true;
    }

    if (event.code == "Space" && menu == 1) {
        eLvl++;
        eLvl %= 4;
        switch (eLvl) {
            case 0:
                secHTML.innerHTML = "R. Board: P2";
                break;
            case 1:
                secHTML.innerHTML = "R. Board: CPU1";
                break;
            case 2:
                secHTML.innerHTML = "R. Board: CPU2";
                break;
            case 3:
                secHTML.innerHTML = "R. Board: CPU2.5";
                break;
        }

        // Reset After Change
        while (gameBalls.length > 1)
            gameBalls.pop();
        let ball = gameBalls[0];
        ball.vel = 0;
        ball.reset();
        playerScore = 0;
        enemyScore = 0;

        bUpSpawn = Date.now();
        spawnWait = Math.random()*4 + 4;
        ups = [];

    } else if (event.code == "KeyM")
        muted = !muted;
});
canvas.addEventListener("mousedown", function(event) {
    if (menu == -1)
        menu = 0;
});

canvas.addEventListener("keyup", function(event) {
    if (event.code == "Escape")
        changed = false;
});