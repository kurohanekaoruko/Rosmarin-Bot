export default class BaseFunction extends RoomPosition {
    // 切比雪夫距离
    getDistance(pos: RoomPosition): number {
        const { x: x1, y: y1, roomName: roomName1} = this;
        const { x: x2, y: y2, roomName: roomName2 } = pos;
        if (roomName1 !== roomName2) return Infinity;
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }
    // 是否位置相同
    isEqual(pos: RoomPosition): boolean {
        const { x: x1, y: y1, roomName: roomName1 } = this;
        const { x: x2, y: y2, roomName: roomName2 } = pos;
        return x1 === x2 && y1 === y2 && roomName1 === roomName2;
    }
    // 是否相邻
    isNear(pos: RoomPosition): boolean {
        const { x: x1, y: y1, roomName: roomName1} = this;
        const { x: x2, y: y2, roomName: roomName2 } = pos;
        if (roomName1 !== roomName2) return false;
        return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
    }
    // 是否在指定距离内
    inRange(target: any, range: number): boolean {
        let pos = target.pos || target;
        if (!pos) return false;
        return this.getDistance(pos) <= range;
    }
    // 是否位于房间边界
    isRoomEdge(): boolean {
        const { x, y } = this;
        return x === 0 || x === 49 || y === 0 || y === 49;
    }

    // 该位置是否可通行, 无视野根据terrain判定
    walkable(withCreep = false, rampartOwnerUserName?: string): boolean {
        if (Game.rooms[this.roomName]) {
            const structure =
                this.lookFor(LOOK_STRUCTURES).every((struct: any) => {
                    return !(
                        struct.structureType !== STRUCTURE_CONTAINER &&
                        struct.structureType !== STRUCTURE_ROAD &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            (rampartOwnerUserName ? rampartOwnerUserName != struct.owner.username : !struct.my) ||
                            struct.isPublic)
                    )
                }) &&
                !(
                    this.lookFor(LOOK_TERRAIN).find((o: any) => o === 'wall') &&
                    this.lookFor(LOOK_STRUCTURES).every((struct: any) => struct == STRUCTURE_ROAD)
                ) &&
                this.lookFor(LOOK_CONSTRUCTION_SITES).every(
                    (s: any) => !_.contains(OBSTACLE_OBJECT_TYPES, s.structureType) || !s.my,
                )
            if (withCreep) {
                const creep = this.lookFor(LOOK_CREEPS).length === 0
                return structure && creep
            } else {
                return structure
            }
        } else {
            return new Room.Terrain(this.roomName).get(this.x, this.y) != 1 // 1 是 wall
        }
    }

    // 获取房间坐标
    getRoomCoordinate() {
        const CHAR_0 = '0'.charCodeAt(0)
        const MAP_DIRECT = { E: 1, N: -1, W: -1, S: 1 } //东西南北坐标
        const MAP_OFFSET = { E: 0, N: -1, W: -1, S: 0 } //东西南北坐标
        const roomName = this.roomName;

        const tmp = { x: 0, y: 0 }
        let sh = 0
        let pow = 1
        for (let i = roomName.length - 1; i >= 0; i--) {
            const cc = roomName.charCodeAt(i) - CHAR_0
            if (cc >= 0 && cc <= 9) {
                if (sh == 0) {
                    tmp.y += cc * pow
                } else {
                    tmp.x += cc * pow
                }
                pow *= 10
            } else {
                const c = roomName[i] as keyof typeof MAP_DIRECT
                if (sh == 0) {
                    tmp.y *= MAP_DIRECT[c]
                    tmp.y += MAP_OFFSET[c]
                } else {
                    tmp.x *= MAP_DIRECT[c]
                    tmp.x += MAP_OFFSET[c]
                }
                pow = 1
                sh += 1
            }
        }
        return tmp
    }

    // 计算 RoomPosition 在全图的坐标
    toGlobal(): { x: number, y: number } {
        const roomCoordinate = this.getRoomCoordinate()
        return {
            x: roomCoordinate.x * 50 + this.x,
            y: roomCoordinate.y * 50 + this.y,
        }
    }
}