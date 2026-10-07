(()=>{
  'use strict';
  const data=window.PAULINE, t=data.form;
  const nav=document.querySelector('.desktop-nav'), toggle=document.querySelector('.nav-toggle');
  function closeNav(){nav?.classList.remove('is-open');if(toggle){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',data.openMenu);toggle.textContent='☰';}}
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?data.closeMenu:data.openMenu);toggle.textContent=open?'×':'☰';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav();});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced){
    if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
    let frame=0;const update=()=>{if(!frame)frame=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--scroll',String(Math.min(window.scrollY/Math.max(window.innerHeight,1),1.3)));frame=0;});};
    window.addEventListener('scroll',update,{passive:true});update();
  }
  // Keep the chosen service when switching the contact page language.
  document.querySelectorAll('.static-language').forEach(link=>{if(data.page==='contact')link.href+=window.location.search;});
  const form=document.querySelector('.form-wrap form'), feedback=document.querySelector('.form-feedback');
  const email=window.location.hostname==='paulinekocht.de'||window.location.hostname.endsWith('.paulinekocht.de')?'info@paulinekocht.de':'info@paulinekookt.nl';
  const validServices=data.serviceOptions.map(item=>item[0]);
  if(form){
    const service=form.elements.service,message=form.elements.message;
    const requested=new URLSearchParams(window.location.search).get('service');
    if(validServices.includes(requested))service.value=requested;
    const updatePlaceholder=()=>{message.placeholder=service.value==='weekly'?t.weeklyPlaceholder:t.wishesPlaceholder;};
    service.addEventListener('change',updatePlaceholder);updatePlaceholder();
    form.addEventListener('input',()=>{feedback.textContent='';});
    function compose(){return `${t.greeting}\n\n${t.intro}\n\n${t.name}: ${form.elements.name.value.trim()}\n${t.email}: ${form.elements.email.value.trim()}\n${t.service}: ${data.serviceOptions.find(s=>s[0]===service.value)?.[1]||''}\n\n${t.wishes}:\n${message.value.trim()}\n\n${t.signoff}\n${form.elements.name.value.trim()}`;}
    function valid(){if(!form.reportValidity())return false;if(![form.elements.name,form.elements.email,message].every(field=>field.value.trim())){feedback.textContent=data.lang==='nl'?'Vul je naam, e-mailadres en een kort bericht in.':'Please enter your name, email and a short message.';return false;}return true;}
    form.addEventListener('submit',event=>{event.preventDefault();if(!valid())return;const text=encodeURIComponent(compose());if(event.submitter?.value==='whatsapp')window.open(`https://wa.me/31625547094?text=${text}`,'_blank','noopener,noreferrer');else window.location.href=`mailto:${email}?subject=${encodeURIComponent(t.subject)}&body=${text}`;feedback.textContent=t.draftNotice;});
    document.querySelector('[data-copy]')?.addEventListener('click',async()=>{if(!valid())return;try{await navigator.clipboard.writeText(compose());feedback.textContent=`${t.copied} ${email}`;}catch{feedback.textContent=`${t.copyFailed} ${email}`;}});
  }
  const dialog=document.createElement('dialog');dialog.className='static-privacy';dialog.setAttribute('aria-labelledby','privacy-title');
  const title=document.createElement('h2');title.id='privacy-title';title.textContent=t.privacy;dialog.append(title);
  [data.privacy.intro,...data.privacy.paragraphs].forEach(text=>{const p=document.createElement('p');p.textContent=text;dialog.append(p);});
  for(const address of ['info@paulinekookt.nl','info@paulinekocht.de']){const p=document.createElement('p'),link=document.createElement('a');link.href=`mailto:${address}`;link.textContent=address;p.append(link);dialog.append(p);}
  const dismiss=document.createElement('button');dismiss.className='button button-red';dismiss.textContent=data.close;dismiss.addEventListener('click',()=>dialog.close());dialog.append(dismiss);document.body.append(dialog);
  document.querySelectorAll('[data-privacy]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
