const r_site = {
    run: function (creep: Creep) {
        creep.heal(creep);

        if (!creep.memory.boosted) {
            const boost = ['XGHO2', 'XLHO2'];
            creep.memory.boosted = creep.goBoost(boost, true);
            return
        }

        if (creep.room.name != creep.memory.targetRoom || creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        const sites = creep.room.find(FIND_CONSTRUCTION_SITES).filter((site) => !site.my);
        let site = creep.pos.findClosestByRange(sites);
        if (site) creep.moveTo(site);
        
    }
}

export default r_site;