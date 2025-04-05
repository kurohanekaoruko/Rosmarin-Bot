import { signConstant } from "@/constant/SignConstant";

// 房间控制
export default {
    room: {
        // 添加房间
        add(roomName: string, layout?: string, x?: number, y?: number) {
            if (!roomName) return Error('请输入房间名。');
            if (!roomName.match(/^[EW][0-9]+[NS][0-9]+$/)) return Error('房间名格式不正确。');

            const BotMemRooms =  Memory['RoomControlData'];
            if(!BotMemRooms[roomName]) BotMemRooms[roomName] = {} as any;
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

            if (hits <= 0) {
                console.log(`输入的数值必须大于0.`);
                return -1;
            }

            const botMem = Memory['StructControlData'][roomName];
            if (hits <= 1) {
                botMem['ram_threshold'] = hits;
                console.log(`已设置 ${roomName} 的刷墙上限比例为 ${hits}。`);
            } else {
                botMem['ram_threshold'] = hits / 3e8;
                console.log(`已设置 ${roomName} 的刷墙上限比例为 ${hits / 3e8}。`);
            }
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
            // 如果只查询单个房间且不存在，返回错误信息
            if (roomName) {
                const room = Game.rooms[roomName];
                if (!room || !room.my) return Error(`房间 ${roomName} 不存在或未拥有。`);
            }
            // 获取需要显示的房间名列表
            const roomNames = roomName ? [roomName] : Object.keys(Memory['RoomControlData']);
            return roomInfo(roomNames);
        }
    },
}

