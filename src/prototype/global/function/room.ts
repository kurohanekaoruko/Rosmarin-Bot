import { signConstant } from "@/constant/signConstant";

// 房间控制
export default {
    room: {
        // 添加房间
        add(roomName: string, layout?: string, x?: number, y?: number) {
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

            const BotMemRooms =  Memory['RoomControlData'];
            if(!BotMemRooms[roomName]) BotMemRooms[roomName] = {};
            if(!BotMemRooms[roomName]['mode']) {
                BotMemRooms[roomName]['mode'] = 'main';
            }
            global.log(`已添加房间${roomName}。`);
            if(layout) {
                BotMemRooms[roomName]['layout'] = layout;
                global.log(`已设置 ${roomName} 的布局为 ${layout}。`);
            }
            if(x && y) {
                BotMemRooms[roomName]['center'] = {x, y};
                global.log(`已设置 ${roomName} 的布局中心为 (${x},${y})。`);
            } else {
                let PosFlag = Game.flags.storagePos || Game.flags.centerPos;
                if(PosFlag && PosFlag.room.name === roomName) {
                    BotMemRooms[roomName]['center'] = {x: PosFlag.pos.x, y: PosFlag.pos.y};
                    global.log(`已设置 ${roomName} 的布局中心为 (${PosFlag.pos.x},${PosFlag.pos.y})。`);
                }
            }
            Game.rooms[roomName].init();
            return OK;
        },
        // 删除房间
        remove(roomName: string) {
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');
            let room = Game.rooms[roomName];
            if (room && room.my && room.level >= 6 && !Game.flags[`remove-${roomName}`]) {
                return Error(`房间 ${roomName} 等级大于等于6, 为避免误删除, 请放置一个名为 "remove-${roomName}" 的flag来确认删除。`);
            }
            if (Game.flags[`remove-${roomName}`]) Game.flags[`remove-${roomName}`].remove();

            delete Memory['rooms'][roomName];
            delete Memory['RoomControlData'][roomName];
            delete Memory['StructControlData'][roomName];
            delete Memory['LayoutData'][roomName];
            delete Memory['OutMineData'][roomName];
            delete Memory['AutoData']['AutoMarketData'][roomName];
            delete Memory['AutoData']['AutoLabData'][roomName];
            delete Memory['AutoData']['AutoFactoryData'][roomName];
            delete Memory['ResourceManage'][roomName];
            delete Memory['MissionPools'][roomName];
            global.log(`已从控制列表删除房间${roomName}并清空相关Memory。`);
            return OK;
        },
        // 查看房间列表
        list() {
            global.log(`房间控制列表：${Object.keys(Memory['RoomControlData']).join('、')}`);
            return OK;
        },
        // 设置房间模式
        mode(roomName: string, mode: string='main') {
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');
            if (!['main', 'stop', 'low'].includes(mode)) return Error('仅支持main、stop、low模式。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

            const room = Game.rooms[roomName];
            if(!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
            const botMem = Memory['RoomControlData'][roomName];
            botMem['mustUpgrade'] = !botMem['mustUpgrade'];
            global.log(`已设置 ${roomName} 的常驻升级状态为${botMem['mustUpgrade'] ? '开启' : '关闭'}。`);
            return OK;
        },
        // 开启冲级
        spup(roomName: string, num?: number) {
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

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
            if (!roomName.match(/^[EW][1-9]+[NS][1-9]+$/)) return Error(`房间名格式不正确。`);
            if (!targetRoom.match(/^[EW][1-9]+[NS][1-9]+$/)) return Error(`目标房间名格式不正确。`);
            const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
            type = RESOURCE_ABBREVIATIONS[type] || type;
            if (!RESOURCES_ALL.includes(type as ResourceConstant)) return Error(`资源类型不正确。`);
            if (typeof amount !== 'number') return Error(`数量必须是数字。`);
            if (amount <= 0) return Error(`数量必须大于0。`);
            
            const room = Game.rooms[roomName];
            room.SendMissionAdd(targetRoom, type, amount);
            global.log(`[任务模块] 在房间 ${room.name} 添加了发送任务: ${amount} ${type} -> ${targetRoom} `);
            return OK;
        },
        // 查看房间工作状态
        info(roomName?: string) {
            roomInfo(roomName)
            return ''
        }
    },
}

const roomInfo = function (roomName: string) {
    let str = `<b>房间状态:</b><br>`;
    str += '<table style="text-align: center;"><tr><thead align="center"><th> </th>'
    str += '<th style="text-align: center;"> Spawn </th>'
    str += '<th style="text-align: center;"> Lab </th>'
    str += '<th style="text-align: center;"> Factory </th>'
    str += '<th style="text-align: center;"> PowerSpawn </th>'
    str += '<th style="text-align: center;"> Nuker </th>'
    str += '<th style="text-align: center;"> Energy </th>'
    str += '</tr></thead><tbody>'

    if(roomName) {
        const room = Game.rooms[roomName];
        if(!room || !room.my)
            return Error(`房间 ${roomName} 不存在或未拥有。`);
        str += showRoomInfo(roomName)
    } else {
        for(const roomName in Memory['RoomControlData']) {
            str += showRoomInfo(roomName)
        }
    }

    str += `</tbody></table>`;
    console.log(str);
}

const colorText = function (text: string, color: string) {
    return `<font style="color: ${color};">${text}</font>`;
}

const showRoomInfo = function (roomName: string) {
    const room = Game.rooms[roomName];
    if(!room || !room.my) return '';
    const roomMem = Memory['RoomControlData'][roomName];
    const structMem = Memory['StructControlData'][roomName];

    let str = `<tr><td><b>${roomName}:  </b></td>`;

    if (room.spawn && room.spawn.length > 0) {
        str += `<td>${colorText(`${room.getMissionNumInPool('spawn')}`, '#62BE78')}</td>`;
    } else {
        str += `<td>${colorText('未建造', '#8E8E8E')}</td>`;
    }

    if (room.lab && room.lab.length > 0) {
        if (!structMem['lab']) {
            str += `<td>${colorText('已关闭', '#EF4E4E')}</td>`;
        } else if (!structMem['labAtype'] || !structMem['labBtype']) {
            str += `<td>${colorText('闲置中', '#D9C07B')}</td>`;
        } else {
            const labAtype = structMem['labAtype'];
            const labBtype = structMem['labBtype'];
            const product = REACTIONS[labAtype][labBtype];
            str += `<td> ${colorText(`${labAtype}/${labBtype}->${product}`, '#62BE78')} </td>`
        }
    } else {
        str += `<td>${colorText('未建造', '#8E8E8E')}</td>`;
    }

    if (room.factory) {
        if (!structMem['factory']) {
            str += `<td>${colorText('已关闭', '#EF4E4E')}</td>`;
        } else if (!structMem['factoryProduct']) {
            str += `<td>${colorText('闲置中', '#D9C07B')}</td>`;
        } else {
            const product = structMem['factoryProduct'];
            const components = COMMODITIES[product]?.components;
            str += `<td> ${colorText(`${product}`, '#62BE78')} </td>`;
        }
    } else {
        str += `<td>${colorText('未建造', '#8E8E8E')}</td>`;
    }
    
    if (room.powerSpawn) {
        const powerSpawn = room.powerSpawn;
        const effect = powerSpawn.effects?.find(e => e.effect == PWR_OPERATE_POWER);
        let speed = 1 + effect?.['level'] || 1;
        // 结果为: (1 + level) 或
        // (1 + undefined || 1) = (NaN || 1) = 1
    
        if (!structMem['powerSpawn']) {
            str += `<td>${colorText('已关闭', '#EF4E4E')}</td>`;
        } else if (
            room.powerSpawn.store[RESOURCE_ENERGY] < 50 ||
            room.powerSpawn.store[RESOURCE_POWER] < 1) {
            str += `<td>${colorText('资源不足', '#D9C07B')}</td>`;
        } else {
            str += `<td>${colorText(`${speed}速工作中`, '#62BE78')}</td>`;
        }
    } else {
        str += `<td>${colorText('未建造', '#8E8E8E')}</td>`;
    }

    if (room.nuker) {
        if (room.nuker.cooldown) {
            str += `<td> ${colorText('冷却中', '#D9C07B')} </td>`;
        } else if (room.nuker.store['energy'] < 300e3 || room.nuker.store['G'] < 5000) {
            str += `<td> ${colorText('资源不足', '#D9C07B')} </td>`;
        } else {
            str += `<td> ${colorText('☢已就绪☢', '#62BE78')} </td>`;
        }
    } else {
        str += `<td> ${colorText('未建造', '#8E8E8E')} </td>`;
    }

    if (room[RESOURCE_ENERGY]) {
        str += `<td>${colorText(`${room[RESOURCE_ENERGY]}`, '#FDE67B')}</td>`;
    } else {
        str += `<td>${colorText('0', '#8E8E8E')}</td>`;
    }
    

    return str + '</tr>';
}