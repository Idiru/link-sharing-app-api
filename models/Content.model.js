const { Schema, model } = require("mongoose");

const contentSchema = new Schema(
  {
    block: {
      type: String,
      required: true
    },

    platform: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const Content = model("Content", contentSchema);

module.exports = Content;
