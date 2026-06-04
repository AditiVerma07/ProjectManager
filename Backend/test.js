require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const test = async () => {
  await connectDB();
  try {
    const user = await User.create({
      name: 'John',
      email: 'john@gmail.com',
      password: '123456'
    });
    console.log('User created:', user);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
};

test();