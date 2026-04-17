import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const cleanDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synapse');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        
        const allUsers = await User.find({});
        const usernameMap = new Map();
        const duplicates = [];

        for (const u of allUsers) {
            const userAny = u as any;
            if (usernameMap.has(userAny.username)) {
                console.log('Found duplicate:', userAny.username);
                duplicates.push(userAny._id);
            } else {
                usernameMap.set(userAny.username, true);
            }
        }

        if (duplicates.length > 0) {
            await User.deleteMany({ _id: { $in: duplicates } });
            console.log(`Deleted ${duplicates.length} duplicate users.`);
        } else {
            console.log("No duplicate users found.");
        }

        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDb();
