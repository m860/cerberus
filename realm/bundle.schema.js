/**
 * @flow
 * @author Jean.h.ma 2020/6/8
 */
export default {
    name: 'bundle',
    primaryKey: 'secret',
    properties: {
        secret: 'string',
        hash: 'string',
        bundles: 'string[]'
    },
};
