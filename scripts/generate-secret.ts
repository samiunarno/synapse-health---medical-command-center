import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('base64');
console.log('\n================================================================');
console.log('🛡️  Your new JWT_SECRET has been generated:');
console.log('\n' + secret + '\n');
console.log('Copy the string above and add it to your .env file:');
console.log('JWT_SECRET="' + secret + '"');
console.log('================================================================\n');
