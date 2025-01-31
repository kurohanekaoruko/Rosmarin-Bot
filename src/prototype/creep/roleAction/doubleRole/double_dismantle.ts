function FlagActionMove(creep: Creep) {
    const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
    const moveflag = Game.flags[`2D-${name}-MOVE`];
    if(moveflag && !creep.pos.inRangeTo(moveflag.pos, 0)) {
        if(creep.room.name !== moveflag.pos.roomName) {
            creep.memory.targetRoom = moveflag.pos.roomName;
        }
        creep.doubleMoveTo(moveflag.pos, '#ffff00')
    }
    if (moveflag) return true;
}

function FlagActionDismantle(creep: Creep) {
    const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
    const disflag = Game.flags[`2D-${name}-DIS`] || Game.flags['DIS-' + creep.memory.targetRoom];
    if(disflag) {
        if (creep.room.name !== disflag.pos.roomName) {
            creep.doubleMoveTo(disflag.pos, '#ffff00');
            return true;
        }
        const structures = disflag.pos.lookFor(LOOK_STRUCTURES);
        if(structures.length > 0) {
            const targetStructure = structures.find((s) => s.structureType == STRUCTURE_RAMPART) || structures[0];
            creep.doubleToDismantle(targetStructure);
            return true;
        }
    }
    if (disflag) return true;
}

function AutoFindTarget(creep: Creep) {
    let room = creep.room;
    const enemiesStructures = [
        ...room.rampart, ...room.constructedWall, ...room.extension, ...room.tower, ...room.spawn, ...room.lab,
        room.observer, room.factory, room.storage, room.terminal, room.nuker, room.powerSpawn,
    ];
    if(enemiesStructures.length == 0) return;

    // 找一般建筑
    let Structures = enemiesStructures.filter((s: any) =>
        s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_WALL &&
        (!s.store || s.store.getUsedCapacity() <= 3000) &&
        s.pos.findInRange(FIND_HOSTILE_CREEPS, 8)
        .filter((c: Creep) => !c.my && !c.isWhiteList() &&
        (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)).length == 0
    );
    let targetStructure = creep.pos.findClosestByPath(Structures, {
        ignoreCreeps: false,
        maxRooms: 1, range: 1,
        plainCost: 1, swampCost: 1
    });

    // 找不到就找墙
    if (!targetStructure) {
        Structures = enemiesStructures.filter((s: any) =>
            (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) &&
            s.pos.findInRange(FIND_HOSTILE_CREEPS, 8)
            .filter((c: Creep) => !c.my && !c.isWhiteList() &&
            (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)).length == 0
        );
        targetStructure = creep.pos.findClosestByPath(Structures, {
            ignoreCreeps: true,
            maxRooms: 1, range: 1,
            plainCost: 1, swampCost: 1
        });
    }

    if (!targetStructure) {
        creep.say('NO TARGET');
        creep.memory['targetId'] = null;
        creep.memory['idle'] = Game.time + 10;
        return;
    }

    const result = creep.moveTo(targetStructure, {
        visualizePathStyle: {stroke: '#ffff00'},
        maxRooms: 1, range: 1
    });
    if (result == ERR_NO_PATH) return;
    creep.memory['targetId'] = targetStructure.id;
}

function DoubleDismantleAction(creep: Creep) {
    // 旗帜移动
    if (FlagActionMove(creep)) return;

    // 规避
    if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6, {
        filter: (c) => !c.isWhiteList() &&
        (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0)
    }).length > 0) {
        let result = creep.doubleFlee();
        if (result === OK) {
            creep.memory['targetId'] = null;
            return;
        }
    }

    // 拆除旗帜标记的目标
    if (FlagActionDismantle(creep)) return;

    // 获取缓存的目标
    const target = Game.getObjectById(creep.memory['targetId']) as Structure;
    // 目标存在则行动
    if (target) {
        creep.doubleToDismantle(target);
        return;
    }

    // 移动到目标房间, 未到达房间不继续行动
    if (creep.doubleMoveToRoom(creep.memory.targetRoom, '#ffff00')) return;
    if (creep.room.my) return;
    if (Game.time < (creep.memory.idle || 0)) return;

    // 自动寻找目标
    AutoFindTarget(creep);
}


const double_dismantle = {
    run: function (creep: Creep) {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }

        if (!creep.memory.boosted) {
            if (creep.memory['boostmap']) {
                let result = creep.Boost(creep.memory['boostmap']);
                if (result === OK) {
                    creep.memory.boosted = true;
                }
            } else {
                creep.memory.boosted = creep.goBoost([
                    'XGHO2', 'GHO2', 'GO',
                    'XZH2O', 'ZH2O', 'ZH'
                ]);
            }
            return;
        }
    
        // 等待绑定
        if(!creep.memory.bind) return;
    
        // 获取绑定的另一个creep
        const bindcreep = Game.getObjectById(creep.memory.bind) as Creep;
    
        if(!bindcreep) {
            delete creep.memory.bind;
            return;
        }

        creep.memory.dontPullMe = true;
    
        // 主要行动
        DoubleDismantleAction(creep);
    }
}

export default double_dismantle;