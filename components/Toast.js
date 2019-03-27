import * as React from "react"
import ToastUtils from "@react-native-pure/toast"
import Icon from "react-native-vector-icons/FontAwesome"
import type {ToastOption} from "./Types";


export default {
    show: ToastUtils.show,
    success: (option: ToastOption) => {
        ToastUtils.show({
            ...option,
            renderIcon: () => {
                return <Icon name="times-circle" size={option.icon.size} color={option.icon.color}/>
            }
        })
    },
    fail: (option: ToastOption) => {
        ToastUtils.show({
            ...option,
            renderIcon: () => {
                return <Icon name="check-circle" size={option.icon.size} color={option.icon.color}/>
            }
        })
    },
    warn: (option: ToastOption) => {
        ToastUtils.show({
            ...option,
            renderIcon: () => {
                return <Icon name="warning" size={option.icon.size} color={option.icon.color}/>
            }
        })
    }
}