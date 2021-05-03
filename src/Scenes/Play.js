class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.atlas('atlas', './assets/spritesheet.png', './assets/sprites.json');
        //this.load.image('bike', './assets/Bike_01.png');

        this.load.image('background', './assets/Background.png');
        this.load.image('playground', './assets/Playground.png');
        this.load.image('foreground', './assets/Foreground.png');

        this.load.image('obstacle', './assets/Obstacle.png');
        this.load.image('controls', './assets/Controls.png');
        //this.load.image('bot', './assets/Robot.png');
        this.load.image('ui_a', './assets/ui_a.png');
        this.load.image('ui_d', './assets/ui_d.png');
        this.load.image('ui_off', './assets/ui_off.png');
    }

    create() {
        //Initialize start Time for a timer;
        this.startTime = this.getTime();
        this.timePassed = 0;

        // Create the playground
        this.background = this.add.tileSprite(0,0, gameWidth, 140, 'background').setOrigin(0,0);
        this.playground = this.add.tileSprite(0,90, gameWidth, gameHeight - 90, 'playground').setOrigin(0,0);
        this.foreground = this.add.tileSprite(0,gameHeight - 140, gameWidth, 140, 'foreground').setOrigin(0,0);
        this.foreground.setDepth(3);

        // Create Score Text
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '60px',
            //backgroundColor: '#F3B141',
            color: '#ffffff',
            align: 'right',
            padding: {
                top: 5, 
                bottom: 5
            },
        }
        this.scoreConfig = scoreConfig;
        this.scoreText = this.add.text(centerX, 40 , "0", scoreConfig).setOrigin(.5);
        game.settings.score = 0;

        // Add Bike
        this.physics.world.setBoundsCollision(false, false, true, true);

        bike = this.physics.add.sprite(64, centerY, 'atlas', 'bike01').setOrigin(0.5);
        bike.scale = .7;
        bike.setCollideWorldBounds(true);
        bike.setBounce(0.5);
        bike.setImmovable();
        bike.setMaxVelocity(300, 600);
        bike.setDragY(200);
        bike.setDragX(100);
        bike.setDepth(1);             
        bike.setBlendMode('SCREEN');  // set a WebGL blend mode

        //Time the player cannot pedal
        this.stunTime = 0;
        this.flashInterval = 100;

        this.anims.create({
            key: 'pedal',
            frames: this.anims.generateFrameNames('atlas', {
                prefix: 'bike',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 2
            }),
            frameRate: 8,
            repeat: -1
        });

        // bike speed parameters
        this.bikeSpeedMult = 1;
        this.bikePedalForce = 60;
        this.minAccelerationX = 30;
        this.maxAccelerationX = 300;

        this.minSpeedY = 1;
        this.maxSpeedY = 5;
        this.speedY = this.maxSpeedY;

        this.baseWorldSpeed = 5;

        // Set up global cursor reference
        cursors = this.input.keyboard.createCursorKeys();

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // pedaling buttons
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.pedalUI_OFF = this.add.sprite(0, game.config.height, 'ui_off').setOrigin(0, 1);
        this.pedalUI_A = this.add.sprite(0, game.config.height, 'ui_a').setOrigin(0, 1);
        this.pedalUI_D = this.add.sprite(0, game.config.height, 'ui_d').setOrigin(0, 1);

        this.pedalLeftNotRight = true;
        this.canPedal = true;
        this.pedalUI_D.setVisible(false);
        this.pedalUI_OFF.setDepth(4);
        this.pedalUI_A.setDepth(5);
        this.pedalUI_D.setDepth(5);

        this.pedalSFX_L = this.sound.add('sfx_pedal_l', {volume: 0.25});
        this.pedalSFX_R = this.sound.add('sfx_pedal_r', {volume: 0.25});
        this.pedalSFX_click = this.sound.add('sfx_pedal_click', {volume: 0.33});
        this.brakeSFX = this.sound.add('sfx_pedal_brake', {volume: 0.25});

        // Create obstacle group
        this.obstacles = this.add.group({runChildUpdate:true});
        this.obstacleSpeed = 5;

        this.junkSounds = [3];

        this.junkSounds[0] = this.sound.add('sfx_junk1', {volume: 0.25});
        this.junkSounds[1] = this.sound.add('sfx_junk2', {volume: 0.25});
        this.junkSounds[2] = this.sound.add('sfx_junk3', {volume: 0.25});

        this.bot = new Bot(this, this.obstacleSpeed);
        this.bot.scale = .8;

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNames('atlas', {
                prefix: 'robot',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 2
            }),
            frameRate: 4,
            repeat: -1
        });

        this.bot.anims.play('fly');

        this.controls = this.add.sprite(centerX, centerY, 'controls').setOrigin(.5);
        this.started = false;

        this.addObstacle();
    }

    // create new obstacles
    addObstacle(xOffset = 0, yOffset = 0) {
        if(this.bot.y + yOffset > 130 + 30){
            let obstacle = new Obstacle(this, this.obstacleSpeed, this.bot.x + xOffset, this.bot.y + yOffset);
            this.obstacles.add(obstacle);
            
            //Temporary Scoring
            game.settings.score += 1;
            this.scoreText.text = "" + game.settings.score;
        }
    }

    update(){

        if(this.started == false && (Phaser.Input.Keyboard.JustDown(keyLEFT) || Phaser.Input.Keyboard.JustDown(keyRIGHT))){         
            this.controls.destroy(); 
            bike.setAccelerationX(-this.minAccelerationX);
            bike.anims.play('pedal');
            this.started = true;
        }
        if(this.started == false) return;
        // Bg Movement
        this.background.tilePositionX += this.obstacleSpeed/2;
        this.playground.tilePositionX += this.obstacleSpeed;
        this.foreground.tilePositionX += this.obstacleSpeed * 1.5;

        //Update Bot
        this.bot.update();

        // Move the bike base on mouse. Finding difference in the y
        bike.body.velocity.y = (game.input.mousePointer.y - bike.body.y) * this.speedY;
        if(bike.y < 140){bike.y = 140;}

        // check for collisions
        this.physics.world.collide(bike, this.obstacles, function(bikeRef, obstacleRef){this.bikeCollision(bikeRef, obstacleRef);}, null, this);

        // EDIT THIS to check timing 
        if (this.canPedal && this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyLEFT) && this.stunTime <= 0){
            //console.log("pedal left");
            this.bikePedal();
        } else if(this.canPedal && !this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyRIGHT)&& this.stunTime <= 0) {
            //console.log("pedal right");
            this.bikePedal();
        } else if(this.canPedal && Phaser.Input.Keyboard.JustDown(keyRIGHT) || Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.canPedal = false;
            this.pedalUI_A.setVisible(false);
            this.pedalUI_D.setVisible(false);
            this.pedalSFX_click.play();
            this.time.delayedCall(200, ()=> this.bikePedalReset(), null, this);
        }

        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
            this.brakeSFX.play();
        }
        if (keySPACE.isDown) {
            this.bikeBreak();
        }
        if (Phaser.Input.Keyboard.JustUp(keySPACE)) {
            this.brakeSFX.stop();
        }
        
        // If the player edges off the side of the screen, lose
        if (bike.x + bike.width/2 < 0){
            this.gameOver();
        }

        this.setBikePosRatioX();
        
        this.obstacleParticles = this.add.particles('obstacle'); 

        this.stunTime -= this.getDeltaTime();
        if(this.stunTime > 0){
            this.flashInterval -= this.getDeltaTime();
            if(this.flashInterval <= 0){
                if(bike.alpha ==1){
                    bike.alpha = 0;
                }
                else{
                    bike.alpha = 1;
                }
                this.flashInterval = 100;
            }
        }
        else{
            bike.alpha = 1;
        }

        this.timePassed += this.getDeltaTime();
        // Keep this on the bottom
        this.updateDeltaTime();
    }

    // Must be updated to happen more with more regularity
    bikeCollision(bikeRef, obstacleRef) {
        console.log("Colliding");
        bike.body.velocity.x -= 600;
        this.emit = this.obstacleParticles.createEmitter({
            //frame: ['obstacle', 'bot'],
            x: bike.x + bike.width/2,
            y: bike.y,
            speed: 1000,
            lifespan: 200,
            blendMode: 'ADD',
            frequency: 20,
            maxParticles: 10,
            alpha: {start: 1, end: 0},
            scale: {start: 1, end: 0}
        });

        this.junkSounds[Math.floor(Math.random() * 3)].play();

        // Set time player cannot pedal
        this.stunTime = 1250;

        obstacleRef.destroy();
    }

    // Adds a bit of force to bike NEEDS EDITING
    bikePedal() {
        if (this.bikePosRatioX > 1) {
            bike.body.velocity.x += this.bikePedalForce * (1.5 - this.bikePosRatioX);
        } else {
            bike.body.velocity.x += this.bikePedalForce;
        }
        this.pedalLeftNotRight = !this.pedalLeftNotRight;
        this.canPedal = false;
        this.pedalUI_A.setVisible(false);
        this.pedalUI_D.setVisible(false);

        this.pedalSFX_L.stop();
        this.pedalSFX_R.stop();
        if (this.pedalLeftNotRight) {
            this.pedalSFX_L.setRate(this.bikePosRatioX * 0.1 + 1);
            this.pedalSFX_L.play();  
        } else {
            this.pedalSFX_R.setRate(this.bikePosRatioX * 0.1 + 1);
            this.pedalSFX_R.play(); 
        }
        this.time.delayedCall(100, ()=> this.bikePedalReset(), null, this);
    }

    bikePedalReset () {
        this.pedalUI_A.setVisible(this.pedalLeftNotRight);
        this.pedalUI_D.setVisible(!this.pedalLeftNotRight);
        this.canPedal = true;
    }

    bikeBreak() {
        bike.body.velocity.x -= 10;
    }

    getTime(){
        let d = new Date();
        return d.getTime();
    }

    getDeltaTime() {
        //subtract the start time from the time now
        let elapsed = this.getTime() - this.startTime;
        
        return elapsed; 
    }

    updateDeltaTime() {
        //reset the start time
        this.startTime = this.getTime(); 
    }

    gameOver() {
        console.log("You lost!");
        this.scene.start("loseScene");
    }

    // Creates a variable from 0 (player is on left side of screen)
    // to 1 (player in in middle of screen), and increases the speed of
    // the game world to match.
    setBikePosRatioX () {
        this.bikePosRatioX = bike.body.x / (game.config.width/2);
        bike.setAccelerationX(-((this.maxAccelerationX - this.minAccelerationX) * this.bikePosRatioX + this.minAccelerationX))
        
        // Increase the world speed up to 2x when close to center
        this.obstacleSpeed = (this.baseWorldSpeed + this.timePassed/100000) * (this.bikePosRatioX + 1);

        if (this.bikePosRatioX < 1) {
            this.speedY = (this.maxSpeedY - this.minSpeedY) * (1 - this.bikePosRatioX) + this.minSpeedY;
        }
        else {
            this.speedY = this.minSpeedY;
        }
    }
}