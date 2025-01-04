import { assignPrototype } from "@/prototype/base"
import BaseFunction from "./function/baseFunction"
import MoveFunction from "./function/moveFuntion"
import WorkFunction from "./function/workFunction"

const plugins = [
    BaseFunction,
    MoveFunction,
    WorkFunction,
]

export default () => plugins.forEach(plugin => assignPrototype(Creep, plugin))
