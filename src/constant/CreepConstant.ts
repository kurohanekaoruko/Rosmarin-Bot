import * as Actions from '@/actions';


interface RoleConfig {
    [key: string]: {
        bodypart: any[],   // body配置
        must?: boolean,      // 是否无论战争还是和平都得孵化
        level?: number,      // 孵化优先级, 越小越优先
        code?: string,       // 短代号, 用于Creep名称
        work?: {
            prepare?: (creep: Creep) => boolean,
            source: (creep: Creep) => boolean,
            target: (creep: Creep) => boolean,
        },  // 执行函数, 在两种工作状态之间切换
        mission?: {
            run: (creep: Creep) => void
        },  // 执行函数，从任务池获取任务进行对应工作
        action?: {
            run: (creep: Creep) => void,
            [key: string]: (creep: Creep) => void
        },  // 执行函数，自由定义的行动逻辑

    }
}


export const RoleData: RoleConfig = {
    /* 基本房间运营 */
    'harvester': {
        bodypart: [[WORK, 2], [MOVE, 2]],
        level: 3, code: 'H', action: Actions.harvester
    },  // 采集
    'carrier': {
        bodypart: [[CARRY, 3], [MOVE, 3]],
        level: 4, code: 'C', work: Actions.carrier
    },  // 矿点搬运
    'transport': {
        bodypart: [[CARRY, 4], [MOVE, 2]],
        level: 2, code: 'T', mission: Actions.transport
    }, // 资源运输填充
    'manager': {
        bodypart: [[CARRY, 4], [MOVE, 2]],
        level: 1, code: 'M', mission: Actions.manager
    }, // 中央搬运
    'upgrader': {
        bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]],
        level: 10, code: 'U', work: Actions.upgrader
    }, // 升级
    'worker': {
        bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]],
        level: 10, code: 'W', work: Actions.worker
    }, // 建造、维修、刷墙
    'mineral': {
        bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]],
        level: 6, code: 'MR', work: Actions.mineral
    }, // 矿工
    // 采集搬运通用机，处理停摆与新房起步
    'universal': {
        bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]],
        level: 0, code: 'UNIV', work: Actions.universal
    },

    /* 特殊用途 */
    'scout': {
        bodypart: [[MOVE, 1]],
        level: 11, code: 'S', work: Actions.scout
    },
    'logistic': {
        bodypart: [[CARRY, 3], [MOVE, 3]],
        level: 10, code: 'L', work: Actions.logistic
    }, // 长途运输
    'dismantle': {
        bodypart: [[WORK, 40], [MOVE, 10]],
        level: 10, code: 'dis', action: Actions.dismantle
    },  // boost拆墙
    'cleaner': {
        bodypart: [[WORK, 25], [MOVE, 25]],
        level: 11, code: 'CLEAN', action: Actions.cleaner
    },  // 清理者
    'big-carry': {
        bodypart: [[CARRY, 40], [MOVE, 10]],
        level: 10, code: 'BC', work: Actions.bigCarry
    },  // 大体型搬运
    'speedup-upgrade': {
        bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]],
        level: 13, code: 'SU', work: Actions.SpeedUpgrader
    }, // 加速升级
    'speedup-repair': {
        bodypart: [[WORK, 30], [CARRY, 5], [MOVE, 15]],
        level: 13, code: 'SR', work: Actions.SpeedRepair
    }, // 加速刷墙

    /* 占领房间 */
    'claimer': {
        bodypart: [[MOVE, 5], [CLAIM, 1]],
        level: 10, code: 'CL', action: Actions.claimer
    },
    'lclaimer': {
        bodypart: [[MOVE, 10], [HEAL, 9], [CLAIM, 1]],
        level: 10, code: 'LCL', action: Actions.claimer
    },
    'aclaimer': {
        bodypart: [[MOVE, 19], [CLAIM, 19]],
        level: 10, code: 'ACL', action: Actions.aclaimer
    },
    'healAclaimer': {
        bodypart: [[MOVE, 25], [CLAIM, 11], [HEAL, 10], [TOUGH, 4]],
        level: 10, code: 'HAC', action: Actions.aclaimer
    },

    /* 援建 */
    'aid-build': {
        bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 25]],
        level: 10, code: 'AIDB', action: Actions.aid_build
    },
    'aid-carry': {
        bodypart: [[CARRY, 25], [MOVE, 25]],
        level: 10, code: 'AIDC', work: Actions.aid_carry
    },
    'aid-upgrade': {
        bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 25]],
        level: 10, code: 'AIDU', action: Actions.aid_upgrade
    },


    /* 战斗相关 */
    /* 一体机 */
    'one-tough': {
        bodypart: [[MOVE, 20], [HEAL, 14], [TOUGH, 6]],
        level: 10, code: '1T', action: Actions.one_tough
    },
    'one-ranged': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 10], [HEAL, 20], [TOUGH, 10]],
        level: 10, code: '1R', action: Actions.one_ranged
    },

    
    /** 6tower */
    'aio': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 5], [HEAL, 23], [TOUGH, 12]],
        level: 10, code: 'AIO', action: Actions.aio
    },
    /** 3tower */
    'aioT3': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 22], [HEAL, 12], [TOUGH, 6]],
        level: 10, code: 'AIO', action: Actions.aio
    },
    /** 2tower */
    'aioT2': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 26], [HEAL, 10], [TOUGH, 4]],
        level: 10, code: 'AIO', action: Actions.aio
    },
    /** 0tower */
    'aioT0': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 32], [HEAL, 5], [TOUGH, 3]],
        level: 10, code: 'AIO', action: Actions.aio
    },

    /* 二人队 */
    'double-attack': {
        bodypart: [[MOVE,10],[ATTACK,28],[TOUGH,12]],
        level: 10, code: '2A', action: Actions.double_attack
    },
    'double-dismantle': {
        bodypart: [[MOVE,10],[WORK,28],[TOUGH,12]],
        level: 10, code: '2D', action: Actions.double_dismantle
    },
    'double-heal': {
        bodypart: [[MOVE,10],[HEAL,28],[TOUGH,11],[RANGED_ATTACK,1]],
        level: 10, code: '2H', action: Actions.double_heal
    },

    /* 四人队 */
    'squad-attack': {
        bodypart: [[MOVE, 10], [ATTACK, 25],[TOUGH, 15]],
        level: 10, code: '4A', action: Actions.squad_attack
    },
    'squad-dismantle': {
        bodypart: [[MOVE, 10], [WORK, 28],[TOUGH, 12]],
        level: 10, code: '4D', action: Actions.squad_dismantle
    },
    'squad-heal': {
        bodypart: [[MOVE,10],[HEAL,24],[TOUGH,15],[RANGED_ATTACK,1]],
        level: 10, code: '4H', action: Actions.squad_heal
    },
    'squad-ranged': {
        bodypart: [[MOVE,10],[HEAL,22],[RANGED_ATTACK,4],[TOUGH,14]],
        level: 10, code: '4R', action: Actions.squad_ranged
    },

    /* 主动防御 */
    'defend-attack': {
        bodypart: [[MOVE, 10], [ATTACK, 40]], level: 8,
        code: "DFA", must: true, action: Actions.defend_attack
    },
    'defend-ranged': {
        bodypart: [[MOVE, 10], [RANGED_ATTACK, 40]],
        level: 8, code: "DFR", must: true, action: Actions.defend_ranged
    },
    'defend-2Attack': {
        bodypart: [[MOVE, 10], [ATTACK, 25], [TOUGH, 15]],
        level: 7, code: "D2A", must: true, action: Actions.double_defender
    },
    'defend-2Heal': {
        bodypart: [[MOVE, 10], [ATTACK, 30], [TOUGH, 10]],
        level: 7, code: "D2H", must: true, action: Actions.double_heal
    },

    /* 外矿相关 */
    /* 外矿 */
    'out-scout': { bodypart: [[MOVE,1]], level: 11, code: 'OS', work: Actions.scout },
    'out-claim': { bodypart: [], level: 11, code: 'OCL', work: Actions.outClaim },
    'out-harvest': { bodypart: [], level: 12, code: 'OH', work: Actions.outHarvest },
    'out-car': { bodypart: [],level: 13, code: 'OC', work: Actions.outCarry },
    'out-carry': { bodypart: [], level: 13, code: 'OC', work: Actions.outCarry },
    'out-build': { bodypart: [], level: 12, code: 'OB', work: Actions.outBuild },
    'out-defend': { bodypart: [], level: 8, code: 'OD', action: Actions.outDefend },
    'out-invader': { bodypart: [], level: 10, code: 'OI', action: Actions.outInvader },
    'out-attack': {
        bodypart: [[MOVE,25],[ATTACK,19],[HEAL,6]],
        level: 9, code: 'OA', action: Actions.outAttack
    },
    'out-ranged': {
        bodypart: [[MOVE,25],[RANGED_ATTACK,15],[HEAL,10]],
        level: 9, code: 'OR', action: Actions.outRanged
    },
    'out-miner': {
        bodypart: [[WORK,30],[CARRY,5],[MOVE,15]],
        level: 12, code: 'OM', work: Actions.outMineral
    },

    /* 沉积物 */
    'deposit-harvest': {
        bodypart: [[WORK,20],[CARRY,6],[MOVE,22],[ATTACK,2]],
        level: 11, code: 'DH', work: Actions.deposit_harvest
    },
    'deposit-transfer': {
        bodypart: [[CARRY,25],[MOVE,25]],
        level: 11, code: 'DT', work: Actions.deposit_transfer
    },
    'deposit-attack': {
        bodypart: [[MOVE,25],[ATTACK,15],[HEAL,10]],
        level: 8, code: "DPA", action: Actions.deposit_attack
    },
    'deposit-ranged': {
        bodypart: [[MOVE,25],[RANGED_ATTACK,17],[HEAL,8]],
        level: 8, code: "DPR", action: Actions.deposit_ranged
    },

    /* Power */
    'power-attack': {
        bodypart: [[MOVE,25],[ATTACK,20],[TOUGH,5]],
        level: 10, code: 'PA', action: Actions.power_attack
    },
    'power-heal': {
        bodypart: [[MOVE,25],[HEAL,25]],
        level: 10, code: 'PH', action: Actions.power_heal
    },
    'power-carry': {
        bodypart: [[MOVE,25],[CARRY,25]],
        level: 9, code: 'PC', work: Actions.power_carry
    },
    'power-ranged': {
        bodypart: [[MOVE,25],[RANGED_ATTACK,17],[HEAL,8]],
        level: 11, code: 'PR', action: Actions.power_ranged
    },

}

