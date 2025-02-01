/**
 * 清理模块
 */
export const ClearModule = {
    tickEnd: () => {
        if(Game.time % 100 == 0) {
            // 全局 Memory 清理
            memoryClear();
        };
        if(Game.time % 100 == 0) {
            // 清除过期与已完成订单
            orderClear();
        }
        
    },
}

function  memoryClear() {
    // 清理不存在的 creeps 的 memory
    for (let name in Memory.creeps) {
        if (Game.creeps[name]) continue;
        delete Memory.creeps[name];
    }
    // 清理不存在的 powerCreeps 的 memory
    for (let name in Memory.powerCreeps) {
        if (Game.powerCreeps[name]) continue;
        delete Memory.powerCreeps[name];
    }
    // 清理不存在的 flags 的 memory
    for (let name in Memory.flags) {
        if (Game.flags[name]) continue;
        delete Memory.flags[name];
    }
    // 清理无用的任务池memory
    for (let room in Memory.MissionPools) {
        if(Memory.RoomControlData[room]) continue;
        delete Memory.MissionPools[room];
    }
}

// 清理订单
function orderClear() {
    const TIME_THRESHOLD = 50000; // 过期时间阈值
    const MAX_ORDERS = 250; // 最大允许订单数
    const TARGET_ORDERS = 50; // 清理到

    const orders = Object.values(Game.market.orders);
    if (orders.length < MAX_ORDERS) return;

    const currentTime = Game.time;
    const completedOrders = orders.filter(order => order.remainingAmount === 0)
        .sort((a, b) => a.created - b.created);

    const ordersToDelete = completedOrders.filter((order, index) =>
        (currentTime - order.created > TIME_THRESHOLD) || (index < orders.length - TARGET_ORDERS)
    ).map(order => order.id);

    if (ordersToDelete.length > 0) {
        ordersToDelete.forEach(orderId => Game.market.cancelOrder(orderId));
        console.log(`已清理 ${ordersToDelete.length} 个已完成的订单`);
    }
}