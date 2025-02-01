import { RoleData, RoleBodys } from "@/constant/CreepConstant";

const WarModule = {
    tickEnd: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {

            // AIO 一体机
            // AIO/孵化房间/B-配置/N-孵化数量/T-孵化间隔
            if (flagName.startsWith('AIO/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 1000;
                else spawnInterval = parseInt(spawnInterval);

                const flagMemory = Game.flags[flagName].memory;
                if ((Game.time - (flagMemory['lastTime']||0) < spawnInterval)) continue;

                // 孵化房间
                const spawnRoom = flagName.match(/\/([EW][1-9]+[NS][1-9]+)/)?.[1];
                const room = Game.rooms[spawnRoom];
                if (!spawnRoom || !room.my) {
                    Game.flags[flagName].remove();
                    continue;
                }

                // 目标房间
                const targetRoom = Game.flags[flagName].pos.roomName;

                let bodys = [];
                let boostmap = RoleData['aio'].boostmap || {};

                // 配置
                const B = flagName.match(/\/B-(\w+)/)?.[1];
                if (RoleBodys['aio'][B]) {
                    bodys = RoleBodys['aio'][B].bodypart || bodys;
                    boostmap = RoleBodys['aio'][B].boostmap || boostmap
                }

                let boostResult = null;
                if (bodys.length == 0) {
                    boostResult = room.AssignBoostTaskByBody(RoleData['aio'].bodypart, boostmap);
                } else {
                    boostResult = room.AssignBoostTaskByBody(bodys, boostmap);
                }

                if (!boostResult) {
                    console.log(flagName, '没有足够的boost资源');
                    Game.flags[flagName].remove();
                    continue;
                }

                room.SpawnMissionAdd('', bodys, -1, 'aio', {
                    targetRoom: targetRoom,
                    boostmap: boostmap,
                } as any);
                flagMemory['lastTime'] = Game.time;
                flagMemory['spawnCount'] = (flagMemory['spawnCount']||0) + 1;
                console.log(flagName, '已添加孵化任务.');

                // 孵化数量
                let spawnCount = flagName.match(/\/N-(\d+)/)?.[1] as any;
                if (!spawnCount) spawnCount = 0;
                else spawnCount = parseInt(spawnCount);
                if (flagMemory['spawnCount'] >= spawnCount) {
                    console.log(flagName, '孵化数量已满');
                    Game.flags[flagName].remove();
                }
                continue;
            }

            // 拆除房间 (用于墙厚的房间)
            if (flagName.startsWith('DISMANTLE/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 1000;
                else spawnInterval = parseInt(spawnInterval);

                const flagMemory = Game.flags[flagName].memory;
                if ((Game.time - (flagMemory['lastTime']||0) < spawnInterval)) continue;

                // 孵化房间
                const spawnRoom = flagName.match(/\/([EW][1-9]+[NS][1-9]+)/)?.[1];
                const room = Game.rooms[spawnRoom];
                if (!spawnRoom || !room.my) {
                    Game.flags[flagName].remove();
                    continue;
                }

                // 目标房间
                const targetRoom = Game.flags[flagName].pos.roomName;

                let bodys = [];
                let boostmap = RoleData['dismantle'].boostmap || {};

                // 配置
                const B = flagName.match(/\/B-(\w+)/)?.[1];
                if (B && RoleBodys['dismantle']?.[B]) {
                    bodys = RoleBodys['dismantle'][B].bodypart || bodys;
                    boostmap = RoleBodys['dismantle'][B].boostmap || boostmap
                }

                // 尝试添加boost任务
                let boostResult = null;
                if (bodys.length == 0) {
                    boostResult = room.AssignBoostTaskByBody(RoleData['dismantle'].bodypart, boostmap);
                } else {
                    boostResult = room.AssignBoostTaskByBody(bodys, boostmap);
                }
                
                // 返回false代表资源不足
                if (!boostResult) {
                    console.log(flagName, '没有足够的boost资源');
                    Game.flags[flagName].remove();
                    continue;
                }

                room.SpawnMissionAdd('', bodys, -1, 'dismantle', {
                    targetRoom: targetRoom,
                    boostmap: boostmap,
                } as any);
                flagMemory['lastTime'] = Game.time;
                flagMemory['spawnCount'] = (flagMemory['spawnCount']||0) + 1;
                console.log(flagName, '已添加孵化任务.');

                // 孵化数量
                let spawnCount = flagName.match(/\/N-(\d+)/)?.[1] as any;
                if (!spawnCount) spawnCount = 0;
                else spawnCount = parseInt(spawnCount);
                if (flagMemory['spawnCount'] >= spawnCount) {
                    console.log(flagName, '孵化数量已满');
                    Game.flags[flagName].remove();
                }
                continue;
            }

            // 双人小队
            // DOUBLE/配置/孵化房间/N-孵化数量/T-孵化间隔
            if (flagName.startsWith('DOUBLE/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 1000;
                else spawnInterval = parseInt(spawnInterval);

                const flagMemory = Game.flags[flagName].memory;
                if ((Game.time - (flagMemory['lastTime']||0) < spawnInterval)) continue;

                // 孵化房间
                const spawnRoom = flagName.match(/\/([EW][1-9]+[NS][1-9]+)/)?.[1];
                const room = Game.rooms[spawnRoom];
                if (!spawnRoom || !room.my) {
                    Game.flags[flagName].remove();
                    continue;
                }

                // 目标房间
                const targetRoom = Game.flags[flagName].pos.roomName;
                // 配置
                const config = flagName.match(/DOUBLE\/(\w+)/)?.[1] as any;
                // 类型
                const body = config.split(0,2)
                // boost配置
                const boost = config.length > 2 ? config.split(2) : null;

                let A_BODY: any, B_BODY: any;

                if (body == '2A') {
                    A_BODY = !boost ? RoleData['double-attack'] :
                        RoleBodys['double-attack'][boost] || RoleData['double-attack'];
                    B_BODY = !boost ? RoleData['double-heal']:
                        RoleBodys['double-heal'][boost] || RoleData['double-heal'];
                }
                else if (body == '2D') {
                    A_BODY = !boost ? RoleData['double-dismantle']:
                        RoleBodys['double-dismantle'][boost] || RoleData['double-dismantle'];
                    B_BODY = !boost ? RoleData['double-heal']:
                        RoleBodys['double-heal'][boost] || RoleData['double-heal'];
                }

                if (!A_BODY || !B_BODY) {
                    console.log(flagName, `不支持的二人小队类型${body}`);
                    Game.flags[flagName].remove();
                    continue;
                }

                if (A_BODY.boostmap && !room.CheckBoostRes(A_BODY.bodypart, A_BODY.boostmap)) {
                    console.log(flagName, '没有足够的boost资源');
                    Game.flags[flagName].remove();
                    continue;
                }
                if (B_BODY.boostmap && !room.CheckBoostRes(B_BODY.bodypart, B_BODY.boostmap)) {
                    console.log(flagName, '没有足够的boost资源');
                    Game.flags[flagName].remove();
                    continue;
                }

                room.AssignBoostTaskByBody(A_BODY.bodypart, A_BODY.boostmap);
                room.AssignBoostTaskByBody(B_BODY.bodypart, B_BODY.boostmap);

                if (body == '2A') {
                    // 添加孵化任务
                    room.SpawnMissionAdd('', A_BODY.bodypart, -1, 'double-attack', {
                        targetRoom: targetRoom,
                        boostmap: A_BODY.boostmap,
                        squad: 'attack'
                    } as any);
                    room.SpawnMissionAdd('', B_BODY.bodypart, -1, 'double-heal', {
                        targetRoom: targetRoom,
                        boostmap: B_BODY.boostmap,
                        squad: 'attack'
                    } as any)
                } else if (body == '2D') {
                    // 添加孵化任务
                    room.SpawnMissionAdd('', A_BODY.bodypart, -1, 'double-dismantle', {
                        targetRoom: targetRoom,
                        boostmap: A_BODY.boostmap,
                        squad: 'dismantle'
                    } as any);
                    room.SpawnMissionAdd('', B_BODY.bodypart, -1, 'double-heal', {
                        targetRoom: targetRoom,
                        boostmap: B_BODY.boostmap,
                        squad: 'dismantle'
                    } as any)
                }

                flagMemory['lastTime'] = Game.time;
                flagMemory['spawnCount'] = (flagMemory['spawnCount']||0) + 1;
                console.log(flagName, `已添加一支二人小队的孵化任务, 配置${config}`);

                // 孵化数量
                let spawnCount = flagName.match(/\/N-(\d+)/)?.[1] as any;
                if (!spawnCount) spawnCount = 0;
                else spawnCount = parseInt(spawnCount);
                if (spawnCount != 0 && flagMemory['spawnCount'] >= spawnCount) {
                    console.log(flagName, '孵化数量已满');
                    Game.flags[flagName].remove();
                }
            }
        }
    }
}

export {WarModule};