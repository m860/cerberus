# cerberus

react-native微应用/微组件纯JS解决方案

## Usage

- 安装`cerberus-cli`
    
    ```bash
    $ npm i -D @m860/cerberus-cli
    ```
    
- 添加`cerberus-cli`配置文件 [配置参数](#cli配置参数说明)

    ```bash
    $ touch cbs.json
    ```
    
- 启动本地服务
    
    ```bash
    $ npx cbs cbs.json
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
type useCerberus=(option:CerberusOption)=>[CerberusState,any]
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

## Troubleshoot

- 图片没有显示出来
    
    cli在编译的时候将本地引用的图片编译为uri的方式，所以必须设置width和height才能够正常显示
    ```jsx harmony
    <Image source={require("image.png")} style={{width:100,height:100}}/>
    ```

<!--
## TODO

- [ ] 实现reload
- [ ] 实现`Cerberus`组件
- [ ] 完善文档
- [ ] 博文：cerberus原理解析
-->