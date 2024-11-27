import { RoleData, RoleLevelData } from '@/constant/CreepConstant'

// 检查主要角色是否需要孵化
function RoleSpawnCheck(room: Room, role: string, currentNum: number, num: number) {
    const lv = room.level;
    switch (role) {
        case 'harvester':
            return currentNum < room.source.length
        case 'upgrader':
            if(global.BotMem('rooms', room.name, 'spup')) return false;
            if(lv == 8 && room.controller.ticksToDowngrade >= 150000) return false;
            return currentNum < num;
        case 'transport':
            return currentNum < num && room.storage;
        case 'manage':
            return currentNum < num && room.storage && room.link.find(l => l.pos.inRangeTo(room.storage, 2));
        case 'carrier':
            if (num === 0) {
                return currentNum < 1 && (room.mineral?.mineralAmount > 0 ||
                    room.container?.find((c) => c.store.getUsedCapacity() > 1000) ||
                    room.find(FIND_DROPPED_RESOURCES).filter(r => r.amount > 1000).length > 0);
            }
            return currentNum < num && room.container.length > 0;
        case 'builder':
            return currentNum < 2 && room.checkMissionInPool('build');
        case 'repair':
            return currentNum < 1 && 
                (room.getMissionNumInPool('repair') > 20 || 
                (room.checkMissionInPool('walls') && room.AllEnergy() > 50000));
        case 'miner':
            return currentNum < 1 && lv >= 6 &&
                    room.extractor &&
                    room.mineral.mineralAmount > 0;
        case 'har-car':
            return currentNum < 1 && lv < 3 && (!room.container || room.container.length < 1);
        case 'speedup-upgrad':
            const spup = global.BotMem('rooms', room.name, 'spup');
            if (!spup) return false;
            if (room.level == 8) {
                global.BotMem('rooms', room.name)['spup'] = 0;
                console.log(`${room.name} 已到达八级，自动关闭冲级。`);
                return false;
            }
            if (room.storage?.store[RESOURCE_ENERGY] < 10000) return false;
            return (currentNum < spup);
        default:
            return false;
    }
}


function UpdateSpawnMission(room: Room) {
    global.SpawnMissionNum[room.name] = room.getSpawnMissionAmount() || {};
    global.CreepNum[room.name] = {};
    Object.values(Game.creeps).forEach((creep: Creep) => {
        if(!creep || (creep.ticksToLive < creep.body.length * 3 && !creep.spawning)) return;
        const role = creep.memory.role;
        const home = creep.memory.home || creep.room.name;
        if(!role || !home || home != room.name) return;
        global.CreepNum[home][role] = (global.CreepNum[home][role] || 0) + 1;
        return;
    })
    const lv = room.level;
    const roomName = room.name;
    for(const role in RoleData) {
        const currentNum =  (global.SpawnMissionNum[roomName][role] || 0) + (global.CreepNum[roomName][role] || 0);
        const num = RoleData[role]['adaption'] ? RoleLevelData[role][lv]['num'] : RoleData[role]['num'];
        if(RoleSpawnCheck(room, role, currentNum, num)) {
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