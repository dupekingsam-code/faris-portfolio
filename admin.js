const SUPABASE_URL = 'https://zrcfulryxnwffdlpudxo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc';
const ADMIN_EMAIL = 'dupekingsam@gmail.com';

const loginCard = document.getElementById('login-card');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const loginButton = loginForm.querySelector('button[type="submit"]');
const profileForm = document.getElementById('profile-form');
const saveStatus = document.getElementById('save-status');

function setStatus(el, message) {
  el.textContent = message || '';
}

function showDashboard(show) {
  loginCard.classList.toggle('hidden', show);
  dashboard.classList.toggle('hidden', !show);
}

function loadSupabaseFallback() {
  return new Promise((resolve, reject) => {
    if (window.supabase?.createClient) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
    script.onload = () => window.supabase?.createClient
      ? resolve()
      : reject(new Error('Supabase library loaded but createClient is unavailable.'));
    script.onerror = () => reject(new Error('Could not load the Supabase library. Check your internet connection or browser extensions.'));
    document.head.appendChild(script);
  });
}

async function init() {
  try {
    await loadSupabaseFallback();
  } catch (error) {
    console.error(error);
    setStatus(loginStatus, 'Admin system could not load. Please disable blocking extensions and refresh.');
    loginButton.disabled = true;
    return;
  }

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  async function loadProfile() {
    setStatus(saveStatus, 'Loading profile...');

    try {
      const { data, error } = await supabase
        .from('profile')
        .select('id,name,bio,email,instagram')
        .eq('id', 1)
        .single();

      if (error) throw error;

      document.getElementById('name').value = data.name || '';
      document.getElementById('bio').value = data.bio || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('instagram').value = data.instagram || '';
      setStatus(saveStatus, '');
    } catch (error) {
      console.error('Profile load failed:', error);
      setStatus(saveStatus, 'Profile could not be loaded: ' + (error.message || 'Unknown error'));
    }
  }

  async function showAuthenticatedDashboard(user) {
    if (!user || (user.email || '').toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      showDashboard(false);
      setStatus(loginStatus, 'This account is not authorized for this admin panel.');
      return;
    }

    showDashboard(true);
    setStatus(loginStatus, '');
    await loadProfile();
  }

  async function checkSession() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        showDashboard(false);
        return;
      }

      await showAuthenticatedDashboard(data.user);
    } catch (error) {
      console.error('Session check failed:', error);
      showDashboard(false);
      setStatus(loginStatus, 'Could not check your session. Please refresh and try again.');
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setStatus(loginStatus, 'Use the admin email configured for this portfolio.');
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Signing in...';
    setStatus(loginStatus, 'Connecting to secure login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (!data.user) throw new Error('Login succeeded but no user session was returned.');

      setStatus(loginStatus, 'Login successful. Opening admin panel...');
      await showAuthenticatedDashboard(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      setStatus(loginStatus, error.message || 'Login failed. Please check your email and password.');
      showDashboard(false);
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Sign in';
    }
  });

  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = document.getElementById('save-profile');
    button.disabled = true;
    setStatus(saveStatus, 'Saving...');

    try {
      const { error } = await supabase
        .from('profile')
        .update({
          name: document.getElementById('name').value.trim(),
          bio: document.getElementById('bio').value.trim(),
          email: document.getElementById('email').value.trim(),
          instagram: document.getElementById('instagram').value.trim()
        })
        .eq('id', 1);

      if (error) throw error;

      setStatus(saveStatus, 'Saved. Your public site will use the new values on its next load.');
    } catch (error) {
      console.error('Profile save failed:', error);
      setStatus(saveStatus, 'Save failed: ' + (error.message || 'Unknown error'));
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('logout').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    showDashboard(false);
    loginForm.reset();
    document.getElementById('login-email').value = ADMIN_EMAIL;
    setStatus(loginStatus, error ? 'Logout failed: ' + error.message : 'Logged out.');
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) showDashboard(false);
  });

  await checkSession();
}

init();
