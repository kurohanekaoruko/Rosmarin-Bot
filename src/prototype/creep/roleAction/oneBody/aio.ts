const aio = {
    run: function (creep: Creep) {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }
    
        if (!creep.memory.boosted) {
            if (creep.memory['BOOST']) {
                let result = creep.Boost(creep.memory['BOOST'])
                if (result == OK) {
                    creep.memory.boosted = true
                }
            } else {
                const boost = ['XGHO2', 'XLHO2', 'XKHO2', 'XZHO2'];
                creep.memory.boosted = creep.goBoost(boost);
            }
            
            return
        }

        creep.heal(creep);
    
        let moveOK = false;
        let rangedOK = false;
    
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const moveflag = Game.flags['aio-move'] || Game.flags[name + '-move'];
        if(moveflag) {
            if(creep.room.name !== moveflag.pos.roomName) {
                creep.memory.targetRoom = moveflag.pos.roomName;
            }
            creep.moveTo(moveflag.pos, {visualizePathStyle: {stroke: '#00ff00'}})
            moveOK = true;
        }
    
        if (creep.room.name !== creep.memory.targetRoom && !moveOK) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        const rangedflag = Game.flags['aio-ranged'] || Game.flags[name + '-ranged'];
        if (rangedflag) {
            if (creep.pos.isNear(rangedflag.pos)) {
                creep.rangedMassAttack();
                rangedOK = true;
            } else if (creep.pos.inRangeTo(rangedflag.pos, 3)) {
                const target = rangedflag.pos.lookFor(LOOK_STRUCTURES)?.[0] as Structure;
                creep.rangedAttack(target);
                rangedOK = true;
            }
            else if (!moveOK) {
                creep.moveTo(rangedflag.pos, {visualizePathStyle: {stroke: '#ff0000'}});
                moveOK = true;
            }
        }

        const massflag = Game.flags['aio-mass'] || Game.flags[name + '-mass'];
        if (massflag) {
            if (creep.pos.isNear(massflag.pos)) {
                creep.rangedMassAttack();
                rangedOK = true;
            } else if (creep.pos.inRangeTo(massflag.pos, 3)) {
                const target = massflag.pos.lookFor(LOOK_STRUCTURES)?.[0] as Structure;
                creep.rangedAttack(target);
                rangedOK = true;
                creep.moveTo(massflag.pos, {visualizePathStyle: {stroke: '#ff0000'}});
                moveOK = true;
            } else if (!moveOK) {
                creep.moveTo(massflag.pos, {visualizePathStyle: {stroke: '#ff0000'}});
                moveOK = true;
            }
        }

        if (rangedOK || moveOK) return;
    
        const creepTarget = creep.room.find(FIND_HOSTILE_CREEPS).filter((creep) => {
            return !Memory['whitelist'].includes(creep.owner.username)
        })
        ;
        const structureTarget = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return !structure.room.my &&
                structure.structureType !== STRUCTURE_CONTROLLER &&
                structure.structureType !== STRUCTURE_CONTAINER &&
                structure.structureType !== STRUCTURE_STORAGE &&
                structure.structureType !== STRUCTURE_TERMINAL &&
                structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART &&
                structure.structureType !== STRUCTURE_ROAD;
            }
        });
    
        let target = creep.pos.findClosestByRange([...creepTarget, ...structureTarget]) as any;
        if (target) {
            const storageAndTerminal = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: (s: any) => s && (
                    s.structureType === STRUCTURE_STORAGE ||
                    s.structureType === STRUCTURE_TERMINAL)
            })
            if (!rangedOK && !storageAndTerminal) {
                creep.rangedMassAttack();
                rangedOK = true;
            } else if (!rangedOK && creep.pos.inRange(target.pos, 3)) {
                creep.rangedAttack(target);
                rangedOK = true;
            } else if (!moveOK) {
                creep.moveTo(target);
                moveOK = true;
            }
        }
    }
}

export default aio