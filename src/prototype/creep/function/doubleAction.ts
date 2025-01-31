import {getDirection} from '@/utils'

export default class DoubleAction extends Creep {
    // 双人小队移动
    doubleMove(Direction: DirectionConstant): number {
        const bindCreep = Game.getObjectById(this.memory.bind) as Creep;
        if(!bindCreep) return;

        if (this.pos.isNear(bindCreep.pos)) {
            // 疲劳时不移动
            if(this.fatigue > 0) return;
            // 同时移动
            const result = this.move(Direction);
            if(result === OK) {
                // 如果移动成功，那么绑定creep跟随
                this.pull(bindCreep);
                bindCreep.move(this);
            }
            return result;
        } else {    // 如果距离拉远了，那么等他过来
            // 位于房间边缘时不等
            if(this.pos.isRoomEdge()) this.move(Direction);
            bindCreep.moveTo(this);
            return OK;
        }
    }

    // 双人小队移动到目标
    doubleMoveTo(target: RoomPosition, color='#ffffff', ignoreCreeps=false): number | boolean {
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
            }
            return result;
        }
        // 如果距离拉远了，那么等他过来
        else {
            // 位于房间边缘时不等
            if(this.pos.isRoomEdge()) this.moveTo(target, ops);
            bindCreep.moveTo(this);
            return OK;
        }
    }
    // 双人小队移动到目标房间
    doubleMoveToRoom(roomName: string, color: string): boolean {
        const bindcreep = Game.getObjectById(this.memory.bind) as Creep;
        if(!bindcreep) return;
        // 移动到目标房间
        if(this.room.name !== roomName) {
            this.doubleMoveTo(new RoomPosition(25, 25, roomName), color, false);
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
            if (Pos.length === 0) return false;
            const toPos = new RoomPosition(Pos[0], Pos[1], this.room.name)
            bindcreep.move(getDirection(bindcreep.pos, toPos));
        }
        return false;
    }

    // 规避敌人
    doubleFlee() {
        let goals = this.pos.findInRange(FIND_HOSTILE_CREEPS, 8, {
            filter: (c) => !c.isWhiteList() &&
            (c.getActiveBodyparts(ATTACK) || c.getActiveBodyparts(RANGED_ATTACK))
        }).map(c => {
            return {
                pos: c.pos,
                range: c.getActiveBodyparts(RANGED_ATTACK) ? 6 : 4
            };
        });
        let path = PathFinder.search(
            this.pos, 
            goals,
            { 
                flee: true,
                plainCost: 1,
                swampCost: 5,
                maxRooms: 2,
            }).path;
        if (path.length <= 0) return 1;
        return this.doubleMove(getDirection(this.pos, path[0]));
    }

    doubleToAttack(target: Creep | Structure): number | boolean {
        const bindcreep = Game.getObjectById(this.memory.bind) as Creep;
        if (!this.pos.isNearTo(bindcreep)) {
            bindcreep.moveTo(this);
        }
        if (this.pos.isNearTo(target)) {
            return this.attack(target);
        } else {
            return this.doubleMoveTo(target.pos, '#ff0000');
        }
    }

    doubleToDismantle(target: Structure): number | boolean {
        const bindcreep = Game.getObjectById(this.memory.bind) as Creep;
        if (!this.pos.isNearTo(bindcreep)) {
            bindcreep.moveTo(this);
            return true;
        }
        if (this.pos.isNearTo(target)) {
            return this.dismantle(target);
        } else {
            return this.doubleMoveTo(target.pos, '#ffff00');
        }
    }
}