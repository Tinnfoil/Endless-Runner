class Obstacle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, velocity, positionX, positionY) {
        // call Phaser Physics Sprite constructor
        super(scene, positionX, positionY, 'obstacle'); 
        // set up physics sprite
        scene.add.existing(this);               // add to existing scene, displayList, updateList
        scene.physics.add.existing(this);       // add to physics system

        this.setImmovable();   
        this.velocity = velocity;                 
        this.newBarrier = true;                 // custom property to control barrier spawning
    }

    update() {
        // add new barrier when existing barrier hits center X
        if(this.newBarrier && this.x < centerX) {
            this.newBarrier = false;
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