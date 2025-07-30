// pages/api/users.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  const fileData = fs.readFileSync(filePath);
  const users = JSON.parse(fileData);

  res.status(200).json(users);
}
