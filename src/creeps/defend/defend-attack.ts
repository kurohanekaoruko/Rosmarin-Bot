const autoDefend = function (creep: Creep) {
    const roomName = creep.room.name;
    // 查找当前房间的所有满足条件的 rampart
    const ramparts = creep.room.rampart.filter((rampart) => {
        // 存在不可通过的建筑,则跳过
        const lookStructure = creep.room.lookForAt(LOOK_STRUCTURES, rampart.pos);
        if(lookStructure.length && lookStructure.some(structure => 
            structure.structureType !== STRUCTURE_RAMPART &&
            structure.structureType !== STRUCTURE_ROAD &&
            structure.structureType !== STRUCTURE_CONTAINER)) {
            return false;
        }
        return rampart.hits >= 1e6;
    });
    // 如果没有 rampart，则直接返回或执行其他逻辑
    if (ramparts.length === 0) {
        // 可以添加日志或其他处理逻辑
        return;
    }
    // 查找当前房间的所有敌对 creep
    const hostileCreeps = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    // 如果没有敌对 creep，也可以考虑是否继续执行或返回
    if (hostileCreeps.length === 0) {
        // 可以添加日志或其他处理逻辑
        return;
    }
    
    // 初始化最近的 rampart 和其距离
    let closestRampart = null;
    let minDistance = Infinity;
    
    // 遍历每个 rampart，找到距离敌人最近的 rampart
    for (const rampart of ramparts) {
        let minEnemyDistance = Infinity;
        const distance = rampart.pos.getRangeTo(hostileCreeps[0].pos);
        if (distance < minEnemyDistance) {
            minEnemyDistance = distance;
        }
        const totalDistance = minEnemyDistance;
        if (totalDistance < minDistance) {
            minDistance = totalDistance;
            closestRampart = rampart;
        }
    }
    
    // 如果有找到最近的 rampart，则前往该位置
    if (closestRampart) {
        creep.moveTo(closestRampart.pos, { visualizePathStyle: { stroke: '#ff0000' } });
    } else {
    }
    const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        // creep.attack(target)
            // 检查 creep 是否携带 ATTACK 部件
        const hasAttackPart = creep.body.some(part => part.type === ATTACK);
        // 检查 creep 是否携带 RANGED_ATTACK 部件
        const hasRangedAttackPart = creep.body.some(part => part.type === RANGED_ATTACK);
    
        // 根据携带的部件类型进行攻击
        if (hasAttackPart && !hasRangedAttackPart || // 如果有 ATTACK 且没有 RANGED_ATTACK
            (hasAttackPart && hasRangedAttackPart && creep.pos.getRangeTo(target) <= 3)) { // 或者两者都有但距离足够近以进行近战
            const result = creep.attack(target);
            if(result == OK) creep.room.CallTowerAttack(target);
        } else if (hasRangedAttackPart) { // 如果有 RANGED_ATTACK
            const result = creep.rangedAttack(target);
            if(result == OK) creep.room.CallTowerAttack(target);
        }
    }
}

const flagDefend = function (creep: Creep, flag: Flag) {
    if(!creep.pos.isEqual(flag.pos)) {
        creep.moveTo(flag.pos, { visualizePathStyle: { stroke: '#ff0000' } });
    }
    const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(target) {
        // creep.attack(target)
            // 检查 creep 是否携带 ATTACK 部件
        const hasAttackPart = creep.body.some(part => part.type === ATTACK);
        // 检查 creep 是否携带 RANGED_ATTACK 部件
        const hasRangedAttackPart = creep.body.some(part => part.type === RANGED_ATTACK);
        // 根据携带的部件类型进行攻击
        if (hasAttackPart && !hasRangedAttackPart || // 如果有 ATTACK 且没有 RANGED_ATTACK
            (hasAttackPart && hasRangedAttackPart && creep.pos.getRangeTo(target) <= 3)) { // 或者两者都有但距离足够近以进行近战
            const result = creep.attack(target);
            if(result == OK) creep.room.CallTowerAttack(target);
        } else if (hasRangedAttackPart) { // 如果有 RANGED_ATTACK
            const result = creep.rangedAttack(target);
            if(result == OK) creep.room.CallTowerAttack(target);
        }
    }
    
    if(flag && (creep.ticksToLive < 10 || creep.hits < 200)){
        flag.remove();
    }
}


const defend_attack = {
    run: function (creep: Creep) {
        if (!creep.memory.boosted) {
            const boosts = creep.memory['mustBoost'] ? ['XUH2O', 'XZHO2'] : 
                        ['XUH2O', 'UH2O', 'UH', 'XZHO2', 'ZHO2', 'ZO'];
            creep.memory.boosted = creep.goBoost(boosts, creep.memory['mustBoost'], creep.memory['mustBoost']);
            return
        }
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const flag = Game.flags[name+'-defend'];
        if (!flag) autoDefend(creep);
        else flagDefend(creep, flag);
    }
}

export default defend_attack