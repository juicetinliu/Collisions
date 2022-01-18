class ThingCollider{
    constructor(){}

    check_collision(a, b){
        if(a.collisionType === CollisionType.NONE || b.collisionType === CollisionType.NONE) return false;
        
        return a.intersects(b);
    }

    collide(a, b, intersection){
        switch(a.thingType){

            case ThingType.CIRCLE:
                switch(b.thingType){

                    case ThingType.CIRCLE:
                        this.circle_circle(a, b);
                        return;
        
                    case ThingType.LINE:
                        this.circle_line(a, b, intersection);
                        return;
                
                    default:
                        return;
                }

            case ThingType.LINE:
                switch(b.thingType){
        
                    case ThingType.CIRCLE:
                        this.circle_line(b, a, intersection);
                        return;
                
                    default:
                        return;
                }

            default:
                return;
        }
    }

    circle_circle(a, b){
        // stroke(255,0,0);
        // line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
        
        // STATICS
        let aStatic = (a.collisionType === CollisionType.STATIC);
        let bStatic = (b.collisionType === CollisionType.STATIC);
        
        if(aStatic && bStatic) return; //both static -> don't collide
        
        let prePosDiff = a.pos.copy().sub(b.pos);
        
        if(!(aStatic || bStatic)){ //neither are static
            if(prePosDiff.magSq() < 1e-6){ //add random noise if objects spawn exactly on each other
                let newShiftPos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }else if(aStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = b.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                b.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }else if(bStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = a.pos.copy().add(p5.Vector.random2D().setMag(1e-3));
                a.set_pos([newShiftPos.x, newShiftPos.y]);
                console.log("shifting");
            }
        }
        prePosDiff = a.pos.copy().sub(b.pos);
        let overlap = prePosDiff.setMag(prePosDiff.mag() - a.rad - b.rad);

        if(!(aStatic || bStatic)){
            overlap.mult(0.5);
        }

        if(!aStatic){
            let aNewPos = a.pos.copy().sub(overlap);
            a.set_pos([aNewPos.x, aNewPos.y]);
        }
        if(!bStatic){
            let bNewPos = b.pos.copy().add(overlap);
            b.set_pos([bNewPos.x, bNewPos.y]);            
        }

        //momentum and velocity calculations
        let massTotal = a.mass + b.mass;
        let massDiff = a.mass - b.mass;

        let normal = b.pos.copy().sub(a.pos).normalize();
        let tangent = createVector(-normal.y, normal.x);
        
        let aDotNormal = a.vel.copy().dot(normal);
        let bDotNormal = b.vel.copy().dot(normal);

        let aMomentum;
        let bMomentum;

        if(!(aStatic || bStatic)){ //Neither are static
            aMomentum = (aDotNormal * massDiff + 2 * b.mass * bDotNormal) / (massTotal);
            bMomentum = (bDotNormal * -massDiff + 2 * a.mass * aDotNormal) / (massTotal);
        }else if(aStatic){ //Treat a.mass as infinite: massTotal = a.mass, massDiff = a.mass, cancel terms
            aMomentum = aDotNormal;
            bMomentum = -bDotNormal + 2 * aDotNormal;
        }else if(bStatic){ //Treat b.mass as infinite: massTotal = b.mass, massDiff = -b.mass, cancel terms
            aMomentum = -aDotNormal + 2 * bDotNormal;
            bMomentum = bDotNormal;
        }
        
        let aNewVel = tangent.copy().mult(a.vel.dot(tangent)).add(normal.copy().mult(aMomentum));
        let bNewVel = tangent.copy().mult(b.vel.dot(tangent)).add(normal.copy().mult(bMomentum));

        if(!aStatic){
            a.set_vel([aNewVel.x, aNewVel.y]);
        }
        if(!bStatic){
            b.set_vel([bNewVel.x, bNewVel.y]);
        }
    }

    circle_line(a, b, intersection){
        //Intersection point between circle and line is closest point on line OR line endpoints (if circle resides on endpoints)
        //Assumes lines are always STATIC for now

        //If circle is static then don't collide
        if(a.collisionType === CollisionType.STATIC) return;

        // fill(255,0,0);
        // draw_ellipse_vec(intersection, 5)

        // console.log(intersection.x, intersection.y);
        // console.log(b.posA.x, b.posA.y);
        // console.log(b.posB.x, b.posB.y);

        let new_pos = intersection.copy().add(a.pos.copy().sub(intersection).setMag(a.rad));
        a.set_pos([new_pos.x, new_pos.y]);
        
        let normal = a.pos.copy().sub(intersection.copy()).normalize();
        let new_vel = a.vel.copy().sub(normal.copy().mult(2 * a.vel.copy().dot(normal)));
        
        //BUG: MULTIPLE REFLECTIONS CAN OCCUR BETWEEN A CIRCLE AND TWO LINES 
        stroke(255);
        draw_line_vec(intersection, intersection.copy().add(normal.copy().setMag(50)));

        draw_line_vec(a.pos, new_vel.copy().setMag(100).add(a.pos));
        
        //reflect circle velocity
        a.set_vel([new_vel.x, new_vel.y]);
    }
}