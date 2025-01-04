const RepairRampart = function (creep: Creep) {
    if (creep.memory.cache.buildRampartId) {
        const rampart = Game.getObjectById(creep.memory.cache.buildRampartId) as StructureRampart;
        if (!rampart || rampart.hits >= 2000) {
            delete creep.memory.cache.buildRampartId;
            return false;
        } else {
            creep.repairOrMoveTo(rampart);
            return true;
        }
    }

    if (creep.memory.cache.buildRampart && !creep.memory.cache.task) {
        const match = creep.memory.cache.posInfo.match(/(\d+)\/(\d+)\/(\w+)/);
        if (!match) return false;
        const Pos = new RoomPosition(match[1], match[2], match[3]);
        const rampart = Pos.lookFor(LOOK_STRUCTURES).find((s) => s.structureType == STRUCTURE_RAMPART);
        if (rampart) creep.memory.cache.buildRampartId = rampart.id;
        delete creep.memory.cache.posInfo;
        delete creep.memory.cache.buildRampart;
        return true;
    }
    
    return false;
}

const BuildRepairWorkFunc = function (creep: Creep) {
    let target = null;
    let taskType = null;
    let taskid = null;

    if (RepairRampart(creep)) return true;

    if (!creep.memory.cache.task) {
        const task = creep.room.getBuildMission(creep) || creep.room.getRepairMission(creep);
        if (!task) return false;
        const taskdata = task.data as BuildTask | RepairTask;
        const target = Game.getObjectById(taskdata.target) as any;
        if (task.type == 'build' && target?.structureType == 'rampart') {
            creep.memory.cache.buildRampart = true;
            creep.memory.cache.posInfo = taskdata.pos;
        }
        if (!target || (task.type !== 'build' && target.hits >= (taskdata as RepairTask).hits)){
            creep.room.deleteMissionFromPool(task.type, task.id);
            delete creep.memory.cache.task;
            delete creep.memory.cache.taskid;
            delete creep.memory.cache.tasktype;
            return true;
        }
        creep.memory.cache.task = taskdata;
        creep.memory.cache.taskid = task.id;
        creep.memory.cache.tasktype = task.type;
    }
    
    if (creep.memory.cache.task){
        const taskdata = creep.memory.cache.task;
        target = Game.getObjectById(taskdata.target);
        taskType = creep.memory.cache.tasktype;
        taskid = creep.memory.cache.taskid;
        if(!target || (taskType !== 'build' && target.hits >= taskdata.hits)){
            creep.room.deleteMissionFromPool(taskType, taskid);
            delete creep.memory.cache.task;
            delete creep.memory.cache.taskid;
            delete creep.memory.cache.tasktype;
            return true;
        }
    }

    if (taskType && target){
        if(taskType === 'build'){
            if(Game.time % 10 === 0) creep.say('🏗️');   
            creep.goBuild(target);
            return true;
        }
        if(taskType === 'repair'){
            if(Game.time % 10 === 0) creep.say('🔧');
            creep.goRepair(target);
            return true;
        }
        if(taskType === 'walls'){
            if(Game.time % 10 === 0) creep.say('🔨');
            creep.goRepair(target);
            return true;
        }
    }

    return false;
}

const BuildRepairWork = function (creep: Creep) {
    // 如果有任务执行，则执行后退出
    if (BuildRepairWorkFunc(creep)) return;
    
    // 如果没有任务，则升级控制器
    const controller = creep.room.controller;
    if (!controller || !controller.my) return;
    
    if (creep.pos.inRangeTo(controller, 3)) {
        creep.upgradeController(controller);
    } else {
        creep.moveTo(controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
}

const WorkerAction = {
    prepare: function (creep: Creep) {
        return creep.goBoost(['XLH2O', 'LH2O', 'LH']);
    },
    target: function (creep: Creep) {   // 建造
        if(!creep.memory.ready) return false;
        if(!creep.moveHomeRoom()) return;
        BuildRepairWork(creep);
        if(creep.store.getUsedCapacity() === 0) {
            creep.say('🔄');
            return true;
        } else { return false; }
    },
    source: function (creep: Creep) {   // 获取能量
        if(!creep.memory.ready) return false;
        if(!creep.moveHomeRoom()) return;
        creep.withdrawEnergy();
        if(creep.store.getFreeCapacity() === 0) {
            creep.say('🚧');
            return true;
        } else { return false; }
    }
}


export default WorkerAction