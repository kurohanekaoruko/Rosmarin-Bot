import * as RoleAction from '@/prototype/creep/roleAction';


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
        boostmap?: {
            [key: string]: string
        },  // 是否必须boost, 以及boost配置
    }
}


export const RoleData: RoleConfig = {
    /* 基本房间运营 */
    'harvester': {
        bodypart: [[WORK, 2], [MOVE, 2]],
        level: 3, code: 'H', action: RoleAction.harvester
    },  // 采集
    'carrier': {
        bodypart: [[CARRY, 3], [MOVE, 3]],
        level: 4, code: 'C', work: RoleAction.carrier
    },  // 通用搬运
    'transport': {
        bodypart: [[CARRY, 4], [MOVE, 2]],
        level: 2, code: 'T', mission: RoleAction.transport
    }, // 资源搬运
    'manager': {
        bodypart: [[CARRY, 4], [MOVE, 2]],
        level: 1, code: 'M', mission: RoleAction.manager
    }, // 中央搬运
    'upgrader': {
        bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]],
        level: 10, code: 'U', work: RoleAction.upgrader
    }, // 升级
    'worker': {
        bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]],
        level: 10, code: 'W', work: RoleAction.worker
    }, // 建造、维修、刷墙
    'mineral': {
        bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]],
        level: 6, code: 'MR', work: RoleAction.mineral
    }, // 矿工
    // 采集搬运通用机，处理停摆与新房起步
    'universal': {
        bodypart: [[WORK, 1], [CARRY, 2], [MOVE, 2]],
        level: 0, code: 'UNIV', work: RoleAction.universal
    },

    /* 特殊用途 */
    'scout': {
        bodypart: [[MOVE, 1]],
        level: 11, code: 'S', work: RoleAction.scout
    },
    'logistic': {
        bodypart: [[CARRY, 3], [MOVE, 3]],
        level: 10, code: 'L', work: RoleAction.logistic
    }, // 长途运输
    'cleaner': {
        bodypart: [[WORK, 25], [MOVE, 25]],
        level: 11, code: 'CLE', action: RoleAction.cleaner
    },  // 清理者
    'dismantle': {
        bodypart: [[WORK, 40], [MOVE, 10]],
        boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2'},
        level: 11, code: 'DIS', action: RoleAction.dismantle
    },  // 拆除者
    'big-carry': {
        bodypart: [[CARRY, 40], [MOVE, 10]],
        level: 10, code: 'BC', work: RoleAction.bigCarry
    },  // 大体型搬运
    'UP-upgrade': {
        bodypart: [[WORK, 2], [CARRY, 1], [MOVE, 1]],
        level: 11, code: 'UUP', work: RoleAction.UP_Upgrade
    }, // 加速升级
    'UP-repair': {
        bodypart: [[WORK, 30], [CARRY, 5], [MOVE, 15]],
        level: 11, code: 'URE', work: RoleAction.UP_Repair
    }, // 加速维修


    /* 占领房间 */
    'claimer': {
        bodypart: [[MOVE, 5], [CLAIM, 1]],
        level: 10, code: 'CL', action: RoleAction.claimer
    },
    'lclaimer': {
        bodypart: [[MOVE, 10], [HEAL, 9], [CLAIM, 1]],
        level: 10, code: 'LCL', action: RoleAction.claimer
    },
    'aclaimer': {
        bodypart: [[MOVE, 19], [CLAIM, 19]],
        level: 10, code: 'ACL', action: RoleAction.aclaimer
    },

    /* 援建 */
    'aid-build': {
        bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 25]],
        level: 10, code: 'AIDB', action: RoleAction.aid_build
    },
    'aid-carry': {
        bodypart: [[CARRY, 25], [MOVE, 25]],
        level: 10, code: 'AIDC', work: RoleAction.aid_carry
    },
    'aid-upgrade': {
        bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 25]],
        level: 10, code: 'AIDU', work: RoleAction.aid_upgrade
    },


    /* 战斗相关 */
    /* 一体机 */
    'one-tough': {
        bodypart: [[TOUGH, 6], [MOVE, 20], [HEAL, 14]],
        level: 10, code: '1T', action: RoleAction.one_tough
    },
    'one-ranged': {
        bodypart: [[TOUGH, 10], [RANGED_ATTACK, 10], [MOVE, 10], [HEAL, 20]],
        level: 10, code: '1R', action: RoleAction.one_ranged
    },
    'aio': {
        bodypart: [[RANGED_ATTACK, 13], [MOVE, 25], [HEAL, 12]],
        level: 10, code: 'AIO', action: RoleAction.aio
    }, // 进攻一体机
    'saio': {
        bodypart: [[RANGED_ATTACK, 10], [MOVE, 25], [HEAL, 15]],
        level: 10, code: 'SAIO', action: RoleAction.aio
    }, // 支援一体机

    /* 二人队 */
    'double-attack': {
        bodypart: [[ATTACK, 8], [TOUGH, 12], [ATTACK, 20], [MOVE, 10]],
        boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '2A', action: RoleAction.double_attack
    },
    'double-dismantle': {
        bodypart: [[WORK, 8], [TOUGH, 12], [WORK, 20], [MOVE, 10]],
        boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '2D', action: RoleAction.double_dismantle
    },
    'double-heal': {
        bodypart: [[TOUGH, 12], [HEAL, 28], [MOVE, 10]],
        boostmap: {[TOUGH]: 'XGHO2', [HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
        level: 10, code: '2H', action: RoleAction.double_heal
    },

    /* 四人队 */
    'team-attack': {
        bodypart: [[ATTACK, 8], [TOUGH, 12], [ATTACK, 20], [MOVE, 10]],
        boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '4A', action: RoleAction.team_attack
    },
    'team-dismantle': {
        bodypart: [[WORK, 8], [TOUGH, 12], [WORK, 20], [MOVE, 10]],
        boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '4D', action: RoleAction.team_dismantle
    },
    'team-heal': {
        bodypart: [[TOUGH, 12], [MOVE, 10], [HEAL, 28]],
        boostmap: {[HEAL]: 'XLHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '4H', action: RoleAction.team_heal
    },
    'team-ranged': {
        bodypart: [[TOUGH, 12], [RANGED_ATTACK, 8], [MOVE, 10], [HEAL, 20]],
        boostmap: {[HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
        level: 10, code: '4R', action: RoleAction.team_ranged
    },

    /* 主动防御 */
    'defend-attack': {
        bodypart: [[ATTACK, 40], [MOVE, 10]],
        level: 8, code: "DFA", must: true, action: RoleAction.defend_attack
    },
    'defend-ranged': {
        bodypart: [[RANGED_ATTACK, 40], [MOVE, 10]],
        level: 8, code: "DFR", must: true, action: RoleAction.defend_ranged
    },
    'defend-2Attack': {
        bodypart: [[TOUGH, 15], [ATTACK, 25], [MOVE, 10]],
        level: 7, code: "D2A", must: true, action: RoleAction.double_defender
    },
    'defend-2Heal': {
        bodypart: [[TOUGH, 10], [HEAL, 30], [MOVE, 10]],
        level: 7, code: "D2H", must: true, action: RoleAction.double_heal
    },

    /* 外矿相关 */
    /* 外矿 */
    'out-scout': { bodypart: [[MOVE, 1]], level: 11, code: 'OS', work: RoleAction.scout },
    'out-claim': { bodypart: [], level: 11, code: 'OCL', work: RoleAction.outClaim },
    'out-harvest': { bodypart: [], level: 12, code: 'OH', work: RoleAction.outHarvest },
    'out-car': { bodypart: [], level: 13, code: 'OC', work: RoleAction.outCarry },
    'out-carry': { bodypart: [], level: 13, code: 'OC', work: RoleAction.outCarry },
    'out-build': { bodypart: [], level: 12, code: 'OB', work: RoleAction.outBuild },
    'out-defend': { bodypart: [], level: 8, code: 'OD', action: RoleAction.outDefend },
    'out-2Attack': { bodypart: [], level: 8, code: 'O2A', action: RoleAction.out2Attack },
    'out-2Heal': { bodypart: [], level: 8, code: 'O2H', action: RoleAction.out2Heal },
    'out-invader': { bodypart: [], level: 10, code: 'OI', action: RoleAction.outInvader },
    'out-attack': {
        bodypart: [[ATTACK, 19], [MOVE, 25], [HEAL, 6]],
        level: 9, code: 'OA', action: RoleAction.outAttack
    },
    'out-ranged': {
        bodypart: [[RANGED_ATTACK, 15], [MOVE, 25], [HEAL, 10]],
        level: 9, code: 'OR', action: RoleAction.outRanged
    },
    'out-miner': {
        bodypart: [[WORK, 30], [CARRY, 5], [MOVE, 15]],
        level: 12, code: 'OM', work: RoleAction.outMineral
    },

    /* 沉积物 */
    'deposit-harvest': {
        bodypart: [[WORK, 20], [ATTACK, 2], [CARRY, 6], [MOVE, 22]],
        level: 11, code: 'DH', work: RoleAction.deposit_harvest
    },
    'deposit-transfer': {
        bodypart: [[CARRY, 25], [MOVE, 25]],
        level: 11, code: 'DT', work: RoleAction.deposit_transfer
    },
    'deposit-attack': {
        bodypart: [[ATTACK, 25], [MOVE, 25]],
        level: 8, code: "DPA", action: RoleAction.deposit_attack
    },
    'deposit-heal': {
        bodypart: [[HEAL, 25], [MOVE, 25]],
        level: 8, code: 'DPH', action: RoleAction.deposit_heal
    },
    'deposit-ranged': {
        bodypart: [[RANGED_ATTACK, 17], [MOVE, 25], [HEAL, 8]],
        level: 8, code: "DPR", action: RoleAction.deposit_ranged
    },

    /* Power */
    'power-attack': {
        bodypart: [[TOUGH, 5], [MOVE, 25], [ATTACK, 20]],
        level: 10, code: 'PA', action: RoleAction.power_attack
    },
    'power-heal': {
        bodypart: [[MOVE, 25], [HEAL, 25]],
        level: 10, code: 'PH', action: RoleAction.power_heal
    },
    'power-carry': {
        bodypart: [[MOVE, 25], [CARRY, 25]],
        level: 9, code: 'PC', work: RoleAction.power_carry
    },
    'power-ranged': {
        bodypart: [[MOVE, 25], [RANGED_ATTACK, 17], [HEAL, 8]],
        level: 11, code: 'PR', action: RoleAction.power_ranged
    },

}

// 根据等级的动态部件
export const RoleLevelData = {
    'harvester': {
        1: { bodypart: [[WORK, 2], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 4], [CARRY, 1], [MOVE, 1]], num: 0 },
        3: { bodypart: [[WORK, 6], [CARRY, 1], [MOVE, 2]], num: 0 },
        4: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 0 },
        6: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 0 },
        7: { bodypart: [[WORK, 6], [CARRY, 2], [MOVE, 3]], num: 0 },
        8: { bodypart: [[WORK, 10], [CARRY, 5], [MOVE, 5]], num: 0,
             upbodypart: [[WORK, 20], [CARRY, 5], [MOVE, 10]] },
    },
    'carrier': {
        1: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 3 },
        2: { bodypart: [[CARRY, 3], [MOVE, 3]], num: 2 },
        3: { bodypart: [[CARRY, 7], [MOVE, 7]], num: 2 },
        4: { bodypart: [[CARRY, 10], [MOVE, 10]], num: 2 },
        5: { bodypart: [[CARRY, 12], [MOVE, 12]], num: 2 },
        6: { bodypart: [[CARRY, 15], [MOVE, 15]], num: 1 },
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
        5: { bodypart: [[CARRY, 5], [MOVE, 2]], num: 1 },
        6: { bodypart: [[CARRY, 15], [MOVE, 5]], num: 1 },
        7: { bodypart: [[CARRY, 25], [MOVE, 5]], num: 1 },
        8: { bodypart: [[CARRY, 30], [MOVE, 5]], num: 1 },
    },
    'upgrader': {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 3 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 3 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 3 },
        4: { bodypart: [[WORK, 4], [CARRY, 4], [MOVE, 8]], num: 2 },
        5: { bodypart: [[WORK, 6], [CARRY, 6], [MOVE, 6]], num: 2 },
        6: { bodypart: [[WORK, 10], [CARRY, 5], [MOVE, 10]], num: 1 },
        7: { bodypart: [[WORK, 30], [CARRY, 5], [MOVE, 15]], num: 1 },
        8: { bodypart: [[WORK, 15], [CARRY, 5], [MOVE, 10]], num: 1 },
    },
    'worker': {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 0 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 0 },
        4: { bodypart: [[WORK, 5], [CARRY, 4], [MOVE, 9]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 6], [MOVE, 12]], num: 0 },
        6: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 10]], num: 0 },
        7: { bodypart: [[WORK, 20], [CARRY, 10], [MOVE, 15]], num: 0 },
        8: { bodypart: [[WORK, 15], [CARRY, 15], [MOVE, 15]], num: 0,
             upbodypart: [[WORK, 20], [CARRY, 10], [MOVE, 15]]},
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
        8: { bodypart: [[MOVE, 5], [CLAIM, 5]], num: 0 },
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
        6: { bodypart: [[WORK, 5], [CARRY, 10], [MOVE, 15]], num: 1 },
        7: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 20]], num: 1 },
        8: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 20]], num: 1 },
    },
    "out-car": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 1], [CARRY, 2], [MOVE, 3]], num: 0 },
        3: { bodypart: [[WORK, 1], [CARRY, 3], [MOVE, 4]], num: 0 },
        4: { bodypart: [[WORK, 1], [CARRY, 7], [MOVE, 4]], num: 0 },
        5: { bodypart: [[WORK, 1], [CARRY, 21], [MOVE, 11]], num: 0 },
        6: { bodypart: [[WORK, 2], [CARRY, 20], [MOVE, 11]], num: 0 },
        7: { bodypart: [[WORK, 2], [CARRY, 26], [MOVE, 14]], num: 0 },
        8: { bodypart: [[WORK, 2], [CARRY, 30], [MOVE, 16]], num: 0 },
    },
    "out-carry": {
        1: { bodypart: [[CARRY, 2], [MOVE, 2]], num: 0 },
        2: { bodypart: [[CARRY, 3], [MOVE, 3]], num: 0 },
        3: { bodypart: [[CARRY, 4], [MOVE, 4]], num: 0 },
        4: { bodypart: [[CARRY, 8], [MOVE, 4]], num: 0 },
        5: { bodypart: [[CARRY, 20], [MOVE, 10]], num: 0 },
        6: { bodypart: [[CARRY, 20], [MOVE, 10]], num: 0 },
        7: { bodypart: [[CARRY, 26], [MOVE, 13]], num: 0 },
        8: { bodypart: [[CARRY, 30], [MOVE, 15]], num: 0 },
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
    'out-2Attack': {
        1: { bodypart: [[ATTACK, 2], [MOVE, 2]], num: 0 },
        2: { bodypart: [[ATTACK, 4], [MOVE, 4]], num: 0 },
        3: { bodypart: [[ATTACK, 6], [MOVE, 6]], num: 0 },
        4: { bodypart: [[ATTACK, 10], [MOVE, 10]], num: 0 },
        5: { bodypart: [[ATTACK, 12], [MOVE, 12]], num: 0 },
        6: { bodypart: [[ATTACK, 15], [MOVE, 15]], num: 0 },
        7: { bodypart: [[ATTACK, 20], [MOVE, 20]], num: 0 },
        8: { bodypart: [[ATTACK, 25], [MOVE, 25]], num: 0 },
    },
    "out-2Heal": {
        1: { bodypart: [[MOVE, 1], [HEAL, 1]], num: 0 },
        2: { bodypart: [[MOVE, 1], [HEAL, 1]], num: 0 },
        3: { bodypart: [[MOVE, 2], [HEAL, 2]], num: 0 },
        4: { bodypart: [[MOVE, 3], [HEAL, 3]], num: 0 },
        5: { bodypart: [[MOVE, 6], [HEAL, 6]], num: 0 },
        6: { bodypart: [[MOVE, 7], [HEAL, 7]], num: 0 },
        7: { bodypart: [[MOVE, 18], [HEAL, 18]], num: 0 },
        8: { bodypart: [[MOVE, 25], [HEAL, 25]], num: 0 },
    },
    "UP-upgrade": {
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
        1: { bodypart: [[ATTACK, 2], [MOVE, 2]], num: 0 },
        2: { bodypart: [[ATTACK, 4], [MOVE, 4]], num: 0 },
        3: { bodypart: [[ATTACK, 6], [MOVE, 6]], num: 0 },
        4: { bodypart: [[ATTACK, 10], [MOVE, 10]], num: 0 },
        5: { bodypart: [[ATTACK, 12], [MOVE, 12]], num: 0 },
        6: { bodypart: [[ATTACK, 15], [MOVE, 15]], num: 0 },
        7: { bodypart: [[ATTACK, 40], [MOVE, 10]], num: 0 },
        8: { bodypart: [[ATTACK, 40], [MOVE, 10]], num: 0 },
    },
    "aid-build": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 2]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 4]], num: 0 },
        3: { bodypart: [[WORK, 3], [CARRY, 3], [MOVE, 6]], num: 0 },
        4: { bodypart: [[WORK, 5], [CARRY, 4], [MOVE, 9]], num: 0 },
        5: { bodypart: [[WORK, 6], [CARRY, 6], [MOVE, 12]], num: 0 },
        6: { bodypart: [[WORK, 10], [CARRY, 10], [MOVE, 10]], num: 0 },
        7: { bodypart: [[WORK, 15], [CARRY, 10], [MOVE, 15]], num: 0 },
        8: { bodypart: [[WORK, 25], [CARRY, 5], [MOVE, 15]], num: 0 },
    },
    "aid-upgrade": {
        1: { bodypart: [[WORK, 1], [CARRY, 1], [MOVE, 1]], num: 0 },
        2: { bodypart: [[WORK, 2], [CARRY, 2], [MOVE, 2]], num: 0 },
        3: { bodypart: [[WORK, 4], [CARRY, 3], [MOVE, 4]], num: 0 },
        4: { bodypart: [[WORK, 6], [CARRY, 4], [MOVE, 6]], num: 0 },
        5: { bodypart: [[WORK, 10], [CARRY, 5], [MOVE, 10]], num: 0 },
        6: { bodypart: [[WORK, 12], [CARRY, 5], [MOVE, 12]], num: 0 },
        7: { bodypart: [[WORK, 20], [CARRY, 5], [MOVE, 13]], num: 0 },
        8: { bodypart: [[WORK, 25], [CARRY, 5], [MOVE, 15]], num: 0 },
    }
}

