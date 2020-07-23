# cerberus

react-native微应用/微组件纯JS解决方案

## Usage

- 安装`cerberus-cli`
    
    ```bash
    $ npm i -g @m860/cerberus-cli
    ```
    
- 添加`cerberus-cli`配置文件 [配置参数](#cli配置参数说明)

    ```bash
    $ touch cbs.json
    ```
    
- 启动本地服务
    
    ```bash
    $ npx cbs start cbs.json
    ```
    
- 安装`cerberus`

    ```bash
    $ npm i @m860/cerberus
    ```
    
- 使用`useCerberus`加载

    ```jsx harmony
    import * as React from "react"
    import {useCerberus} from "@m860/cerberus"
  
    export default function(){
        const [status,defined]=useCerberus({
            entry:"http://localhost:9000/main.js"
        });
        if(defined){
            const {default:App}=defined;
            return <App/>
        }
        return null;
    }
    ```
> NOTE: 目前只支持hooks

[Full Example](https://github.com/m860/cerberus-example)

## Types

```flow js
const CerberusStatusCode = {
    // 准备
    prepare: 0,
    // 下载中
    downloading: 10,
    // 编译中
    compiling: 20,
    // 错误
    error: 90,
    // 成功
    success: 100
};
type CerberusOption = {
    /**
     * 入口文件，例如:http://DOMAIN/main.js
     */
    entry: ?string
        | ?{ url: string, option?: Object },
    /**
     * 需要注入到小程序的module
     */
    injectModules?: ()=>Object,
    /**
     * 默认需要执行的代码
     */
    defaultCode?: string
};
type CerberusState = {
    status: $Values<typeof CerberusStatusCode>,
    error: ?Error
};
type useCerberus=(option:CerberusOption)=>[CerberusState,any,Function]
```
    
## cli配置参数说明

```flow js
type ConfigOption={
    // 同webpack.mode
    mode:string,
    // 同webpack.entry
    entry:any,
    // 同webpack.output
    output:any,
    /**
    * 需要替换的module
    * 
    * @example
    * {
    *     cerberusTransformOption:{
    *         modules:["dateformat"]
    *     }
    * }
    * 
    */
    cerberusTransformOption:{
        modules:Array<string>,
        /**
         * 需要处理的资源文件的正则表达式，默认：/\.(gif|png|jpeg|jpg|svg)$/i 
         */
        resourceTest?:?RegExp
    }
}
```

## 最佳实践

- 一级页面不要使用`cerberus`来管理组件
- 预加载组件，在APP启动的时候进行一次预加载。

## 自定义cloud访问的client

```jsx harmony
// 在App中使用CerberusContextProvider来自定义client
import * as React from "react"
import ApolloClient from "apollo-boost";
import {CerberusContextProvider} from "@m860/cerberus"

export default function (){
    return (
        <CerberusContextProvider value={{
            client:{
                uri:"http://xxx"
            }
        }}>
        </CerberusContextProvider>
    );
}
```

## Troubleshoot

- 图片没有显示出来
    
    cli在编译的时候将本地引用的图片编译为uri的方式，所以必须设置width和height才能够正常显示
    ```jsx harmony
    <Image source={require("image.png")} style={{width:100,height:100}}/>
    ```
- `debug`模式下缓存不生效
- 默认缓存使用`AsyncStorage`，也可以自定义缓存方式
- 所有的缓存都不会自己清楚，如果要清楚缓存需要自己实现，缓存的`key`可以按照一定的规则来设计。
- `queryEntry`参数的urls的顺序和配置文件中的顺序可能不一致，不要使用如下方式：`(urls)=>urls[2]`

