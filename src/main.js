// Server Command:  py -3 -m http.server
//const Phaser = require("../lib/phaser");

//Game Configuration
let config = {
    type: Phaser.CANVAS,
    width: 640,
    height: 480,
    scene: [Menu, Play]
}

let game = new Phaser.Game(config);

// Set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;
let starSpeed = 4;

// Reserve keyboard bindings
let keyF, keyR, keyLEFT, keyRIGHT;
