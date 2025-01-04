const structuresShape = {
	spawn: '◎',
	extension: 'ⓔ',
	link: '◈',
	road: '•',
	constructedWall: '▓',
	rampart: '⊙',
	storage: '▤',
	tower: '🔫',
	observer: '👀',
	powerSpawn: '❂',
	extractor: '⇌',
	terminal: '✡',
	lab: '☢',
	container: '□',
	nuker: '▲',
	factory: '☭'
};
const structuresColor = {
	spawn: 'cyan',
	extension: '#0bb118',
	link: 'yellow',
	road: '#fa6f6f',
	constructedWall: '#003fff',
	rampart: '#003fff',
	storage: 'yellow',
	tower: 'cyan',
	observer: 'yellow',
	powerSpawn: 'cyan',
	extractor: 'cyan',
	terminal: 'yellow',
	lab: '#d500ff',
	container: 'yellow',
	nuker: 'cyan',
	factory: 'yellow'
};

class RoomArray {
    public arr: number[] | string[];
    public extractor: any[];
    public container: any[];
    public link: any[];
    public exec(x: number, y: number, val: number): number | string {
        const tmp = this.arr[x * 50 + y]
        this.set(x, y, val);
        return tmp
    }
    public get(x: number, y: number): number | string {
        return this.arr[x * 50 + y];
    }
    public set(x: number, y: number, value: number | string): void {
        this.arr[x * 50 + y] = value;
    }
    public init(): RoomArray {
        if (!this.arr)
            this.arr = new Array(50 * 50)
        for (let i = 0; i < 2500; i++) {
            this.arr[i] = 0;
        }
        return this;
    }
    public forEach(func: any): void {
        for (let y = 0; y < 50; y++) {
            for (let x = 0; x < 50; x++) {
                func(x, y, this.get(x, y))
            }
        }
    }
    public for4Direction(func: any, x: number, y: number): void {
        for (const e of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const xt = x + e[0]
            const yt = y + e[1]
            if (xt >= 0 && yt >= 0 && xt <= 49 && yt <= 49)
                func(xt, yt, this.get(xt, yt))
        }
    }
    public forNear(func: any, x: number, y: number, range = 1): void {
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const xt = x + i
                const yt = y + j
                if ((i || j) && xt >= 0 && yt >= 0 && xt <= 49 && yt <= 49)
                    func(xt, yt, this.get(xt, yt))
            }
        }
    }
    public forBorder(func: any): void {
        for (let y = 0; y < 50; y++) {
            func(0, y, this.get(0, y))
            func(49, y, this.get(49, y))
        }
        for (let x = 1; x < 49; x++) {
            func(x, 0, this.get(x, 0))
            func(x, 49, this.get(x, 49))
        }
    }
    public initRoomTerrainWalkAble(roomName: string): void {
        const terrain = new Room.Terrain(roomName);
        this.forEach((x: number, y: number) => this.set(x, y, terrain.get(x, y) == 1 ? 0 : terrain.get(x, y) == 0 ? 1 : 2))
    }
}

const HelperVisual = {
    //线性同余随机数
    rnd(seed: number) {
        return (seed * 9301 + 49297) % 233280; //为何使用这三个数?
    },
    // seed 的随机颜色
    randomColor(s: string) {
        let seed = parseInt(s);
        const str = '12334567890ABCDEF';
        let out = '#';
        for (let i = 0; i < 6; i++) {
            seed = this.rnd(seed + (Game.time % 103));
            out += str[seed % str.length];
        }
        return out;
    },
    // 大概消耗1 CPU！ 慎用！
    showRoomStructures(roomName: string, structMap: { [x: string]: any[] }) {
        if (!structMap) return;
        const roomStructs = new RoomArray().init();
        const visual = new RoomVisual(roomName);
        if (!structMap['road']) structMap['road'] = [];
        structMap['road'].forEach((e) => roomStructs.set(e[0], e[1], 'road'));
        _.keys(CONTROLLER_STRUCTURES).forEach((struct) => {
            if (struct == 'road') {
                structMap[struct].forEach((e) => {
                    roomStructs.forNear(
                        (x: number, y: number, val: string) => {
                            if (val == 'road' && ((e[0] >= x && e[1] >= y) || (e[0] > x && e[1] < y)))
                                visual.line(x, y, e[0], e[1], { color: structuresColor[struct] });
                        },
                        e[0],
                        e[1]
                    );
                    visual.text(structuresShape[struct], e[0], e[1] + 0.25, {
                        color: structuresColor[struct],
                        opacity: 0.75,
                        font: 0.7
                    });
                });
            } else {
                if (!structMap[struct]) structMap[struct] = [];
                structMap[struct].forEach((e) =>
                    visual.text(structuresShape[struct], e[0], e[1] + 0.25, {
                        color: structuresColor[struct],
                        opacity: 0.75,
                        font: 0.7
                    })
                );
            }
        });
    }
};

export default HelperVisual;