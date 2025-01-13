import { errorMapper } from './errorMapper.js'
import { BaseConfig } from '@/constant/config.js'

/**
 * 基本框架，用于管理游戏循环，挂载各种模块
 */
export const createBot = () => {
    const name = BaseConfig.BOT_NAME;
    const events = {init: [], tickStart: [], tick: [], tickEnd: []}
    
    let runRoom = () => {};
    let runCreep = () => {};
    let runPowerCreep = () => {};

    const set = (type: any, runner: any) => {
        const runnerWithErrorMapper = (entity: any) => errorMapper(runner, entity);
        switch (type) {
            case 'room':
                runRoom = () => Object.values(Game.rooms).forEach(runnerWithErrorMapper);
                break;
            case 'creep':
                runCreep = () => Object.values(Game.creeps).forEach(runnerWithErrorMapper);
                break;
            case 'powerCreep':
                runPowerCreep = () => Object.values(Game.powerCreeps).forEach(runnerWithErrorMapper);
                break;
        }
    }

    const mount = (func: () => void) => {
        func();
        if (Game.shard.name != 'sim')
            console.log(`原型拓展已挂载。`)
    }

    const on = (callbacks: any) => {
        if (!callbacks || typeof callbacks !== 'object') return;
        if (Array.isArray(callbacks)) {
            callbacks.forEach(cbs => on(cbs));
            return;
        }
        Object.keys(callbacks).forEach(type => {
            if (!events[type]) return;
            events[type].push(callbacks[type])
        })
    };

    let initOK = false;
    const init = () => {
        events.init.forEach(callback => errorMapper(callback))
        const initRun = (Objects: any) => {
            Object.values(Objects).forEach((item: any) => item.init()); 
        };
        if (Room.prototype.init) initRun(Game.rooms);
        if (Creep.prototype.init) initRun(Game.creeps);
        if (PowerCreep.prototype.init) initRun(Game.powerCreeps);
        if (Game.shard.name != 'sim') console.log(`全局初始化完成。`);
        initOK = true;
    };

    const tickStart = () => {
        events.tickStart.forEach(callback => errorMapper(callback));
    }

    const tick = () => {
        runRoom();
        runCreep();
        runPowerCreep();
        events.tick.forEach(callback => errorMapper(callback));
    };

    const tickEnd = () => {
        events.tickEnd.forEach(callback => errorMapper(callback));
    }

    let _cachedMemory: Memory;

    const run = () => {
        if (_cachedMemory) {
            // @ts-ignore
            delete global.Memory;
            // @ts-ignore
            global.Memory = _cachedMemory;
        } else {
            // @ts-ignore
            _cachedMemory = global.Memory;
        }
        if(!initOK) init();
        tickStart();
        tick();
        tickEnd();
        // @ts-ignore
        RawMemory._parsed = global.Memory;
    };

    return { name, set, mount, on, run }
};
