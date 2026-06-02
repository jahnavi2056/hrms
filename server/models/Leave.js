import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['sick','casual','annual','maternity','paternity','unpaid','compensatory'], required: true },
  startDate:  { type: Date, required: true },
  endDate:    { type: Date, required: true },
  days:       { type: Number, required: true },
  reason:     { type: String, required: true },
  status:     { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  comments:   String,
  documents:  [String],
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
