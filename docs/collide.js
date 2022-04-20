class Collider{
    constructor(friction){
        this.friction = friction; //TODO: ELASTICITY
        this.elasticity = friction;
    }

    check_collision(a, b){
        if(a.collisionType === CollisionType.NONE || b.collisionType === CollisionType.NONE) return false;
        
        if(a.collisionType === CollisionType.STATIC && b.collisionType === CollisionType.STATIC) return false;

        return a.intersects(b);
    }

    collide(a, b, intersection){
        if(!this.check_collision(a, b)) return; //FIXES: If two circles hit each other with a line in the middle, multiple collisions occur

        switch(a.thingType){

            case ThingType.CIRCLE:
                switch(b.thingType){

                    case ThingType.CIRCLE:
                        this.circle_circle(a, b);
                        return;
        
                    case ThingType.LINE:
                        this.circle_line(a, b, intersection);
                        return;

                    case ThingType.RECT:
                        this.
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
            
            case ThingType.RECT:
                switch(b.thingType){
                    case ThingType.CIRCLE:
                        this.
                        return;
                    
                    default:
                        return;
                }

            default:
                return;
        }
    }

    circle_circle_updated(a, b){
        let intersection = this.separate_pair(a, b);
        
        if(!intersection) return; //both static -> don't collide

        this.collide_pair(a, b, intersection);
    }

    collide_pair(a, b, intersection){
        let aStatic = (a.collisionType === CollisionType.STATIC);
        let bStatic = (b.collisionType === CollisionType.STATIC);

        let aUpdatedVel = a.vel.copy().add(a.rotVel)
        let bUpdatedVel = b.vel.copy().add(b.rotVel) //???????
        
        let collisionNormal = a.pos.copy().sub(b.pos).normalize();
        let velDiff = aUpdatedVel.copy().sub(bUpdatedVel);

        let jTop = -(1 + this.elasticity) * velDiff.dot(collisionNormal);

        let massInvSum = (1 / a.mass) + (1 / b.mass);

        let aCollisionArm = intersection.copy().sub(a.pos);
        let bCollisionArm = intersection.copy().sub(b.pos);

        let aAugMassInertia = aCollisionArm.cross(collisionNormal);
        let bAugMassInertia = bCollisionArm.cross(collisionNormal);

        let augMassInertia = aAugMassInertia.copy().mult(a.rotInertiaInv).dot(aAugMassInertia) + bAugMassInertia.copy().mult(b.rotInertiaInv).dot(bAugMassInertia);

        let jBot = massInvSum + augMassInertia;
        let j = jTop / jBot;


        let aNewRotVel = a.rotVel(aCollisionArm.copy().cross(collisionNormal.copy().mult(j)).mult(a.rotInertiaInv)); //????????

        let aNewVel = a.vel.copy().add(collisionNormal.copy().mult(j / a.mass));
        let bNewVel = b.vel.copy().sub(collisionNormal.copy().mult(j / b.mass));

        if(!aStatic){
            a.set_vel(aNewVel);
        }
        if(!bStatic){
            b.set_vel(bNewVel);
        }
    }

    separate_pair(a, b){ //TODO – use separating axis (GJK OR SAT) to separate, return collision point
        let aStatic = (a.collisionType === CollisionType.STATIC);
        let bStatic = (b.collisionType === CollisionType.STATIC);

        if(aStatic && bStatic) return false; //both static -> don't collide

        let prePosDiff = a.pos.copy().sub(b.pos);
        
        if(prePosDiff.magSq() < 1e-6){ //add random noise if objects spawn exactly on each other
            let shiftAxis = random_vec().setMag(1e-4);

            if(!(aStatic || bStatic)){ //neither are static (at this point can't have both static)
                let aNewShiftPos = a.pos.copy().add(shiftAxis);
                a.set_pos(aNewShiftPos);
                let bNewShiftPos = b.pos.copy().sub(shiftAxis);
                b.set_pos(bNewShiftPos);
            }else if(!aStatic){ //if A is not static
                let newShiftPos = a.pos.copy().add(random_vec().setMag(1e-3));
                a.set_pos(newShiftPos);
            }else{ //if B is not static
                let newShiftPos = b.pos.copy().add(random_vec().setMag(1e-3));
                b.set_pos(newShiftPos);
            }

            prePosDiff = a.pos.copy().sub(b.pos);
        }
        
        let overlap = prePosDiff.setMag(prePosDiff.mag() - a.rad - b.rad);

        if(!(aStatic || bStatic)){
            overlap.mult(0.5);
        }

        if(!aStatic){
            let aNewPos = a.pos.copy().sub(overlap);
            a.set_pos(aNewPos);
        }
        if(!bStatic){
            let bNewPos = b.pos.copy().add(overlap);
            b.set_pos(bNewPos);
        }

        let collisionNormalARad = b.pos.copy().sub(a.pos).setMag(a.rad);
        let collisionPoint = a.pos.copy().add(collisionNormalARad);
        return collisionPoint;
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
                let newShiftPos = b.pos.copy().add(random_vec().setMag(1e-3));
                b.set_pos(newShiftPos);
                console.log("shifting");
            }
        }else if(aStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = b.pos.copy().add(random_vec().setMag(1e-3));
                b.set_pos(newShiftPos);
                console.log("shifting");
            }
        }else if(bStatic){
            if(prePosDiff.magSq() < 1e-6){
                let newShiftPos = a.pos.copy().add(random_vec().setMag(1e-3));
                a.set_pos(newShiftPos);
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
            a.set_pos(aNewPos);
        }
        if(!bStatic){
            let bNewPos = b.pos.copy().add(overlap);
            b.set_pos(bNewPos);
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
            a.set_vel(aNewVel);
        }
        if(!bStatic){
            b.set_vel(bNewVel);
        }
    }

    circle_line(circle, b, intersection){
        //Intersection point between circle and line is closest point on line OR line endpoints (if circle resides on endpoints)
        //Assumes lines are always Walls for now

        //If circle is static then don't collide
        if(circle.collisionType === CollisionType.STATIC) return;

        let newPos = intersection.copy().add(circle.pos.copy().sub(intersection).setMag(circle.rad));
        circle.set_pos(newPos);
        
        let normal = circle.pos.copy().sub(intersection.copy()).normalize();

        //Multiply by friction
        let newVel = circle.vel.copy().sub(normal.copy().mult(2 * circle.vel.copy().dot(normal)));
        
        newVel = newVel.setMag(circle.vel.mag());
        //reflect circle velocity
        circle.set_vel(newVel);
    }

    collide_group(group){
        //Currently only contains groups with thing = circle and otherthings = lines;
        
        let circle = group.thing; //circle
        if(circle.collisionType === CollisionType.STATIC) return false;
        
        let intersections = object_list_remove_duplicates(group.intersections);

        let circleVel = circle.vel;

        //PROBLEM HERE SEE DIAGRAM
        //Ignore intersection points that have normals which are perpendicular to direction of travel (since there'd be no effect on the velocity)
        if(circleVel.magSq() > MIN_VEL_TOLERANCE && intersections.length === 2){
            intersections = intersections.filter(i => {
                let iNormal = circle.pos.copy().sub(i.copy()).normalize();
                return abs(iNormal.copy().dot(circleVel.copy().normalize())) > 1e-1;
            });
        }

        if(intersections.length > 0){
            //As long as there are intersection points left, take average of all intersection points
            let avgIntersections = intersections.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(intersections.length);
            let pushBacks = intersections.map(i => i.copy().add(circle.pos.copy().sub(i).setMag(circle.rad)));
            let newPos = pushBacks.reduce((a, b) => a.copy().add(b), to_2d_vector(0)).div(intersections.length);
            // let newPos = avgIntersections.copy().add(circle.pos.copy().sub(avgIntersections).setMag(circle.rad)); //not good

            circle.set_pos(newPos);
            
            // pushBacks.forEach(p => {
            //     fill(0,255,255);
            //     draw_ellipse_vec(avgIntersections, 10);
            // });
            
            let normal = circle.pos.copy().sub(avgIntersections.copy()).normalize();

            //Multiply by friction
            let newVel = circleVel.copy().sub(normal.copy().mult(2 * circleVel.copy().dot(normal)));

            newVel = newVel.setMag(circleVel.mag());
            
            //reflect circle velocity
            circle.set_vel(newVel);
        }


        return true;
    }
}