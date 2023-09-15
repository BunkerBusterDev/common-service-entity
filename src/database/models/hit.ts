import mongoose from 'mongoose';

const { Schema } = mongoose;

const hitSchema = new Schema({
    creationTime: {
        type: String,
        required: true,
        unique: true,
    },
    http: {
        type: Number,
        default: null,
    },
    mqtt: {
        type: Number,
        default: null,
    },
    coap: {
        type: Number,
        default: null,
    },
    ws: {
        type: Number,
        default: null,
    },
});

export = mongoose.model('Hit', hitSchema);
