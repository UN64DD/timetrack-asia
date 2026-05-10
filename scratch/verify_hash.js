const bcrypt = require('bcrypt');
const pass = 'nithyananthanimalan@gmail.com';
const hash = '$2b$10$y5kTcQY6d4KF8LHnQlulwOORxSFx42LBbfMwnI1GBZamo1C/kVzEy';

bcrypt.compare(pass, hash).then(res => {
  console.log('Match:', res);
});
