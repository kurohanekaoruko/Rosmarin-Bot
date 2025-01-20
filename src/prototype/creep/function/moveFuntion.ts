

export default class MoveFunction extends Creep {
    moveToRoom(roomName: string, options = {}) {
        if (this.fatigue > 0) return ERR_TIRED;

        options['range'] = 3;
        let lastTargetPos = null;

        if (this.room.name === roomName) {
            lastTargetPos = this.room.controller?.pos || new RoomPosition(25, 25, roomName);
            this.memory.lastTargetPos = lastTargetPos;
            options['ignoreCreeps'] = false;
            return this.moveTo(lastTargetPos, options);
        }

        if (this.memory.lastTargetPos &&
            this.memory.lastTargetPos.roomName === roomName) {
            lastTargetPos = this.memory.lastTargetPos;
        } else {
            const centerX = 25;
            const centerY = 25;
            const range = 10;
            const randomX = Math.floor(Math.random() * (range * 2 + 1)) + (centerX - range);
            const randomY = Math.floor(Math.random() * (range * 2 + 1)) + (centerY - range);
            lastTargetPos = { x: randomX, y: randomY, roomName }
            this.memory.lastTargetPos = lastTargetPos;
        }

        const target = new RoomPosition(lastTargetPos.x, lastTargetPos.y, roomName);

        return this.moveTo(target, options);

        // if (!this.memory['cachePath']) {
        //     let costs = new PathFinder.CostMatrix();

        //     let path = PathFinder.search(
        //         this.pos,
        //         { pos: target, range: 1 },
        //         {}
        //     ).path;

        //     this.memory['cachePath'] = path.map((pos: RoomPosition) => `${pos.x}/${pos.y}/${pos.roomName}`);
        //     this.move(getDirection(this.pos, path[0]));
        // } else {
        //     let strPos = this.memory['cachePath'][0];
        //     let pos = strPos.split('/');
        //     pos[0] = parseInt(pos[0]); pos[1] = parseInt(pos[1]);
        //     if (this.pos.x === pos[0] && this.pos.y === pos[1]) {
        //         this.memory['cachePath'].shift();
        //     }
        //     if (this.memory['cachePath'].length === 0) {
        //         delete this.memory['cachePath'];
        //         return;
        //     }
        //     strPos = this.memory['cachePath'][0];
        //     pos = strPos.split('/');
        //     pos[0] = parseInt(pos[0]); pos[1] = parseInt(pos[1]);
        //     if (!this.pos.isNearTo(new RoomPosition(pos[0], pos[1], pos[2]))) {
        //         delete this.memory['cachePath'];
        //         return;
        //     }
        //     return this.move(getDirection(this.pos, new RoomPosition(pos[0], pos[1], pos[2])));
        // }
    }

    // 移动到所属房间
    moveHomeRoom(): boolean {
        if(!this.memory.home) { return true; }
        if(this.room.name === this.memory.home) { return true; }
        this.moveToRoom(this.memory.home, { visualizePathStyle: { stroke: '#ff0000' } });
        return false;
    }
}