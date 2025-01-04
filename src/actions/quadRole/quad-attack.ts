const quad_attack = {
    run: function (creep: Creep) {
        // 归队
        if (!creep.memory['rejoin']) {
            const squadName = creep.memory['squadName'];
            const squad = Memory['SquadData'][squadName];
            if(!squad) return;
            if (!squad['members']['A']) squad['members']['A'] = creep.id;
            else if (!squad['members']['C']) squad['members']['C'] = creep.id;
            else return;
            creep.memory['rejoin'] = true;
        }

        if (creep.memory['free']) {

        }
    }
}

export default quad_attack;