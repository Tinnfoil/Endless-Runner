// Rocket (player) prefab
class Rocket extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame){
        super(scene, x, y, texture, frame);

        // add object to the existing scene new
        scene.add.existing(this);
        this.isFiring = false;      // Track the firing status
        this.moveSpeed = 2;         // Pixel per frame
        this.sfxRocket = scene.sound.add('sfx_rocket'); // add rocket sfx
    }

    update(){
        // left/right movement
        if(!this.isFiring){
            if(keyLEFT.isDown && this.x >= borderUISize + this.width){
                this.x -= this.moveSpeed;
            }
            if(keyRIGHT.isDown && this.x <= game.config.width - borderUISize - this.width){
                this.x += this.moveSpeed;
            }
        }

        //fire button
        if(Phaser.Input.Keyboard.JustDown(keyF) && !this.isFiring){
            this.isFiring = true;
            this.sfxRocket.play();
        }

        // If Fired, more to rocket up
        if(this.isFiring && this.y >= borderUISize * 3 + borderPadding){
            this.y -= this.moveSpeed;
        }

        //reset on miss
        if(this.y <= borderUISize * 3 + borderPadding){
            this.reset();
        }
    }

    //Reset rocket to "Ground"
    reset(){
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}