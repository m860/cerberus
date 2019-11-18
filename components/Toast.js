import * as React from "react"
import ToastUtils from "@react-native-pure/toast"


export default {
    show: ToastUtils.show,
    alone: ToastUtils.alone,
    success: (option) => ToastUtils.show(option),
    fail: (option) => ToastUtils.show(option),
    warn: (option) => ToastUtils.show(option),
}