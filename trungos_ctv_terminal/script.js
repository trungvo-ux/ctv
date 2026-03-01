// ===================== AUDIO =====================
const AC = window.AudioContext || window.webkitAudioContext;
let ac = null;
function ctx(){ if(!ac)ac=new AC(); if(ac.state==='suspended')ac.resume(); return ac; }

function beep(f=440,d=0.1,v=0.05,type='square'){
  const c=ctx(),t=c.currentTime;
  const o=c.createOscillator(),g=c.createGain();
  o.type=type; o.frequency.value=f;
  g.gain.setValueAtTime(v,t);
  g.gain.exponentialRampToValueAtTime(0.001,t+d);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+d);
}
function clickSfx(){
  const c=ctx(),t=c.currentTime,bs=Math.floor(c.sampleRate*0.05);
  const buf=c.createBuffer(1,bs,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<bs;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/bs,2.5);
  const s=c.createBufferSource(); s.buffer=buf;
  const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=1000;
  const g=c.createGain(); g.gain.setValueAtTime(0.18,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
function staticBurst(){
  const c=ctx(),t=c.currentTime,dur=0.2,bs=Math.floor(c.sampleRate*dur);
  const buf=c.createBuffer(1,bs,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<bs;i++) d[i]=(Math.random()*2-1)*(1-i/bs);
  const s=c.createBufferSource(); s.buffer=buf;
  const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1500; f.Q.value=0.4;
  const g=c.createGain(); g.gain.setValueAtTime(0.12,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
function sfx(){ clickSfx(); }
function bootBeeps(){ [180,240,360].forEach((f,i)=>setTimeout(()=>beep(f,0.11,0.04),i*140)); }

// ===================== CURSOR =====================
document.addEventListener('mousemove',e=>{
  const c=document.getElementById('cur');
  c.style.left=(e.clientX-6)+'px'; c.style.top=(e.clientY-10)+'px';
});

// ===================== GLITCH =====================
function glitch(){
  const g1=document.getElementById('gh1'),g2=document.getElementById('gh2');
  g1.style.top=Math.random()*window.innerHeight+'px';
  g1.style.left=Math.random()*800+'px';
  g1.style.width=(60+Math.random()*250)+'px';
  g1.style.right='auto'; g1.style.opacity=1;
  g2.style.top=Math.random()*window.innerHeight+'px'; g2.style.opacity=0.4;
  setTimeout(()=>{g1.style.opacity=0;g2.style.opacity=0;},70);
}
function schedGlitch(){
  setTimeout(()=>{ glitch(); if(Math.random()>.6)setTimeout(glitch,40); schedGlitch(); },4000+Math.random()*10000);
}

// ===================== NAV =====================
let cur_screen='start';
function nav(name){
  clickSfx(); staticBurst();
  const f=document.getElementById('pxf');
  f.classList.add('go');
  glitch(); setTimeout(glitch,35); setTimeout(glitch,65);
  setTimeout(()=>f.classList.remove('go'),350);
  setTimeout(()=>show(name),140);
}
function showRaw(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active','fadein'));
  const gg=document.getElementById('gs-game');
  gg.classList.remove('active'); gg.style.display='none';
  const el=document.getElementById(id);
  if(el){ el.classList.add('active'); cur_screen=id==='bs'?'boot':id; }
}
function show(name){
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active','fadein'));
  const gg=document.getElementById('gs-game');
  gg.classList.remove('active'); gg.style.display='none';

  if(name==='game'){
    gg.style.display='flex'; gg.classList.add('active','fadein');
    setTimeout(()=>gg.classList.remove('fadein'),400);
  } else {
    let el=document.getElementById('screen-'+name);
    if(!el) el=document.getElementById(name==='start'?'ss':name==='boot'?'bs':null);
    if(el){ el.classList.add('active','fadein'); setTimeout(()=>el.classList.remove('fadein'),400); }
  }
  cur_screen=name;
}

// Typing sounds on inputs
['ei','mi'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('keydown',()=>clickSfx());
});

function doSubmit(){
  sfx();
  const e=document.getElementById('ei').value, m=document.getElementById('mi').value;
  if(e&&m){ beep(784,.08,.04); setTimeout(()=>beep(1047,.12,.04),90); }
  else { beep(200,.2,.04); glitch(); }
}

// ===================== CTV POWER-ON =====================
function playCtvSound(){
  const c=ctx(), t=c.currentTime;
  // Snap/crackle burst
  const dur=1.4, bs=Math.floor(c.sampleRate*dur);
  const buf=c.createBuffer(1,bs,c.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<bs;i++){
    const p=i/bs;
    const env=p<0.06 ? p/0.06 : Math.pow(1-p, 0.5);
    d[i]=(Math.random()*2-1)*env;
  }
  const src=c.createBufferSource(); src.buffer=buf;
  const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=300;
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=7000;
  const g=c.createGain();
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(0.28,t+0.04);
  g.gain.linearRampToValueAtTime(0.15,t+0.25);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(c.destination);
  src.start(t);
  // CRT hum warmup
  const osc=c.createOscillator(); osc.type='sawtooth';
  osc.frequency.setValueAtTime(55,t);
  osc.frequency.linearRampToValueAtTime(130,t+0.35);
  osc.frequency.linearRampToValueAtTime(75,t+dur);
  const og=c.createGain();
  og.gain.setValueAtTime(0,t);
  og.gain.linearRampToValueAtTime(0.07,t+0.04);
  og.gain.exponentialRampToValueAtTime(0.001,t+dur);
  const of=c.createBiquadFilter(); of.type='lowpass'; of.frequency.value=280;
  osc.connect(of); of.connect(og); og.connect(c.destination);
  osc.start(t); osc.stop(t+dur);
}

function ctvPowerOn(){
  return new Promise(resolve=>{
    const canvas=document.getElementById('ctv-canvas');
    const W=window.innerWidth, H=window.innerHeight;
    canvas.width=W; canvas.height=H;
    const gc=canvas.getContext('2d');
    playCtvSound();
    let frame=0;
    const FRAMES=90;

    function draw(){
      const p=frame/FRAMES;
      gc.fillStyle='#000'; gc.fillRect(0,0,W,H);

      if(p < 0.08){
        const lh=Math.max(1,(p/0.08)*3);
        gc.fillStyle='#fff';
        gc.fillRect(0, H/2-lh/2, W, lh);

      } else if(p < 0.44){
        const t2=(p-0.08)/(0.44-0.08);
        const lh=Math.floor(t2*H);
        const top=Math.floor(H/2-lh/2);
        if(lh>0){
          const img=gc.createImageData(W, lh);
          const px=img.data;
          for(let i=0;i<px.length;i+=4){
            const v=Math.random()>0.46 ? Math.floor(Math.random()*170+55) : Math.floor(Math.random()*12);
            px[i]=0; px[i+1]=v; px[i+2]=0; px[i+3]=255;
          }
          gc.putImageData(img, 0, top);
        }
        gc.fillStyle='rgba(20,252,22,0.9)';
        gc.fillRect(0, H/2-1, W, 2);

      } else if(p < 0.74){
        const img=gc.createImageData(W, H);
        const px=img.data;
        for(let i=0;i<px.length;i+=4){
          const v=Math.random()>0.4 ? Math.floor(Math.random()*215+40) : Math.floor(Math.random()*14);
          px[i]=0; px[i+1]=v; px[i+2]=0; px[i+3]=255;
        }
        gc.putImageData(img, 0, 0);
        for(let y=0;y<H;y+=3){
          gc.fillStyle='rgba(0,0,0,0.2)';
          gc.fillRect(0, y, W, 1);
        }

      } else {
        const t4=(p-0.74)/(1-0.74);
        const fa=1-t4;
        const img=gc.createImageData(W, H);
        const px=img.data;
        for(let i=0;i<px.length;i+=4){
          const v=Math.random()>0.5 ? Math.floor(Math.random()*190*fa) : 0;
          px[i]=0; px[i+1]=v; px[i+2]=0; px[i+3]=255;
        }
        gc.putImageData(img, 0, 0);
        gc.fillStyle=`rgba(0,0,0,${Math.min(1,t4*1.15)})`;
        gc.fillRect(0,0,W,H);
      }

      frame++;
      if(frame < FRAMES) requestAnimationFrame(draw);
      else { canvas.style.display='none'; resolve(); }
    }
    requestAnimationFrame(draw);
  });
}

// ===================== BOOT SEQUENCE =====================
const ASC=`████████╗██████╗ ██╗   ██╗███╗   ██╗ ██████╗      ██████╗ ███████╗
╚══██╔══╝██╔══██╗██║   ██║████╗  ██║██╔════╝     ██╔═══██╗██╔════╝
   ██║   ██████╔╝██║   ██║██╔██╗ ██║██║  ███╗    ██║   ██║███████╗
   ██║   ██╔══██╗██║   ██║██║╚██╗██║██║   ██║    ██║   ██║╚════██║
   ██║   ██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝    ╚██████╔╝███████║
   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝      ╚═════╝ ╚══════╝`;

const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function typeStr(el, text, charDelay=3, variance=3, soundEvery=4){
  for(let i=0;i<text.length;i++){
    await wait(charDelay + Math.random()*variance);
    el.textContent=text.slice(0,i+1);
    if(i%soundEvery===0) clickSfx();
  }
}

async function typeLines(container, lines, charDelay=3, variance=3){
  container.textContent='';
  for(const line of lines){
    const d=document.createElement('div');
    container.appendChild(d);
    await typeStr(d, line, charDelay, variance, 4);
    await wait(10);
  }
}

async function bootSeq(){
  // 1. CTV power-on static effect
  await ctvPowerOn();
  await wait(60);

  // 2. Type ASCII logo char by char — fast
  setTimeout(bootBeeps, 100);
  const sa=document.getElementById('sa');
  const lines=ASC.split('\n');
  for(let i=0;i<lines.length;i++){
    const prefix=lines.slice(0,i).join('\n')+(i>0?'\n':'');
    const line=lines[i];
    for(let c=1;c<=line.length;c++){
      await wait(2+Math.random()*3);
      sa.textContent=prefix+line.slice(0,c);
      if(c%5===0) clickSfx();
    }
    await wait(8);
  }
  await wait(80);

  // 3. Sysinfo — char by char
  const si1=document.getElementById('si1'); si1.style.opacity=1;
  await typeLines(si1, ['TrungOS 1.0 Release 5.1','Copyright 2026 Trung Technologies','All Rights Reserved']);
  beep(880,.04,.03); await wait(40);

  const si2=document.getElementById('si2'); si2.style.opacity=1;
  await typeLines(si2, ['BIOS version 1.2','System ID = 8232003']);
  beep(660,.04,.03); await wait(30);

  const si3=document.getElementById('si3'); si3.style.opacity=1; si3.textContent='';
  await typeStr(si3, 'Build Time: 03/01/26');
  beep(440,.06,.03); await wait(40);

  // 4. Progress bar — each label types fast
  const si4=document.getElementById('si4'); si4.style.opacity=1;
  const bar=document.getElementById('bb'), lbl=document.getElementById('bl');
  const phases=[
    [18,'Loading system files...'],
    [40,'Checking memory...'],
    [62,'Initializing display...'],
    [78,'Loading TrungOS...'],
    [93,'Starting portfolio...'],
    [100,'Ready!']
  ];
  for(const [p,m] of phases){
    await wait(60+Math.random()*40);
    bar.style.width=p+'%';
    lbl.textContent='';
    await typeStr(lbl, m, 3, 2, 3);
  }
  await wait(160);
  beep(523,.12,.05); await wait(90); beep(659,.12,.05); await wait(90); beep(784,.18,.06);
  await wait(160);

  // 5. Swap to enter section
  si4.style.opacity=0;
  const si5=document.getElementById('si5'); si5.style.opacity=1;
  const sub=document.getElementById('si5-sub');
  await typeStr(sub, 'Press ENTER to Start Portfolio', 5, 3, 3);
  await wait(100);
  document.getElementById('bs-btn').style.opacity=1;
  beep(523,.1,.05); await wait(90); beep(784,.12,.05);
}

document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&(cur_screen==='boot'||cur_screen==='start')) nav('home');
});

