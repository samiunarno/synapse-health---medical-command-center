import crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');
console.log('Generated JWT Secret:');
console.log('----------------------------------------------------------------');
console.log(secret);
console.log('----------------------------------------------------------------');
console.log('Copy the value above and paste it into your .env file as JWT_SECRET.');
