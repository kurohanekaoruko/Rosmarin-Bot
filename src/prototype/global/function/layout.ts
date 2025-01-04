import { compress, compressBatch, decompressBatch } from '@/utils';
import autoPlanner63 from '@/modules/planner/dynamic/autoPlanner63'
import HelperVisual from '@/modules/planner/helperVisual'

export default {
    layout: {
        // 设置房间布局
        set(roomName: string, layout: string, x: number, y: number) {
            const room = Game.rooms[roomName];
            const BotMemRooms = Memory['RoomControlData'];
            if (!room || !room.my || !BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 不存在、未拥有或未添加。`);
            }
            if (!layout) {
                BotMemRooms[roomName]['layout'] = '';
                delete BotMemRooms[roomName]['center'];
                global.log(`已清除 ${roomName} 的布局设置。`);
                return OK;
            }
            if (!x || !y) {
                return Error(`需要输入正确的布局中心坐标。`);
            }
            BotMemRooms[roomName]['layout'] = layout;
            BotMemRooms[roomName]['center'] = { x, y };
            global.log(`已设置 ${roomName} 的布局为 ${layout}, 布局中心为 (${x},${y})`);
            return OK;
        },
        // 开关自动建筑
        auto(roomName: string) {
            const room = Game.rooms[roomName];
            const BotMemRooms = Memory['RoomControlData'];
            if (!room || !room.my || !BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 不存在、未拥有或未添加。`);
            }
            const layout = BotMemRooms[roomName]['layout'];
            if (!layout) {
                return Error(`房间 ${roomName} 未设置布局。`);
            }
            const center = BotMemRooms[roomName]['center'];
            if (layout && !center) {
                return Error(`房间  ${roomName} 未设置布局中心。`);
            }
            const memory = BotMemRooms[roomName];
            memory.autobuild = !memory.autobuild;
            global.log(`已${memory.autobuild ? '开启' : '关闭'} ${roomName} 的自动建筑.`);
            return OK;
        },
        // 清除房间布局memory
        remove(roomName: string) {
            delete Memory['LayoutData'][roomName];
            global.log(`已清除 ${roomName} 的布局memory。`);
            return OK;
        },
        // 构建布局
        build(roomName: string) {
            const BotMemRooms = Memory['RoomControlData'];
            if (!BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 未添加到控制列表。`);
            }
            const layoutMemory = Memory['LayoutData'][roomName];
            if (layoutMemory && Object.keys(layoutMemory).length) {
                return Error(`房间 ${roomName} 的布局memory已存在，请先使用 layout.remove(roomName) 清除。`);
            }
            const layoutType = BotMemRooms[roomName]['layout'];

            // 如果没有设置布局就会使用自动布局
            if (!layoutType || layoutType == '63') {
                return BuildDynamicPlanner_63(roomName);
            } else {
                return BuildStaticPlanner(roomName, layoutType);
            }
        },
        // 查看布局可视化
        visual(roomName?: string, layout?: string) {
            let cpu = Game.cpu.getUsed();
            if (roomName && layout) {
                if (layout == '63') {
                    VisualDynamicPlanner_63(roomName);
                } else {
                    VisualStaticPlanner(roomName, layout);
                }
            } else if (roomName) {
                const layoutMemory = Memory['LayoutData'][roomName];
                if (!layoutMemory || Object.keys(layoutMemory).length == 0) {
                    console.log(`房间 ${roomName} 的布局memory不存在，将根据自动布局可视化...`)
                    VisualDynamicPlanner_63(roomName);
                } else {
                    console.log(`将根据房间${roomName}的布局memory进行可视化...`)
                    const structMap = {};
                    for (const s in layoutMemory) {
                        structMap[s] = decompressBatch(layoutMemory[s]);
                    }
                    HelperVisual.showRoomStructures(roomName, structMap);
                }
            } else {
                VisualDynamicPlanner_63();
            }
            cpu = Game.cpu.getUsed() - cpu;
            console.log(`可视化完成，消耗CPU ${cpu.toFixed(2)}。`)
            return OK;
        },
        // 将房间建筑加入布局memory
        save(roomName: string) {
            const BotMemRooms = Memory['RoomControlData'];
            if (!BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 未添加到控制列表。`);
            }
            let layoutMemory = Memory['LayoutData'][roomName];
            if (layoutMemory && Object.keys(layoutMemory).length) {
                return Error(`房间 ${roomName} 的布局memory已存在，请先使用 layout.remove(roomName) 清除。`);
            }
            Memory['LayoutData'][roomName] = {};
            layoutMemory = Memory['LayoutData'][roomName];
            const room = Game.rooms[roomName];
            const structList = ['spawn', 'extension', 'link', 'tower', 'road', 'storage', 'terminal', 'factory', 'lab',
                'nuker', 'observer', 'powerSpawn', 'container', 'extractor'];
            for (const s of structList) {
                const PosList = [];
                const structs = room.find(FIND_STRUCTURES, { filter: (stru) => stru.structureType == s });
                for (const struct of structs) {
                    PosList.push(compress(struct.pos.x, struct.pos.y));
                }
                layoutMemory[s] = PosList;
            }
            return OK;
        },
        // 查看rampart最小血量, 只考虑布局中的
        ramhits(roomName: string) {
            const layoutMemory = Memory['LayoutData'][roomName];
            if (!layoutMemory) {
                return Error(`房间 ${roomName} 的布局memory不存在。`);
            }
            if (Object.keys(layoutMemory).length == 0) {
                return Error(`房间 ${roomName} 的布局memory为空。`);
            }
            let rampartMem = layoutMemory['rampart'] || [];
            let structRampart = [];
            for (let s of ['spawn', 'tower', 'storage', 'terminal', 'factory', 'lab', 'nuker', 'powerSpawn']) {
                structRampart.push(...(layoutMemory[s] || []));
            }
            rampartMem = [...new Set(rampartMem.concat(structRampart))];
            let ramparts = Game.rooms[roomName].rampart.filter((r) => rampartMem.includes(compress(r.pos.x, r.pos.y)));
            let minRampart = ramparts.reduce((r, c) => r.hits < c.hits ? r : c);
            let maxRampart = ramparts.reduce((r, c) => r.hits > c.hits ? r : c);
            let minHits = '', maxHits = '';
            if (minRampart.hits < 1e6) {
                minHits = (minRampart.hits / 1000).toFixed(2) + 'K';
            } else {
                minHits = (minRampart.hits / 1e6).toFixed(2) + 'M';
            }
            if (maxRampart.hits < 1e6) {
                maxHits = (maxRampart.hits / 1000).toFixed(2) + 'K';
            } else {
                maxHits = (maxRampart.hits / 1e6).toFixed(2) + 'M';
            }
            return  `[Min] ${minHits}  (${minRampart.pos.x}, ${minRampart.pos.y})\n`+
                    `[Max] ${maxHits}  (${maxRampart.pos.x}, ${maxRampart.pos.y})`;
        },
        // 从布局memory添加或删除所选rampart
        rampart(roomName: string, operate = 1) {
            const flag = Game.flags['layout-rampart'];
            if (!flag) {
                console.log('未找到`layout-rampart`旗帜标记');
                return -1;
            }
            const rampart = []
            if (flag.pos.lookFor(LOOK_STRUCTURES).filter((s) => s.structureType === STRUCTURE_RAMPART).length > 0) {
                rampart.push(compress(flag.pos.x, flag.pos.y));
                const queue = [[flag.pos.x, flag.pos.y]];
                const done = {}
                while (queue.length > 0) {
                    const pos = queue.shift();
                    const x = pos[0];
                    const y = pos[1];
                    if (x < 0 || x > 49 || y < 0 || y > 49) continue;
                    const xy = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                    for (const p of xy) {
                        const px = p[0];
                        const py = p[1];
                        if (px < 0 || px > 49 || py < 0 || py > 49) continue;
                        const pos1 = new RoomPosition(px, py, flag.pos.roomName);
                        if (!done[compress(px, py)] &&
                            pos1.lookFor(LOOK_STRUCTURES)
                                .filter((s) => s.structureType === STRUCTURE_RAMPART).length > 0) {
                            rampart.push(compress(pos1.x, pos1.y));
                            queue.push([px, py]);
                        }
                    }
                    done[compress(x, y)] = true;
                }
            } else {
                console.log('`layout-rampart`旗帜没有放置到rampart上');
                return -1;
            }
            flag.remove();
            let count = 0;
            if (operate === 1) {
                const memory = Memory['LayoutData'][roomName];
                if (!memory.rampart) memory.rampart = [];
                for (const ram of rampart) {
                    if (!memory.rampart.includes(ram)) {
                        memory.rampart.push(ram);
                        count++;
                    }
                }
                console.log(`已添加${count}个rampart到布局memory`);
                return OK;
            }
            else {
                const memory = Memory['LayoutData'][roomName];
                for (const ram of rampart) {
                    if (memory.rampart.includes(ram)) {
                        memory.rampart.splice(memory.rampart.indexOf(ram), 1);
                        count++;
                    }
                }
                console.log(`已从布局memory删除${count}个rampart`);
                return OK;
            }
        },
        wall(roomName: string, operate = 1) {
            const flag = Game.flags['layout-wall'];
            if (!flag) {
                console.log('未找到`layout-wall`旗帜标记');
                return -1;
            }
            const constructedWall = []
            if (flag.pos.lookFor(LOOK_STRUCTURES).filter((s) => s.structureType === STRUCTURE_WALL).length > 0) {
                constructedWall.push(compress(flag.pos.x, flag.pos.y));
                const queue = [[flag.pos.x, flag.pos.y]];
                const done = {}
                while (queue.length > 0) {
                    const pos = queue.shift();
                    const x = pos[0];
                    const y = pos[1];
                    if (x < 0 || x > 49 || y < 0 || y > 49) continue;
                    const xy = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                    for (const p of xy) {
                        const px = p[0];
                        const py = p[1];
                        if (px < 0 || px > 49 || py < 0 || py > 49) continue;
                        const pos1 = new RoomPosition(px, py, flag.pos.roomName);
                        if (!done[compress(px, py)] &&
                            pos1.lookFor(LOOK_STRUCTURES)
                                .filter((s) => s.structureType === STRUCTURE_WALL).length > 0) {
                            constructedWall.push(compress(pos1.x, pos1.y));
                            queue.push([px, py]);
                        }
                    }
                    done[compress(x, y)] = true;
                }
            } else {
                console.log('`layout-wall`旗帜没有放置到wall上');
                return -1;
            }
            flag.remove();
            let count = 0;
            if (operate === 1) {
                const memory = Memory['LayoutData'][roomName];
                if (!memory.constructedWall) memory.constructedWall = [];
                for (const wall of constructedWall) {
                    if (!memory.constructedWall.includes(wall)) {
                        memory.constructedWall.push(wall);
                        count++;
                    }
                }
                console.log(`已添加${count}个wall到布局memory`);
                return OK;
            }
            else {
                const memory = Memory['LayoutData'][roomName];
                for (const wall of constructedWall) {
                    if (memory.constructedWall.includes(wall)) {
                        memory.constructedWall.splice(memory.constructedWall.indexOf(wall), 1);
                        count++;
                    }
                }
                console.log(`已从布局memory删除${count}个wall`);
                return OK;
            }
        },
        ramwall(roomName: string, operate = 1) {
            const flag = Game.flags['layout-ramwall'];
            if (!flag) {
                console.log('未找到`layout-ramwall`旗帜标记');
                return -1;
            }
            const rampart = []
            const constructedWall = []
            const queue = []
            if (flag.pos.lookFor(LOOK_STRUCTURES).every((s) =>
                s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART)) {
                console.log('`layout-ramwall`旗帜没有放置到wall或rampart上');
                return -1;
            }
            else if (flag.pos.lookFor(LOOK_STRUCTURES).some((s) => s.structureType === STRUCTURE_WALL)) {
                constructedWall.push(compress(flag.pos.x, flag.pos.y));
                queue.push([flag.pos.x, flag.pos.y]);
            }
            else if (flag.pos.lookFor(LOOK_STRUCTURES).some((s) => s.structureType === STRUCTURE_RAMPART)) {
                rampart.push(compress(flag.pos.x, flag.pos.y));
                queue.push([flag.pos.x, flag.pos.y]);
            }
            const done = {}
            while (queue.length > 0) {
                const pos = queue.shift();
                const x = pos[0];
                const y = pos[1];
                if (x < 0 || x > 49 || y < 0 || y > 49) continue;
                const xy = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                for (const p of xy) {
                    const px = p[0];
                    const py = p[1];
                    if (px < 0 || px > 49 || py < 0 || py > 49) continue;
                    const pos1 = new RoomPosition(px, py, flag.pos.roomName);
                    if (!done[compress(px, py)] &&
                        pos1.lookFor(LOOK_STRUCTURES)
                            .some((s) => s.structureType === STRUCTURE_WALL)) {
                        constructedWall.push(compress(pos1.x, pos1.y));
                        queue.push([px, py]);
                    } else if (!done[compress(px, py)] &&
                        pos1.lookFor(LOOK_STRUCTURES)
                            .some((s) => s.structureType === STRUCTURE_RAMPART)) {
                        rampart.push(compress(pos1.x, pos1.y));
                        queue.push([px, py]);
                    }
                }
                done[compress(x, y)] = true;
            }

            flag.remove();
            let wallcount = 0;
            let rampartcount = 0;
            if (operate === 1) {
                const memory = Memory['LayoutData'][roomName];
                if (!memory.constructedWall) memory.constructedWall = [];
                for (const wall of constructedWall) {
                    if (!memory.constructedWall.includes(wall)) {
                        memory.constructedWall.push(wall);
                        wallcount++;
                    }
                }
                if (!memory.rampart) memory.rampart = [];
                for (const ramp of rampart) {
                    if (!memory.rampart.includes(ramp)) {
                        memory.rampart.push(ramp);
                        rampartcount++;
                    }
                }
                console.log(`已添加${wallcount}个wall和${rampartcount}个rampart到布局memory`);
                return OK;
            }
            else {
                const memory = Memory['LayoutData'][roomName];
                for (const wall of constructedWall) {
                    if (memory.constructedWall.includes(wall)) {
                        memory.constructedWall.splice(memory.constructedWall.indexOf(wall), 1);
                        wallcount++;
                    }
                }
                for (const ramp of rampart) {
                    if (memory.rampart.includes(ramp)) {
                        memory.rampart.splice(memory.rampart.indexOf(ramp), 1);
                        rampartcount++;
                    }
                }
                console.log(`已从布局memory删除${wallcount}个wall和${rampartcount}个rampart`);
                return OK;
            }
        },
        ramarea(roomName: string, operate = 1) {
            const flagA = Game.flags['layout-ramA'];
            const flagB = Game.flags['layout-ramB'];
            if (!flagA || !flagB) {
                console.log('未找到flag');
                return ERR_INVALID_ARGS;
            }
            const room = Game.rooms[roomName];
            if (!room) return ERR_INVALID_ARGS;
            const minX = Math.min(flagA.pos.x, flagB.pos.x);
            const maxX = Math.max(flagA.pos.x, flagB.pos.x);
            const minY = Math.min(flagA.pos.y, flagB.pos.y);
            const maxY = Math.max(flagA.pos.y, flagB.pos.y);
            const rampart = room.lookForAtArea(LOOK_STRUCTURES, minY, minX, maxY, maxX, true)
                                .filter((s) => s.structure.structureType === STRUCTURE_RAMPART)
                                .map((s) => compress(s.x, s.y));
            let rampartcount = 0;
            if (operate === 1) {
                const memory = Memory['LayoutData'][roomName];
                if (!memory.rampart) memory.rampart = [];
                for (const ramp of rampart) {
                    if (!memory.rampart.includes(ramp)) {
                        memory.rampart.push(ramp);
                        rampartcount++;
                    }
                }
                console.log(`已添加${rampartcount}个rampart到布局memory`);
            } else {
                const memory = Memory['LayoutData'][roomName];
                if (!memory.rampart) memory.rampart = [];
                for (const ramp of rampart) {
                    if (memory.rampart.includes(ramp)) {
                        memory.rampart.splice(memory.rampart.indexOf(ramp), 1);
                        rampartcount++;
                    }
                }
                console.log(`已从布局memory删除${rampartcount}个rampart`);
            }
            flagA.remove();
            flagB.remove();
            return OK;
        }
    }
}

