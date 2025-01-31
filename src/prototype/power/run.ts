export default class PowerCreepRun extends PowerCreep {
    run() {
        if(!this.room) return;
        const name = this.name;

        // 续命
        if(this.ToRenew()) return;

        // 移动到指定位置
        const flag = Game.flags[`${name}-move`];
        if (flag && !this.pos.inRangeTo(flag, 0)) {
            this.Generate_OPS();
            this.moveTo(Game.flags[`${name}-move`], {visualizePathStyle: {stroke: '#ff0000'}, plainCost: 1, swampCost: 1});
            return;
        }
        // 移动到工作房间
        const flagHome = Game.flags[`${name}-home`];
        if (flagHome && (this.room.name != flagHome.pos.roomName || this.pos.isRoomEdge())) {
            this.moveTo(flagHome, {visualizePathStyle: {stroke: '#ff0000'}, plainCost: 1, swampCost: 1});
            return;
        }


        // 房间开启power
        if(this.PowerEnabled()) return;
        // 生成ops
        if(this.Generate_OPS())  return;

        if (this.room.my) {
            // 转移ops
            if(this.transferOPS())  return;
            // 取ops
            if(this.withdrawOPS())  return;
            const role = name.match(/(\w+)-\d+/)[1];
            if(PowerCreepAction[role]?.(this)) return;
        } else if (this.room.isWhiteList()) {
            // 加速spawn
            if(Game.flags[`${name}-spawn`] &&
                this.Operate_Spawn()) return;
            // 填充扩展
            if(Game.flags[`${name}-ext`] &&
                this.Operate_Extension()) return;

        } else {
            
        }
        
        // 移动到待机位置
        const idleFlag = Game.flags[`${name}-idle`];
        if (idleFlag && !this.pos.isEqual(idleFlag.pos) &&
            this.pos.roomName == idleFlag.pos.roomName) {
            this.moveTo(idleFlag, {visualizePathStyle: {stroke: '#ff0000'}, plainCost: 1, swampCost: 1});
        }
    }
}

const PowerCreepAction = {
    'F': function(pc: PowerCreep) {
        if(pc.Operate_Storage())  return true;  // 扩容storage
        if(pc.Operate_Factory())  return true;    // 操作工厂
        if(pc.Operate_LAB())  return true;      // 增速lab
        if(pc.Operate_Tower())  return true;      // 增强塔
        if(pc.transferPower())  return true;      // 填充power
    },
    'O': function(pc: PowerCreep) {
        if(pc.Regen_Source())  return true;       // 生成能量
        if(pc.Operate_Storage())  return true;  // 扩容storage
        if(pc.Operate_Tower())  return true;      // 增强塔
        if(pc.Operate_Extension())  return true;  // 填充扩展
        if(pc.Operate_Spawn())  return true;        // 加速spawn
        if(pc.Operate_Power())  return true;  // 提高Power处理速率
    },
}
