import { sayConstant } from '@/constant/sayConstant';

/**
 * creep 工作模块，具体工作由原型拓展定义
 */
export const creepControl = function (creep: Creep) {
    if (!creep || creep.spawning) return;
    // Creep运行
    creep.run();

    // ----------------------Creep随机说话----------------------------------
    
    if (creep.memory.sayText && creep.memory.sayText.length > 0) {
        const text = creep.memory.sayText.shift();
        if(text) creep.say(text, true);
        return;
    }

    if (Math.random() > 0.007) return;
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