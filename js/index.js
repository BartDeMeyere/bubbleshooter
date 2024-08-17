//canvas setup
let canvas = $("canvas")[0]
let c = canvas.getContext("2d")

$("canvas").css("width" , 100 + "%")
$("canvas").css("height" , 100 + "%")

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

//variables
let mouse = {x:0,y:0}
let angle = 0
let rows = 6
let columns = 28
let bubblesize = canvas.width / columns
let numrows = 0
let center = {x: canvas.width/2 , y: canvas.height - bubblesize * 2}
let bubble = undefined
let canfire = false
let bubblespeed = bubblesize * .4
let bubbles = []
let D =  Math.sqrt(Math.pow(bubblesize , 2) - Math.pow(bubblesize/2 , 2))
let bubblecolors = ["orange" , "dodgerblue" , "magenta" , "yellow"]
let particles = []
let misfired = 0
let nextbubblecolors = [RandomColor() , RandomColor() , RandomColor()]
let points = 0
let gameOver = false
let missedCounter = 5
let counter = missedCounter - misfired


let even = [[0,-1],[-1,-1],[-1,0],[0,1],[1,0],[1,-1]]
let odd = [[0,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0]]

let bubblechain = []
let connectedbubbles = []
let floatingbubbles = []
let movingbubbles = []
let collidedrow = undefined
let collidedcolumn = undefined


let popbubblesound = new Audio("sounds/popbubble.mp3")
let firebubblesound = new Audio("sounds/firebubble.mp3")
let stackbubblesound = new Audio("sounds/stackbubble.mp3")
let bouncebubblesound = new Audio("sounds/bounce.mp3")

$(".scorelabel").css("fontSize" , bubblesize/6 + "px")
$(".scorelabel").html("score: 0")

$(".nextrow").html("next: " + counter)
$(".nextrow").css("fontSize" , bubblesize/6 + "px")

LoadBubble()
CreateBubblefield()
RenderCanvas()

function RenderCanvas(){

    c.clearRect(0 , 0 , canvas.width , canvas.height)

    //draw next bubbles
    for(var i = 0 ; i < nextbubblecolors.length ; i++){

        c.save()
        c.beginPath()
        c.fillStyle = nextbubblecolors[i]
        c.arc(center.x - bubblesize + i * bubblesize , center.y + bubblesize * 1.2, bubblesize/4 , 0 , 2 * Math.PI)
        c.fill()
        c.closePath()
        c.restore()
    
    }
  
    //draw bubblefield
    bubbles.forEach(bubble => {

        bubble.render()
    })

    DrawCannon()

    bubble.render()

    if(canfire){

        bubble.move()

        if(bubble.y < bubblesize/2){

            PlaceBubble()
            LoadBubble()
            canfire = false

        }else{

            if(Collision(bubble)){

                PlaceBubble()
                LoadBubble()
                canfire = false
            }
        }
    }

    movingbubbles.forEach(bubble => {

        bubble.render()
        bubble.moveDown()
        bubble.move()
    })

    movingbubbles.forEach((bubble,i) => {

        if(bubble.y - bubble.size > canvas.height){

            movingbubbles.splice(i,1)
        }
    })

    particles.forEach(element => {

        element.render()
        element.moveDown()
        element.move()
        element.fade()

    })

   particles.forEach((element,i) => {

        if(element.alpha === 0){

            particles.splice(i,1)
        }
    })

    requestAnimationFrame(RenderCanvas)
}

function DrawCannon(){


    c.save()

    c.beginPath()
    c.strokeStyle = "white"
    c.moveTo(center.x , center.y)
    c.lineTo(center.x + Math.cos(angle) * bubblesize , center.y + Math.sin(angle) * bubblesize)
    c.stroke()
    c.closePath()

    c.beginPath()
    c.strokeStyle = "white"
    c.fillStyle = "black"
    c.arc(center.x , center.y , bubblesize/2 * 1.2 , 0 , 2 * Math.PI)
    c.stroke()
    c.fill()
    c.closePath()
    c.restore()
}

function LoadBubble(){

    bubble = new Bubble(center.x , center.y , bubblesize , nextbubblecolors[0])
    nextbubblecolor = nextbubblecolors[0]
    nextbubblecolors.splice(0,1)
    nextbubblecolors.push(RandomColor())
}

