const quad_heal = {
    run: function (creep: Creep) {
        // 归队
        if (!creep.memory['rejoin']) {
            const squadName = creep.memory['squadName'];
            const squad = Memory['SquadData'][squadName];
            if(!squad) return;
            if (!squad['members']['B']) squad['members']['B'] = creep.id;
            else if (!squad['members']['D']) squad['members']['D'] = creep.id;
            else return;
            creep.memory['rejoin'] = true;
        }
        
    }
}

export default quad_heal;