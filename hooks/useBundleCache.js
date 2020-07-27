/**
 * @flow
 * @author Jean.h.ma 2020/6/8
 *
 * 用于存储bundle的相关信息，并不存储代码
 *
 */
import instance from "../realm";
import BundleSchema from "../realm/bundle.schema";

class BundleCache<IBundleCache> {
    get(secret: string): BundleRecord | null {
        return instance.objects(BundleSchema.name).find(f => f.secret === secret);
    }

    set(record: BundleRecord) {
        try {
            instance.beginTransaction();
            instance.create(BundleSchema.name, record, "all");
            instance.commitTransaction();
        } catch (ex) {
            instance.cancelTransaction();
            console.log("cerberus", `bundle cache set fail, ${ex.message}`);
        }
    }

    has(secret: string): boolean {
        return !!instance.objects(BundleSchema.name).find(f => f.secret === secret);
    }

    clear() {
        try {
            instance.beginTransaction();
            const records = instance.objects(BundleSchema.name);
            instance.delete(records);
            instance.commitTransaction();
        } catch (ex) {
            instance.cancelTransaction();
            console.log("cerberus", `bundle cache clear fail, ${ex.message}`);
        }
    }
}

// 默认的bundle缓存
const defaultBundleCacheInstance: IBundleCache = new BundleCache();

export default function (cache?: ?IBundleCache) {
    return {
        cache: cache || defaultBundleCacheInstance
    }
}