function Collision(bubble){

    var len = bubbles.length

    for(var i = 0 ; i < len ; i++){

        var dx = bubble.x - bubbles[i].x 
        var dy = bubble.y - bubbles[i].y
        var dist = Math.sqrt(dx*dx+dy*dy)

        if(dist <= bubblesize - bubblesize/5){

            collidedrow = bubbles[i].row
            collidedcolumn = bubbles[i].col
            return true
        }
    } 
}

function PlaceBubble(){

    bubblechain = []
    connectedbubbles = []
    floatingbubbles = []

    var placeBubble = new Bubble()
    var row = collidedrow + 1//Math.floor(bubble.y / D) 

    //console.clear()

    if(!GetBubble(collidedrow , collidedcolumn)){

        console.log("bubble on first row")

        if(numrows % 2 === 0){

            row = 0
            var column = Math.floor(bubble.x / bubblesize)
            placeBubble.x = bubblesize/2 + column * bubblesize
            placeBubble.rowtype = "even"

        }else{

            row = 0
            var column = Math.floor((bubble.x - bubblesize/2) / bubblesize)
            placeBubble.x = bubblesize + column * bubblesize
            placeBubble.rowtype = "odd"
        }

      
        placeBubble.y = bubblesize/2
        placeBubble.size = bubble.size 
        placeBubble.color = bubble.color
        placeBubble.row = row 
        placeBubble.col = column
        //placeBubble.displayIndex = true
        placeBubble.velocity.x = RandomNumber(-10,10)
        placeBubble.velocity.y = RandomNumber(-10,-15)
        bubbles.push(placeBubble)


    }else{


        if(/* row % 2 === 0 */ GetBubble(collidedrow , collidedcolumn).rowtype === "even"){

            //even row
            var column = Math.floor((bubble.x - bubblesize/2) / bubblesize)
    
            if(column < 0){
    
                column = 0
            }
    
            placeBubble.x = bubblesize / 2 + bubblesize * column
            placeBubble.x = bubblesize + bubblesize * column
            placeBubble.rowtype = "odd"
          
        }else{
    
            //odd row 
            //var column = Math.floor((bubble.x - bubblesize/2) / bubblesize)
            var column = Math.floor(bubble.x / bubblesize)
    
            if(column < 0){
    
                column = 0
            }
    
           //placeBubble.x = bubblesize + bubblesize * column
            placeBubble.x = bubblesize / 2 + bubblesize * column
            placeBubble.rowtype = "even"
        }

    }

 

   // if(!GetBubble(row , column)){

        placeBubble.y = row * D + bubblesize/2
        placeBubble.size = bubble.size 
        placeBubble.color = bubble.color
        placeBubble.row = row 
        placeBubble.col = column
       //placeBubble.displayIndex = true
        placeBubble.velocity.x = RandomNumber(-10,10)
        placeBubble.velocity.y = RandomNumber(-10,-15)
        bubbles.push(placeBubble)
   // }


    
   // if(placeBubble){

       // console.clear()
       // console.log(placeBubble.row , placeBubble.col)
        GetbubbleChain(placeBubble.row , placeBubble.col)

    //}

    CheckGameDone()

    if(bubblechain.length > 2){

        UpdateScore()
        RemoveBubbleChain()

    }else{

        stackbubblesound.play()
        
        if(misfired < missedCounter){

            misfired++
        
        }

        counter = missedCounter - misfired

        if(counter === 0){

            CreateBubbleRow()
            misfired = 0
            $(".nextrow").html("next: " + counter)
            counter = missedCounter - misfired
        }

        

        $(".nextrow").html("next: " + counter)
    }
}

function UpdateScore(){

    var count = 0
    var len = bubblechain.length

    function run(){

        if(count < len){

            points += 10
            $(".scorelabel").html("score: " + points)
            count++
            setTimeout(run , 50)

        }else{

            return

        }
    }
    run()

}

