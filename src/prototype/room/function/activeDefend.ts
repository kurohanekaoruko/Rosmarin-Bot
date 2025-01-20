export default class ActiveDefend extends Room {
    activeDefend() {
        // 如果处于安全模式，则不进行主动防御
        if (this.controller.safeMode) return;

        // 处于防御时, 关键建筑如果受到损坏, 激活安全模式
        if (this.memory.defend) {
            let STRUCTURE = [this.storage, this.terminal, ...this.spawn].filter(s => s);
            if (this.controller.safeModeAvailable > 0 &&
                this.controller.safeModeCooldown == 0 &&
                STRUCTURE.some(s => s.hits < s.hitsMax * 0.7)) {
                this.controller.activateSafeMode();
                return;
            }
        }

        // 关于主动防御的检查
        if (Game.time % 5) return;
        // const defend_mode = Memory['RoomControlData'][this.name]['defend_mode'];

        if (!Memory['whitelist']) Memory['whitelist'] = [];
        let hostiles = this.find(FIND_HOSTILE_CREEPS, {
            filter: hostile => 
                !Memory['whitelist'].includes(hostile.owner.username) &&
                hostile.owner.username != 'Source Keeper' &&
                hostile.owner.username != 'Invader' &&
                (hostile.getActiveBodyparts(ATTACK) > 0 || 
                hostile.getActiveBodyparts(RANGED_ATTACK) > 0 ||
                hostile.getActiveBodyparts(HEAL) > 0 ||
                hostile.getActiveBodyparts(WORK) > 0)
        }) as any;
        let power_hostiles = this.find(FIND_HOSTILE_POWER_CREEPS,{
            filter: hostile => !Memory['whitelist'].includes(hostile.owner.username)
        }) as any;
        hostiles = hostiles.concat(power_hostiles);

        if (hostiles.length == 0) {
            if(!global.Hostiles) global.Hostiles = {};
            global.Hostiles[this.name] = [];
            this.memory.defend = false;   // 离开防御模式
            return;
        }

        // 进入防御状态
        this.memory.defend = true;
        // 40A红球 或 40R蓝球
        if(!global.Hostiles) global.Hostiles = {};
        global.Hostiles[this.name] = hostiles.map((hostile: Creep) => hostile.id);
        if (this.level >= 7) {
            const attackDefender = Object.values(Game.creeps)
                .filter(creep => creep.room.name == this.name &&
                    creep.memory.role == 'defend-attack') as any;
            const rangedDefender = Object.values(Game.creeps)
                .filter(creep => creep.room.name == this.name &&
                    creep.memory.role == 'defend-ranged') as any;
            global.SpawnMissionNum[this.name] = this.getSpawnMissionAmount() || {};
            let attackQueueNum = global.SpawnMissionNum[this.name]['defend-attack'] || 0;
            let rangedQueueNum = global.SpawnMissionNum[this.name]['defend-ranged'] || 0;
            if (hostiles.some((c: Creep) => c.body.some(part => part.type == ATTACK) ||
                hostiles.some((c: Creep) => c.body.some(part => part.type == WORK))) &&
                (attackDefender.length + attackQueueNum) < 1) {
                let mustBoost = false;
                if (this['XUH2O'] >= 3000 && this['XZHO2'] >= 3000) {
                    mustBoost = true;
                }
                this.SpawnMissionAdd('', [], -1, 'defend-attack', {home: this.name, mustBoost} as any);
                if (mustBoost) {
                    this.AssignBoostTask('XUH2O', 1200);
                    this.AssignBoostTask('XZHO2', 300);
                }
            }
            if (hostiles.some((c: Creep) => c.body.some(part => part.type == RANGED_ATTACK)) &&
                (rangedDefender.length + rangedQueueNum < 1)) {
                let mustBoost = false;
                if (this['XKHO2'] >= 3000 && this['XZHO2'] >= 3000) {
                    mustBoost = true;
                }
                this.SpawnMissionAdd('', [], -1, 'defend-ranged', {home: this.name, mustBoost} as any);
                if (mustBoost) {
                    this.AssignBoostTask('XKHO2', 1200);
                    this.AssignBoostTask('XZHO2', 300);
                }
            }
        } else {
            const attackDefender = Object.values(Game.creeps)
                .filter(creep => creep.room.name == this.name &&
                    creep.memory.role == 'defend-attack') as any;
            global.SpawnMissionNum[this.name] = this.getSpawnMissionAmount() || {};
            let attackQueueNum = global.SpawnMissionNum[this.name]['defend-attack'] || 0;
            if (attackDefender.length + attackQueueNum < 1) {
                this.SpawnMissionAdd('', [], -1, 'defend-attack', {home: this.name} as any)
            }
        }
        
    }
}