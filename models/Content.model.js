const { Schema, model } = require("mongoose");

const contentSchema = new Schema(
    {
        block: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: false
        },

        platform: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        user:
            { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true
    },

);

const Content = model("Content", contentSchema);

module.exports = Content;
