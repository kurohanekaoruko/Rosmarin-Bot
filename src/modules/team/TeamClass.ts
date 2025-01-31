import { getDirection } from '@/utils';

export default class Team {
    name: string;
    type: '2A' | '2D' | 'AD' | '2R' | '4R' | string;
    state: 'ready' | 'idle' | 'active'; // 状态
    action: 'attack' | 'flee' | 'move'; // 行动
    toward: '↑' | '←' | '→' | '↓';    // 朝向
    formation: 'line' | 'quad' | string;  // 队形
    targetRoom: string;    // 目标房间
    membersCount: number;           // 成员人数
    members: {
        A1?: Creep,    // 成员-A1
        A2?: Creep,    // 成员-A2
        B1?: Creep,    // 成员-B1
        B2?: Creep,    // 成员-B2
        arr?: Creep[], // 成员数组
    };
    cache: { [key: string]: any };    // 缓存

    // 构造函数
    constructor(teamData: TeamMemory) {
        this.name = teamData.name;
        this.type = teamData.type;
        this.state = teamData.state;
        this.action = teamData.action;
        this.toward = teamData.toward;
        this.formation = teamData.formation;
        this.targetRoom = teamData.targetRoom;
        this.cache = teamData.cache;
        this.members = {};
        
        this.members.A1 = Game.getObjectById(teamData.members.A1) as Creep;
        this.members.A2 = Game.getObjectById(teamData.members.A2) as Creep;
        this.members.B1 = Game.getObjectById(teamData.members.B1) as Creep;
        this.members.B2 = Game.getObjectById(teamData.members.B2) as Creep;

        let creeps = [
            this.members.A1,
            this.members.B1,
            this.members.A2,
            this.members.B2,
        ];
        creeps = creeps.filter((c: Creep) => c); // 过滤掉undefined
        this.membersCount = creeps.length;       // 成员人数
        this.members.arr = creeps;               // 成员数组

        if (this.membersCount == 0) {
            // 没有成员，则解散
            this.members = undefined;
            return;
        } else if (this.membersCount <= 2) {
            // 人数小于等于2，则转为为线性队形
            this.formation = 'line'
        }
    }

    // 主运行逻辑
    tickRun(): void {
        // 移动到目标房间
        if (!this.checkIsInTargetRoom(this.targetRoom) || this.checkIsOnEdge()) {
            if (this.formation === 'line') {
                this.LineMoveToRoom(this.targetRoom);
            }
            if (this.formation === 'quad') {
                this.QuadMoveToRoom(this.targetRoom);
            }
            return;
        }

        // 整理队形
        if (this.formation === 'line' && !this.checkIsLine()) {
            this.Gather();
        } else if (this.formation === 'quad' && !this.checkIsQuad()) {
            this.Gather();
        }

        // 调整朝向
        if (this.formation === 'quad' && !this.checkTeamDirection()) {
            this.AdjustToward();
        }
    

        
        
    }

    // 获取队伍坐标范围
    getPosRange(): { minX: number, maxX: number, minY: number, maxY: number } {
        if (this.membersCount == 0) return undefined;
        let creepPos = this.members.arr.map((c: Creep) => c.pos);
        let minX = Math.min(...creepPos.map((p) => p.x));
        let maxX = Math.max(...creepPos.map((p) => p.x));
        let minY = Math.min(...creepPos.map((p) => p.y));
        let maxY = Math.max(...creepPos.map((p) => p.y));
        return { minX, maxX, minY, maxY };
    }

    // 获取队伍全局坐标范围
    getGlobalPosRange(): { minX: number, maxX: number, minY: number, maxY: number } {
        if (this.membersCount == 0) return undefined;
        let creepPos = this.members.arr.map((c: Creep) => c.pos.toGlobal());
        let minX = Math.min(...creepPos.map((p) => p.x));
        let maxX = Math.max(...creepPos.map((p) => p.x));
        let minY = Math.min(...creepPos.map((p) => p.y));
        let maxY = Math.max(...creepPos.map((p) => p.y));
        return { minX, maxX, minY, maxY };
    }

