import {Goods} from "@/constant/ResourceConstant";

export default class AutoFactory extends Room {
    autoFactory() {
        if (Game.time % 50) return;
        if (!this.factory) return;
        const botmem = Memory['StructControlData'][this.name];
        // 关停时不处理
        if (!botmem || !botmem.factory) return;

        // 产物
        const Product = botmem.factoryProduct;
        // 限额
        const amount = (botmem.factoryAmount||0);
        // 原料
        const components = COMMODITIES[Product]?.components;

        // 未超限额, 原料充足, 则不变更任务
        if (Product && components &&
            (amount <= 0 || this.getResAmount(Product) < amount) &&
            Object.keys(components).every((c: any) =>
                (Goods.includes(c) && this.getResAmount(c) >= components[c]) ||
                this.getResAmount(c) >= 1000 || this.factory.store[c] >= components[c]
            )
        ) return;

        if (Product) {
            botmem.factoryProduct = '';
            botmem.factoryAmount = 0;
            global.log(`[${this.name}] 已自动结束factory生产任务: ${Product}. 现库存: ${this.getResAmount(Product)}`)
        }

        // 获取自动任务列表
        const autoFactoryMap = Memory['AutoData']['AutoFactoryData'][this.name];
        if (!autoFactoryMap || !Object.keys(autoFactoryMap).length) return;

        // 查找未到达限额且原料足够的任务
        let task = null;
        let lv = -Infinity;
        for (const res in autoFactoryMap) {
            const level = COMMODITIES[res].level || 0;
            if (lv >= level) continue;
            const components = COMMODITIES[res].components;
            const amount = autoFactoryMap[res];
            if (amount > 0 && this.getResAmount(res) >= amount * 0.9) continue;
            if (Goods.includes(res as any)) {
                if (Object.keys(components).some((c: any) =>
                    this.getResAmount(c) < components[c] * 10)) continue;
            } else {
                if (Object.keys(components).some((c: any) =>
                    this.getResAmount(c) < 1000)) continue;
            }
            task = res;
            lv = level;
        }
        if (!task) return;

        botmem.factoryProduct = task;
        botmem.factoryAmount = autoFactoryMap[task];

        global.log(`[${this.name}] 已自动分配factory生产任务: ${task}, 限额: ${autoFactoryMap[task] || '无'}`)
        return OK;
    }
}