// 配置选项
export const RoleBodys = {
    'aio': {
        /** 0tower */
        '0T': {
            bodypart: [[TOUGH, 3], [RANGED_ATTACK, 32], [MOVE, 10], [HEAL, 5]],
            boostmap: { [HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2' }
        },
        /** 2tower */
        '2T': {
            bodypart: [[TOUGH, 4], [RANGED_ATTACK, 26], [MOVE, 10], [HEAL, 10]],
            boostmap: { [HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2' }
        },
        /** 3tower */
        '3T': {
            bodypart: [[TOUGH, 6], [RANGED_ATTACK, 22], [MOVE, 10], [HEAL, 12]],
            boostmap: { [HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2' }
        },
        /** 6tower */
        '6T': {
            bodypart: [[TOUGH, 10], [RANGED_ATTACK, 5], [MOVE, 10], [HEAL, 25]],
            boostmap: { [HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2' }
        }
    },

    'double-attack': {
        'test': {
            bodypart: [[ATTACK, 1], [MOVE, 1]],
        }
    },
    'double-dismantle': {
        'test': {
            bodypart: [[WORK, 1], [MOVE, 1]],
        }
    },
    'double-heal': {
        'test': {
            bodypart: [[RANGED_ATTACK, 1], [HEAL, 1], [MOVE, 2]],
        },
    },



    'aid-build': {
        'T3': {
            bodypart: [[WORK, 35], [CARRY, 5], [MOVE, 10]],
            boostmap: { [WORK]: 'XLH2O', [CARRY]: 'XKH2O', [MOVE]: 'XZHO2' }
        }
    },
    'aid-upgrade': {
        'T3': {
            bodypart: [[WORK, 35], [CARRY, 5], [MOVE, 10]],
            boostmap: { [WORK]: 'XGH2O', [CARRY]: 'XKH2O', [MOVE]: 'XZHO2' }
        }
    },
    'aid-carry': {
        'T3': {
            bodypart: [[CARRY, 25], [MOVE, 25]],
            boostmap: { [CARRY]: 'XKH2O' }
        },
        'BIG': {
            bodypart: [[CARRY, 40], [MOVE, 10]],
            boostmap: { [CARRY]: 'XKH2O', [MOVE]: 'XZHO2' }
        }
    }
}