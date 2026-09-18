async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function renderNav() {
  const user = await getCurrentUser();
  const links = document.getElementById('nav-links');
  if (!links) return;

  if (user) {
    links.innerHTML = `
      <span>Szia, ${escapeHtml(user.username)}!</span>
      <a href="/upload.html">Jatek feltoltese</a>
      <button id="logout-btn">Kijelentkezes</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    });
  } else {
    links.innerHTML = `
      <a href="/login.html">Bejelentkezes</a>
      <a href="/register.html" class="btn-primary">Regisztracio</a>
    `;
  }
  return user;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', renderNav);
