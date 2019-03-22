import * as React from "react"
import {View, TouchableWithoutFeedback, Text, StyleSheet} from "react-native"

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        width: 60
    },
    activateContainer: {},
    text: {
        color: "#8E969A",
        fontSize: 15,
        fontWeight: "bold"
    },
    activateText: {
        color: "#3C4348",
        fontSize: 19,
        fontWeight: "bold"
    }
});

type SegmentProps = {
    onPress: () => void,
    activate: boolean,
    tabLabel: string
};

export default React.memo(function ({onPress, activate, tabLabel}: SegmentProps) {
    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View style={[styles.container, activate ? styles.activateContainer : null]}>
                <Text style={[styles.text, activate ? styles.activateText : null]}>{tabLabel}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
});