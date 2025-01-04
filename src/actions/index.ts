import harvester from './mainRole/harvester';
import carrier from './mainRole/carrier';
import transport from './mainRole/transport';
import manage from './mainRole/manage';
import upgrader from './mainRole/upgrader';
import worker from './mainRole/worker';
import builder from './mainRole/builder';
import repair from './mainRole/repair';
import mineral from './mainRole/mineral';

export {harvester, carrier, transport, manage, upgrader, worker, builder, repair, mineral}


import claimer from './claimRole/claimer';
import lclaimer from './claimRole/lclaimer';
import aclaimer from './claimRole/aclaimer';
import logistic from './otherRole/logistic';
import harvest_carry from './mainRole/harvest_carry';
import SpeedUpgrader from './otherRole/spup';
import SpeedRepair from './otherRole/spre'
import dismantle from './otherRole/dismantle';
import bigCarry from './otherRole/bigCarry';
import cleaner from './otherRole/cleaner';
import r_site from './otherRole/r-site';

export {claimer, lclaimer, aclaimer};
export {logistic, harvest_carry, SpeedUpgrader, SpeedRepair, dismantle, bigCarry, cleaner, r_site};


import double_attack from './doubleSquadRole/double_attack';
import double_dismantle from './doubleSquadRole/double_dismantle';
import double_heal from './doubleSquadRole/double_heal';
import double_defender from './doubleSquadRole/double_defender';

export {double_attack, double_dismantle, double_heal, double_defender};


import scout from './otherRole/scout';
import outHarvest from './outCollect/outHarvest';
import outCarry from './outCollect/outCarry';
import outBuild from './outCollect/outBuild';
import outClaim from './outCollect/outClaim';
import outDefend from './outCollect/outDefend';
import outInvader from './outCollect/outInvader';
import outAttack from './outCollect/outAttack';
import outRanged from './outCollect/outRanged';
import outMiner from './outCollect/outMiner';

export {scout, outHarvest, outCarry, outBuild, outClaim, outDefend, outInvader, outAttack, outRanged, outMiner};


import power_attack from './powerCollect/power-attack';
import power_heal from './powerCollect/power-heal';
import power_carry from './powerCollect/power-carry';
import power_ranged from './powerCollect/power-ranged';

export {power_attack, power_heal, power_carry, power_ranged};


import deposit_harvest from './depositCollect/deposit-harvest';
import deposit_transfer from './depositCollect/deposit-transfer';
import deposit_ranged from './depositCollect/deposit-ranged';
import deposit_attack from './depositCollect/deposit-attack';

export {deposit_harvest, deposit_transfer, deposit_ranged, deposit_attack};


import one_tough from './oneBody/one_tough';
import one_ranged from './oneBody/one_ranged';
import aio from './oneBody/aio';

export {one_tough, one_ranged, aio};


import defend_attack from './defend/defend-attack';
import defend_ranged from './defend/defend-ranged';

export {defend_attack, defend_ranged};


import quad_attack from './quadRole/quad-attack';
import quad_heal from './quadRole/quad-heal';
import quad_dismantle from './quadRole/quad-dismantle';
import quad_ranged from './quadRole/quad-ranged';

export {quad_attack, quad_heal, quad_dismantle, quad_ranged};


import aid_build from './aidRole/aid-build';
import aid_carry from './aidRole/aid-carry';
import aid_upgrade from './aidRole/aid-upgrade';

export {aid_build, aid_carry, aid_upgrade};