import ros from "@/modules/planner/static/ros"
import tea from '@/modules/planner/static/tea';
import hoho from '@/modules/planner/static/hoho';


// 构建静态布局
const BuildStaticPlanner = function (roomName: string, layoutType: string) {
    let data: any;
    if (layoutType === 'ros') {
        data = ros;
    } else if (layoutType === 'tea') {
        data = tea;
    } else if (layoutType === 'hoho') {
        data = hoho;
    } else {
        console.log(`不支持的布局类型: ${layoutType}`);
        return;
    }

    const BotMemRooms = Memory['RoomControlData'];
    let center = BotMemRooms[roomName]?.center;
    if (!center) {
        let Pos = Game.flags['centerPos'] || Game.flags['layout-center'] || Game.flags['storagePos'];
        if (Pos && Pos.pos.roomName === roomName) {
            center = { x: Pos.pos.x, y: Pos.pos.y };
        } else {
            console.log(`未设置布局中心.`);
            return;
        }
    }
    Memory['LayoutData'][roomName] = {};
    const layoutMemory = Memory['LayoutData'][roomName];
    const terrain = new Room.Terrain(roomName);

    for (const s in data.buildings) {
        if (!layoutMemory[s]) layoutMemory[s] = [];
        const poss = data.buildings[s].pos;
        for (const pos of poss) {
            const x = pos.x - 25 + center.x;
            const y = pos.y - 25 + center.y;
            try {
                if (terrain.get(x, y) == TERRAIN_MASK_WALL) continue;
                layoutMemory[s].push(compress(x, y));
            } catch (error) {
                console.log(`${s} ${x} ${y} 布局错误: ${error}`);
                throw error;
            }
        }
    }

    if (!layoutMemory['rampart']) layoutMemory['rampart'] = [];
    for (let i = center.x - 9; i < center.x + 10; i++) {
        for (let j = center.y - 9; j < center.y + 10; j++) {
            if([0, 1, 48, 49].includes(i)) continue;
            if([0, 1, 48, 49].includes(j)) continue;
            if (terrain.get(i, j) == TERRAIN_MASK_WALL) continue;
            if (Math.abs(i - center.x) == 9 || Math.abs(j - center.y) == 9) {
                layoutMemory['rampart'].push(compress(i, j));
            }
        }
    }
    console.log(`已构建${roomName}的${layoutType}静态布局`);

    return OK;
}

