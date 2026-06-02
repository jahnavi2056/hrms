import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema({
  name:        String,
  description: String,
  target:      Number,
  actual:      Number,
  score:       { type: Number, min: 0, max: 10 },
  weight:      { type: Number, default: 25 },
});

const performanceSchema = new mongoose.Schema({
  employee:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewer:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period:          { type: String, required: true },
  year:            { type: Number, required: true },
  kpis:            [kpiSchema],
  selfRating:      { type: Number, min: 1, max: 5 },
  rating:          { type: Number, min: 1, max: 5 },
  aiReview:        String,
  aiRating:        Number,
  strengths:       [String],
  improvements:    [String],
  goals:           [String],
  managerComments: String,
  status:          { type: String, enum: ['draft','submitted','reviewed','acknowledged'], default: 'draft' },
}, { timestamps: true });

export default mongoose.model('Performance', performanceSchema);
