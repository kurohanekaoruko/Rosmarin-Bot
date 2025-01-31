const aclaimer = {
    run: function(creep: Creep) {
        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }
    
        const controller = creep.room.controller;
    
        if ((controller.upgradeBlocked||0) > creep.ticksToLive) {
            creep.suicide();
            return;
        }
    
        if (creep.pos.isNearTo(controller)) {
            creep.signController(controller, '');
            creep.attackController(controller);
        } else {
            creep.moveTo(controller);
        }
    }
}

export default aclaimer