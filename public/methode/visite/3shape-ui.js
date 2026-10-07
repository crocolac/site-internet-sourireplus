'use strict';
(()=>{
  const params=new URLSearchParams(location.hash.slice(1));
  if(params.get('role')!=='practitioner'||!params.get('token'))return;
  const session=params.get('session'),token=params.get('token');
  const panel=document.createElement('section');panel.id='shape-session';panel.className='shell';
  document.getElementById('app').after(panel);
  let selected='',pending=false,stopped=false,fingerprint='',current=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels={queued:'En attente de la passerelle',claimed:'Demande en cours',uncertain:'Résultat incertain : vérifier dans Unite avant de recommencer',accepted:'Demande acceptée par Unite : vérifier le patient sur le poste choisi',done:'Terminé',error:'Échange interrompu',cancelled:'Demande clôturée'};
  const errors={authorization_required:'Reconnectez le compte 3Shape dans l’espace équipe.',permission_denied:'Vérifiez la société et les droits du compte 3Shape.',patient_or_media_not_found:'Validez le rapprochement du patient dans Unite, puis actualisez les rapports.',unite_initializing:'Unite démarre. Attendez puis relancez la demande.',unite_unavailable:'Le poste Unite est injoignable.',request_uncertain:'Vérifiez Unite avant de refaire cette ouverture.',invalid_vendor_certificate:'Le certificat 3Shape doit être vérifié.',host_not_on_local_network:'L’adresse Unite doit désigner un poste du réseau local.',invalid_pdf:'Le fichier reçu n’est pas un PDF utilisable.',pdf_size_mismatch:'Le rapport a changé. Actualisez la liste.',too_many_reports:'Trop de rapports pour cette recherche.'};
  async function api(action,data,extra=''){
    const response=await fetch('api.php?action='+action+extra,{method:data?'POST':'GET',headers:{'X-SourirePlus-Session':session,'X-SourirePlus-Token':token,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined,credentials:'omit',cache:'no-store'});
    if(!response.ok){const value=await response.json();throw new Error(value.error||'Liaison indisponible.');}return response;
  }
  function message(text){let out=panel.querySelector('[role="status"]');if(out)out.textContent=text;}
  function draw(value){
    if(!selected&&value.devices.length===1)selected=value.devices[0].id;
    panel.innerHTML='<div class="panel"><h2>Le patient dans 3Shape</h2><p>Ouvrez ce dossier dans Unite, puis choisissez son rapport DX Plus parmi les PDF disponibles.</p><div class="toolbar"><select id="shape-device" aria-label="Poste de liaison 3Shape"><option value="">Choisir la passerelle</option>'+value.devices.map(d=>'<option value="'+esc(d.id)+'"'+(d.id===selected?' selected':'')+'>'+esc(d.label)+(d.last_seen&&Date.now()/1000-d.last_seen<120?' · connecté':' · en attente')+'</option>').join('')+'</select><button class="button" data-shape="open">Ouvrir dans Unite</button><button class="button" data-shape="list">Actualiser les PDF 3Shape</button></div>'+(value.devices.length?'':'<p>Appairez une passerelle depuis l’espace équipe pour activer cette liaison.</p>')+'<p role="status" aria-live="polite"></p><div>'+value.jobs.slice(-6).map(j=>'<p>'+esc({open:'Ouverture du patient',list:'Recherche des rapports',download:'Récupération du PDF'}[j.kind])+' : '+esc(labels[j.status]||j.status)+(j.error?' — '+esc(errors[j.error]||'Vérifiez la liaison puis relancez la demande.'):'')+(j.kind==='download'&&j.status==='done'?' <button class="button small" data-use-pdf="'+esc(j.id)+'">Utiliser '+esc(j.name)+'</button>':'')+(j.status==='uncertain'||j.status==='queued'?' <button class="button small" data-close-job="'+esc(j.id)+'">Clore cette demande</button>':'')+'</p>').join('')+'</div><div>'+value.reports.map(r=>'<p>'+esc(r.name)+' · '+esc(r.capture_date.slice(0,10))+' <button class="button small" data-get-pdf="'+esc(r.list_job)+'" data-index="'+r.index+'" data-device="'+esc(r.device_id)+'">Récupérer ce PDF</button></p>').join('')+'</div><p class="subtle">Vérifiez l’identité et le contenu du rapport avant de le joindre au document patient. La passerelle doit fonctionner dans une session Windows ouverte.</p></div>';
  }
  async function refresh(){if(pending||stopped||document.hidden)return;pending=true;try{const value=await(await api('3shape-view')).json();current=value;const next=JSON.stringify(value);if(next!==fingerprint){fingerprint=next;draw(value)}}catch(e){if(!panel.firstChild)panel.innerHTML='<div class="panel"><p role="status"></p></div>';message(e.message);if(/terminée|expiré|invalide/.test(e.message))stopped=true}finally{pending=false}}
  panel.addEventListener('change',e=>{if(e.target.id==='shape-device')selected=e.target.value;});
  panel.addEventListener('click',async e=>{
    const button=e.target.closest('button');if(!button||button.disabled)return;button.disabled=true;
    try{
      if(button.dataset.shape){if(!selected)throw new Error('Choisissez la passerelle à utiliser.');await api('3shape-enqueue',{kind:button.dataset.shape,device_id:selected});}
      if(button.dataset.getPdf)await api('3shape-enqueue',{kind:'download',device_id:button.dataset.device,list_job:button.dataset.getPdf,index:Number(button.dataset.index)});
      if(button.dataset.closeJob){if(!confirm('Une ouverture déjà envoyée à Unite peut avoir eu lieu. Vérifiez le dossier dans Unite avant de clore cette demande. Aucun renvoi automatique ne sera effectué.'))return;await api('3shape-cancel',{job_id:button.dataset.closeJob});}
      if(button.dataset.usePdf){
        const job=current.jobs.find(j=>j.id===button.dataset.usePdf);
        const response=await api('3shape-pdf',null,'&job_id='+encodeURIComponent(job.id));
        const bytes=new Uint8Array(await response.arrayBuffer());
        window.dispatchEvent(new CustomEvent('sourireplus-3shape-pdf',{detail:{session,bytes,name:job.name}}));
        message('Rapport chargé dans la séance pour la fusion.');return;
      }
      fingerprint='';await refresh();
    }catch(error){message(error.message)}finally{button.disabled=false}
  });
  refresh();setInterval(refresh,5000);
})();
