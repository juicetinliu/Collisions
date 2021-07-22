let scene;
let checked_collisions = 0;
let colliding_pairs = 0

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene();
    
    // scene.add_thing(new Circle([windowWidth/4, windowHeight/2], [0, 0], 0, 50, CollisionType.STATIC));
    frameRate(60);
    smooth();
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    text(scene.things.length, 20, 40);
    
    if(scene.things.length < 500){
        scene.add_thing(new Circle([windowWidth/2+75, windowHeight/2], 0, 0, random(1,10), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2-75, windowHeight/2], 0, 0, random(1,10), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2+75], 0, 0, random(1,10), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2-75], 0, 0, random(1,10), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, random(1,10), CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([windowWidth/2, windowHeight*2/3], 0, 0, 5, CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([random(windowWidth/4), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
        // scene.add_thing(new Circle([random(windowWidth*3/4,windowWidth), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
    }
    scene.render();

    fill(255);
    text(checked_collisions, 20, 60);
    text(colliding_pairs, 20, 80);
}

function mouseDragged(){
}