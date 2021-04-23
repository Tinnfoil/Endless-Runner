class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');

        //Load sprite sheet
        this.load.spritesheet('explosion', './assets/explosion.png', {
            frameWidth: 64,
            frameHeight: 32,
            startFrame: 0,
            endFrame: 9
        });
    }

    create() {
        //place starfield
        this.starfield = this.add.tileSprite(0,0, game.config.width, game.config.height, 'starfield').setOrigin(0,0);
       
        // Green UI Background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00ff00).setOrigin(0,0);
        this.add.rectangle(0,0, game.config.width, borderUISize, 0xffff0f).setOrigin(0,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize , 0xffff0f).setOrigin(0,0);
        this.add.rectangle(0,0, borderUISize, game.config.height, 0xffff0f).setOrigin(0,0);
        this.add.rectangle(game.config.width - borderUISize,0, borderUISize, game.config.height, 0xffff0f).setOrigin(0,0);
        
        this.add.text(20,10, "Rocket Patrol Player");
        
        //add the rocket
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5,0);
   
        // Add spaceships
        this.ship01 = new Spaceship(this, game.config.width + borderUISize * 6, borderUISize * 4, 'spaceship', 0, 30).setOrigin(0,0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize * 3, borderUISize * 5 + borderPadding * 2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize * 6 + borderPadding * 4, 'spaceship', 0, 10).setOrigin(0,0);


        //define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 9,
                first: 0
            }),
            frameRate: 30
        }); 
        
        // initialize score
        this.p1Score = 0;

        // Display Score

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5, 
                bottom: 5
            },
            fixedWidth: 100
        }
        
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding * 2, this.p1Score, scoreConfig);

        // Game Over flag
        this.gameOver = false;

        // 60 Second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () =>{
            this.add.text(game.config.width/2, game.config.height/2, "Game Over", scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, "Press (R) to Restart or ← for Menu", scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }

    update(){

         // check key input for restart or return to menu
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= starSpeed;

        // Update the rocket
        if(!this.gameOver){
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
        }

        if(this.checkCollision(this.p1Rocket, this.ship03)){
            this.shipExplode(this.ship03);
            this.p1Rocket.reset();
        }
        if(this.checkCollision(this.p1Rocket, this.ship02)){
            this.shipExplode(this.ship02);
            this.p1Rocket.reset();
        }
        if(this.checkCollision(this.p1Rocket, this.ship01)){
            this.shipExplode(this.ship01);
            this.p1Rocket.reset();
        }
    }

    checkCollision(rocket, ship){
        if( rocket.x < ship.x + ship.width &&
            rocket.x + rocket.width > ship.x &&
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship.y){
                return true;
        }
        else{
            return false;
        }
    
    }

    shipExplode(ship){
        // Temporarily hide ship
        ship.alpha = 0;
        // create explosion spirte at the ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0,0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () =>{
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        //add score and repaint it
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        this.sound.play('sfx_explosion');
    }
}