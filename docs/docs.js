let circle;
let things = [];
let g = [0, 0.9];

function setup() {
    renderer = createCanvas(windowWidth, windowHeight);
    things.push(new Circle([windowWidth/2, windowHeight/2], 0, 0, 30));
    things.push(new Rect([windowWidth/3, windowHeight*2/3], 0, 0, [50,50]));
    circle = new Circle([windowWidth/2, windowHeight/2], 0, 0, 30);
}


function draw() {
    background(0);
    things.forEach(t => {
        t.move();
        t.draw();
    });
    circle.setPos([mouseX, mouseY]);
    circle.draw();
}
