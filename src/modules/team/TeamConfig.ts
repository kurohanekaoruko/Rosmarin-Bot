const RED = {
    role: 'team-attack',
    bodypart: [[ATTACK, 10], [TOUGH, 15], [ATTACK, 15], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
};
const YELLOW = {
    role: 'team-dismantle',
    bodypart: [[WORK, 10], [TOUGH, 15], [WORK, 15], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
};
const GREEN = {
    role: 'team-heal',
    bodypart: [[TOUGH, 12], [MOVE, 10], [HEAL, 28]],
    boostmap: {[TOUGH]: 'XGHO2', [HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
};
const BLUE = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 14], [TOUGH, 10], [RANGED_ATTACK, 6], [HEAL, 10], [MOVE, 10]],
    boostmap: {[TOUGH]: 'XGHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
};

const RED_35_BLUE_5 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 35], [RANGED_ATTACK, 5], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2'},
};
const RED_35 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 5], [TOUGH, 5], [ATTACK, 30], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2'},
};
const YELLOW_35 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 5], [TOUGH, 5], [WORK, 30], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2'},
};
const YELLOW_40 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 40], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2'},
}
const BLUE_30 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 15], [TOUGH, 10], [RANGED_ATTACK, 15], [MOVE, 10]],
    boostmap: {[TOUGH]: 'XGHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
};
const BLUE_40 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 40], [MOVE, 10]],
    boostmap: {[RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2'},
}
const GREEN_35 = {
    role: 'team-heal',
    bodypart: [[TOUGH, 5], [HEAL, 35], [MOVE, 10]],
    boostmap: {[TOUGH]: 'XGHO2', [HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
};
const GREEN_40 = {
    role: 'team-heal',
    bodypart: [[HEAL, 40], [MOVE, 10]],
    boostmap: {[HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
}


export const TEAM_CONFIG = {
    /** 常用配置 */
    // 双蓝
    'R2T3': [ BLUE, BLUE, GREEN, GREEN ],
    // 双黄
    'W2T3': [ YELLOW, YELLOW, GREEN, GREEN ],
    // 双红
    'A2T3': [ RED, RED, GREEN, GREEN ],

    /** 激进配置 */
    // 双大黄
    'WWT3': [ YELLOW_35, YELLOW_35, GREEN_35, GREEN_35 ],
    // 双大红
    'AAT3': [ RED_35_BLUE_5, RED_35_BLUE_5, GREEN_35, GREEN_35 ],
    // 双大蓝
    'RRT3': [ BLUE_30, BLUE_30, GREEN_35, GREEN_35 ],
    // 四大蓝
    'R40T3': [ BLUE_40, BLUE_40, BLUE_40, BLUE_40 ],

    /** 混搭 */
    // 红黄
    'AWT3': [ RED, YELLOW, GREEN, GREEN ],
    // 红蓝
    'ART3': [ RED, BLUE, GREEN, GREEN ],
    // 黄蓝
    'WRT3': [ YELLOW, BLUE, GREEN, GREEN ],
    
    /** 二人小队 */
    // 二人红
    'AHT3': [ RED, GREEN ],
    // 二人黄
    'WHT3': [ YELLOW, GREEN ],
    // 二人蓝
    'RHT3': [ BLUE, GREEN ],
    // 二人大黄
    'WH40T3': [ YELLOW_40, GREEN_40 ],

    'TANK': [
        {
            role: 'team-heal',
            bodypart: [[TOUGH, 15], [MOVE, 10], [HEAL, 25]],
            boostmap: {[TOUGH]: 'XGHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
        },
        {
            role: 'team-heal',
            bodypart: [[TOUGH, 15], [MOVE, 10], [HEAL, 25]],
            boostmap: {[TOUGH]: 'XGHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
        },
        {
            role: 'team-heal',
            bodypart: [[TOUGH, 15], [MOVE, 10], [HEAL, 25]],
            boostmap: {[TOUGH]: 'XGHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
        },
        {
            role: 'team-heal',
            bodypart: [[TOUGH, 15], [MOVE, 10], [HEAL, 25]],
            boostmap: {[TOUGH]: 'XGHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
        },
    ],  

    /** 测试 */
    'TEST': [
        { role: 'team-attack', bodypart: [[ATTACK, 1], [MOVE, 1]] },
        { role: 'team-dismantle', bodypart: [[WORK, 1], [MOVE, 1]] },
        { role: 'team-ranged', bodypart: [[RANGED_ATTACK, 1], [MOVE, 1]] },
        { role: 'team-heal', bodypart: [[HEAL, 1], [MOVE, 1]] }
    ],

}