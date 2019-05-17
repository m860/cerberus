/**
 * @overview 文件描述
 * @author heykk
 */

import {StyleSheet} from "react-native";



export const UnderlayColor = "#f1f1f1";

/**
 * button的默认样式
 */
export const DefaultButtonStyles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
        height: 50,
        width: "100%",
    },
    text: {
        fontSize: 16,
        color: "white"
    },
    disableButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
        opacity: 0.5,
        height: 50,
        width: "100%",
    },
    disableText: {
        fontSize: 16,
        color: "white"
    }
});


/**
 * 退出登录按钮样式
 */
export const LogoutButtonStyles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        height: 50,
        flex: 1
    },
    text: {
        backgroundColor: "rgba(0,0,0,0)",
        color: '#EE3D3D',
        fontSize: 16
    }
});

/**
 * 按钮样式:白色背景,蓝色文字
 */
export const WhiteButtonStyles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: 50,
        width: "100%",
    },
    text: {
        backgroundColor: "rgba(0,0,0,0)",
        color: '#208DEF',
        fontSize: 16
    },
    disableButton: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: UnderlayColor,
        height: 50,
        width: "100%",
    },
    disableText: {
        backgroundColor: "rgba(0,0,0,0)",
        color: '#999',
        fontSize: 16
    }
});

/**
 * 白色背景带边框的按钮样式
 */
export const WhiteBorderButtonStyles = StyleSheet.create({
    button: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: '#fff',
        height: 50,
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#e6e6e6",
        borderTopWidth: 1,
        borderTopColor: "#e6e6e6"
    },
    text: {
        backgroundColor: "rgba(0,0,0,0)",
        color: '#208DEF',
        fontSize: 16
    },
    disableButton: {
        alignItems: "center",
        justifyContent: 'center',
        backgroundColor: UnderlayColor,
        height: 50,
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#e6e6e6",
        borderTopWidth: 1,
        borderTopColor: "#e6e6e6"
    },
    disableText: {
        backgroundColor: "rgba(0,0,0,0)",
        color: '#999',
        fontSize: 16
    }
});

/**
 * 选择项目的按钮样式
 */
export const EmptyProjectStyles = StyleSheet.create({
    button: {
        borderRadius: 4,
        borderColor: '#4498F7',
        borderWidth: 1,
        backgroundColor: "rgba(68,152,247,0.06)"
    },
    text: {
        color: "#208DEF",
        fontSize: 14,
        marginHorizontal: 26,
        marginVertical: 8
    },
});

/**
 * 按钮样式:蓝色背景,圆角
 */
export const BlueButtonStyles = StyleSheet.create({
    button: {
        backgroundColor: "#339CFA",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 50
    },
    text: {
        color: "white",
        fontSize: 16
    },
    disableButton: {
        backgroundColor: "#339CFA",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 50,
        opacity: 0.5
    },
    disableText: {
        color: "white",
        fontSize: 16
    }
});

/**
 * 按钮样式:蓝色背景,没有圆角
 * @type {{}}
 */
export const BlueButtonNoRadiusStyles = StyleSheet.create({
    button: {
        backgroundColor: "#339CFA",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 50
    },
    text: {
        color: "white",
        fontSize: 16
    },
    disableButton: {
        backgroundColor: "#339CFA",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 50,
        opacity: 0.5
    },
    disableText: {
        color: "white",
        fontSize: 16
    }
})


