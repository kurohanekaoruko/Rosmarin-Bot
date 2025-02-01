function FlagActionMove(creep: Creep) {
    const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
    const moveflag = Game.flags[`2A-${name}-move`];
    if(moveflag && !creep.pos.inRangeTo(moveflag.pos, 0)) {
        if(creep.room.name !== moveflag.pos.roomName) {
            creep.memory.targetRoom = moveflag.pos.roomName;
        }
        creep.doubleMoveTo(moveflag.pos, '#ffff00')
    }
    if (moveflag) return true;
}

function FlagActionAttack(creep: Creep) {
    const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
    const aFlag = Game.flags[`2A-${name}-attack`];
    if (!aFlag) return false;

    if (creep.room.name !== aFlag.pos.roomName) {
        creep.doubleMoveTo(aFlag.pos, '#ff0000');
        return true;
    }

    const enemies = aFlag.pos.findInRange(FIND_HOSTILE_CREEPS, 5,{
        filter: (c) => !c.my && !c.isWhiteList()
    });

    if (enemies.length > 0) {
        const targetEnemy = creep.pos.findClosestByPath(enemies);
        if (targetEnemy) {
            creep.doubleToAttack(targetEnemy);
            return true;
        }
    }

    const structures = aFlag.pos.lookFor(LOOK_STRUCTURES);
    if(structures.length > 0) {
        const targetStructure = structures.find((s) => s.structureType == STRUCTURE_RAMPART) || structures[0];
        creep.doubleToAttack(targetStructure);
        return true;
    }
    return true;
}

function AutoFindTarget(creep: Creep) {
    let room = creep.room;

    // 找敌方creep
    const enemies = room.find(FIND_HOSTILE_CREEPS, {
        filter: (c) => !c.my && !c.isWhiteList()
    });
    if (enemies.length > 0) {
        const targetEnemy = creep.pos.findClosestByPath(enemies);
        if (targetEnemy) {
            const result = creep.moveTo(targetEnemy, {
                visualizePathStyle: {stroke: '#ffff00'},
                maxRooms: 1, range: 1
            });
            if (result !== ERR_NO_PATH) {
                creep.memory['targetId'] = targetEnemy.id;
                return true;
            }
        }
    }

    // 建筑
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

function AutoActionAttack(creep: Creep) {
    // 获取缓存的目标
    let target = Game.getObjectById(creep.memory['targetId']) as Structure;

    // 如果目标位于危险区域, 更换目标
    if (target && target.pos.findInRange(FIND_HOSTILE_CREEPS, 6, {
        filter: (c) => !c.isWhiteList() &&
        (c.getActiveBodyparts(ATTACK) > 0 && c.pos.inRangeTo(creep, 4)) ||
        (c.getActiveBodyparts(RANGED_ATTACK) > 0 && c.pos.inRangeTo(creep, 6))
    })) {
        creep.memory['targetId'] = null;
        AutoFindTarget(creep);
        target = Game.getObjectById(creep.memory['targetId']) as Structure;
    }

    // 规避
    if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6, {
        filter: (c) => !c.isWhiteList() &&
        (c.getActiveBodyparts(ATTACK) > 0 && c.pos.inRangeTo(creep, 4)) ||
        (c.getActiveBodyparts(RANGED_ATTACK) > 0 && c.pos.inRangeTo(creep, 6))
    }).length) {
        let result = creep.doubleFlee();
        if (result === OK) return true;
    }

    // 目标存在则行动
    if (target) {
        creep.doubleToAttack(target);
        return true;
    }
}


/** 双人小队 进攻小队 */
const double_attack = {
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
                    'XUH2O', 'UH2O', 'UH'
                ]);
            }
            return
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
    
        // 旗帜控制移动
        FlagActionMove(creep);

        // 移动到目标房间.未到达房间不继续行动
        if (!creep.memory['targetId'] &&
            creep.doubleMoveToRoom(creep.memory.targetRoom, '#ff0000')) return;
        if (creep.room.my || Game.time < (creep.memory.idle||0)) return;

        // 攻击标记的目标
        if (FlagActionAttack(creep)) return;

        // 自动行动
        if (AutoActionAttack(creep)) return;

        // 自动寻找目标
        AutoFindTarget(creep);
    }
}

export default double_attack;