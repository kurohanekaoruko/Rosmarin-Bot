import { createBot } from '@/framework/createBot';

import { roomControl } from '@/boot/RoomControl'
import { creepControl } from '@/boot/CreepControl'
import { powerControl } from '@/boot/PowerControl'

import { PrototypeExtension } from '@/prototype';
import { ConsoleExtension } from '@/console';

import { GlobalInit } from '@/modules/GlobalInit';
import { MemoryInit } from '@/modules/MemoryInit';
import { ClearModule  } from '@/modules/ClearModule';
import { GeneratePixel } from '@/modules/Pixel';
import { Statistics } from '@/modules/Statistics'

import { ClaimModule } from '@/modules/actionModule/ClaimModule';
import { AidModule } from '@/modules/actionModule/AidModule';
import { WarSpawnModule } from '@/modules/actionModule/WarSpawnModule';

import { ResourceManage } from '@/modules/ResourceManage';

import TeamModule from '@/modules/team/TeamModule';

import '@/modules/wheel/betterMove';    // 超级移动优化
import '@/modules/wheel/structureCache';  // 极致建筑缓存
import '@/modules/wheel/roomResource'; // 资源统计


const Bot = createBot();

Bot.mount(PrototypeExtension);        // 原型挂载

Bot.mount(ConsoleExtension);          // 控制台命令挂载

Bot.set('room', roomControl);         // 房间运行

Bot.set('creep', creepControl);       // creep行动

Bot.set('powerCreep', powerControl);  // powerCreep行动

Bot.on(GlobalInit);     // 全局变量模块

Bot.on(MemoryInit);     // 初始化内存

Bot.on(ResourceManage); // 资源调度管理

Bot.on(ClaimModule);    // 占领模块

Bot.on(AidModule);      // 援建模块

Bot.on(WarSpawnModule); // 战斗模块

Bot.on(TeamModule);     // 四人小队模块

Bot.on(ClearModule);    // 过期数据清理

Bot.on(GeneratePixel);  // 搓像素

Bot.on(Statistics);     // 统计数据


export const loop = Bot.run;


// // 性能开销分析
// import profiler from './modules/wheel/screeps-profiler';
// profiler.enable();
// export const loop = function() {
//     profiler.wrap(Bot.run);
// }
