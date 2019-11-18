import * as React from "react"
import ReactNative from "react-native"
import type {AppletOption, ImagePickerOption, ImagePickerResult} from "./Types";
import equal from "fast-deep-equal"
import memoizeOne from "memoize-one"
import hoistNonReactStatics from 'hoist-non-react-statics';
import Console from "./Console"
import Import from "./Import";
import AsyncStorageExtra, {storage} from "@react-native-pure/async-storage-extra"
import {
    createAppContainer,
    createMaterialTopTabNavigator,
    createStackNavigator,
    withNavigation,
    HeaderBackButton,
    createBottomTabNavigator
} from "react-navigation"
import PropTypes from "prop-types"
import axios from "axios"
import Permissions from "react-native-permissions";
import ImagePicker from "react-native-image-crop-picker"
import createAppletFile from "./createAppletFile";
import * as ImageUtils from '@ibuild-community/react-native-image-utils'
import * as Draw from '@ibuild-community/react-native-draw'

export function openImagePicker(option: ImagePickerOption): Promise<Array<ImagePickerResult> | ImagePickerResult | null> {
    return new Promise((resolve, reject) => {
        Permissions.check('photo').then((res) => {
            if (res === 'denied') {
                reject({
                    message: "请前往设置开启相册使用权限"
                })
            } else {
                ImagePicker.openPicker(option)
                    .then(response => {
                        if (response) {
                            if (response instanceof  Array) {
                                resolve(response.map(item => {
                                    return {
                                        path: item.path,
                                        width: item.width,
                                        height: item.height,
                                        mime: item.mime,
                                        size: item.size,
                                        modificationDate: item.modificationDate,
                                    }
                                }))
                            } else {
                                resolve({
                                    path: response.path,
                                    width: response.width,
                                    height: response.height,
                                    mime: response.mime,
                                    size: response.size,
                                    modificationDate: response.modificationDate,
                                })
                            }
                        }

                    })
                    .catch((err) => {
                        reject(err)
                    });
            }
        })
    })
}

export function alert(message: string, callback: () => void, title: string = "") {
    ReactNative.Alert.alert(title, message, [{
        text: "确定",
        onPress() {
            if (callback) {
                callback();
            }
        }
    }]);
}

export function confirm(message: string, callback: (value: boolean) => void, title: string = "", okText: string = "确定", cancelText: string = "取消") {
    ReactNative.Alert.alert(title, message, [{
        text: cancelText,
        onPress() {
            if (callback) {
                callback(false);
            }
        }
    }, {
        text: okText,
        onPress() {
            if (callback) {
                callback(true);
            }
        }
    }]);
}

export function getDebugAppletEntryUrl(option: AppletOption): string {
    return `${option.baseURI}/${option.name}`;
}

export function getAppletPackageUrl(option: AppletOption): string {
    return `${option.baseURI}/${option.secretKey}/${option.hash}/${option.hash}.zip`;
}

export function getAppletEntryFile(option: AppletOption & { rootDir: string }): string {
    return `${option.rootDir}/${option.secretKey}/${option.hash}/${option.name}`;
}

export function getAppletAssetUrl(option: AppletOption & { rootDir: string }, asset: string): string {
    if (option.debug) {
        return `${option.baseURI}/${asset}`;
    }
    const assetUri = `${option.rootDir}/${option.secretKey}/${option.hash}/${asset}`;
    if (ReactNative.Platform.OS === "android") {
        return `file://${assetUri}`;
    }
    return assetUri;
}

export function mutateImageComponent(ImageComponent: React.Component, option: AppletOption) {
    class WrappedComponent extends React.Component {
        render() {
            const {source, forwardedRef, ...rest} = this.props;
            const nextSource = typeof source === "string" ? {uri: getAppletAssetUrl(option, source)} : source;
            return (
                <ImageComponent {...rest}
                                source={nextSource}
                                ref={forwardedRef}></ImageComponent>
            )
        }
    }

    const nextWrappedComponent = React.forwardRef((props, ref) => {
        return <WrappedComponent {...props} forwardedRef={ref}></WrappedComponent>
    });

    hoistNonReactStatics(nextWrappedComponent, ImageComponent);

    return nextWrappedComponent;

}

