import { CompoundColor } from '@/constant/ResourceConstant';

export default class LabControl extends Room {
    VisualLabInfo() {
        this.lab.forEach(lab => {
            if (!lab.mineralType) return;
            this.visual.text(lab.mineralType,
                lab.pos.x, lab.pos.y,
                { align: 'center',
                  color: CompoundColor[lab.mineralType],
                  stroke: '#2a2a2a',
                  strokeWidth: 0.05,
                  font: '0.24 inter' }
            )
        })
    }

    RunReaction() {
        // 每 5 tick 执行一次
        if (Game.time % 5 !== 1) return;
        // lab数量不足时不处理
        if (!this.lab || this.lab.length < 3) return;

        // lab关停时不合成
        const memory =  Memory['StructControlData'][this.name];
        if (!memory || !memory.lab || this.memory.defend) return;
        // 没有设置底物lab时不合成
        if (!memory.labA || !memory.labB) return;

        const labAtype = memory.labAtype ;
        const labBtype = memory.labBtype;
        // 没有设置底物类型时不合成
        if (!labAtype || !labBtype) return;
        
        let labA = Game.getObjectById(memory.labA) as StructureLab;
        let labB = Game.getObjectById(memory.labB) as StructureLab;
        // 底物lab不存在时不合成
        if (!labA || !labB) {
            if(!labA) memory.labA = undefined;
            if(!labB) memory.labB = undefined;
            return;
        }
        // 检查labA和labB是否有足够的资源
        if (labA.store[labAtype] < 5 || labB.store[labBtype] < 5) {
            return;
        }
        // 获取其他lab
        let otherLabs = this.lab
            .filter(lab => lab.id !== memory.labA && lab.id !== memory.labB &&
                    lab && lab.cooldown === 0);
        // 没有可用的lab时不合成
        if (!otherLabs || otherLabs.length === 0) return;
        // boost设置
        const boostmem = Memory['StructControlData'][this.name]['boostRes'];
        const boostmem2 = Memory['StructControlData'][this.name]['boostTypes'];

        // 合成产物
        const labProduct = REACTIONS[labAtype][labBtype] as ResourceConstant;
        // 遍历其他lab进行合成
        for (let lab of otherLabs) {
            // 如果有boost设置，则跳过
            if (boostmem && boostmem[lab.id]) continue;
            if (boostmem2 && boostmem2[lab.id]) continue;
            // 检查lab中是否存在与合成产物不同的资源
            if (lab.mineralType &&
                lab.mineralType !== labProduct) {
                continue; // 如果存在不同的资源，跳过这个lab
            }
            // 检查lab是否已满
            if (lab.store.getFreeCapacity(labProduct) === 0) {
                continue; // 如果lab已满，跳过这个lab
            }
            
            // 进行合成
            lab.runReaction(labA, labB);
        }
    }
}