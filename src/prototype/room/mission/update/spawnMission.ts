import { RoleData, RoleLevelData } from '@/constant/CreepConstant'

// 检查主要角色是否需要孵化
function RoleSpawnCheck(room: Room, role: string, currentNum: number, num: number) {
    const lv = room.level;
    // 冲级设置
    const spup = Memory['RoomControlData'][room.name].spup;
    // 加速刷墙
    const spre = Memory['RoomControlData'][room.name].spre;
    // 常驻升级
    const mustUpgrade = Memory['RoomControlData'][room.name].mustUpgrade;
    // 当前等级的最大ext能量容量
    const lvEnergyCapacityAvailable = CONTROLLER_STRUCTURES["spawn"][lv] * 300 +
            CONTROLLER_STRUCTURES['extension'][lv] * EXTENSION_ENERGY_CAPACITY[lv];
    switch (role) {
        case 'harvester':
            if (room.memory.defend) return false;
            if (room.level < 3) {
                if (room.memory['maxSourceHarvestPos']) {
                    return currentNum < Math.min(room.memory['maxSourceHarvestPos'], 4);
                }
                if (room.memory['sourcePosCount']) {
                    let MaxNum = Object.values(room.memory['sourcePosCount']).reduce((a, b) => a + b);
                    room.memory['maxSourceHarvestPos'] = MaxNum;
                    return currentNum < Math.min(MaxNum, 4);
                }
            }
            return currentNum < room.source.length
        case 'upgrader':
            if (room.memory.defend) return false;
            if (global.CreepNum[room.name]['speedup-upgrade']) return false;
            if (lv == 8 && !mustUpgrade && room.controller.ticksToDowngrade >= 150000) return false;
            return currentNum < num;
        case 'transport':
            let energy = (room.storage?.store[RESOURCE_ENERGY] || 0) +
                         (room.terminal?.store[RESOURCE_ENERGY] || 0);
            if (energy < 10000) return false;
            return currentNum < num && (room.storage || room.terminal);
        case 'manager':
            const center = Memory['RoomControlData'][room.name]?.center;
            const storage = room.storage;
            const terminal = room.terminal;
            const link = room.link.find(l => l.pos.inRangeTo(center.x, center.y, 1));
            return currentNum < num && storage && (terminal || link);
        case 'carrier':
            if (num === 0) {
                return currentNum < 1 && (room.mineral?.mineralAmount > 0 ||
                    room.container?.find((c) => c.store.getUsedCapacity() > 1000) ||
                    room.find(FIND_DROPPED_RESOURCES).filter(r => r.amount > 1000).length > 0);
            }
            return currentNum < num;
        case 'worker':
            if (room.memory.defend) return false;
            if (room.level <= 4 && currentNum < 3 && room.checkMissionInPool('build')) return true;
            if (room.level <= 6) {
                if (currentNum < 2 && room.checkMissionInPool('build')) return true;
            } else {
                if (currentNum < 1 && room.checkMissionInPool('build')) return true;
                if (currentNum < 2 && room.getMissionNumInPool('build') > 10) return true;
            }
            if (currentNum >= 1 || room[RESOURCE_ENERGY] < 100000) return false;
            if (room.checkMissionInPool('walls')) return true;
            if (room.getMissionNumInPool('repair') >= 20) return true;
            return false;
        case 'mineral':
            if (room.memory.defend) return false;
            if (room.energyCapacityAvailable < lvEnergyCapacityAvailable) return false;
            return currentNum < 1 && lv >= 6 &&
                    room.extractor &&
                    room.mineral.mineralAmount > 0;
        case 'universal':
            return currentNum < 2 && lv < 3 && (!room.container || room.container.length < 1);
        case 'speedup-upgrade':
            if (!spup) return false;
            if (room.level == 8) {
                Memory['RoomControlData'][room.name].spup = 0;
                console.log(`${room.name} 已到达八级，自动关闭冲级。`);
                return false;
            }
            if (room.energyCapacityAvailable < lvEnergyCapacityAvailable) return false;
            return (currentNum < spup);
        case 'speedup-repair':
            if (!spre) return false;
            if (room.level < 7)  return false;
            if (room.storage?.store[RESOURCE_ENERGY] < 100000) return false;
            return currentNum < spre && room.checkMissionInPool('walls');
        default:
            return false;
    }
}


function UpdateSpawnMission(room: Room) {
    global.SpawnMissionNum[room.name] = room.getSpawnMissionAmount() || {};
    global.CreepNum[room.name] = room.getCreepNum() || {};
    const lv = room.level;
    const roomName = room.name;
    for (const role in RoleData) {
        const currentNum =  (global.SpawnMissionNum[roomName][role] || 0) + (global.CreepNum[roomName][role] || 0);
        const num = RoleLevelData[role] ?
                    RoleLevelData[role][lv]['num'] :
                    RoleData[role]['num'];
        if (RoleSpawnCheck(room, role, currentNum, num)) {
            room.SpawnMissionAdd(
                RoleData[role].code,
                [],
                RoleData[role]['level'],
                role,
                { home: roomName } as CreepMemory
            );
        }
    }

    return true;
}


export {UpdateSpawnMission}