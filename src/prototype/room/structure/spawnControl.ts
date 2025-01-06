import { RoleData } from '@/constant/CreepConstant';

export default class SpawnControl extends Room {
    VisualSpawnInfo() {
        this.spawn.forEach(spawn => {
            if (!spawn.spawning) {
                return;
            }
            const role = Memory.creeps[spawn.spawning.name].role;
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
}