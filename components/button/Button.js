import * as React from "react"
import {TouchableOpacity, StyleSheet, Text} from "react-native"

type Props = {
    disabled: boolean,
    onPress: Function,
    style?: any,
    textStyle?: any,
    activeOpacity?: number,
    children: string
};

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray",
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
    const {disabled, onPress, style, activeOpacity, textStyle} = props;
    return (
        <TouchableOpacity disabled={disabled}
                          onPress={onPress}
                          style={[style, disabled ? styles.disabledButton : styles.button]}
                          activeOpacity={activeOpacity}>
            <Text style={[textStyle, disabled ? styles.disabledText : styles.text]}>{props.children}</Text>
        </TouchableOpacity>
    );
}

export default React.memo(Button);