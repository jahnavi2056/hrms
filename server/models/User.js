import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  employeeId:   { type: String, unique: true },
  firstName:    { type: String, required: true, trim: true },
  lastName:     { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, select: false },
  role:         { type: String, enum: ['admin','senior_manager','hr_recruiter','employee'], default: 'employee' },
  department:   { type: String, default: 'General' },
  designation:  { type: String, default: 'Staff' },
  phone:        String,
  avatar:       String,
  gender:       { type: String, enum: ['male','female','other','prefer_not_to_say'] },
  dateOfBirth:  Date,
  address:      String,
  emergencyContact: { name: String, phone: String, relation: String },
  bankDetails:  { accountNo: String, ifsc: String, bankName: String },
  salary:       { type: Number, default: 1000000 },
  joiningDate:  { type: Date, default: Date.now },
  managerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skills:       [String],
  isActive:     { type: Boolean, default: true },
  lastLogin:    Date,
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
