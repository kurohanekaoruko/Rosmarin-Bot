import {getDirection} from '@/utils'

export default class DoubleAction extends Creep {
    // 双人小队移动
    doubleMove(target: RoomPosition, color='#ffffff', ignoreCreeps=false): boolean {
        const bindCreep = Game.getObjectById(this.memory.bind) as Creep;
        if(!bindCreep) return;

        const ops = { visualizePathStyle: { stroke: color }}
        ops['ignoreCreeps'] = ignoreCreeps;

        if (this.pos.isNear(bindCreep.pos)) {
            // 疲劳时不移动
            if(this.fatigue > 0) return;
            // 同时移动
            const result = this.moveTo(target, ops);
            if(result === OK) {
                // 如果移动成功，那么绑定creep跟随
                this.pull(bindCreep);
                bindCreep.move(this);
                return true;
            }
        }
        // 如果距离拉远了，那么等他过来
        else {
            // 位于房间边缘时不等
            if(this.pos.isRoomEdge()) this.moveTo(target, ops);
            bindCreep.moveTo(this);
            return true;
        }
        return false;
    }
    // 双人小队移动到目标房间
    doubleMoveToRoom(roomName: string): boolean {
        const bindcreep = Game.getObjectById(this.memory.bind) as Creep;
        if(!bindcreep) return;
        // 移动到目标房间
        if(this.room.name !== roomName) {
            this.doubleMove(new RoomPosition(25, 25, roomName), '#ff0000')
            return true;
        }
        // 躲边界
        else if(this.pos.isRoomEdge()) {
            this.move(getDirection(this.pos, new RoomPosition(25, 25, this.room.name)))
            bindcreep.moveTo(this);
            return true;
        }
        // bindcreep躲边界
        else if(this.room.name == bindcreep.room.name && bindcreep.pos.isRoomEdge()) {
            const terrain = this.room.getTerrain();
            const Pos = [
                [this.pos.x - 1, this.pos.y - 1], [this.pos.x - 1, this.pos.y], [this.pos.x - 1, this.pos.y + 1],
                [this.pos.x, this.pos.y - 1], [this.pos.x, this.pos.y + 1],
                [this.pos.x + 1, this.pos.y - 1], [this.pos.x + 1, this.pos.y], [this.pos.x + 1, this.pos.y + 1]
            ].find(pos => {
                if (pos[0] <= 0 || pos[0] >= 49 || pos[1] <= 0 || pos[1] >= 49) return false;
                if (!bindcreep.pos.isNearTo(pos[0], pos[1])) return false;
                if (terrain.get(pos[0], pos[1]) === TERRAIN_MASK_WALL) return false;
                return true;
            })
            const toPos = new RoomPosition(Pos[0], Pos[1], this.room.name)
            bindcreep.move(getDirection(bindcreep.pos, toPos));
        }
        return false;
    }
}