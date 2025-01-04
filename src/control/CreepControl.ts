import { RoleData } from '@/constant/CreepConstant';
import { sayConstant } from '@/constant/sayConstant';

/**
 * creep 工作模块，具体工作由原型拓展定义
 */
export const creepControl = function (creep: Creep) {
    if (!creep || creep.spawning) return;
    // Creep运行
    const role = creep.memory.role;
    if(!creep.memory.cache) { creep.memory.cache = {} };
    
    const roledata = RoleData[role]
    if(!roledata) return;

    // 根据状态切换行动
    if(roledata.work) {
        const func = roledata.work;
        if (func.prepare && !creep.memory.ready){
            creep.memory.ready = func.prepare(creep);
        }

        let stateChange = false;
        if (creep.memory.working)
            stateChange = func.target(creep);
        else stateChange = func.source(creep);

        if (stateChange) {
            creep.memory.working = !creep.memory.working;
            creep.memory.cache = {}; // 清空临时缓存
        }
    }
    else if(roledata.mission) {
        roledata.mission.run(creep);
    }
    else if(roledata.action) {
        roledata.action.run(creep);
    }
    else return;

    // --------------------------------------------------------------
    
    // Creep随机说话
    if (creep.memory.sayText && creep.memory.sayText.length > 0) {
        const text = creep.memory.sayText.shift();
        if(text) creep.say(text, true);
        return;
    }

    if (Math.random() > 0.01) return;
    creep.memory.sayText = [];

    let text = null;

    if (creep.room.my) {
        let index = Math.floor(Math.random() * sayConstant.length);
        text = sayConstant[index];
    }
    
    if(!text) return;
    if(typeof text === "string") {
        creep.say(text, true);
    } else {
        text.forEach((t:string) => {
            creep.memory.sayText.push(t)
        })
        creep.memory.sayText.push('');
    }
}