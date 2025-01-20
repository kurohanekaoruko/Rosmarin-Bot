import { assignPrototype } from "@/prototype/base"
import BaseFunction from "./function/baseFunction"
import MoveFunction from "./function/moveFuntion"
import WorkFunction from "./function/workFunction"
import DoubleAction from "./function/doubleAction"

const plugins = [
    BaseFunction,
    MoveFunction,
    WorkFunction,
    DoubleAction
]

export default () => plugins.forEach(plugin => assignPrototype(Creep, plugin))
