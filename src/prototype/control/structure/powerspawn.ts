export default {
    power: {
        // 开启powerSpawn
        open(roomName: string) {
            const room = Game.rooms[roomName];
            const BotMemStructures =  Memory['StructControlData'];
            if(!room || !room.my || !BotMemStructures[roomName]) {
                global.log(`房间 ${roomName} 不存在、未拥有或未添加。`);
                return;
            }
            BotMemStructures[roomName]['powerSpawn'] = true;
            global.log(`已开启${roomName}的烧power。`);
            return OK;
        },
        // 关闭powerSpawn
        stop(roomName: string) {
            const room = Game.rooms[roomName];
            const BotMemStructures =  Memory['StructControlData'];
            if(!room || !room.my || !BotMemStructures[roomName]) {
                console.log(`房间 ${roomName} 不存在、未拥有或未添加。`);
                return;
            }
            BotMemStructures[roomName]['powerSpawn'] = false;
            global.log(`已关闭${roomName}的烧power。`);
            return OK;
        },
        // 孵化powerCreep
        pc(pcname: string, roomName: string) {
            const room = Game.rooms[roomName];
            if (!room || !room.my) {
                console.log(`房间 ${roomName} 不存在、未拥有或未添加。`);
                return -1;
            }
            const pc = Game.powerCreeps[pcname]
            if (!pc) {
                console.log(`PowerCreep 【${pcname}】 不存在。`);
                return -1;
            }
            const result = pc.spawn(room.powerSpawn);
            if(result === OK) {
                console.log(`${roomName} 的 PowerSpawn 孵化了 PowerCreep 【${pcname}】 `);
            }
            else {
                console.log(`${roomName} 的 PowerSpawn 孵化 PowerCreep 【${pcname}】 失败，错误码：${result}`);
            }
            return OK;
        },
        setpc(pcname: string, roomName: string) {
            const pc = Game.powerCreeps[pcname];
            if (!pc) {
                console.log(`PowerCreep 【${pcname}】 不存在。`);
                return -1;
            }
            pc.memory['spawnRoom'] = roomName;
            console.log(`已设置 PowerCreep 【${pcname}】 的孵化房间为 ${roomName}`);
            return OK;
        }
    }
}