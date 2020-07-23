/**
 * @flow
 * @author Jean.h.ma 2020/6/8
 */
import Realm from 'realm';

const instance = new Realm({
    path: 'cerberus.realm',
    schema: [
        require("./cache.schema").default,
        require("./bundle.schema").default
    ],
    schemaVersion: 1,
});

export default instance;
