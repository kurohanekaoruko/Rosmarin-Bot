
const action = {
    move: function (creep: Creep) {
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const moveflag = Game.flags[name + '-move'];
        if(moveflag && !creep.pos.inRangeTo(moveflag.pos, 0)) {
            if(creep.room.name !== moveflag.pos.roomName) {
                creep.memory.targetRoom = moveflag.pos.roomName;
            }
            creep.doubleMoveTo(moveflag.pos, '#ff0000')
            return true;
        }
        return false
    },
    attack: function (creep: Creep) {
        // 索敌进攻
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const aFlag = Game.flags[name + '-attack'];
        if(aFlag && creep.room.name !== aFlag.pos.roomName) {
            creep.memory.targetRoom = aFlag.pos.roomName;
            return true;
        }

        if (aFlag) {
            const enemies = creep.room
                            .lookForAtArea(LOOK_CREEPS,
                                Math.max(aFlag.pos.y - 5, 0), Math.max(aFlag.pos.x - 5, 0),
                                Math.min(aFlag.pos.y + 5, 49), Math.min(aFlag.pos.x + 5, 49), true)
                            .map(obj => obj.creep)
                            .filter(c => !c.my && !c.isWhiteList())
            if (enemies.length > 0) {
                const targetEnemy = creep.pos.findClosestByRange(enemies);
                if(creep.pos.inRangeTo(targetEnemy, 1)) {
                    creep.attack(targetEnemy);
                } else {
                    creep.doubleMoveTo(targetEnemy.pos, '#ff0000');
                }
                return true;
            } else {
                const target = aFlag.pos.lookFor(LOOK_STRUCTURES)[0] as Structure;
                if (target) {
                    if(creep.pos.inRangeTo(target, 1)) {
                        creep.attack(target);
                    } else {
                        creep.doubleMoveTo(target.pos, '#ff0000');
                    }
                }
            }
        } else {
            const enemies = creep.room.find(FIND_HOSTILE_CREEPS);
            if (enemies.length > 0) {
                const targetEnemy = creep.pos.findClosestByRange(enemies);
                if(creep.pos.inRangeTo(targetEnemy, 1)) {
                    creep.attack(targetEnemy);
                } else {
                    creep.doubleMoveTo(targetEnemy.pos, '#ff0000');
                }
            }
        }
        
        return false
    }
}

/** 双人小队 进攻小队 */
const double_attack = {
    run: function (creep: Creep) {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }
        if (!creep.memory.boosted) {
            if (creep.memory['boostmap']) {
                let result = creep.Boost(creep.memory['boostmap']);
                if (result === OK) {
                    creep.memory.boosted = true;
                }
            } else {
                creep.memory.boosted = creep.goBoost([
                    'XGHO2', 'GHO2', 'GO',
                    'XUH2O', 'UH2O', 'UH'
                ]);
            }
            return
        }
    
        // 等待绑定
        if(!creep.memory.bind) return;
    
        // 获取绑定的另一个creep
        const bindcreep = Game.getObjectById(creep.memory.bind) as Creep;
        if(!bindcreep) {
            delete creep.memory.bind;
            return;
        }

        creep.memory.dontPullMe = true;
    
        // 旗帜控制移动
        const name = creep.name.match(/#(\w+)/)?.[1] ?? creep.name;
        const moveflag = Game.flags['2A-' + name + '-move'];
        if(moveflag && !creep.pos.inRangeTo(moveflag.pos, 0)) {
            if(creep.room.name !== moveflag.pos.roomName) {
                creep.memory.targetRoom = moveflag.pos.roomName;
            }
            creep.doubleMoveTo(moveflag.pos, '#ffff00')
        }
        if (moveflag) return true;

    
        // 移动到目标房间.未到达房间不继续行动
        if (creep.doubleMoveToRoom(creep.memory.targetRoom, '#ff0000')) return;



        
        if (action.attack(creep)) return;
    }
}

export default double_attack;