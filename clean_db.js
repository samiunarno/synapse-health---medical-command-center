import mongoose from 'mongoose';
import User from './server/models/User.js';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/synapse';

const cleanDb = async () => {
    try {
        await mongoose.connect(URI);
        const res = await User.deleteMany({ username: { $in: ["M", "m"] } });
        console.log("Deleted M users:", res);
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDb();