const VisualStaticPlanner = function (roomName: string, layoutType: string) {
    let data: any;
    if (layoutType === 'ros') {
        data = ros;
    } else if (layoutType === 'tea') {
        data = tea;
    } else if (layoutType === 'hoho') {
        data = hoho;
    } else {
        console.log(`不支持的布局类型: ${layoutType}`);
        return;
    }

    const BotMemRooms = Memory['RoomControlData'];
    let center = BotMemRooms[roomName]?.center;
    if (!center) {
        let Pos = Game.flags['centerPos'] || Game.flags['layout-center'] || Game.flags['storagePos'];
        if (Pos && Pos.pos.roomName === roomName) {
            center = { x: Pos.pos.x, y: Pos.pos.y };
        } else {
            console.log(`未设置布局中心.`);
            return;
        }
    }

    const terrain = new Room.Terrain(roomName);
    let structMap = {
        spawn: [],
        extension: [],
        link: [],
        road: [],
        constructedWall: [],
        rampart: [],
        storage: [],
        tower: [],
        observer: [],
        powerSpawn: [],
        extractor: [],
        terminal: [],
        lab: [],
        container: [],
        nuker: [],
        factory: []
    };


    for (const s in data.buildings) {
        const poss = data.buildings[s].pos;
        for (const pos of poss) {
            const x = pos.x - 25 + center.x;
            const y = pos.y - 25 + center.y;
            try {
                if (terrain.get(x, y) == TERRAIN_MASK_WALL) continue;
                structMap[s].push([x, y]);
            } catch (error) {
                console.log(`${s} ${x} ${y} 布局错误: ${error}`);
                throw error;
            }
        }
    }

    for (let i = center.x - 9; i < center.x + 10; i++) {
        for (let j = center.y - 9; j < center.y + 10; j++) {
            if([0, 1, 48, 49].includes(i)) continue;
            if([0, 1, 48, 49].includes(j)) continue;
            if (terrain.get(i, j) == TERRAIN_MASK_WALL) continue;
            if (Math.abs(i - center.x) == 9 || Math.abs(j - center.y) == 9) {
                structMap['rampart'].push([i, j]);
            }
        }
    }
    
    HelperVisual.showRoomStructures(roomName, structMap);

    return OK;
}



