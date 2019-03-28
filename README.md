# react-native-applet

React Native 小程序容器,默认情况下导出了React,ReactNative,Modules(基本组件),也可以通过`props.exportModules`对Modules进行扩展

## Install

react-native-applet发布在内网的npm上的,安装前必须要先配置`.npmrc`来执行npm源

`.npmrc`配置如下

```
registry=http://172.16.0.132:18081/repository/npm/
always-auth=true
email=npm@yzw.cn
_auth=bnBtOjEyMzQ1Ng==
```

```
$ npm i @ibuild-community/react-native-applet
```

## Simple Usage

```
import Applet from "@ibuild-community/react-native-applet"

class Test extends React.Component{
    render(){
        return (
            <Applet/>
        );
    }
}

```

## Applet

### Props

- `baseURI` **string** 小程序的基地址
- `hash` **string** 小程序的版本
- `debug` **boolean** 是否是调试模式
- `name` **string** 入口文件名,如:main.js
- `secretKey` **string** 密钥
- `permission` **number** 权限
- `icon` **string** 小程序Icon
- `description` **string** 小程序描述
- `isItAuthorized` **boolean** 是否已经授权
- `renderType` **$Values<typeof RenderType>** 渲染类型,默认`RenderType.native`
- `appType` **$Values<typeof AppletType>** app类型,默认`AppletType.normal`
- `navigation` **Object**
- `renderPrepareScreen` **(props: { progress: number }) => React.Element** 小程序加载的Screen
- `renderErrorScreen` **(error: Error) => React.Element** 小程序发生错误的Screen
- `id?` **string** 默认值是`Date.now()`
- `rootDir?` **string** 默认值`RNFetchBlob.fs.dirs.CacheDir + "/applets"`
- `exportModules` **(option: Object) => Object** 扩展Modules

### RenderType

- `native`
- `web`

### AppletType

- `normal`
- `inner`