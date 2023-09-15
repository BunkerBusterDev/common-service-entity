import mongoose from 'mongoose';

const { Schema } = mongoose;

const cseBaseSchema = new Schema(
    {
        // 개별 리소스의 고유 식별자
        resourceID: {
            type: String,
            required: true,
            unique: true,
        },
        // Common-Service-Entity의 Type를 나타냄 (IN-CSE, MN-CSE 등)
        cseType: {
            type: String,
            required: true,
        },
        // Common-Service-Entity의 고유 식별자
        cseID: {
            type: String,
            required: true,
        },
        // 특정 Common-Service-Entity 또는 Application Entity가 지원하는 리소스 유형의 목록을 나타냄
        supportedResourceType: {
            type: String,
            required: true,
        },
        // 리소스에 액세스하기 위한 엔드포인트 또는 URL 등을 나타냄
        pointOfAcess: {
            type: String,
            required: true,
        },
        // 노드 리소스에 대한 링크를 나타냄. 특정 노드 리소스를 참조하기 위해 사용
        nodeLink: {
            type: String,
            required: true,
        },
        notificationCongestionPolicy: {
            type: String,
            required: true,
        },
        // 특정 CSE가 지원하는 oneM2m 릴리즈 버전의 목록을 나타냄
        supportedReleaseVersions: {
            type: String,
        },
    },
    {
        statics: {
            insertCseBase(resourceObject) {
                const cseBase = new this({
                    resourceID: resourceObject.resourceID,
                    cseType: resourceObject.cseType,
                    cseID: resourceObject.cseID,
                    supportedResourceType: JSON.stringify(resourceObject.supportedResourceType),
                    pointOfAcess: JSON.stringify(resourceObject.pointOfAcess),
                    nodeLink: resourceObject.nodeLink,
                    notificationCongestionPolicy: resourceObject.notificationCongestionPolicy,
                    supportedReleaseVersions: JSON.stringify(resourceObject.supportedReleaseVersions),
                });

                return cseBase.save();
            },
            deleteCseBase(resourceID: string) {
                return this.deleteOne({ resourceID: resourceID });
            },
            updateCseBase(resourceID, pointOfAcess, cseID, supportedResourceType) {
                return this.updateOne(
                    { resourceID: resourceID },
                    { pointOfAcess: pointOfAcess, cseID: cseID, supportedResourceType: supportedResourceType },
                );
            },
        },
    },
);

export = mongoose.model('CseBase', cseBaseSchema);
