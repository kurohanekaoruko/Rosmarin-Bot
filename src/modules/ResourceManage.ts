import {Goods} from '@/constant/ResourceConstant'

/** 资源管理模块 */
export const ResourceManage = {
    tick: () => {
        if (Game.time % 50) return;
        const botmem = Memory['ResourceManage'];
        if (!botmem || Object.keys(botmem).length == 0) return;

        // 记录每种资源对应的供应房间与需求房间
        const RessourceManageMap = {};
        // 遍历所有房间的设置
        for (const roomName in botmem) {
            const room = Game.rooms[roomName];
            if (!room || !room.my || !room.terminal || !room.storage || room.terminal.cooldown > 0 ||
                room.terminal.owner.username != room.controller.owner.username
            ) continue;
            const store = [room.storage, room.terminal];
            for (const res in botmem[roomName]) {
                if (!RessourceManageMap[res]) RessourceManageMap[res] = { source: [], target: [] };
                // 供应阈值
                let sourceThreshold = botmem[roomName][res].source ?? Infinity;
                // 需求阈值
                let targetThreshold = botmem[roomName][res].target ?? 0;
                let resAmount = store.reduce((a, b) => a + (b.store[res] || 0), 0);
                // 资源量足够时供应
                if (resAmount > sourceThreshold) {
                    RessourceManageMap[res].source.push(roomName);
                }
                // 资源量不足时需求
                else if (resAmount < targetThreshold) {
                    RessourceManageMap[res].target.push(roomName);
                }
            }
        }

        // 处理每种资源的调度
        const sendOK = {}; // 记录本tick已经进行过发送的房间
        for (let res in RessourceManageMap) {
            if (RessourceManageMap[res].source.length == 0 ||
                RessourceManageMap[res].target.length == 0) continue;
            const sourceRooms = RessourceManageMap[res].source
                    .filter((r:any) => !sendOK[r]).map((r:any) => Game.rooms[r]);
            const targetRooms = RessourceManageMap[res].target
                    .map((r:any) => Game.rooms[r]);
            // 按资源数量降序排序
            sourceRooms.sort((a: Room, b: Room) => {
                return b.getResAmount(res) - a.getResAmount(res);
            });
            // 按资源数量升序排序
            targetRooms.sort((a: Room, b: Room) => {
                return a.getResAmount(res) - b.getResAmount(res);
            })
            // 多的分给少的
            let i = 0, j = 0;
            while (i < sourceRooms.length) {
                const sourceRoom = sourceRooms[i] as Room;
                const targetRoom = targetRooms[j] as Room;
                const sourceAmount = sourceRoom.getResAmount(res); // 供应房间的资源数量
                const terminalAmount = sourceRoom.terminal.store[res];  // 供应房间的终端资源数量
                const targetAmount = targetRoom.getResAmount(res); // 需求房间的资源数量
                const terminalCapacity = targetRoom.terminal.store.getFreeCapacity(); // 需求房间的终端空闲容量
                let sendAmount = Math.min(
                    // 不使供应房间的资源数量低于需求阈值
                    sourceAmount - (botmem[sourceRoom.name][res].target ?? 0),
                    // 发送数量不超过终端资源数量
                    terminalAmount,
                    // 不使需求房间的资源数量超过供应阈值
                    (botmem[targetRoom.name][res].source ?? Infinity) - targetAmount,
                    // 不使需求房间的资源数量超过需求阈值
                    (botmem[targetRoom.name][res].target ?? 0) - targetAmount,
                    // 不超过需求房间的终端容量
                    terminalCapacity
                );
                if (Goods.includes(res as any)) {
                    sendAmount = Math.min(sendAmount, 100)
                }
                let cost = Game.market.calcTransactionCost(sendAmount, sourceRoom.name, targetRoom.name);
                if (res == RESOURCE_ENERGY) {
                    sendAmount = Math.min(sendAmount, sourceRoom.terminal.store[RESOURCE_ENERGY] - cost);
                    cost = Game.market.calcTransactionCost(sendAmount, sourceRoom.name, targetRoom.name);
                } else if(cost > sourceRoom.terminal.store[RESOURCE_ENERGY]) {
                    sendAmount = sendAmount * sourceRoom.terminal.store[RESOURCE_ENERGY] / cost;
                    sendAmount = Math.floor(sendAmount);
                    cost = Game.market.calcTransactionCost(sendAmount, sourceRoom.name, targetRoom.name);
                }
                // 不发送非正数
                if (sendAmount <= 0) {
                    i++; continue;
                } else if (Goods.includes(res as any) && sendAmount < 10) {
                    i++; continue;
                } else if (res != RESOURCE_ENERGY && sendAmount < 1000) {
                    i++; continue;
                } else if (res == RESOURCE_ENERGY && sendAmount < 10000) {
                    i++; continue;
                }
                const result = sourceRoom.terminal.send(res as any, sendAmount, targetRoom.name, '资源自动管理');
                if (result == OK) {
                    global.log(`[资源管理] ${sourceRoom.name} -> ${targetRoom.name}, ${sendAmount} ${res}, cost: ${cost}`);
                    sendOK[sourceRoom.name] = true;
                    j = (j + 1) % targetRooms.length;
                    i++;
                } else {
                    i++;
                }
            }
        }
    }
}