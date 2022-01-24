class ThingCollider{
    constructor(friction){
        this.friction = friction;
    }

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
        
        //Multiply by friction
        let aNewVel = tangent.copy().mult(a.vel.dot(tangent)).add(normal.copy().mult(aMomentum)).mult(this.friction);
        let bNewVel = tangent.copy().mult(b.vel.dot(tangent)).add(normal.copy().mult(bMomentum)).mult(this.friction);

        if(!aStatic){
            a.set_vel([aNewVel.x, aNewVel.y]);
        }
        if(!bStatic){
            b.set_vel([bNewVel.x, bNewVel.y]);
        }
    }

    circle_line(circle, b, intersection){
        //Intersection point between circle and line is closest point on line OR line endpoints (if circle resides on endpoints)
        //Assumes lines are always STATIC for now

        //If circle is static then don't collide
        if(circle.collisionType === CollisionType.STATIC) return;

        let newPos = intersection.copy().add(circle.pos.copy().sub(intersection).setMag(circle.rad));
        circle.set_pos([newPos.x, newPos.y]);
        
        let normal = circle.pos.copy().sub(intersection.copy()).normalize();

        //Multiply by friction
        let newVel = circle.vel.copy().sub(normal.copy().mult(2 * circle.vel.copy().dot(normal))).mult(this.friction);
        
        //reflect circle velocity
        circle.set_vel([newVel.x, newVel.y]);
    }

    collide_group(group){
        //Currently only contains groups with thing = circle and otherthings = lines;
        
        let circle = group.thing; //circle
        if(circle.collisionType === CollisionType.STATIC) return false;
        
        let intersections = object_list_remove_duplicates(group.intersections);


        //PROBLEM HERE SEE DIAGRAM
        //Ignore intersection points that have normals which are perpendicular to direction of travel (since there'd be no effect on the velocity)
        if(circle.vel.magSq() > MIN_VEL_TOLERANCE && intersections.length === 2){
            intersections = intersections.filter(i => {
                let iNormal = circle.pos.copy().sub(i.copy()).normalize();
                return abs(iNormal.copy().dot(circle.vel.copy().normalize())) > 1e-1;
            });
        }

        if(intersections.length > 0){
            //As long as there are intersection points left, take average of all intersection points
            let avgIntersections = intersections.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(intersections.length);
            let pushBacks = intersections.map(i => i.copy().add(circle.pos.copy().sub(i).setMag(circle.rad)));
            let newPos = pushBacks.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(intersections.length);
            // let newPos = avgIntersections.copy().add(circle.pos.copy().sub(avgIntersections).setMag(circle.rad)); //not good

            circle.set_pos([newPos.x, newPos.y]);
            
            // pushBacks.forEach(p => {
            //     fill(0,255,255);
            //     draw_ellipse_vec(avgIntersections, 10);
            // });
            
            let normal = circle.pos.copy().sub(avgIntersections.copy()).normalize();

            //Multiply by friction
            let newVel = circle.vel.copy().sub(normal.copy().mult(2 * circle.vel.copy().dot(normal))).mult(this.friction);
            
            //reflect circle velocity
            circle.set_vel([newVel.x, newVel.y]);
        }


        return true;
    }

    circle_line_group(circle, lineGroup){

    }
}