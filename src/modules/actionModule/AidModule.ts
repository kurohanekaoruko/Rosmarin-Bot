import { RoleBodys } from "@/constant/CreepConstant";

const AidModule = {
    tickEnd: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {

            // 增援建造
            // AID-BUILD/孵化房间/SOURCE-能量源房间/TIME-间隔
            if (flagName.startsWith('AID-BUILD/')) {
                // 孵化间隔
                let spawnInterval = flagName.match(/\/TIME-(\d+)/)?.[1] as any;
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
                let sourceRoom = flagName.match(/\/SOURCE-([EW][1-9]+[NS][1-9]+)/)?.[1];
                if (!sourceRoom) sourceRoom = targetRoom;
                
                let bodys = [];
                let memory = {
                    sourceRoom: sourceRoom,
                    targetRoom: targetRoom,
                } as CreepMemory;

                // 是否BOOST
                let boost = flagName.match(/\/BOOST-(.*)$/)?.[1] as string || undefined;
                if (boost && RoleBodys['aid-build'][boost]) {
                    bodys = RoleBodys['aid-build'][boost].bodypart || [];
                    memory['BOOST'] = RoleBodys['aid-build'][boost].BOOST || [];

                }
                
                room.SpawnMissionAdd('', bodys, -1, 'aid-build', memory);
                flagMemory['lastTime'] = Game.time;
                continue;

            }




            
            
            // // 增援冲级
            // const spupFlag = flagName.match(/^aid[-_]([EW][1-9]+[NS][1-9]+)[-_]spup(\d+)?(?:[-_].*)?$/);
            // const spupFlagMemory = Game.flags[flagName].memory;
            // if (spupFlag && ((Game.time - (spupFlagMemory['lastTime']||0)) >= (spupFlag[2] ? 1500/parseInt(spupFlag[2]) : 500))) {
            //     const room = Game.rooms[spupFlag[1]];
            //     if (!room.controller || !room.controller.my) continue;
            //     room.SpawnMissionAdd('', [], 12, 'UP-upgrade', {
            //         home: Game.flags[flagName].pos.roomName
            //     } as any);
            //     spupFlagMemory['lastTime'] = Game.time;
            //     continue;
            // }
            

            // 增援能量
            const carryEnergyFlag = flagName.match(/^aid[-_]([EW][1-9]+[NS][1-9]+)[-_]energy(?:[-_].*)?$/);
            const carryEnergyFlagMemory = Game.flags[flagName].memory;
            if (carryEnergyFlag && (Game.time - (carryEnergyFlagMemory['lastTime']||0) >= 500)) {
                const room = Game.rooms[carryEnergyFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'aid-carry', {
                    sourceRoom: carryEnergyFlag[1],
                    targetRoom: Game.flags[flagName].pos.roomName
                } as any);
                carryEnergyFlagMemory['lastTime'] = Game.time;
                continue;
            }

            
        }
    }
}

export {AidModule};