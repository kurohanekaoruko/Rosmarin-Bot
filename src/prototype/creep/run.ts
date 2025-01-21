import { RoleData } from '@/constant/CreepConstant';

export default class CreepRun extends Creep {
    run() {
        const role = this.memory.role;
        const roledata = RoleData[role];
        if(!roledata) return;

        // 根据状态切换行动
        if(roledata.work) {
            if (!this.memory.cache) { this.memory.cache = {} };
            const func = roledata.work;
            if (func.prepare && !this.memory.ready) {
                this.memory.ready = func.prepare(this);
            }

            let stateChange = false;
            if (this.memory.working)
                stateChange = func.target(this);
            else stateChange = func.source(this);

            if (stateChange) {
                this.memory.working = !this.memory.working;
                this.memory.cache = {}; // 清空临时缓存
            }
        }
        else if(roledata.mission) {
            roledata.mission.run(this);
        }
        else if(roledata.action) {
            roledata.action.run(this);
        }
        else return;
    }
}