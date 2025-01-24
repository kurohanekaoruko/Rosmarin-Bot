export default class Team {
    name: string;
    type: '2A' | '2D' | 'AD' | '2R' | '4R';
    state: 'ready' | 'idle' | 'active'; // 状态
    direction: '↑' | '←' | '→' | '↓';    // 朝向
    formation: 'line' | 'quad' | string;  // 队形
    targetRoom: string;    // 目标房间
    membersCount: number;           // 成员人数
    members: {
        A1?: Creep,    // 成员-A1
        A2?: Creep,    // 成员-A2
        B1?: Creep,    // 成员-B1
        B2?: Creep,    // 成员-B2
        arr?: Creep[],      // 成员数组
    };
    cache: { [key: string]: any };    // 缓存

    // 构造函数
    constructor(teamData: TeamData) {
        this.name = teamData.name;
        this.type = teamData.type;
        this.state = teamData.state;
        this.direction = teamData.direction;
        this.formation = teamData.formation;
        this.targetRoom = teamData.targetRoom;
        this.cache = teamData.cache;

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
            this.members = undefined;
            return;
        } else if (this.membersCount <= 2) {
            this.formation = 'line'
        }
    }

    // 获取队伍坐标范围
    getPosRange(): { minX: number, maxX: number, minY: number, maxY: number } {
        if (this.membersCount == 0) return undefined;
        let minX = Math.min(...this.members.arr.map((c: Creep) => c.pos.x));
        let maxX = Math.max(...this.members.arr.map((c: Creep) => c.pos.x));
        let minY = Math.min(...this.members.arr.map((c: Creep) => c.pos.y));
        let maxY = Math.max(...this.members.arr.map((c: Creep) => c.pos.y));
        return { minX, maxX, minY, maxY };
    }

    // 检查小队成员位置是否构成方形
    checkIsQuad(): boolean {
        if (this.formation != 'quad') return false;
        if (this.membersCount < 4) return false;

        let { minX, maxX, minY, maxY } = this.getPosRange();

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

    // 队伍是否处于边界
    checkIsOnEdge(): boolean {
        if (this.membersCount == 0) return false;
        return this.members.arr.some((c: Creep) => c.pos.isRoomEdge());
    }

    // 检查队伍是否符合设定的朝向
    checkTeamDirection(): boolean {
        if (this.membersCount == 0) return false;
        if (!this.checkIsQuad()) return false;

        const { minX, maxX, minY, maxY } = this.getPosRange();
        let { A1, A2, B1, B2 } = this.members;

        switch (this.direction) {
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

    // 由线性队形转为方阵队形
    LineToQuad() {
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
    gather(pos?: RoomPosition) {
        if (this.formation == 'line') {
            if (!pos) pos = this.members.arr[0].pos;
            this.LineMoveTo(pos);
            return;
        }
        if (this.formation == 'quad') {
            if (!pos) pos = this.members.arr[0].pos;
            let { A1, A2, B1, B2 } = this.members;
            if (A1) A1.moveTo(pos);
            if (A2) A2.moveTo(new RoomPosition(pos.x + 1, pos.y, pos.roomName));
            if (B1) B1.moveTo(new RoomPosition(pos.x, pos.y + 1, pos.roomName));
            if (B2) B2.moveTo(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
        }
    }

    // 线性队形移动到目标
    LineMoveTo(pos: RoomPosition) {
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
        if (creeps[0].pos.isRoomEdge() ||
            creeps[0].pos.isNearTo(creeps[1])) {
            creeps[0].moveTo(pos);
        }
        for (let i = 1; i < creeps.length; i++) {
            if (i < creeps.length - 1 &&
                !creeps[i].pos.isRoomEdge() &&
                !creeps[i].pos.isNearTo(creeps[i + 1])
            ) continue;

            if (creeps[i].pos.isNear(creeps[i - 1].pos)) {
                creeps[i - 1].pull(creeps[i]);
                creeps[i].move(creeps[i - 1]);
            } else {
                creeps[i].moveTo(creeps[i - 1]);
            }
        }
    }

    // 方阵移动
    QuadMove(direction: DirectionConstant) {
        const creeps = this.members.arr;
        // 存在疲劳的creep则停止
        if (creeps.some(c => c.fatigue > 0)) return;
        creeps.forEach(creep => creep.move(direction));
        return;
    }








}