const roomInfo = (rooms: string[]) => {
    // 创建表格样式和辅助函数
    const styles = {
        table: 'text-align: center; border-collapse: collapse; width: 100%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border-radius: 8px; overflow: hidden; margin-top: 10px;',
        header: 'background: linear-gradient(135deg, #324868 0%, #1f2737 100%); color: #e0e0e0; font-weight: bold;',
        th: 'padding: 12px 8px; text-align: center; border-bottom: 2px solid #2d3850;',
        tr: 'border-bottom: 1px solid #2d3850;',
        td: 'padding: 10px 8px; color: #e0e0e0;',
        title: 'font-size: 18px; margin-bottom: 8px; display: block; color: #e0e0e0; font-weight: bold;',
        odd: 'background-color: rgba(45, 55, 72, 0.6);',
        even: 'background-color: rgba(39, 48, 63, 0.8);',
        footer: 'background-color: #1f2737; font-size: 11px; color: #a0a0a0; padding: 8px; text-align: right;'
    };
    const th = (text: string) => `<th style="${styles.th}">${text}</th>`;
    
    // 表头数据
    const headers = [
        '房间', 
        '<span style="display:flex;align-items:center;justify-content:center;">Spawn</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Storage</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Terminal</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Lab</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Factory</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">PowerSpawn</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Nuker</span>', 
        '<span style="display:flex;align-items:center;justify-content:center;">Energy</span>'
    ];

    // 构建房间数据行
    const roomRows = rooms
        .map((name, index) => showRoomInfo(name, styles, index))
        .filter(row => row) // 过滤掉空行
        .join('');

    // 构建HTML
    let html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 15px; border-radius: 8px;">
            <b style="${styles.title}">🏠房间信息</b>
            <table style="${styles.table}">
                <thead>
                    <tr style="${styles.header}">
                        ${headers.map(header => th(header)).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${roomRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="${headers.length}" style="${styles.footer}">
                            最后更新: ${new Date().toLocaleString()} (游戏时间: ${Game.time})
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    // 移除不必要的换行符使其成为一行
    html = html.replace(/\n\s+/g, '');
    return html;
}


const colorText = function (text: string, color: string) {
    return `<span style="color: ${color}; font-weight: 500;">${text}</span>`;
}

const showRoomInfo = function (roomName: string, styles: any, rowIndex: number) {
    const room = Game.rooms[roomName];
    if(!room || !room.my) return '';
    const roomMem = Memory['RoomControlData'][roomName];
    const structMem = Memory['StructControlData'][roomName];

    // 根据行号确定样式（奇偶行不同颜色）
    const rowStyle = rowIndex % 2 === 0 ? styles.even : styles.odd;
    
    const td = (text: string) => `<td style="${styles.td}">${text}</td>`;
    
    // 状态图标映射
    const statusIcons = {
        good: '✅',
        warning: '⚠️',
        danger: '❌',
        neutral: '⚪',
        building: '🔨'
    };

    // 构建行
    let cells: string[] = [];
    
    // 房间名 - 添加小图标显示房间等级
    const getRoomLevelIcon = (level?: number) => {
        if (!level) return '';
        // 使用Unicode字符代替数字，避免偏移问题
        const levelSymbols = ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
        
        // 创建带颜色的徽章
        const colors = {
            1: '#717171', // 灰色
            2: '#717171',
            3: '#717171',
            4: '#5D80B2', // 蓝色
            5: '#5D80B2',
            6: '#5D80B2',
            7: '#B29E6F', // 金色
            8: '#B29E6F'
        };
        
        const color = colors[level] || '#717171';
        
        return `<span style="color: ${color}; font-weight: bold; margin-right: 5px; font-size: 16px;">${levelSymbols[level]}</span>`;
    };
    
    cells.push(td(`${getRoomLevelIcon(room.controller?.level)}<b style="color: #e0e0e0;">${roomName}</b>`));
    
    // Spawn
    if (room.spawn && room.spawn.length > 0) {
        const spawnCount = room.spawn.length;
        const missionCount = room.getMissionNumInPool('spawn');
        const icon = missionCount > 0 ? statusIcons.warning : statusIcons.good;
        const color = missionCount > 0 ? '#FFD166' : '#06D6A0';
        cells.push(td(colorText(`${icon} ${missionCount} / ${spawnCount}`, color)));
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Storage
    if (room.storage) {
        const UsedCapacity = room.storage.store.getUsedCapacity() / 1e6;
        const Capacity = room.storage.store.getCapacity() / 1e6;
        const store = UsedCapacity / Capacity;
        const content = `${UsedCapacity.toFixed(2)}M/${Capacity.toFixed(2)}M`;
        
        let icon: string, color: string;
        if (store < 0.5) {
            icon = statusIcons.good;
            color = '#06D6A0';
        } else if (store < 0.8) {
            icon = statusIcons.good;
            color = '#06D6A0';
        } else if (store < 1) {
            icon = statusIcons.warning;
            color = '#FFD166';
        } else {
            icon = statusIcons.danger;
            color = '#EF476F';
        }
        
        // 添加进度条
        const progressBar = `
            <div style="background-color: rgba(255,255,255,0.1); height: 5px; width: 100%; margin-top: 3px; border-radius: 2px;">
                <div style="background-color: ${color}; height: 100%; width: ${store * 100}%; border-radius: 2px;"></div>
            </div>
        `;
        
        cells.push(td(`${colorText(`${icon} ${content}`, color)}${progressBar}`));
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Terminal
    if (room.terminal) {
        const store = room.terminal.store.getUsedCapacity() / room.terminal.store.getCapacity();
        const content = `${(store*100).toFixed(0)}%`;
        
        let icon: string, color: string;
        if (store < 0.5) {
            icon = statusIcons.good;
            color = '#06D6A0';
        } else if (store < 0.8) {
            icon = statusIcons.good;
            color = '#06D6A0';
        } else if (store < 1) {
            icon = statusIcons.warning;
            color = '#FFD166';
        } else {
            icon = statusIcons.danger;
            color = '#EF476F';
        }
        
        // 添加进度条
        const progressBar = `
            <div style="background-color: rgba(255,255,255,0.1); height: 5px; width: 100%; margin-top: 3px; border-radius: 2px;">
                <div style="background-color: ${color}; height: 100%; width: ${store * 100}%; border-radius: 2px;"></div>
            </div>
        `;
        
        cells.push(td(`${colorText(`${icon} ${content}`, color)}${progressBar}`));
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Lab
    if (room.lab && room.lab.length > 0) {
        if (!structMem['lab']) {
            cells.push(td(colorText(`${statusIcons.danger} 已关闭`, '#EF476F')));
        } else if (!structMem['labAtype'] || !structMem['labBtype']) {
            cells.push(td(colorText(`${statusIcons.warning} 闲置中`, '#FFD166')));
        } else {
            const labAtype = structMem['labAtype'];
            const labBtype = structMem['labBtype'];
            const product = REACTIONS[labAtype][labBtype];
            cells.push(td(colorText(`${statusIcons.good} ${labAtype} + ${labBtype} → ${product}`, '#06D6A0')));
        }
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Factory
    if (room.factory) {
        if (!structMem['factory']) {
            cells.push(td(colorText(`${statusIcons.danger} 已关闭`, '#EF476F')));
        } else if (!structMem['factoryProduct']) {
            cells.push(td(colorText(`${statusIcons.warning} 闲置中`, '#FFD166')));
        } else {
            const product = structMem['factoryProduct'];
            cells.push(td(colorText(`${statusIcons.good} ${product}`, '#06D6A0')));
        }
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }
    
    // PowerSpawn
    if (room.powerSpawn) {
        const powerSpawn = room.powerSpawn;
        const effect = powerSpawn.effects?.find(e => e.effect == PWR_OPERATE_POWER);
        let speed = 1 + effect?.['level'] || 1;
    
        if (!structMem['powerSpawn']) {
            cells.push(td(colorText(`${statusIcons.danger} 已关闭`, '#EF476F')));
        } else if (
            room.powerSpawn.store[RESOURCE_ENERGY] < 50 ||
            room.powerSpawn.store[RESOURCE_POWER] < 1) {
            cells.push(td(colorText(`${statusIcons.warning} 资源不足`, '#FFD166')));
        } else {
            cells.push(td(colorText(`${statusIcons.good} ${speed}速工作中`, '#06D6A0')));
        }
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Nuker
    if (room.nuker) {
        if (room.nuker.cooldown) {
            cells.push(td(colorText(`${statusIcons.warning} 冷却中(${room.nuker.cooldown})`, '#FFD166')));
        } else if (room.nuker.store['energy'] < 300e3 || room.nuker.store['G'] < 5000) {
            cells.push(td(colorText(`${statusIcons.warning} 资源不足`, '#FFD166')));
        } else {
            cells.push(td(colorText(`${statusIcons.good} ☢已就绪☢`, '#06D6A0')));
        }
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 未建造`, '#a0a0a0')));
    }

    // Energy
    if (room[RESOURCE_ENERGY]) {
        const energy = room[RESOURCE_ENERGY];
        const energyThreshold = 10000; // 假设能量阈值
        const color = energy > energyThreshold ? '#118AB2' : (energy > energyThreshold/2 ? '#FFD166' : '#EF476F');
        cells.push(td(colorText(`⚡ ${energy.toLocaleString()}`, color)));
    } else {
        cells.push(td(colorText(`${statusIcons.neutral} 0`, '#a0a0a0')));
    }
    
    return `<tr style="${styles.tr} ${rowStyle}">${cells.join('')}</tr>`;
}