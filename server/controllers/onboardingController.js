import Onboarding from '../models/Onboarding.js';
import User from '../models/User.js';

const DEFAULT_TASKS = [
  { title: 'Submit identity documents', category: 'documentation', priority: 'high', description: 'PAN card, Aadhaar, passport copy' },
  { title: 'Sign employment contract', category: 'documentation', priority: 'high', description: 'Review and sign the offer letter and NDA' },
  { title: 'Submit educational certificates', category: 'documentation', priority: 'high', description: 'Degree certificates and marksheets' },
  { title: 'Bank account details submission', category: 'documentation', priority: 'high', description: 'For payroll processing' },
  { title: 'Laptop/workstation setup', category: 'it_setup', priority: 'high', description: 'IT team will configure your machine' },
  { title: 'Email and accounts creation', category: 'it_setup', priority: 'high', description: 'Company email, Slack, GitHub access' },
  { title: 'VPN and security setup', category: 'it_setup', priority: 'medium', description: 'Install VPN client and 2FA' },
  { title: 'HR induction session', category: 'orientation', priority: 'high', description: 'Company history, culture, and policies overview' },
  { title: 'Team introduction meeting', category: 'introduction', priority: 'medium', description: 'Meet your team members and manager' },
  { title: 'Complete compliance training', category: 'compliance', priority: 'high', description: 'POSH, data security, code of conduct' },
  { title: 'Product/domain training', category: 'training', priority: 'medium', description: 'Overview of company products and tech stack' },
  { title: 'Complete 30-day check-in', category: 'orientation', priority: 'low', description: 'First month review with HR' },
];

export const createOnboarding = async (req, res) => {
  try {
    const { employeeId, mentorId, startDate } = req.body;
    const existing = await Onboarding.findOne({ employee: employeeId });
    if (existing) return res.status(400).json({ error: 'Onboarding already exists for this employee' });

    const tasks = DEFAULT_TASKS.map((t, i) => ({
      ...t,
      dueDate: new Date(Date.now() + (i < 4 ? 3 : i < 8 ? 7 : 30) * 86400000),
    }));

    const onboarding = await Onboarding.create({
      employee: employeeId,
      mentor: mentorId,
      startDate: startDate || new Date(),
      tasks,
      status: 'in_progress',
    });
    await onboarding.populate('employee', 'firstName lastName email department');
    res.status(201).json(onboarding);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getOnboardings = async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    if (req.user.role === 'employee') q.employee = req.user._id;
    const onboardings = await Onboarding.find(q)
      .populate('employee', 'firstName lastName email department designation avatar')
      .populate('mentor', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(onboardings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({ employee: req.user._id })
      .populate('employee', 'firstName lastName email department designation')
      .populate('mentor', 'firstName lastName email');
    if (!onboarding) return res.status(404).json({ error: 'No onboarding found' });
    res.json(onboarding);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateTask = async (req, res) => {
  try {
    const { onboardingId, taskId } = req.params;
    const { completed } = req.body;
    const onboarding = await Onboarding.findById(onboardingId);
    if (!onboarding) return res.status(404).json({ error: 'Not found' });

    const task = onboarding.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.completed = completed;
    task.completedAt = completed ? new Date() : null;
    task.completedBy = completed ? req.user._id : null;
    await onboarding.save();
    res.json(onboarding);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addCustomTask = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) return res.status(404).json({ error: 'Not found' });
    onboarding.tasks.push(req.body);
    await onboarding.save();
    res.json(onboarding);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
