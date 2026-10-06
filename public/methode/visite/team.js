'use strict';
// Private team entry. The clinic access key is never stored in browser storage.
(()=>{
  if(new URLSearchParams(location.hash.slice(1)).get('token'))return;
  const app=document.getElementById('app');
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function api(action,data){
    const response=await fetch('api.php?action='+action,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},credentials:'same-origin',cache:'no-store',body:data?JSON.stringify(data):undefined});
    const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.error||'Action indisponible.'),{status:response.status});return result;
  }
  function error(message){const el=document.getElementById('team-error');if(el){el.hidden=false;el.textContent=message}}
  function login(){
    app.innerHTML='<section class="hero"><div><p class="eyebrow">Méthode SourirePlus</p><h1>Un sourire, deux regards.</h1><p>Ouvrez votre espace équipe pour commencer ou reprendre une séance.</p></div></section><section class="panel" style="max-width:580px"><h2>Accès de l’équipe</h2><p>Le code de la clinique est fourni dans le dossier d’installation.</p><form id="login-form" style="margin-top:20px"><label for="clinic-key">Code d’accès</label><input id="clinic-key" type="password" required autocomplete="current-password" style="display:block;width:100%;padding:14px;margin:10px 0 18px;border:1px solid #cbd6cd;border-radius:10px"><p id="team-error" role="alert" hidden></p><button class="button primary">Ouvrir l’espace équipe</button></form></section>';
    document.getElementById('login-form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await api('login',{key:document.getElementById('clinic-key').value.trim()});await dashboard()}catch(x){error(x.message);b.disabled=false}};
  }
  function field(id,label,type='text',required=true){return '<label style="display:grid;gap:6px">'+label+'<input id="'+id+'" name="'+id+'" type="'+type+'" '+(required?'required ':'')+'maxlength="128" style="padding:12px;border:1px solid #cbd6cd;border-radius:9px"></label>'}
  function showLinks(result){
    const box=document.getElementById('launch-links');box.hidden=false;
    box.innerHTML='<h2>Les deux écrans sont prêts.</h2><p>Ouvrez l’écran de présentation sur le tactile et l’écran praticien sur votre poste.</p><div class="toolbar">'+['presentation','practitioner'].map(r=>'<a class="button '+(r==='practitioner'?'primary':'gold')+'" href="'+esc(result.links[r])+'" target="_blank" rel="noopener noreferrer">'+(r==='presentation'?'Écran de présentation ↗':'Écran praticien ↗')+'</a>').join('')+'<button class="button" id="copy-presentation">Copier le lien de présentation</button></div><p class="subtle" style="margin-top:15px">Les liens donnent accès à cette séance. Transmettez le lien de présentation uniquement à l’écran prévu au cabinet.</p>';
    document.getElementById('copy-presentation').onclick=async()=>{try{await navigator.clipboard.writeText(result.links.presentation);document.getElementById('copy-presentation').textContent='Lien copié'}catch{window.prompt('Lien de présentation',result.links.presentation)}};
    box.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function dashboard(){
    const {sessions}=await api('sessions');
    app.innerHTML='<section class="hero"><div><p class="eyebrow">Espace de l’équipe</p><h1>La séance SourirePlus.</h1><p>Créez une séance ou reprenez un dossier enregistré. ZaWin pourra renseigner automatiquement l’identité depuis sa passerelle.</p></div><button class="button" id="logout">Déconnexion</button></section><p id="team-error" class="error-banner" role="alert" hidden></p><section class="panel" id="launch-links" hidden></section><section class="panel"><h2>Commencer une séance</h2><form id="patient-form"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:20px 0">'+field('patient_id','N° de dossier ZaWin')+field('first_name','Prénom')+field('last_name','Nom')+field('birth_date','Date de naissance','date',false)+'</div><button class="button primary">Préparer les deux écrans</button><p class="subtle" style="margin-top:12px">Une nouvelle séance sera créée. Pour continuer une séance existante, choisissez-la ci-dessous.</p></form></section><section class="panel"><div class="panel-head"><div><h2>Séances enregistrées</h2><p>Les 200 séances les plus récentes.</p></div><input id="session-search" type="search" placeholder="Nom ou dossier" aria-label="Rechercher une séance" style="max-width:45%;padding:12px;border:1px solid #cbd6cd;border-radius:9px"></div><div id="session-list"></div></section>';
    const renderList=q=>{document.getElementById('session-list').innerHTML=sessions.filter(s=>(s.name+' '+s.dossier).toLocaleLowerCase().includes(q.toLocaleLowerCase())).map(s=>'<article style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;border-bottom:1px solid #dde4dc"><div><strong>'+esc(s.name)+'</strong><div class="subtle">Dossier '+esc(s.dossier)+' · '+esc(new Date(s.date).toLocaleString('fr-CH'))+' · '+(s.closed?'Terminée':s.complete?'Synthèse disponible':'En cours')+'</div></div><button class="button small" data-reopen="'+esc(s.session_id)+'">Reprendre la séance</button></article>').join('')||'<p>Aucune séance à afficher.</p>'};renderList('');
    document.getElementById('session-search').oninput=e=>renderList(e.target.value);
    document.getElementById('session-list').onclick=async e=>{const b=e.target.closest('[data-reopen]');if(!b)return;if(!confirm('Reprendre cette séance ? Les anciens liens des deux écrans seront remplacés.'))return;b.disabled=true;try{showLinks(await api('reopen',{session_id:b.dataset.reopen}))}catch(x){error(x.message)}finally{b.disabled=false}};
    document.getElementById('logout').onclick=async()=>{await api('logout',{});login()};
    document.getElementById('patient-form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{const patient=Object.fromEntries(new FormData(e.target));patient.display_id=patient.patient_id;patient.practice_number='1';patient.source_pvs='ZaWin4';showLinks(await api('create',{patient,resume_today:false}))}catch(x){error(x.message)}finally{b.disabled=false}};
  }
  api('staff').then(dashboard).catch(x=>{if(x.status===401)login();else{login();error(x.message)}});
})();
