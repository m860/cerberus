import React, {PureComponent} from "react"
import {Text, TouchableHighlight, View} from "react-native"
import {DefaultButtonStyles,UnderlayColor} from './ButtonStyle'


const PositionType = {

    /**底部*/
    bottom: "bottom",

    /**任意位置**/
    any: "any"
};


type StylesShape = {
    button?:object,
    text?:object,
    disableButton?:object,
    disableText?:object
}


type ButtonProps = {
    children: any,
    onPress?: ()=>void,
    disabled?: bool,
    position?: $Values< typeof PositionType>,
    styles: StylesShape
}


export default class Button extends PureComponent<ButtonProps> {

    static defaultProps = {
        onPress: () => null,
        disabled: false,
        styles: DefaultButtonStyles,
        position: "any"
    };

    constructor(props) {
        super(props);
    }

    _renderChildren(textStyle) {
        if (typeof this.props.children === "string") {
            return (
                <Text style={[this.props.position === "bottom"?{fontWeight:'bold'}:{},textStyle]}>{this.props.children}</Text>
            );
        }
        return this.props.children;
    }

    render() {
        const buttonStyle = this.props.disabled ? this.props.styles.disableButton : this.props.styles.button;
        const textStyle = this.props.disabled ? this.props.styles.disableText : this.props.styles.text;
        let content = null;
        if (this.props.disabled) {
            content = (
                <View style={buttonStyle}>
                    {this._renderChildren(textStyle)}
                </View>
            )
        }
        else {
            content = (
                <TouchableHighlight underlayColor={UnderlayColor}
                                    style={buttonStyle}
                                    onPress={this.props.onPress}>
                    {this._renderChildren(textStyle)}
                </TouchableHighlight>
            )
        }
        return content;
    }
}


