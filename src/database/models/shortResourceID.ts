import mongoose from 'mongoose';

const { Schema } = mongoose;

const shortResourceIDSchema = new Schema(
    {
        // 개별 리소스의 고유 식별자
        ri: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        // 효율적 참조를 위한 짧은 ri
        sri: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        collection: 'shortResourceID',
        timestamps: true,
        index: { fields: { ri: 1, sri: 1 }, unique: true },
        statics: {
            findShortResourceIDByParentID(pi: string) {
                return this.findOne({ ri: pi }, { _id: false, sri: true });
            },
            insertShortResourceID(resourceObject) {
                const shortResourceID = new this({
                    ri: resourceObject.ri,
                    sri: resourceObject.sri,
                });

                return shortResourceID.save();
            },
            deleteShortResourceID(ri: string) {
                return this.deleteOne({ ri: ri });
            },
        },
    },
);

export = mongoose.model('shortResourceIDs', shortResourceIDSchema);