function GetbubbleChain(row , col){

    var color = GetBubble(row , col).color 
    bubblechain.push(GetBubble(row , col))


    if(/* row % 2 === 0 */ GetBubble(row ,col).rowtype === "even"){

        for(var i = 0 ; i < even.length ; i++){

            if(GetBubble(row + even[i][0] , col + even[i][1])){

                if(isNewColoredBubble(row + even[i][0] , col + even[i][1] , color)){

                    GetbubbleChain(row + even[i][0] , col + even[i][1])
                }
            }
        }

    }else{


        for(var i = 0 ; i < odd.length ; i++){

            if(GetBubble(row + odd[i][0] , col + odd[i][1])){

                if(isNewColoredBubble(row + odd[i][0] , col + odd[i][1] , color)){

                    GetbubbleChain(row + odd[i][0] , col + odd[i][1])
                }
            }
        }
    }
}

function isNewColoredBubble(row , col , color){

    if(GetBubble(row , col).color === color && bubblechain.indexOf(GetBubble(row , col)) === -1){

        return true
    }
}

function GetConnectedBubbles(row , col){

    connectedbubbles.push(GetBubble(row , col))

    if(/* row % 2 === 0 */ GetBubble(row ,col).rowtype === "even"){

        for(var i = 0 ; i < even.length ; i++){

            if(GetBubble(row + even[i][0] , col + even[i][1])){

                if(isConnectedBuble(row + even[i][0] , col + even[i][1])){

                    GetConnectedBubbles(row + even[i][0] , col + even[i][1])
                }
            }
        }

    }else{


        for(var i = 0 ; i < odd.length ; i++){

            if(GetBubble(row + odd[i][0] , col + odd[i][1])){

                if(isConnectedBuble(row + odd[i][0] , col + odd[i][1])){

                    GetConnectedBubbles(row + odd[i][0] , col + odd[i][1])
                }
            }
        }
    }
}

function isConnectedBuble(row , col){

    if(GetBubble(row , col) && connectedbubbles.indexOf(GetBubble(row , col)) === -1){

        return true
    }
}

function CreateBubblefield(){

    var newbubble

    for(var i = 0 ; i < rows ; i++){

        for(var j = 0 ; j < columns ; j++){

            if(i % 2 === 0){

                newbubble = new Bubble(bubblesize/2 + j * bubblesize , bubblesize/2 + i *  D , bubblesize , RandomColor())
                newbubble.row = i 
                newbubble.col = j 
                newbubble.rowtype = "even"
                //newbubble.displayIndex = true 
                newbubble.velocity.x = RandomNumber(-10,10)
                newbubble.velocity.y = RandomNumber(-10,-15)
                bubbles.push(newbubble)

            }else{

                if(j < columns - 1){

                    newbubble = new Bubble(bubblesize + j * bubblesize , bubblesize/2 + i * D , bubblesize , RandomColor())
                    newbubble.row = i 
                    newbubble.col = j 
                    newbubble.rowtype = "odd"
                    //newbubble.displayIndex = true
                    newbubble.velocity.x = RandomNumber(-5,5)
                    newbubble.velocity.y = RandomNumber(-10,-15)
                    bubbles.push(newbubble)
                }
            }

        }
    }

    misfired = 0
    numrows = 0
}

function RemoveBubbleChain(){

    var counter = 0

    function run(){

        if(counter < bubblechain.length){

            removeBubble(bubblechain[counter])
            popbubblesound.play()
            counter++
            setTimeout(run , 100)

        }else{

            for(var i = 0 ; i < columns ; i++){

                if(GetBubble(0,i) && isConnectedBuble(0,i)){
        
                    GetConnectedBubbles(0,i)
           
                }
           }
        
           //console.log("connected: " +  connectedbubbles.length , "total: " + bubbles.length)
        
           GetFloatingBubbles()
           RemovefloatingBubbles()
           return
        }
       
    }

    run()

}

function removeBubble(bubble){

    for(var j = 0 ; j < bubbles.length ; j++){

        if(bubbles[j] === bubble){

            CreateBubbleParticles(bubble , RandomNumber(5,10))
            bubbles.splice(j , 1)
        }
    }
}

function GetFloatingBubbles(){

    for(var i = 0 ; i < bubbles.length ; i++){

        if(connectedbubbles.indexOf(bubbles[i]) === -1){

            floatingbubbles.push(bubbles[i])
        }
    }
}

