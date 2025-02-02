const one_tough_action = {
    move: function (creep: Creep) {
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const moveflag = Game.flags[name + '-move'];
        if(moveflag && !creep.pos.inRangeTo(moveflag.pos, 0)) {
            if(creep.room.name !== moveflag.pos.roomName) {
                creep.memory.targetRoom = moveflag.pos.roomName;
            }
            creep.moveTo(moveflag.pos);
            return true;
        }
        if (moveflag) return true;
        return false
    },
    moveToRoom: function (creep: Creep) {
        // 移动到目标房间
        if(creep.memory.targetRoom && creep.room.name !== creep.memory.targetRoom) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom))
        }
        else if(creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49) {
            creep.moveTo(new RoomPosition(25, 25, creep.room.name))
        }

        // 未到达房间不继续行动
        if(creep.memory.targetRoom && creep.room.name !== creep.memory.targetRoom) return true;

        return false
    }
}

const one_tough = {
    run: function (creep: Creep) {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }
    
        creep.heal(creep);
    
        if (!creep.memory.boosted) {
            const boost = ['XGHO2', 'XLHO2'];
            creep.memory.boosted = creep.goBoost(boost, true, true);
            return
        }
    
        if(creep.ticksToLive < 100 && creep.room.my) {
            creep.unboost();
            return;
        }
    
        if(one_tough_action.move(creep)) return;
    
        if(one_tough_action.moveToRoom(creep)) return;
    
        const target = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: (creep) => {if (Memory['whitelist'].includes(creep.owner.username)) return false;
                return creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(RANGED_ATTACK) > 0;}
        })[0];
        if(target) {
            creep.moveTo(target, {range: 3});
            return;
        }
    }
}

export default one_tough;