// ─── EMPLOYEE CONTROLLER ────────────────────────────────────────────────────
import User from '../models/User.js';

export const getAllEmployees = async (req, res) => {
  try {
    const { department, role, search, page = 1, limit = 50, active = 'true' } = req.query;
    const query = {};
    if (active !== 'all') query.isActive = active === 'true';
    if (department) query.department = department;
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: new RegExp(search,'i') }, { lastName: new RegExp(search,'i') },
      { email: new RegExp(search,'i') }, { employeeId: new RegExp(search,'i') },
      { designation: new RegExp(search,'i') }
    ];
    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('managerId','firstName lastName')
      .select('-__v').skip((page-1)*limit).limit(+limit).sort({ createdAt: -1 });
    res.json({ employees, total, pages: Math.ceil(total/limit), page: +page });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getEmployee = async (req, res) => {
  try {
    const emp = await User.findById(req.params.id).populate('managerId','firstName lastName email');
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createEmployee = async (req, res) => {
  try {
    if (await User.findOne({ email: req.body.email })) return res.status(400).json({ error: 'Email already exists' });
    const count = await User.countDocuments();
    const employeeId = `FWC${String(count+1).padStart(4,'0')}`;
    const emp = await User.create({ ...req.body, employeeId });
    res.status(201).json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateEmployee = async (req, res) => {
  try {
    const emp = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const toggleEmployee = async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: 'Not found' });
    emp.isActive = !emp.isActive;
    await emp.save();
    res.json({ message: `Employee ${emp.isActive ? 'activated' : 'deactivated'}`, isActive: emp.isActive });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getDepartments = async (req, res) => {
  try {
    const depts = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(depts);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getOrgChart = async (req, res) => {
  try {
    const employees = await User.find({ isActive: true }).select('firstName lastName role department designation managerId avatar employeeId');
    res.json(employees);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