export const exportCoreModules = (option: AppletOption) => {
    return [
        React,
        {
            ActivityIndicator: ReactNative.ActivityIndicator,
            Button: ReactNative.Button,
            DatePickerIOS: ReactNative.DatePickerIOS,
            DrawerLayoutAndroid: ReactNative.DrawerLayoutAndroid,
            FlatList: ReactNative.FlatList,
            Image: mutateImageComponent(ReactNative.Image, option),
            ImageBackground: mutateImageComponent(ReactNative.ImageBackground, option),
            InputAccessoryView: ReactNative.InputAccessoryView,
            KeyboardAvoidingView: ReactNative.KeyboardAvoidingView,
            // ListView: ReactNative.ListView,
            // MaskedViewIOS: ReactNative.MaskedViewIOS,
            Modal: ReactNative.Modal,
            // NavigatorIOS: null,
            Picker: ReactNative.Picker,
            PickerIOS: ReactNative.PickerIOS,
            ProgressBarAndroid: ReactNative.ProgressBarAndroid,
            ProgressViewIOS: ReactNative.ProgressViewIOS,
            RefreshControl: ReactNative.RefreshControl,
            SafeAreaView: ReactNative.SafeAreaView,
            ScrollView: ReactNative.ScrollView,
            SectionList: ReactNative.SectionList,
            SegmentedControlIOS: ReactNative.SegmentedControlIOS,
            // Slider: ReactNative.Slider,
            SnapshotViewIOS: ReactNative.SnapshotViewIOS,
            // StatusBar: null,
            Switch: ReactNative.Switch,
            // TabBarIOS: ReactNative.TabBarIOS,
            // TabBarIOSItem: ReactNative.TabBarIOS.Item,
            Text: ReactNative.Text,
            TextInput: ReactNative.TextInput,
            ToolbarAndroid: ReactNative.ToolbarAndroid,
            TouchableHighlight: ReactNative.TouchableHighlight,
            TouchableNativeFeedback: ReactNative.TouchableNativeFeedback,
            TouchableOpacity: ReactNative.TouchableOpacity,
            TouchableWithoutFeedback: ReactNative.TouchableWithoutFeedback,
            View: ReactNative.View,
            // ViewPagerAndroid: ReactNative.ViewPagerAndroid,
            VirtualizedList: ReactNative.VirtualizedList,
            // WebView: null,
            AccessibilityInfo: ReactNative.AccessibilityInfo,
            ActionSheetIOS: ReactNative.ActionSheetIOS,
            Alert: ReactNative.Alert,
            // AlertIOS: ReactNative.AlertIOS,
            Animated: ReactNative.Animated,
            // AppRegistry: null,
            AppState: ReactNative.AppState,
            AsyncStorage: {
                default: new AsyncStorageExtra({
                    prefix: option.secretKey,
                    preload: false
                }),
                storage: storage
            },
            // BackAndroid: ReactNative.BackAndroid,
            BackHandler: ReactNative.BackHandler,
            CameraRoll: ReactNative.CameraRoll,
            Clipboard: ReactNative.Clipboard,
            DatePickerAndroid: ReactNative.DatePickerAndroid,
            Dimensions: ReactNative.Dimensions,
            Easing: ReactNative.Easing,
            Geolocation: ReactNative.Geolocation,
            ImageEditor: ReactNative.ImageEditor,
            ImagePickerIOS: ReactNative.ImagePickerIOS,
            // ImageStore: ReactNative.ImageStore,
            InteractionManager: ReactNative.InteractionManager,
            Keyboard: ReactNative.Keyboard,
            LayoutAnimation: ReactNative.LayoutAnimation,
            Linking: ReactNative.Linking,
            // ListViewDataSource: null,
            NetInfo: ReactNative.NetInfo,
            PanResponder: ReactNative.PanResponder,
            PermissionsAndroid: ReactNative.PermissionsAndroid,
            PixelRatio: ReactNative.PixelRatio,
            // PushNotificationIOS: null,// ReactNative.PushNotificationIOS,
            Settings: ReactNative.Settings,
            Share: ReactNative.Share,
            // StatusBarIOS: null,//ReactNative.StatusBarIOS,
            StyleSheet: ReactNative.StyleSheet,
            TimePickerAndroid: ReactNative.TimePickerAndroid,
            ToastAndroid: ReactNative.ToastAndroid,
            Vibration: ReactNative.Vibration,
            VibrationIOS: ReactNative.VibrationIOS,
            Platform: ReactNative.Platform
        }
    ]
};

export function findInitialRoute(routeConfigMap, config) {
    const keys = Object.keys(routeConfigMap);
    let initialRouteName = keys[0];
    if (config) {
        if (config.initialRouteName) {
            initialRouteName = config.initialRouteName;
        }
    }
    return routeConfigMap[initialRouteName];
}

export function applyBackButton(route, parentNavigation) {
    if (!route.navigationOptions) {
        route.navigationOptions = {};
    }
    const backHandler = () => {
        parentNavigation.goBack();
    };
    const HeaderLeft = (
        <HeaderBackButton onPress={backHandler}></HeaderBackButton>
    );
    if (typeof route.navigationOptions === "function") {
        const navigationOptions = route.navigationOptions;
        route.navigationOptions = function (...args) {
            let conf = navigationOptions(...args);
            conf.headerLeft = HeaderLeft;
        }
    } else {
        route.navigationOptions.headerLeft = HeaderLeft;
    }

}

