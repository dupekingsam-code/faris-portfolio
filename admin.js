const SUPABASE_URL = 'https://zrcfulryxnwffdlpudxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc';
const ADMIN_EMAIL = 'farisdomain@gmail.com';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginCard = document.getElementById('login-card');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const profileForm = document.getElementById('profile-form');
const saveStatus = document.getElementById('save-status');

function setStatus(el, message) {
  el.textContent = message;
}

function showDashboard(show) {
  loginCard.classList.toggle('hidden', show);
  dashboard.classList.toggle('hidden', !show);
}

async function loadProfile() {
  const { data, error } = await supabase
    .from('profile')
    .select('id,name,bio,email,instagram')
    .eq('id', 1)
    .single();

  if (error) {
    setStatus(saveStatus, error.message);
    return;
  }

  document.getElementById('name').value = data.name || '';
  document.getElementById('bio').value = data.bio || '';
  document.getElementById('email').value = data.email || '';
  document.getElementById('instagram').value = data.instagram || '';
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    showDashboard(false);
    return;
  }

  if (session.user.email !== ADMIN_EMAIL) {
    await supabase.auth.signOut();
    setStatus(loginStatus, 'This account is not authorized for this admin panel.');
    showDashboard(false);
    return;
  }

  showDashboard(true);
  await loadProfile();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus(loginStatus, 'Signing in...');

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (email.toLowerCase() !== ADMIN_EMAIL) {
    setStatus(loginStatus, 'Use the admin email configured for this portfolio.');
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setStatus(loginStatus, error.message);
    return;
  }

  setStatus(loginStatus, '');
  await checkSession();
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.getElementById('save-profile');
  button.disabled = true;
  setStatus(saveStatus, 'Saving...');

  const { error } = await supabase
    .from('profile')
    .update({
      name: document.getElementById('name').value.trim(),
      bio: document.getElementById('bio').value.trim(),
      email: document.getElementById('email').value.trim(),
      instagram: document.getElementById('instagram').value.trim()
    })
    .eq('id', 1);

  button.disabled = false;
  setStatus(saveStatus, error ? error.message : 'Saved. Your public site will use the new values on its next load.');
});

document.getElementById('logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  showDashboard(false);
  loginForm.reset();
  document.getElementById('login-email').value = ADMIN_EMAIL;
  setStatus(loginStatus, 'Logged out.');
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) showDashboard(false);
});

checkSession();