function RemovefloatingBubbles(){

    for(var i = 0 ; i < floatingbubbles.length ; i++){

        for(var j = 0 ; j < bubbles.length ; j++){

            if(floatingbubbles[i] === bubbles[j]){

                movingbubbles.push(bubbles[j])
                bubbles.splice(j,1)
            }
        }
    }
}

function CreateBubbleParticles(bubble , count){

    for(var i = 0 ; i < count ; i++){

        var particle = new Bubble(bubble.x , bubble.y , RandomNumber(bubblesize/8 , bubblesize/5), bubble.color)
        particle.velocity.x = RandomNumber(-10 , 10)
        particle.velocity.y = RandomNumber(-10,-20)
        particle.type = "particle"
        particles.push(particle)
    }
}

function CreateBubbleRow(){

    for(var i = 0 ; i < bubbles.length ; i++){

        bubbles[i].y += D 
        bubbles[i].row++

    }

    if(numrows % 2 === 0){

        for(var j = 0 ; j < columns - 1 ; j++){

            newbubble = new Bubble(bubblesize + j * bubblesize , bubblesize/2 , bubblesize , RandomColor())
            newbubble.row = 0 
            newbubble.col = j 
            //newbubble.displayIndex = true 
            newbubble.rowtype = "odd"
            newbubble.velocity.x = RandomNumber(-10,10)
            newbubble.velocity.y = RandomNumber(-10,-15) 
            bubbles.push(newbubble)
        }

    }else{

        for(var j = 0 ; j < columns  ; j++){

            newbubble = new Bubble(bubblesize/2 + j * bubblesize , bubblesize/2 , bubblesize , RandomColor())
            newbubble.row = 0
            newbubble.col = j 
            //newbubble.displayIndex = true 
            newbubble.rowtype = "even"
            newbubble.velocity.x = RandomNumber(-10,10)
            newbubble.velocity.y = RandomNumber(-10,-15)
            bubbles.push(newbubble)
        }
    }

    numrows++

    CheckGameDone()

}

function ClearBubblefield(){

    canfire = false

    var index = Math.floor(Math.random() * bubbles.length)

    CreateBubbleParticles(bubbles[index], RandomNumber(5,10))

    bubbles.splice(index , 1)
    popbubblesound.play()

    if(bubbles.length > 0){

        setTimeout(ClearBubblefield , 5)

    }else{

        console.log("done")
        CreateBubblefield()
        misfired = 0
        firedbubbles = 0
        gameOver = false
        return
    }
}

function CheckGameDone(){

    bubbles.forEach(bubble => {

        if(bubble.y > center.y - bubblesize * 3){

            //ClearBubblefield()
            $(".gameOverUI").css("display" , "flex")
            $(".scoreOutput").html(points)
            canfire = false
            gameOver = true
            return
           
        }
    })

    
  
}

//event handling
$("canvas").on("mousemove" , (e) => {

    mouse.x = e.clientX * devicePixelRatio 
    mouse.y = e.clientY * devicePixelRatio
    var dx = mouse.x - center.x 
    var dy = mouse.y - center.y
    angle = Math.atan2(dy,dx)

})

$("canvas").on("mousedown" , (e) => {

    if(!canfire && angle > -Math.PI && angle < 0 && !gameOver){

        firebubblesound.play()
        canfire = true
        bubble.velocity.x = bubblespeed * Math.cos(angle)
        bubble.velocity.y = bubblespeed * Math.sin(angle)
    }
})

$("#newgamebtn").on("click", () => {

    $(".gameOverUI").css("display" , "none") 
    ClearBubblefield() 
    points = 0
    $(".scorelabel").html("score: " + points)

})

//utils functions
function RandomColor(){

    return bubblecolors[ Math.floor(Math.random() * bubblecolors.length)]
}

function RandomNumber(min , max){

   return min +  Math.random() * (max-min)
}

function GetBubble(row , col){

    for(var i = 0 ; i < bubbles.length ; i++){

        if(bubbles[i].row === row && bubbles[i].col === col){

            return bubbles[i]
        }
    }
}

