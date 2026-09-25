/* Sydney 2026 Field Guide — リマインダー通知。
   サーバーが無いので Push は使えない。二本立てにしている:
   1) sydney-2026-reminders.ics（VALARM 付き）をカレンダーに入れる → 端末の OS が鳴らす。圏外・ブラウザ終了中でも確実。
   2) このサイトを開いている間はブラウザ通知（Service Worker の showNotification）。開き直したとき直近の見逃しも出す。
   REMINDERS を変えたら sydney-2026-reminders.ics も作り直すこと（README 参照）。 */
const REMINDERS=[
  {id:'r-haneda',day:25,row:'羽田空港 T3 集合',at:'2026-09-25T15:30+09:00',title:'羽田T3集合まで1時間',body:'16:30 集合。パスポートとETAを確認。'},
  {id:'r-trainplan',day:26,row:'Central → Blackheath',at:'2026-09-26T07:30+10:00',title:'Blue Mountains Lineの便を確定',body:'trackworkで時刻変更の可能性。Trip Plannerで往復便を確認。'},
  {id:'r-bounce-drop',day:26,row:'Bounce・荷物預け',at:'2026-09-26T08:10+10:00',title:'Bounce 荷物預け',body:'23 Rawson Place。店頭でQRとPIN 214874を提示。',url:'2026-09-26.html#bounce'},
  {id:'r-taxi-back',day:26,row:'予約Taxi → Blackheath Station',at:'2026-09-26T14:30+10:00',title:'Taxiの迎えまで30分',body:'15:00 Neates Glen。下山ペースを確認し、遅れそうなら運転手に連絡。'},
  {id:'r-bounce-pick',day:26,row:'Bounce・荷物回収',at:'2026-09-26T17:45+10:00',title:'Bounce 荷物回収',body:'23 Rawson Place。受付は24:00まで。',url:'2026-09-26.html#bounce'},
  {id:'r-chophouse',day:26,row:'宿 → Chophouse Sydney',at:'2026-09-26T19:30+10:00',title:'Chophouseへ出発（20:30予約）',body:'19:45 出発。Uberを手配。'},
  {id:'r-bills',day:27,row:'宿 → bills Darlinghurst',at:'2026-09-27T07:30+10:00',title:'bills Darlinghurstへ出発',body:'07:45 宿を出る。予約なしなので早めに。'},
  {id:'r-manly-out',day:27,row:'Manly → Circular Quay',at:'2026-09-27T15:00+10:00',title:'Manlyを出る時間',body:'15:15頃のF1に乗る。Dinner Cruiseの集合に備える。'},
  {id:'r-cruise',day:27,row:'Eastern Pontoon 到着',at:'2026-09-27T17:00+10:00',title:'Dinner Cruise チェックイン',body:'17:15 Eastern Pontoon。チケットQR 3枚を用意。',url:'2026-09-27.html#cruise'},
  {id:'r-poster',day:28,row:'Poster Presentation',at:'2026-09-28T10:30+10:00',title:'ポスター発表まで30分',body:'11:00–13:00 Area 5 · Poster 3。'},
  {id:'r-reception',day:28,row:'Welcome Reception',at:'2026-09-28T17:45+10:00',title:'Welcome Receptionまで15分',body:'18:00 開始。'},
  {id:'r-checkin',day:29,row:'帰国便 オンラインチェックイン',at:'2026-09-29T08:55+10:00',title:'帰国便のオンラインチェックイン開始',body:'出発24時間前。航空会社のアプリ／サイトで搭乗券を取得。',url:'2026-09-29.html'},
  {id:'r-blackbird',day:29,row:'The Rover → Blackbird Cafe',at:'2026-09-29T18:30+10:00',title:'Blackbird Cafeへ移動',body:'18:40 The Roverを出て19:00に到着。'},
  {id:'r-pack',day:29,row:'Blackbird Cafe',at:'2026-09-29T21:30+10:00',title:'明朝05:30出発の準備',body:'荷造り・搭乗券・パスポート。タクシー／Uberの手配を確認。'},
  {id:'r-depart',day:30,row:'宿 出発',at:'2026-09-30T05:10+10:00',title:'05:30 空港へ出発',body:'Uber／タクシーを呼ぶ。忘れ物を確認。'},
  {id:'r-vjw',day:30,row:'Sydney 発',at:'2026-09-30T08:00+10:00',title:'Visit Japan WebのQRを準備',body:'搭乗前にQRを表示できるようにしておく（機内はオフライン）。'},
];
;(function(){
  const OFF='syd-notify-off',FIRED='syd-notify-fired',ICS='sydney-2026-reminders.ics';
  const load=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const isOn=id=>!load(OFF).includes(id);
  const setOn=(id,on)=>{const s=new Set(load(OFF));on?s.delete(id):s.add(id);save(OFF,[...s])};
  const hm=r=>r.at.slice(11,16)+(r.at.endsWith('+09:00')?' JST':'');
  const md=r=>`${+r.at.slice(5,7)}/${+r.at.slice(8,10)}`;
  const supported='Notification'in window&&'serviceWorker'in navigator;
  const granted=()=>supported&&Notification.permission==='granted';
  const timers=new Map();

  async function show(r){
    const fired=new Set(load(FIRED));if(fired.has(r.id))return;fired.add(r.id);save(FIRED,[...fired]);
    const opt={body:r.body,tag:r.id,icon:'assets/icon-192.png',badge:'assets/icon-192.png',data:{url:r.url||`2026-09-${r.day}.html`}};
    try{const reg=await navigator.serviceWorker.ready;await reg.showNotification(r.title,opt)}catch(e){try{new Notification(r.title,opt)}catch(err){}}
  }
  /* 開いている間は時刻に合わせて発火。開き直したら直近20分以内の見逃しだけ出す。 */
  function schedule(){
    timers.forEach(clearTimeout);timers.clear();
    if(!granted())return;
    const now=Date.now(),fired=new Set(load(FIRED));
    REMINDERS.forEach(r=>{
      if(!isOn(r.id)||fired.has(r.id))return;
      const t=Date.parse(r.at)-now;
      if(t<=0&&t>-20*60*1000)show(r);
      else if(t>0&&t<2147483647)timers.set(r.id,setTimeout(()=>show(r),t));
    });
  }
  async function enable(){
    if(!supported)return false;
    if(Notification.permission==='default'){try{await Notification.requestPermission()}catch(e){}}
    schedule();paint();return granted();
  }

  /* 予定の行に「🔔 07:30 通知」ボタンを差し込む */
  const today=+document.body.dataset.day;
  function rowButtons(){
    document.querySelectorAll('.agenda__row').forEach(row=>{
      const h=(row.querySelector('h3')||{}).textContent||'';
      REMINDERS.filter(r=>r.day===today&&h.trim().startsWith(r.row)).forEach(r=>{
        let links=row.querySelector('.agenda__links');
        if(!links){links=document.createElement('div');links.className='agenda__links';row.querySelector('.agenda__copy').appendChild(links)}
        const b=document.createElement('button');b.type='button';b.className='inline-link notify-chip';b.dataset.notifyId=r.id;
        b.addEventListener('click',async()=>{const on=!isOn(r.id);setOn(r.id,on);if(on&&!granted())await enable();schedule();paint()});
        links.appendChild(b);
      });
    });
  }

  /* 一覧パネル（ドロワーの「通知」から開く） */
  let panel;
  function buildPanel(){
    panel=document.createElement('div');panel.className='notify';panel.hidden=true;
    const days=[...new Set(REMINDERS.map(r=>r.day))];
    panel.innerHTML=`<div class="notify__panel" role="dialog" aria-modal="true" aria-labelledby="notify-title">
<button class="notify__close" type="button" aria-label="閉じる" data-notify-close>✕</button>
<span class="notify__kicker">REMINDERS</span><h2 id="notify-title">通知</h2>
<div class="notify__actions">
<a class="notify__btn notify__btn--primary" href="${ICS}" download><b>カレンダーに一括登録</b><small>.ics · 圏外・アプリ終了中でも鳴る（おすすめ）</small></a>
<button class="notify__btn" type="button" data-notify-enable><b>ブラウザ通知</b><small data-notify-status></small></button>
</div>
<p class="notify__note">ブラウザ通知はこのサイト（ホーム画面アプリ）を開いている間と、開き直したときの直近分だけ。iPhoneはホーム画面に追加したアプリからのみ許可できる。確実に受け取るならカレンダー登録を使う。</p>
${days.map(d=>`<div class="notify__day"><span>9/${d}</span>${REMINDERS.filter(r=>r.day===d).map(r=>`<label class="notify__item"><input type="checkbox" data-notify-toggle="${r.id}"/><i></i><time>${hm(r)}</time><span>${r.title}<small>${r.body}</small></span></label>`).join('')}</div>`).join('')}
</div>`;
    document.body.appendChild(panel);
    panel.addEventListener('click',e=>{if(e.target===panel||e.target.closest('[data-notify-close]'))toggle(false)});
    panel.querySelector('[data-notify-enable]').addEventListener('click',enable);
    panel.querySelectorAll('[data-notify-toggle]').forEach(c=>c.addEventListener('change',()=>{setOn(c.dataset.notifyToggle,c.checked);schedule();paint()}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)toggle(false)});
  }
  function toggle(open){panel.hidden=!open;document.body.classList.toggle('is-menu-open',open);if(open)panel.querySelector('[data-notify-close]').focus()}

  function paint(){
    const st=panel&&panel.querySelector('[data-notify-status]');
    if(st)st.textContent=!supported?'この端末・ブラウザでは使えない':Notification.permission==='granted'?'オン · サイトを開いている間に届く':Notification.permission==='denied'?'ブロック中 · ブラウザ設定で許可が必要':'タップして許可する';
    if(panel)panel.querySelectorAll('[data-notify-toggle]').forEach(c=>c.checked=isOn(c.dataset.notifyToggle));
    document.querySelectorAll('[data-notify-id]').forEach(b=>{const r=REMINDERS.find(x=>x.id===b.dataset.notifyId),on=isOn(r.id);b.classList.toggle('is-on',on&&granted());b.classList.toggle('is-off',!on);b.textContent=`${on?'🔔':'🔕'} ${hm(r)} 通知`.replace('通知',on?'通知':'通知オフ');b.title=r.title});
  }

  function init(){
    rowButtons();buildPanel();paint();schedule();
    document.querySelectorAll('[data-notify-open]').forEach(b=>b.addEventListener('click',()=>{const c=document.querySelector('[data-menu-close]');if(c&&!document.getElementById('site-menu').hidden)c.click();toggle(true)}));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
