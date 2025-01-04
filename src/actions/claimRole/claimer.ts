const claimer = {
    target: function(creep: Creep) {
        // 如果没有目标房间
        if (!creep.memory.targetRoom) {
            creep.say("🚨 无目标");
            return;
        }

        // 如果不在目标房间，向目标房间移动
        if (creep.room.name !== creep.memory.targetRoom) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        const controller = creep.room.controller;

        if (!controller) return;

        if (controller.reservation && controller.reservation.username != creep.owner.username) {
            if (creep.pos.isNearTo(controller)) {
                creep.reserveController(controller);
            } else {
                creep.moveTo(controller);
            }
            return;
        }

        // 尝试占领控制器
        if (!controller.my) {
            if (creep.pos.inRangeTo(controller, 1)) {
                const result = creep.claimController(controller);
                if(creep.memory['sign']) creep.signController(controller, creep.memory['sign']);
                if(result !== OK) { creep.reserveController(controller); }
            }
            else {
                creep.moveTo(controller, {
                    visualizePathStyle: { stroke: '#ffffff' },
                    range: 1,
                    maxRooms: 1
                });
            }
        }
        
        return false;
    },
    source: function(creep: Creep) {
        return true;
    }
};

export default claimer;
