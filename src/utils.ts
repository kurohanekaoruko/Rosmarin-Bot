// 坐标压缩函数
export function compress(x: number, y: number): number {
    return (x << 6) | y;
}

// 坐标解压函数
export function decompress(value: number) {
    const x = value >> 6;      // 高 6 位是 x
    const y = value & 0b111111; // 低 6 位是 y
    return [x, y];
}

// 批量压缩坐标
export function compressBatch(coords: number[][]) {
    return coords.map(([x, y]) => compress(x, y));
}

// 批量解压坐标
export function decompressBatch(values: number[]) {
    return values.map(decompress);
}

// 获取相邻点的方向
export function getDirection(fromPos, toPos) {
    if (fromPos.roomName == toPos.roomName) {
        if (toPos.x > fromPos.x) {    // 下一步在右边
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM_RIGHT;
            } else if (toPos.y == fromPos.y) { // 下一步在正右
                return RIGHT;
            }
            return TOP_RIGHT;   // 下一步在上面
        } else if (toPos.x == fromPos.x) { // 横向相等
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM;
            } else if (toPos.y < fromPos.y) {
                return TOP;
            }
        } else {  // 下一步在左边
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM_LEFT;
            } else if (toPos.y == fromPos.y) {
                return LEFT;
            }
            return TOP_LEFT;
        }
    } else {  // 房间边界点
        if (fromPos.x == 0 || fromPos.x == 49) {  // 左右相邻的房间，只需上下移动（左右边界会自动弹过去）
            if (toPos.y > fromPos.y) {   // 下一步在下面
                return BOTTOM;
            } else if (toPos.y < fromPos.y) { // 下一步在上
                return TOP
            } // else 正左正右
            return fromPos.x ? RIGHT : LEFT;
        } else if (fromPos.y == 0 || fromPos.y == 49) {    // 上下相邻的房间，只需左右移动（上下边界会自动弹过去）
            if (toPos.x > fromPos.x) {    // 下一步在右边
                return RIGHT;
            } else if (toPos.x < fromPos.x) {
                return LEFT;
            }// else 正上正下
            return fromPos.y ? BOTTOM : TOP;
        }
    }
}

// 计算合适的订单价格
export function getPrice(type: any, orderType: any): any {
    let finalPrice = 0.011;
    const orders = Game.market.getAllOrders({type: orderType, resourceType: type});
    if (!orders || orders.length === 0) return finalPrice;
    orders.sort((a, b) => {
        if (orderType === ORDER_BUY) {
            return b.price - a.price; // 按价格从高到低排序
        } else {
            return a.price - b.price; // 按价格从低到高排序
        }
    });
    let rooms = {}
    let history = Game.market.getHistory(type);
    let avgPrice = history[0].avgPrice;
    let stddevPrice = history[0].stddevPrice;
    // 取前十
    const topOrders = orders.filter(order => {
        // 初步过滤
        if (orderType === ORDER_BUY && order.price < 1) return false;
        if (type == 'energy' && order.amount < 10000) return false;
        // if (order.price > (avgPrice + stddevPrice) * 2) return false;
        // if (order.price < avgPrice * 0.5) return false;
        if (rooms[order.roomName]) return false;
        rooms[order.roomName] = true;
        return true;
    }).slice(0, 10);
    // 计算这些订单的平均价格
    const averagePrice = topOrders.reduce((sum, order) => sum + order.price, 0) / topOrders.length;
    if (orderType === ORDER_BUY) {
        // 过滤掉高于平均价格太多的订单
        const filteredOrders = topOrders.filter(order => order.price <= averagePrice * 1.05);
        if (filteredOrders.length > 0) {
            // 选择过滤后的最高价格稍微降低一点作为求购价格
            finalPrice = filteredOrders[0].price * 0.99;
            return finalPrice;
        }
    } else if (orderType === ORDER_SELL) {
        // 过滤掉低于平均价格太多的订单
        const filteredOrders = topOrders.filter(order => order.price >= averagePrice * 0.95);
        if (filteredOrders.length > 0) {
            // 选择过滤后的最低价格稍微提高一点作为出售价格
            finalPrice = filteredOrders[0].price + 0.1;
            return finalPrice;
        }
    }
    return finalPrice;
}