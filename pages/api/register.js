import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const filePath = path.join(process.cwd(), 'data', 'users.json');
  const fileData = fs.existsSync(filePath) ? fs.readFileSync(filePath) : '[]';
  const users = JSON.parse(fileData);

  const alreadyExists = users.some(u => u.email === email);
  if (alreadyExists) return res.status(409).json({ error: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), name, email, password: hashed };
  users.push(newUser);

  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  return res.status(201).json({ success: true, message: 'User created' });
}
