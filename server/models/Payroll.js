import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month:        { type: Number, required: true, min: 1, max: 12 },
  year:         { type: Number, required: true },
  basicSalary:  { type: Number, required: true },
  hra:          { type: Number, default: 0 },
  da:           { type: Number, default: 0 },
  ta:           { type: Number, default: 0 },
  allowances:   { type: Number, default: 0 },
  bonus:        { type: Number, default: 0 },
  grossSalary:  { type: Number, default: 0 },
  pf:           { type: Number, default: 0 },
  esi:          { type: Number, default: 0 },
  tax:          { type: Number, default: 0 },
  deductions:   { type: Number, default: 0 },
  netSalary:    { type: Number, required: true },
  workingDays:  { type: Number, default: 26 },
  presentDays:  { type: Number, default: 26 },
  leaveDays:    { type: Number, default: 0 },
  status:       { type: String, enum: ['draft','processed','paid'], default: 'draft' },
  paidAt:       Date,
  payslipUrl:   String,
}, { timestamps: true });

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
