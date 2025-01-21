import { RoleData, RoleBodys } from "@/constant/CreepConstant";

const WarSpawnModule = {
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
                let BOOST = RoleData['aio'].BOOST || {};

                // 配置
                const B = flagName.match(/\/B-(.+)$/)?.[1];
                if (RoleBodys['aio'][B]) {
                    bodys = RoleBodys['aio'][B].bodypart || bodys;
                    BOOST = RoleBodys['aio'][B].BOOST || BOOST
                }

                let boostResult = null;
                if (bodys.length == 0) {
                    boostResult = room.AssignBoostTaskByBody(RoleData['aio'].bodypart, BOOST);
                } else {
                    boostResult = room.AssignBoostTaskByBody(bodys, BOOST);
                }

                if (!boostResult) {
                    console.log(flagName, '没有足够的boost资源');
                    Game.flags[flagName].remove();
                    continue;
                }

                room.SpawnMissionAdd('', bodys, -1, 'aio', {
                    targetRoom: targetRoom,
                    BOOST: BOOST,
                } as any);
                flagMemory['lastTime'] = Game.time;
                flagMemory['spawnCount'] = (flagMemory['spawnCount']||0) + 1;
                console.log(flagName, '已添加孵化任务.');

                // 孵化数量
                let spawnCount = flagName.match(/\/N-(\d+)/)?.[1] as any;
                if (!spawnCount) spawnCount = 0;
                else spawnCount = parseInt(spawnCount);
                if (spawnCount != 0 && flagMemory['spawnCount'] >= spawnCount) {
                    console.log(flagName, '孵化数量已满');
                    Game.flags[flagName].remove();
                }
            }

            // 双人小队
            // 2-SQUAD/类型/孵化房间/孵化数量/孵化间隔
            if (flagName.startsWith('2-SQUAD/')) {
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
                const targetRoom = flagName.match(/\/([EW][1-9]+[NS][1-9]+)/)?.[1];
                // 类型
                const type = flagName.match(/\/(.+)$/)?.[1] as any;


                if (type == 'ATTACK') {
                    let attackBodys = RoleBodys['double-attack'].bodypart || [];
                    let attackBOOST = RoleBodys['double-attack'].BOOST || {};

                }



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

export {WarSpawnModule};