# cerberus

react-native微应用/微组件纯JS解决方案

## Usage

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