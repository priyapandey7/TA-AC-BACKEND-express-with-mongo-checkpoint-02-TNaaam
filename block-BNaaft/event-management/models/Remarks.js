var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var remarksSchema = new Schema({
    text: { type: String, required: true },
    author: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    eventId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Events'
    },
  },{ timestamps: true });

var Remark = mongoose.model('Remark', remarksSchema);
module.exports = Remark;
