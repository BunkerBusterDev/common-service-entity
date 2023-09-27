import mongoose from 'mongoose';

const { Schema } = mongoose;

const hitSchema = new Schema(
    {
        ct: {
            type: Date,
            required: true,
            unique: true,
        },
        http: {
            type: Number,
            default: 1,
        },
        mqtt: {
            type: Number,
            default: 1,
        },
        coap: {
            type: Number,
            default: 1,
        },
        ws: {
            type: Number,
            default: 1,
        },
    },
    {
        collection: 'hit',
        statics: {
            getHitAll(until: string) {
                return this.find(
                    { ct: { $gt: new Date(until) } },
                    { _id: false, ct: true, http: true, mqtt: true, coap: true, ws: true },
                );
            },
        },
    },
);

export = mongoose.model('hit', hitSchema);
