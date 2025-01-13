import { RoleData, RoleBodys } from '@/constant/CreepConstant';

export default {
    spawn: {
        creep(roomName: string, bodypart: any[], role: string, memory?: any) {
            if (!roomName || !role) return -1;
            if (!RoleData[role]) return -1;
            const room = Game.rooms[roomName];
            if(!memory) memory = {};
            if (!memory.home && !memory.homeRoom) {
                memory.homeRoom = roomName;
            }
            room.SpawnMissionAdd('', bodypart, -1, role, _.cloneDeep(memory));
            console.log(`[${roomName}] 即将孵化 ${role}, 体型: ${JSON.stringify(bodypart)} \n memory: ${JSON.stringify(memory)}`);
            return 0;
        },
        role(roomName: string, role: string, memory?: any, num?: number) {
            if (!roomName || !role) return -1;
            if (!RoleData[role]) return -1;
            if (!num) num = 1;
            const room = Game.rooms[roomName];
            if(!memory) memory = {};
            if (!memory.home && !memory.homeRoom) {
                memory.homeRoom = roomName;
            }
            for (let i = 0; i < num; i++) {
                room.SpawnMissionAdd('', [], -1, role, _.cloneDeep(memory));
            }
            console.log(`[${roomName}] 即将孵化 ${role}, 数量: ${num} \n memory: ${JSON.stringify(memory)}`);
            return 0;
        },
        onebody(roomName: string, targetRoom: string, type: string, T: string) {
            if (!(['ranged', 'tough'].includes(type))) return Error('没有该一体机类型');
            const room = Game.rooms[roomName];
            const bodypart = RoleBodys[`one-${type}`]?.[T] || RoleData[`one-${type}`]?.bodypart;
            room.SpawnMissionAdd('', bodypart, -1, `one-${type}`, {targetRoom: targetRoom} as any);
            console.log(`[${roomName}] 即将孵化${type}一体机到${targetRoom}。`);
            if (type == 'tough') {
                room.AssignBoostTask('XGHO2', bodypart[7] * 30);
                room.AssignBoostTask('XLHO2', bodypart[5] * 30);
            }
            return 0;
        },
        aio(roomName: string, targetRoom: string, role: string, num: number) {
            const room = Game.rooms[roomName];
            if (!RoleData[role]) return Error('没有该一体机类型');
            if (!num) num = 1;
            for (let i = 0; i < num; i++) {
                room.SpawnMissionAdd('', [], -1, role, {targetRoom: targetRoom} as any);
            }
            console.log(`[${roomName}] 即将孵化${num}个${role} 到 ${targetRoom}。`);
            return OK;
        },
        doublesquad(roomName: string, targetRoom: string, squad: string, TA?: string, TB?: string) {
            if (!(['attack', 'dismantle', 'carry'].includes(squad))) return Error('没有该双人小队类型');
            const room = Game.rooms[roomName];
            const bodypart1 = RoleBodys[`double-${squad}`]?.[TA];
            const bodypart2 = RoleBodys['double-heal']?.[TB];
            room.SpawnMissionAdd('', (bodypart1||[]), -1, `double-${squad}`, {squad: squad, targetRoom: targetRoom} as any);
            room.SpawnMissionAdd('', (bodypart2||[]), -1, 'double-heal', {squad: squad, targetRoom: targetRoom} as any);
            console.log(`[${roomName}] 即将孵化${squad}双人小队到${targetRoom}。`);
            return 0;
        },
        quad(roomName: string, Type: 'test') {
            const room = Game.rooms[roomName];
            if (!room || !Type) return;
            const squadName = (Game.time*36*36 + Math.floor(Math.random()*36*36)).toString(36).slice(-4).toUpperCase();
            Memory['SquadData'][squadName] = {
                'name': squadName,
                'state': 'idle',
                'toward': '↑',
                'moveState': 'line',
                'members': {},
                'time': Game.time, // 创建时间
            }
            if (Type == 'test') {
                console.log(`[${roomName}] 即将孵化测试quad小队, 名称: ${squadName}`);
                room.SpawnMissionAdd('', [0, 0, 1, 1, 0, 0, 0, 0], -1, 'quad-attack', {squadName} as any);
                room.SpawnMissionAdd('', [1, 0, 1, 0, 0, 0, 0, 0], -1, 'quad-dismantle', {squadName} as any);
                room.SpawnMissionAdd('', [0, 0, 1, 0, 0, 1, 0, 0], -1, 'quad-heal', {squadName} as any);
                room.SpawnMissionAdd('', [0, 0, 1, 0, 0, 1, 0, 0], -1, 'quad-heal', {squadName} as any);
            }

            return OK;
        }
    }
}