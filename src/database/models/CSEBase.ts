import mongoose from 'mongoose';

const { Schema } = mongoose;

const CSEBaseSchema = new Schema(
    {
        // 개별 리소스의 고유 식별자
        ri: {
            type: String,
            required: true,
            unique: true,
        },
        // Common-Service-Entity의 Type를 나타냄 (IN-CSE, MN-CSE 등)
        cst: {
            type: String,
            required: true,
        },
        // Common-Service-Entity의 고유 식별자
        csi: {
            type: String,
            required: true,
        },
        // 특정 Common-Service-Entity 또는 Application Entity가 지원하는 리소스 유형의 목록을 나타냄
        srt: {
            type: String,
            required: true,
        },
        // 리소스에 액세스하기 위한 엔드포인트 또는 URL 등을 나타냄
        poa: {
            type: String,
            required: true,
        },
        // 노드 리소스에 대한 링크를 나타냄. 특정 노드 리소스를 참조하기 위해 사용
        nl: {
            type: String,
            required: true,
        },
        ncp: {
            type: String,
            required: true,
        },
        // 특정 CSE가 지원하는 oneM2m 릴리즈 버전의 목록을 나타냄
        srv: {
            type: String,
        },
    },
    {
        collection: 'CSEBase',
        statics: {
            insertCSEBase(resourceObject) {
                const CSEBase = new this({
                    ri: resourceObject.ri,
                    cst: resourceObject.cst,
                    csi: resourceObject.csi,
                    srt: JSON.stringify(resourceObject.srt),
                    poa: JSON.stringify(resourceObject.poa),
                    nl: resourceObject.nl,
                    ncp: resourceObject.ncp,
                    srv: JSON.stringify(resourceObject.srv),
                });

                return CSEBase.save();
            },
            deleteCSEBase(ri: string) {
                return this.deleteOne({ ri: ri });
            },
            updateCSEBase(ri, poa, csi, srt) {
                return this.updateOne({ ri: ri }, { poa: poa, csi: csi, srt: srt });
            },
        },
    },
);

export = mongoose.model('CSEBase', CSEBaseSchema);
