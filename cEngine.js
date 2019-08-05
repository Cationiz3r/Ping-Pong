
var body = document.getElementById("body");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Tools

function radian(x) { return x/180*Math.PI; }

function rect(x,y, width,height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y, width, height);
}

function clearScreen(color="white", border=false, width=1, bColor="white") {
    rect(0,0,canvas.width,canvas.height, color);
    if (border)
        rect(width,width, canvas.width-width*2,canvas.height-width*2, bColor)
}



var fps = 45;
var fpsInterval, then, elapsed, startTime; 

function play() {
    id = requestAnimationFrame(play);

    elapsed = Date.now() - then;
    if (elapsed > fpsInterval) {
        then = Date.now() - (elapsed % fpsInterval);

        loop();
    }
}

var keyPressed = {};
canvas.addEventListener("keydown", function(event) { keyPressed[event.code] = true; });
canvas.addEventListener("keyup", function(event) { keyPressed[event.code] = false; });

function start() {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    play();
}

function end() {
    cancelAnimationFrame(id);
}

function setFps(n) {
    fps = n;
    start();
}

window.onload = start;