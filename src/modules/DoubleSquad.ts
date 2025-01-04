let ATTACK_NUM = 1
let DISMANTLE_NUM = 1
let CARRY_NUM = 1
let TOUGH_NUM = 1

/**
 * 双人小队进攻模块
 */
export const DoubleSquad = {
    tick: function() {
        if (Game.time % 20 != 0) {return;}
        const flags = Game.flags;
        for (const flagName in flags) {

            // 攻击小队
            const match = flagName.match(/^attack[-_#/ ]([EW]\d+[NS]\d+)[-_#/ ](\d+)(?:[-_#/ ].*)?$/);
            if (match) {
                ATTACK_NUM = parseInt(match[2]);
                doubleAttack_spawn(match, flagName, flags);
            }

            // 拆除小队
            const match2 = flagName.match(/^dismantle[-_#/ ]([EW]\d+[NS]\d+)[-_#/ ](\d+)(?:[-_#/ ].*)?$/);
            if (match2) {
                DISMANTLE_NUM = parseInt(match2[2]);
                doubleDismantle_spawn(match2, flagName, flags);
            }

            // 搬运小队
            const match3 = flagName.match(/^carry[-_#/ ]([EW]\d+[NS]\d+)[-_#/ ](\d+)(?:[-_#/ ].*)?$/);
            if (match3) {
                CARRY_NUM = parseInt(match3[2]);
                doubleCarry_spawn(match3, flagName, flags);
            }

            // TOUGH小队
            const match4 = flagName.match(/^tough[-_#/ ]([EW]\d+[NS]\d+)[-_#/ ](\d+)(?:[-_#/ ].*)?$/);
            if (match4) {
                TOUGH_NUM = parseInt(match4[2]);
                doubleTough_spawn(match4, flagName, flags);
            }
        }
    }
}

function doubleAttack_spawn(match: RegExpMatchArray, flagName: string, flags: any) {
    const sourceName = match[1];
    if(!Game.rooms[sourceName]) return;

    const targetName = flags[flagName].pos.roomName;
    
    const doubleAttack = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-attack' && creep.memory.targetRoom == targetName);
    const doubleHeal = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-heal' && creep.memory.targetRoom == targetName && creep.memory.squad == 'attack');

    const room = Game.rooms[sourceName]
    const queuenum = global.SpawnMissionNum[sourceName];

    if(doubleAttack.length + (queuenum?.['double-attack']||0) < ATTACK_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-attack', {squad: 'attack', targetRoom: targetName} as any)
    }
    if(doubleHeal.length + (queuenum?.['double-heal']||0) < ATTACK_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-heal', {squad: 'attack', targetRoom: targetName} as any)
    }
}

function doubleDismantle_spawn(match: RegExpMatchArray, flagName: string, flags: any) {
    const sourceName = match[1];
    if(!Game.rooms[sourceName]) return;

    const targetName = flags[flagName].pos.roomName;

    const doubleDismantle = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-dismantle' && creep.memory.targetRoom == targetName);
    const doubleHeal = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-heal' && creep.memory.targetRoom == targetName && creep.memory.squad == 'dismantle');

    const room = Game.rooms[sourceName]
    const queuenum = global.SpawnMissionNum[sourceName];

    if(doubleDismantle.length + (queuenum?.['double-dismantle']||0) < DISMANTLE_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-dismantle', {squad: 'dismantle', targetRoom: targetName} as any)
    }
    if(doubleHeal.length + (queuenum?.['double-heal']||0) < DISMANTLE_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-heal', {squad: 'dismantle', targetRoom: targetName} as any)
    }
}

function doubleCarry_spawn(match: RegExpMatchArray, flagName: string, flags: any) {
    const sourceName = match[1];
    if(!Game.rooms[sourceName]) return;

    const targetName = flags[flagName].pos.roomName;

    const doubleCarry = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-carry' && creep.memory.targetRoom == targetName);
    const doubleHeal = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-heal' && creep.memory.targetRoom == targetName && creep.memory.squad == 'carry');

    const room = Game.rooms[sourceName]
    const queuenum = global.SpawnMissionNum[sourceName];

    if(doubleCarry.length + (queuenum?.['double-carry']||0) < CARRY_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-carry', {squad: 'carry', targetRoom: targetName} as any)
    }
    if(doubleHeal.length + (queuenum?.['double-heal']||0) < CARRY_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-heal', {squad: 'carry', targetRoom: targetName} as any)
    }
}

function doubleTough_spawn(match: RegExpMatchArray, flagName: string, flags: any) {
    const sourceName = match[1];
    if(!Game.rooms[sourceName]) return;

    const targetName = flags[flagName].pos.roomName;

    const doubleTough = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-tough' && creep.memory.targetRoom == targetName);
    const doubleHeal = Object.values(Game.creeps).filter((creep) => creep.memory.role == 'double-heal' && creep.memory.targetRoom == targetName && creep.memory.squad == 'tough');

    const room = Game.rooms[sourceName]
    const queuenum = global.SpawnMissionNum?.[sourceName];

    if(doubleTough.length + (queuenum['double-tough']||0) < TOUGH_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-tough', {squad: 'tough', targetRoom: targetName} as any)
    }
    if(doubleHeal.length + (queuenum['double-heal']||0) < TOUGH_NUM) {
        room.SpawnMissionAdd('', [], -1, 'double-heal', {squad: 'tough', targetRoom: targetName} as any)
    }
}