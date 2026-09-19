const SUPABASE_URL = 'https://zrcfulryxnwffdlpudxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc';
const ADMIN_EMAIL = 'dupekingsam@gmail.com';

const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const loginButton = loginForm.querySelector('button[type="submit"]');
const loginCard = document.getElementById('login-card');
const dashboard = document.getElementById('dashboard');
const profileForm = document.getElementById('profile-form');
const saveStatus = document.getElementById('save-status');

let accessToken = localStorage.getItem('faris_admin_access_token');

function status(el, msg) { el.textContent = msg || ''; }
function showDashboard(show) {
  loginCard.classList.toggle('hidden', show);
  dashboard.classList.toggle('hidden', !show);
}
function headers(authenticated=false) {
  return {
    'apikey': SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...(authenticated && accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {})
  };
}
async function api(url, options={}) {
  const res = await fetch(SUPABASE_URL + url, {
    ...options,
    headers: { ...headers(!!accessToken), ...(options.headers || {}) }
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!res.ok) throw new Error(data.msg || data.message || data.error_description || text || ('HTTP ' + res.status));
  return data;
}
async function loadProfile() {
  status(saveStatus, 'Loading profile...');
  try {
    const rows = await api('/rest/v1/profile?id=eq.1&select=id,name,bio,email,instagram');
    if (!rows[0]) throw new Error('Profile row not found.');
    const p=rows[0];
    document.getElementById('name').value=p.name||'';
    document.getElementById('bio').value=p.bio||'';
    document.getElementById('email').value=p.email||'';
    document.getElementById('instagram').value=p.instagram||'';
    status(saveStatus,'');
  } catch(e) {
    console.error(e);
    status(saveStatus,'Profile error: '+e.message);
  }
}
async function validateSession() {
  if (!accessToken) return false;
  try {
    const user = await api('/auth/v1/user', {headers:{'Authorization':'Bearer '+accessToken}});
    if ((user.email||'').toLowerCase() !== ADMIN_EMAIL) throw new Error('Unauthorized account.');
    showDashboard(true);
    await loadProfile();
    return true;
  } catch(e) {
    localStorage.removeItem('faris_admin_access_token');
    accessToken=null;
    showDashboard(false);
    return false;
  }
}
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  status(loginStatus,'Signing in...');
  loginButton.disabled=true;
  try {
    const email=document.getElementById('login-email').value.trim();
    const password=document.getElementById('login-password').value;
    if (email.toLowerCase() !== ADMIN_EMAIL) throw new Error('Use the admin email configured for this portfolio.');
    const session=await api('/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},
      body:JSON.stringify({email,password})
    });
    if (!session.access_token) throw new Error('No access token returned.');
    accessToken=session.access_token;
    localStorage.setItem('faris_admin_access_token',accessToken);
    status(loginStatus,'Login successful.');
    await validateSession();
  } catch(e) {
    console.error(e);
    status(loginStatus,e.message||'Login failed.');
    showDashboard(false);
  } finally {
    loginButton.disabled=false;
  }
});
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button=document.getElementById('save-profile');
  button.disabled=true;
  status(saveStatus,'Saving...');
  try {
    await api('/rest/v1/profile?id=eq.1',{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({
        name:document.getElementById('name').value.trim(),
        bio:document.getElementById('bio').value.trim(),
        email:document.getElementById('email').value.trim(),
        instagram:document.getElementById('instagram').value.trim()
      })
    });
    status(saveStatus,'Saved. Reload the public site to see changes.');
  } catch(e) {
    console.error(e);
    status(saveStatus,'Save failed: '+e.message);
  } finally { button.disabled=false; }
});
document.getElementById('logout').addEventListener('click',()=>{
  accessToken=null;
  localStorage.removeItem('faris_admin_access_token');
  showDashboard(false);
  loginForm.reset();
  document.getElementById('login-email').value=ADMIN_EMAIL;
  status(loginStatus,'Logged out.');
});
showDashboard(false);
validateSession();