// ===================== GAMES =====================
let gameLoop=null;
let gameKeyHandler=()=>{};

function launchGame(name){
  sfx(); staticBurst();
  setTimeout(()=>{ show('game'); startGame(name); },140);
}
function exitGame(){ stopGame(); nav('games'); }
function stopGame(){
  if(gameLoop){clearInterval(gameLoop);gameLoop=null;}
  document.removeEventListener('keydown',gameKeyHandler);
  const c=document.getElementById('game-canvas');
  c.onclick=null; c.onmousemove=null; c.onmouseleave=null;
}
function setupCanvas(w,h){
  const c=document.getElementById('game-canvas');
  c.width=w; c.height=h;
  return c.getContext('2d');
}
function startGame(name){
  stopGame();
  if(name==='snake') initSnake();
  else if(name==='tetris') initTetris();
  else if(name==='connect4') initConnect4();
}

// ======== SNAKE ========
function initSnake(){
  document.getElementById('game-title').textContent='SNAKE';
  document.getElementById('game-info').textContent='Arrow Keys — Move  |  R — Restart';
  const CELL=24,COLS=40,ROWS=36,W=COLS*CELL,H=ROWS*CELL;
  const gc=setupCanvas(W,H);
  let snake=[{x:20,y:18},{x:19,y:18},{x:18,y:18}];
  let dir={x:1,y:0},nextDir={x:1,y:0};
  let food=randFood(),score=0,alive=true;

  function randFood(){
    let f;
    do{ f={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
    while(snake.some(s=>s.x===f.x&&s.y===f.y));
    return f;
  }
  function draw(){
    gc.fillStyle='#000'; gc.fillRect(0,0,W,H);
    gc.strokeStyle='rgba(20,252,22,0.05)'; gc.lineWidth=1;
    for(let x=0;x<=COLS;x++){gc.beginPath();gc.moveTo(x*CELL,0);gc.lineTo(x*CELL,H);gc.stroke();}
    for(let y=0;y<=ROWS;y++){gc.beginPath();gc.moveTo(0,y*CELL);gc.lineTo(W,y*CELL);gc.stroke();}
    // food
    gc.fillStyle='#14FC16'; gc.shadowColor='#14FC16'; gc.shadowBlur=6;
    gc.fillRect(food.x*CELL+3,food.y*CELL+3,CELL-6,CELL-6);
    gc.shadowBlur=0;
    // snake
    snake.forEach((s,i)=>{
      gc.fillStyle=i===0?'#14FC16':'rgba(20,252,22,0.65)';
      gc.fillRect(s.x*CELL+1,s.y*CELL+1,CELL-2,CELL-2);
    });
    document.getElementById('game-score').textContent='SCORE: '+score;
    if(!alive){
      gc.fillStyle='rgba(0,0,0,0.72)'; gc.fillRect(0,0,W,H);
      gc.fillStyle='#14FC16'; gc.font='bold 34px IBM Plex Mono'; gc.textAlign='center';
      gc.fillText('GAME OVER',W/2,H/2-18);
      gc.font='18px IBM Plex Mono';
      gc.fillText('Score: '+score+'  |  R to restart',W/2,H/2+18);
      gc.textAlign='left';
    }
  }
  function tick(){
    if(!alive) return;
    dir=nextDir;
    const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
    if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)){
      alive=false; beep(180,.5,.06,'sawtooth'); draw(); return;
    }
    snake.unshift(head);
    if(head.x===food.x&&head.y===food.y){ score++; food=randFood(); beep(880,.05,.04); }
    else snake.pop();
    draw();
  }
  gameKeyHandler=e=>{
    if(e.key==='ArrowUp'&&dir.y===0) nextDir={x:0,y:-1};
    else if(e.key==='ArrowDown'&&dir.y===0) nextDir={x:0,y:1};
    else if(e.key==='ArrowLeft'&&dir.x===0) nextDir={x:-1,y:0};
    else if(e.key==='ArrowRight'&&dir.x===0) nextDir={x:1,y:0};
    else if((e.key==='r'||e.key==='R')){ stopGame(); initSnake(); }
    e.preventDefault();
  };
  document.addEventListener('keydown',gameKeyHandler);
  draw(); gameLoop=setInterval(tick,115);
}

