// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// ---- Roles & Permissions Matrix ----
const permissions = {
  'Join Waitlist':     { Admin: 'R+W', Waiter: 'R+W', Customer: '', Guest: 'R+W', Kitchen: '', 'Kitchen Screen': '' },
  'Login':             { Admin: 'R+W', Waiter: 'R+W', Customer: '', Guest: 'R+W', Kitchen: 'R+W', 'Kitchen Screen': 'R+W' },
  'Home':              { Admin: 'R+W', Waiter: 'R (view assigned tables)', Customer: 'R (view own table)', Guest: 'redirect', Kitchen: 'R', 'Kitchen Screen': 'R' },
  'Table List':        { Admin: 'R+W', Waiter: 'R+W', Customer: '', Guest: '', Kitchen: '', 'Kitchen Screen': '' },
  'Admin Panel':       { Admin: 'R+W', Waiter: '', Customer: '', Guest: '', Kitchen: '', 'Kitchen Screen': '' },
  'Account Settings':  { Admin: 'R+W', Waiter: 'R (self only)', Customer: 'R (self only)', Guest: '', Kitchen: 'R (self only)', 'Kitchen Screen': 'R (self only)' },
  'Order':             { Admin: 'R+W', Waiter: 'R+W (any table)', Customer: 'R (own table only)', Guest: '', Kitchen: 'R (view all)', 'Kitchen Screen': 'R (view all)' },
  'Waitlist':          { Admin: 'R+W', Waiter: 'R+W', Customer: '', Guest: '', Kitchen: '', 'Kitchen Screen': '' },
  'Kitchen Screen':    { Admin: 'R+W', Waiter: '', Customer: '', Guest: '', Kitchen: 'R (view only)', 'Kitchen Screen': 'R+W (view + mark ready)' },
  'Menu Editor/Viewer':{ Admin: 'R+W', Waiter: 'R (view only)', Customer: 'R (view only)', Guest: 'R (view only)', Kitchen: 'R (view only)', 'Kitchen Screen': 'R (view only)' }
};

// ---- Access Control Middleware ----
function checkAccess(page) {
  return function(req, res, next) {
    const userRole = req.user?.role || 'Guest';
    const access = permissions[page][userRole];
    if (!access) return res.status(403).send('Access denied.');
    if (access === 'redirect') return res.redirect('/index.html');
    next();
  };
}

// ---- Setup Express and Session ----
app.use(express.static('public'));
app.use(express.json());
app.use(session({
  secret: 'waitlist_secret',
  resave: false,
  saveUninitialized: true,
}));

// ---- Simple Auth for Demo ----
app.use((req, res, next) => {
  if (!req.session.user) req.session.user = { role: 'Guest', name: 'Guest' };
  req.user = req.session.user;
  next();
});

// ---- Page Routes ----
app.get('/index.html', checkAccess('Join Waitlist'), (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/login.html', checkAccess('Login'), (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/home.html', checkAccess('Home'), (req, res) => res.sendFile(path.join(__dirname, 'public/home.html')));
app.get('/tables.html', checkAccess('Table List'), (req, res) => res.sendFile(path.join(__dirname, 'public/tables.html')));
app.get('/admin.html', checkAccess('Admin Panel'), (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
app.get('/waitlist.html', checkAccess('Waitlist'), (req, res) => res.sendFile(path.join(__dirname, 'public/waitlist.html')));
app.get('/kitchen.html', checkAccess('Kitchen Screen'), (req, res) => res.sendFile(path.join(__dirname, 'public/kitchen.html')));
app.get('/menu.html', checkAccess('Menu Editor/Viewer'), (req, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/username/settings.html', checkAccess('Account Settings'), (req, res) => res.sendFile(path.join(__dirname, 'public/settings.html')));
app.get('/tables/:tablename/order.html', checkAccess('Order'), (req, res) => res.sendFile(path.join(__dirname, 'public/order.html')));

// ---- API for User Info ----
app.get('/api/me', (req, res) => res.json(req.user));

// ---- API for Role Change (Demo Login) ----
app.post('/api/login', (req, res) => {
  const { role, name } = req.body;
  req.session.user = { role, name };
  res.json({ ok: true, role });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
