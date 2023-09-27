import mongoose from 'mongoose';

const { Schema } = mongoose;

const lookupSchema = new Schema(
    {
        // 부모 ri
        pi: {
            type: String,
            required: true,
        },
        // 개별 리소스의 고유 식별자
        ri: {
            type: String,
            required: true,
            unique: true,
        },
        // 개별 리소스의 유형을 나타냄 (2: applicationEntity, 3: container, 4: contentInstance, 5: commonServiceEntity)
        ty: {
            type: Number,
            required: true,
        },
        // 리소스가 생성된 시간
        ct: {
            type: Date,
            required: true,
        },
        // 리소스의 상태를 나타내는 태그로 수정시 마다 1씩 증가
        st: {
            type: Number,
            required: true,
        },
        // 리소스의 이름을 나타냄
        rn: {
            type: String,
            required: true,
        },
        // 리소스가 마지막으로 수정된 시간
        lt: {
            type: Date,
            required: true,
        },
        // 리소스가 만료되는 시간
        et: {
            type: Date,
            required: true,
        },
        // 리소스에 대한 접근 제어 정책의 ID 리스트
        acpi: {
            type: String,
            required: true,
        },
        // 리소스를 분류하거나 검색하기 위해 사용되는 태그 또는 라벨 리스트
        lbl: {
            type: String,
            required: true,
        },
        // 리소스가 발표될 대상을 나타냄
        at: {
            type: String,
            required: true,
        },
        // 리소스가 발표된 속성을 나타냄
        aa: {
            type: String,
            required: true,
        },
        // 효율적 참조를 위한 짧은 ri
        sri: {
            type: String,
            required: true,
        },
        // 효율적 참조를 위한 짧은 pi
        spi: {
            type: String,
            required: true,
        },
        // 이 리소스의 subscription에 대한 리스트
        subl: {
            type: String,
            required: false,
        },
    },
    {
        collection: 'lookup',
        statics: {
            findIsExistByresourceID(ri: string) {
                return this.findOne({ ri: ri }, { _id: false, ri: true });
            },
            async findByResourceIDinLookupOrShortResourceID(ri: string, sri: string) {
                const pipeline = [
                    {
                        $lookup: {
                            from: 'shortResourceID', // This should match the actual name of the sri collection in your database.
                            let: { lookup_ri: '$ri' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $or: [
                                                { $eq: ['$$lookup_ri', ri] },
                                                {
                                                    $and: [
                                                        { $eq: ['$shortResourceID', sri] },
                                                        { $eq: ['$$lookup_ri', '$ri'] },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: 'joinedDocs',
                        },
                    },
                    {
                        $match: { joinedDocs: { $ne: [] } },
                    },
                    {
                        $project: {
                            _id: 0,
                            __v: 0,
                            joinedDocs: 0, // joinedDocs 필드 제거
                        },
                    },
                ];

                const results = await this.aggregate(pipeline);
                return results;
            },
            insertLookup(resourceObject) {
                const lookup = new this({
                    pi: resourceObject.pi,
                    ri: resourceObject.ri,
                    ty: resourceObject.ty,
                    ct: new Date(resourceObject.ct),
                    st: resourceObject.st,
                    rn: resourceObject.rn,
                    lt: resourceObject.lt,
                    et: new Date(resourceObject.et),
                    acpi: JSON.stringify(resourceObject.acpi),
                    lbl: JSON.stringify(resourceObject.lbl),
                    at: JSON.stringify(resourceObject.at),
                    aa: JSON.stringify(resourceObject.aa),
                    sri: resourceObject.sri,
                    spi: resourceObject.spi,
                    subl: JSON.stringify(resourceObject.subl),
                });

                return lookup.save();
            },
            deleteLookupByResourceID(ri: string) {
                return this.deleteMany({ ri: ri });
            },
            deleteExpiredLookup(et: string) {
                return this.deleteMany({
                    et: { $lt: new Date(et) },
                    ty: { $nin: [2, 3, 5] },
                });
            },
            deleteRequest() {
                return this.deleteMany({ ty: '17' });
            },
        },
    },
);

lookupSchema.index({ ty: 1 }, { name: 'idx_lookup_ty' });
lookupSchema.index({ pi: 1, ct: 1, st: 1 }, { name: 'idx_lookup_pi_ct_st' });

export = mongoose.model('lookup', lookupSchema);
