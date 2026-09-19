const sections=document.querySelectorAll(".reveal");
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.1});
sections.forEach(s=>observer.observe(s));

const glow=document.querySelector(".cursor-glow");
window.addEventListener("pointermove",e=>{if(glow){glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"}});

const menuButton=document.querySelector(".menu-button");
const mobileMenu=document.querySelector(".mobile-menu");
menuButton?.addEventListener("click",()=>{const open=mobileMenu.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));mobileMenu.setAttribute("aria-hidden",String(!open));});
mobileMenu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobileMenu.classList.remove("open");menuButton.setAttribute("aria-expanded","false");mobileMenu.setAttribute("aria-hidden","true")}));

const SUPABASE_URL="https://zrcfulryxnwffdlpudxo.supabase.co";
const SUPABASE_KEY="sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

async function loadProfile(){
  const {data,error}=await supabaseClient.from("profile").select("name,bio,email,instagram").order("id",{ascending:true}).limit(1).maybeSingle();
  if(error||!data){if(error)console.error("Could not load profile:",error);return}
  const name=data.name||"Faris",bio=data.bio||"",email=data.email||"",instagram=data.instagram||"";
  document.title=name+" — Developer & Creator";
  document.querySelector('meta[name="description"]')?.setAttribute("content",bio);
  document.querySelector(".logo").innerHTML=name.toUpperCase()+"<span>.</span>";
  document.getElementById("hero-name").textContent=name;
  document.getElementById("hero-bio").textContent=bio;
  document.getElementById("about-bio").textContent=bio;
  ["nav-instagram","hero-instagram","connect-instagram","mobile-instagram"].forEach(id=>{const el=document.getElementById(id);if(el&&instagram)el.href=instagram});
  const emailLink=document.getElementById("connect-email");if(emailLink&&email)emailLink.href="mailto:"+email;
}
loadProfile();