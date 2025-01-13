/**
 * 任务获取模块
 */
export default class MissionGet extends Room {
    // 获取运输任务
    getTransportMission(creep: Creep) {
        if(!this.checkMissionInPool('transport')) return null;

        const posInfo = `${creep.pos.x}/${creep.pos.y}/${creep.pos.roomName}`
        const task = this.getMissionFromPool('transport', posInfo);
        if(!task) return null;

        const source = Game.getObjectById(task.data.source) as any;
        const target = Game.getObjectById(task.data.target) as any;
        const resourceType = task.data.resourceType;
        const amount = task.data.amount;
        // 任务无效则删除, 重新获取
        if(!source || !target || !resourceType || !amount ||
            source.store[resourceType] == 0 ||
            target.store.getFreeCapacity(resourceType) == 0) {
            this.deleteMissionFromPool('transport',task.id);
            return this.getTransportMission(creep);
        }

        this.lockMissionInPool('transport', task.id, creep.id);

        return task;
    }
    // 获取建造任务
    getBuildMission(creep: Creep) {
        const posInfo = `${creep.pos.x}/${creep.pos.y}/${creep.pos.roomName}`

        if(this.checkMissionInPool('build')){
            const task = this.getMissionFromPool('build', posInfo);
            if(!task) return null;

            return task;
        }
        
        return null;
    }
    // 获取维修任务
    getRepairMission(creep: Creep) {
        const posInfo = `${creep.pos.x}/${creep.pos.y}/${creep.pos.roomName}`

        if(this.checkMissionInPool('repair')){
            const task = this.getMissionFromPool('repair', posInfo);
            if(!task) return null;

            return task;
        }

        if(this.checkMissionInPool('walls')){
            if (this[RESOURCE_ENERGY] < 50000) return null;
            const task = this.getMissionFromPool('walls', posInfo);
            if(!task) return null;

            return task;
        }

        return null;
    }
    // 获取发送任务
    getSendMission() {
        const terminal = this.terminal;
        const checkFunc = (task: Task) => {
            const data = task.data as SendTask;
            const resourceType = data.resourceType;
            return terminal.store[resourceType] >= Math.min(data.amount, 1000);
        }
        const task = this.getMissionFromPoolFirst('send', checkFunc);
        if(!task) return null;
        return task;
    }
    // 获取发送任务总共发送量
    getSendMissionTotalAmount() {
        const tasks = this.getAllMissionFromPool('send');
        const sends = {};
        for(const task of tasks) {
            const data = task.data as SendTask;
            const resTotalAmount = (this.terminal?.store[data.resourceType] || 0) + (this.storage?.store[data.resourceType] || 0);
            if(resTotalAmount < Math.min(data.amount, 10000)) {
                this.deleteMissionFromPool('send', task.id);
                continue;
            }
            sends[data.resourceType] = data.amount + (sends[data.resourceType] || 0);
        }
        return sends;
    }
    // 获取孵化任务
    getSpawnMission() {
        const energyAvailable = this.energyAvailable;
        const filter = (task: Task) => {
            const data = task.data as SpawnTask;
            return (energyAvailable||0) >= (data.energy||0);
        }
        const task = this.getMissionFromPool('spawn', null, filter);
        if(!task) return null;
        return task;
    }

    // 获取每种role的孵化数量
    getSpawnMissionAmount() {
        const tasks = this.getAllMissionFromPool('spawn');
        const spawnAmount = {};
        for(const task of tasks) {
            const data = task.data as SpawnTask;
            const role = data.memory.role;
            if (!spawnAmount[role]) spawnAmount[role] = 0;
            spawnAmount[role]++;
        }
        return spawnAmount;
    }

    // 获取指定一些role的总孵化数
    getSpawnMissionTotalByRoles(roles: string[]) {
        const tasks = this.getAllMissionFromPool('spawn');
        let num = 0;
        for(const task of tasks) {
            const data = task.data as SpawnTask;
            const role = data.memory.role;
            if(roles.includes(role)) num++;
        }
        return num;
    }
}