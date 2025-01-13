const AidModule = {
    tickEnd: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {
            // 增援建造
            const buildFlags = flagName.match(/^aid[-_]([EW][1-9]+[NS][1-9]+)[-_]build(?:[-_]([EW][1-9]+[NS][1-9]+))?$/);
            const buildFlagMemory = Game.flags[flagName].memory;
            if (buildFlags && (Game.time - (buildFlagMemory['lastTime']||0) >= 500)) {
                const room = Game.rooms[buildFlags[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'aid-build', {
                    sourceRoom: buildFlags[2] || Game.flags[flagName].pos.roomName,
                    targetRoom: Game.flags[flagName].pos.roomName
                } as any);
                buildFlagMemory['lastTime'] = Game.time;
                continue;
            }
            
            // 增援冲级
            const spupFlag = flagName.match(/^aid[-_]([EW][1-9]+[NS][1-9]+)[-_]spup(\d+)?(?:[-_].*)?$/);
            const spupFlagMemory = Game.flags[flagName].memory;
            if (spupFlag && ((Game.time - (spupFlagMemory['lastTime']||0)) >= (spupFlag[2] ? 1500/parseInt(spupFlag[2]) : 500))) {
                const room = Game.rooms[spupFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], 12, 'speedup-upgrade', {
                    home: Game.flags[flagName].pos.roomName
                } as any);
                spupFlagMemory['lastTime'] = Game.time;
                continue;
            }
            

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