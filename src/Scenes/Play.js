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
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5, 
                bottom: 5
            },
        }
        this.scoreConfig = scoreConfig;
        this.scoreText = this.add.text(20, 20 , "Score: 0", scoreConfig);
        game.settings.score = 0;

        // Add Bike
        this.physics.world.setBoundsCollision(false, false, true, true);

        bike = this.physics.add.sprite(64, centerY, 'atlas', 'bike01').setOrigin(0.5);
        bike.scale = .8;
        bike.setCollideWorldBounds(true);
        bike.setBounce(0.5);
        bike.setImmovable();
        bike.setMaxVelocity(300, 600);
        bike.setDragY(200);
        bike.setDragX(100);
        bike.setDepth(1);             
        bike.setBlendMode('SCREEN');  // set a WebGL blend mode

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

        this.pedalUI_A = this.add.sprite(0, game.config.height, 'ui_a').setOrigin(0, 1);
        this.pedalUI_D = this.add.sprite(0, game.config.height, 'ui_d').setOrigin(0, 1);

        this.pedalLeftNotRight = true;
        this.pedalUI_D.setVisible(false);
        this.pedalUI_A.setDepth(5);
        this.pedalUI_D.setDepth(5);

        this.pedalSound = this.sound.add('sfx_pedal', {volume: 0.25});

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
            this.scoreText.text = "Score: " + game.settings.score;
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
        if (this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyLEFT)){
            //console.log("pedal left");
            this.bikePedal();
        } else if(!this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            //console.log("pedal right");
            this.bikePedal();
        }
        if (keySPACE.isDown) {
            this.bikeBreak();
        }
        
        // If the player edges off the side of the screen, lose
        if (bike.x + bike.width < 0){
            this.gameOver();
        }

        this.setBikePosRatioX();
        
        this.obstacleParticles = this.add.particles('obstacle'); 

        this.timePassed += this.getDeltaTime();
        // Keep this on the bottom
        this.updateDeltaTime();
    }

    // Must be updated to happen more with more regularity
    bikeCollision(bikeRef, obstacleRef) {
        console.log("Colliding");
        bike.body.velocity.x -= 300;
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
        this.pedalUI_A.setVisible(this.pedalLeftNotRight);
        this.pedalUI_D.setVisible(!this.pedalLeftNotRight);

        this.pedalSound.stop();
        this.pedalSound.setRate(this.bikePosRatioX * 0.1 + 1);
        this.pedalSound.play();      
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