    // 检查小队成员位置是否构成方形
    checkIsQuad(): boolean {
        if (this.formation != 'quad') return false;
        if (this.membersCount < 4) return false;

        let { minX, maxX, minY, maxY } = this.getGlobalPosRange();

        return (maxX - minX == 1 && maxY - minY == 1); // 判断是否构成方形
    }

    // 检查小队成员位置是否线性相连
    checkIsLine(): boolean {
        if (this.formation != 'line') return false;
        if (this.membersCount < 2) return true;

        for (let i = 1; i < this.membersCount; i++) {
            if (!this.members.arr[i - 1].pos.inRangeTo(this.members.arr[i], 1)) {
                return false;
            }
        }

        return true;
    }

    // 检查队伍是否均在同一房间
    checkIsInSameRoom(): boolean {
        if (this.membersCount == 0) return false;
        let roomName = this.members.arr[0].room.name;
        return this.members.arr.every((c: Creep) => c.room.name == roomName);
    }

    // 检查队伍是否在目标房间
    checkIsInTargetRoom(targetRoom?: string): boolean {
        if (!targetRoom) return true;
        if (this.membersCount == 0) return false;
        return this.members.arr.every((c: Creep) => c.room.name == targetRoom);
    }

    // 队伍是否处于边界
    checkIsOnEdge(): boolean {
        if (this.membersCount == 0) return false;
        return this.members.arr.some((c: Creep) => c.pos.isRoomEdge());
    }

    // 检查队伍是否符合设定的朝向
    checkTeamDirection(): boolean {
        if (this.membersCount == 0) return false;
        if (!this.checkIsQuad()) return false;

        const { minX, maxX, minY, maxY } = this.getGlobalPosRange();
        let { A1, A2, B1, B2 } = this.members;

        switch (this.toward) {
            case '↑':
                if (A1 && (A1.pos.x != minX || A1.pos.y != minY)) return false;
                if (A2 && (A2.pos.x != maxX || A2.pos.y != minY)) return false;
                if (B1 && (B1.pos.x != minX || B1.pos.y != maxY)) return false;
                if (B2 && (B2.pos.x != maxX || B2.pos.y != maxY)) return false;
                return true;
            case '↓':
                if (A1 && (A1.pos.x != maxX || A1.pos.y != maxY)) return false;
                if (A2 && (A2.pos.x != minX || A2.pos.y != maxY)) return false;
                if (B1 && (B1.pos.x != maxX || B1.pos.y != minY)) return false;
                if (B2 && (B2.pos.x != minX || B2.pos.y != minY)) return false;
                return true;
            case '←':
                if (A1 && (A1.pos.x != minX || A1.pos.y != maxY)) return false;
                if (A2 && (A2.pos.x != minX || A2.pos.y != minY)) return false;
                if (B1 && (B1.pos.x != maxX || B1.pos.y != maxY)) return false;
                if (B2 && (B2.pos.x != maxX || B2.pos.y != minY)) return false;
                return true;
            case '→':
                if (A1 && (A1.pos.x != maxX || A1.pos.y != minY)) return false;
                if (A2 && (A2.pos.x != maxX || A2.pos.y != maxY)) return false;
                if (B1 && (B1.pos.x != minX || B1.pos.y != minY)) return false;
                if (B2 && (B2.pos.x != minX || B2.pos.y != maxY)) return false;
                return true;
            default:
                return false;
        }
    }

