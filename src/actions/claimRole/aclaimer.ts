const aclaimer = {
    run: function(creep: Creep) {
        if (creep.memory.role == 'healAclaimer') {
            if (!creep.memory.boosted) {
                const boost = ['XGHO2', 'XLHO2'];
                creep.memory.boosted = creep.goBoost(boost, true);
                return
            }
        }

        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            creep.heal(creep);
            return;
        }
    
        const controller = creep.room.controller;
    
        if (controller.reservation && controller.reservation.username != creep.owner.username) {
            if (creep.pos.isNearTo(controller)) {
                creep.reserveController(controller);
            } else {
                creep.moveTo(controller);
            }
            return;
        }
    
        if (!controller || !controller.owner || controller.my) {
            const flags = creep.room.find(FIND_FLAGS) || [];
            const flag = flags.find(f => f.name.match(/aclaim/));
            if (flag) flag.remove();
            creep.suicide();
            return;
        }
    
        if ((controller.upgradeBlocked||0) > creep.ticksToLive) {
            const flag = Game.flags[`${creep.memory.homeRoom}-aclaim`];
            if (flag) {
                creep.memory.targetRoom = flag.pos.roomName;
            } else {
                creep.suicide();
            }
            return;
        }
    
        if (creep.pos.isNearTo(controller)) {
            creep.signController(controller, '');
            creep.attackController(controller);
        } else {
            creep.moveTo(controller);
            creep.heal(creep);
        }
    }
}

export default aclaimer