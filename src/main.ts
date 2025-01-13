import { createBot } from '@/framework/createBot';

import { roomControl } from '@/control/RoomControl'
import { creepControl } from '@/control/CreepControl'
import { powerControl } from '@/control/PowerControl'

import { PrototypeExtension } from '@/prototype';

import { GlobalInit } from '@/modules/GlobalInit';
import { MemoryInit } from '@/modules/MemoryInit';
import { ClearModule  } from '@/modules/function/ClearModule';
import { GeneratePixel } from '@/modules/function/Pixel';
import { Statistics } from '@/modules/function/Statistics'

import { DoubleSquad } from '@/modules/DoubleSquad';
import { ClaimModule } from '@/modules/ClaimModule';
import { AidModule } from '@/modules/AidModule';

import { ResourceManage } from '@/modules/ResourceManage';

import SquadModule from '@/modules/warSquad/SquadModule';

import '@/modules/function/betterMove';    // 超级移动优化
import '@/modules/function/structureCache';  // 极致建筑缓存
import '@/modules/function/helper_roomResource'; // 资源统计


const Bot = createBot();

Bot.mount(PrototypeExtension);        // 原型挂载

Bot.set('room', roomControl);         // 房间运行

Bot.set('creep', creepControl);       // creep行动

Bot.set('powerCreep', powerControl);  // powerCreep行动

Bot.on(GlobalInit);     // 全局变量模块

Bot.on(MemoryInit);     // 初始化内存

Bot.on(SquadModule);    // 四人小队模块

Bot.on(ResourceManage); // 资源调度管理

Bot.on(ClaimModule);    // 占领模块

Bot.on(AidModule);      // 援建模块

Bot.on(DoubleSquad);    // 双人小队

Bot.on(ClearModule);    // 过期数据清理

Bot.on(GeneratePixel);  // 搓像素

Bot.on(Statistics);     // 统计


export const loop = Bot.run;


// // 性能开销分析
// import profiler from './modules/function/screeps-profiler';
// profiler.enable();
// export const loop = function() {
//     profiler.wrap(app.run);
// }
