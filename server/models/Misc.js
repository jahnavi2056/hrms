import mongoose from 'mongoose';

const notifSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  type:      { type: String, enum: ['info','success','warning','error','leave','payroll','performance','recruitment'], default: 'info' },
  isRead:    { type: Boolean, default: false },
  link:      String,
  meta:      mongoose.Schema.Types.Mixed,
}, { timestamps: true });

notifSchema.index({ recipient: 1, isRead: 1 });

export const Notification = mongoose.model('Notification', notifSchema);

const documentSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  type:       { type: String, enum: ['contract','offer_letter','appraisal','certificate','id_proof','other'], default: 'other' },
  url:        String,
  size:       Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);
