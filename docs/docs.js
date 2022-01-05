let scene;
let checked_collisions = 0;
let colliding_pairs = 0;

let FUNCTION_CALLS = 0;
let toggleDebug = false;
let toggleGravity = false;
let toggleCollisionGraph = 0;

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene();
    
    // scene.add_thing(new Circle([windowWidth/4, windowHeight/2], [0, 0], 0, 50, CollisionType.STATIC));
    // console.log(scene.add_thing(new Line([0,0], [windowWidth,0])));
    // console.log(scene.add_thing(new Line([windowWidth,0], [windowWidth,windowHeight])));
    // console.log(scene.add_thing(new Line([windowWidth,windowHeight], [0,windowHeight])));
    // console.log(scene.add_thing(new Line([0,windowHeight], [0,0])));
    
    // console.log(scene.add_thing(new Line([200,0], [0,200])));

    // console.log(scene.add_thing(new Line([600,0], [800,200])));
    // console.log(scene.add_thing(new Line([600,800], [800,600])));
    // // console.log(scene.add_thing(new Line([200,800], [0,600])));

    // console.log(scene.add_thing(new Line([200,0], [0,200])));

    // console.log(scene.add_thing(new Line([200,400], [0,200])));

    // console.log(scene.add_thing(new Line([400,200], [200,400])));
    // console.log(scene.add_thing(new Line([400,200], [200,0])));

    scene.add_thing(new Line([windowWidth/2+150, windowHeight/2+150], [windowWidth/2-50, windowHeight/2+200]));
    scene.add_thing(new Line([windowWidth/2+50, windowHeight/2+350], [windowWidth/2-250, windowHeight/2+300]));
    scene.add_thing(new Line([windowWidth/2-250, windowHeight/2+150], [windowWidth/2-250, windowHeight/2+300]));

    // console.log(scene.add_thing(new Line([windowWidth/2+150, windowHeight/2], [windowWidth/2, windowHeight/2+150])));
    // console.log(scene.add_thing(new Line([windowWidth/2-150, windowHeight/2], [windowWidth/2, windowHeight/2+150])));
    // console.log(scene.add_thing(new Line([windowWidth/2, windowHeight/2-150], [windowWidth/2+150, windowHeight/2])));
    // console.log(scene.add_thing(new Line([windowWidth/2, windowHeight/2-150], [windowWidth/2-150, windowHeight/2])));
    

    // console.log(scene.add_thing(new Line([windowWidth/2+250, windowHeight/2], [windowWidth/2, windowHeight/2+250])));
    // console.log(scene.add_thing(new Line([windowWidth/2-250, windowHeight/2], [windowWidth/2, windowHeight/2+250])));
    // console.log(scene.add_thing(new Line([windowWidth/2, windowHeight/2-250], [windowWidth/2+250, windowHeight/2])));
    // console.log(scene.add_thing(new Line([windowWidth/2, windowHeight/2-250], [windowWidth/2-250, windowHeight/2])));

    frameRate(60);
    smooth();
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    textAlign(CENTER);
    if(toggleDebug){    
        text("d - Debug | s - Scene Graph Type | g - Toggle Gravity", width/2, height-20);
    }else{
        text("d - Debug", width/2, height-20);
    }
    
    textAlign(LEFT);
    if(scene.things.length < 15){
        scene.add_thing(new Circle([windowWidth/2+75, windowHeight/2], 0, 0, random(15,25), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2-75, windowHeight/2], 0, 0, random(15,25), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2+75], 0, 0, random(15,25), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2-75], 0, 0, random(15,25), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, random(15,25), CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([windowWidth/2, windowHeight*2/3], 0, 0, 5, CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([random(windowWidth/4), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([random(windowWidth*3/4,windowWidth), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
    }
    scene.render();
    
    fill(255);
    noStroke();
    if(toggleDebug){
        text("Things", 20, 40);
        text("Checks", 20, 60);
        text("Collisions", 20, 80);
        text("Graph", 20, 100);
        text("Gravity", 20, 120);

        text(scene.things.length, 80, 40);
        text(checked_collisions, 80, 60);
        text(colliding_pairs, 80, 80);
        
        text(["DVBT", "Quadtree", "Array"][toggleCollisionGraph], 80, 100);
        
        toggleGravity ? fill(0,255,0) : fill(255,0,0);
        text(toggleGravity ? "ON" : "OFF", 80, 120);
    }
}

function mouseDragged(){
}

function mousePressed(){
}

function keyPressed(){
    console.log(keyCode);
    if(keyCode === 68){
        toggleDebug = !toggleDebug;
    }else if(keyCode === 83){
        toggleCollisionGraph = (toggleCollisionGraph + 1) % 3;
        scene.toggle_collision_graph(toggleCollisionGraph);
    }else if(keyCode === 71){
        toggleGravity = !toggleGravity;
        scene.toggle_gravity(toggleGravity);
    }

}