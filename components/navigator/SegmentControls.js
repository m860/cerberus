import * as React from "react"
import {StyleSheet, View, BackHandler} from "react-native";
import {HeaderBackButton} from "react-navigation";
import Segment from "./Segment";

type SegmentControlsProps = {
    jumpTo: (key: string) => void,
    navigation: Object,
    navigationState: Object & {
        index: number,
        params: mixed,
        routeName: string,
        routes: Array<{
            key: string,
            routeName: string,
            params: mixed
        }>
    },
    tabBarPosition: "top" | "bottom",
    getLabelText: (config: { route: { key: string, routeName: string } }) => string,
    headerRight?: (navigationState: Object) => React.Element
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        flexDirection: "row"
    },
    segmentContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    headerLeftView: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        alignItems: "center",
        flexDirection: "row",
    },
    headerRightView: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"
    }
});

export default class SegmentControls extends React.PureComponent<SegmentControlsProps> {
    _androidBackHandler = () => {
        this.props.navigation.goBack();
        return true;
    };

    render() {
        const {navigationState, navigation, headerRight} = this.props;
        const parentNavigation = navigation.dangerouslyGetParent();
        const canBack = parentNavigation && parentNavigation.state.index > 0 ? true : false;
        const getLabelText = (key: string, routeName: string) => {
            return this.props.getLabelText({route: {key, routeName}});
        };
        return (
            <View style={styles.container}>
                {canBack &&
                <View style={styles.headerLeftView}><HeaderBackButton onPress={() => navigation.goBack()}/></View>}
                <View style={styles.segmentContainer}>
                    {navigationState.routes.map((route, index) => {
                        return <Segment key={route.key}
                                        activate={index === navigation.state.index}
                                        tabLabel={getLabelText(route.key, route.routeName)}
                                        onPress={() => {
                                            navigation.navigate(route.routeName);
                                        }}/>
                    })}
                </View>
                {headerRight && <View style={styles.headerRightView}>{headerRight(navigationState)}</View>}
            </View>
        );
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this._androidBackHandler);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this._androidBackHandler);
    }
}