    // 调整朝向
    AdjustToward(): void {
        const { minX, maxX, minY, maxY } = this.getPosRange();
        let { A1, A2, B1, B2 } = this.members;

        let LT = new RoomPosition(minX, minY, this.members.arr[0].room.name);
        let RT = new RoomPosition(maxX, minY, this.members.arr[0].room.name);
        let LB = new RoomPosition(minX, maxY, this.members.arr[0].room.name);
        let RB = new RoomPosition(maxX, maxY, this.members.arr[0].room.name);

        switch (this.toward) {
            case '↑':
                if (A1 && !A1.pos.isEqual(LT)) A1.move(getDirection(A1.pos, LT));
                if (A2 && !A2.pos.isEqual(RT)) A2.move(getDirection(A2.pos, RT));
                if (B1 && !B1.pos.isEqual(LB)) B1.move(getDirection(B1.pos, LB));
                if (B2 && !B2.pos.isEqual(RB)) B2.move(getDirection(B2.pos, RB));
                break;
            case '↓':
                if (A1 && !A1.pos.isEqual(RB)) A1.move(getDirection(A1.pos, RB));
                if (A2 && !A2.pos.isEqual(LB)) A2.move(getDirection(A2.pos, LB));
                if (B1 && !B1.pos.isEqual(RT)) B1.move(getDirection(B1.pos, RT));
                if (B2 && !B2.pos.isEqual(LT)) B2.move(getDirection(B2.pos, LT));
                break;
            case '←':
                if (A1 && !A1.pos.isEqual(LB)) A1.move(getDirection(A1.pos, LB));
                if (A2 && !A2.pos.isEqual(LT)) A2.move(getDirection(A2.pos, LT));
                if (B1 && !B1.pos.isEqual(RB)) B1.move(getDirection(B1.pos, RB));
                if (B2 && !B2.pos.isEqual(RT)) B2.move(getDirection(B2.pos, RT));
                break;
            case '→':
                if (A1 && !A1.pos.isEqual(RT)) A1.move(getDirection(A1.pos, RT));
                if (A2 && !A2.pos.isEqual(RB)) A2.move(getDirection(A2.pos, RB));
                if (B1 && !B1.pos.isEqual(LT)) B1.move(getDirection(B1.pos, LT));
                if (B2 && !B2.pos.isEqual(LB)) B2.move(getDirection(B2.pos, LB));
                break;
        }
        
    }


    // 由线性队形转为方阵队形
    LineToQuad(): number {
        if (this.checkIsQuad()) return OK;
        let { A1, A2, B1, B2 } = this.members;
        if (A1) {
            if (A2) A2.moveTo(new RoomPosition(A1.pos.x + 1, A1.pos.y, A1.pos.roomName));
            if (B1) B1.moveTo(new RoomPosition(A1.pos.x, A1.pos.y + 1, A1.pos.roomName));
            if (B2) B2.moveTo(new RoomPosition(A1.pos.x + 1, A1.pos.y + 1, A1.pos.roomName));
        } else if (A2) {
            if (B1) B1.moveTo(new RoomPosition(A2.pos.x - 1, A2.pos.y + 1, A2.pos.roomName));
            if (B2) B2.moveTo(new RoomPosition(A2.pos.x, A2.pos.y + 1, A2.pos.roomName));
        } else if (B1) {
            if (B2) B2.moveTo(new RoomPosition(B1.pos.x + 1, B1.pos.y, B1.pos.roomName));
        } else {
            return OK;
        }
        return -1;
    }

