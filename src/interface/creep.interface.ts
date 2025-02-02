interface Creep {
    /** 初始化*/
    init(): void;
    /** 运行 */
    run(): void;
    /** 爬说话 */
    randomSay(): void;

    moveHomeRoom(): boolean;
    moveToRoom(roomName: string, options?:{[key: string]: any}): any;
    doubleMoveTo(target: RoomPosition, color?: string, ops?: any): number | boolean;
    doubleMoveToRoom(roomName: string, color?: string): boolean;
    doubleFlee(): number;
    doubleToAttack(target: Creep | Structure): number | boolean
    doubleToDismantle(target: Structure): number | boolean

    withdrawEnergy(pickup?: boolean): void;
    Boost(boostmap: any): number;
    goBoost(boostTypes: string[], must?: boolean, reserve?: boolean): boolean;
    unboost(): boolean;
    transferOrMoveTo(target: AnyCreep | Structure, resoureType: ResourceConstant, amount?: number): boolean;
    withdrawOrMoveTo(target: any | Tombstone | Ruin, resoureType?: ResourceConstant, amount?: number): boolean;
    pickupOrMoveTo(target: any, ...args: any[]): boolean;
    repairOrMoveTo(target: any, ...args: any[]): boolean;
    buildOrMoveTo(target: any, ...args: any[]): boolean;
    isWhiteList(): boolean;

    goHaverst(target: Source | Mineral): boolean;
    goWithdraw(target: Structure, resoureType?: ResourceConstant, amount?: number): boolean;
    goTransfer(target: Structure, resoureType?: ResourceConstant, amount?: number): boolean;
    goBuild(target: ConstructionSite): boolean;
    goRepair(target: Structure): boolean;
    goPickup(target: Resource): boolean;
}

interface CreepMemory {
    role: string;
    dontPullMe: boolean;
    mission: Task;
    cache: { [key: string]: any };
    ready: boolean;
    lastTargetPos: any;
    home: string;
    targetSourceId: string;
    working: boolean;
    homeRoom: string;
    sourceRoom: string;
    targetRoom: string;
    bind: Id<Creep>;
    notified: boolean;
    boosted: boolean;
    squad: string;
    boostAttempts: any;
    Rerunt: number;
    sayText: string[];
    boostLevel: number;
    action: string;
    idle: number;
}
