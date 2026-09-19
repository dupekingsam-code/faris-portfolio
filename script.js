// Portfolio UI + Supabase profile data
const sections = document.querySelectorAll(".section");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

sections.forEach((section) => observer.observe(section));

// Supabase connection — the publishable key is safe for frontend use.
const SUPABASE_URL = "https://zrcfulryxnwffdlpudxo.supabase.co";
const SUPABASE_KEY = "sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProfile() {
  const { data, error } = await supabaseClient
    .from("profile")
    .select("name, bio, email, instagram")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Could not load profile:", error);
    return;
  }

  if (!data) return;

  const name = data.name || "Faris";
  const bio = data.bio || "";
  const email = data.email || "";
  const instagram = data.instagram || "";

  document.title = name + " — Student & AI Enthusiast";
  document.querySelector('meta[name="description"]')?.setAttribute("content", bio);

  document.querySelector(".logo").innerHTML = name.toUpperCase() + "<span>.</span>";
  document.getElementById("hero-name").textContent = name + ".";
  document.getElementById("hero-bio").textContent = bio;
  document.getElementById("about-bio").textContent = bio;

  ["nav-instagram", "hero-instagram", "connect-instagram"].forEach((id) => {
    const link = document.getElementById(id);
    if (link && instagram) link.href = instagram;
  });

  const emailLink = document.getElementById("connect-email");
  if (emailLink && email) {
    emailLink.href = "mailto:" + email;
  }
}

loadProfile();
