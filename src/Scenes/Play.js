class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('bike', './assets/TestBike.png');

        this.load.image('testBackground', './assets/TestBG.png');
        this.load.image('obstacle', './assets/TestObstacle.png');
        this.load.image('bot', './assets/TestBot.png');
        this.load.image('ui_a', './assets/ui_a.png');
        this.load.image('ui_d', './assets/ui_d.png');
    }

    create() {
        //Initialize start Time for a timer;
        this.startTime = this.getTime();
        this.timePassed = 0;

        // Create the test Background
        this.testBackground = this.add.tileSprite(0,0, gameWidth, gameHeight, 'testBackground').setOrigin(0,0);

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
        this.score = 0;

        // Add Bike
        this.physics.world.setBoundsCollision(false, false, true, true);

        bike = this.physics.add.sprite(64, centerY, 'bike').setOrigin(0.5);
        bike.setCollideWorldBounds(true);
        bike.setBounce(0.5);
        bike.setImmovable();
        bike.setMaxVelocity(300, 600);
        bike.setDragY(200);
        bike.setDragX(100);
        bike.setDepth(1);             
        bike.setBlendMode('SCREEN');  // set a WebGL blend mode

        // bike speed parameters
        this.bikeSpeedMult = 1;
        this.bikePedalForce = 30;
        this.minAccelerationX = 30;
        this.maxAccelerationX = 300;

        this.minSpeedY = 1;
        this.maxSpeedY = 5;
        this.speedY = this.maxSpeedY;

        bike.setAccelerationX(-this.minAccelerationX);

        this.baseWorldSpeed = 5;

        // Set up global cursor reference
        cursors = this.input.keyboard.createCursorKeys();

        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // pedaling buttons
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.pedalUI_A = this.add.sprite(0, game.config.height, 'ui_a').setOrigin(0, 1);
        this.pedalUI_D = this.add.sprite(64, game.config.height, 'ui_d').setOrigin(0, 1);

        this.pedalLeftNotRight = true;
        this.pedalUI_D.setVisible(false);

        // Create obstacle group
        this.obstacles = this.add.group({runChildUpdate:true});
        this.obstacleSpeed = 5;

        this.bot = new Bot(this, this.obstacleSpeed);

        this.addObstacle();
    }

    // create new obstacles
    addObstacle(xOffset = 0, yOffset = 0) {
        let obstacle = new Obstacle(this, this.obstacleSpeed, this.bot.x + xOffset, this.bot.y + yOffset);
        this.obstacles.add(obstacle);

        //Temporary Scoring
        this.score += 1;
        this.scoreText.text = "Score: " + this.score;
    }

    update(){
        // Bg Movement
        this.testBackground.tilePositionX += this.obstacleSpeed;

        //Update Bot
        this.bot.update();

        // Move the bike base on mouse. Finding difference in the y
        bike.body.velocity.y = (game.input.mousePointer.y - bike.body.y) * this.speedY;

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
        bike.body.velocity.x -= 200;
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

        obstacleRef.destroy();
    }

    // Adds a bit of force to bike NEEDS EDITING
    bikePedal() {
        bike.body.velocity.x += this.bikePedalForce;
        this.pedalLeftNotRight = !this.pedalLeftNotRight;
        this.pedalUI_A.setVisible(this.pedalLeftNotRight);
        this.pedalUI_D.setVisible(!this.pedalLeftNotRight);
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
        this.scene.start("menuScene");
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