
class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }

    preload(){

      this.load.audio('sfx_select', "assets/blip_select12.wav");
    }

    create() {

        let menuConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5, 
                bottom: 5
            },
            fixedWidth: 0
        }

        // Show menu text
        this.add.text(game.config.width/2, game.config.height/2 - borderUISize - borderPadding, "Endless Runner", menuConfig).setOrigin(0.5);        
        menuConfig.backgroundColor = '#00FF00';
        menuConfig.color = '#000';
        this.add.text(game.config.width/2, game.config.height/2 + borderUISize + borderPadding, "Press → to play", menuConfig).setOrigin(0.5);
        
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        //this.add.text(20,20, "Rocket Patrol Menu");

        // Change Scenes
       // this.scene.start("playScene");
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
          this.sound.play('sfx_select');
          this.scene.start('playScene');    
        }
      }
}

// init() prepares ant data for the scene
// prefloat() prepares any assets we'll need for the scene
// create() adds objects to the scene
// update() is a loop that runs continuously and llows use to update game objects

