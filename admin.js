const SUPABASE_URL='https://zrcfulryxnwffdlpudxo.supabase.co';
const SUPABASE_KEY='sb_publishable_4KcOsFvIRvjgI0JMMjZRqA_8uDrjodc';
const ADMIN_EMAIL='dupekingsam@gmail.com';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let profile={};let cache={skills:[],experiments:[],projects:[],posts:[],faq:[],messages:[]};

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function status(el,msg){el.textContent=msg||''}
function showDashboard(show){$('#loginCard').classList.toggle('hidden',show);$('#dashboard').classList.toggle('hidden',!show)}
async function signIn(e){e.preventDefault();const email=$('#loginEmail').value.trim().toLowerCase(),password=$('#loginPassword').value;status($('#loginStatus'),'Signing in…');if(email!==ADMIN_EMAIL){status($('#loginStatus'),'Use the configured admin email.');return}const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){status($('#loginStatus'),error.message);return}if(data.user?.email?.toLowerCase()!==ADMIN_EMAIL){await sb.auth.signOut();status($('#loginStatus'),'That account is not the portfolio admin.');return}status($('#loginStatus'),'');showDashboard(true);await boot()}
$('#loginForm').addEventListener('submit',signIn);
$('#logout').addEventListener('click',async()=>{await sb.auth.signOut();showDashboard(false);$('#loginPassword').value='';status($('#loginStatus'),'Logged out.')});

