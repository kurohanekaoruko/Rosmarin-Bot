const outInvader = {
    run: function(creep: any) {
        const invaderCores = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_INVADER_CORE
        });

        let targets = invaderCores;
        if (targets.length === 0) {
            const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
            targets = hostileCreeps;
        }
        
        if (targets.length > 0) {
            var target = creep.pos.findClosestByRange(targets);
            if (creep.pos.inRangeTo(target, 1)) {
                if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                creep.moveTo(target);
            }
            return;
        }

        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        if (targets.length === 0) {
            creep.memory['suicideCount'] = (creep.memory['suicideCount']||0) + 1;
            if (creep.memory['suicideCount'] >= 10) creep.suicide();
        }

        return;
    }
}

export default outInvader;