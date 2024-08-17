class Bubble{

    constructor(x , y , size , color){

        this.x = x 
        this.y = y 
        this.size = size 
        this.color = color
        this.velocity = {x:0,y:0}
        this.row = undefined 
        this.col = undefined
        this.displayIndex = false
        this.alpha = .7
        this.rowtype = undefined
        this.type = "bubble"
    }

    render(){

        c.save()
        c.beginPath()
        c.fillStyle = this.color 
        c.globalAlpha = this.alpha
        c.arc(this.x , this.y , this.size/2 , 0 , 2 * Math.PI)
        c.fill()
        c.closePath()
        c.restore()

        if(this.displayIndex){

            c.save()
            c.translate(this.x , this.y)
            c.fillStyle = "white"
            c.font = this.size/6 + "px Roboto"
            c.textAlign = "center"
            c.textBaseline = "middle"
            c.fillText(this.row + "," + this.col , 0 , -this.size/10)
            c.fillText(this.rowtype , 0 , this.size/10)
            c.closePath()
            c.restore()
        }

       
    }

    moveDown(){

        this.velocity.y += .7
            
    }

    move(){

        this.x += this.velocity.x 
        this.y += this.velocity.y

        if(this.type === "bubble"){

            if(this.x < this.size/2){

                this.velocity.x *= -1
                bouncebubblesound.play()
            }
    
            if(this.x > canvas.width - this.size/2){
    
                this.velocity.x *= -1
                bouncebubblesound.play()
            }
        }
       
    }

    fade(){

        if(this.alpha > .02){

            this.alpha -= .02

        }else{

            this.alpha = 0
        }
    }
}