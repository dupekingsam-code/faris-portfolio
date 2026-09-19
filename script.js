const sections = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.1 });
sections.forEach((section) => observer.observe(section));

const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
menuButton?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const SUPABASE_URL = "https://zrcfulryxnwffdlpudxo.supabase.co";
const SUPABASE_KEY = "sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProfile() {
  try {
    const { data, error } = await supabaseClient
      .from("profile")
      .select("name, bio, email, instagram")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return;

    const name = data.name || "Faris";
    const bio = data.bio || "";
    const email = data.email || "";
    const instagram = data.instagram || "";

    document.title = name + " — Developer · Designer · Creator";
    document.querySelector('meta[name="description"]')?.setAttribute("content", bio);

    const logo = document.querySelector(".logo");
    if (logo) logo.innerHTML = name.toUpperCase() + "<span>.</span>";

    const heroName = document.getElementById("hero-name");
    if (heroName) heroName.textContent = name + ".";

    const heroBio = document.getElementById("hero-bio");
    if (heroBio && bio) heroBio.textContent = bio;

    const aboutBio = document.getElementById("about-bio");
    if (aboutBio && bio) aboutBio.textContent = bio;

    ["nav-instagram", "contact-instagram"].forEach((id) => {
      const link = document.getElementById(id);
      if (link && instagram) link.href = instagram;
    });

    const emailLink = document.getElementById("contact-email");
    if (emailLink && email) emailLink.href = "mailto:" + email;
  } catch (error) {
    console.error("Profile loading failed:", error);
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
loadProfile();
