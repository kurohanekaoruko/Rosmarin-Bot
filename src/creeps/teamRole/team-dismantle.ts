const team_dismantle = {
    run: function (creep: Creep) {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }
        if (!creep.memory.boosted) {
            if (creep.memory['boostmap']) {
                let result = creep.Boost(creep.memory['boostmap']);
                if (result === OK) {
                    creep.memory.boosted = true;
                }
            } else {
                creep.memory.boosted = creep.goBoost([
                    'XGHO2', 'GHO2', 'GO',
                    'XZH2O', 'ZH2O', 'ZH'
                ]);
            }
            return;
        }

        // 归队
        if (!creep.memory['rejoin']) {
            const teamName = creep.memory['teamName'];
            const team = Memory['TeamData'][teamName];
            if(!team) return;
            if (!team['members']['A1']) team['members']['A1'] = creep.id;
            else if (!team['members']['A2']) team['members']['A2'] = creep.id;
            else return;
            creep.memory['rejoin'] = true;
        }

        
    }
}

export default team_dismantle;