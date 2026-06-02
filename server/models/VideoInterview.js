import mongoose from 'mongoose';

const videoInterviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  meetingLink: String,
  meetingId: String,
  interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled' },
  type: { type: String, enum: ['screening', 'technical', 'hr', 'final'], default: 'screening' },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    notes: String,
    recommendation: { type: String, enum: ['hire', 'maybe', 'reject'] },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: Date,
  },
  aiTranscriptSummary: String,
  recordingUrl: String,
  notes: String,
}, { timestamps: true });

export default mongoose.model('VideoInterview', videoInterviewSchema);
