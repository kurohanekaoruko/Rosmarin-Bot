import { compress } from '@/utils';

// 发布建造维修任务
function UpdateBuildRepairMission(room: Room) {
    // 查找所有受损的结构
    const allStructures = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });

    const NORMAL_STRUCTURE_THRESHOLD = 0.8;     // 普通修复建筑耐久度阈值
    const URGENT_STRUCTURE_THRESHOLD = 0.1;     // 紧急修复建筑耐久度阈值
    const NORMAL_WALL_HITS = room.level < 7 ? 300e3 : 1e6;               // 普通修复墙耐久度
    const URGENT_WALL_HITS = 3000;              // 紧急修复墙耐久度

    // 维修优先级：紧急维修-建筑 > 紧急维修-墙 > 常规维修-建筑 > 常规维修-墙
    for (const structure of allStructures) {
        const { hitsMax, structureType, hits, id, pos } = structure;
        const posInfo = `${pos.x}/${pos.y}/${pos.roomName}`
        if (structureType !== STRUCTURE_WALL && structureType !== STRUCTURE_RAMPART) {
            // 处理建筑
            // 紧急维修
            if (hits < hitsMax * URGENT_STRUCTURE_THRESHOLD) {
                const data = {target: id, pos: posInfo, hits: hitsMax * URGENT_STRUCTURE_THRESHOLD};
                room.BuildRepairMissionAdd('repair', 1, data)
                continue;
            }

            // 常规维修
            if (hits < hitsMax * NORMAL_STRUCTURE_THRESHOLD) {
                const data = {target: id, pos: posInfo, hits: hitsMax * NORMAL_STRUCTURE_THRESHOLD};
                room.BuildRepairMissionAdd('repair', 3, data)
                continue;
            }
        } else {
            // 处理墙和城墙
            if (hits < URGENT_WALL_HITS) {          // 紧急维修
                const data = {target: id, pos: posInfo, hits: URGENT_WALL_HITS};
                room.BuildRepairMissionAdd('repair', 2, data)
                continue;
            }
            if (hits < NORMAL_WALL_HITS) {   // 常规维修
                const data = {target: id, pos: posInfo, hits: NORMAL_WALL_HITS};
                room.BuildRepairMissionAdd('repair', 4, data)
                continue;
            }
        }
    }

    // 建造任务
    const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
    const terrain = room.getTerrain();
    for(const site of constructionSites) {
        const posInfo = `${site.pos.x}/${site.pos.y}/${site.pos.roomName}`
        const data = {target: site.id, pos: posInfo};
        let level = Math.floor((1 - site.progress / site.progressTotal) * 5);
        if (site.structureType === STRUCTURE_TERMINAL ||
            site.structureType === STRUCTURE_STORAGE ||
            site.structureType === STRUCTURE_SPAWN) {
            level = 0;
        } else if (site.structureType === STRUCTURE_ROAD && 
            terrain.get(site.pos.x, site.pos.y) == TERRAIN_MASK_SWAMP) {
            level = 0;
        } else if (site.structureType === STRUCTURE_EXTENSION ||
            site.structureType === STRUCTURE_LINK ||
            site.structureType === STRUCTURE_TOWER) {
            level += 5;
        } else {
            level += 10;
        }
        room.BuildRepairMissionAdd('build', level, data)
    }
}

// 刷墙任务
function UpdateWallRepairMission(room: Room) {
    let WALL_HITS_MAX_THRESHOLD = 0.5;        // 墙最大耐久度阈值
    const botMem = Memory['StructControlData'][room.name];
    if (botMem['ram_threshold']) {
        WALL_HITS_MAX_THRESHOLD = Math.min(botMem['ram_threshold'], 1);
    }
    const memory = Memory['LayoutData'][room.name] as { [key: string]: number[]} || {};
    let wallMem = memory['constructedWall'] || [];
    let rampartMem = memory['rampart'] || [];
    let structRampart = [];
    for (let s of ['spawn', 'tower', 'storage', 'terminal', 'factory', 'lab', 'nuker', 'powerSpawn']) {
        if (memory[s]) {
            structRampart.push(...(memory[s] || []));
        } else {
            if (Array.isArray(room[s])) {
                const poss = room[s].map((s) => compress(s.pos.x, s.pos.y));
                structRampart.push(...poss);
            } else if (room[s]) {
                structRampart.push(compress(room[s].pos.x, room[s].pos.y));
            }
        }
    }
    rampartMem = [...new Set(rampartMem.concat(structRampart))];
    const ramwalls = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax &&
        (structure.structureType === STRUCTURE_WALL && wallMem.includes(compress(structure.pos.x,structure.pos.y)) ||
        (structure.structureType === STRUCTURE_RAMPART && rampartMem.includes(compress(structure.pos.x,structure.pos.y))))
    });
    
    const roomNukes = room.find(FIND_NUKES) || [];
    for(const structure of ramwalls) {
        const { hitsMax, hits, id, pos } = structure;
        const posInfo = `${pos.x}/${pos.y}/${pos.roomName}`
        if (roomNukes.length > 0) {
            // 计算附近核弹的伤害
            const areaNukeDamage = roomNukes.filter((n) => pos.inRangeTo(n.pos, 2))
            .reduce((hits, nuke) => pos.isEqualTo(nuke.pos) ? hits + 1e7 : hits + 5e6, 0);
            // 防核维修
            if (hits < areaNukeDamage + 1e6) {
                const data = {target: id, pos: posInfo, hits: areaNukeDamage + 1e6};
                room.BuildRepairMissionAdd('walls', 0, data)
                continue;
            }
        }
        // 刷墙维修
        if(hits < hitsMax * WALL_HITS_MAX_THRESHOLD) {
            const level = Math.floor(hits / hitsMax * 100) + 1; // 优先级
            const targetHits = level / 100 * hitsMax;
            const data = {target: id, pos: posInfo, hits: targetHits};
            room.BuildRepairMissionAdd('walls', level, data);
            continue;
        }
    }

}

// 检查任务是否有效
function BuildRepairMissionCheck(room: Room) {
    const checkFunc = (task: Task) => {
        const {target, hits} = task.data;
        const structure = Game.getObjectById(target) as Structure | null;
        if(!structure) return false;
        if ((task.type === 'repair' || task.type === 'walls') &&
            structure.hits >= hits) return false;
        return true;
    }

    room.checkMissionPool('build', checkFunc);
    room.checkMissionPool('repair', checkFunc);
    room.checkMissionPool('walls', checkFunc);
}

export { UpdateBuildRepairMission, UpdateWallRepairMission, BuildRepairMissionCheck }