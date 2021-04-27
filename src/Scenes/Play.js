class Play extends Phaser.Scene{
    constructor(){
        super("playScene");
    }

    preload(){
        this.load.image('bike', './assets/TestBike.png');

        this.load.image('testBackground', './assets/TestBG.png');
        this.load.image('obstacle', './assets/TestObstacle.png');
        this.load.image('bot', './assets/TestBot.png')
    }

    create() {
        //Initialize start Time for a timer;
        this.startTime = this.getTime();

        // Create the test Background
        this.testBackground = this.add.tileSprite(0,0, gameWidth, gameHeight, 'testBackground').setOrigin(0,0);

        bike = this.physics.add.sprite(32, centerY, 'bike').setOrigin(0.5);
        bike.setCollideWorldBounds(true);
        bike.setBounce(0.5);
        bike.setImmovable();
        bike.setMaxVelocity(0, 600);
        bike.setDragY(200);
        bike.setDepth(1);             
        bike.setBlendMode('SCREEN');  // set a WebGL blend mode
    
        // Set up global cursor reference
        cursors = this.input.keyboard.createCursorKeys();

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
        bike.body.velocity.y = (game.input.mousePointer.y - bike.body.y) * 5;

        // check for collisions
        this.physics.world.collide(bike, this.obstacles, this.bikeCollision, null, this);

        // Keep this on the bottom
        this.updateDeltaTime();
    }

    bikeCollision() {
       console.log("Collided");
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

    updateDeltaTime(){
        //reset the start time
        this.startTime = this.getTime(); 
    }

}