// 自适应布局
const BuildDynamicPlanner_63 = function (roomName: string) {
    if (Game.cpu.bucket < 100) {
        return Error(`CPU bucket余量过低, 暂时无法运行自动布局。`);
    }
    let roomStructsData: any;
    let pa = Game.flags.pa?.pos;
    let pb = Game.flags.pb?.pos;
    let pc = Game.flags.pc?.pos;
    let pm = Game.flags.pm?.pos;
    let room = Game.rooms[roomName];
    if ((!pa || !pb || !pc || !pm) && room) {
        pa = room.source?.[0]?.pos || room.find(FIND_SOURCES)[0]?.pos;
        pb = room.source?.[1]?.pos || room.find(FIND_SOURCES)[1]?.pos || pa;
        pc = room.controller?.pos;
        pm = room.mineral?.pos || room.find(FIND_MINERALS)[0]?.pos;
        if (!pa || !pb || !pc || !pm) return Error(`房间 ${roomName} 的能量源、控制器或矿点不存在。`);
    } else if (!pa || !pb || !pc || !pm) return Error(`没有房间视野, 且未找到pa、pb、pc、pm旗帜标记。`);

    roomStructsData = autoPlanner63.ManagerPlanner.computeManor(roomName, [pc, pm, pa, pb,]);
    if (roomStructsData) {
        const BotMemRooms = Memory['RoomControlData'];
        BotMemRooms[roomName]['layout'] = "63";
        BotMemRooms[roomName]['center'] = {
            x: roomStructsData.storagePos.storageX,
            y: roomStructsData.storagePos.storageY,
        }
        Memory['LayoutData'][roomName] = {};
        const layoutMemory = Memory['LayoutData'][roomName];
        const structMap = roomStructsData.structMap;
        for (const s in structMap) {
            layoutMemory[s] = compressBatch(structMap[s]);
        }
        console.log(`房间 ${roomName} 的布局memory已生成。`);
        console.log('storage集群中心位置: ' + JSON.stringify(roomStructsData.storagePos));
        console.log('lab中心位置: ' + JSON.stringify(roomStructsData.labPos));
        return OK;
    } else {
        return Error(`房间 ${roomName} 的自动布局失败。`);
    }
}

