import Attendance from '../models/Attendance.js';

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getUserId = (req) => req.user?._id || req.user?.id;

export const checkIn = async (req, res) => {
  try {
    const employeeId = getUserId(req);
    const { start, end } = getTodayRange();

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    });

    if (existing?.checkIn) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const now = new Date();
    const isLate =
      now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

    const record = existing
      ? await Attendance.findByIdAndUpdate(
          existing._id,
          {
            checkIn: now,
            status: isLate ? 'late' : 'present',
            location: req.body?.location
          },
          { new: true }
        )
      : await Attendance.create({
          employee: employeeId,
          date: start,
          checkIn: now,
          status: isLate ? 'late' : 'present',
          location: req.body?.location
        });

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const employeeId = getUserId(req);
    const { start, end } = getTodayRange();

    const record = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    });

    if (!record?.checkIn) {
      return res.status(400).json({ error: 'No check-in found for today' });
    }

    if (record.checkOut) {
      return res.status(400).json({ error: 'Already checked out' });
    }

    const checkOut = new Date();
    const hours = +(((checkOut - record.checkIn) / 3600000).toFixed(2));
    const overtime = Math.max(0, hours - 9);
    const status = hours < 4 ? 'half_day' : record.status;

    const updated = await Attendance.findByIdAndUpdate(
      record._id,
      { checkOut, workHours: hours, overtime, status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTodayRecord = async (req, res) => {
  try {
    const employeeId = getUserId(req);
    const { start, end } = getTodayRange();

    const record = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    });

    res.json(record || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = getUserId(req);
    const { month, year } = req.query;

    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeamAttendance = async (req, res) => {
  try {
    const selectedDate = req.query.date ? new Date(req.query.date) : new Date();

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate(
      'employee',
      'firstName lastName department employeeId designation avatar'
    );

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    const results = [];

    for (const r of records) {
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);

      const rec = await Attendance.findOneAndUpdate(
        { employee: r.employeeId, date: d },
        {
          employee: r.employeeId,
          date: d,
          status: r.status,
          notes: r.notes,
          markedBy: getUserId(req)
        },
        { upsert: true, new: true }
      );

      results.push(rec);
    }

    res.json({ marked: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;

    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end }
    });

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      half_day: 0,
      wfh: 0,
      totalHours: 0,
      overtime: 0
    };

    records.forEach((r) => {
      summary[r.status] = (summary[r.status] || 0) + 1;
      summary.totalHours += r.workHours || 0;
      summary.overtime += r.overtime || 0;
    });

    summary.totalHours = +summary.totalHours.toFixed(1);
    summary.overtime = +summary.overtime.toFixed(1);

    res.json({ summary, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};