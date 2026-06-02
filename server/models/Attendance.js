import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true },
  checkIn:   Date,
  checkOut:  Date,
  status:    { type: String, enum: ['present','absent','late','half_day','wfh','holiday','weekend'], default: 'present' },
  workHours: { type: Number, default: 0 },
  overtime:  { type: Number, default: 0 },
  location:  String,
  notes:     String,
  markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
