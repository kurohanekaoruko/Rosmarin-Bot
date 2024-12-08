function withdraw(creep: Creep) {
    if (creep.room.name != creep.memory.sourceRoom) {
        creep.moveToRoom(creep.memory.sourceRoom);
        return;
    }

    const room = creep.room;
    let target = Game.getObjectById(creep.memory.cache.targetId) as any;
    let restType = creep.memory.cache.restType;
    let actionType = creep.memory.cache.actionType;

    if (!target || ((actionType == 'pickup' && target.amount == 0) ||
        (actionType == 'withdraw' && target.store[restType] == 0)
    )) {
        const resources = room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.amount > 500
        });

        if (resources.length > 0) {
            target = creep.pos.findClosestByRange(resources);
            restType = target.resourceType;
            actionType = 'pickup';
            creep.memory.cache.targetId = target.id;
            creep.memory.cache.restType = restType;
            creep.memory.cache.actionType = actionType;
        }
    }

    if (!target || ((actionType == 'pickup' && target.amount == 0) ||
        (actionType == 'withdraw' && target.store[restType] == 0)
    )) {
        const RUINs = room.find(FIND_RUINS, {
            filter: (ruin) => ruin.store.getUsedCapacity() > 0
        });

        if (RUINs.length > 0) {
            target = creep.pos.findClosestByRange(RUINs);
            restType = Object.keys(target.store)[0] as ResourceConstant;
            actionType = 'withdraw';
            creep.memory.cache.targetId = target.id;
            creep.memory.cache.restType = restType;
            creep.memory.cache.actionType = actionType;
        }
    }
    
    if (!target || ((actionType == 'pickup' && target.amount == 0) ||
        (actionType == 'withdraw' && target.store[restType] == 0)
    )) {
        if (room.storage && room.storage.store.getUsedCapacity() > 0) {
            target = room.storage;
            restType = Object.keys(room.storage.store)
                        .reduce((a, b) => room.storage.store[a] < room.storage.store[b] ? a : b);
            actionType = 'withdraw';
            creep.memory.cache.targetId = target.id;
            creep.memory.cache.restType = restType;
            creep.memory.cache.actionType = actionType;
        }
    }

    if (!target || ((actionType == 'pickup' && target.amount == 0) ||
        (actionType == 'withdraw' && target.store[restType] == 0)
    )) {
        if (room.terminal && room.terminal.store.getUsedCapacity() > 0) {
            target = room.terminal;
            restType = Object.keys(room.terminal.store)
                        .reduce((a, b) => room.terminal.store[a] < room.terminal.store[b] ? a : b);
            actionType = 'withdraw';
            creep.memory.cache.targetId = target.id;
            creep.memory.cache.restType = restType;
            creep.memory.cache.actionType = actionType;
        }
    }

    if (target && actionType == 'pickup' && target.amount > 0) {
        if (creep.pos.isNearTo(target)) {
            creep.pickup(target);
        } else {
            creep.moveTo(target, {
                maxRooms: 1,
                range: 1,
                ignoreCreeps: false,
            });
        }
        return;
    }

    if (target && actionType == 'withdraw' && target.store[restType] > 0) {
        if (creep.pos.isNearTo(target)) {
            creep.withdraw(target, restType);
        } else {
            creep.moveTo(target, {
                maxRooms: 1,
                range: 1,
                ignoreCreeps: false,
            });
        }
        return;
    }
}

function transfer(creep: Creep) {
    if (creep.room.name != creep.memory.targetRoom) {
        creep.moveToRoom(creep.memory.targetRoom);
        return;
    }

    const room = creep.room;

    if (room.storage && room.storage.store.getFreeCapacity() > 0) {
        const target = room.storage;
        const resoureType = Object.keys(creep.store)[0] as ResourceConstant;
        creep.transferOrMoveTo(target, resoureType);
        return;
    }

    if (room.terminal && room.terminal.store.getFreeCapacity() > 0) {
        const target = room.terminal;
        const resoureType = Object.keys(creep.store)[0] as ResourceConstant;
        creep.transferOrMoveTo(target, resoureType);
        return;
    }
}

const logisticFunction = {
    prepare: function (creep: Creep) {
        const boosts = ['XKH2O', 'KH2O', 'KH'];
        creep.memory.boosted = creep.goBoost(boosts);
        if(creep.memory.boosted) return true;
        return false;
    },
    source: function (creep: Creep) {
        withdraw(creep);
        return creep.store.getFreeCapacity() === 0;
    },
    target: function (creep: Creep) {
        transfer(creep);
        return creep.store.getUsedCapacity() === 0;
    }
};

export default logisticFunction;