import dbConnect from './lib/db';
import User from './models/User';
import mongoose from 'mongoose';

async function test() {
  await dbConnect();
  const user = await User.findOne();
  console.log("User:", user._id);
  
  const notificationId = new mongoose.Types.ObjectId().toString();
  
  const updatedUser = await User.findByIdAndUpdate(
    user._id, 
    { $addToSet: { hiddenNotifications: notificationId } }, 
    { new: true }
  );
  
  console.log("Updated hiddenNotifications:", updatedUser.hiddenNotifications);
  
  const fetchedUser = await User.findById(user._id).select('hiddenNotifications');
  console.log("Fetched hiddenNotifications:", fetchedUser.hiddenNotifications);
  
  process.exit(0);
}

test().catch(console.error);
