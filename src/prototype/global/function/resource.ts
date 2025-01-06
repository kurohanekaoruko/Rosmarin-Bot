export default {
    resource: {
        manage: {
            set(roomName: string, resource: string, data: { source: number, target: number }) {
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                resource = RESOURCE_ABBREVIATIONS[resource] || resource;
                const source = data.source ?? Infinity;
                const target = data.target ?? 0;
                if (!Memory['ResourceManage']) Memory['ResourceManage'] = {};
                if (!Memory['ResourceManage'][roomName]) Memory['ResourceManage'][roomName] = {};
                Memory['ResourceManage'][roomName][resource] = { source, target }
                global.log(`[资源管理] 已设置房间 ${roomName} 的 ${resource} 供应阈值为 ${source}  需求阈值为 ${target}`);
                return OK;
            },
            remove(roomName: string, resource: string) {
                const RESOURCE_ABBREVIATIONS = global.BaseConfig.RESOURCE_ABBREVIATIONS;
                resource = RESOURCE_ABBREVIATIONS[resource] || resource;
                if (!Memory['ResourceManage']) Memory['ResourceManage'] = {};
                if (!Memory['ResourceManage'][roomName]) Memory['ResourceManage'][roomName] = {};
                if (Memory['ResourceManage'][roomName][resource]) {
                    delete Memory['ResourceManage'][roomName][resource];
                    global.log(`[资源管理] 已移除房间 ${roomName} 的 ${resource} 供需设置`);
                }
                return OK;
            },
            clear(roomName: string) {
                if (!Memory['ResourceManage']) Memory['ResourceManage'] = {};
                if (!Memory['ResourceManage'][roomName]) Memory['ResourceManage'][roomName] = {};
                delete Memory['ResourceManage'][roomName];
                global.log(`[资源管理] 已清空房间 ${roomName} 的资源管理设置`);
                return OK;
            },
            show: {
                all() {
                    const botmem = Memory['ResourceManage'];
                    for (const roomName in botmem) {
                        console.log(`房间${roomName}:`);
                        for (const res in botmem[roomName]) {
                            console.log(`   -资源${res}:`);
                            console.log(`      -供应阈值: ${botmem[roomName][res].source ?? Infinity}`);
                            console.log(`      -需求阈值: ${botmem[roomName][res].target ?? 0}`);
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
                        console.log(`   -供应阈值: ${botmem[roomName][res].source ?? Infinity}`);
                        console.log(`   -需求阈值: ${botmem[roomName][res].target ?? 0}`);
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
                            console.log(`   -供应阈值: ${botmem[roomName][res].source ?? Infinity}`);
                            console.log(`   -需求阈值: ${botmem[roomName][res].target ?? 0}`);
                        }
                    }
                    return OK;
                }
            }
        }
    }
}