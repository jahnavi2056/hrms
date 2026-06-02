import('dotenv/config').then(async () => {
  const mongoose = (await import('mongoose')).default;
  const bcrypt = (await import('bcryptjs')).default;
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await db.collection('users').updateOne({ _id: u._id }, { $set: { password: hashed } });
    console.log('Fixed:', u.email);
  }
  console.log('All passwords hashed!');
  process.exit();
});
