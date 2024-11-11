const harGetContainer = {
    link: function (creep) {
        // 查找未满的 link
        if (creep.room.level < 5) return null;
        if (!creep.room.link) return null; // 如果没有 link，则返回 null
        const source = Game.getObjectById(creep.memory.targetSourceId);
        const link = creep.room.link.find(link => link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && source?.pos.inRangeTo(link, 2));
        return link ?? null;
    },
    container: function (creep) {
        // 查找未满的container
        if (!creep.room.container) return null;
        const source = Game.getObjectById(creep.memory.targetSourceId);
        const container = creep.room.container.find(c => c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && source?.pos.inRangeTo(c, 2));
        return container ?? null;
    }
}

const harvest = function (creep) {
    // 空置时间
    if(creep.memory.Rerunt && Game.time < creep.memory.Rerunt) return;

    // 处理附近的掉落资源
    const handleLinkAndDroppedResources = () => {
        const link = harGetContainer.link(creep);
        if (!link) return false;
        const closestResource = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
            filter: resource => resource.resourceType === RESOURCE_ENERGY
        })[0];
        if (!closestResource) return false;
        creep.pickup(closestResource)
        return true;
    };

    if (handleLinkAndDroppedResources()) return;

    if (!creep.memory.targetSourceId) {
        const closestSource = creep.room.closestSource(creep);
        if (!closestSource) {
            creep.say('无能量源');
            return;
        }
        creep.memory.targetSourceId = closestSource.id;
    }
    // 采集能量逻辑
    const targetSource = Game.getObjectById(creep.memory.targetSourceId);
    if (!targetSource) {
        creep.say('能量源丢失');
        delete creep.memory.targetSourceId;
        return;
    }
    if (targetSource.energy > 0) {
        if (creep.harvest(targetSource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targetSource, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }
    
    // 能量矿耗尽时，将容器能量转移到link
    if(!creep.room.container || !creep.room.link) return;
    const container = creep.room.container.find(c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.pos.inRangeTo(c, 2));;
    const link = harGetContainer.link(creep);
    if (container && link) {
        creep.withdrawOrMoveTo(container, RESOURCE_ENERGY);
        return;
    }
    
    creep.memory.Rerunt = Game.time + targetSource.ticksToRegeneration;
}

const transfer = function (creep) {
    // 存储能量逻辑
    let target = Game.getObjectById(creep.memory.cache.targetId);

    const targets = [];

    const getTarget = () => {
        target = harGetContainer['link'](creep) || harGetContainer['container'](creep);
        if(!target) return null;
        creep.memory.cache.targetId = target.id;
        return target;
    }

    const containerBuild = () => {
        // 6级以上不创建
        if (creep.room.level >= 6) return false;

        // 如果容器已存在，则不创建
        const container = creep.room.container.find(c => creep.pos.inRangeTo(c, 2));
        if (container) return false;
        const link = creep.room.link.find(l => l.pos.inRangeTo(creep.pos, 2)) ?? null;
        if (link) return false;

        // 如果能量源不存在，或是不在能量源附近，则不创建
        const tsid = creep.memory.targetSourceId;
        const targetSource = Game.getObjectById(tsid);
        if (!targetSource || !creep.pos.inRangeTo(targetSource, 1)) return false;

        // 检查是否有建筑工地
        const constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.pos.inRangeTo(creep.pos, 2)
        });

        // 如果有建筑工地，则建造
        if (constructionSite) {
            creep.build(constructionSite);
        }
        // 如果没有建筑工地，则创建
        else {
            creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
        }
        return true;
    }

    const findSpawnExtensions = (targets) => {
        // 没有transport角色，则查找 Spawn、Extension
        const TransportRole = 
        ((global.CreepNum[creep.room.name] && global.CreepNum[creep.room.name]['transport']) || 0) + 
        ((global.CreepNum[creep.room.name] && global.CreepNum[creep.room.name]['carrier']) || 0);
            
        if (targets.length === 0 && TransportRole === 0) {
            const spawnExtensions = (creep.room.spawn?.concat(creep.room.extension) || [])
                .filter(o => o && o.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
            targets.push(...spawnExtensions);
        }
    }

    const findStorageAndTerminal = (targets) => {
        // 如果容器存在，则不查找
        if (targets.length > 0 ||
            creep.room.link.find(l => l.pos.inRangeTo(creep.pos, 2)) ||
            creep.room.container.find(c => c.pos.inRangeTo(creep.pos, 2))) {
            return;
        }

        const { storage, terminal } = creep.room;
        
        [storage, terminal].forEach(structure => {
            if (structure && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                targets.push(structure);
            }
        });
    }

    // 如果容器不存在或已满，重新查找容器
    if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        creep.memory.cache.targetId = null;  // 清除缓存

        target = getTarget();
        if(target) targets.push(target);
        else if(containerBuild()) return;
        else {
            // 如果没有可用的容器
            findSpawnExtensions(targets);
            findStorageAndTerminal(targets);
        }

        // 如果找到合适的容器，保存其ID
        if (targets.length > 0) {
            target = (targets.length === 1) ? targets[0] : creep.pos.findClosestByRange(targets);
            if (target) creep.memory.cache.targetId = target.id;
        }
    }

    // 如果找到目标，进行能量转移
    if (target) {
        // 修复容器
        if ((target.structureType === STRUCTURE_LINK || target.structureType === STRUCTURE_CONTAINER) && target.hits < target.hitsMax) {
            creep.repair(target);
        }
        // 转移资源
        if (target.structureType === STRUCTURE_LINK) {
            creep.transferOrMoveTo(target, RESOURCE_ENERGY);
        } else {
            const resourceType = Object.keys(creep.store)[0];
            creep.transferOrMoveTo(target, resourceType);
        }
    } else {
        // 如果没有其他目标，尝试使用储存设施
        target = creep.room.storage;
        if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            creep.transferOrMoveTo(target, RESOURCE_ENERGY);
        }
    }
}

const HarvesterFunction = {
    prepare: function (creep) {   // 准备阶段
        // 从绑定数量最少的采集点中寻找离Creep最近的
        const targetSource = creep.room.closestSource(creep);
        if (!targetSource) return false;
        creep.memory.targetSourceId = targetSource.id;
        return true;
    },
    source: function (creep) {   // 采集能量
        if (!creep.moveHomeRoom()) return;
        harvest(creep);
        return creep.store.getFreeCapacity() === 0;
    },
    target: function (creep) {   // 转移能量
        if (!creep.moveHomeRoom()) return;
        transfer(creep);
        return creep.store.getUsedCapacity() === 0;
    }
};

export default HarvesterFunction;
