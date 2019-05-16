/**
 * @overview 文件描述
 * @author heykk
 */

import * as React from "react"
import {
    FlatList,
    View,
    Text,
    ActivityIndicator
} from "react-native"


type FlatListProps = {
    dataSource: array,
    renderItem: () => React.ReactElement < any >,
    onPageChange: (filter: object, refresh: bool) => void,
    totalRecords : number,
    initialPageIndex: number,
    initialPageSize? : number,
    enabledPageEmptyView? : bool,
    renderSeparator? : () => React.ReactElement < any >,
    renderHeader? : () => React.ReactElement < any >,
    renderEmptyView? : () => React.ReactElement < any >,
    indicatorColor? : string,
    style? : any,
    initialNumToRender? : number,
    extraData? : any
}


export default class FlatListPaging extends React.Component<FlatListProps> {

    static defaultProps = {
        enabledPageEmptyView: true,
        totalRecords: -1,
        indicatorColor: 'silver',
        emptyStyle: {
            flex: 1
        }
    }

    constructor(props) {
        super(props);
        this.filter = {
            pageIndex: props.initialPageIndex || 1,
            pageSize: props.initialPageSize || 10,
        };
        this.state = {
            refreshing: false,
            loadMore: false
        }
    }

    refresh = () => {
        this._onRefresh()
    }

    get isEnd() {
        let totalRecords = this.props.totalRecords || 0
        if (totalRecords === 0) {
            return true;
        }
        if (Math.ceil(totalRecords / this.filter.pageSize) <= this.filter.pageIndex) {
            return true;
        }
        return false;

    }

    _renderEmpty = () => {
        if (this.props.enabledPageEmptyView && !this.state.refreshing) {

            if (this.props.renderEmptyView) {
                return this.props.renderEmptyView()
            }
            return (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text>
                        暂无数据
                    </Text>
                </View>
            )
        }
        return null
    }

    _onRefresh = async () => {
        this.setState({
            refreshing: true,
            loadMore: false
        }, async () => {
            this.filter.pageIndex = this.props.initialPageIndex;
            await this.props.onPageChange({...this.filter}, true);
            this.setState({
                refreshing: false
            })
        });
    }

    _onEndReached = async () => {
        if (this.state.loadMore) {
            return
        }
        if (this.isEnd) {
            return
        }
        this.filter.pageIndex = this.filter.pageIndex + 1
        this.setState({
            loadMore: true
        }, async () => {
            await this.props.onPageChange({...this.filter}, false);
            this.setState({
                loadMore: false
            })
        })
    }

    _renderListFooter = () => {
        if (this.state.loadMore) {
            return (
                <View style={{flex: 1, height: 80, justifyContent: "center", alignItems: "center"}}>
                    <ActivityIndicator color={this.props.indicatorColor}/>
                </View>
            )
        } else if (this.isEnd && this.filter.pageIndex > this.props.initialPageIndex) {
            return (
                <View style={[{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 80
                }]}>
                    <View style={{
                        flex: 1,
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: '#EEEEEE'

                    }}/>
                    <Text style={{
                        marginLeft: 10,
                        marginRight: 10,
                        fontSize: 14,
                        color: '#9B9B9B'
                    }}>没有更多数据了</Text>
                    <View style={{
                        flex: 1,
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: '#EEEEEE'
                    }}/>
                </View>
            )
        }
        return null
    }

    render() {
        return (
            <FlatList
                ListEmptyComponent={this._renderEmpty}
                refreshing={this.state.refreshing}
                ItemSeparatorComponent={this.props.renderSeparator}
                data={this.props.dataSource}
                extraData={this.props.extraData}
                renderItem={this.props.renderItem}
                onRefresh={this._onRefresh}
                onEndReached={this._onEndReached}
                onEndReachedThreshold={0.5}
                refreshing={this.state.refreshing}
                initialNumToRender={this.props.initialNumToRender}
                ListFooterComponent={this._renderListFooter}
                ListHeaderComponent={this.props.renderHeader}
            />
        )
    }
};