class Bot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, velocity) {
        // call Phaser Physics Sprite constructor
        super(scene, game.config.width - 100, game.config.height/2, 'bot'); 
        // set up physics sprite
        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);       // add to physics system  
        this.setImmovable();                    
        this.velocity = velocity;
        this.targetY = bike.y;
        this.interval = Math.random() * 1000;
    }

    update() {
        this.interval -= this.scene.getDeltaTime();
        if(this.interval <= 0){
            this.targetY = bike.y + (Math.random() * 32 - 16);
            this.interval = Math.random() * 500 + 500; 
        }
        
        //console.log(this.targetY, this.interval);
       // this.y = (Math.sin(this.scene.getTime() / 800) * gameHeight / 2) + gameHeight/2;
        this.y = this.y + (this.targetY - this.y) * .035;
    }
}   