import mongoose from 'mongoose';

const { Schema } = mongoose;

const shortResourceIDSchema = new Schema(
    {
        // 개별 리소스의 고유 식별자
        resourceID: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        // 효율적 참조를 위한 짧은 resourceID
        shortResourceID: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        collection: 'shortResourceID',
        timestamps: true,
        index: { fields: { resourceID: 1, shortResourceID: 1 }, unique: true },
        statics: {
            findShortResourceIDByParentID(parentID: string) {
                return this.findOne({ resourceID: parentID }, { _id: false, shortResourceID: true });
            },
            insertShortResourceID(resourceObject) {
                const shortResourceID = new this({
                    resourceID: resourceObject.resourceID,
                    shortResourceID: resourceObject.shortResourceID,
                });

                return shortResourceID.save();
            },
            deleteShortResourceID(resourceID: string) {
                return this.deleteOne({ resourceID: resourceID });
            },
        },
    },
);

export = mongoose.model('ShortResourceID', shortResourceIDSchema);
