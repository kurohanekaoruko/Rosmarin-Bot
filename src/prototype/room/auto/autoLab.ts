import { LabMap, LabLevel } from '@/constant/ResourceConstant'

export default class AutoLab extends Room {
    autoLab() {
        if (Game.time % 50) return;
        if (!this.lab || !this.lab.length) return;
        const botmem =  Memory['StructControlData'][this.name];

        // 关停时不处理
        if (!botmem || !botmem.lab) return;
        const labProduct = botmem.labAtype && botmem.labBtype ?
                        REACTIONS[botmem.labAtype][botmem.labBtype] : null;
        const amount = botmem.labAmount;    // 产物限额

        const labA = Game.getObjectById(botmem.labA) as StructureLab;
        const labB = Game.getObjectById(botmem.labB) as StructureLab;
        // 检查库存是否够合成
        const ResAmountCheck = (this.getResAmount(botmem.labAtype) >= 1000 &&
                                this.getResAmount(botmem.labBtype) >= 1000)
        // 检查当前填充的是否够合成
        const LabMineralCheck = labA && labB &&
                                labA.mineralType === botmem.labAtype &&
                                labB.mineralType === botmem.labBtype &&
                                labA.store[botmem.labAtype] >= 5 &&
                                labB.store[botmem.labBtype] >= 5;
        // 未超限额，原料充足，则不变更任务
        if (botmem.labAtype && botmem.labBtype && labProduct &&
            (amount <= 0 || this.getResAmount(labProduct) < amount) &&
            (ResAmountCheck || LabMineralCheck)
        ) return;


        if (labProduct) {
            botmem.labAtype = '';
            botmem.labBtype = '';
            botmem.labAmount = 0;
            global.log(`[自动Lab合成] ${this.name}已自动关闭lab合成任务: ${labProduct}`)
        }

        // 获取自动任务列表
        const autoLabMap = Memory['AutoData']['AutoLabData'][this.name];
        if (!autoLabMap || !Object.keys(autoLabMap).length) return;

        // 查找未到达限额且原料足够的任务, 按优先级选择
        let task = null;
        let lv = Infinity; // 优先级
        for (const res in autoLabMap) {
            const level = LabLevel[res];
            if (lv <= level) continue;
            if (autoLabMap[res] > 0 && this.getResAmount(res) >= autoLabMap[res] * 0.9) continue;
            if (this.getResAmount(LabMap[res]['raw1']) < 6000 ||
                this.getResAmount(LabMap[res]['raw2']) < 6000) continue;
            task = res;
            lv = level;
        }
        if (!task) return;

        botmem.labAtype = LabMap[task]['raw1'];
        botmem.labBtype = LabMap[task]['raw2'];
        botmem.labAmount = autoLabMap[task];

        global.log(`[自动Lab合成] ${this.name}已自动分配lab合成任务: ${botmem.labAtype}/${botmem.labBtype} -> ${REACTIONS[botmem.labAtype][botmem.labBtype]}, 限额: ${autoLabMap[task] || '无'}`)
        return OK;
    }
}
