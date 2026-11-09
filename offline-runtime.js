(function(){
'use strict';
// Capture submit before the source's AJAX handlers: no application is sent.
document.addEventListener('submit',function(e){
 const form=e.target;if(!(form instanceof HTMLFormElement))return;
 e.preventDefault();e.stopImmediatePropagation();
 let note=form.querySelector('.offline-form-note');
 if(!note){note=document.createElement('p');note.className='offline-form-note';note.setAttribute('role','status');form.appendChild(note);}
 const required=[...form.querySelectorAll('.req-field,input[required]')].filter(x=>x.type!=='hidden'&&x.offsetParent!==null);
 const phone=form.querySelector('input[type=tel]');
 if(phone && !/^[78]?[3489][0-9]{9}$/.test(phone.value.replace(/\D/g,''))){note.textContent='Укажите корректный номер телефона: +7 и 10 цифр.';phone.focus();return;}
 const empty=required.find(x=>!x.value.trim());
 if(empty){note.textContent='Заполните обязательные поля.';empty.focus();return;}
 note.textContent='Это офлайн-копия: заявка не отправлена. Позвоните +7 (495) 777-33-54 или напишите на info@priorglass.ru.';
},true);
document.addEventListener('DOMContentLoaded',function(){
 document.querySelectorAll('.offline-map').forEach(function(box){
  const note=box.querySelector('.offline-widget-note');
  const text=document.createElement('span');text.textContent='Для интерактивной карты требуется интернет. ';
  const link=document.createElement('a');link.href='https://priorglass.ru/kontakty/';link.target='_blank';link.rel='noopener';link.textContent='Открыть карту на сайте';
  const retry=document.createElement('button');retry.type='button';retry.textContent='Повторить';
  note.replaceChildren(text,link,retry);
  let attempted=false,timer;
  function attempt(){
   if(attempted)return;attempted=true;
   const script=document.createElement('script');script.src=box.dataset.mapSrc;script.async=true;
   script.onerror=()=>{attempted=false;script.remove();note.hidden=false;};box.appendChild(script);
   timer=setTimeout(()=>{if(!box.querySelector('iframe')){note.hidden=false;attempted=false;}},10000);
  }
  const observer=new MutationObserver(()=>{
   const frame=box.querySelector('iframe');
   if(frame&&!frame.dataset.offlineObserved){
    frame.dataset.offlineObserved='true';frame.title='Карта расположения офиса Приоргласс';
    frame.addEventListener('load',()=>{
     clearTimeout(timer);
     if(box.dataset.legacyUnavailable==='true'){
      frame.style.visibility='hidden';note.hidden=false;
      text.textContent='Эта карта недоступна у источника. Контактные данные сохранены на странице. ';
     }else if(navigator.onLine){note.hidden=true;}
    });
   }
  });
  observer.observe(box,{childList:true,subtree:true});
  function retryMap(){box.querySelectorAll('iframe,script').forEach(e=>e.remove());note.hidden=false;attempted=false;attempt();}
  retry.addEventListener('click',retryMap);
  window.addEventListener('offline',()=>{note.hidden=false;box.querySelectorAll('iframe').forEach(f=>f.style.visibility='hidden');});
  window.addEventListener('online',retryMap);attempt();
 });
});
})();
