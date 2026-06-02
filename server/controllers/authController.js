import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, designation, phone, salary } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });
    const count = await User.countDocuments();
    const employeeId = `FWC${String(count + 1).padStart(4, '0')}`;
    const user = await User.create({ employeeId, firstName, lastName, email, password, role, department, designation, phone, salary: salary || 1000000 });
    const token = signToken(user._id, user.role);
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated. Contact HR.' });
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = signToken(user._id, user.role);
    res.json({ token, user: sanitize(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('managerId', 'firstName lastName email designation');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = ['firstName','lastName','phone','address','emergencyContact','bankDetails','skills','gender','dateOfBirth'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ error: 'Incorrect current password' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const sanitize = (user) => ({
  id: user._id, employeeId: user.employeeId, firstName: user.firstName,
  lastName: user.lastName, email: user.email, role: user.role,
  department: user.department, designation: user.designation,
  avatar: user.avatar, salary: user.salary,
});