export const exportAllModules = memoizeOne((option: AppletOption & { exportModules: Function, rootDir: string, parentNavigation: Object }) => {
    const {exportModules, parentNavigation, ...rest} = option;
    return [
        ...exportCoreModules(rest),
        {
            Console: new Console(rest),
            Import: (module) => Import(module, option),
            Navigator: {
                withNavigation: withNavigation,
                createMaterialTopTabNavigator: function (routeConfigMap, config) {
                    let initialRoute = findInitialRoute(routeConfigMap, config);
                    applyBackButton(initialRoute, parentNavigation);
                    return createMaterialTopTabNavigator(routeConfigMap, config);
                },
                createStackNavigator: function (routeConfigMap, config) {
                    let initialRoute = findInitialRoute(routeConfigMap, config);
                    applyBackButton(initialRoute, parentNavigation);
                    return createStackNavigator(routeConfigMap, config);
                },
                createBottomTabNavigator: function (routeConfigMap, config) {
                    let initialRoute = findInitialRoute(routeConfigMap, config);
                    applyBackButton(initialRoute, parentNavigation);
                    return createBottomTabNavigator(routeConfigMap, config);
                },
                createAppContainer: createAppContainer,
                SegmentControls: require("./navigator/SegmentControls").default
            },
            // PropTypes: PropTypes,
            // Emitter: require("fbemitter"),
            // SkeletonView: require("@react-native-pure/skeleton-view"),
            // Http: axios.create(),
            // UUID: require("uuid"),
            // Icons: {
            //     FontAwesome: require("react-native-vector-icons/FontAwesome").default,
            //     Evil: require("react-native-vector-icons/EvilIcons").default,
            //     AntDesign: require("react-native-vector-icons/AntDesign").default,
            //     Entypo: require("react-native-vector-icons/Entypo").default,
            //     Material: require("react-native-vector-icons/MaterialIcons").default,
            //     MaterialCommunity: require("react-native-vector-icons/MaterialCommunityIcons").default,
            //     SimpleLine: require("react-native-vector-icons/SimpleLineIcons").default,
            // },
            // HTML: require("react-native-render-html").default,
            // DatePicker: require("react-native-datepicker").default,
            // Svg: require("react-native-svg"),
            // DeviceInfo: require("react-native-device-info").default,
            // TagSelector: require("@react-native-pure/tag-selector").default,
            // BaiduMap: {
            //     default: require("@ibuild-community/react-native-baidu-map").default,
            //     getCurrentPosition: require("@ibuild-community/react-native-baidu-map").getCurrentPosition,
            //     Overlay: require("@ibuild-community/react-native-baidu-map").Overlay,
            //     TextMarker: require("@ibuild-community/react-native-baidu-map").TextMarker,
            //     ImageMarker: mutateImageComponent(require("@ibuild-community/react-native-baidu-map").ImageMarker, option),
            // },
            Utils: {
                formatDate: require("dateformat"),
                alert: alert,
                confirm: confirm,
                update: require("immutability-helper").default,
                openImagePicker: openImagePicker
            },
            Toast: require("./Toast").default,
            File: createAppletFile(option),
            Share: {
                shareToWeChatSceneSession: require('@ibuild-community/react-native-share').shareToWeChatSceneSession,
                shareToWeChatSceneTimeline: require('@ibuild-community/react-native-share').shareToWeChatSceneTimeline,
                openWX: require('@ibuild-community/react-native-share').openWX,
                openSystemShare: require('@ibuild-community/react-native-share').openSystemShare
            },
            // Gallery: require('@react-native-pure/gallery').default,
            // Camera: require("@ibuild-community/react-native-camera").RNCamera,
            // SimpleChart: require("@ibuild-community/simple-chart"),
            ImageUtils: ImageUtils,
            Draw: Draw,
            Calendar: {
                default: require("react-native-calendars").Calendar,
                CalendarList: require("react-native-calendars").CalendarList,
                Agenda: require("react-native-calendars").Agenda,
                LocaleConfig: require("react-native-calendars").LocaleConfig,
            },
            // WheelPicker: require("@ibuild-community/react-native-wheel-picker").default,
            // ViewShot: require('@ibuild-community/react-native-view-shot'),
            FlatListPaging: require("./FlatListPaging").default,
            // VictoryNative: require("victory-native"),
            // Button: {
            //     default: require("./button/Button").default,
            //     // ...require("./button/ButtonStyle"
            // },
            // TabView: require("react-native-tab-view"),
            // IBuildModal:require("@react-native-pure/ibuild-modal"),
            ...exportModules(rest)
        }
    ];
}, (oldArgs: AppletOption & { exportModules: Function }, newArgs: AppletOption & { exportModules: Function }) => {
    const {exportModules: oldExportModules, ...oldOption} = oldArgs;
    const {exportModules: newExportModules, ...newOption} = newArgs;
    return equal(oldOption, newOption);
});
