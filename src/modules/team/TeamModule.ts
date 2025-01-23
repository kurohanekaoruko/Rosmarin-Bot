import Team from "./TeamClass";

const TeamModule = {
    tick: function () {
        if (!Memory['TeamData']) {
            Memory['TeamData'] = {};
            return;
        }

        const teamList = Object.keys(Memory['TeamData']);
        for (const teamName of teamList) {
            const teamData = Memory['TeamData'][teamName] as TeamData;
            
            // 检查小队是否过期
            if(Game.time - teamData['time'] > 3000) {
                delete Memory['TeamData'][teamName];
                console.log(`四人小队${teamName}已解散.`);
                continue;
            }

            // 检查小队成员是否齐全
            if (teamData.state === 'ready') {
                let {A1, A2, B1, B2} = teamData.members;
                if (!A1 || !A2 || !B1 || B2) continue;
                teamData.state = 'idle';
                continue;
            }

            // 构造小队对象
            const team = new Team(teamData);
            if (!team.members) {
                delete Memory['TeamData'][teamName];
                console.log(`四人小队${teamName}已解散.`);
                continue;
            }

            // 让小队成员就位
            if (team.state === 'idle') {

            }
            // 小队行动
            if (team.state === 'active') {
                
            }
            




            // 保存小队数据
            teamData.state = team.state;
            teamData.direction = team.direction;
            teamData.formation = team.formation;
            teamData.targetRoom = team.targetRoom;
            teamData.cache = team.cache as any;
        }
    }
}

export default TeamModule