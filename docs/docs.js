let scene;

let toggleDebug = false;
let toggleGravity = false;
let toggleCollisionGraph = 1;
let togglePause = false;
let toggleHighlightCollidingGroups = false;

function setup(){
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene();
    scene.toggle_collision_graph(toggleCollisionGraph);
    toggleGravity = document.isMobileOrTabletView;
    scene.toggle_gravity(toggleGravity);

    // scene.add_thing(new Circle([windowWidth/4, windowHeight/2], [0, 0], 0, 50, CollisionType.STATIC));
    // scene.add_thing(new Wall([0,0], [windowWidth,0]));
    // scene.add_thing(new Wall([windowWidth,0], [windowWidth,windowHeight]));
    // scene.add_thing(new Wall([windowWidth,windowHeight], [0,windowHeight]));
    // scene.add_thing(new Wall([0,windowHeight], [0,0]));
    
    // scene.add_thing(new Wall([200,0], [0,200]));

    // scene.add_thing(new Wall([600,0], [800,200]));
    // scene.add_thing(new Wall([600,800], [800,600]));
    // // scene.add_thing(new Wall([200,800], [0,600]));

    // scene.add_thing(new Wall([200,0], [0,200]));

    // scene.add_thing(new Wall([200,400], [0,200]));

    // scene.add_thing(new Wall([400,200], [200,400]));
    // scene.add_thing(new Wall([400,200], [200,0]));

    // scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, 25, CollisionType.STATIC));

    // scene.add_thing(new Wall([windowWidth/2+150, windowHeight/2], [windowWidth/2, windowHeight/2+150]));
    // scene.add_thing(new Wall([windowWidth/2-150, windowHeight/2], [windowWidth/2, windowHeight/2+150]));
    // scene.add_thing(new Wall([windowWidth/2, windowHeight/2-150], [windowWidth/2+150, windowHeight/2]));
    // scene.add_thing(new Wall([windowWidth/2, windowHeight/2-150], [windowWidth/2-150, windowHeight/2]));

    scene.add_thing(new Wall([windowWidth/2+250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
    scene.add_thing(new Wall([windowWidth/2-250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
    scene.add_thing(new Wall([windowWidth/2, windowHeight/2-250], [windowWidth/2+250, windowHeight/2]));
    scene.add_thing(new Wall([windowWidth/2, windowHeight/2-250], [windowWidth/2-250, windowHeight/2]));



    // scene_add_ramps();
    scene_add_cup();
    // scene_add_tests();

    frameRate(60);
    smooth();
}
//https://www.youtube.com/watch?v=ebq7L2Wtbl4&ab_channel=javidx9

function draw(){
    background(0);
    
    scene_add_objects();
    
    scene.render();
    
    hud();
}

function scene_add_ramps(){
    scene.add_thing(new Wall([windowWidth/2, windowHeight/2+150], [windowWidth/2-150, windowHeight/2+100]));
    scene.add_thing(new Wall([windowWidth/2, windowHeight/2+50], [windowWidth/2+150, windowHeight/2]));
}

function scene_add_cup(){
    scene.add_thing(new Wall([windowWidth/2+100, windowHeight/2+300], [windowWidth/2-100, windowHeight/2+300]));
    scene.add_thing(new Wall([windowWidth/2+100, windowHeight/2+300], [windowWidth/2+100, windowHeight/2+200]));
    scene.add_thing(new Wall([windowWidth/2-100, windowHeight/2+300], [windowWidth/2-100, windowHeight/2+200]));

    scene.add_thing(new Wall([windowWidth/2+120, windowHeight/2+320], [windowWidth/2-120, windowHeight/2+320]));
    scene.add_thing(new Wall([windowWidth/2+120, windowHeight/2+320], [windowWidth/2+120, windowHeight/2+200]));
    scene.add_thing(new Wall([windowWidth/2-120, windowHeight/2+320], [windowWidth/2-120, windowHeight/2+200]));

    scene.add_thing(new Wall([windowWidth/2+120, windowHeight/2+200], [windowWidth/2+100, windowHeight/2+200]));
    scene.add_thing(new Wall([windowWidth/2-120, windowHeight/2+200], [windowWidth/2-100, windowHeight/2+200]));
}

function scene_add_tests(){
    scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2-400], [1, 0], 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2, windowHeight/2-400], 0, 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2+50, windowHeight/2-400], 0, 0, 25, CollisionType.DYNAMIC));

    scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2], [1, 0], 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2, windowHeight/2-20], 0, 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2, windowHeight/2+20], 0, 0, 25, CollisionType.DYNAMIC));

    scene.add_thing(new Circle([windowWidth/2-100, windowHeight/2+400], [1, 0], 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2, windowHeight/2+400], 0, 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Circle([windowWidth/2+150, windowHeight/2+400], [-2, 0], 0, 25, CollisionType.DYNAMIC));

    scene.add_thing(new Circle([windowWidth/2+150, windowHeight/2+99], 0, 0, 25, CollisionType.DYNAMIC));
    scene.add_thing(new Wall([windowWidth/2+150, windowHeight/2+150], [windowWidth/2-150, windowHeight/2+200]));
    scene.add_thing(new Wall([windowWidth/2+250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
    scene.add_thing(new Wall([windowWidth/2-250, windowHeight/2], [windowWidth/2, windowHeight/2+250]));
}

function scene_add_objects(){
    if(scene.things.length < 50){
        scene.add_thing(new Circle([windowWidth/2+75, windowHeight/2], 0, 0, random(5,15), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2-75, windowHeight/2], 0, 0, random(5,15), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2+75], 0, 0, random(5,15), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2-75], 0, 0, random(5,15), CollisionType.DYNAMIC));
        scene.add_thing(new Circle([windowWidth/2, windowHeight/2], 0, 0, random(5,15), CollisionType.DYNAMIC));
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
    }else if (keyCode === 88){ //x
        toggleHighlightCollidingGroups = !toggleHighlightCollidingGroups;
    }else if (keyCode === 32){ //space
        togglePause = !togglePause;
    }
}

function hud(){
    noFill();
    stroke(255,128);
    draw_ellipse_vec(createVector(mouseX, mouseY), 20);
    
    fill(255);
    noStroke();
    text(frameRate().toFixed(1), 20, 20);
    
    if(!document.isMobileOrTabletView){ //show hud only on desktop
        if(toggleDebug){    
            textAlign(CENTER);
            text("d - Debug | s - Scene Graph Type | g - Toggle Gravity | x - Show Collision Groups", width/2, height-20);
            
            textAlign(LEFT);
            text("Things", 20, 40);
            text(scene.things.length, 80, 40);
            
            text("Checks", 20, 60);
            text(scene.stats.checkedCollisions, 80, 60);
            
            text("Collisions", 20, 80);
            text(scene.stats.collidingPairs, 80, 80);
            
            text("Graph", 20, 100);
            text(["DVBT", "Quadtree", "Array"][toggleCollisionGraph], 80, 100);
            
            text("Gravity", 20, 120);
            toggleGravity ? fill(0,255,0) : fill(255,0,0);
            text(toggleGravity ? "ON" : "OFF", 80, 120);

        }else{
            textAlign(CENTER);
            text("d - Debug | g - Toggle Gravity", width/2, height-20);
            textAlign(LEFT);
        }
    }
}