import { assignPrototype } from "../base"
import BaseFunction from "./baseFunction"

const plugins = [
    BaseFunction,
]

export default () => plugins.forEach(plugin => assignPrototype(RoomPosition, plugin))