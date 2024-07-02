const { Schema, model } = require('mongoose');

const clickSchema = new Schema({
    content: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    clickTimestamp: { type: Date, default: Date.now }
});

const Click = model('Click', clickSchema);

module.exports = Click;
