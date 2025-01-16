function withdraw(creep: Creep) {
    if(!creep.memory['resource']) creep.memory['resource'] = RESOURCE_ENERGY;
    const drop = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5, {
        filter: (i) => i.resourceType === creep.memory['resource']
    })[0]
    if (drop) {
        if (creep.pickup(drop) === ERR_NOT_IN_RANGE) {
            creep.moveTo(drop);
        }
        return;
    }

    const tombstone = creep.pos.findInRange(FIND_TOMBSTONES, 5, {
        filter: (i) => i.store.getUsedCapacity() > 0 && (i.store.getUsedCapacity(creep.memory['resource']))
    })[0]
    if (tombstone) {
        if (creep.withdraw(tombstone, creep.memory['resource']) === ERR_NOT_IN_RANGE) {
            creep.moveTo(tombstone);
        }
        return;
    }

    if (creep.room.name != creep.memory.sourceRoom) {
        creep.moveToRoom(creep.memory.sourceRoom);
        return;
    }

    const res = creep.memory['resource'];

    const target = [creep.room.storage, creep.room.terminal].filter((i) => {
        return i && i.store[res] > 0 && (creep.room.my || 
            i.pos.lookFor(LOOK_STRUCTURES).every((i) => i.structureType !== STRUCTURE_RAMPART));
    })[0];

    if (target) {
        creep.withdrawOrMoveTo(target, res);
    }

    return;
}

function transfer(creep: Creep) {
    if (creep.room.name != creep.memory.targetRoom) {
        creep.moveToRoom(creep.memory.targetRoom);
        return;
    }

    const res = creep.memory['resource'] || RESOURCE_ENERGY;

    const targets = [creep.room.storage, creep.room.terminal, ...creep.room.container].filter((i) => i && i.store.getFreeCapacity(res) > 0);
    const target = creep.pos.findClosestByRange(targets);

    if (target) {
        creep.transferOrMoveTo(target, Object.keys(creep.store)[0] as ResourceConstant);
    } else {
        creep.drop(res);
    }
    
}



const BigCarryFunction = {
    prepare: function (creep: Creep) {
        const boostRes = ['XKH2O', 'KH2O', 'KH', 'XZHO2', 'ZHO2', 'ZO'];
        return creep.goBoost(boostRes);
    },
    source: function (creep: Creep) {
        if(!creep.memory.ready) return false;
        withdraw(creep);
        return creep.store.getFreeCapacity() === 0;
    },
    target: function (creep: Creep) {
        if(!creep.memory.ready) return false;
        transfer(creep);
        return creep.store.getUsedCapacity() === 0;
    }
};

export default BigCarryFunction;