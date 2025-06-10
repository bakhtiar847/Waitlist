function updateMenu(role) {
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = (role === 'Admin') ? '' : 'none');
  document.querySelectorAll('.waiter-only').forEach(el => el.style.display = (role === 'Waiter') ? '' : 'none');
  document.querySelectorAll('.kitchen-screen-only').forEach(el => el.style.display = (role === 'Kitchen Screen' || role === 'Admin') ? '' : 'none');
}

fetch('/api/me').then(r=>r.json()).then(user => {
  document.getElementById('role').textContent = user.role;
  updateMenu(user.role);
});

document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this));
  await fetch('/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
  location.reload();
};
