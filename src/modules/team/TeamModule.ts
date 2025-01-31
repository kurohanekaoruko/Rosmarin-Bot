import Team from "./TeamClass";

const TeamModule = {
    tickStart: function () {
        if (Game.time % 10) return;
        for (const flagName in Game.flags) {
            // TEAM 四人小队
            // TEAM/类型/孵化房间/B-配置/N-最大孵化数量/T-孵化间隔
            if (flagName.startsWith('TEAM/')) {
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
                // 类型
                const type = flagName.match(/TEAM\/(\w+)/)?.[1] as any;
                // 配置
                const BodyBoost = flagName.match(/\/B-(\w+)/)?.[1];




            }

        }
        
    },
    tick: function () {
        if (!Memory['TeamData']) {
            Memory['TeamData'] = {};
            return;
        }

        for (const teamName in Memory['TeamData']) {
            const teamData = Memory['TeamData'][teamName] as TeamMemory;
            
            // 检查小队是否过期
            if(Game.time - teamData['time'] > 2000) {
                delete Memory['TeamData'][teamName];
                console.log(`四人小队${teamName}已解散.`);
                continue;
            }

            // 检查小队成员是否齐全
            if (teamData.state === 'ready') {
                let {A1, A2, B1, B2} = teamData.members;
                if (!A1 || !A2 || !B1 || B2) continue;
                teamData.state = 'active';
                continue;
            }

            // 构造小队对象
            const team = new Team(teamData);
            if (!team.members) {
                delete Memory['TeamData'][teamName];
                console.log(`四人小队${teamName}已解散.`);
                continue;
            }

            // 小队行动
            if (team.state === 'active') {
                team.tickRun();
            }

            // 保存小队数据
            teamData.state = team.state;
            teamData.action = team.action;
            teamData.toward = team.toward;
            teamData.formation = team.formation;
            teamData.targetRoom = team.targetRoom;
            teamData.cache = team.cache as any;
        }
    }
}

export default TeamModule