export default class TowerControl extends Room {
    /** 呼叫全体tower对目标发起攻击 */
    CallTowerAttack(target: any) {
        this.tower.forEach(tower => {
            if (tower.store['energy'] < 10) return;
            tower.attack(target);
        });
    }

    /** 呼叫全体tower对目标治疗 */
    CallTowerHeal(target: any) {
        this.tower.forEach(tower => {
            if (tower.store['energy'] < 10) return;
            tower.heal(target);
        });
    }

    /** 呼叫全体tower对目标维修 */
    CallTowerRepair(target: any, energy: number = 10) {
        this.tower.forEach(tower => {
            if (tower.store['energy'] < energy) return;
            tower.repair(target);
        });
    }

    /**
     * 计算Tower的伤害
     * @param dist 攻击距离
     * @returns 
     */
    TowerDamage(dist: number) {
        if (dist <= 5) return 600;
        else if (dist <= 20) return 600 - (dist - 5) * 30;
        else return 150;
    }

    /**
     * 计算全部tower对某一点的伤害总值
     * @param {RoomPosition} pos 要计算伤害的点
     */
    TowerTotalDamage(pos: RoomPosition) {
        if(this.name != pos.roomName) return 0;
        return _.sum(this.tower, tower => {
            if (tower.store.energy < 10) return 0;
            let ratio = 1;
            if (tower.effects && tower.effects.length) {
                tower.effects.forEach(effect => {
                    if (effect.effect !== PWR_OPERATE_TOWER) return;
                    ratio = POWER_INFO[effect.effect].effect[effect.level];
                });
            }
            return this.TowerDamage(tower.pos.getRangeTo(pos)) * ratio;
        });
    }

    /**
     * 计算全部Tower对某个creep可能造成的实际伤害
     * @param {Creep} creep 要计算伤害的creep
     */
    TowerDamageToCreep(creep: Creep) {
        if(this.name != creep.room.name) return 0;
        if (creep['_towerDamage']) return creep['_towerDamage'];
        // tower伤害
        let towerDamage = this.TowerTotalDamage(creep.pos) || 0;
        if (this.my && this.controller.safeMode) return towerDamage;
        // tough减伤后的伤害
        let realDamage = 0; // 实际伤害
        creep.body?.forEach(part => {
            if (towerDamage <= 0 || part.hits <= 0) return;
            // 对该部件造成的伤害
            let partDamage = 0;
            if (part.type == TOUGH && part.boost) {
                partDamage = Math.min(Math.floor(towerDamage * BOOSTS[TOUGH][part.boost].damage), part.hits);
            } else {
                partDamage = Math.min(towerDamage, part.hits);
            }
            // 造成该伤害, 需要消耗多少原伤害
            if (part.type == TOUGH && part.boost) {
                towerDamage -=  Math.ceil(part.hits / BOOSTS[TOUGH][part.boost].damage)
            } else {
                towerDamage -= partDamage;
            }
            realDamage += partDamage
        });
        if (towerDamage > 0) realDamage += towerDamage;
        // 治疗量
        const healers = creep.pos.findInRange(FIND_CREEPS, 1, {
            filter: c => creep.owner.username == c.owner.username && c.body.some(b => b.type == HEAL)
        }) || [];
        let totalHeal = 0;
        const BOOST_POWER = {
            'LO': 2,
            'LHO2': 3,
            'XLHO2': 4,
        }
        healers.forEach(c => {
            if (c['_heal']) {
                totalHeal += c['_heal'];
                return;
            }
            let h = 0;
            c.body.forEach(part => {
                if (part.type !== HEAL || part.hits <= 0) return;
                else if (!part.boost) h += 12
                else h += 12 * BOOST_POWER[part.boost];
            })
            c['_heal'] = h
            totalHeal += h;
        })
        creep['_towerDamage'] = realDamage - totalHeal;
        return realDamage - totalHeal;
    }


    // 治疗己方所有单位
    TowerHealCreep() {
        if (!global.towerHealTargets) global.towerHealTargets = {};
        if (Game.time % 10 == 0) {
            global.towerHealTargets[this.name] = this.find(FIND_POWER_CREEPS, {
                filter: c => c.hits < c.hitsMax && (c.my || Memory['whitelist']?.includes(c.owner.username))
                }).map(c => c.id);
            global.towerHealTargets[this.name] = global.towerHealTargets[this.name].concat(this.find(FIND_CREEPS, {
                filter: c => c.hits < c.hitsMax && (c.my || Memory['whitelist']?.includes(c.owner.username))
            }).map(c => c.id));
        }
        const healTarget = (global.towerHealTargets[this.name]||[])
                .map((id: Id<Creep>) => Game.getObjectById(id))
                .filter((c: Creep | null) => c && c.hits < c.hitsMax) as any[];
        if (healTarget.length > 0) {
            // 战力单位优先
            const attackerCreeps = healTarget.filter(c => c?.body &&
                c.body.some((bodyPart: BodyPartConstant) => 
                    bodyPart == ATTACK || bodyPart == RANGED_ATTACK));
            if (attackerCreeps.length > 0) {
                this.tower.forEach(tower => {
                    let index = Math.floor(Math.random() * attackerCreeps.length);
                    tower.heal(attackerCreeps[index]);
                })
            } else {
                this.tower.forEach(tower => {
                    let index = Math.floor(Math.random() * healTarget.length);
                    tower.heal(healTarget[index]);
                })
            }
            return true;
        }
        return false;
    }

