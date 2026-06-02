import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('📦 Connected to MongoDB\n');

  await User.deleteMany({});
  await Attendance.deleteMany({});
  await Leave.deleteMany({});
  await Payroll.deleteMany({});

  const users = [
    { employeeId:'FWC0001', firstName:'Admin',    lastName:'User',     email:'admin@fwc.co.in',    password:'admin123',  role:'admin',          department:'Management', designation:'CEO & Founder',         salary:3000000, isActive:true },
    { employeeId:'FWC0002', firstName:'Shivani',  lastName:'Chawla',   email:'shivani@fwc.co.in',  password:'hr123',     role:'hr_recruiter',   department:'HR',         designation:'HR Manager',            salary:1500000, isActive:true },
    { employeeId:'FWC0003', firstName:'Yogavati', lastName:'Manager',  email:'yogavati@fwc.co.in', password:'mgr123',    role:'senior_manager', department:'Engineering', designation:'Senior Engineering Manager', salary:2000000, isActive:true },
    { employeeId:'FWC0004', firstName:'Rahul',    lastName:'Kumar',    email:'rahul@fwc.co.in',    password:'emp123',    role:'employee',       department:'Engineering', designation:'Senior Software Engineer', salary:1200000, isActive:true },
    { employeeId:'FWC0005', firstName:'Priya',    lastName:'Sharma',   email:'priya@fwc.co.in',    password:'emp123',    role:'employee',       department:'Design',     designation:'UI/UX Lead',            salary:1100000, isActive:true },
    { employeeId:'FWC0006', firstName:'Arjun',    lastName:'Patel',    email:'arjun@fwc.co.in',    password:'emp123',    role:'employee',       department:'Marketing',  designation:'Marketing Manager',     salary:1000000, isActive:true },
    { employeeId:'FWC0007', firstName:'Kavya',    lastName:'Nair',     email:'kavya@fwc.co.in',    password:'emp123',    role:'employee',       department:'Engineering', designation:'Full Stack Developer',  salary:1000000, isActive:true },
    { employeeId:'FWC0008', firstName:'Rohan',    lastName:'Mehta',    email:'rohan@fwc.co.in',    password:'emp123',    role:'employee',       department:'Finance',    designation:'Finance Analyst',       salary:950000,  isActive:true },
  ];

  const created = await User.insertMany(users);
  console.log(`✅ Created ${created.length} users`);

  // Seed attendance for last 30 days
  const today = new Date();
  for (const user of created) {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      const rand = Math.random();
      const status = rand > 0.9 ? 'absent' : rand > 0.8 ? 'late' : rand > 0.75 ? 'wfh' : 'present';
      if (status !== 'absent') {
        const checkIn = new Date(d); checkIn.setHours(9, status==='late' ? 25+Math.floor(Math.random()*30) : Math.floor(Math.random()*15), 0);
        const checkOut = new Date(d); checkOut.setHours(18, Math.floor(Math.random()*30), 0);
        const workHours = +((checkOut - checkIn) / 3600000).toFixed(2);
        await Attendance.create({ employee: user._id, date: d, checkIn, checkOut, status, workHours }).catch(()=>{});
      } else {
        await Attendance.create({ employee: user._id, date: d, status:'absent' }).catch(()=>{});
      }
    }
  }
  console.log('✅ Attendance seeded');

  // Seed payroll
  const m = today.getMonth()+1, y = today.getFullYear();
  for (const user of created) {
    const basic = Math.round((user.salary || 1000000) / 12);
    const hra = basic*0.4, da = basic*0.1, ta = basic*0.05;
    const gross = basic+hra+da+ta;
    const pf = basic*0.12, tax = gross > 83333 ? gross*0.1 : 0;
    const net = gross - pf - tax;
    await Payroll.create({ employee: user._id, month: m, year: y, basicSalary:basic, hra, da, ta, grossSalary:gross, pf, tax, netSalary:net, status:'processed' }).catch(()=>{});
  }
  console.log('✅ Payroll seeded');

  console.log('\n🎉 Seed complete!\n');
  console.log('Login credentials:');
  console.log('┌─────────────────┬──────────────────────────┬──────────┐');
  console.log('│ Role            │ Email                    │ Password │');
  console.log('├─────────────────┼──────────────────────────┼──────────┤');
  users.forEach(u => console.log(`│ ${u.role.padEnd(15)} │ ${u.email.padEnd(24)} │ ${u.password.padEnd(8)} │`));
  console.log('└─────────────────┴──────────────────────────┴──────────┘');

  process.exit(0);
};

seed().catch(e => { console.error(e); process.exit(1); });
