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

        // Create the test Background
        this.testBackground = this.add.tileSprite(0,0, gameWidth, gameHeight, 'testBackground').setOrigin(0,0);

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
        this.bikePedalForce = 50;
        this.minAccelerationX = 50;
        this.maxAccelerationX = 200;

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
    addObstacle() {
        let obstacle = new Obstacle(this, this.obstacleSpeed, this.bot.x, this.bot.y);
        this.obstacles.add(obstacle);
    }

    update(){
        // Bg Movement
        this.testBackground.tilePositionX += this.obstacleSpeed;

        //Update Bot
        this.bot.update();

        // Move the bike base on mouse. Finding difference in the y
        bike.body.velocity.y = (game.input.mousePointer.y - bike.body.y) * this.speedY;

        // check for collisions
        this.physics.world.collide(bike, this.obstacles, this.bikeCollision, null, this);

        // Keep this on the bottom
        this.updateDeltaTime();

        // EDIT THIS to check timing 
        if (this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyLEFT)){
            console.log("pedal left");
            this.bikePedal();
        } else if(!this.pedalLeftNotRight && Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            console.log("pedal right");
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
    }

    // Must be updated to happen more with more regularity
    bikeCollision() {
        console.log("Colliding");
        bike.body.velocity.x -= 200;
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
        this.obstacleSpeed = this.baseWorldSpeed * (this.bikePosRatioX + 1);

        if (this.bikePosRatioX < 1) {
            this.speedY = (this.maxSpeedY - this.minSpeedY) * (1 - this.bikePosRatioX) + this.minSpeedY;
        }
        else {
            this.speedY = this.minSpeedY;
        }
    }
}