const VisualDynamicPlanner_63 = function (roomName?: string) {
    if (Game.cpu.bucket < 100) {
        return Error(`CPU bucket余量过低, 暂时无法运行自动布局。`);
    }
    let roomStructsData: any;
    let pa = Game.flags.pa?.pos;
    let pb = Game.flags.pb?.pos;
    let pc = Game.flags.pc?.pos;
    let pm = Game.flags.pm?.pos;
    let room = Game.rooms[roomName];
    if ((!pa || !pb || !pc || !pm) && room) {
        pa = room.source?.[0]?.pos || room.find(FIND_SOURCES)[0]?.pos;
        pb = room.source?.[1]?.pos || room.find(FIND_SOURCES)[1]?.pos || pa;
        pc = room.controller?.pos;
        pm = room.mineral?.pos || room.find(FIND_MINERALS)[0]?.pos;
        if (!pa || !pb || !pc || !pm) return Error(`房间 ${roomName} 的能量源、控制器或矿点不存在。`);
    } else if (!pa || !pb || !pc || !pm) return Error(`未找到pa、pb、pc、pm旗帜标记。`);

    roomStructsData = autoPlanner63.ManagerPlanner.computeManor(pa.roomName, [pc, pm, pa, pb,]);
    console.log('自动布局完成, 正在可视化...');
    autoPlanner63.HelperVisual.showRoomStructures(pa.roomName, roomStructsData.structMap);
    return OK;
}