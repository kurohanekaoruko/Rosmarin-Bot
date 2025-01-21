import { assignPrototype } from "@/prototype/base"
import BaseFunction from "./function/baseFunction"
import MoveFunction from "./function/moveFuntion"
import WorkFunction from "./function/workFunction"
import DoubleAction from "./function/doubleAction"
import CreepRun from "./run"

const plugins = [
    BaseFunction,
    MoveFunction,
    WorkFunction,
    DoubleAction,
    CreepRun,
]

export default () => plugins.forEach(plugin => assignPrototype(Creep, plugin))
