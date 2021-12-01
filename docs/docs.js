let scene;
let checked_collisions = 0;
let colliding_pairs = 0;

let thistree;

let FUNCTION_CALLS = 0;
let toggle = true;

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
    // console.log(scene.add_thing(new Line([200,800], [0,600])));

    // console.log(scene.add_thing(new Line([200,0], [0,200])));

    // console.log(scene.add_thing(new Line([200,400], [0,200])));

    // console.log(scene.add_thing(new Line([400,200], [200,400])));
    // console.log(scene.add_thing(new Line([400,200], [200,0])));
    
    frameRate(60);
    smooth();
    
    thistree = new Tree();
    // for(let i = 0; i < 3000; i++){
    //     thistree.insert(new Circle([random(windowWidth), random(windowHeight)], 0, 0, 10, CollisionType.DYNAMIC))
    // }
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    text(scene.things.length, 20, 40);
    
    // if(scene.things.length < 300){
    //     scene.add_thing(new Circle([windowWidth/2+75, windowHeight/2], 0, 0, random(1,15), CollisionType.DYNAMIC));
    //     scene.add_thing(new Circle([windowWidth/2-75, windowHeight/2], 0, 0, random(1,15), CollisionType.DYNAMIC));
    //     scene.add_thing(new Circle([windowWidth/2, windowHeight/2+75], 0, 0, random(1,15), CollisionType.DYNAMIC));
    //     scene.add_thing(new Circle([windowWidth/2, windowHeight/2-75], 0, 0, random(1,15), CollisionType.DYNAMIC));
    //     scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, random(1,15), CollisionType.DYNAMIC));
    //     // scene.add_thing(new Circle([windowWidth/2, windowHeight*2/3], 0, 0, 5, CollisionType.DYNAMIC));
    //     // scene.add_thing(new Circle([random(windowWidth/4), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
    //     // scene.add_thing(new Circle([random(windowWidth*3/4,windowWidth), random(windowHeight)], 0, 0, random(1, 50), CollisionType.DYNAMIC));
    // }
    // scene.render();

    fill(255);
    text(checked_collisions, 20, 60);
    text(colliding_pairs, 20, 80);
    text(FUNCTION_CALLS, 20, 100);

    if(toggle) thistree.draw();
    // let searchedObjects = thistree.search_circle(createVector(mouseX, mouseY), 200);
    // noFill();
    // stroke(255,0,0);
    // ellipse(mouseX, mouseY, 400);
    // searchedObjects.forEach(o => o.draw_with_bounding_box());
}

function mouseDragged(){
}

function mousePressed(){
    thistree.insert(new Circle([mouseX, mouseY], 0, 0, 10, CollisionType.DYNAMIC))
    console.log(thistree);
}

function keyPressed(){
    if(keyCode === 88){
        toggle = !toggle;
        console.log(thistree)
    }
}