/*
Title: Bot Chaser

Kenny Doan
Harrison Kurtz
Collin Rowell

Date: 5/3/21

Creative Tilt: Endless runner with pedaling mechanics that mimic it as it's control scheme
And custom made sound effects and techno music.
*/

//Game Configuration
let config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 640,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { 
        default: 'arcade',
        arcade:{
            //debug: true,
            gravity:{
                x: 0,
                y: 0
            }
        }
    },
    scene: [Menu, Play, Lose]
}

let game = new Phaser.Game(config);

// Set Globals
let centerX = game.config.width/2;
let centerY = game.config.height/2;
let gameWidth = game.config.width;
let gameHeight = game.config.height;

// Global reference the to player object
let bike = null;

// Cursor keys
let cursors;

// Reserve keyboard bindings
let keyF, keyR, keyLEFT, keyRIGHT, keySPACE, keyESC;

let sfx_select;