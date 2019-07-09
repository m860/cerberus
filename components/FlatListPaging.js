/**
 * @overview 文件描述
 * @author heykk
 */

import * as React from "react"
import {ActivityIndicator, FlatList, StyleSheet, Text, View} from "react-native"
import type {Props as RNFlatListProps} from "react-native/Libraries/Lists/FlatList";


const LoadMoreStatus = {
    normal: 1,
    loading: 2,
    noMore: 3
};

type FlatListProps = RNFlatListProps<{
    dataSource:Array,
    renderItem:() => React.ReactElement<any>,
    onPageChange:( pageIndex:number ) => void,
    totalRecords:number, /**总页数**/
    pageIndex:number,
    startPageNum:number, /**页码开始位置**/
    pageSize:number, /**每页的item个数**/
    renderSeparator?:() => React.ReactElement<any>,
    renderHeader?:() => React.ReactElement<any>,
    renderEmpty?:() => React.ReactElement<any>,
    renderFooter?:( status:$Values<typeof LoadMoreStatus> )=>React.ReactElement<any>,
    indicatorColor?:string,
    style?:any,
    initialNumToRender?:number,
    extraData?:any,
    keyExtractor?:( item:Object, index:number ) => string,
    enableRefresh:boolean /**是否支持下拉刷新，默认支持**/
}>

type FlatListState = {
    refreshing:boolean,
    loadMore:boolean
}

const styles = StyleSheet.create({
    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingView: {
        flex: 1,
        height: 80,
        justifyContent: "center",
        alignItems: "center"
    },
    noMoreDataView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 80,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#EEEEEE",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#EEEEEE",
    },
    noMoreDataText: {
        marginLeft: 10,
        marginRight: 10,
        fontSize: 14,
        color: '#9B9B9B'
    }
});

export default class FlatListPaging extends React.PureComponent<FlatListProps, FlatListState> {

    static defaultProps = {
        totalRecords: -1,
        indicatorColor: 'silver',
        enableRefresh: true,
        emptyStyle: {
            flex: 1
        },
        renderEmpty: () => (
            <View style={styles.empty}>
                <Text>
                    暂无数据
                </Text>
            </View>
        )
    }

    constructor( props ) {
        super(props);
        this.state = {
            refreshing: false,
            loadMore: false
        };
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.pageIndex !== this.props.pageIndex &&
    //         nextProps.pageIndex === this.props.startPageNum &&
    //         !this.state.refreshing) {
    //         this._onRefresh()
    //     } else if (
    //         nextProps.pageIndex !== this.props.pageIndex &&
    //         nextProps.pageIndex !== this.props.startPageNum &&
    //         !this.state.loadMore) {
    //         this._onEndReached()
    //     }
    // }


    get isEnd() {
        let totalRecords = this.props.totalRecords || 0;
        if (totalRecords === 0) {
            return true;
        }
        if (Math.ceil(totalRecords / this.props.pageSize) <= (this.props.pageIndex || this.props.startPageNum)) {
            return true;
        }
        return false;

    }

    _renderEmpty = () => {
        if (!this.state.refreshing && this.props.totalRecords === 0) {
            return this.props.renderEmpty();
        }
        return null
    }

    _onRefresh = async () => {
        if (!this.props.enableRefresh) {
            return
        }
        let dateTime = new Date().getTime()
        this.setState({
            refreshing: true
        }, async () => {
            await this.props.onPageChange(this.props.startPageNum);
            setTimeout(() => {
                this.setState({
                    refreshing: false
                })
            }, Math.max(0, 800 - ((new Date()).getTime() - dateTime)))

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
            await this.props.onPageChange((this.props.pageIndex || this.props.startPageNum) + 1);
            this.setState({
                loadMore: false
            })
        })
    }

    _renderListFooter = () => {
        if (this.state.loadMore) {

            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.loading)) {
                return this.props.renderFooter(LoadMoreStatus.loading)
            }
            return (
                <View style={styles.loadingView}>
                    <ActivityIndicator color={this.props.indicatorColor}/>
                </View>
            )
        } else if (this.isEnd && this.props.pageIndex > this.props.startPageNum) {

            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.noMore)) {
                return this.props.renderFooter(LoadMoreStatus.noMore)
            }

            return (
                <View style={styles.noMoreDataView}>
                    <Text style={styles.noMoreDataText}>没有更多数据了</Text>
                </View>
            )
        } else {
            if (this.props.renderFooter && this.props.renderFooter(LoadMoreStatus.normal)) {
                return this.props.renderFooter(LoadMoreStatus.normal)
            }
            return null
        }
    }

    render() {
        const {style, keyExtractor, renderSeparator, dataSource, extraData, renderItem, initialNumToRender, renderHeader, ...reset} = this.props
        return (
            <FlatList style={style}
                      keyExtractor={keyExtractor}
                      ListEmptyComponent={this._renderEmpty}
                      refreshing={this.state.refreshing}
                      ItemSeparatorComponent={renderSeparator}
                      data={dataSource}
                      extraData={extraData}
                      renderItem={renderItem}
                      onRefresh={this._onRefresh}
                      onEndReached={this._onEndReached}
                      onEndReachedThreshold={0.5}
                      initialNumToRender={initialNumToRender}
                      ListFooterComponent={this._renderListFooter}
                      ListHeaderComponent={renderHeader}
                      {...reset}
            />
        )
    }

    async componentDidMount() {
        await this._onRefresh()
    }
};