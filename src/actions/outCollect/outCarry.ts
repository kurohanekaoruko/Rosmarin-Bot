import { compress } from '@/utils';

const outCarryMove = function(creep: Creep, target: any, options: any = {}) {
    if (creep.room.name === target.pos.roomName) {
        options['maxRooms'] = 1;
    }
    options['range'] = 1;
    creep.moveTo(target, options)
}

const outCarry = {
    withdraw: function(creep: Creep) {
        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }
        
        if (creep.memory.cache.targetId) {
            let target = Game.getObjectById(creep.memory.cache.targetId) as any;
            if (!target) {
                delete creep.memory.cache.targetId;
                delete creep.memory.cache.targetType;
                return;
            }

            if (!creep.pos.inRangeTo(target, 1)) {
                outCarryMove(creep, target, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }

            const targetType = creep.memory.cache.targetType;
            if (targetType === 'dropped') {
                creep.pickup(target);
            } else if (targetType === 'container' || targetType === 'ruin' || targetType === 'tombstone') {
                const resourceType = Object.keys(target.store)[0] as ResourceConstant;
                creep.withdraw(target, resourceType);
            }

            if ((targetType === 'dropped' && target.amount === 0) || 
                ((targetType === 'container' || targetType === 'ruin' || targetType === 'tombstone') && target.store.getUsedCapacity() === 0)) {
                delete creep.memory.cache.targetId;
                delete creep.memory.cache.targetType;
                return;
            }

            delete creep.memory.cache.targetId;
            delete creep.memory.cache.targetType;
        }

        let container: StructureContainer;
        const containers = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER &&
                    s.store.getUsedCapacity() > 500 &&
                    Object.values(Memory.creeps).every((m) => 
                        (m.role != 'out-carry' && m.role != 'out-car') ||  m.cache?.targetId !== s.id)
        }) as StructureContainer[];
        // 先找mineral旁边的container
        if (creep.room.mineral) {
            const mineralContainer = containers.find((container) =>
                container.pos.inRangeTo(creep.room.mineral, 2));
            if (mineralContainer) {
                container = mineralContainer;
                creep.memory.cache.targetId = container.id;
                creep.memory.cache.targetType = 'container';
                outCarryMove(creep, container, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }
        }
        // 再找能量container
        container = creep.pos.findClosestByRange(containers||[]);
        if (container) {
            creep.memory.cache.targetId = container.id;
            creep.memory.cache.targetType = 'container';
            outCarryMove(creep, container, { visualizePathStyle: { stroke: '#ffaa00' } });
            return;
        }

        // 再找掉落资源
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, 
            {filter: (resource) => resource.amount > 500});
        if (droppedResources && droppedResources.length > 0) {
            const droppedResource = droppedResources.reduce((a, b) => {
                if (a.resourceType !== RESOURCE_ENERGY && b.resourceType === RESOURCE_ENERGY) return a;
                if (b.resourceType !== RESOURCE_ENERGY && a.resourceType === RESOURCE_ENERGY) return b;
                return a.amount < b.amount ? b : a
            });
            creep.memory.cache.targetId = droppedResource.id;
            creep.memory.cache.targetType = 'dropped';
            outCarryMove(creep, droppedResource, { visualizePathStyle: { stroke: '#ffaa00' } });
            return;
        }
        
        // 最后查找墓碑，优先级最低
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter: (tombstone) => tombstone.store.getUsedCapacity() > 0
        });
        if (tombstones.length > 0) {
            const target = creep.pos.findClosestByRange(tombstones);
            creep.memory.cache.targetId = target.id;
            creep.memory.cache.targetType = 'tombstone';
            outCarryMove(creep, target, { visualizePathStyle: { stroke: '#ffaa00' } });
            return;
        }

        // 检查有没有这两种建筑
        if (creep.room.storage || creep.room.terminal) {
            const storage = creep.room.storage || creep.room.terminal;
            if (storage.store[RESOURCE_ENERGY] > 0) {
                creep.memory.cache.targetId = storage.id;
                creep.memory.cache.targetType = 'container';
                outCarryMove(creep, storage, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }
        }

        // 如果没有可以拿的资源，移动到最近的out-harvest身边，或者out-miner身边
        // 优先miner
        const nearestMiner = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role === 'out-miner'
        });
        if (nearestMiner) {
            if(!creep.pos.inRangeTo(nearestMiner, 1) || nearestMiner.store.getUsedCapacity() > 0) {
                outCarryMove(creep, nearestMiner, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: false });
            }
            return;
        }
        const nearestHarvester = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role === 'out-harvest' && c.pos.findInRange(FIND_SOURCES, 1).length > 0
        });
        if (nearestHarvester) {
            if(!creep.pos.inRangeTo(nearestHarvester, 2) || nearestHarvester.store[RESOURCE_ENERGY] > 0) {
                outCarryMove(creep, nearestHarvester, { visualizePathStyle: { stroke: '#ffaa00' }, ignoreCreeps: false });
            }
            return;
        }

        if (creep.pos.x <= 5 || creep.pos.x >= 45 || creep.pos.y <= 5 || creep.pos.y >= 45) {
            creep.moveTo(25, 25, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    },
    
    carry: function(creep: any) {
        if (creep.room.name != creep.memory.homeRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.homeRoom);
            return;
        }

        let target: StructureContainer | StructureStorage;
    
        if (creep.memory.cache.targetId) {
            target = Game.getObjectById(creep.memory.cache.targetId) as StructureContainer | StructureStorage;
            if (target) {
                if (creep.pos.inRangeTo(target, 1)) {
                    if (target.store.getFreeCapacity(RESOURCE_ENERGY) > 200) {
                        creep.transfer(target, Object.keys(creep.store)[0]);
                    } else {
                        delete creep.memory.cache.targetId;
                    }
                } else {
                    outCarryMove(creep, target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }
            delete creep.memory.cache.targetId;
        }

        if(!target) {
            const targets = [];
            // if (creep.room.container && creep.room.container.length > 0) {
            //     let containers = creep.room.container
            //             .filter((c: any) => c && c.store.getFreeCapacity(RESOURCE_ENERGY) > 500 &&
            //             !c.pos.inRangeTo(creep.room.mineral, 2));
            //     if (creep.room.level < 6 && creep.room.level > 3) {
            //         containers = containers.filter((c: any) =>
            //             c.pos.findInRange(FIND_SOURCES, 1).length > 0);
            //     }
            //     if (containers.length > 0) {
            //         targets.push(...containers);
            //     }
            // }
            if (creep.room.storage && creep.room.storage.store.getFreeCapacity() > 0) {
                targets.push(creep.room.storage);
            }
            if (creep.room.terminal && creep.room.terminal.store.getFreeCapacity() > 0) {
                targets.push(creep.room.terminal);
            }
            target = creep.pos.findClosestByRange(targets);
        }
    
        if (target) {
            creep.memory.cache.targetId = target.id;
            if (creep.pos.inRangeTo(target, 1)) {
                if (target.store.getFreeCapacity() > 0) {
                    creep.transfer(target, Object.keys(creep.store)[0]);
                } else {
                    delete creep.memory.cache.targetId;
                }
            } else {
                outCarryMove(creep, target, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const storage = creep.room.storage;
            const controller = creep.room.controller;
            if (storage) {
                if (creep.pos.inRangeTo(storage, 1)) {
                    creep.drop(Object.keys(creep.store)[0]);
                } else {
                    outCarryMove(creep, storage);
                }
            } else if (controller) {
                if (creep.pos.inRangeTo(controller, 1)) {
                    creep.drop(Object.keys(creep.store)[0]);
                } else {
                    outCarryMove(creep, controller);
                }
            } else {
                creep.drop(Object.keys(creep.store)[0]);
            }
        }
    },

    buildRepair: function(creep) {
        if(creep.room.name == creep.memory.homeRoom) return false;
        if(creep.memory.role !== 'out-car') return false;
        if(creep.store[RESOURCE_ENERGY] == 0) return false;
        const roads = creep.room.road.filter((r: any) => 
            r && r.hits < r.hitsMax * 0.8 && creep.pos.inRange(r, 3));
        if (roads.length > 0) {
            const road = creep.pos.findClosestByRange(roads);
            const result = creep.repair(road)
            if (creep.pos.isRoomEdge()) {
                creep.moveToRoom(creep.room.name);
            }
            if(result == OK) return true;
            if(result == ERR_NOT_IN_RANGE) { creep.moveTo(road); return true; }
        }
        const roadSite = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
        if (roadSite.length > 0) {
            const site = creep.pos.findClosestByRange(roadSite);
            const result = creep.build(site)
            if (creep.pos.isRoomEdge()) {
                creep.moveToRoom(creep.room.name);
            }
            if(result == OK) return true;
            if(result == ERR_NOT_IN_RANGE) { creep.moveTo(site); return true; }
        }
        return false;
    },

    createSite: function(creep: any) {
        if (Game.rooms[creep.memory.homeRoom].controller.level < 4) return;
        
        if (creep.memory.role !== 'out-car') return;
        if (creep.room.name !== creep.memory.targetRoom) return;
        if (!creep.pos.isRoomEdge()) return;
        if (creep.room.memory.road && creep.room.memory.road.length > 0) return;
        creep.room.memory.road = [];
        const Path = [];
        const pos = [];
        const sourcePos = creep.room.find(FIND_SOURCES);
        for (const source of sourcePos) {
            pos.push(source.pos);
        }
        const isCenterRoom = /^[EW]\d*[456][NS]\d*[456]$/.test(creep.room.name);
        if (isCenterRoom) {
            const mineralPos = creep.room.find(FIND_MINERALS)[0];
            if (mineralPos) pos.push(mineralPos.pos);
        }
        const closestPos = creep.pos.findClosestByRange(pos);

        const costs = new PathFinder.CostMatrix();
		const terrain = new Room.Terrain(creep.room.name);
		for (let i = 0; i < 50; i++) {
			for (let j = 0; j < 50; j++) {
				const te = terrain.get(i, j);
				costs.set(i, j, te == TERRAIN_MASK_WALL ? 255 : te == TERRAIN_MASK_SWAMP ? 4 : 2);
			}
		}

        PathFinder.search(
            creep.pos,
            { pos: closestPos, range: 1 },
            {
                roomCallback: () => {
                    return costs;
                },
                maxRooms: 1
            }
        ).path.forEach(pos => {
            costs.set(pos.x,pos.y,1);
            Path.push(pos)
        })

        for (let i = 0; i < pos.length; i++) {
            for (let j = i+1; j < pos.length; j++) {
                PathFinder.search(
                    pos[i],
                    { pos: pos[j], range: 1 },
                    {
                        roomCallback: () => {
                            return costs;
                        },
                        maxRooms: 1
                    }
                ).path.forEach(pos => {
                    costs.set(pos.x,pos.y,1);
                    Path.push(pos)
                })
            }
        }
        
        for (const p of Path) {
            const xy = compress(p.x, p.y);
            if (creep.room.memory.road.includes(xy)) continue;
            creep.room.memory.road.push(xy);
        }
    },

    pheromone: function(creep: Creep) {
        if (creep.room.name == creep.memory.homeRoom) return;
        if (creep.room.controller.level < 4) return;
        if (creep.store.getUsedCapacity() > 0) return;
        if (creep.fatigue == 0) return;
            
        const p = compress(creep.pos.x, creep.pos.y);
        if (!creep.room.memory['pheromone']) creep.room.memory['pheromone'] = {};
        if (!creep.room.memory['pheromone'][p]) creep.room.memory['pheromone'][p] = 0;
        creep.room.memory['pheromone'][p] += 1.0;
    },
    
    target: function(creep: Creep) {
        if (this.buildRepair(creep)) return;
        this.carry(creep);
        this.pheromone(creep);
        creep.memory.dontPullMe = false;
        return creep.store.getUsedCapacity() === 0;
    },
    
    source: function(creep: Creep) {
        if (creep.hits < creep.hitsMax * 0.5 &&
            creep.store.getUsedCapacity() > 0) return true;
        this.withdraw(creep);
        // this.createSite(creep);
        creep.memory.dontPullMe = false;
        return creep.store.getFreeCapacity() === 0;
    }
}

export default outCarry;