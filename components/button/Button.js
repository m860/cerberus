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
    disabledText: {}
});

function Button(props: Props) {
    const {disabled, onPress, style, activeOpacity, textStyle} = props;
    return (
        <TouchableOpacity disabled={disabled}
                          onPress={onPress}
                          style={style}
                          activeOpacity={activeOpacity}>
            <Text style={[textStyle, disabled ? styles.disabledText : null]}>{props.children}</Text>
        </TouchableOpacity>
    );
}

export default React.memo(Button);