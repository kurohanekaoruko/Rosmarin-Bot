import { RoleData, RoleLevelData } from '@/constant/CreepConstant'

const RoleSpawnCheck = {
    'harvester': (room: Room, current: number) => {
        if (room.memory.defend) return false;
        if (room.level >= 2) return current < room.source.length

        if (room.memory['maxSourceHarvestPos']) {
            return current < Math.min(room.memory['maxSourceHarvestPos'], 4);
        }
        if (room.memory['sourcePosCount']) {
            let MaxNum = Object.values(room.memory['sourcePosCount']).reduce((a, b) => a + b);
            room.memory['maxSourceHarvestPos'] = MaxNum;
            return current < Math.min(MaxNum, 4);
        }
        return current < room.source.length;
    },
    'upgrader': (room: Room, current: number) => {
        const num = RoleLevelData['upgrader'][room.level]['num'];
        if (room.memory.defend) return false;
        if (global.CreepNum[room.name]['UP-upgrade']) return false;
        if (room.level == 8 && !Game.flags[`${room.name}/UPGRADE`] &&
            room.controller.ticksToDowngrade >= 150000) return false;
        return current < num;
    },
    'transport': (room: Room, current: number) => {
        const num = RoleLevelData['transport'][room.level]['num'];
        let energy = (room.storage?.store[RESOURCE_ENERGY] || 0) +
                        (room.terminal?.store[RESOURCE_ENERGY] || 0);
        if (energy < 10000) return false;
        return current < num && (room.storage || room.terminal);
    },
    'manager': (room: Room, current: number) => {
        const num = RoleLevelData['manager'][room.level]['num'];
        if (num == 0) return false;
        const center = Memory['RoomControlData'][room.name]?.center;
        const storage = room.storage;
        const terminal = room.terminal;
        const link = room.link.find(l => l.pos.inRangeTo(center.x, center.y, 1));
        return current < num && storage && (terminal || link);
    },
    'carrier': (room: Room, current: number) => {
        const num = RoleLevelData['carrier'][room.level]['num'];
        if (num > 0) return current < num;
        if (current >= 1) return false;
        if (room.mineral?.mineralAmount > 0) return true;
        if (room.container?.some((c) => c.store.getUsedCapacity() > 1000)) return true;
        if (room.find(FIND_DROPPED_RESOURCES).filter(r => r.amount > 1000).length > 0) return true;
        return false;
    },
    'worker': (room: Room, current: number) => {
        if (room.memory.defend) return false;
        if (room.level < 4 && current < 3 && room.checkMissionInPool('build')) return true;
        if (room.level < 6) {
            if (current < 2 && room.checkMissionInPool('build')) return true;
        } else {
            if (current < 1 && room.checkMissionInPool('build')) return true;
            if (current < 2 && room.getMissionNumInPool('build') > 10) return true;
        }
        if (current >= 1 || room[RESOURCE_ENERGY] < 100000) return false;
        if (room.checkMissionInPool('walls')) return true;
        if (room.getMissionNumInPool('repair') >= 20) return true;
        return false;
    },
    'mineral': (room: Room, current: number) => {
        const lv = room.level;
        // 当前等级的最大ext能量容量
        const lvEnergyCapacityAvailable = CONTROLLER_STRUCTURES["spawn"][lv] * 300 +
        CONTROLLER_STRUCTURES['extension'][lv] * EXTENSION_ENERGY_CAPACITY[lv];
        if (room.memory.defend) return false;
        if (room.energyCapacityAvailable < lvEnergyCapacityAvailable) return false;
        return current < 1 && lv >= 6 && room.extractor && room.mineral.mineralAmount > 0;
    },
    'universal': (room: Room, current: number) => {
        const lv = room.level;
        return current < 2 && lv < 3 && (!room.container || room.container.length < 1);
    },
    'UP-upgrade': (room: Room, current: number) => {
        if (room.level == 8) return false;
        // 冲级
        let UPFlag = room.find(FIND_FLAGS).find(f => f.name.startsWith(`${room.name}/UP-UPGRADE/`));
        if (!UPFlag) return false;
        const match = UPFlag.name.match(/UP-UPGRADE\/(\d+)/);
        let num = match ? parseInt(match[1]) : 0;
        if (num < 1) return false;
        if (room[RESOURCE_ENERGY] < 100000) return false;

        const lv = room.level;
        // 当前等级的最大ext能量容量
        const lvEnergyCapacityAvailable = CONTROLLER_STRUCTURES["spawn"][lv] * 300 +
        CONTROLLER_STRUCTURES['extension'][lv] * EXTENSION_ENERGY_CAPACITY[lv];
        if (room.energyCapacityAvailable < lvEnergyCapacityAvailable) return false;
        
        return current < num;
    },
    'UP-repair': (room: Room, current: number) => {
        // 加速刷墙
        const UPFlag = room.find(FIND_FLAGS).find(f => f.name.startsWith(`${room.name}/UP-REPAIR/`));
        if (!UPFlag) return false;
        const match = UPFlag.name.match(/UP-REPAIR\/(\d+)/);
        let num = match ? parseInt(match[1]) : 0;
        if (num < 1) return false;
        if (room.level < 7)  return false;
        if (room[RESOURCE_ENERGY] < 100000) return false;
        return current < num && room.checkMissionInPool('walls');
    }
}


function UpdateSpawnMission(room: Room) {
    global.SpawnMissionNum[room.name] = room.getSpawnMissionAmount() || {};
    global.CreepNum[room.name] = room.getCreepNum() || {};
    const lv = room.level;
    const roomName = room.name;

    for (const role in RoleSpawnCheck) {
        const current = (global.SpawnMissionNum[roomName][role] || 0) +
                        (global.CreepNum[roomName][role] || 0);
        const num = RoleLevelData[role] ?
                    RoleLevelData[role][lv]['num'] :
                    RoleData[role]['num'];
        if (RoleSpawnCheck[role](room, current, num)) {
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