// ======== TETRIS ========
function initTetris(){
  document.getElementById('game-title').textContent='TETRIS';
  document.getElementById('game-info').textContent='← → Move  |  ↑ Rotate  |  ↓ Soft Drop  |  Space Hard Drop  |  R Restart';
  const CELL=28,COLS=10,ROWS=22,PW=200;
  const W=COLS*CELL+PW,H=ROWS*CELL;
  const gc=setupCanvas(W,H);

  const PIECES=[
    {s:[[1,1,1,1]],c:'#00efef'},
    {s:[[1,1],[1,1]],c:'#eded00'},
    {s:[[0,1,0],[1,1,1]],c:'#aa00ff'},
    {s:[[1,0,0],[1,1,1]],c:'#ff8800'},
    {s:[[0,0,1],[1,1,1]],c:'#0055ff'},
    {s:[[1,1,0],[0,1,1]],c:'#ff2244'},
    {s:[[0,1,1],[1,1,0]],c:'#14FC16'},
  ];

  let board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  let piece=null,score=0,lvl=1,clrd=0,alive=true;

  function newP(){
    const p=PIECES[Math.floor(Math.random()*PIECES.length)];
    return {s:p.s.map(r=>[...r]),c:p.c,x:Math.floor(COLS/2)-Math.floor(p.s[0].length/2),y:0};
  }
  function rot(s){ return s[0].map((_,i)=>s.map(r=>r[i]).reverse()); }
  function ok(s,ox,oy){
    return s.every((row,dy)=>row.every((v,dx)=>!v||(oy+dy>=0&&oy+dy<ROWS&&ox+dx>=0&&ox+dx<COLS&&!board[oy+dy][ox+dx])));
  }
  function place(){
    piece.s.forEach((row,dy)=>row.forEach((v,dx)=>{ if(v) board[piece.y+dy][piece.x+dx]=piece.c; }));
    let c=0;
    for(let r=ROWS-1;r>=0;){
      if(board[r].every(x=>x)){ board.splice(r,1); board.unshift(Array(COLS).fill(0)); c++; }
      else r--;
    }
    if(c){ clrd+=c; score+=c*100*lvl; lvl=Math.floor(clrd/10)+1; beep(660,.08,.05); }
    piece=newP();
    if(!ok(piece.s,piece.x,piece.y)){ alive=false; beep(180,.5,.06,'sawtooth'); }
  }
  function drawT(){
    gc.fillStyle='#000'; gc.fillRect(0,0,W,H);
    // board bg
    gc.fillStyle='rgba(20,252,22,0.025)'; gc.fillRect(0,0,COLS*CELL,H);
    // grid
    gc.strokeStyle='rgba(20,252,22,0.06)'; gc.lineWidth=1;
    for(let x=0;x<=COLS;x++){gc.beginPath();gc.moveTo(x*CELL,0);gc.lineTo(x*CELL,H);gc.stroke();}
    for(let y=0;y<=ROWS;y++){gc.beginPath();gc.moveTo(0,y*CELL);gc.lineTo(COLS*CELL,y*CELL);gc.stroke();}
    // board
    board.forEach((row,y)=>row.forEach((c,x)=>{ if(c){gc.fillStyle=c;gc.fillRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);} }));
    if(piece&&alive){
      // ghost
      let gy=piece.y;
      while(ok(piece.s,piece.x,gy+1)) gy++;
      gc.fillStyle='rgba(20,252,22,0.12)';
      piece.s.forEach((row,dy)=>row.forEach((v,dx)=>{ if(v) gc.fillRect((piece.x+dx)*CELL+1,(gy+dy)*CELL+1,CELL-2,CELL-2); }));
      // piece
      gc.fillStyle=piece.c;
      piece.s.forEach((row,dy)=>row.forEach((v,dx)=>{ if(v) gc.fillRect((piece.x+dx)*CELL+1,(piece.y+dy)*CELL+1,CELL-2,CELL-2); }));
    }
    // sidebar
    const sx=COLS*CELL+14;
    gc.fillStyle='#14FC16'; gc.font='bold 13px IBM Plex Mono';
    gc.fillText('SCORE',sx,36); gc.fillText(score,sx,56);
    gc.fillText('LINES',sx,96); gc.fillText(clrd,sx,116);
    gc.fillText('LEVEL',sx,156); gc.fillText(lvl,sx,176);
    if(!alive){
      gc.fillStyle='rgba(0,0,0,0.75)'; gc.fillRect(0,0,COLS*CELL,H);
      gc.fillStyle='#14FC16'; gc.font='bold 28px IBM Plex Mono'; gc.textAlign='center';
      gc.fillText('GAME OVER',COLS*CELL/2,H/2-20);
      gc.font='16px IBM Plex Mono'; gc.fillText('R to restart',COLS*CELL/2,H/2+14);
      gc.textAlign='left';
    }
    document.getElementById('game-score').textContent=`SCORE: ${score}  LVL: ${lvl}`;
  }
  piece=newP();
  gameKeyHandler=e=>{
    if(!alive){ if(e.key==='r'||e.key==='R'){stopGame();initTetris();} return; }
    if(e.key==='ArrowLeft'){if(ok(piece.s,piece.x-1,piece.y))piece.x--;}
    else if(e.key==='ArrowRight'){if(ok(piece.s,piece.x+1,piece.y))piece.x++;}
    else if(e.key==='ArrowDown'){if(ok(piece.s,piece.x,piece.y+1))piece.y++;else place();}
    else if(e.key==='ArrowUp'){const r=rot(piece.s);if(ok(r,piece.x,piece.y))piece.s=r;}
    else if(e.key===' '){while(ok(piece.s,piece.x,piece.y+1))piece.y++;place();beep(440,.05,.04);}
    else if(e.key==='r'||e.key==='R'){stopGame();initTetris();}
    e.preventDefault(); drawT();
  };
  document.addEventListener('keydown',gameKeyHandler);
  drawT();
  gameLoop=setInterval(()=>{
    if(!alive){drawT();return;}
    if(ok(piece.s,piece.x,piece.y+1)) piece.y++;
    else place();
    drawT();
  }, Math.max(80,500-lvl*40));
}