    // 自动修复被攻击的建筑(仅rampart和wall)
    TowerAutoRepair() {
        const AttackedStruct = []
        if(this.memory.defend) {
            for (let e of this.getEventLog()) {
                if (e.event !== EVENT_ATTACK) continue;
                if (e.data.attackType == EVENT_ATTACK_TYPE_DISMANTLE) continue;
                if (e.data.attackType == EVENT_ATTACK_TYPE_HIT_BACK) continue;
                if (e.data.attackType == EVENT_ATTACK_TYPE_NUKE) continue;
                const target = Game.getObjectById(e.data.targetId) as Structure;
                if (!target) continue;
                if (target.structureType == STRUCTURE_WALL ||
                    target.structureType == STRUCTURE_RAMPART) {
                        AttackedStruct.push(target)
                }
            }
        }
        if (AttackedStruct.length > 0) {
            let target = null;
            if (AttackedStruct.length == 1) {
                target = AttackedStruct[0];
            } else {
                target = AttackedStruct.reduce((a, b) => {
                    if (a.hits < b.hits) return a;
                    else return b;
                })
            }
            this.CallTowerRepair(target, 500);
            return true;
        }
        return false;
    }

    // 攻击NPC单位
    TowerAttackNPC() {
        if (!global.towerAttackNPC) global.towerAttackNPC = {};
        if (Game.time % 10 == 0) {
            global.towerAttackNPC[this.name] = this.find(FIND_HOSTILE_CREEPS, {
                filter: c => c.owner.username == 'Source Keeper' || c.owner.username == 'Invader'
            }).map(c => c.id);
        }
        let Hostiles = (global.towerAttackNPC[this.name]||[])
                    .map((id: Id<Creep>) => Game.getObjectById(id))
                    .filter((c:Creep) => c && this.TowerDamageToCreep(c) > 0);
        if (Hostiles.length > 0) {
            this.tower.forEach(tower => {
                let index = Math.floor(Math.random() * Hostiles.length);
                tower.attack(Hostiles[index]);
            })
            return true;
        }
        return false;
    }

    // 攻击敌人
    TowerAttackEnemy() {
        // 激活防御模式时才主动攻击敌人
        if (!this.memory.defend) return false;
        // 搜寻敌人
        if (!global.towerTargets) global.towerTargets = {};
        if (Game.time % 10 == 0) {
            global.towerTargets[this.name] = 
                [
                    ...this.find(FIND_HOSTILE_CREEPS)
                    .filter(c => !c.isWhiteList())
                    .map(c => c.id),
                    ...this.find(FIND_HOSTILE_POWER_CREEPS)
                    .filter(c => !Memory['whitelist']?.includes(c.owner.username))
                ]
        }
        if (!global.towerTargets[this.name] ||
            global.towerTargets[this.name].length == 0) return false;
        // 筛选敌人
        let Hostiles = (global.towerTargets[this.name]||[])
                        .map((id: Id<Creep>) => Game.getObjectById(id))
                        .filter((c: Creep | null) => c) as Creep[] | PowerCreep[];
        if (Hostiles.length == 0) return false;


        // 算伤
        let hostile = Hostiles.reduce((a, b) => {
            let A = this.TowerDamageToCreep(a as any);
            let B = this.TowerDamageToCreep(b as any);
            if (A > B) return a;
            else return b;
        })

        // 攻击
        if (this.TowerDamageToCreep(hostile as any) > 0) {
            this.tower.forEach(tower => {
                tower.attack(hostile);
            })
            return true;
        }
        // else {
        //     let index = Math.floor(Math.random() * Hostiles.length);
        //     this.tower.forEach(tower => {
        //         if (Hostiles.length == 0) return;
        //         tower.attack(Hostiles[index]);
        //     })
        // }
        
        return true;
    
    }

    // 处理普通修复任务, 修复建筑物
    TowerTaskRepair() {
        if (!global.towerRepairTarget) global.towerRepairTarget = {};
        if (Game.time % 10 == 0) {
            global.towerRepairTarget[this.name] = null;
            if (this.checkMissionInPool('repair')) {
                const center = Memory['RoomControlData'][this.name]?.center
                const posInfo = `${center?.x||25}/${center?.y||25}/${this.name}`
                const hits = this[RESOURCE_ENERGY] > 200000 ? 1e6 : this[RESOURCE_ENERGY] > 100000 ? 3e5 : 3e4;
                const task = this.getMissionFromPool('repair', posInfo,
                    (t) => (Game.getObjectById(t.data.target) as any)?.hits <= hits
                );
                if(!task) return false;
                const target = Game.getObjectById(task.data.target) as Structure;
                if(!target) return false;
                if (target.hits >= task.data.hits) {
                    this.deleteMissionFromPool('repair', task.id);
                    return false;
                }
                global.towerRepairTarget[this.name] = target.id;
            }
        }
        const target = Game.getObjectById(global.towerRepairTarget[this.name]) as Structure;
        if(target) {
            this.tower.forEach(t => {
                // 如果塔的能量不足，则不执行修复逻辑
                if(t.store[RESOURCE_ENERGY] < 500) return;
                t.repair(target);
            });
            return true;
        }
        return false;
    }
}
