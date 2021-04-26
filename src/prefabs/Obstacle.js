class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, velocity) {
        // call Phaser Physics Sprite constructor
        super(scene, game.config.width, Phaser.Math.Between(0, game.config.height), 'obstacle'); 
        // set up physics sprite
        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);       // add to physics system
        //this.setVelocityX(-velocity * 20);      
        this.setImmovable();                    
        this.newObstacle = true;                 // custom property to control barrier spawning
        this.velocity = velocity;
    }

    update() {
        // add new barrier when existing barrier hits center X
        if(this.newObstacle && this.x < centerX) {
            this.newObstacle = false;
            // (recursively) call parent scene method from this context
            this.scene.addObstacle(this.parent, this.velocity);
        }

        this.x -= this.velocity;

        // destroy paddle if it reaches the left edge of the screen
        if(this.x < -this.width) {
            this.destroy();
        }
    }
}