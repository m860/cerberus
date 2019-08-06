import * as React from "react"
import {TouchableOpacity, StyleSheet, Text} from "react-native"

type Props = {
    disabled: boolean,
    onPress: Function,
    style?: any,
    textStyle?: any,
    activeOpacity?: number,
    disableTextStyle?:any,
    disableStyle?:any,
    children: string
};

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#339CFA",
        height: 50,
    },
    disabledButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
        opacity: 0.5,
        height: 50,
    },
    text: {
        fontSize: 16,
        color: "white"
    },
    disabledText: {
        fontSize: 16,
        color: "white"
    }
});

function Button(props: Props) {
    const {disabled, onPress, style, activeOpacity, textStyle,disableTextStyle,disableStyle} = props;
    return (
        <TouchableOpacity disabled={disabled}
                          onPress={onPress}
                          style={disabled ? [styles.disabledButton, style,disableStyle] : [styles.button, style]}
                          activeOpacity={activeOpacity}>
            <Text style={disabled ? [textStyle, styles.disabledText,disableTextStyle] : [styles.text, textStyle]}>{props.children}</Text>
        </TouchableOpacity>
    );
}

export default React.memo(Button);