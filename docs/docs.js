let mymouse;
let mouseintersect = false;
let things = []
let balls = [];
let arena = [];

let scene;

let collider = new ThingCollider();

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    scene = new Scene()
    // collisions_setup();
    // balls_setup();
    // test_setup();
    for(let i = 0; i < 250; i++){
        scene.add_object(new Circle([300, 300], [0, 0], 0, 5, CollisionType.DYNAMIC));
    }

    for(let i = 0; i < 250; i++){
        scene.add_object(new Circle([500, 500], [0, 0], 0, 5, CollisionType.DYNAMIC));
    }

    // for(let i = 0; i < 500; i++){
    //     balls.push(new Circle([300, 300], [0, 0], 0, 5, CollisionType.DYNAMIC));
    // }
    smooth();
}


function draw() {
    background(0);
    fill(255);
    text(frameRate().toFixed(1), 20, 20);

    scene.render();

    // balls.forEach(ball => {
    //     ball.draw();
    //     ball.move();
    // });
    // if(balls.length >= 2){
    //     for(let i = 0; i < balls.length - 1; i++){
    //         for(let j = i + 1; j < balls.length; j++){
    //             collider.collide(balls[i], balls[j]);
    //         }
    //     }
    // }

    // collisions_draw();
    // balls_draw();
    // test_draw();
}

function mousePressed(){
    // balls.push(new Circle([mouseX,mouseY], [-5, 0], 0, 50, CollisionType.DYNAMIC));
    scene.add_object(new Circle([mouseX,mouseY], [-5, 0], 0, 50, CollisionType.STATIC, 500000));
}

function collisions_setup(){
    arena.push(new Line([50,50], [550,50], 0, 0));
    arena.push(new Line([550,50], [550,550], 0, 0));
    arena.push(new Line([550,550], [50,550], 0, 0));
    arena.push(new Line([50,550], [50,50], 0, 0));

    // balls.push(new Circle([500,300], [5, 0], 0, 30));
    // balls.push(new Circle([500,300], [-5, 1], 0, 30));
    // balls.push(new Circle([300,100], [0, 5], 0, 30));
    // balls.push(new Circle([300,500], [0, -5], 0, 30));

    balls.push(new Circle([300,300], [1, 0], 0, 30, CollisionType.DYNAMIC));
    // balls.push(new Circle([300,300], [-1, 0], 0, 30));
    // balls.push(new Circle([300,300], [0, 1], 0, 10));
    // balls.push(new Circle([300,300], [0, -1], 0, 30));

    // balls.push(new Circle([300,340], [0,1], 0, 10));
    // balls.push(new Circle([300,400], [0,1], 0, 50));
    // mymouse = new Circle([windowWidth/2, windowHeight/2], 0, 0, 30, CollisionType.STATIC);
}

function collisions_draw(){
    // mymouse.setPos([mouseX, mouseY]);
    arena.forEach(a => a.draw());
    let x = 50
    balls.forEach(ball => {
        ball.draw(x, 255);
        x += 200/balls.length;
        ball.move();
        arena.forEach(wall => collider.collide(ball, wall));
        // collider.collide(ball, mymouse);
    });
    if(balls.length >= 2){
        for(let i = 0; i < balls.length - 1; i++){
            for(let j = i + 1; j < balls.length; j++){
                collider.collide(balls[i], balls[j]);
            }
        }
    }
    // mymouse.draw();
}

function balls_setup(){
    arena.push(new Line([50,50], [600,50], 0, 0));
    arena.push(new Line([600,50], [500,500], 0, 0));
    arena.push(new Line([500,500], [50,600], 0, 0));
    arena.push(new Line([50,600], [50,50], 0, 0));
    arena.push(new Line([250,250], [200,350], 0, 0));
    arena.push(new Circle([250,250], [0,0], 0, 30, CollisionType.STATIC));
    // arena.push(new Line([200,350], [400,350], 0, 0));
    // arena.push(new Line([400,350], [250,250], 0, 0));
    let r_vel
    for(let i = 0; i < 100; i++){
        r_vel = p5.Vector.random2D().setMag(1);
        balls.push(new Circle([300, 300], [0, 0], 0, 10, CollisionType.DYNAMIC));
    }
}

function balls_draw(){
    arena.forEach(a => a.draw());
    balls.forEach(ball => {
        ball.draw(-1,255);
        ball.move();
        arena.forEach(wall => collider.collide(ball, wall));
    });
    if(balls.length >= 2){
        for(let i = 0; i < balls.length - 1; i++){
            for(let j = i + 1; j < balls.length; j++){
                collider.collide(balls[i], balls[j]);
            }
        }
    }
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