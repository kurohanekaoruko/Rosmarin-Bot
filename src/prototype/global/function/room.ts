import { signConstant } from "@/constant/signConstant";

// 房间控制
export default {
    room: {
        // 添加房间
        add(roomName: string, mode?: string, layout?: string, x?: number, y?: number) {
            const BotMemRooms =  Memory['RoomControlData'];
            if(!BotMemRooms[roomName]) BotMemRooms[roomName] = {};
            BotMemRooms[roomName]['mode'] = mode ?? 'main';
            global.log(`已添加房间${roomName}。`);
            if(layout) {
                BotMemRooms[roomName]['layout'] = layout;
                global.log(`已设置 ${roomName} 的布局为 ${layout}。`);
            }
            if(x && y) {
                BotMemRooms[roomName]['center'] = {x, y};
                global.log(`已设置 ${roomName} 的布局中心为 (${x},${y})。`);
            }
            Game.rooms[roomName].init();
            return OK;
        },
        // 删除房间
        remove(roomName: string) {
            delete Memory['RoomControlData'][roomName];
            global.log(`已从控制列表删除房间${roomName}。`);
            return OK;
        },
        // 查看房间列表
        list() {
            global.log(`房间控制列表：${Object.keys(Memory['RoomControlData']).join('、')}`);
            return OK;
        },
        // 设置房间模式
        mode(roomName: string, mode: string='main') {
            const room = Game.rooms[roomName];
            const BotMemRooms =  Memory['RoomControlData'];
            if(!room || !room.my || !BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 不存在、未拥有或未添加。`);
            }
            BotMemRooms[roomName]['mode'] = mode;
            global.log(`已设置 ${roomName} 的运行模式为 ${mode}。`);
            return OK;
        },
        // 设置房间中心
        setcenter(roomName: string, x: number, y: number) {
            const room = Game.rooms[roomName];
            const BotMemRooms = Memory['RoomControlData'];
            if(!room || !room.my || !BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 不存在、未拥有或未添加。`);
            }
            BotMemRooms[roomName].center = { x, y };
            global.log(`已设置 ${roomName} 的布局中心为 (${x},${y})。`);
            return OK;
        },
        defendmode(roomName: string, mode: number=0) {
            const room = Game.rooms[roomName];
            const BotMemRooms = Memory['RoomControlData'];
            if(!room || !room.my || !BotMemRooms[roomName]) {
                return Error(`房间 ${roomName} 不存在、未拥有或未添加。`);
            }
            BotMemRooms[roomName]['defend_mode'] = mode;
            global.log(`已设置 ${roomName} 的防御模式为 ${mode}。`);
            return OK;
        },
        // 设置签名
        sign(roomName: string, text?: string) {
            const room = Game.rooms[roomName];
            if(!room || !room.my) {
                return Error(`房间 ${roomName} 不存在或未拥有。`);
            }
            const botMem = Memory['RoomControlData'][roomName];
            botMem['sign'] = text ?? signConstant[Math.floor(Math.random() * signConstant.length)];
            global.log(`已设置 ${roomName} 的房间签名为:\n ${text}`);
            return OK;
        },
        // 设置刷墙上限
        setram(roomName: string, hits: number) {
            const botMem = Memory['StructControlData'][roomName];
            if (hits <= 0) {
                console.log(`输入的数值必须大于0.`);
                return -1;
            }
            if (hits <= 1) {
                botMem['ram_threshold'] = hits;
                console.log(`已设置 ${roomName} 的刷墙上限比例为 ${hits}。`);
            } else {
                botMem['ram_threshold'] = hits / 3e8;
                console.log(`已设置 ${roomName} 的刷墙上限比例为 ${hits / 3e8}。`);
            }
            return OK;
        },
        // 开启常驻升级
        upgrade(roomName: string) {
            const room = Game.rooms[roomName];
            if(!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
            const botMem = Memory['RoomControlData'][roomName];
            botMem['mustUpgrade'] = !botMem['mustUpgrade'];
            global.log(`已设置 ${roomName} 的常驻升级状态为${botMem['mustUpgrade'] ? '开启' : '关闭'}。`);
            return OK;
        },
        // 开启冲级
        spup(roomName: string, num?: number) {
            const room = Game.rooms[roomName];
            if(!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
            const botMem = Memory['RoomControlData'][roomName];
            botMem['spup'] = Math.floor(num ?? 0);
            global.log(`已设置 ${roomName} 的冲级状态为 ${botMem['spup'] ? '开启' : '关闭'}。`);
            if(botMem['spup']) global.log(`冲级数量为 ${botMem['spup']}。`);
            return OK;
        },
        // 加速刷墙
        spre(roomName: string, num?: number) {
            const room = Game.rooms[roomName];
            if(!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
            const botMem = Memory['RoomControlData'][roomName];
            botMem['spre'] = Math.floor(num ?? 0);
            global.log(`已设置 ${roomName} 的加速刷墙状态为 ${botMem['spre'] ? '开启' : '关闭'}。`);
            if(botMem['spre']) global.log(`加速刷墙数量为 ${botMem['spre']}。`);
            return OK;
        },
        // 添加中央搬运任务
        manage(roomName: string, source: 's'|'t'|'f'|'l', target: 's'|'t'|'f'|'l', type: string, amount: number) {
            const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
            type = RESOURCE_ABBREVIATIONS[type] || type;
            const room = Game.rooms[roomName];
            room.ManageMissionAdd(source, target, type, amount);
            global.log(`[任务模块] 在房间 ${room.name} 添加了中央搬运任务: ${source} -> ${target}, ${amount} ${type}`);
            return OK;
        },
        // 添加发送任务
        send(roomName: string, targetRoom: string, type: string, amount: number) {
            const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
            type = RESOURCE_ABBREVIATIONS[type] || type;
            const room = Game.rooms[roomName];
            room.SendMissionAdd(targetRoom, type, amount);
            global.log(`[任务模块] 在房间 ${room.name} 添加了发送任务: ${amount} ${type} -> ${targetRoom} `);
            return OK;
        },
        // 查看房间工作状态
        info(roomName?: string) {
            if(roomName) {
                const room = Game.rooms[roomName];
                if(!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
                const roomMem = Memory['RoomControlData'][roomName];
                const structMem = Memory['StructControlData'][roomName];
                console.log(`<b>房间 ${roomName} 工作状态:</b>`);
                if (roomMem.spup) {
                    console.log(`   - <b>冲级</b>: ${colorText(`${roomMem.spup}个工作中`, '#62BE78')}`);
                }
                if (roomMem.spre) {
                    console.log(`   - <b>刷墙</b>: ${colorText(`${roomMem.spre}个工作中`, '#62BE78')}`);
                }
                if (roomMem.outminePower || roomMem.outmineDeposit) {
                    console.log(`   - <b>过道</b>: power:${roomMem.outminePower ? colorText('开启', '#62BE78') : colorText('关闭', '#EF4E4E')} deposit:${roomMem.outmineDeposit ? colorText('开启', '#62BE78') : colorText('关闭', '#EF4E4E')}`);
                }
                if (!structMem['powerSpawn']) {
                    console.log(`   - <b>powerSpawn</b>: ${colorText('已关闭', '#EF4E4E')}`);
                } else if (
                    room.powerSpawn.store[RESOURCE_ENERGY] < 50 ||
                    room.powerSpawn.store[RESOURCE_POWER] < 1) {
                    console.log(`   - <b>powerSpawn</b>: ${colorText('资源不足', '#D9C07B')}`);
                } else {
                    console.log(`   - <b>powerSpawn</b>: ${colorText('工作中', '#62BE78')}`);
                }

                if (!structMem['lab']) {
                    console.log(`   - <b>lab</b>: ${colorText('已关闭', '#EF4E4E')}`);
                } else if (!structMem['labAtype'] || !structMem['labBtype']) {
                    console.log(`   - <b>lab</b>: ${colorText('闲置中', '#D9C07B')}`);
                } else {
                    const labAtype = structMem['labAtype'];
                    const labBtype = structMem['labBtype'];
                    const product = REACTIONS[labAtype][labBtype];
                    console.log(`   - <b>lab</b>: ${colorText(`${labAtype}/${labBtype} -> ${product}`, '#62BE78')}`);
                }

                if (!structMem['factory']) {
                    console.log(`   - <b>factory</b>: ${colorText('已关闭', '#EF4E4E')}`);
                } else if (!structMem['factoryProduct']) {
                    console.log(`   - <b>factory</b>: ${colorText('闲置中', '#D9C07B')}`);
                } else {
                    const product = structMem['factoryProduct'];
                    const components = COMMODITIES[product]?.components;
                    console.log(`   - <b>factory</b>: ${colorText(`-> ${product}`, '#62BE78')}`);
                }
            } else {
                for(const roomName in Memory['RoomControlData']) {
                    this.info(roomName);
                }
            }
            return OK;
        }
    },
}

const colorText = function (text: string, color: string) {
    return `<span style="color: ${color};">${text}</span>`;
}