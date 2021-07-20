let mymouse;
let mouseintersect = false;
let things = [];
let arena = [];

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    // test_setup();
    arena.push(new Line([50,50], [500,50], 0, 0));
    arena.push(new Line([500,50], [500,120], 0, 0));
    arena.push(new Line([500,120], [50,150], 0, 0));
    arena.push(new Line([50,150], [50,50], 0, 0));
    let r_vel = p5.Vector.random2D().setMag(5);
    things.push(new Circle([100,100], [r_vel.x, r_vel.y], 0, 30));
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    
    arena.forEach(a => a.draw());
    things.forEach(t => {
        t.draw();
        t.move();
        arena.forEach(a => t.collide(a));

    });
    // test_draw();
}

function test_setup(){
    things.push(new Circle([windowWidth/2, windowHeight/2], 0, 0, 30));
    things.push(new Point([windowWidth*2/3, windowHeight/3], 0, 0, 30));

    things.push(new Rect([windowWidth/3, windowHeight*2/3], 0, 0, [50,50]));
    things.push(new Line([50, 50], [150,150], 0, 0));
    things.push(new Line([35, 200], [100,250], 0, 0));
    things.push(new Line([250, 200], [250,220], 0, 0));
    mymouse = new Rect([windowWidth/2, windowHeight/2], 0, 0, [50, 50]);
    // mymouse = new Circle([windowWidth/2, windowHeight/2], 0, 0, 30);
    // mymouse = new Point([windowWidth/2, windowHeight/2], 0, 0, 30);
    // mymouse = new Line([0, 0], [150,150], 0, 0);
}

function test_draw(){
    mymouse.setPos([mouseX, mouseY]);
    
    mouseintersect = false;
    things.forEach(t => {
        t.move();
        
        if(mymouse.intersects(t)){
            t.draw(color(255,0,0));
            mouseintersect = true;

        }else{
            t.draw();
        }
    });

    if(mouseintersect){
        mymouse.draw(color(255,0,0));
    }else{
        mymouse.draw();
    }
}