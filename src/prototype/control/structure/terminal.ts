

export default {
    terminal: {
        // 立即发送资源
        send(room?: string, target?: string, type?: any, amount?: number){
            if(room && target && type && amount) {
                const terminal = Game.rooms[room].terminal;
                if (!terminal || terminal.cooldown !== 0) {
                    return Error(`${room} 的终端不存在或处于冷却。`);
                };
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                type = RESOURCE_ABBREVIATIONS[type] || type;
                amount = Math.min(amount, terminal.store[type] || 0);
                if(!amount) {console.log(`${room} 的终端没有足够的 ${type}。`); return;}
                const cost = Game.market.calcTransactionCost(amount, room, target);
                if(type == RESOURCE_ENERGY) {
                    amount = amount + cost > terminal.store[type] ? 
                            terminal.store[type] - cost : amount;
                }
                const result = terminal.send(type, amount, target);
                if(result === OK) {
                    console.log(`成功将 ${amount} 单位的 ${type} 从 ${room} 发送到 ${target}, 传输成本 ${cost}`);
                } else {
                    console.log(`${room} 发送资源失败，错误代码：${result}`);
                }
                return result;
            }
            if(!room && target && type && amount) {
                let total = amount;
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                type = RESOURCE_ABBREVIATIONS[type] || type;
                for (const room of Object.values(Game.rooms)) {
                    if (room.name == target) continue;
                    const terminal = room.terminal;
                    if (!terminal || terminal.cooldown !== 0) continue;
                    let amount = Math.min(total, terminal.store[type] || 0);
                    if(!amount) continue;
                    const cost = Game.market.calcTransactionCost(amount, room.name, target);
                    if(type == RESOURCE_ENERGY) {
                        amount = amount + cost > terminal.store[type] ? 
                                terminal.store[type] - cost : amount;
                    }
                    const result = terminal.send(type, amount, target);
                    if(result === OK) {
                        console.log(`成功将 ${amount} 单位的 ${type} 从 ${room.name} 发送到 ${target}, 传输成本 ${cost}`);
                        total -= amount;
                        if(total <= 0) break;
                    }
                    else {
                        console.log(`${room.name} 发送资源失败，错误代码：${result}`);
                    }
                }
                return OK;
            }
            return ERR_INVALID_ARGS;
        },
        // 显示终端资源
        show({roomName, type}) {
            if(roomName && type) {
                const terminal = Game.rooms[roomName].terminal;
                if (!terminal) {
                    console.log(`${roomName} 的终端不存在。`); return;
                };
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                const res = RESOURCE_ABBREVIATIONS[type] || type;
                console.log(`${roomName} 的终端有 ${terminal.store[res] || 0} 单位的 ${res}`);
            }

            if(!roomName && type) {
                for (const room of Object.values(Game.rooms)) {
                    const terminal = room.terminal;
                    if (!terminal) continue;
                    const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                    const res = RESOURCE_ABBREVIATIONS[type] || type;
                    console.log(`${room.name} 的终端有 ${terminal.store[res] || 0} 单位的 ${res}`);
                }
            }

            if(roomName && !type) {
                const terminal = Game.rooms[roomName].terminal;
                if (!terminal) {
                    console.log(`${roomName} 的终端不存在。`); return;
                }
                console.log(`${roomName} 的终端有 ${JSON.stringify(terminal.store)}`);
            }

            if(!roomName && !type) {
                for (const room of Object.values(Game.rooms)) {
                    const terminal = room.terminal;
                    if (!terminal) continue;
                    console.log(`${room.name} 的终端有 ${JSON.stringify(terminal.store)}`);
                }
            }
        },
    },
    resource: {
        set(roomName: string, resource: string, source: number, target: number) {
            const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
            resource = RESOURCE_ABBREVIATIONS[resource] || resource;
            source = source ?? Infinity;
            target = target ?? 0;
            if (!Memory['ResourceManage']) Memory['ResourceManage'] = {};
            if (!Memory['ResourceManage'][roomName]) Memory['ResourceManage'][roomName] = {};
            Memory['ResourceManage'][roomName][resource] = { source, target }
            console.log(`设置房间 ${roomName} 的 ${resource} 供应阈值为 ${source}  需求阈值为 ${target}`);
            return OK;
        },
        remove(roomName: string, resource: string) {
            const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
            resource = RESOURCE_ABBREVIATIONS[resource] || resource;
            if (!Memory['ResourceManage']) Memory['ResourceManage'] = {};
            if (!Memory['ResourceManage'][roomName]) Memory['ResourceManage'][roomName] = {};
            if (Memory['ResourceManage'][roomName][resource]) {
                delete Memory['ResourceManage'][roomName][resource];
                console.log(`移除房间 ${roomName} 的 ${resource} 供需设置`);
            }
            return OK;
        },
        show: {
            all() {
                const botmem = Memory['ResourceManage'];
                for (const roomName in botmem) {
                    console.log(`房间${roomName}:`);
                    for (const res in botmem[roomName]) {
                        console.log(`   -资源${res}:`);
                        console.log(`      -供应阈值: ${botmem[roomName][res].source}`);
                        console.log(`      -需求阈值: ${botmem[roomName][res].target}`);
                    }
                }
                return OK;
            },
            room(roomName: string) {
                if (!roomName) return Error('必须指定房间');
                const botmem = Memory['ResourceManage'];
                if (!botmem[roomName]) return Error('该房间没有资源管理设置');
                for (const res in botmem[roomName]) {
                    console.log(`资源${res}:`);
                    console.log(`   -供应阈值: ${botmem[roomName][res].source}`);
                    console.log(`   -需求阈值: ${botmem[roomName][res].target}`);
                }
            },
            res(res: string) {
                if (!res) return Error('必须指定资源');
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                res = RESOURCE_ABBREVIATIONS[res] || res;
                const botmem = Memory['ResourceManage'];
                for (const roomName in botmem) {
                    if (botmem[roomName][res]) {
                        console.log(`房间${roomName} 资源${res}:`);
                        console.log(`   -供应阈值: ${botmem[roomName][res].source}`);
                        console.log(`   -需求阈值: ${botmem[roomName][res].target}`);
                    }
                }
                return OK;
            }
        }
    }
}

