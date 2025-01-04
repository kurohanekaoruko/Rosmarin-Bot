const outClaim = {
    target: function(creep: Creep) {
        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return false;
        }

        const controller = creep.room.controller;
        const ticksToEnd = controller.reservation ? controller.reservation.ticksToEnd : 0;
        if(!controller) return;
        if (creep.pos.inRangeTo(controller, 1)) {
            if (ticksToEnd >= 4950) return false;
            creep.reserveController(controller);
            if (controller.sign &&
                controller.sign.username != creep.owner.username) {
                creep.signController(controller, '');
            }
        }
        else {
            creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return false;
    },
    source: function(creep: Creep) {
        return true;
    }
}

export default outClaim;