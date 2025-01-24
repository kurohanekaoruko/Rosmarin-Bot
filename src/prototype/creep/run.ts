import { RoleData } from '@/constant/CreepConstant';
import { sayConstant } from '@/constant/sayConstant';

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
    randomSay() {
        if (this.memory.sayText && this.memory.sayText.length > 0) {
            const text = this.memory.sayText.shift();
            if(text) this.say(text, true);
            return;
        }
    
        if (Math.random() > 0.007) return;
        this.memory.sayText = [];
    
        let text = null;
    
        if (this.room.my) {
            let index = Math.floor(Math.random() * sayConstant.length);
            text = sayConstant[index];
        }
        
        if(!text) return;
        if(typeof text === "string") {
            this.say(text, true);
        } else {
            text.forEach((t:string) => {
                this.memory.sayText.push(t)
            })
            this.memory.sayText.push('');
        }
    }
}