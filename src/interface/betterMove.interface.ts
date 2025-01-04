interface Creep {
	$moveTo: {
		(x: number, y: number, opts?: MoveToOpts): ERR_INVALID_TARGET | ERR_NO_PATH | CreepMoveReturnCode;
		(target: RoomPosition | { pos: RoomPosition }, opts?: MoveToOpts):
			| ERR_INVALID_TARGET
			| ERR_NO_PATH
			| ERR_NOT_FOUND
			| CreepMoveReturnCode;
	};
	originMoveTo: {
		(x: number, y: number, opts?: MoveToOpts): ERR_INVALID_TARGET | ERR_NO_PATH | CreepMoveReturnCode;
		(target: RoomPosition | { pos: RoomPosition }, opts?: MoveToOpts):
			| ERR_INVALID_TARGET
			| ERR_NO_PATH
			| ERR_NOT_FOUND
			| CreepMoveReturnCode;
	};
	$build(target: ConstructionSite): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH;
	$repair(target: Structure): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES;
	$upgradeController(target: StructureController): ScreepsReturnCode;
	$dismantle(target: Structure): CreepActionReturnCode;
	$harvest(
		target: Source | Mineral | Deposit
	): CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES;
	$attack(target: AnyCreep | Structure): CreepActionReturnCode;
	$heal(target: AnyCreep): CreepActionReturnCode;
	$rangedHeal(target: AnyCreep): CreepActionReturnCode;
	$rangedAttack(target: AnyCreep): CreepActionReturnCode;
}

interface CreepMemory {
	dontPullMe: boolean;
	forcePull?: boolean;
}


interface MyPath {
	flee?: boolean;
	start?: RoomPosition;
	end?: RoomPosition;
	directionArray?: any[];
	ignoreStructures?: boolean;
	ignoreSwamps?: boolean;
	ignoreRoads?: boolean;
	posArray: RoomPosition[];
}

interface MoveToOpts {
	ignoreSwamps?: boolean;
	maxCost?: number;
	isOutmine?: boolean;
	flee?: boolean;
}
