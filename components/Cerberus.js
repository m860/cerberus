/**
 * @flow
 * @author Jean.h.ma 2019-11-29
 *
 * @TODO 实现Cerberus Component
 *
 */
import * as React from "react"
import * as ReactNative from "react-native"
import type {CerberusOption, CerberusState} from "../hooks/useCerberus";

export type CerberusProps = {
    option: CerberusOption,
    onChange?: (status: CerberusState, defined: any)=>?React.Element<*>
};

type State = {
    code: ?string
};

export class Cerberus extends React.PureComponent<CerberusProps, State> {

    constructor(props) {
        super(props);

    }

    render() {
        const {
            onChange
        } = this.props;
        if (onChange) {
            return onChange()
        }
        return null;
    }
}