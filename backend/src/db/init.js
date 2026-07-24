const db = require('./index');

console.log('Running database migrations and seed initialization...');
// Create a demo user if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync('Password123!', 10);
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, target_role, experience_level, industry, bio, skills_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    'Alex Candidate',
    'alex@example.com',
    passwordHash,
    'Senior Full Stack Engineer',
    'Senior (5-8 years)',
    'Software & Technology',
    'Passionate web developer building high-scalability full-stack systems.',
    JSON.stringify(['React', 'Node.js', 'TypeScript', 'SQL', 'System Design', 'Generative AI'])
  );
  console.log('Created default demo user: alex@example.com / Password123!');
}

console.log('Database initialization completed.');
