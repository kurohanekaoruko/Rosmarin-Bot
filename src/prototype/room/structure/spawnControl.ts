import { RoleData } from '@/constant/CreepConstant';

export default class SpawnControl extends Room {
    VisualSpawnInfo() {
        this.spawn.forEach(spawn => {
            if (!spawn.spawning) {
                return;
            }
            const role = Memory.creeps[spawn.spawning.name]?.role;
            if (!role) {
                spawn.spawning.cancel();
                return;
            }
            const code = RoleData[role]?.code;
            this.visual.text(
                `${code} 🕒${spawn.spawning.remainingTime}`,
                spawn.pos.x,
                spawn.pos.y,
                { align: 'center',
                  color: 'red',
                  stroke: '#ffffff',
                  strokeWidth: 0.05,
                  font: 'bold 0.32 inter' }
            )
        })
    }

    GetSpawnTaskData() {
        if (this.energyAvailable < 250) return;
        
        const task = this.getSpawnMission();
        if (!task) return;

        const data = task.data as SpawnTask;
        let role = data.memory.role;

        if (!role) {
            this.deleteMissionFromPool('spawn', task.id);
            return this.GetSpawnTaskData();
        }

        let body: any[];
        if (data.body?.length > 0) {
            body = data.body;
        } else {
            body = this.GetRoleBodys(role, data.upbody);
        }
        const bodypart = this.GenerateBodys(body, role);
        if (!bodypart || bodypart.length == 0) {
            this.deleteMissionFromPool('spawn', task.id);
            return this.GetSpawnTaskData();
        }

        const cost = this.CalculateEnergy(bodypart);
        if (cost > this.energyCapacityAvailable) {
            this.deleteMissionFromPool('spawn', task.id);
            return this.GetSpawnTaskData();
        }

        let name = GenCreepName(data.name||RoleData[role].code);

        return {
            bodypart,
            name,
            memory: data.memory,
            taskId: task.id,
            cost
        }
    }

    SpawnCreep() {
        const spawn = this.spawn.find(spawn => !spawn.spawning);
        if (!spawn) return;

        const data = this.GetSpawnTaskData();
        if (!data) return;

        const result = spawn.spawnCreep(data.bodypart, data.name, {
            memory: data.memory,
            directions: [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]
        })

        let role = data.memory.role;
        if (result == OK) {
            if (!global.CreepNum) global.CreepNum = {};
            if (!global.CreepNum[this.name]) global.CreepNum[this.name] = {};
            global.CreepNum[this.name][role] = (global.CreepNum[this.name][role] || 0) + 1;
            this.submitSpawnMission(data.taskId);
            return;
        }

        if (Game.time % 10) return;
        if (data.cost > this.energyAvailable) {
            if (role !== 'harvester' && role !== 'transport' && role !== 'carrier' && role !== 'manager') return;
            if (role == 'manager') role = 'carrier';
            if (role == 'transport') role = 'carrier';
            const num = this.find(FIND_MY_CREEPS, {filter: c => c.memory.role == role}).length;
            if (num !== 0) return;
            
            let univ = this.find(FIND_MY_CREEPS, {filter: c => c.memory.role == 'universal'}).length +
                (global.SpawnMissionNum[this.name]?.['universal'] || 0)
            if (univ >= 2) return;

            spawn.spawnCreep(
                this.GenerateBodys(RoleData['universal'].bodypart),
                GenCreepName(RoleData['universal'].code),
                { memory: { role: 'universal', home: this.name } as CreepMemory }
            );
            global.log(`房间 ${this.name} 没有且不足以孵化 ${role}，已紧急孵化 universal。`);
            
        }
    }
}

import { CreepNameConstant } from '@/constant/CreepNameConstant';

export function GenSortNumber() {
    return (Game.time*1296 + Math.floor(Math.random()*1296)).toString(36).slice(-4).toUpperCase();
}

export function GenCreepName(code: string) {
    const number = GenSortNumber();
    const index = Math.floor(Game.time * Math.random() * 1000) % CreepNameConstant.length;
    const name = `【${CreepNameConstant[index]}】${code}#${number}`;
    if (Game.creeps[name]) {
        return GenCreepName(code);
    } else {
        return name;
    }
}