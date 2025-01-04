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
    switch (role) {
        case 'harvester':
            if(room.memory.defend) return false;
            return currentNum < room.source.length
        case 'upgrader':
            if(room.memory.defend) return false;
            if(spup) return false;
            if(global.CreepNum[room.name]['speedup-upgrade']) return false;
            if (lv == 8 && !mustUpgrade && room.controller.ticksToDowngrade >= 150000) return false;
            return currentNum < num;
        case 'transport':
            if (room.AllEnergy() < 1000) return false;
            if (spup > 4) num += 1
            return currentNum < num && (room.storage || room.terminal);
        case 'manage':
            return currentNum < num && room.storage && room.terminal;
        case 'carrier':
            if (num === 0) {
                return currentNum < 1 && (room.mineral?.mineralAmount > 0 ||
                    room.container?.find((c) => c.store.getUsedCapacity() > 1000) ||
                    room.find(FIND_DROPPED_RESOURCES).filter(r => r.amount > 1000).length > 0);
            }
            return currentNum < num && room.container.length > 0;
        case 'worker':
            if (room.memory.defend) return false;
            if(room.getMissionNumInPool('build') > 10 && currentNum < 2) return true;
            else if (room.checkMissionInPool('build') && currentNum < 1) return true;
            else if (room.getMissionNumInPool('repair') >= 20) return true;
            if (currentNum >= 1 || room[RESOURCE_ENERGY] < 100000) return false;
            if (room.checkMissionInPool('walls')) return true;
            return false;
        case 'miner':
            if(room.memory.defend) return false;
            return currentNum < 1 && lv >= 6 &&
                    room.extractor &&
                    room.mineral.mineralAmount > 0;
        case 'har-car':
            return currentNum < 2 && lv < 3 && (!room.container || room.container.length < 1);
        case 'speedup-upgrade':
            if (!spup) return false;
            if (room.level == 8) {
                Memory['RoomControlData'][room.name].spup = 0;
                console.log(`${room.name} 已到达八级，自动关闭冲级。`);
                return false;
            }
            if (room.AllEnergy() < 10000) return false;
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