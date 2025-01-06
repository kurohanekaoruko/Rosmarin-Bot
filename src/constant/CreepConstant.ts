import * as Actions from '@/actions';


interface RoleConfig {
    [key: string]: {
        num: number,         // 默认数量
        ability: number[],   // 默认body个数 [work,carry,move,attack,ranged_attack,heal,claim,tough]
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
            run: (creep: Creep) => any,
            [key: string]: (creep: Creep) => any
        },  // 执行函数，自由定义的行动逻辑
        
    }
}


export const RoleData: RoleConfig = {
    /* 基本房间运营 */
    'harvester': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 3, code: 'H', action: Actions.harvester },  // 采集
    'carrier': { num: 0, ability: [0, 3, 3, 0, 0, 0, 0, 0], level: 4, code: 'C', work: Actions.carrier },  // 矿点搬运
    'transport': { num: 0, ability: [0, 2, 2, 0, 0, 0, 0, 0], level: 2, code: 'T', mission: Actions.transport }, // 资源运输填充
    'manager': { num: 0, ability: [0, 1, 1, 0, 0, 0, 0, 0], level: 1, code: 'M', mission: Actions.manager }, // 中央搬运
    'upgrader': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 10, code: 'U', work: Actions.upgrader }, // 升级
    'worker': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 10, code: 'W', work: Actions.worker }, // 建造、维修、刷墙
    'mineral': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 6, code: 'MR', work: Actions.mineral }, // 矿工

    /* 特殊用途 */
    'scout': { num: 0, ability: [0, 0, 1, 0, 0, 0, 0, 0], level: 11, code: 'S', work: Actions.scout },
    'har-car': { num: 0, ability: [1, 1, 2, 0, 0, 0, 0, 0], level: 0, code: 'HC', work: Actions.harvest_carry }, // 采集搬运一体机，处理停摆状况
    'speedup-upgrade': { num: 0, ability: [2, 1, 1, 0, 0, 0, 0, 0], level: 11, code: 'SU', work: Actions.SpeedUpgrader }, // 加速升级
    'speedup-repair': { num: 0, ability: [30, 5, 15, 0, 0, 0, 0, 0], level: 11, code: 'SR', work: Actions.SpeedRepair }, // 加速刷墙
    'logistic': { num: 0, ability: [0, 2, 2, 0, 0, 0, 0, 0], level: 10, code: 'L', work: Actions.logistic }, // 长途运输
    'dismantle': { num: 0, ability: [40, 0, 10, 0, 0, 0, 0, 0], level: 10, code: 'dis', action: Actions.dismantle},  // boost拆墙
    'cleaner': { num: 0, ability: [25, 0, 25, 0, 0, 0, 0, 0], level: 11, code: 'CLEAN', action: Actions.cleaner },  // 清理者
    'big-carry': { num: 0, ability: [0, 40, 10, 0, 0, 0, 0, 0], level: 10, code: 'BC', work: Actions.bigCarry },  // 大体型搬运
    'r-site': { num: 0, ability: [0, 0, 20, 0, 0, 15, 0, 5], level: 11, code: 'RS', action: Actions.r_site },  // 踩建筑

    /* 占领房间 */
    'claimer': { num: 0, ability: [0, 0, 4, 0, 0, 0, 4, 0], level: 11, code: 'CL', work: Actions.claimer },
    'lclaimer': { num: 0, ability: [0, 0, 10, 0, 0, 9, 1, 0], level: 11, code: 'LCL', action: Actions.lclaimer },
    'aclaimer': { num: 0, ability: [0, 0, 19, 0, 0, 0, 19, 0], level: 11, code: 'ACL', action: Actions.aclaimer },
    'healAclaimer': { num: 0, ability: [0, 0, 25, 0, 0, 10, 11, 4], level: 11, code: 'HAC', action: Actions.aclaimer },

    /* 援建 */
    'aid-build': { num: 0, ability: [20, 5, 25, 0, 0, 0, 0, 0], level: 11, code: 'AIDB', action: Actions.aid_build },
    'aid-carry': { num: 0, ability: [0, 25, 25, 0, 0, 0, 0, 0], level: 11, code: 'AIDC', work: Actions.aid_carry },
    'aid-upgrade': { num: 0, ability: [20, 5, 25, 0, 0, 0, 0, 0], level: 11, code: 'AIDU', action: Actions.aid_upgrade },

    /* 攻击 */

    /* 战斗相关 */
    /* 一体机 */
    'one-tough': { num: 0, ability: [0, 0, 20, 0, 0, 14, 0, 6], level: 10, code: '1T', action: Actions.one_tough},
    'one-ranged': { num: 0, ability: [0, 0, 10, 0, 10, 20, 0, 10], level: 10, code: '1R', action: Actions.one_ranged},

    /** 0tower */
    'aioT0': { num: 0, ability: [0, 0, 10, 0, 32, 5, 0, 3], level: 10, code: 'AIO', action: Actions.aio},
    /** 2tower */
    'aioT2': { num: 0, ability: [0, 0, 10, 0, 26, 10, 0, 4], level: 10, code: 'AIO', action: Actions.aio},
    /** 3tower */
    'aioT3': { num: 0, ability: [0, 0, 10, 0, 22, 12, 0, 6], level: 10, code: 'AIO', action: Actions.aio},
    /** 6tower */
    'aioT6': { num: 0, ability: [0, 0, 10, 0, 5, 23, 0, 12], level: 10, code: 'AIO', action: Actions.aio},

    /* 二人队 */
    'double-attack': { num: 0, ability: [0, 0, 10, 28, 0, 0, 0, 12], level: 10, code: '2A', action: Actions.double_attack},
    'double-dismantle': { num: 0, ability: [28, 0, 10, 0, 0, 0, 0, 12], level: 10, code: '2D', action: Actions.double_dismantle},
    'double-heal': { num: 0, ability: [0, 0, 10, 0, 1, 28, 0, 11], level: 10, code: '2H', action: Actions.double_heal},

    /* 四人队 */
    'quad-attack': { num: 0, ability: [0, 0, 10, 25, 0, 0, 0, 15], level: 10, code: '4A', action: Actions.quad_attack},
    'quad-dismantle': { num: 0, ability: [28, 0, 10, 0, 0, 0, 0, 12], level: 10, code: '4D', action: Actions.quad_dismantle},
    'quad-heal': { num: 0, ability: [0, 0, 10, 0, 1, 24, 0, 15], level: 10, code: '4H', action: Actions.quad_heal},
    'quad-ranged': { num: 0, ability: [0, 0, 10, 0, 22, 4, 0, 14], level: 10, code: '4R', action: Actions.quad_ranged},

    
    /* 主动防御 */
    'defend-attack': { num: 0, ability: [0, 0, 10, 40, 0, 0, 0, 0], level: 8, code: "DFA", must: true, action: Actions.defend_attack },
    'defend-ranged': { num: 0, ability: [0, 0, 10, 0, 40, 0, 0, 0], level: 8, code: "DFR", must: true, action: Actions.defend_ranged },
    'defend-2Attack': { num: 0, ability: [0, 0, 10, 25, 0, 0, 0, 15], level: 7, code: "D2A", must: true, action: Actions.double_defender },
    'defend-2Heal': { num: 0, ability: [0, 0, 10, 0, 0, 30, 0, 10], level: 7, code: "D2H", must: true, action: Actions.double_heal },

    /* 外矿 */
    'out-scout': { num: 0, ability: [0, 0, 1, 0, 0, 0, 0, 0], level: 11, code: 'OS', work: Actions.scout },
    'out-claim': { num: 0, ability: [0, 0, 5, 0, 0, 0, 5, 0], level: 11, code: 'OCL', work: Actions.outClaim },
    'out-harvest': { num: 0, ability: [4, 2, 4, 0, 0, 0, 0, 0], level: 12, code: 'OH', work: Actions.outHarvest },
    'out-car': { num: 0, ability: [1, 5, 6, 0, 0, 0, 0, 0], level: 13, code: 'OC', work: Actions.outCarry},
    'out-carry': { num: 0, ability: [0, 5, 5, 0, 0, 0, 0, 0], level: 13, code: 'OC', work: Actions.outCarry},
    'out-build': { num: 0, ability: [1, 5, 6, 0, 0, 0, 0, 0], level: 13, code: 'OB', work: Actions.outBuild },
    'out-defend': { num: 0, ability: [0, 0, 5, 5, 0, 5, 0, 0], level: 8,code: 'OD', work: Actions.outDefend},
    'out-invader': { num: 0, ability: [0, 0, 5, 5, 0, 6, 0, 0], level: 10, code: 'OI', work: Actions.outInvader},
    'out-attack': { num: 0, ability: [0, 0, 25, 19, 0, 6, 0, 0], level: 9, code: 'OA', action: Actions.outAttack},
    'out-ranged': { num: 0, ability: [0, 0, 25, 0, 15, 10, 0, 0], level: 9, code: 'OR', action: Actions.outRanged},
    'out-miner': { num: 0, ability: [30, 5, 15, 0, 0, 0, 0, 0], level: 12, code: 'OM', work: Actions.outMiner },

    /* 沉积物 */
    'deposit-harvest': { num: 0, ability: [20, 6, 22, 2, 0, 0, 0, 0], level: 11, code: 'DH', work: Actions.deposit_harvest },
    'deposit-transfer': { num: 0, ability: [0, 25, 25, 0, 0, 0, 0, 0], level: 11, code: 'DT', work: Actions.deposit_transfer },
    'deposit-attack': { num: 0, ability: [0, 0, 25, 15, 0, 10, 0, 0], level: 8, code: "DPA", action: Actions.deposit_attack },
    'deposit-ranged': { num: 0, ability: [0, 0, 25, 0, 17, 8, 0, 0], level: 8, code: "DPR", action: Actions.deposit_ranged },

    /* Power */
    'power-attack': { num: 0, ability: [0, 0, 25, 20, 0, 0, 0, 5], level: 10, code: 'PA', action: Actions.power_attack },
    'power-heal': { num: 0, ability: [0, 0, 25, 0, 0, 25, 0, 0], level: 10, code: 'PH', action: Actions.power_heal },
    'power-carry': { num: 0, ability: [0, 25, 25, 0, 0, 0, 0, 0], level: 9, code: 'PC', work: Actions.power_carry },
    'power-ranged': { num: 0, ability: [0, 0, 25, 0, 17, 8, 0, 0], level: 11, code: 'PR', action: Actions.power_ranged },

}