// 根据等级的动态部件
export const RoleLevelData = {
    'harvester': {
        1: { bodypart: [[WORK, 2], [MOVE, 2]], num: 2 },
        2: { bodypart: [[WORK, 4], [CARRY, 1], [MOVE, 1]], num: 2 },
        3: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 2]], num: 2 },
        4: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 2 },
        5: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 2 },
        6: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 2 },
        7: { bodypart: [[WORK, 10], [CARRY, 2], [MOVE, 5]], num: 2 },
        8: { bodypart: [[WORK, 20], [CARRY, 4], [MOVE, 10]], num: 2,
             upbodypart: [[WORK, 25], [CARRY, 5], [MOVE, 13]] },
    },
    'carrier': {
        1: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 3 },
        2: { bodypart: [[CARRY, 3], [MOVE, 3]], num: 2 },
        3: { bodypart: [[CARRY, 7], [MOVE, 7]], num: 2 },
        4: { bodypart: [[CARRY, 10], [MOVE, 10]], num: 2 },
        5: { bodypart: [[CARRY, 12], [MOVE, 12]], num: 2 },
        6: { bodypart: [[CARRY, 16], [MOVE, 16]], num: 1 },
        7: { bodypart: [[CARRY, 20], [MOVE, 20]], num: 0 },
        8: { bodypart: [[CARRY, 20], [MOVE, 20]], num: 0 },
    },
    'transport': {
        1: { bodypart: [[CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[CARRY, 1], [MOVE, 1]], num: 0 },
        3: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 0 },
        4: { bodypart: [[CARRY, 5], [MOVE, 5]], num: 1 },
        5: { bodypart: [[CARRY, 12], [MOVE, 6]], num: 1 },
        6: { bodypart: [[CARRY, 16], [MOVE, 8]], num: 1 },
        7: { bodypart: [[CARRY, 24], [MOVE, 12]], num: 1 },
        8: { bodypart: [[CARRY, 32], [MOVE, 16]], num: 1 },
    },
    'manager': {
        1: { bodypart: [[CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[CARRY, 1], [MOVE, 1]], num: 0 },
        3: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 0 },
        4: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 0 },
        5: { bodypart: [[CARRY, 10], [MOVE, 5]], num: 1 },
        6: { bodypart: [[CARRY, 20], [MOVE, 5]], num: 1 },
        7: { bodypart: [[CARRY, 25], [MOVE, 5]], num: 1 },
        8: { bodypart: [[CARRY, 40], [MOVE, 5]], num: 1 },
    },
    'upgrader': {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 3 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 3 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 3 },
        4: { bodypart: [[WORK, 5], [CARRY, 3], [MOVE, 8]], num: 2 },
        5: { bodypart: [[WORK, 8], [CARRY, 4], [MOVE, 8]], num: 2 },
        6: { bodypart: [[WORK, 16], [CARRY, 4], [MOVE, 8]], num: 1 },
        7: { bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 10]], num: 1 },
        8: { bodypart: [[WORK, 15], [CARRY, 5], [MOVE, 10]], num: 1 },
    },
    'worker': {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 0 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 0 },
        4: { bodypart: [[WORK, 5], [CARRY, 4], [MOVE, 9]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 6], [MOVE, 12]], num: 0 },
        6: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 10]], num: 0 },
        7: { bodypart: [[WORK, 10], [CARRY, 20], [MOVE, 15]], num: 0 },
        8: { bodypart: [[WORK, 15], [CARRY, 18], [MOVE, 17]], num: 0 },
    },
    'mineral': {
        1: { bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[WORK, 3], [CARRY, 1], [MOVE, 1]], num: 0 },
        3: { bodypart: [[WORK, 5], [CARRY, 1], [MOVE, 3]], num: 0 },
        4: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 3]], num: 0 },
        5: { bodypart: [[WORK, 7], [CARRY, 2], [MOVE, 4]], num: 0 },
        6: { bodypart: [[WORK, 10], [CARRY, 2], [MOVE, 3]], num: 0 },
        7: { bodypart: [[WORK, 15], [CARRY, 2], [MOVE, 5]], num: 0 },
        8: { bodypart: [[WORK, 30], [CARRY, 2], [MOVE, 8]], num: 0 },
    },
    'logistic': {
        1: { bodypart: [[CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 0 },
        3: { bodypart: [[CARRY, 3], [MOVE, 3]], num: 0 },
        4: { bodypart: [[CARRY, 5], [MOVE, 5]], num: 0 },
        5: { bodypart: [[CARRY, 10], [MOVE, 10]], num: 0 },
        6: { bodypart: [[CARRY, 15], [MOVE, 15]], num: 0 },
        7: { bodypart: [[CARRY, 20], [MOVE, 20]], num: 0 },
        8: { bodypart: [[CARRY, 25], [MOVE, 25]], num: 0 },
    },
    "claimer": {
        1: { bodypart: [], num: 0 },
        2: { bodypart: [], num: 0 },
        3: { bodypart: [], num: 0 },
        4: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        5: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        6: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        7: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        8: { bodypart: [[MOVE, 5], [CLAIM, 1]], num: 0 },
    },
    "out-claim": {
        1: { bodypart: [], num: 0 },
        2: { bodypart: [], num: 0 },
        3: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        4: { bodypart: [[MOVE, 1], [CLAIM, 1]], num: 0 },
        5: { bodypart: [[MOVE, 2], [CLAIM, 2]], num: 0 },
        6: { bodypart: [[MOVE, 2], [CLAIM, 2]], num: 0 },
        7: { bodypart: [[MOVE, 3], [CLAIM, 3]], num: 0 },
        8: { bodypart: [[MOVE, 10], [CLAIM, 10]], num: 0 },
    },
    "out-harvest": {
        1: { bodypart: [[WORK, 2], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 4], [MOVE, 2]], num: 0 },
        3: { bodypart: [[WORK, 5], [CARRY, 1], [MOVE, 3]], num: 0 },
        4: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 3]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 3]], num: 0 },
        6: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 3]], num: 0 },
        7: { bodypart: [[WORK, 8], [CARRY, 2], [MOVE, 4]], num: 0 },
        8: { bodypart: [[WORK, 10], [CARRY, 2], [MOVE, 5]], num: 0 },
    },
    "out-build": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 1 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 1 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 1 },
        4: { bodypart: [[WORK, 4], [CARRY, 4], [MOVE, 8]], num: 1 },
        5: { bodypart: [[WORK, 4], [CARRY, 10], [MOVE, 7]], num: 1 },
        6: { bodypart: [[WORK, 5], [CARRY, 15], [MOVE, 20]], num: 1 },
        7: { bodypart: [[WORK, 10], [CARRY, 20], [MOVE, 15]], num: 1 },
        8: { bodypart: [[WORK, 15], [CARRY, 15], [MOVE, 15]], num: 1 },
    },
    "out-car": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 1], [CARRY, 5], [MOVE, 3]], num: 0 },
        3: { bodypart: [[WORK, 1], [CARRY, 7], [MOVE, 4]], num: 0 },
        4: { bodypart: [[WORK, 1], [CARRY, 11], [MOVE, 6]], num: 0 },
        5: { bodypart: [[WORK, 1], [CARRY, 14], [MOVE, 8]], num: 0 },
        6: { bodypart: [[WORK, 1], [CARRY, 15], [MOVE, 8]], num: 0 },
        7: { bodypart: [[WORK, 2], [CARRY, 24], [MOVE, 13]], num: 0 },
        8: { bodypart: [[WORK, 2], [CARRY, 30], [MOVE, 16]], num: 0 },
    },
    "out-carry": {
        1: { bodypart: [[CARRY, 3], [MOVE, 3]], num: 0 },
        2: { bodypart: [[CARRY, 6], [MOVE, 3]], num: 0 },
        3: { bodypart: [[CARRY, 8], [MOVE, 4]], num: 0 },
        4: { bodypart: [[CARRY, 12], [MOVE, 6]], num: 0 },
        5: { bodypart: [[CARRY, 16], [MOVE, 8]], num: 0 },
        6: { bodypart: [[CARRY, 16], [MOVE, 8]], num: 0 },
        7: { bodypart: [[CARRY, 26], [MOVE, 13]], num: 0 },
        8: { bodypart: [[CARRY, 32], [MOVE, 16]], num: 0 },
    },
    "out-defend": {
        1: { bodypart: [[MOVE, 1], [HEAL, 1]], num: 0 },
        2: { bodypart: [[MOVE, 2], [RANGED_ATTACK, 1], [HEAL, 1]], num: 0 },
        3: { bodypart: [[MOVE, 2], [RANGED_ATTACK, 1], [HEAL, 1]], num: 0 },
        4: { bodypart: [[MOVE, 4], [RANGED_ATTACK, 2], [HEAL, 2]], num: 0 },
        5: { bodypart: [[MOVE, 6], [RANGED_ATTACK, 3], [HEAL, 3]], num: 0 },
        6: { bodypart: [[MOVE, 8], [RANGED_ATTACK, 4], [HEAL, 4]], num: 0 },
        7: { bodypart: [[MOVE, 16], [RANGED_ATTACK, 8], [HEAL, 8]], num: 0 },
        8: { bodypart: [[MOVE, 25], [ATTACK, 5], [RANGED_ATTACK, 10], [HEAL, 10]], num: 0 },
    },
    "out-invader": {
        1: { bodypart: [[MOVE, 1], [ATTACK, 1]], num: 0 },
        2: { bodypart: [[MOVE, 2], [ATTACK, 2]], num: 0 },
        3: { bodypart: [[MOVE, 3], [ATTACK, 3]], num: 0 },
        4: { bodypart: [[MOVE, 4], [ATTACK, 4]], num: 0 },
        5: { bodypart: [[MOVE, 6], [ATTACK, 6]], num: 0 },
        6: { bodypart: [[MOVE, 8], [ATTACK, 8]], num: 0 },
        7: { bodypart: [[MOVE, 15], [ATTACK, 15]], num: 0 },
        8: { bodypart: [[MOVE, 15], [ATTACK, 15]], num: 0 },
    },
    "speedup-upgrade": {
        1: { bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[WORK, 3], [CARRY, 2], [MOVE, 2]], num: 0 },
        3: { bodypart: [[WORK, 4], [CARRY, 2], [MOVE, 6]], num: 0 },
        4: { bodypart: [[WORK, 8], [CARRY, 2], [MOVE, 5]], num: 0 },
        5: { bodypart: [[WORK, 10], [CARRY, 5], [MOVE, 5]], num: 0 },
        6: { bodypart: [[WORK, 20], [CARRY, 1], [MOVE, 5]], num: 0 },
        7: { bodypart: [[WORK, 39], [CARRY, 1], [MOVE, 10]], num: 0 },
        8: { bodypart: [[WORK, 32], [CARRY, 2], [MOVE, 16]], num: 0 }
    },
    "defend-attack": {
        1: { bodypart: [[MOVE, 2], [ATTACK, 2]], num: 0 },
        2: { bodypart: [[MOVE, 4], [ATTACK, 4]], num: 0 },
        3: { bodypart: [[MOVE, 6], [ATTACK, 6]], num: 0 },
        4: { bodypart: [[MOVE, 10], [ATTACK, 10]], num: 0 },
        5: { bodypart: [[MOVE, 12], [ATTACK, 12]], num: 0 },
        6: { bodypart: [[MOVE, 15], [ATTACK, 15]], num: 0 },
        7: { bodypart: [[MOVE, 10], [ATTACK, 40]], num: 0 },
        8: { bodypart: [[MOVE, 10], [ATTACK, 40]], num: 0 },
    },
    "aid-build": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 0 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 0 },
        4: { bodypart: [[WORK, 5], [CARRY, 4], [MOVE, 9]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 6], [MOVE, 12]], num: 0 },
        6: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 10]], num: 0 },
        7: { bodypart: [[WORK, 15], [CARRY, 10], [MOVE, 15]], num: 0 },
        8: { bodypart: [[WORK, 20], [CARRY, 10], [MOVE, 20]], num: 0 },
    },
    "aid-upgrade": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 2]], num: 0 },
        3: { bodypart: [[WORK, 4], [CARRY, 3], [MOVE, 4]], num: 0 },
        4: { bodypart: [[WORK, 6], [CARRY, 4], [MOVE, 6]], num: 0 },
        5: { bodypart: [[WORK, 10], [CARRY, 5], [MOVE, 10]], num: 0 },
        6: { bodypart: [[WORK, 12], [CARRY, 5], [MOVE, 12]], num: 0 },
        7: { bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 20]], num: 0 },
        8: { bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 25]], num: 0 },
    }
}

// 配置选项
export const RoleBodys = {

}