export default class RoomInit extends Room {
    // 房间初始化
    init() {
        if (!this.my || !Memory['RoomControlData'][this.name]) return;

        if (!Memory['StructControlData'][this.name]) {
            Memory['StructControlData'][this.name] = {
                lab: true,
                factory: true,
                powerSpawn: true,
            } as any;
        }

        // 房间基础工作所需的全局变量
        if (!global.CreepNum) global.CreepNum = {};
        if (!global.SpawnMissionNum) global.SpawnMissionNum = {};

        // 当前房间各类型的creep数量
        global.CreepNum[this.name] = {};
        // 当前房间孵化队列中各类型的creep数量
        global.SpawnMissionNum[this.name] = {};

        this.initMissionPool(); // 初始化任务池
        this.update();  // 初始化建筑缓存
    }
}