// 根据等级的动态部件
export const RoleLevelData = {
    'harvester': {
        1: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [3, 1, 1, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [6, 1, 3, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [10, 2, 3, 0, 0, 0, 0, 0], num: 2 },
        7: { bodypart: [10, 2, 3, 0, 0, 0, 0, 0], num: 2 },
        8: { bodypart: [20, 4, 10, 0, 0, 0, 0, 0], num: 2, upbodypart: [25, 5, 13, 0, 0, 0, 0, 0] },
    },
    'carrier': {
        1: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 2 },
        2: { bodypart: [0, 3, 3, 0, 0, 0, 0, 0], num: 2 },
        3: { bodypart: [0, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        4: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 15, 15, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 20, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 20, 20, 0, 0, 0, 0, 0], num: 0 },
    },
    'transport': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 5, 5, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 16, 16, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 24, 12, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [0, 32, 16, 0, 0, 0, 0, 0], num: 1 },
    },
    'manager': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 10, 5, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [0, 20, 5, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [0, 25, 5, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [0, 40, 5, 0, 0, 0, 0, 0], num: 1 },
    },
    'upgrader': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 3 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 3 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 3 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 2 },
        5: { bodypart: [6, 6, 6, 0, 0, 0, 0, 0], num: 2 },
        6: { bodypart: [7, 7, 7, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [15, 4, 8, 0, 0, 0, 0, 0], num: 1 },
    },
    'worker': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [5, 5, 10, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 20, 15, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [16, 17, 17, 0, 0, 0, 0, 0], num: 0 },
    },
    'builder': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [4, 10, 7, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 20, 15, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [15, 15, 15, 0, 0, 0, 0, 0], num: 0 },
    },
    'repair': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [5, 5, 5, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [8, 8, 8, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [10, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [15, 17, 16, 0, 0, 0, 0, 0], num: 0 },
    },
    'miner': {
        1: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [3, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [6, 1, 3, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [7, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [10, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [15, 2, 5, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [30, 2, 8, 0, 0, 0, 0, 0], num: 0 },
    },
    'logistic': {
        1: { bodypart: [0, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 3, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 5, 5, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 10, 10, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [0, 15, 15, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [0, 20, 20, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 25, 25, 0, 0, 0, 0, 0], num: 0 },
    },
    "claimer": {
        1: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 0 },
        5: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 0 },
        6: { bodypart: [0, 0, 2, 0, 0, 0, 2, 0], num: 0 },
        7: { bodypart: [0, 0, 3, 0, 0, 0, 3, 0], num: 0 },
        8: { bodypart: [0, 0, 4, 0, 0, 0, 4, 0], num: 0 },
    },
    "out-claim": {
        1: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 0, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 1, 0, 0, 0, 1, 0], num: 0 },
        5: { bodypart: [0, 0, 2, 0, 0, 0, 2, 0], num: 0 },
        6: { bodypart: [0, 0, 2, 0, 0, 0, 2, 0], num: 0 },
        7: { bodypart: [0, 0, 3, 0, 0, 0, 3, 0], num: 0 },
        8: { bodypart: [0, 0, 10, 0, 0, 0, 10, 0], num: 0 },
    },
    "out-harvest": {
        1: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [2, 1, 1, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [5, 1, 3, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [6, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [8, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [10, 2, 5, 0, 0, 0, 0, 0], num: 0 },
    },
    'out-build': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 1 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 1 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 1 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 1 },
        5: { bodypart: [4, 10, 7, 0, 0, 0, 0, 0], num: 1 },
        6: { bodypart: [5, 15, 20, 0, 0, 0, 0, 0], num: 1 },
        7: { bodypart: [10, 20, 15, 0, 0, 0, 0, 0], num: 1 },
        8: { bodypart: [15, 15, 15, 0, 0, 0, 0, 0], num: 1 },
    },
    "out-car": {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [1, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [1, 2, 3, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [1, 7, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [1, 21, 11, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [1, 21, 11, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [2, 26, 14, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [2, 30, 16, 0, 0, 0, 0, 0], num: 0 },
    },
    "out-carry": {
        1: { bodypart: [0, 2, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [0, 3, 3, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [0, 4, 4, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [0, 8, 4, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 20, 10, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [0, 22, 11, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [0, 26, 13, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 32, 16, 0, 0, 0, 0, 0], num: 0 },
    },
    "out-defend": {
        1: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 3, 0, 2, 2, 0, 0], num: 0 },
        5: { bodypart: [0, 0, 6, 0, 3, 3, 0, 0], num: 0 },
        6: { bodypart: [0, 0, 8, 0, 4, 4, 0, 0], num: 0 },
        7: { bodypart: [0, 0, 16, 0, 8, 8, 0, 0], num: 0 },
        8: { bodypart: [0, 0, 25, 5, 10, 10, 0, 0], num: 0 },
    },
    "out-invader": {
        1: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        2: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        3: { bodypart: [0, 0, 1, 0, 0, 1, 0, 0], num: 0 },
        4: { bodypart: [0, 0, 3, 3, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [0, 0, 6, 6, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [0, 0, 8, 8, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [0, 0, 15, 15, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [0, 0, 15, 15, 0, 0, 0, 0], num: 0 },
    },
    'speedup-upgrade': {
        1: { bodypart: [1, 1, 2, 0, 0, 0, 0, 0], num: 0 },
        2: { bodypart: [2, 2, 4, 0, 0, 0, 0, 0], num: 0 },
        3: { bodypart: [3, 3, 6, 0, 0, 0, 0, 0], num: 0 },
        4: { bodypart: [4, 4, 8, 0, 0, 0, 0, 0], num: 0 },
        5: { bodypart: [10, 5, 5, 0, 0, 0, 0, 0], num: 0 },
        6: { bodypart: [20, 1, 5, 0, 0, 0, 0, 0], num: 0 },
        7: { bodypart: [39, 1, 10, 0, 0, 0, 0, 0], num: 0 },
        8: { bodypart: [32, 2, 16, 0, 0, 0, 0, 0], num: 0 }
    },
}

// 配置选项
export const RoleBodys = {
    'one-ranged':{
        0: [0, 0, 10, 0, 12, 23, 0, 5],
    },
    'double-dismantle':{
        0: [35, 0, 10, 0, 0, 0, 0, 5],
    },
    'double-heal':{
        0: [0, 0, 5, 0, 0, 15, 0, 5],
    }
}