interface RoomPosition {
    // 切比雪夫距离
    getDistance(pos: RoomPosition): number;
    // 是否位置相同
    isEqual(pos: RoomPosition): boolean;
    // 是否相邻
    isNear(pos: RoomPosition): boolean;
    // 是否在指定距离内
    inRange(target: any, range: number): boolean;
    // 是否位于房间边界
    isRoomEdge(): boolean;
    // 该位置是否可通行, 无视野根据terrain判定
    walkable(withCreep?: boolean, rampartOwnerUserName?: string): boolean
    // 转为全局坐标
    toGlobal(): { x: number, y: number };
}