const ClaimModule = {
    tickEnd: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {

            if (flagName.startsWith('CLAIM/')) {
                // 孵化房间
                const spawnRoom = flagName.match(/\/([EW][1-9]+[NS][1-9]+)/)?.[1];
                const room = Game.rooms[spawnRoom];
                if (!spawnRoom || !room.my) {
                    Game.flags[flagName].remove();
                    continue;
                }
                const targetRoom = Game.flags[flagName].pos.roomName;
                const isNotCenterRoom = !(/^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom)); // 非中间房间
                const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间
                if (isNotCenterRoom && isNotHighway &&
                    (!Game.rooms[targetRoom] || !Game.rooms[targetRoom].my)) {
                    room.SpawnMissionAdd('', [], -1, 'claimer',{
                        targetRoom: targetRoom
                    } as any);
                }
                Game.flags[flagName].remove();
                continue;
            }


            
            // 搜刮资源
            const despoilFlag = flagName.match(/^r-([EW][1-9]+[NS][1-9]+)[-_]despoil(?:[-_].*)?$/);
            const despoilFlagMemory = Game.flags[flagName].memory;
            if (despoilFlag && (Game.time - (despoilFlagMemory['lastTime']||0) >= 500)) {
                const room = Game.rooms[despoilFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'logistic', { 
                    targetRoom: despoilFlag[1],
                    sourceRoom: Game.flags[flagName].pos.roomName
                } as any);
                despoilFlagMemory['lastTime'] = Game.time;
                continue;
            }

            // 攻击控制器
            const aclaimFlag = flagName.match(/^r-([EW][1-9]+[NS][1-9]+)[-_]aclaim$/);
            const aclaimFlagMemory = Game.flags[flagName].memory;
            if (aclaimFlag && (Game.time - (aclaimFlagMemory['lastTime']||0) >= 1000)) {
                const room = Game.rooms[aclaimFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'aclaimer', { 
                    homeRoom: aclaimFlag[1],
                    targetRoom: Game.flags[flagName].pos.roomName
                } as any);
                aclaimFlagMemory['lastTime'] = Game.time;
                continue;
            }

            // 攻击控制器
            const haclaimFlag = flagName.match(/^r-([EW][1-9]+[NS][1-9]+)[-_]haclaim$/);
            const haclaimFlagMemory = Game.flags[flagName].memory;
            if (haclaimFlag && (Game.time - (haclaimFlagMemory['lastTime']||0) >= 1000)) {
                const room = Game.rooms[haclaimFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'healAclaimer', { 
                    homeRoom: haclaimFlag[1],
                    targetRoom: Game.flags[flagName].pos.roomName
                } as any);
                haclaimFlagMemory['lastTime'] = Game.time;
                continue;
            }

            // 踩建筑点
            const rSiteFlag = flagName.match(/^r-([EW][1-9]+[NS][1-9]+)[-_]rSite(?:[-_].*)?$/);
            const rSiteFlagMemory = Game.flags[flagName].memory;
            if (rSiteFlag && (Game.time - (rSiteFlagMemory['lastTime']||0) >= 1000)) {
                const room = Game.rooms[rSiteFlag[1]];
                if (!room.controller || !room.controller.my) continue;
                room.SpawnMissionAdd('', [], -1, 'r-site', {
                    targetRoom: Game.flags[flagName].pos.roomName,
                    sourceRoom: room.name,
                } as any)
                rSiteFlagMemory['lastTime'] = Game.time;
                continue;
            }

        }
    }
}

export {ClaimModule};

