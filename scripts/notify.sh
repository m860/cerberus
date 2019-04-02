#!/usr/bin/env bash

code=$(curl https://oapi.dingtalk.com/robot/send?access_token=42b802e52335fe36c884c4a944eb42831263bdb26eda3ca163863fe45d9fc3d6 \
        -H "Accept: application/json"  \
        -H "Content-Type: application/json"  \
        -d "{\"msgtype\":\"markdown\",\"markdown\":{\"title\":\"react-native-applet更新\",\"text\":\"@ibuild-community/react-native-applet组件更新,具体内容请查看[tags](http://cmisgitlab01/ibuild-app/react-native-applet/tags)\"}}" \
        --output /dev/null \
        --progress-bar \
        --write-out %{http_code})
if [[ ${code} -ne 200 ]];then
    echo "消息发送失败"
    exit code
fi