interface TeamData {
    name: string,
    time: number, // 创建时间
    type: '2A' | '2D' | 'AD' | '2R' | '4R';
    state: 'ready' | 'idle' | 'active', // 状态
    direction: '↑' | '←' | '→' | '↓',    // 朝向
    formation: 'line' | 'quad' | string,  // 队形
    targetRoom: string,    // 目标房间
    members: { A1: Id<Creep>, A2: Id<Creep>, B1: Id<Creep>, B2: Id<Creep> },  // 成员
    cache: {
        lastDirect: DirectionConstant, // 上次移动方向
        lastMoveTarget: any, // 上次移动目标
        lastTargetPos: string, // 上次移动目标位置  x/y/roomName
    }
}