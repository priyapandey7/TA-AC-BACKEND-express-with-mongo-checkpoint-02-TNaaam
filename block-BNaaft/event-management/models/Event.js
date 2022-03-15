var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventsSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  host: { type: String, required: true },
  start_date: { type: Date },
  end_date: { type: Date },
  categories: [String],
  location: { type: String, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  cover: { type: String },
  remarks: [{ type: Schema.Types.ObjectId, ref: 'Remark' }],
}, { timestamps: true });

var Event = mongoose.model("Event", eventsSchema);
module.exports = Event;