// ======== CONNECT 4 ========
function initConnect4(){
  document.getElementById('game-title').textContent='CONNECT 4';
  document.getElementById('game-info').textContent='Click Column or Keys 1-7 to drop  |  4 in a row wins  |  R — Restart';
  const COLS=7,ROWS=6,CELL=90,W=COLS*CELL,H=ROWS*CELL+60;
  const gc=setupCanvas(W,H);
  const canvas=document.getElementById('game-canvas');
  let board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  let turn=1,winner=0,hover=-1;
  const C1='#14FC16',C2='#ff3344';

  function check(r,c,p){
    const dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(const [dr,dc] of dirs){
      let n=1;
      for(let d=1;d<4;d++){const nr=r+dr*d,nc=c+dc*d;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===p)n++;else break;}
      for(let d=1;d<4;d++){const nr=r-dr*d,nc=c-dc*d;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===p)n++;else break;}
      if(n>=4) return true;
    }
    return false;
  }
  function drop(col){
    if(winner||board[0][col]!==0) return;
    let row=-1;
    for(let r=ROWS-1;r>=0;r--){if(!board[r][col]){row=r;break;}}
    if(row===-1) return;
    board[row][col]=turn;
    beep(turn===1?660:440,.06,.04);
    if(check(row,col,turn)){ winner=turn; beep(784,.08,.05); setTimeout(()=>beep(1047,.15,.05),100); }
    else if(board[0].every((_,i)=>board[0][i]!==0)) winner=-1;
    else turn=turn===1?2:1;
    draw();
  }
  function draw(){
    gc.fillStyle='#000'; gc.fillRect(0,0,W,H);
    // hover col
    if(hover>=0&&!winner){
      gc.fillStyle='rgba(20,252,22,0.05)';
      gc.fillRect(hover*CELL,0,CELL,H);
    }
    // drop indicator
    if(hover>=0&&!winner){
      gc.fillStyle=turn===1?C1:C2;
      gc.globalAlpha=0.75;
      gc.beginPath(); gc.arc(hover*CELL+CELL/2,28,20,0,Math.PI*2); gc.fill();
      gc.globalAlpha=1;
    }
    // grid + pieces
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const x=c*CELL+CELL/2,y=r*CELL+60+CELL/2;
        gc.strokeStyle='rgba(20,252,22,0.2)'; gc.lineWidth=1;
        gc.strokeRect(c*CELL,r*CELL+60,CELL,CELL);
        gc.fillStyle='rgba(20,252,22,0.05)';
        gc.beginPath(); gc.arc(x,y,CELL/2-7,0,Math.PI*2); gc.fill();
        if(board[r][c]){
          gc.fillStyle=board[r][c]===1?C1:C2;
          gc.shadowColor=board[r][c]===1?C1:C2; gc.shadowBlur=5;
          gc.beginPath(); gc.arc(x,y,CELL/2-11,0,Math.PI*2); gc.fill();
          gc.shadowBlur=0;
        }
      }
    }
    // status bar
    gc.fillStyle='#14FC16'; gc.font='bold 19px IBM Plex Mono'; gc.textAlign='center';
    if(winner===1||winner===2){
      gc.fillStyle=winner===1?C1:C2;
      gc.fillText(`PLAYER ${winner} WINS!  R to restart`,W/2,H-12);
    } else if(winner===-1){
      gc.fillText('DRAW!  R to restart',W/2,H-12);
    } else {
      gc.fillStyle=turn===1?C1:C2;
      gc.fillText(`PLAYER ${turn}'S TURN`,W/2,H-12);
    }
    gc.textAlign='left';
    document.getElementById('game-score').textContent=`P1: ● (green)  P2: ● (red)`;
  }
  canvas.onclick=e=>{
    const rect=canvas.getBoundingClientRect();
    const col=Math.floor((e.clientX-rect.left)/CELL);
    if(col>=0&&col<COLS) drop(col);
  };
  canvas.onmousemove=e=>{
    const rect=canvas.getBoundingClientRect();
    hover=Math.floor((e.clientX-rect.left)/CELL);
    if(hover<0||hover>=COLS) hover=-1;
    draw();
  };
  canvas.onmouseleave=()=>{hover=-1;draw();};
  gameKeyHandler=e=>{
    if(e.key==='r'||e.key==='R'){stopGame();initConnect4();return;}
    const k=parseInt(e.key);
    if(k>=1&&k<=7) drop(k-1);
  };
  document.addEventListener('keydown',gameKeyHandler);
  draw();
}

// ===================== INIT =====================
schedGlitch();
let _started=false;
async function go(){
  if(_started) return; _started=true;
  await bootSeq();
}
document.addEventListener('click',go,{once:true});
setTimeout(go,900);
