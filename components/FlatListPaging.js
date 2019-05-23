/**
 * @overview 文件描述
 * @author heykk
 */

import * as React from "react"
import {
    FlatList,
    View,
    Text,
    ActivityIndicator,
    StyleSheet
} from "react-native"


type LoadMoreStatus = {
    nomal:1,
    loading:2,
    noMore:3
}

type FlatListProps = {
    dataSource: array,
    renderItem: () => React.ReactElement < any >,
    onPageChange: (pageIndex: number) => void,
    totalRecords : number,
    pageIndex:number,
    initialPageIndex: number,
    initialPageSize: number,
    enabledPageEmptyView? : bool,
    renderSeparator? : () => React.ReactElement < any >,
    renderHeader? : () => React.ReactElement < any >,
    renderEmptyView? : () => React.ReactElement < any >,
    renderFooter?:(status:$Values< typeof LoadMoreStatus>)=>React.ReactElement < any >,
    indicatorColor? : string,
    style? : any,
    initialNumToRender? : number,
    extraData? : any,
    keyExtractor?:(item: object, index: number) => string
}

type FlatListState = {
    refreshing:boolean,
    loadMore:boolean
}


export default class FlatListPaging extends React.Component<FlatListProps,FlatListState> {

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
        this.state = {
            refreshing: false,
            loadMore: false
        };
    }


    componentDidMount(){

        this.setState({
            refreshing:true
        },()=>{
            this._onRefresh()
        })
    }



    get isEnd() {
        let totalRecords = this.props.totalRecords || 0
        if (totalRecords === 0) {
            return true;
        }
        if (Math.ceil(totalRecords / this.props.initialPageSize) <= (this.props.pageIndex || this.props.initialPageIndex )) {
            return true;
        }
        return false;

    }

    _renderEmpty = () => {
        if (this.props.enabledPageEmptyView && !this.state.refreshing && this.props.totalRecords === 0) {

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
            await this.props.onPageChange(this.props.initialPageIndex);
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
        this.setState({
            loadMore: true
        }, async () => {
            await this.props.onPageChange((this.props.pageIndex || this.props.initialPageIndex )+1);
            this.setState({
                loadMore: false
            })
        })
    }

    _renderListFooter = () => {
        if (this.state.loadMore) {

            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.loading)){
                return this.props.renderFooter(LoadMoreStatus.loading)
            }
            return (
                <View style={{flex: 1, height: 80, justifyContent: "center", alignItems: "center"}}>
                    <ActivityIndicator color={this.props.indicatorColor}/>
                </View>
            )
        } else if (this.isEnd && this.props.pageIndex > this.props.initialPageIndex) {

            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.noMore)) {
                return this.props.renderFooter(LoadMoreStatus.noMore)
            }

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
        else {
            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.nomal)) {
                return this.props.renderFooter(LoadMoreStatus.nomal)
            }
            return null
        }
    }

    render() {
        return (
            <FlatList
                style={this.props.style}
                keyExtractor={this.props.keyExtractor}
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