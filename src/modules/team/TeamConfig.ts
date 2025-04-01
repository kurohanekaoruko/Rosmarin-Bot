const A25T15 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 10], [TOUGH, 15], [ATTACK, 15], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
};
const W25T15 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 10], [TOUGH, 15], [WORK, 15], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
};
const H28T12 = {
    role: 'team-heal',
    bodypart: [[TOUGH, 12], [MOVE, 10], [HEAL, 28]],
    boostmap: {[TOUGH]: 'XGHO2', [HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
};
const R20HT10 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 14], [TOUGH, 10], [RANGED_ATTACK, 6], [HEAL, 10], [MOVE, 10]],
    boostmap: {[RANGED_ATTACK]: 'XKHO2', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
};
const A28T12 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 10], [TOUGH, 12], [ATTACK, 18], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
}
const W28T12 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 10], [TOUGH, 12], [WORK, 18], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2'},
}
const R28T12 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 10], [TOUGH, 12], [RANGED_ATTACK, 18], [MOVE, 10]],
    boostmap: {[RANGED_ATTACK]: 'XKHO2', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2'},
}
const A35R5 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 35], [RANGED_ATTACK, 5], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2'},
};
const A35T5 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 5], [TOUGH, 5], [ATTACK, 30], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2'},
};
const W35T5 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 5], [TOUGH, 5], [WORK, 30], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [TOUGH]: 'XGHO2', [MOVE]: 'XZHO2'},
};
const R30T10 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 15], [TOUGH, 10], [RANGED_ATTACK, 15], [MOVE, 10]],
    boostmap: {[TOUGH]: 'XGHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [HEAL]: 'XLHO2'},
};
const H35T5 = {
    role: 'team-heal',
    bodypart: [[TOUGH, 5], [HEAL, 35], [MOVE, 10]],
    boostmap: {[TOUGH]: 'XGHO2', [HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
};
const A40 = {
    role: 'team-attack',
    bodypart: [[ATTACK, 40], [MOVE, 10]],
    boostmap: {[ATTACK]: 'XUH2O', [MOVE]: 'XZHO2'},
}
const W40 = {
    role: 'team-dismantle',
    bodypart: [[WORK, 40], [MOVE, 10]],
    boostmap: {[WORK]: 'XZH2O', [MOVE]: 'XZHO2'},
}
const R40 = {
    role: 'team-ranged',
    bodypart: [[RANGED_ATTACK, 40], [MOVE, 10]],
    boostmap: {[RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2'},
}
const H40 = {
    role: 'team-heal',
    bodypart: [[HEAL, 40], [MOVE, 10]],
    boostmap: {[HEAL]: 'XLHO2', [MOVE]: 'XZHO2'},
}


export const TEAM_CONFIG = {
    /** 常用配置 */
    'RHT/4': [ R20HT10, R20HT10, H28T12, H28T12 ],
    'WT/4': [ W25T15, W25T15, H28T12, H28T12 ],
    'AT/4': [ A25T15, A25T15, H28T12, H28T12 ],
    'RT/4': [ R28T12, R28T12, H28T12, H28T12 ],
    'R28/4': [ R28T12, R28T12, H28T12, H28T12 ],
    'W28/4': [ W28T12, W28T12, H28T12, H28T12 ],
    'A28/4': [ A28T12, A28T12, H28T12, H28T12  ],

    /** 混搭 */
    'AW/4': [ A25T15, W25T15, H28T12, H28T12 ],
    'AR/4': [ A25T15, R28T12, H28T12, H28T12 ],
    'WR/4': [ W25T15, R28T12, H28T12, H28T12 ],

    /** 激进配置 */
    // 双大黄
    'W35/4': [ W35T5, W35T5, H35T5, H35T5 ],
    // 双大红
    'A35/4': [ A35T5, A35T5, H35T5, H35T5 ],
    // 无T大红
    'A35R/4': [ A35R5, A35R5, H35T5, H35T5 ],
    // 双大蓝
    'R30/4': [ R30T10, R30T10, H35T5, H35T5 ],

    /** 无奶 */
    // 四大蓝
    'R40/4': [ R40, R40, R40, R40 ],
    // 大黄大蓝
    'WR40/4': [ W40, W40, R40, R40],

    /** 二人小队 */
    // 二人红
    'AH/2': [ A25T15, H28T12 ],
    // 二人黄
    'WH/2': [ W25T15, H28T12 ],
    // 二人蓝
    'RH/2': [ R28T12, H28T12 ],
    // 二人35红
    'AH35/2': [ A35T5, H35T5],
    // 二人35黄
    'WH35/2': [ W35T5, H35T5],
    // 二人大红
    'AH40/2': [ A40, H40 ],
    // 二人大黄
    'WH40/2': [ W40, H40 ],
    // 二人黄蓝
    'WR40/2': [ W40, R40],

    // 小型二人队
    'WHx/2': [
        { role: 'team-dismantle', bodypart: [[WORK, 25], [MOVE, 25]] },
        { role: 'team-heal', bodypart: [[HEAL, 25], [MOVE, 25]] }
    ],
    'RHx/2': [
        { role: 'team-ranged', bodypart: [[RANGED_ATTACK, 25], [MOVE, 25]] },
        { role: 'team-heal', bodypart: [[HEAL, 25], [MOVE, 25]] }
    ],


    /** 测试 */
    'TEST': [
        { role: 'team-attack', bodypart: [[ATTACK, 1], [MOVE, 1]] },
        { role: 'team-dismantle', bodypart: [[WORK, 1], [MOVE, 1]] },
        { role: 'team-ranged', bodypart: [[RANGED_ATTACK, 1], [MOVE, 1]] },
        { role: 'team-heal', bodypart: [[HEAL, 1], [MOVE, 1]] }
    ],

}