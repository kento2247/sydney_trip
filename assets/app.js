const WEATHER={tokyo:{lat:35.6762,lon:139.6503,tz:'Asia/Tokyo'},sydney:{lat:-33.8688,lon:151.2093,tz:'Australia/Sydney'}};const LABELS={0:'快晴',1:'晴れ',2:'晴れ時々曇り',3:'曇り',45:'霧',48:'霧',51:'弱い霧雨',53:'霧雨',55:'強い霧雨',61:'弱い雨',63:'雨',65:'強い雨',71:'弱い雪',73:'雪',75:'強い雪',80:'にわか雨',81:'にわか雨',82:'強いにわか雨',95:'雷雨',96:'雷雨',99:'強い雷雨'};
/* 予報は6時間だけ端末に保存し、その間は通信しない（海外データ節約）。 */
const WX_TTL=6*60*60*1000;
const wxKey=(city,date)=>`syd-wx:${city}:${date}`;
function wxRead(k){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&v.at&&v.data?v:null}catch(e){return null}}
function wxWrite(k,data){try{localStorage.setItem(k,JSON.stringify({at:Date.now(),data}))}catch(e){}}
const wxStamp=t=>{const d=new Date(t);return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} `};
function wxPaint(el,d,note){el.querySelector('strong').textContent=`${LABELS[d.code]??'予報'} · ${d.lo}–${d.hi}°C`;el.querySelector('small').textContent=note||`降水 ${d.rain}% · Open-Meteo`}
async function loadWeather(el){
  const city=el.dataset.weather,date=el.dataset.date,c=WEATHER[city],key=wxKey(city,date);
  const cached=wxRead(key);
  if(cached)wxPaint(el,cached.data,`降水 ${cached.data.rain}% · ${wxStamp(cached.at)}取得`);
  if(cached&&Date.now()-cached.at<WX_TTL)return;
  if(navigator.onLine===false){if(!cached){el.querySelector('strong').textContent='予報未取得';el.querySelector('small').textContent='オンライン時に再読込'}return}
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=${encodeURIComponent(c.tz)}&start_date=${date}&end_date=${date}`;
    const r=await fetch(u);if(!r.ok)throw new Error(`weather HTTP ${r.status}`);
    const j=await r.json();if(!j.daily.time.length)throw new Error('forecast unavailable');
    const d={code:j.daily.weather_code[0],hi:Math.round(j.daily.temperature_2m_max[0]),lo:Math.round(j.daily.temperature_2m_min[0]),rain:j.daily.precipitation_probability_max[0]};
    wxWrite(key,d);wxPaint(el,d);
  }catch(e){
    if(cached)return;
    el.querySelector('strong').textContent='予報未取得';el.querySelector('small').textContent='オンライン時に再読込';
  }
}
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-weather]').forEach(el=>loadWeather(el)));
;(function(){const t=document.querySelector('[data-menu-toggle]'),d=document.getElementById('site-menu');if(!t||!d)return;const set=o=>{d.hidden=!o;t.setAttribute('aria-expanded',String(o));document.body.classList.toggle('is-menu-open',o);t.setAttribute('aria-label',o?'メニューを閉じる':'メニューを開く');if(o)d.querySelector('[data-menu-close]').focus();else t.focus()};t.addEventListener('click',()=>set(d.hidden));d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-menu-close]')||e.target.closest('a'))set(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.hidden)set(false)})})();
/* Service Worker: ページ・CSS・JS・写真・地図タイルを端末に保存して2回目以降は無通信で開く。
   写真の先読みは初回アクセス時に自動・無表示で走る。ドロワーの「キャッシュを削除」だけが唯一のUI。 */
;(function(){
  const FLAG='syd-offline-media';
  const clearBtn=document.querySelector('[data-cache-clear]');
  const label=(btn,txt)=>{if(btn)btn.querySelector('small').textContent=txt};
  const saved=()=>{try{return localStorage.getItem(FLAG)==='1'}catch(e){return false}};

  /* キャッシュ全削除 → 最新版を取り直す（表示がおかしいときの強制リセット）。 */
  if(clearBtn)clearBtn.addEventListener('click',async()=>{
    if(!confirm('保存したページ・写真・地図・天気をすべて削除して、最新版を取り直します。よろしいですか？'))return;
    label(clearBtn,'削除中…');
    try{
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.startsWith('syd-')).map(k=>caches.delete(k)));
    }catch(e){}
    try{Object.keys(localStorage).filter(k=>k.indexOf('syd-')===0).forEach(k=>localStorage.removeItem(k))}catch(e){}
    try{
      const regs=await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }catch(e){}
    location.reload();
  });

  if(!('serviceWorker'in navigator)){label(clearBtn,'この端末では利用できません');return}

  const hadController=!!navigator.serviceWorker.controller;let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;reloading=true;location.reload()});
  navigator.serviceWorker.addEventListener('message',e=>{
    if((e.data||{}).type==='prefetch-done'){try{localStorage.setItem(FLAG,'1')}catch(err){}}
  });

  /* 写真の先読み（初回のみ・進捗は出さない）。 */
  async function prefetch(){
    if(navigator.onLine===false)return;
    const t0=Date.now();
    while(!navigator.serviceWorker.controller&&Date.now()-t0<15000)await new Promise(r=>setTimeout(r,200));
    if(navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'prefetch-media'});
  }

  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
    if(!saved())setTimeout(prefetch,1500);
  });
})();
