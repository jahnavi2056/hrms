import mongoose from 'mongoose';

const onboardingTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['documentation', 'it_setup', 'training', 'orientation', 'compliance', 'introduction'], default: 'documentation' },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
});

const onboardingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  startDate: Date,
  completedDate: Date,
  tasks: [onboardingTaskSchema],
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  progress: { type: Number, default: 0 },
  welcomeEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

onboardingSchema.pre('save', function(next) {
  if (this.tasks.length > 0) {
    const done = this.tasks.filter(t => t.completed).length;
    this.progress = Math.round((done / this.tasks.length) * 100);
    if (this.progress === 100) this.status = 'completed';
    else if (this.progress > 0) this.status = 'in_progress';
  }
  next();
});

export default mongoose.model('Onboarding', onboardingSchema);
