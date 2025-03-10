import { errorMapper } from './errorMapper.js'
import { BaseConfig } from '@/constant/config.js'

/**
 * 基本框架，用于管理游戏循环，挂载各种模块
 */
export const createApp = () => {
    const name = BaseConfig.BOT_NAME;
    const events = {init: [], tickStart: [], tick: [], tickEnd: []}
    
    let runRoom = () => {};
    let runCreep = () => {};
    let runPower = () => {};
    let runFlag = () => {};

    /** 设置运行器 */
    const set = (type: 'room' | 'creep' | 'power' | 'flag' , runner: any) => {
        if (type === 'room') {
            runRoom = () => Object.values(Game.rooms).forEach(runner);
            return;
        }
        if (type === 'creep') {
            runCreep = () => Object.values(Game.creeps).forEach(runner);
            return;
        }
        if (type === 'power') {
            runPower = () => Object.values(Game.powerCreeps).forEach(runner);
            return;
        }
        if (type === 'flag') {
            runFlag = () => Object.values(Game.flags).forEach(runner);
            return;
        }
    }

    /** 添加模块 */
    const on = (callbacks: any) => {
        if (!callbacks || typeof callbacks !== 'object') return;
        if (Array.isArray(callbacks)) {
            callbacks.forEach(cbs => on(cbs));
            return;
        }
        Object.keys(callbacks)?.forEach(type => {
            if (!events[type]) return;
            events[type].push(callbacks[type])
        })
    };

    /** 运行模块 */
    const runCall = (name: string) => {
        if (!events[name]) return;
        events[name].forEach((callback: () => void) => callback());
    }

    let initOK = false;
    const init = () => {
        runCall('init');
        const initRun = (Objects: any) => {
            Object.values(Objects).forEach((item: any) => item.init()); 
        };
        if (Room.prototype.init) initRun(Game.rooms);
        if (Creep.prototype.init) initRun(Game.creeps);
        if (PowerCreep.prototype.init) initRun(Game.powerCreeps);
        initOK = true;
        if (Game.shard.name == 'sim') return;
        console.log(`全局初始化完成。`);
    };

    let _MemoryCache: Memory;
    let lastTime = 0;
    /** 内存缓存器 */
    const MemoryCacher = (exec: () => void) => {
        if (_MemoryCache && lastTime && Game.time == lastTime + 1) {
            // @ts-ignore
            delete global.Memory;
            // @ts-ignore
            global.Memory = _MemoryCache;
            // @ts-ignore
            RawMemory._parsed = global.Memory;
        } else {
            // @ts-ignore
            _MemoryCache = global.Memory;
        }
        lastTime = Game.time;
        exec();
    }

    /** 主要逻辑 */
    const exec = () => {
        if(!initOK) init();
        runCall('tickStart');
        runRoom();
        runCreep();
        runPower();
        runFlag();
        runCall('tick');
        runCall('tickEnd');
    }

    /** 运行 */
    const run = () => {
        errorMapper(() => MemoryCacher(exec));
    };

    return { name, set, on, run }
};
