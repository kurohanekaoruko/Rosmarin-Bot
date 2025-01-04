export default class WorkFunction extends Creep {
    /**
     * 采集资源
    */
    goHaverst(target: Source | Mineral) {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.isNearTo(target)) {
            this.harvest(target);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffaa00' },
                maxRooms: 1,
                range: 1
            });
            return false;
        }
    }
    /**
     * 从指定结构中提取资源
     */
    goWithdraw(target: any, resourceType?: ResourceConstant, ...args: any[]): boolean {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.isNearTo(target)) {
            if (!resourceType) resourceType = Object.keys(target.store)[0] as ResourceConstant;
            this.withdraw(target, resourceType, ...args);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffaa00' },
                maxRooms: 1,
                range: 1
            });
            return false;
        }
    }
    /**
     * 向指定结构转移资源
     */
    goTransfer(target: AnyCreep | Structure, resoureType?: ResourceConstant, amount?: number): boolean {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.isNearTo(target)) {
            if (!resoureType) resoureType = Object.keys(this.store)[0] as ResourceConstant;
            this.transfer(target, resoureType, amount);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffffff' },
                maxRooms: 1,
                range: 1
            });
            return false;
        }
    }
    /**
     * 拾取掉落资源
     */
    goPickup(target: Resource): boolean {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.isNearTo(target)) {
            this.pickup(target);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffaa00' },
                maxRooms: 1,
                range: 1
            });
            return false;
        }
    }
    /**
     * 建造
     */
    goBuild(target: ConstructionSite) {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.inRangeTo(target, 3)) {
            this.build(target);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffaa00' },
                maxRooms: 1,
                range: 3
            });
            return false;
        }
    }
    /**
     * 维修
     */
    goRepair(target: Structure) {
        if (!target) return false; // 如果没有目标，返回 false
        if (this.pos.inRangeTo(target, 3)) {
            this.repair(target);
            return true;
        } else {
            this.moveTo(target, {
                visualizePathStyle: { stroke: '#ffaa00' },
                maxRooms: 1,
                range: 3
            })
            return false;
        }
    }
}

