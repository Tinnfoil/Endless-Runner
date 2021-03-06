class Menu extends Phaser.Scene{
    constructor(){
        super("menuScene");
    }

    preload(){
        this.load.image('title', './assets/TitleScreen.png');
        this.load.audio('sfx_select', './assets/sfx_select2.wav');
        this.load.audio('sfx_pedal_l', './assets/sfx_pedal_l.wav');
        this.load.audio('sfx_pedal_r', './assets/sfx_pedal_r.wav');
        this.load.audio('sfx_pedal_click', './assets/sfx_pedal_click.wav');
        this.load.audio('sfx_pedal_brake', './assets/sfx_brake.wav');
        this.load.audio('sfx_junk1', './assets/JunkPile1.wav');
        this.load.audio('sfx_junk2', './assets/JunkPile2.wav');
        this.load.audio('sfx_junk3', './assets/JunkPile3.wav');
        this.load.audio('sfx_drop1', './assets/sfx_drop1.wav');
        this.load.audio('sfx_drop2', './assets/sfx_drop2.wav');
        this.load.audio('gameplay_music', './assets/gameplay_music.mp3');
    }

    create() {
        // Show Title Menu
        this.title = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'title').setOrigin(0);
        
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        sfx_select = this.sound.add('sfx_select', {volume: 0.5, rate: 3});
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
          game.settings = {                                 // To Keep track of score across scenes
            score: 0                                       // Feel free to edit if you can improve
          }                                                 // - Collin
          sfx_select.play();
          this.scene.start('playScene');    
        }
      }
}

// init() prepares ant data for the scene
// prefloat() prepares any assets we'll need for the scene
// create() adds objects to the scene
// update() is a loop that runs continuously and llows use to update game objects

