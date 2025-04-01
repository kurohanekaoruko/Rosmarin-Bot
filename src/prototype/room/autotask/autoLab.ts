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
        if (!labA || !labB) return;
        // 检查库存是否够合成
        const ResAmountCheck = (this.getResAmount(botmem.labAtype) >= 500 &&
                                this.getResAmount(botmem.labBtype) >= 500)
        // 检查当前填充的是否够合成
        const LabMineralCheck = labA && labB &&
                                labA.mineralType === botmem.labAtype &&
                                labB.mineralType === botmem.labBtype &&
                                labA.store[botmem.labAtype] >= 15 &&
                                labB.store[botmem.labBtype] >= 15;
        // 未超限额，原料充足，则不变更任务
        if (botmem.labAtype && botmem.labBtype && labProduct &&
            (amount <= 0 || this.getResAmount(labProduct) < amount) &&
            (ResAmountCheck || LabMineralCheck)
        ) return;


        if (labProduct) {
            botmem.labAtype = null;
            botmem.labBtype = null;
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

        let taskAmount = task ? autoLabMap[task] : 0;

        if (!task) [task, taskAmount] = getT1Task(this);

        if (!task) [task, taskAmount] = getT2Task(this);

        if (!task) [task, taskAmount] = getT3Task(this);

        if (!task || !taskAmount) return;

        botmem.labAtype = LabMap[task]['raw1'];
        botmem.labBtype = LabMap[task]['raw2'];
        botmem.labAmount = taskAmount;

        global.log(`[自动Lab合成] ${this.name}已自动分配lab合成任务: ${botmem.labAtype}/${botmem.labBtype} -> ${REACTIONS[botmem.labAtype][botmem.labBtype]}, 限额: ${taskAmount || '无'}`)
        return OK;
    }
}

const getT1Task = (room: Room) => {
    let res = room.mineral.mineralType;
    let resAmount = room.getResAmount(res);
    if (resAmount < 100e3) return [ null, 0 ];

    const H_amount = room.getResAmount(RESOURCE_HYDROGEN);
    const O_amount = room.getResAmount(RESOURCE_OXYGEN);

    if ((res === 'H' && O_amount >= 5000) ||
        (res === 'O' && H_amount >= 5000)) {
        return [ 'OH', 10e3 ];
    }

    if (res == 'U') {
        if (H_amount >= 5000) return [ 'UH', 10e3 ];
    } else if (res == 'K') {
        if (O_amount >= 5000) return [ 'KO', 10e3 ];
    } else if (res == 'L') {
        const LO_amount = room.getResAmount('LO');
        const LH_amount = room.getResAmount('LH');
        if (O_amount >= 5000 && LO_amount < LH_amount) return [ 'LO', 10e3 ];
        if (H_amount >= 5000 && LH_amount < LO_amount) return [ 'LH', 10e3 ];
    } else if (res == 'Z') {
        const ZO_amount = room.getResAmount('ZO');
        const ZH_amount = room.getResAmount('ZH');
        if (O_amount >= 5000 && ZO_amount < ZH_amount) return [ 'ZO', 10e3 ];
        if (H_amount >= 5000 && ZH_amount < ZO_amount) return [ 'ZH', 10e3 ];
    }

    return [ null, 0 ];
}

const getT2Task = (room: Room) => {
    const OH_amount = room.getResAmount('OH');
    if (OH_amount < 9000) return [ null, 0 ];
    const check = (res1: string, res2: string) =>
        room.getResAmount(res1) > Math.max(room.getResAmount(res2), 20e3)
    if (check('GH',  'GH2O')) return [ 'GH2O', 10e3 ];
    if (check('GO',  'GHO2')) return [ 'GHO2', 10e3 ];
    if (check('LH',  'LH2O')) return [ 'LH2O', 10e3 ];
    if (check('LO',  'LHO2')) return [ 'LHO2', 10e3 ];
    if (check('ZH',  'ZH2O')) return [ 'ZH2O', 10e3 ];
    if (check('ZO',  'ZHO2')) return [ 'ZHO2', 10e3 ];
    if (check('UH',  'UH2O')) return [ 'UH2O', 10e3 ];
    if (check('KO',  'KHO2')) return [ 'KHO2', 10e3 ];
    return [ null, 0 ];
}

const getT3Task = (room: Room) => {
    const X_amount = room.getResAmount('X');
    if (X_amount < 9000) return [ null, 0 ];
    const check = (res1: string, res2: string) =>
        room.getResAmount(res1) > Math.max(room.getResAmount(res2), 20e3)
    if (check('GH2O',  'XGH2O')) return [ 'XGH2O', 10e3 ];
    if (check('GHO2',  'XGHO2')) return [ 'XGHO2', 10e3 ];
    if (check('LH2O',  'XLH2O')) return [ 'XLH2O', 10e3 ];
    if (check('LHO2',  'XLHO2')) return [ 'XLHO2', 10e3 ];
    if (check('ZH2O',  'XZH2O')) return [ 'XZH2O', 10e3 ];
    if (check('ZHO2',  'XZHO2')) return [ 'XZHO2', 10e3 ];
    if (check('UH2O',  'XUH2O')) return [ 'XUH2O', 10e3 ];
    if (check('KHO2',  'XKHO2')) return [ 'XKHO2', 10e3 ];
    return [ null, 0 ];
}