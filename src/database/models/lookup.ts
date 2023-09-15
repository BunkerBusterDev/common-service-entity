import mongoose from 'mongoose';

const { Schema } = mongoose;

const lookupSchema = new Schema(
    {
        // 부모 resourceID
        parentID: {
            type: String,
            required: true,
        },
        // 개별 리소스의 고유 식별자
        resourceID: {
            type: String,
            required: true,
            unique: true,
        },
        // 개별 리소스의 유형을 나타냄 (2: applicationEntity, 3: container, 4: contentInstance, 5: commonServiceEntity)
        resourceType: {
            type: Number,
            required: true,
        },
        // 리소스가 생성된 시간
        creationTime: {
            type: Date,
            required: true,
        },
        // 리소스의 상태를 나타내는 태그로 수정시 마다 1씩 증가
        stateTag: {
            type: Number,
            required: true,
        },
        // 리소스의 이름을 나타냄
        resourceName: {
            type: String,
            required: true,
        },
        // 리소스가 마지막으로 수정된 시간
        lastModifiedTime: {
            type: Date,
            required: true,
        },
        // 리소스가 만료되는 시간
        expirationTime: {
            type: Date,
            required: true,
        },
        // 리소스에 대한 접근 제어 정책의 ID 리스트
        accessControlPolicyIDs: {
            type: String,
            required: true,
        },
        // 리소스를 분류하거나 검색하기 위해 사용되는 태그 또는 라벨 리스트
        labels: {
            type: String,
            required: true,
        },
        // 리소스가 발표될 대상을 나타냄
        announceTo: {
            type: String,
            required: true,
        },
        // 리소스가 발표된 속성을 나타냄
        announcedAttribute: {
            type: String,
            required: true,
        },
        // 효율적 참조를 위한 짧은 resourceID
        shortResourceID: {
            type: String,
            required: true,
        },
        // 효율적 참조를 위한 짧은 parentID
        shortParentID: {
            type: String,
            required: true,
        },
        // 이 리소스의 subscription에 대한 리스트
        subscribedResourceList: {
            type: String,
            required: false,
        },
    },
    {
        statics: {
            findIsExistByResourceID(resourceID: string) {
                return this.findOne({ resourceID: resourceID }, { _id: false, resourceID: true });
            },
            insertLookup(resourceObject) {
                const lookup = new this({
                    parentID: resourceObject.parentID,
                    resourceID: resourceObject.resourceID,
                    resourceType: resourceObject.resourceType,
                    creationTime: new Date(resourceObject.creationTime),
                    stateTag: resourceObject.stateTag,
                    resourceName: resourceObject.resourceName,
                    lastModifiedTime: resourceObject.lastModifiedTime,
                    expirationTime: new Date(resourceObject.expirationTime),
                    accessControlPolicyIDs: JSON.stringify(resourceObject.accessControlPolicyIDs),
                    labels: JSON.stringify(resourceObject.labels),
                    announceTo: JSON.stringify(resourceObject.announceTo),
                    announcedAttribute: JSON.stringify(resourceObject.announcedAttribute),
                    shortResourceID: resourceObject.shortResourceID,
                    shortParentID: resourceObject.shortParentID,
                    subscribedResourceList: JSON.stringify(resourceObject.subscribedResourceList),
                });

                return lookup.save();
            },
            deleteLookupByResourceID(resourceID: string) {
                return this.deleteMany({ resourceID: resourceID });
            },
            deleteExpiredLookup(expirationTime: string) {
                return this.deleteMany({
                    expirationTime: { $lt: new Date(expirationTime) },
                    resourceType: { $nin: [2, 3, 5] },
                });
            },
            deleteRequest() {
                return this.deleteMany({ resourceType: '17' });
            },
        },
    },
);

lookupSchema.index({ resourceType: 1 }, { name: 'idx_lookup_resourceType' });
lookupSchema.index(
    { parentID: 1, creationTime: 1, stateTag: 1 },
    { name: 'idx_lookup_parentID_creationTime_stateTag' },
);

export = mongoose.model('Lookup', lookupSchema);
