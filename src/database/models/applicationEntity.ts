import mongoose from 'mongoose';

const { Schema } = mongoose;

const applicationEntitySchema = new Schema(
    {
        // 개별 리소스의 고유 식별자
        ri: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        // Application Entity의 이름
        apn: {
            type: String,
            required: true,
        },
        // Application Entity의 고유 식별자
        api: {
            type: String,
            required: true,
        },
        // Application Entity의 인스턴스 식별자 Common Service Entity에서 AE를 구별하기 위한 ID
        aei: {
            type: String,
            required: true,
            unique: true,
        },
        // 리소스에 액세스하기 위한 엔드포인트 또는 URL 등을 나타냄
        poa: {
            type: String,
            required: true,
        },
        // 해당 Application Entity의 온톨로지 정보
        or: {
            type: String,
            required: true,
        },
        // 해당 Application Entity가 요청을 받을 수 있는지 여부
        rr: {
            type: String,
            required: true,
        },
        // 노드 리소스에 대한 링크를 나타냄. 특정 노드 리소스를 참조하기 위해 사용
        nl: {
            type: String,
            required: true,
        },
        // 해당 Application Entity에서 지원하는 콘텐츠 직렬화 형식들을 나타냄
        csz: {
            type: String,
            default: null,
        },
        // 특정 Common-Service-Entity 또는 Application Entity가 지원하는 리소스 유형의 목록을 나타냄
        srt: {
            type: String,
            default: null,
        },
    },
    {
        collection: 'applicationEntity',
    },
);

// Foreign Key 관계 설정 (lookup 컬렉션에 ri 필드를 참조)
applicationEntitySchema.virtual('lookup', {
    ref: 'Lookup', // 'Lookup'는 참조 대상 모델의 이름입니다. 적절히 변경해 주세요.
    localField: 'ri',
    foreignField: 'ri',
    justOne: true,
});

export = mongoose.model('applicationEntity', applicationEntitySchema);
