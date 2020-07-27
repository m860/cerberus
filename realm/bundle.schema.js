/**
 * @flow
 * @author Jean.h.ma 2020/6/8
 */
export default {
    name: 'bundle',
    primaryKey: 'secret',
    properties: {
        // 当前bundle的secret
        secret: 'string',
        // 当前bundle的hash值
        hash: 'string',
        // 所有的bundle地址，例如:[http://xxxx/xxx.js]
        bundles: 'string[]'
    },
};
