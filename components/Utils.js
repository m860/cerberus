import * as React from "react"
import ReactNative from "react-native"
import type {AppletOption} from "./Types";
import equal from "fast-deep-equal"
import memoizeOne from "memoize-one"
import hoistNonReactStatics from 'hoist-non-react-statics';
import Console from "./Console"
import Import from "./Import";
import AsyncStorageExtra, {storage} from "@react-native-pure/async-storage-extra"

export function getAppletBaseURL(option: AppletOption): string {
    if (option.debug) {
        return option.baseURI;
    }
    return `${option.baseURI}/${option.secretKey}/${option.hash}`
}

export function getAppletEntryUrl(option: AppletOption): string {
    const baseURL = getAppletBaseURL(option);
    return `${baseURL}/${option.name}`;
}

export function getAppletAssetUrl(option: AppletOption, asset: string): string {
    const baseURL = getAppletBaseURL(option);
    return `${baseURL}/${asset}`;
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
            ListView: ReactNative.ListView,
            MaskedViewIOS: ReactNative.MaskedViewIOS,
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
            Slider: ReactNative.Slider,
            SnapshotViewIOS: ReactNative.SnapshotViewIOS,
            // StatusBar: null,
            Switch: ReactNative.Switch,
            TabBarIOS: ReactNative.TabBarIOS,
            TabBarIOSItem: ReactNative.TabBarIOS.Item,
            Text: ReactNative.Text,
            TextInput: ReactNative.TextInput,
            ToolbarAndroid: ReactNative.ToolbarAndroid,
            TouchableHighlight: ReactNative.TouchableHighlight,
            TouchableNativeFeedback: ReactNative.TouchableNativeFeedback,
            TouchableOpacity: ReactNative.TouchableOpacity,
            TouchableWithoutFeedback: ReactNative.TouchableWithoutFeedback,
            View: ReactNative.View,
            ViewPagerAndroid: ReactNative.ViewPagerAndroid,
            VirtualizedList: ReactNative.VirtualizedList,
            // WebView: null,
            AccessibilityInfo: ReactNative.AccessibilityInfo,
            ActionSheetIOS: ReactNative.ActionSheetIOS,
            Alert: ReactNative.Alert,
            AlertIOS: ReactNative.AlertIOS,
            Animated: ReactNative.Animated,
            // AppRegistry: null,
            AppState: ReactNative.AppState,
            AsyncStorage: {
                default: new AsyncStorageExtra(option.secretKey),
                storage: storage
            },
            BackAndroid: ReactNative.BackAndroid,
            BackHandler: ReactNative.BackHandler,
            CameraRoll: ReactNative.CameraRoll,
            Clipboard: ReactNative.Clipboard,
            DatePickerAndroid: ReactNative.DatePickerAndroid,
            Dimensions: ReactNative.Dimensions,
            Easing: ReactNative.Easing,
            Geolocation: ReactNative.Geolocation,
            ImageEditor: ReactNative.ImageEditor,
            ImagePickerIOS: ReactNative.ImagePickerIOS,
            ImageStore: ReactNative.ImageStore,
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
}

export const exportAllModules = memoizeOne((option: AppletOption & { exportModules: Function }) => {
    const {exportModules, ...rest} = option;
    return [
        ...exportCoreModules(rest),
        {
            Console: new Console(rest),
            Import: (module) => Import(module, option),
            ...exportModules(rest)
        }
    ];
}, (oldArgs: AppletOption & { exportModules: Function }, newArgs: AppletOption & { exportModules: Function }) => {
    const {exportModules: oldExportModules, ...oldOption} = oldArgs;
    const {exportModules: newExportModules, ...newOption} = newArgs;
    return equal(oldOption, newOption);
});