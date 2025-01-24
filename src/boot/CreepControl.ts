/**
 * creep 工作模块，具体工作由原型拓展定义
 */
export const creepControl = function (creep: Creep) {
    if (!creep || creep.spawning) return;
    if (!creep.memory.role) {
        creep.suicide();
        return;
    }

    // Creep工作
    creep.run();

    // Creep随机说话
    // creep.randomSay();
    
}