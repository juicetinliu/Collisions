let scene;
let checked_collisions = 0;
let colliding_pairs = 0

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene()

    scene.add_thing(new Circle([500, 200], [0, 0], 0, 100, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([500, 400], [0, 0], 0, 100, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([500, 600], [0, 0], 0, 100, CollisionType.DYNAMIC));

    scene.add_thing(new Circle([800, 390], [-15, 0], 0, 100, CollisionType.DYNAMIC));

    frameRate(60);
    smooth();
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);
    text(scene.things.length, 20, 40);

    // if(scene.things.length < 1000){
    //     scene.add_thing(new Circle([500, 500], [0, 0], 0, 1, CollisionType.DYNAMIC));
    //     scene.add_thing(new Circle([500, 200], [0, 0], 0, 1, CollisionType.DYNAMIC));
    // }
    scene.render();

    text(checked_collisions, 20, 60);
    text(colliding_pairs, 20, 80);

}

function mousePressed(){
    // if(mouseButton === CENTER){
    //     scene.add_thing(new Circle([mouseX,mouseY], [-5, 0], 0, 100, CollisionType.DYNAMIC));
    // }else{
    //     scene.add_thing(new Circle([mouseX,mouseY], [0, 0], 0, 100, CollisionType.DYNAMIC));
    // }
}