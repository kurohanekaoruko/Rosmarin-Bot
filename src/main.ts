import { createApp } from '@/framework/createApp';

import { roomControl } from '@/control/RoomControl'
import { creepControl } from '@/control/CreepControl'
import { powerControl } from '@/control/PowerControl'

import { PrototypeExtension } from '@/prototype';

import { GlobalInit } from '@/modules/GlobalInit';
import { MemoryInit } from '@/modules/MemoryInit';
import { ClearModule, GeneratePixel, Statistics } from '@/modules/function';

import { DoubleSquad } from '@/modules/DoubleSquad';
import { ClaimModule } from '@/modules/ClaimModule';
import { AidModule } from '@/modules/AidModule';

import { ResourceManage } from '@/modules/ResourceManage';

import SquadModule from '@/modules/warSquad/SquadModule';

import '@/modules/betterMove';    // 超级移动优化
import '@/modules/structureCache';  // 极致建筑缓存
import '@/modules/helper_roomResource'; // 资源统计


const app = createApp();

app.mount(PrototypeExtension);        // 原型挂载

app.set('room', roomControl);         // 房间运行

app.set('creep', creepControl);       // creep行动

app.set('powerCreep', powerControl);  // powerCreep行动

app.on(GlobalInit);     // 全局变量模块

app.on(MemoryInit);     // 初始化内存

app.on(SquadModule);    // 四人小队模块

app.on(ResourceManage); // 资源调度管理

app.on(ClaimModule);    // 占领模块

app.on(AidModule);      // 援建模块

app.on(DoubleSquad);    // 双人小队

app.on(ClearModule);    // 过期数据清理

app.on(GeneratePixel);  // 搓像素

app.on(Statistics);     // 统计


export const loop = app.run;


// // 性能开销分析
// import profiler from './modules/function/screeps-profiler';
// profiler.enable();
// export const loop = function() {
//     profiler.wrap(app.run);
// }
