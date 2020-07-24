/**
 * @flow
 * @author Jean.h.ma 2020/6/8
 */
export default {
    name: 'cache',
    primaryKey: 'hash',
    properties: {
        // 此字段对应的是文件的url地址，
        // 地址格式：http://${widget.baseURL}/bundle/${widget.userID}/${widget.id}/${bundle.hash}/${filename}
        hash: 'string',
        // 代码
        code: 'string'
    },
};