$$('.tab').forEach(b=>b.addEventListener('click',()=>{$$('.tab').forEach(x=>x.classList.remove('active'));$$('.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector('[data-panel="'+b.dataset.tab+'"]').classList.add('active')}));
$$('[data-new]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.new)));
$$('[data-cancel]').forEach(b=>b.addEventListener('click',()=>closeForm(b.dataset.cancel)));

async function boot(){await loadProfile();await Promise.all(['skills','experiments','projects','posts','faq','messages'].map(loadTable));updateStats()}
async function loadProfile(){const {data,error}=await sb.from('profile').select('*').eq('id',1).maybeSingle();if(error){console.error(error);return}profile=data||{};$('#pName').value=profile.name||'';$('#pEmail').value=profile.email||'';$('#pBio').value=profile.bio||'';$('#pInstagram').value=profile.instagram||'';$('#pGithub').value=profile.github||'';$('#pLinkedin').value=profile.linkedin||'';$('#pYoutube').value=profile.youtube||'';$('#pHero').value=profile.hero_image||''}
async function loadTable(table){const order=table==='messages'?'created_at':'sort_order';let q=sb.from(table).select('*');if(table==='posts')q=q.order('published_at',{ascending:false}).order('sort_order');else q=q.order(order,{ascending:false});const {data,error}=await q;if(error){console.error(table,error);return}cache[table]=data||[];renderTable(table);updateStats()}
function updateStats(){$('#statProjects').textContent=cache.projects.length;$('#statPosts').textContent=cache.posts.filter(x=>x.published).length;$('#statMessages').textContent=cache.messages.length;$('#statSkills').textContent=cache.skills.length}
function renderTable(table){
 const el=$('#'+table+'Admin');if(!el)return;const rows=cache[table];
 if(!rows.length){el.innerHTML='<div class="tip-card">Nothing here yet. Add the first one.</div>';return}
 el.innerHTML=rows.map(x=>{let title=x.name||x.title||x.question||x.email||'Untitled';let sub=x.label||x.description||x.excerpt||x.answer||x.message||x.status||'';return '<div class="admin-row"><div><strong>'+esc(title)+'</strong><small>'+esc(sub).slice(0,180)+'</small></div><div class="row-actions"><button data-edit="'+table+'" data-id="'+x.id+'">Edit</button><button data-delete="'+table+'" data-id="'+x.id+'">Delete</button></div></div>'}).join('');
 el.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editItem(b.dataset.edit,Number(b.dataset.id))));
 el.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteItem(b.dataset.delete,Number(b.dataset.id))));
}
async function deleteItem(table,id){if(!confirm('Delete this item?'))return;const {error}=await sb.from(table).delete().eq('id',id);if(error){alert(error.message);return}await loadTable(table)}
function openForm(table){const form=$('#'+table+'Form');if(!form)return;form.classList.remove('hidden');form.scrollIntoView({behavior:'smooth',block:'center'})}
function closeForm(table){const form=$('#'+table+'Form');form?.classList.add('hidden');form?.reset();const id=form?.querySelector('input[type=hidden]');if(id)id.value=''}
function editItem(table,id){const x=cache[table].find(r=>r.id===id);if(!x)return;openForm(table);
 if(table==='skills'){fill({skillId:x.id,skillName:x.name,skillLabel:x.label,skillIcon:x.icon,skillOrder:x.sort_order})}
 if(table==='experiments'){fill({experimentId:x.id,experimentTitle:x.title,experimentDescription:x.description,experimentStatus:x.status,experimentOrder:x.sort_order})}
 if(table==='projects'){fill({projectId:x.id,projectTitle:x.title,projectCategory:x.category,projectDescription:x.description,projectDetails:x.details,projectTech:(x.technologies||[]).join(', '),projectStatus:x.status,projectImage:x.image_url,projectLive:x.live_url,projectGithub:x.github_url,projectOrder:x.sort_order})}
 if(table==='posts'){fill({postId:x.id,postTitle:x.title,postExcerpt:x.excerpt,postContent:x.content,postCover:x.cover_url,postTags:(x.tags||[]).join(', '),postPublished:x.published})}
 if(table==='faq'){fill({faqId:x.id,faqQuestion:x.question,faqAnswer:x.answer,faqOrder:x.sort_order})}
}
function fill(map){Object.entries(map).forEach(([id,v])=>{const el=$('#'+id);if(!el)return;if(el.type==='checkbox')el.checked=!!v;else el.value=v??''})}
async function save(table,id,data,formId,statusId){const {error}=id?await sb.from(table).update(data).eq('id',id):await sb.from(table).insert(data);if(error){if(statusId)status($('#'+statusId),error.message);else alert(error.message);return false}closeForm(table);await loadTable(table);return true}

$('#profileForm').addEventListener('submit',async e=>{e.preventDefault();const {error}=await sb.from('profile').update({name:$('#pName').value.trim(),email:$('#pEmail').value.trim(),bio:$('#pBio').value.trim(),instagram:$('#pInstagram').value.trim(),github:$('#pGithub').value.trim(),linkedin:$('#pLinkedin').value.trim(),youtube:$('#pYoutube').value.trim(),hero_image:$('#pHero').value.trim()}).eq('id',1);status($('#profileStatus'),error?'Save failed: '+error.message:'Profile saved.');if(!error)profile={...profile,name:$('#pName').value.trim()}});

$('#skillsForm').addEventListener('submit',async e=>{e.preventDefault();await save('skills',Number($('#skillId').value)||null,{name:$('#skillName').value.trim(),label:$('#skillLabel').value.trim(),icon:$('#skillIcon').value.trim(),sort_order:Number($('#skillOrder').value)||0})});
$('#experimentsForm').addEventListener('submit',async e=>{e.preventDefault();await save('experiments',Number($('#experimentId').value)||null,{title:$('#experimentTitle').value.trim(),description:$('#experimentDescription').value.trim(),status:$('#experimentStatus').value.trim(),sort_order:Number($('#experimentOrder').value)||0})});
$('#projectsForm').addEventListener('submit',async e=>{e.preventDefault();await save('projects',Number($('#projectId').value)||null,{title:$('#projectTitle').value.trim(),category:$('#projectCategory').value.trim(),description:$('#projectDescription').value.trim(),details:$('#projectDetails').value.trim(),technologies:$('#projectTech').value.split(',').map(x=>x.trim()).filter(Boolean),status:$('#projectStatus').value.trim(),image_url:$('#projectImage').value.trim(),live_url:$('#projectLive').value.trim(),github_url:$('#projectGithub').value.trim(),sort_order:Number($('#projectOrder').value)||0})});
$('#postsForm').addEventListener('submit',async e=>{e.preventDefault();const published=$('#postPublished').checked;await save('posts',Number($('#postId').value)||null,{title:$('#postTitle').value.trim(),excerpt:$('#postExcerpt').value.trim(),content:$('#postContent').value,cover_url:$('#postCover').value.trim(),tags:$('#postTags').value.split(',').map(x=>x.trim()).filter(Boolean),published,published_at:published?new Date().toISOString():null,sort_order:0})});
$('#faqForm').addEventListener('submit',async e=>{e.preventDefault();await save('faq',Number($('#faqId').value)||null,{question:$('#faqQuestion').value.trim(),answer:$('#faqAnswer').value.trim(),sort_order:Number($('#faqOrder').value)||0})});
$('#refreshMessages').addEventListener('click',()=>loadTable('messages'));
async function renderMessages(){const el=$('#messagesAdmin');if(!cache.messages.length){el.innerHTML='<div class="tip-card">No messages yet.</div>';return}el.innerHTML=cache.messages.map(x=>'<article class="message '+(!x.read?'unread':'')+'"><div class="message-head"><strong>'+esc(x.name)+'</strong><small>'+new Date(x.created_at).toLocaleString()+'</small></div><div class="message-email">'+esc(x.email)+'</div><p>'+esc(x.message)+'</p><div class="message-actions"><button data-read="'+x.id+'">'+(x.read?'Mark unread':'Mark read')+'</button><button data-mail="'+esc(x.email)+'">Reply</button></div></article>').join('');el.querySelectorAll('[data-read]').forEach(b=>b.addEventListener('click',async()=>{const x=cache.messages.find(m=>m.id===Number(b.dataset.read));await sb.from('messages').update({read:!x.read}).eq('id',x.id);await loadTable('messages') }));el.querySelectorAll('[data-mail]').forEach(b=>b.addEventListener('click',()=>location.href='mailto:'+b.dataset.mail))}
const oldRender=renderTable;renderTable=function(table){oldRender(table);if(table==='messages')renderMessages()}

showDashboard(false);
sb.auth.getSession().then(async({data})=>{if(data.session?.user?.email?.toLowerCase()===ADMIN_EMAIL){showDashboard(true);await boot()}});
