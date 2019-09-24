import * as React from "react"
import ToastUtils from "@react-native-pure/toast"
import Icon from "react-native-vector-icons/FontAwesome"
import type {ToastOption} from "./Types";
import {View, Text} from "react-native"

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
    alone: ToastUtils.alone,
    success: (option) => ToastUtils.show(option),
    fail: (option) => ToastUtils.show(option),
    warn: (option) => ToastUtils.show(option),
    // success: (option: ToastOption) => {
    //     ToastUtils.show({
    //         renderMessage: (message, style) => {
    //             return (
    //                 <View>
    //                     <Icon name="check-circle" {...getIconOption(option)}/>
    //                     <Text style={style}>{message}</Text>
    //                 </View>
    //             );
    //         },
    //         ...option,
    //     })
    // },
    // fail: (option: ToastOption) => {
    //     ToastUtils.show({
    //         renderMessage: (message, style) => {
    //             return (
    //                 <View>
    //                     <Icon name="times-circle" {...getIconOption(option)}/>
    //                     <Text style={style}>{message}</Text>
    //                 </View>
    //             );
    //         },
    //         ...option,
    //     })
    // },
    // warn: (option: ToastOption) => {
    //     ToastUtils.show({
    //         renderMessage: (message, style) => {
    //             return (
    //                 <View>
    //                     <Icon name="warning" {...getIconOption(option)}/>
    //                     <Text style={style}>{message}</Text>
    //                 </View>
    //             );
    //         },
    //         ...option,
    //     })
    // }
}