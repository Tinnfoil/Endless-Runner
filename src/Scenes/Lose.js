class Lose extends Phaser.Scene{
    constructor(){
        super("loseScene");
    }

    preload(){
        this.load.image('losescreen', './assets/LoseScreen.png');
    }

    create() {
        this.loseScreen = this.add.sprite(0, 0, 'losescreen').setOrigin(0, 0);

        // Show Player Score
        let scoreConfig = {
            fontFamily: 'Courier New',
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#000000',
            align: 'right',
            padding: {
                top: 5, 
                bottom: 5
            },
        }

        this.scoreConfig = scoreConfig;
        this.scoreText = this.add.text(800, 200 , "Score: " + game.settings.score, scoreConfig);
        
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
          sfx_select.play();
          this.scene.start('playScene');    
        }
        if (Phaser.Input.Keyboard.JustDown(keyESC)) {
            sfx_select.play();
            this.scene.start('menuScene');    
          }
      }
}

// init() prepares ant data for the scene
// prefloat() prepares any assets we'll need for the scene
// create() adds objects to the scene
// update() is a loop that runs continuously and llows use to update game objects

