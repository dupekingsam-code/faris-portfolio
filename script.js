const SUPABASE_URL='https://zrcfulryxnwffdlpudxo.supabase.co';
const SUPABASE_KEY='sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc';
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let profile={name:'Faris',bio:'A student exploring AI, technology, and whatever interesting thing comes next.',email:'farisdomain@gmail.com',instagram:'https://www.instagram.com/farixhere/',github:'https://github.com/dupekingsam-code',hero_image:''};let projectRows=[];

function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2800)}
function beep(freq=520,duration=.045){if(localStorage.getItem('faris-sound')!=='on')return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=window.__audio||(window.__audio=new A());const o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type='sine';g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration)}catch{}}
function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem('faris-theme',theme);$('#themeToggle').textContent=theme==='dark'?'☀':'☾'}
setTheme(localStorage.getItem('faris-theme')||'light');

async function loadAll(){
  const [{data:p},{data:skills},{data:experiments},{data:projects},{data:posts},{data:faq}]=await Promise.all([
    supabaseClient.from('profile').select('name,bio,email,instagram,github,linkedin,youtube,hero_image').eq('id',1).maybeSingle(),
    supabaseClient.from('skills').select('*').order('sort_order'),
    supabaseClient.from('experiments').select('*').order('sort_order'),
    supabaseClient.from('projects').select('*').order('sort_order'),
    supabaseClient.from('posts').select('*').eq('published',true).order('published_at',{ascending:false}).order('sort_order'),
    supabaseClient.from('faq').select('*').order('sort_order')
  ]);
  if(p) profile={...profile,...p};
  document.title=profile.name+' — Exploring. Building.';
  $('meta[name="description"]')?.setAttribute('content',profile.bio||'');
  $('#heroBio').textContent=profile.bio||'';
  $('#aboutBio').textContent=profile.bio||'';
  $('#heroImage').src=profile.hero_image||'https://images.unsplash.com/photo-1639868801168-4add16909e2b?auto=format&fit=crop&fm=jpg&q=82&w=1800';
  $('#connectEmail').href='mailto:'+profile.email;
  $('#connectInstagram').href=profile.instagram||'#';
  $('#connectGithub').href=profile.github||'#';
  renderSkills(skills||[]);renderExperiments(experiments||[]);renderProjects(projects||[]);renderPosts(posts||[]);renderFaq(faq||[]);
}
function renderSkills(rows){$('#skillsGrid').innerHTML=rows.length?rows.map((x,i)=>'<article class="skill"><div class="skill-icon">'+escapeHtml(x.icon||'✦')+'</div><strong>'+escapeHtml(x.name)+'</strong><span>'+escapeHtml(x.label||'Exploring')+'</span></article>').join(''):'<div class="loading-line">Skills are being updated.</div>'}
function renderExperiments(rows){$('#experimentsList').innerHTML=rows.length?rows.map((x,i)=>'<article class="experiment"><span class="experiment-num">'+String(i+1).padStart(2,'0')+'</span><div><h3>'+escapeHtml(x.title)+'</h3><p>'+escapeHtml(x.description||'')+'</p></div><span class="status-pill">'+escapeHtml(x.status||'EXPLORING')+'</span></article>').join(''):'<div class="loading-line">Nothing public here yet.</div>'}
function renderProjects(rows){projectRows=rows;renderProjectFilters(rows);
 if(!rows.length){$('#projectGrid').innerHTML='<div class="empty-project"><span>01</span><h3>Things are being built.</h3><p>There\'s nothing I\'m ready to show here yet. That\'s okay. The interesting part is usually what happens before the finished thing.</p><span class="tiny">CHECK BACK LATER ↗</span></div>';return}
 $('#projectGrid').innerHTML=rows.map(x=>'<article class="project" data-category="'+escapeHtml(x.category||'Web')+'"><div class="project-media">'+(x.image_url?'<img src="'+escapeHtml(x.image_url)+'" alt="'+escapeHtml(x.title)+'" loading="lazy">':'')+'</div><div class="project-body"><span class="tiny">'+escapeHtml(x.category||'PROJECT')+'</span><h3>'+escapeHtml(x.title)+'</h3><p>'+escapeHtml(x.description||'')+'</p><div class="tags">'+(x.technologies||[]).map(t=>'<span class="tag">'+escapeHtml(t)+'</span>').join('')+'</div><div class="project-links">'+(x.live_url?'<a href="'+escapeHtml(x.live_url)+'" target="_blank" rel="noopener">Live demo ↗</a>':'')+(x.github_url?'<a href="'+escapeHtml(x.github_url)+'" target="_blank" rel="noopener">GitHub ↗</a>':'')+'</div></div></article>').join('')
}
function renderProjectFilters(rows){const cats=['all',...new Set(rows.map(x=>x.category||'Other'))];const el=$('#projectFilters');if(!el)return;el.innerHTML=cats.map(c=>'<button class="filter-chip '+(c==='all'?'active':'')+'" data-filter="'+escapeHtml(c)+'">'+escapeHtml(c==='all'?'All work':c)+'</button>').join('');document.querySelectorAll('.filter-chip').forEach(b=>b.addEventListener('click',()=>{ document.querySelectorAll('.filter-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');const f=b.dataset.filter;document.querySelectorAll('.project').forEach(p=>p.style.display=(f==='all'||p.dataset.category===f)?'':'none');beep(480,.04)}))}
function openProject(id){const x=projectRows.find(p=>p.id===id);if(!x)return;$('#projectModalCategory').textContent=x.category||'PROJECT';$('#projectModalTitle').textContent=x.title;$('#projectModalDetails').textContent=x.details||x.description||'';$('#projectModalTags').innerHTML=(x.technologies||[]).map(t=>'<span class="tag">'+escapeHtml(t)+'</span>').join('');$('#projectModalLinks').innerHTML=(x.live_url?'<a class="button button-dark" href="'+escapeHtml(x.live_url)+'" target="_blank" rel="noopener">Live demo ↗</a>':'')+(x.github_url?'<a class="text-link" href="'+escapeHtml(x.github_url)+'" target="_blank" rel="noopener">GitHub ↗</a>':'');$('#projectModal').classList.add('open');$('#projectModal').setAttribute('aria-hidden','false');beep(650,.05)}
function closeProject(){$('#projectModal').classList.remove('open');$('#projectModal').setAttribute('aria-hidden','true')}
function renderPosts(rows){$('#postGrid').innerHTML=rows.length?rows.slice(0,6).map(x=>'<article class="post"><span class="post-date">'+new Date(x.published_at||x.created_at).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})+'</span><h3>'+escapeHtml(x.title)+'</h3><p>'+escapeHtml(x.excerpt||'')+'</p><a class="read" href="#" onclick="return false">Read note ↗</a></article>').join(''):'<div class="empty-post"><span>NO NOTES YET</span><p>The first one is still being written.</p></div>'}
function renderFaq(rows){$('#faqList').innerHTML=rows.length?rows.map(x=>'<article class="faq-item"><button class="faq-q" type="button"><span>'+escapeHtml(x.question)+'</span><span>+</span></button><div class="faq-a"><p>'+escapeHtml(x.answer)+'</p></div></article>').join(''):'<div class="loading-line">FAQ is coming.</div>';$$('.faq-q').forEach(b=>b.addEventListener('click',()=>{const item=b.parentElement;item.classList.toggle('open');beep(430,.04)}))}

