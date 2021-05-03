class Bot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, velocity) {
        // call Phaser Physics Sprite constructor
        super(scene, game.config.width - 100, game.config.height/2, 'atlas', 'robot01'); 
        // set up physics sprite
        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);       // add to physics system  
        this.setImmovable();                    
        this.velocity = velocity;
        this.targetY = bike.y;
        this.interval = Math.random() * 1000;

        this.spawnInterval = gameWidth/scene.baseWorldSpeed * 10 /2 ;

    }

    update() {
        this.interval -= this.scene.getDeltaTime();
        if(this.interval <= 0){
            this.targetY = bike.y + (Math.random() * 32 - 16);
            this.interval = Math.random() * 700 + 700; 
        }

        this.spawnInterval -= this.scene.getDeltaTime();
        //console.log(this.spawnInterval);
        if(this.spawnInterval <= 0){
            this.scene.addObstacle();

            let i = 0;
            let num = Math.random() * 2;
            for (i = 0; i < num ; i++) {
                this.scene.addObstacle(300,(Math.random() * 400) - 200);
            }
   
            this.spawnInterval = gameWidth/this.scene.baseWorldSpeed * 10 /2;
        }
        
        //console.log(this.targetY, this.interval);
       // this.y = (Math.sin(this.scene.getTime() / 800) * gameHeight / 2) + gameHeight/2;
        this.y = this.y + (this.targetY - this.y) * .035;
    }
}   