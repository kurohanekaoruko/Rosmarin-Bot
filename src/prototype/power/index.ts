import { assignPrototype } from "@/prototype/base"
import BaseFunction from "./function/baseFunction"
import PowerCreepUsePower from "./function/usePower"
import PowerCreepRun from "./run"


const plugins = [
    BaseFunction,
    PowerCreepUsePower,
    PowerCreepRun
]


export default () => plugins.forEach(plugin => assignPrototype(PowerCreep, plugin))