const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(x=>observer.observe(x));
window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;$('#scrollProgress').style.width=(h>0?scrollY/h*100:0)+'%'},{passive:true});

$('#themeToggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(next);beep(next==='dark'?330:660,.06)});
$('#soundToggle').addEventListener('click',()=>{const on=localStorage.getItem('faris-sound')==='on';localStorage.setItem('faris-sound',on?'off':'on');$('#soundToggle').textContent=on?'◌':'◉';if(!on)beep(700,.07);showToast(on?'Interface sounds off.':'Interface sounds on.')});
$('#soundToggle').textContent=localStorage.getItem('faris-sound')==='on'?'◉':'◌';
$$('[data-sound]').forEach(x=>x.addEventListener('click',()=>beep(560,.04)));

$('#menuBtn').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');document.body.classList.toggle('menu-open',open);$('#menuBtn').setAttribute('aria-expanded',open);});
$$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');document.body.classList.remove('menu-open');$('#menuBtn').setAttribute('aria-expanded','false');}));

$('#backTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

$('#contactForm').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('button'),status=$('#formStatus');button.disabled=true;status.textContent='Sending…';
 const fd=new FormData(form);const {error}=await supabaseClient.from('messages').insert({name:fd.get('name'),email:fd.get('email'),message:fd.get('message')});
 if(error){status.textContent='Could not send that. Please email me directly.';console.error(error)}else{form.reset();status.textContent='Message sent. Thanks — I\'ll see it.';showToast('Message sent.');beep(760,.09)}
 button.disabled=false;
});

$('#askFaris').addEventListener('click',()=>{$('#askModal').classList.add('open');$('#askModal').setAttribute('aria-hidden','false');beep(650,.05)});
$('#closeProject').addEventListener('click',closeProject);$('#projectModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeProject()});$('#closeAsk').addEventListener('click',closeAsk);$('#askModal').addEventListener('click',e=>{if(e.target===e.currentTarget)closeAsk()});
function closeAsk(){$('#askModal').classList.remove('open');$('#askModal').setAttribute('aria-hidden','true')}
$$('.ask-suggestions button').forEach(b=>b.addEventListener('click',()=>{const q=b.dataset.question.toLowerCase();let a='';if(q.includes('interested'))a=profile.name+' is currently exploring AI, web development, technology and new ideas — learning by building.';else if(q.includes('building'))a='Right now the portfolio is the main experiment. More projects will appear here as they become ready.';else a='The easiest way is '+profile.email+'. You can also use the contact form on this page.';$('#askAnswer').textContent=a;beep(520,.04)}));

loadAll().catch(err=>{console.error(err);showToast('Some live content could not load.')});
\nlet logoClicks=0;$$('.brand').forEach(b=>b.addEventListener('click',()=>{logoClicks++;if(logoClicks===5){showToast('You found the quiet corner. ✦');beep(880,.1);logoClicks=0}}));\n