const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  admins: path.join(DATA_DIR, 'admins.json'),
  products: path.join(DATA_DIR, 'products.json'),
  carts: path.join(DATA_DIR, 'carts.json'),
  orders: path.join(DATA_DIR, 'orders.json')
};

async function ensureFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await Promise.all(Object.values(FILES).map(async (fp) => {
      try {
        await fs.stat(fp);
      } catch {
        await fs.writeFile(fp, '[]', 'utf8');
      }
    }));
  } catch (err) {
    console.error('dataStore ensureFiles error:', err);
    throw err;
  }
}

async function readFile(key) {
  await ensureFiles();
  const fp = FILES[key];
  const raw = await fs.readFile(fp, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeFile(key, data) {
  await ensureFiles();
  const fp = FILES[key];
  await fs.writeFile(fp, JSON.stringify(data, null, 2), 'utf8');
}

// Users
async function getUsers() {
  return readFile('users');
}
async function addUser(user) {
  const users = await readFile('users');
  users.push(user);
  await writeFile('users', users);
  return user;
}
async function findUserByEmailAndPassword(email, password) {
  const users = await readFile('users');
  return users.find(u => u.email === email && u.password === password);
}
async function findUserByEmail(email) {
  const users = await readFile('users');
  return users.find(u => u.email === email);
}
async function deleteUserByEmail(email) {
  const users = await readFile('users');
  const filtered = users.filter(u => u.email !== email);
  await writeFile('users', filtered);
  return;
}

// Admins
async function getAdmins() { return readFile('admins'); }
async function findAdminByEmail(email) {
  const a = await readFile('admins');
  return a.find(x => x.email === email);
}
async function addAdmin(admin) {
  const admins = await readFile('admins');
  admins.push(admin);
  await writeFile('admins', admins);
  return admin;
}

// Products / Carts
async function getProducts() { return readFile('products'); }
async function getCarts() { return readFile('carts'); }
async function getOrders() { return readFile('orders'); }
async function addOrder(order) {
  const orders = await readFile('orders');
  orders.push(order);
  await writeFile('orders', orders);
  return order;
}
async function countDocuments(collection) {
  const data = await readFile(collection);
  return Array.isArray(data) ? data.length : 0;
}

module.exports = {
  ensureFiles,
  // users
  getUsers, addUser, findUserByEmailAndPassword, findUserByEmail, deleteUserByEmail,
  // admins
  getAdmins, findAdminByEmail, addAdmin,
  // other collections
  getProducts, getCarts, getOrders, addOrder,
  countDocuments
};
