const aid_build = {
    run: function (creep: Creep) {
        if (!creep.memory.ready) {
            creep.memory.ready = this.prepare(creep);
            return;
        }

        switch (creep.memory.action) {
            case 'harvest':
                this.harvest(creep);
                return;
            case 'build':
                this.build(creep);
                return;
            case 'repair':
                this.repair(creep);
                return;
            default:
                this.switch(creep);
                return;
        }
    },

    prepare: function (creep: Creep) {
        return creep.goBoost(['XLH2O', 'LH2O', 'LH']);
    },

    harvest: function (creep: Creep) {
        const sourceRoom = creep.memory.sourceRoom || creep.memory.targetRoom;
        if (sourceRoom && creep.room.name != creep.memory.sourceRoom) {
            creep.moveToRoom(creep.memory.sourceRoom);
            return;
        }

        if (!creep.room.source) {
            if (Game.time % 10 !== 0) return;
            creep.room.update();
        }

        if (!creep.room.source) return;

        const targetSource = creep.room.source.find(s => s.energy > 0);
        if (!targetSource && creep.store[RESOURCE_ENERGY] > 0) {
            creep.memory.action = '';
            return;
        }

        let result = creep.goHaverst(targetSource);
        if (!result) return;
        let energy = 0;
        for (const part of creep.body) {
            if (part.type !== WORK) continue;
            if (part.hits === 0) continue;
            if (!part.boost) energy += 2;
            else energy += 2 * (BOOSTS.work[part.boost]['harvest'] || 1);
        }
        if (creep.store.getFreeCapacity() > energy) return;
        creep.memory.action = '';
    },

    build: function (creep: Creep) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = '';
            return;
        }

        const targetRoom = creep.memory.targetRoom;
        if (targetRoom && creep.room.name != creep.memory.targetRoom && creep.pos.isRoomEdge()) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        if (creep.pos.isRoomEdge()) {
            creep.moveTo(creep.room.controller);
            return;
        }

        const site = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (site.length === 0) {
            creep.memory.action = '';
            return;
        }

        let targetSite = creep.pos.findClosestByRange(site, {
            filter: (s) => s.structureType == STRUCTURE_SPAWN ||
            s.structureType == STRUCTURE_STORAGE || s.structureType == STRUCTURE_TERMINAL
        });

        if (!targetSite) {
            targetSite = creep.pos.findClosestByRange(site, {
                filter: (s) => s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER
            });
        }

        if (!targetSite) {
            targetSite = creep.pos.findClosestByRange(site);
        }

        if (!targetSite) return;
        creep.goBuild(targetSite);
    },

    repair: function (creep: Creep) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = '';
            return;
        }

        const targetRoom = creep.memory.targetRoom;
        if (targetRoom && creep.room.name != creep.memory.targetRoom) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }

        if (creep.pos.isRoomEdge()) {
            creep.moveTo(creep.room.controller);
            return;
        }

        const repair = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax * 0.8})
        if (repair.length === 0) {
            creep.memory.action = '';
        }

        if (creep.memory.cache.repairTarget) {
            const repairTarget = Game.getObjectById(creep.memory.cache.repairTarget as Id<Structure>)
            if (repairTarget) {
                if (repairTarget.hits === repairTarget.hitsMax) {
                    creep.memory.cache.repairTarget = '';
                    creep.memory.action = '';
                    return;
                }
                creep.goRepair(repairTarget);
                return;
            }
        }

        creep.memory.action = '';
    },

    switch: function (creep: Creep) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = 'harvest';
            return;
        }

        const targetRoom = creep.memory.targetRoom;
        if (targetRoom && creep.room.name != creep.memory.targetRoom) {
            creep.moveToRoom(creep.memory.targetRoom);
            return;
        }


        const site = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (creep.store[RESOURCE_ENERGY] > 0 && site.length > 0) {
            creep.memory.action = 'build';
            return;
        }

        const repair = creep.room.find(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax * 0.8})
        if (creep.store[RESOURCE_ENERGY] > 0 && repair.length > 0) {
            creep.memory.action = 'repair';
            const repairTarget = repair.reduce((a, b) => a.hits < b.hits ? a : b);
            creep.memory.cache.repairTarget = repairTarget.id;
            return;
        }
    }
}
export default aid_build;