import mongoose from 'mongoose';

const { Schema } = mongoose;

const transactionSchema = new Schema(
    {
        ri: {
            type: String,
            required: true,
            unique: true,
        },
        cr: {
            type: String,
            default: null,
        },
        tid: {
            type: String,
            required: true,
        },
        tctl: {
            type: String,
            default: null,
        },
        tst: {
            type: String,
            default: null,
        },
        tltm: {
            type: String,
            default: null,
        },
        text: {
            type: String,
            default: null,
        },
        tct: {
            type: String,
            default: null,
        },
        tltp: {
            type: String,
            default: null,
        },
        trqp: {
            type: String,
            required: true,
        },
        trsp: {
            type: String,
        },
    },
    {
        collection: 'transaction',
    },
);

transactionSchema.index({ ri: 1, type: -1 }); // `ri` 필드에 인덱스 설정

export = mongoose.model('transaction', transactionSchema);
