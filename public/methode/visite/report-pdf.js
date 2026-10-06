'use strict';
// Local PDF generation and merging. No report bytes are uploaded.
window.SourirePlusPDF=(()=>{
  const hex=(value)=>{const n=parseInt(value.replace('#',''),16);return PDFLib.rgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255)};
  const number=value=>Number(value).toFixed(1).replace('.',',');
  async function createPatient(model){
    const {PDFDocument,StandardFonts,rgb}=PDFLib;
    const doc=await PDFDocument.create(),page=doc.addPage([595.28,841.89]);
    const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
    const ink=hex('#17313d'),muted=hex('#62766f'),line=hex('#dce4dc');
    const canvas=document.createElement('canvas'),context=canvas.getContext('2d');
    function width(value,size,strong=false){try{return(strong?bold:regular).widthOfTextAtSize(value,size)}catch{context.font=(strong?'700 ':'400 ')+size+'px sans-serif';return context.measureText(value).width}}
    async function text(value,x,y,size=10,color=ink,strong=false,align='left'){
      value=String(value);const font=strong?bold:regular,w=width(value,size,strong);
      if(align==='center')x-=w/2;else if(align==='right')x-=w;
      try{font.encodeText(value);page.drawText(value,{x,y,size,font,color})}
      catch{
        // Preserve names outside the standard PDF font character set.
        const scale=3,pad=3;canvas.width=Math.ceil((w+pad*2)*scale);canvas.height=Math.ceil(size*1.7*scale);
        context.scale(scale,scale);context.font=(strong?'700 ':'400 ')+size+'px sans-serif';context.fillStyle='rgb('+Math.round(color.red*255)+','+Math.round(color.green*255)+','+Math.round(color.blue*255)+')';context.textBaseline='alphabetic';context.fillText(value,pad,size*1.2);
        const img=await doc.embedPng(canvas.toDataURL('image/png'));page.drawImage(img,{x:x-pad,y:y-size*.5,width:canvas.width/scale,height:canvas.height/scale});
      }
    }
    function wrap(value,size,maxWidth,strong=false){
      const lines=[];let current='';
      for(const ch of String(value)){if(ch==='\n'||(current&&width(current+ch,size,strong)>maxWidth)){lines.push(current.trimEnd());current=ch==='\n'?'':ch}else current+=ch}
      if(current)lines.push(current.trimEnd());return lines;
    }
    function box(x,y,w,h,background,border=background){page.drawRectangle({x,y,width:w,height:h,color:hex(background),borderColor:hex(border),borderWidth:.7})}
    if(model.logo){const logo=await(model.logo.startsWith('data:image/jpeg')?doc.embedJpg(model.logo):doc.embedPng(model.logo));const size=logo.scaleToFit(60,66);page.drawImage(logo,{x:34,y:759,width:size.width,height:size.height})}
    await text('MÉTHODE SOURIREPLUS · SYNTHÈSE PATIENT',108,801,9,hex('#315e50'),true);
    await text('Votre sourire, aujourd’hui et demain',108,778,19,ink,true);
    const identity=model.name+' · Dossier '+model.dossier;let size=10,identityLines=wrap(identity,size,453,true);
    while(identityLines.length>5&&size>6){size-=.5;identityLines=wrap(identity,size,453,true)}
    for(let i=0;i<identityLines.length;i++)await text(identityLines[i],108,756-i*(size+2),size,ink,true);
    box(34,637,527,65,'#edf3ec','#cbdcc9');
    await text('VOTRE ÂGE CIBLE',49,678,11,hex('#315e50'),true);
    await text('Préserver votre sourire dans la durée',49,656,10,muted);
    await text(String(model.age)+' ans',544,657,31,hex('#315e50'),true,'right');
    box(34,489,157,125,'#e1ede4','#cfddd2');box(200,489,157,125,'#efe3ca','#dfcda7');box(366,489,195,125,'#eef1ed','#d5dfd3');
    for(const item of [{x:112.5,label:'Votre ressenti',value:model.patientMean,color:'#33695f'},{x:278.5,label:'Le bilan clinique',value:model.clinicalMean,color:'#7f6532'}]){
      await text(item.label,item.x,587,11,hex(item.color),true,'center');await text(number(item.value),item.x,536,35,hex(item.color),true,'center');await text('sur 10',item.x,515,9,hex(item.color),false,'center');
    }
    await text('Les objectifs du parcours',463.5,594,10,ink,true,'center');
    const styles={essential:['#fde9e8','#c3262e'],needs:['#fff0db','#b95300'],strategy:['#e5f3e7','#23823b']};
    for(let i=0;i<model.goals.length;i++){
      const goal=model.goals[i],[background,color]=styles[goal.key];
      const three=model.goals.length===3,x=three&&i===1?468:377,w=three&&i<2?82:173;
      const y=model.goals.length===1?520:three?(i<2?546:503):(i===0?546:503),h=model.goals.length===1?58:38;
      box(x,y,w,h,background);await text(goal.title,x+w/2,y+h-12,8,hex(color),false,'center');await text(number(goal.mean)+' / 10',x+w/2,y+10,13,hex(color),true,'center');
    }
    await text('Vos six critères, sur un même graphique',34,466,14,ink,true);
    await text('Du ressenti aux objectifs des devis retenus · notes sur 10',34,450,9,muted);
    const x=i=>65+i*468/(model.stages.length-1),y=value=>236+value*18.7;
    for(let n=0;n<=10;n++){page.drawLine({start:{x:65,y:y(n)},end:{x:533,y:y(n)},color:line,thickness:.5});await text(n,54,y(n)-3,8,muted,false,'right')}
    for(let i=0;i<model.stages.length;i++)await text(model.stages[i][1],x(i),220,9,ink,false,'center');
    for(const series of model.series){
      const color=hex(series.color),dashArray=series.dash?series.dash.split(' ').map(Number):undefined;
      for(let i=1;i<series.values.length;i++)page.drawLine({start:{x:x(i-1),y:y(series.values[i-1])},end:{x:x(i),y:y(series.values[i])},color,thickness:1.8,...(dashArray?{dashArray}:{})});
      for(let i=0;i<series.values.length;i++)page.drawCircle({x:x(i),y:y(series.values[i]),size:2.8,color:rgb(1,1,1),borderColor:color,borderWidth:1.3});
    }
    for(let i=0;i<model.series.length;i++){
      const series=model.series[i],x=34+(i%2)*268,y=185-Math.floor(i/2)*38,color=hex(series.color);
      page.drawLine({start:{x,y:y+4},end:{x:x+25,y:y+4},color,thickness:1.8,...(series.dash?{dashArray:series.dash.split(' ').map(Number)}:{})});
      await text(series.label,x+33,y,10,color,true);await text(series.values.join(' / '),x+33,y-14,9,muted);
    }
    await text('Les valeurs de la légende suivent l’ordre des étapes du graphique.',34,66,8,muted);
    await text('Un cap choisi ensemble, à réévaluer au fil de votre suivi.',34,51,9,ink);
    await text('Clinique SourirePlus',34,27,8,muted);await text('1 / 1',561,27,8,muted,false,'right');
    doc.setTitle('Synthèse patient SourirePlus - '+model.name);doc.setAuthor('Clinique SourirePlus');doc.setSubject('Notes, évolution des six critères et âge cible');
    return doc.save({useObjectStreams:false});
  }
  async function merge(patientBytes,dxBytes){
    const target=await PDFLib.PDFDocument.load(patientBytes),source=await PDFLib.PDFDocument.load(dxBytes);
    for(const page of await target.copyPages(source,source.getPageIndices()))target.addPage(page);
    target.setSubject('Synthèse patient SourirePlus et rapport DX Plus');return target.save({useObjectStreams:false});
  }
  return {createPatient,merge};
})();
