import mongoose from 'mongoose';

const { Schema } = mongoose;

const Hit = new Schema({
    ct: { type: String, required: true },
    http: { type: Number },
    mqtt: { type: Number },
    coap: { type: Number },
    ws: { type: Number },
});

module.exports = mongoose.model('Hit', Hit);
