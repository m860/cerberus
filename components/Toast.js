import * as React from "react"
import ToastUtils from "@react-native-pure/toast"
import Icon from "react-native-vector-icons/FontAwesome"
import type {ToastOption} from "./Types";

function getIconOption(option: ToastOption) {
    let iconProps = {};
    if (option.icon) {
        if (option.icon.size) {
            iconProps.size = option.icon.size;
        }
        if (option.icon.color) {
            iconProps.color = option.icon.color;
        }
    }
    return iconProps;
}

export default {
    show: ToastUtils.show,
    success: (option: ToastOption) => {
        ToastUtils.show({
            renderIcon: () => {
                return <Icon name="check-circle" {...getIconOption(option)}/>
            },
            ...option,
        })
    },
    fail: (option: ToastOption) => {
        ToastUtils.show({
            renderIcon: () => {
                return <Icon name="times-circle" {...getIconOption(option)}/>
            },
            ...option,
        })
    },
    warn: (option: ToastOption) => {
        ToastUtils.show({
            renderIcon: () => {
                return <Icon name="warning" {...getIconOption(option)}/>
            },
            ...option,
        })
    }
}