export default class RoomExecute extends Room {
    exec() {
        this.MissionUpdate();    // 更新任务池
        this.StructureWork();    // 处理建筑行为
        this.activeDefense();    // 主动防御处理
        this.autoMarket();       // 自动市场交易
        this.autoBuild();        // 自动建筑
        this.autoLab();          // 自动Lab合成
        this.autoFactory();      // 自动Factory生产
        this.autoPower();        // 自动Power处理
        this.outMine();          // 外矿采集
        
        this.showDefenseCostMatrix(); // 显示防御cost矩阵
    }
}