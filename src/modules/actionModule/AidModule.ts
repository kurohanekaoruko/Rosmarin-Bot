import { RoleBodys } from "@/constant/CreepConstant";

const AidModule = {
    tickEnd: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {

            // 增援建造
            // AID-BUILD/孵化房间/S-能量源房间/T-间隔
            if (flagName.startsWith('AID-BUILD/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 500;
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
                // 能量源房间
                let sourceRoom = flagName.match(/\/S-([EW][1-9]+[NS][1-9]+)/)?.[1];
                if (!sourceRoom) sourceRoom = targetRoom;
                
                let bodys = [];
                let memory = {
                    sourceRoom: sourceRoom,
                    targetRoom: targetRoom,
                } as CreepMemory;

                // 是否BOOST
                let boost = flagName.match(/\/B-(.*)$/)?.[1] as string || undefined;
                if (boost && RoleBodys['aid-build'][boost]) {
                    bodys = RoleBodys['aid-build'][boost].bodypart || [];
                    memory['BOOST'] = RoleBodys['aid-build'][boost].BOOST || {};
                    let result = room.AssignBoostTaskByBody(bodys, memory['BOOST']);
                    if (!result) {
                        bodys = [];
                        delete memory['BOOST'];
                    }
                }
                
                room.SpawnMissionAdd('', bodys, -1, 'aid-build', memory);
                flagMemory['lastTime'] = Game.time;
                continue;

            }

            // 增援升级
            // AID-UPGRADE/孵化房间/T-间隔
            if (flagName.startsWith('AID-UPGRADE/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 500;
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
                let memory = {
                    home: targetRoom,
                    targetRoom: targetRoom,
                } as CreepMemory;

                // 是否BOOST
                let boost = flagName.match(/\/B-(.*)$/)?.[1] as string || undefined;
                if (boost && RoleBodys['aid-upgrade'][boost]) {
                    bodys = RoleBodys['aid-upgrade'][boost].bodypart || [];
                    memory['BOOST'] = RoleBodys['aid-upgrade'][boost].BOOST || {};
                    let result = room.AssignBoostTaskByBody(bodys, memory['BOOST']);
                    if (!result) {
                        bodys = [];
                        delete memory['BOOST'];
                    }
                }
                
                room.SpawnMissionAdd('', bodys, -1, 'aid-upgrade', memory);
                flagMemory['lastTime'] = Game.time;
                continue;

            }
            
            // 增援冲级
            // AID-UUP/孵化房间/T-间隔
            if (flagName.startsWith('AID-UUP/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 500;
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

                room.SpawnMissionAdd('', bodys, -1, 'UP-upgrade', {
                    home: targetRoom,
                } as CreepMemory);
                flagMemory['lastTime'] = Game.time;
                continue;
            }

            // 增援能量
            // AID-ENERGY/孵化房间/B-BOOST配置/T-间隔
            if (flagName.startsWith('AID-ENERGY/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/T-(\d+)/)?.[1] as any;
                if (!spawnInterval) spawnInterval = 500;
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
                let memory = {
                    sourceRoom: spawnRoom,
                    targetRoom: targetRoom,
                    resource: RESOURCE_ENERGY,
                } as any;

                // 是否BOOST
                let boost = flagName.match(/\/B-(.*)$/)?.[1] as string || undefined;
                if (boost && RoleBodys['aid-carry'][boost]) {
                    bodys = RoleBodys['aid-carry'][boost].bodypart || [];
                    memory['BOOST'] = RoleBodys['aid-carry'][boost].BOOST || {};
                    let result = room.AssignBoostTaskByBody(bodys, memory['BOOST']);
                    if (!result) {
                        bodys = [];
                        delete memory['BOOST'];
                    }
                }

                room.SpawnMissionAdd('', bodys, -1, 'aid-carry', memory);
                flagMemory['lastTime'] = Game.time;
                continue;
            }
        }
    }
}

export {AidModule};