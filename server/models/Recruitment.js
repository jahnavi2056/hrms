import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  department:   String,
  description:  String,
  requirements: [String],
  skills:       [String],
  type:         { type: String, enum: ['full_time','part_time','contract','intern'], default: 'full_time' },
  location:     String,
  salary:       { min: Number, max: Number, currency: { type: String, default: 'INR' } },
  openings:     { type: Number, default: 1 },
  status:       { type: String, enum: ['open','closed','on_hold'], default: 'open' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  closingDate:  Date,
  applicants:   { type: Number, default: 0 },
}, { timestamps: true });

const candidateSchema = new mongoose.Schema({
  job:           { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  name:          { type: String, required: true },
  email:         { type: String, required: true },
  phone:         String,
  resumeText:    String,
  resumeUrl:     String,
  linkedIn:      String,
  portfolio:     String,
  experience:    Number,
  currentCtc:    Number,
  expectedCtc:   Number,
  noticePeriod:  Number,
  aiScore:       { type: Number, min: 0, max: 100 },
  aiAnalysis:    String,
  strengths:     [String],
  weaknesses:    [String],
  recommendation:{ type: String, enum: ['hire','maybe','reject'] },
  stage:         { type: String, enum: ['applied','screening','interview','offer','hired','rejected'], default: 'applied' },
  interviewDate: Date,
  notes:         String,
  tags:          [String],
}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
export const Candidate = mongoose.model('Candidate', candidateSchema);
