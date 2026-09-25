/* Sydney 2026 Field Guide — パスワードゲート。
   <head> で同期読み込みし、認証前はページ本体を一切描画しない。
   一度通れば localStorage に記録し、次回以降は表示しない。
   キー名は "syd-" で始めない（ドロワーの「キャッシュを削除」で消えないように）。 */
;(function(){
  const HASH='d842e8323c8c13a4854578a3ba6f0f34f25f20f34ef60a87b02a1c8d83772d47';
  const KEY='sydgate';
  const root=document.documentElement;
  try{if(localStorage.getItem(KEY)===HASH)return}catch(e){}

  root.classList.add('gate-lock');
  const st=document.createElement('style');
  st.textContent=`
html.gate-lock,html.gate-lock body{overflow:hidden!important;height:100%}
html.gate-lock body>*:not(#gate){display:none!important}
#gate{--g-deep:#07181c;--g-teal:#0d2c31;--g-ink:#15383c;--g-orange:#ef6a3a;--g-sun:#ffb36b;position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px 16px calc(24px + 22vw);overflow:hidden;color:#fbf8f0;font-family:Arial,"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif;
  background:radial-gradient(120% 70% at 72% 78%,rgba(255,150,90,.55),rgba(239,106,58,.18) 38%,transparent 62%),linear-gradient(180deg,#061417 0%,#0d2c31 42%,#27505a 66%,#c9714c 86%,#f19a5f 100%);transition:opacity .6s ease,transform .6s ease}
#gate.is-out{opacity:0;transform:scale(1.03);pointer-events:none}
#gate .g-stars{position:absolute;inset:0 0 45% 0;background-image:radial-gradient(1px 1px at 12% 18%,#fff9,transparent),radial-gradient(1px 1px at 28% 8%,#fff7,transparent),radial-gradient(1.4px 1.4px at 44% 26%,#fffa,transparent),radial-gradient(1px 1px at 63% 12%,#fff8,transparent),radial-gradient(1px 1px at 81% 22%,#fff6,transparent),radial-gradient(1.4px 1.4px at 90% 6%,#fff9,transparent),radial-gradient(1px 1px at 6% 36%,#fff5,transparent),radial-gradient(1px 1px at 55% 40%,#fff4,transparent);animation:g-tw 5s ease-in-out infinite alternate}
#gate .g-cross{position:absolute;top:9%;right:9%;width:120px;height:140px;opacity:.85}
#gate .g-cross i{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px #fff8}
#gate .g-sky{position:absolute;left:0;right:0;bottom:0;width:100%;height:auto;display:block}
#gate .g-shimmer{animation:g-sh 6s ease-in-out infinite}
#gate .g-shimmer:nth-child(2n){animation-duration:8s;animation-delay:-2s}
#gate .g-card{position:relative;width:100%;max-width:400px;padding:30px 28px 26px;border-radius:24px;background:rgba(10,32,37,.46);border:1px solid rgba(255,255,255,.16);box-shadow:0 30px 80px -20px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12);-webkit-backdrop-filter:blur(18px) saturate(140%);backdrop-filter:blur(18px) saturate(140%);animation:g-in .8s cubic-bezier(.2,.8,.2,1) both}
#gate .g-brand{display:flex;align-items:center;gap:10px;font-size:11px;font-weight:900;letter-spacing:.2em}
#gate .g-brand b{display:inline-grid;place-items:center;width:38px;height:24px;background:var(--g-orange);color:#fff;border-radius:4px;letter-spacing:.08em}
#gate h1{font-family:Georgia,"Yu Mincho",serif;font-weight:500;font-size:clamp(40px,11vw,54px);line-height:1;letter-spacing:-.03em;margin:22px 0 6px}
#gate h1 em{font-style:italic;color:var(--g-sun)}
#gate .g-sub{margin:0 0 22px;font-size:13px;line-height:1.7;color:#fbf8f0cc}
#gate form{display:flex;gap:8px;padding:6px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);transition:border-color .2s,box-shadow .2s}
#gate form:focus-within{border-color:var(--g-sun);box-shadow:0 0 0 4px rgba(255,179,107,.18)}
#gate input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font-size:16px;letter-spacing:.12em;padding:10px 14px}
#gate input::placeholder{color:#fbf8f080;letter-spacing:.04em}
#gate button{flex:none;width:46px;height:46px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,var(--g-sun),var(--g-orange));color:#fff;font-size:20px;display:grid;place-items:center;transition:transform .15s}
#gate button:hover{transform:translateX(2px)}
#gate button:disabled{opacity:.6;cursor:default}
#gate .g-err{min-height:18px;margin:10px 4px 0;font-size:12px;font-weight:700;color:#ffc2a6}
#gate .g-meta{display:flex;justify-content:space-between;gap:12px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12);font-size:10px;font-weight:900;letter-spacing:.16em;color:#fbf8f099}
#gate .g-meta span:last-child{text-align:right}
#gate.is-shake .g-card{animation:g-shake .42s}
@keyframes g-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes g-shake{20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes g-tw{from{opacity:.55}to{opacity:1}}
@keyframes g-sh{0%,100%{opacity:.25;transform:translateX(0)}50%{opacity:.7;transform:translateX(14px)}}
@media(prefers-reduced-motion:reduce){#gate *,#gate{animation:none!important;transition:none!important}}
`;
  document.head.appendChild(st);

  /* 橋のハンガー（縦ケーブル）はループで生成 */
  let hangers='';
  for(let x=120;x<=580;x+=20){const t=(x-80)/540,y=232-484*t*(1-t);if(y<204)hangers+=`<line x1="${x}" y1="${y.toFixed(1)}" x2="${x}" y2="210"/>`}
  let city='';
  [[640,150,26],[668,120,22],[692,168,30],[724,100,18],[744,140,28],[1110,130,24],[1136,160,30],[1168,110,20]].forEach(([x,y,w])=>city+=`<rect x="${x}" y="${y}" width="${w}" height="${232-y}"/>`);
  let shimmer='';
  for(let i=0;i<9;i++){const y=246+i*7,x=80+((i*137)%900),w=60+((i*53)%140);shimmer+=`<rect class="g-shimmer" x="${x}" y="${y}" width="${w}" height="1.6" rx="1" fill="#ffc28a"/>`}

  const html=`
<div class="g-stars"></div>
<div class="g-cross" aria-hidden="true"><i style="left:58px;top:0"></i><i style="left:58px;top:118px"></i><i style="left:14px;top:62px"></i><i style="left:100px;top:48px"></i><i style="left:78px;top:84px;width:3px;height:3px"></i></div>
<svg class="g-sky" viewBox="20 60 1170 240" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
  <defs>
    <linearGradient id="g-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3f47"/><stop offset="1" stop-color="#061417"/></linearGradient>
  </defs>
  <g fill="#0b2429" opacity=".7">${city}</g>
  <g fill="none" stroke="#08191d" stroke-width="3">${hangers}</g>
  <path d="M80 232 Q350 -10 620 232" fill="none" stroke="#08191d" stroke-width="9"/>
  <path d="M96 232 Q350 30 604 232" fill="none" stroke="#08191d" stroke-width="4"/>
  <rect x="30" y="206" width="680" height="8" fill="#08191d"/>
  <rect x="58" y="160" width="44" height="72" fill="#08191d"/><rect x="598" y="160" width="44" height="72" fill="#08191d"/>
  <rect x="780" y="220" width="320" height="12" fill="#08191d"/>
  <g fill="#08191d">
    <path d="M800 222 Q820 150 880 118 Q866 170 872 222Z"/>
    <path d="M858 222 Q880 140 950 104 Q930 170 944 222Z"/>
    <path d="M930 222 Q958 150 1024 128 Q1004 180 1014 222Z"/>
    <path d="M1000 222 Q1024 176 1074 164 Q1060 196 1068 222Z"/>
  </g>
  <g fill="#fbf8f0" opacity=".08">
    <path d="M866 222 Q888 146 950 104 Q926 160 918 222Z"/>
    <path d="M938 222 Q964 156 1024 128 Q998 176 990 222Z"/>
  </g>
  <rect x="0" y="232" width="1200" height="68" fill="url(#g-water)"/>
  ${shimmer}
</svg>
<div class="g-card" role="dialog" aria-modal="true" aria-labelledby="g-title">
  <div class="g-brand"><b>SYD</b> FIELD GUIDE</div>
  <h1 id="g-title">G'day<em>,</em><br/>mate.</h1>
  <p class="g-sub">Sydney 2026 · Sep 25 – 30<br/>パスワードを入力してください</p>
  <form autocomplete="off">
    <input type="password" name="pw" placeholder="Password" aria-label="パスワード" autocapitalize="off" autocorrect="off" spellcheck="false" required/>
    <button type="submit" aria-label="入る">→</button>
  </form>
  <p class="g-err" role="alert"></p>
  <div class="g-meta"><span>33.8688° S<br/>151.2093° E</span><span class="g-clock">SYDNEY<br/>--:--</span></div>
</div>`;

  const clock=el=>{try{el.innerHTML='SYDNEY<br/>'+new Intl.DateTimeFormat('en-GB',{timeZone:'Australia/Sydney',hour:'2-digit',minute:'2-digit',weekday:'short'}).format(new Date()).toUpperCase()}catch(e){}};

  async function sha256(s){
    if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
    return sha256js(s);
  }
  /* crypto.subtle が無い環境（file:// の一部ブラウザ等）向けの最小実装 */
  function sha256js(s){
    const K=[],H=[];let n=2,c=0;
    const f=x=>(x-(x|0))*4294967296|0;
    while(c<64){let p=1;for(let d=2;d*d<=n;d++)if(n%d===0){p=0;break}if(p){if(c<8)H[c]=f(Math.pow(n,1/2));K[c++]=f(Math.pow(n,1/3))}n++}
    const bytes=[...unescape(encodeURIComponent(s))].map(ch=>ch.charCodeAt(0)),l=bytes.length*8;
    bytes.push(0x80);while(bytes.length%64!==56)bytes.push(0);
    for(let i=7;i>=0;i--)bytes.push(i>3?0:(l>>>(i*8))&255);
    const r=(x,k)=>x>>>k|x<<(32-k),w=[];
    for(let o=0;o<bytes.length;o+=64){
      for(let i=0;i<16;i++)w[i]=bytes[o+i*4]<<24|bytes[o+i*4+1]<<16|bytes[o+i*4+2]<<8|bytes[o+i*4+3];
      for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(r(a,7)^r(a,18)^a>>>3)+w[i-7]+(r(b,17)^r(b,19)^b>>>10)+w[i-16]|0}
      let[a,b,cc,d,e,g,h,k]=H;
      for(let i=0;i<64;i++){const t1=k+(r(e,6)^r(e,11)^r(e,25))+(e&g^~e&h)+K[i]+w[i]|0,t2=(r(a,2)^r(a,13)^r(a,22))+(a&b^a&cc^b&cc)|0;k=h;h=g;g=e;e=d+t1|0;d=cc;cc=b;b=a;a=t1+t2|0}
      [a,b,cc,d,e,g,h,k].forEach((v,i)=>H[i]=H[i]+v|0);
    }
    return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
  }

  function mount(){
    const g=document.createElement('div');g.id='gate';g.innerHTML=html;document.body.prepend(g);
    const form=g.querySelector('form'),input=g.querySelector('input'),err=g.querySelector('.g-err'),btn=g.querySelector('button'),ck=g.querySelector('.g-clock');
    clock(ck);setInterval(()=>clock(ck),30000);
    setTimeout(()=>input.focus(),300);
    form.addEventListener('submit',async e=>{
      e.preventDefault();btn.disabled=true;
      const ok=(await sha256(input.value.trim()))===HASH;
      btn.disabled=false;
      if(!ok){err.textContent='パスワードが違います';g.classList.remove('is-shake');void g.offsetWidth;g.classList.add('is-shake');input.select();return}
      try{localStorage.setItem(KEY,HASH)}catch(e){}
      root.classList.remove('gate-lock');g.classList.add('is-out');
      setTimeout(()=>{g.remove();st.remove();window.dispatchEvent(new Event('resize'))},650);
    });
  }
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
})();
