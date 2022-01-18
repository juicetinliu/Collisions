let scene;
let statCheckedCollisions = 0;
let statCollidingPairs = 0;

let toggleDebug = false;
let toggleGravity = false;
let toggleCollisionGraph = 1;
let togglePause = false;
let toggleHighlightCollidingGroups = false;

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene();
    scene.toggle_collision_graph(toggleCollisionGraph);
    // scene.add_thing(new Circle([windowWidth/4, windowHeight/2], [0, 0], 0, 50, CollisionType.STATIC));
    // scene.add_thing(new Line([0,0], [windowWidth,0]));
    // scene.add_thing(new Line([windowWidth,0], [windowWidth,windowHeight]));
    // scene.add_thing(new Line([windowWidth,windowHeight], [0,windowHeight]));
    // scene.add_thing(new Line([0,windowHeight], [0,0]));
    
    // scene.add_thing(new Line([200,0], [0,200]));

    // scene.add_thing(new Line([600,0], [800,200]));
    // scene.add_thing(new Line([600,800], [800,600]));
    // // scene.add_thing(new Line([200,800], [0,600]));

    // scene.add_thing(new Line([200,0], [0,200]));

    // scene.add_thing(new Line([200,400], [0,200]));

    // scene.add_thing(new Line([400,200], [200,400]));
    // scene.add_thing(new Line([400,200], [200,0]));

    scene.add_thing(new Line([windowWidth/2+150, windowHeight/2+150], [windowWidth/2-150, windowHeight/2+200]));
    // scene.add_thing(new Line([windowWidth/2+50, windowHeight/2+350], [windowWidth/2-250, windowHeight/2+300]));
    // scene.add_thing(new Line([windowWidth/2+50, windowHeight/2+350], [windowWidth/2+250, windowHeight/2+350]));

    // scene.add_thing(new Line([windowWidth/2-250, windowHeight/2+150], [windowWidth/2-250, windowHeight/2+300]));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, 25, CollisionType.STATIC));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, 25, CollisionType.STATIC));

    // scene.add_thing(new Line([windowWidth/2+150, windowHeight/2], [windowWidth/2, windowHeight/2+150]));
    // scene.add_thing(new Line([windowWidth/2-150, windowHeight/2], [windowWidth/2, windowHeight/2+150]));
    // scene.add_thing(new Line([windowWidth/2, windowHeight/2-150], [windowWidth/2+150, windowHeight/2]));
    // scene.add_thing(new Line([windowWidth/2, windowHeight/2-150], [windowWidth/2-150, windowHeight/2]));

    scene.add_thing(new Line([windowWidth/2+250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
    
    scene.add_thing(new Line([windowWidth/2-250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
    scene.add_thing(new Line([windowWidth/2, windowHeight/2-250], [windowWidth/2+250, windowHeight/2]));
    scene.add_thing(new Line([windowWidth/2, windowHeight/2-250], [windowWidth/2-250, windowHeight/2]));


    // TEST CASES
    // scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2-400], [1, 0], 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2-400], 0, 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2+50, windowHeight/2-400], 0, 0, 25, CollisionType.DYNAMIC));

    // scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2], [1, 0], 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2-20], 0, 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2+20], 0, 0, 25, CollisionType.DYNAMIC));

    // scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2+400], [1, 0], 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2+400], 0, 0, 25, CollisionType.DYNAMIC));
    // scene.add_thing(new Circle([windowWidth/2+150, windowHeight/2+400], [-2, 0], 0, 25, CollisionType.DYNAMIC));

    frameRate(60);
    smooth();
}
//https://www.youtube.com/watch?v=ebq7L2Wtbl4&ab_channel=javidx9

function draw() {
    background(0,50);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    textAlign(CENTER);
    if(toggleDebug){    
        text("d - Debug | s - Scene Graph Type | g - Toggle Gravity | x - Show Collision Groups", width/2, height-20);
    }else{
        text("d - Debug", width/2, height-20);
    }
    
    noFill();
    stroke(255,128);
    draw_ellipse_vec(createVector(mouseX, mouseY), 20);

    textAlign(LEFT);
    // sceneAddObjects();
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
        text(statCheckedCollisions, 80, 60);
        text(statCollidingPairs, 80, 80);
        
        text(["DVBT", "Quadtree", "Array"][toggleCollisionGraph], 80, 100);
        
        toggleGravity ? fill(0,255,0) : fill(255,0,0);
        text(toggleGravity ? "ON" : "OFF", 80, 120);
    }
}

function sceneAddObjects() {
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
}

function mouseDragged(){
}

function mousePressed(){
}

function keyPressed(){
    console.log(keyCode);
    if(keyCode === 68){ //d
        toggleDebug = !toggleDebug;
    }else if(keyCode === 83){ //s
        toggleCollisionGraph = (toggleCollisionGraph + 1) % 3;
        scene.toggle_collision_graph(toggleCollisionGraph);
    }else if(keyCode === 71){ //g
        toggleGravity = !toggleGravity;
        scene.toggle_gravity(toggleGravity);
    }else if (keyCode === 88){
        toggleHighlightCollidingGroups = !toggleHighlightCollidingGroups;
    }else if (keyCode === 32){ //space
        togglePause = !togglePause;
    }

}