    // 成员集结
    Gather(pos?: RoomPosition): void {
        if (this.formation == 'line') {
            if (!pos) pos = this.members.arr[0].pos;
            this.LineMoveTo(pos);
            return;
        }
        if (this.formation == 'quad') {
            let { A1, A2, B1, B2 } = this.members;
            if (!pos) {
                if (this.toward == '↑') {
                    pos = A1 ? A1.pos :
                          A2 ? new RoomPosition(A2.pos.x - 1, A2.pos.y, A2.pos.roomName) :
                          B1 ? new RoomPosition(B1.pos.x, B1.pos.y - 1, B1.pos.roomName) :
                          B2 ? new RoomPosition(B2.pos.x - 1, B2.pos.y - 1, B2.pos.roomName) : undefined;
                } else if (this.toward == '←') {
                    pos = A1 ? new RoomPosition(A1.pos.x, A1.pos.y - 1, A1.pos.roomName) :
                          A2 ? A2.pos :
                          B1 ? new RoomPosition(B1.pos.x - 1, B1.pos.y - 1, B1.pos.roomName) :
                          B2 ? new RoomPosition(B2.pos.x - 1, B2.pos.y, B2.pos.roomName) : undefined;
                } else if (this.toward == '→') {
                    pos = A1 ? new RoomPosition(A1.pos.x - 1, A1.pos.y, A1.pos.roomName) :
                          A2 ? new RoomPosition(A2.pos.x - 1, A2.pos.y - 1, A2.pos.roomName) :
                          B1 ? B1.pos :
                          B2 ? new RoomPosition(B2.pos.x, B2.pos.y - 1, B2.pos.roomName) : undefined;
                } else if (this.toward == '↓') {
                    pos = A1 ? new RoomPosition(A1.pos.x - 1, A1.pos.y - 1, A1.pos.roomName) :
                          A2 ? new RoomPosition(A2.pos.x, A2.pos.y - 1, A2.pos.roomName) :
                          B1 ? new RoomPosition(B1.pos.x - 1, B1.pos.y, B1.pos.roomName) :
                          B2 ? B2.pos : undefined;
                }
                if (!pos) return;
            }

            if (this.toward == '↑') {
                if (A1) A1.moveTo(pos);
                if (A2) A2.moveTo(new RoomPosition(pos.x + 1, pos.y, pos.roomName));
                if (B1) B1.moveTo(new RoomPosition(pos.x, pos.y + 1, pos.roomName));
                if (B2) B2.moveTo(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
            } else if (this.toward == '←') {
                if (A1) A1.moveTo(new RoomPosition(pos.x, pos.y + 1, pos.roomName));
                if (A2) A2.moveTo(pos);
                if (B1) B1.moveTo(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
                if (B2) B2.moveTo(new RoomPosition(pos.x + 1, pos.y, pos.roomName));
            } else if (this.toward == '→') {
                if (A1) A1.moveTo(new RoomPosition(pos.x + 1, pos.y, pos.roomName));
                if (A2) A2.moveTo(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
                if (B1) B1.moveTo(pos);
                if (B2) B2.moveTo(new RoomPosition(pos.x, pos.y + 1, pos.roomName));
            } else if (this.toward == '↓') {
                if (A1) A1.moveTo(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
                if (A2) A2.moveTo(new RoomPosition(pos.x, pos.y + 1, pos.roomName));
                if (B1) B1.moveTo(new RoomPosition(pos.x + 1, pos.y, pos.roomName));
                if (B2) B2.moveTo(pos);
            }  else {
                return;
            }
        }
    }

    // 线性队形移动到目标
    LineMoveTo(pos: RoomPosition): void {
        const creeps = this.members.arr;
        if (creeps.length == 0) return;

        // 到达目标或有creep疲劳则停止
        if (this.checkIsInSameRoom() && this.checkIsLine() &&
            creeps.some(c => c.pos.isEqualTo(pos) || c.fatigue > 0)) {
            return;
        }

        if (creeps.length == 1) {
            creeps[0].moveTo(pos);
            return;
        }

        const isLine = this.checkIsLine();

        if (creeps[0].pos.isRoomEdge() || isLine) {
            creeps[0].moveTo(pos);
        }

        for (let i = 1; i < creeps.length; i++) {
            if (!creeps[i].pos.isNear(creeps[i - 1].pos)) {
                creeps[i].moveTo(creeps[i - 1]);
                continue;
            }
            if (isLine) {
                creeps[i - 1].pull(creeps[i]);
                creeps[i].move(creeps[i - 1]);
                continue;
            }
        }
    }

    LineMoveToRoom(targetRoom: string, x?: number, y?: number): void {
        const creeps = this.members.arr;
        if (creeps.length == 0) return;

        let pos = new RoomPosition(x || 25, y || 25, targetRoom);
        this.LineMoveTo(pos);
        return;
   
    }

    // 方阵移动
    QuadMove(direction: DirectionConstant): void {
        const creeps = this.members.arr;
        // 存在疲劳的creep则停止
        if (creeps.some(c => c.fatigue > 0)) return;
        creeps.forEach(creep => creep.move(direction));
        return;
    }

    // 方阵移动到目标
    QuadMoveTo(targetPos: RoomPosition): void {
        let creepPos = this.members.arr.map((c: Creep) => c.pos.toGlobal());

        let minX = Math.min(...creepPos.map((p) => p.x));
        let minY = Math.min(...creepPos.map((p) => p.y));

        
    }

    // 方阵移动到目标房间
    QuadMoveToRoom(targetRoom: string, x?: number, y?: number): void {
        
    }





}
