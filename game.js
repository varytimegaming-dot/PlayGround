import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const COLORS = [
  { name: 'Ruby', hex: 0xe95c64, css: '#ed5b61', dark: 0x9b3440, icon: '🔴', start: 0, home: [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]], yard: [[10,2],[10,4],[12,2],[12,4]], base: [9,0,6,6] },
  { name: 'Emerald', hex: 0x36bd8b, css: '#32ba89', dark: 0x177c61, icon: '🟢', start: 13, home: [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]], yard: [[2,2],[2,4],[4,2],[4,4]], base: [0,0,6,6] },
  { name: 'Amber', hex: 0xf0bd4d, css: '#f0bb45', dark: 0xa97724, icon: '🟡', start: 26, home: [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]], yard: [[2,10],[2,12],[4,10],[4,12]], base: [0,9,6,6] },
  { name: 'Sapphire', hex: 0x6388f4, css: '#6388f4', dark: 0x334da5, icon: '🔵', start: 39, home: [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]], yard: [[10,10],[10,12],[12,10],[12,12]], base: [9,9,6,6] }
];
const TRACK = [[6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0]];
const SAFE = new Set([0,8,13,21,26,34,39,47]);
const DIE_GLYPHS = ['⚀','⚁','⚂','⚃','⚄','⚅'];
const boardEl = document.querySelector('#board');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
boardEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-9.5, 9.5, 9.5, -9.5, 0.1, 100);
camera.position.set(0, 20, 13.5);
camera.lookAt(0, 0, 0);
scene.add(new THREE.HemisphereLight(0xfff4dd, 0x323751, 2.1));
const keyLight = new THREE.DirectionalLight(0xfff4df, 3.2);
keyLight.position.set(-7, 17, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -11; keyLight.shadow.camera.right = 11; keyLight.shadow.camera.top = 11; keyLight.shadow.camera.bottom = -11;
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x788eff, 24, 22);
fillLight.position.set(6, 8, -5);
scene.add(fillLight);
const boardGroup = new THREE.Group(); scene.add(boardGroup);
const mat = (color, roughness = .62, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const matBoard = mat(0xece9df,.75), matWhite = mat(0xf8f5eb,.65), matLine = mat(0xd7d4cb,.78);
const matSafe = mat(0xf2e5c4,.55), matDark = mat(0x272d3e,.62);
const cellGeo = new THREE.BoxGeometry(.94,.16,.94);
function pos(row,col,y=0){return new THREE.Vector3(col-7,y,row-7);}
function addMesh(parent,geometry,material,position,cast=false,receive=true){const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(position);mesh.castShadow=cast;mesh.receiveShadow=receive;parent.add(mesh);return mesh;}
function roundedBox(width,height,depth,radius,segments=5){
  const shape=new THREE.Shape();const x=-width/2,z=-depth/2;
  shape.moveTo(x+radius,z);shape.lineTo(x+width-radius,z);shape.quadraticCurveTo(x+width,z,x+width,z+radius);
  shape.lineTo(x+width,z+depth-radius);shape.quadraticCurveTo(x+width,z+depth,x+width-radius,z+depth);
  shape.lineTo(x+radius,z+depth);shape.quadraticCurveTo(x,z+depth,x,z+depth-radius);shape.lineTo(x,z+radius);shape.quadraticCurveTo(x,z,x+radius,z);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:segments,steps:1,bevelSize:.08,bevelThickness:.08});geo.rotateX(-Math.PI/2);geo.translate(0,-height/2,0);return geo;
}
addMesh(boardGroup,roundedBox(15.25,.62,15.25,.52),mat(0x343b4e,.4),new THREE.Vector3(0,-.2,0),true);
addMesh(boardGroup,new THREE.BoxGeometry(15.08,.12,15.08),matBoard,new THREE.Vector3(0,.1,0),false);
COLORS.forEach(c=>{
  const [r,col,h,w]=c.base;const center=pos(r+h/2-.5,col+w/2-.5,.2);
  addMesh(boardGroup,new THREE.BoxGeometry(w-.12,.13,h-.12),mat(c.hex,.56),center,false);
  addMesh(boardGroup,roundedBox(5.1,.08,5.1,.4),mat(c.dark,.55),new THREE.Vector3(center.x,.25,center.z),false);
  addMesh(boardGroup,roundedBox(4.7,.1,4.7,.38),matWhite,new THREE.Vector3(center.x,.32,center.z),false);
  c.yard.forEach(([rr,cc])=>{const p=pos(rr,cc,.43);addMesh(boardGroup,new THREE.CylinderGeometry(.38,.4,.12,32),mat(0xd8d8d2,.74),new THREE.Vector3(p.x,.39,p.z),false);const ring=addMesh(boardGroup,new THREE.TorusGeometry(.36,.025,8,36),mat(c.hex,.35),new THREE.Vector3(p.x,.47,p.z),false);ring.rotation.x=Math.PI/2;});
});
const cellLookup=new Map();
TRACK.forEach(([r,c],i)=>{
  const material=mat(0xf8f5eb,.65);if(SAFE.has(i))material.color.setHex(0xf0e3c2);
  addMesh(boardGroup,cellGeo,material,pos(r,c,.27),false);cellLookup.set(`${r},${c}`,i);
  if(SAFE.has(i)){const star=addMesh(boardGroup,new THREE.ConeGeometry(.19,.035,5),mat(0xd3a74d,.45),pos(r,c,.38),false);star.rotation.x=Math.PI/2;star.rotation.z=Math.PI/5;}
  if([0,13,26,39].includes(i)){const color=COLORS.find(x=>x.start===i);addMesh(boardGroup,new THREE.CylinderGeometry(.16,.18,.045,28),mat(color.hex,.38),pos(r,c,.39),false);}
});
COLORS.forEach(c=>c.home.forEach(([r,col],i)=>{const m=mat(0xf6f3eb,.68);if(i===5)m.color.setHex(c.hex);addMesh(boardGroup,cellGeo,m,pos(r,col,.27),false);if(i===5){const ring=addMesh(boardGroup,new THREE.TorusGeometry(.29,.035,8,32),mat(c.dark,.35),pos(r,col,.38),false);ring.rotation.x=Math.PI/2;}}));
addMesh(boardGroup,new THREE.BoxGeometry(2.84,.2,2.84),matWhite,new THREE.Vector3(0,.26,0),false);
const wedges=[{x:-.48,z:.48,color:COLORS[0].hex},{x:-.48,z:-.48,color:COLORS[1].hex},{x:.48,z:-.48,color:COLORS[2].hex},{x:.48,z:.48,color:COLORS[3].hex}];
wedges.forEach(w=>{const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(-1.35,0);shape.lineTo(-1.35,-1.35);shape.lineTo(0,-1.35);shape.closePath();const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);geo.rotateY(Math.atan2(w.x,w.z));const mesh=new THREE.Mesh(geo,mat(w.color,.46));mesh.position.set(w.x,.38,w.z);boardGroup.add(mesh);});
const centerGem=addMesh(boardGroup,new THREE.CylinderGeometry(.19,.22,.1,6),mat(0xf1d28d,.3,.2),new THREE.Vector3(0,.48,0),true);centerGem.rotation.y=Math.PI/6;
const border=addMesh(boardGroup,new THREE.BoxGeometry(15.08,.035,15.08),mat(0xc8ab70,.28,.25),new THREE.Vector3(0,.18,0),false);border.material.transparent=true;border.material.opacity=.55;
const tokens=[];
COLORS.forEach((color,player)=>{for(let id=0;id<4;id++){
  const group=new THREE.Group();group.userData={player,id};boardGroup.add(group);
  addMesh(group,new THREE.CylinderGeometry(.37,.4,.11,32),mat(0x171b28,.55),new THREE.Vector3(0,.08,0),true);
  addMesh(group,new THREE.CylinderGeometry(.32,.35,.15,32),mat(color.dark,.4,.12),new THREE.Vector3(0,.16,0),true);
  addMesh(group,new THREE.CylinderGeometry(.245,.31,.48,32),mat(color.hex,.38,.08),new THREE.Vector3(0,.43,0),true);
  const crown=addMesh(group,new THREE.SphereGeometry(.245,28,18),mat(color.hex,.32,.08),new THREE.Vector3(0,.66,0),true);crown.scale.y=.7;
  addMesh(group,new THREE.SphereGeometry(.052,12,10),mat(0xffffff,.2),new THREE.Vector3(-.09,.77,-.12),false);
  const ring=addMesh(group,new THREE.TorusGeometry(.44,.055,10,40),new THREE.MeshBasicMaterial({color:0xffe6a1,transparent:true,opacity:.95}),new THREE.Vector3(0,.08,0),false);ring.rotation.x=Math.PI/2;ring.visible=false;
  group.userData.ring=ring;tokens.push({player,id,progress:-1,mesh:group,ring,homeSpot:color.yard[id]});
}});
function tokenGrid(token){if(token.progress<0)return token.homeSpot;if(token.progress<52)return TRACK[(COLORS[token.player].start+token.progress)%52];if(token.progress<57)return COLORS[token.player].home[token.progress-52];return [7,7];}
function refreshTokenPositions(){tokens.forEach(t=>{
  const [r,c]=tokenGrid(t);const same=tokens.filter(o=>o!==t&&o.progress>=0&&tokenGrid(o).join(',')===`${r},${c}`);let ox=0,oz=0;
  if(t.progress>=0&&same.length){const peers=[...same,t].sort((a,b)=>a.player-b.player||a.id-b.id);const offsets=[[0,0],[-.16,-.12],[.16,-.12],[-.16,.14],[.16,.14]];[ox,oz]=offsets[peers.indexOf(t)]||[0,0];}
  const p=pos(r,c,.4);t.mesh.position.set(p.x+ox,.28,p.z+oz);
});}
refreshTokenPositions();
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const game={turn:0,round:1,rolled:null,legal:[],busy:false,over:false};
const ui={roll:document.querySelector('#rollBtn'),label:document.querySelector('#rollLabel'),die:document.querySelector('#die'),hint:document.querySelector('#diceHint'),note:document.querySelector('#rollNote'),status:document.querySelector('#statusCard'),avatar:document.querySelector('#statusAvatar'),kicker:document.querySelector('#statusKicker'),message:document.querySelector('#statusMessage'),players:document.querySelector('#playersList'),turnText:document.querySelector('#turnText'),counter:document.querySelector('#turnCounter'),toast:document.querySelector('#toast')};
let toastTimer;
function toast(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),2100);}
function isHuman(){return game.turn===0;}
function canMove(token,die){if(token.progress<0)return die===6;if(token.progress>=57)return false;return token.progress+die<=57;}
function playerLegalMoves(player,die){return tokens.filter(t=>t.player===player&&canMove(t,die));}
function renderPlayers(){ui.players.innerHTML=COLORS.map((c,p)=>{
  const owned=tokens.filter(t=>t.player===p),done=owned.filter(t=>t.progress===57).length,out=owned.filter(t=>t.progress>=0&&t.progress<57).length,active=p===game.turn;
  return `<div class="player-row ${active?'active':''}" style="${active?`border-color:${c.css}42;background:${c.css}12`:''}"><div class="player-icon" style="background:${c.css}22">${c.icon}</div><div class="player-meta"><div class="player-name">${c.name}${p===0?'<span class="you-tag">YOU</span>':''}</div><div class="player-progress">${done} home · ${out} racing</div></div><div class="token-pips">${owned.map(t=>`<i class="token-pip ${t.progress===57?'done':''}" style="${t.progress===57?`background:${c.css};color:${c.css}`:''}"></i>`).join('')}</div><span class="player-badge" style="${active?`color:${c.css};background:${c.css}18`:''}">${done===4?'WINNER':`${out} OUT`}</span></div>`;
}).join('');ui.counter.textContent=`ROUND ${game.round}`;}
function updateUI(){
  const c=COLORS[game.turn],human=isHuman();ui.turnText.textContent=human?'YOUR TURN':`${c.name.toUpperCase()} TURN`;document.querySelector('.turn-dot').style.background=c.css;
  ui.status.style.background=`linear-gradient(105deg,${c.css}42,${c.css}12)`;ui.status.style.borderColor=`${c.css}45`;ui.avatar.textContent=c.icon;ui.avatar.style.background=`${c.css}30`;ui.kicker.textContent=game.over?'GAME COMPLETE':human?"IT'S YOUR TURN":`${c.name.toUpperCase()} IS THINKING`;ui.kicker.style.color=c.css;
  if(game.over)ui.message.textContent=game.turn===0?'You won the game!':`${c.name} won the game!`;
  else if(game.rolled!==null&&human)ui.message.textContent=game.legal.length?`You rolled a ${game.rolled} — choose a token!`:'No moves this time. Try again next turn.';
  else ui.message.textContent=human?(tokens.some(t=>t.player===0&&t.progress>=0)?'Bring your tokens home first!':'Roll a six to get started!'):`${c.name} is taking a turn…`;
  ui.roll.disabled=game.busy||game.over||!human||game.rolled!==null;ui.label.textContent=game.rolled!==null&&human?'CHOOSE A TOKEN':(human?'ROLL DICE':'OPPONENT TURN');
  ui.hint.innerHTML=game.rolled!==null?`You rolled a <b>${game.rolled}</b><br><small>${game.legal.length?'Tap a glowing token':'No legal moves'}</small>`:`Tap to roll<br><small>${tokens.some(t=>t.player===game.turn&&t.progress>=0)?'A six gives you a bonus roll':'Need a 6 to leave home'}</small>`;
  ui.note.textContent=game.rolled!==null?(game.legal.length?'Choose one of your glowing tokens':(human?'No legal move · advancing turn':'')):(human?'Your turn · Roll a 6 to begin':'Waiting for opponent…');renderPlayers();
}
function highlightLegal(){tokens.forEach(t=>{const on=game.legal.includes(t);t.ring.visible=on;t.ring.material.opacity=on?.95:.0;t.mesh.scale.setScalar(on?1.12:1);});}
function setTurn(index){game.turn=index;game.rolled=null;game.legal=[];if(index===0&&game.round>1)game.round++;highlightLegal();updateUI();if(index!==0&&!game.over)setTimeout(cpuTurn,720);}
function roll(){
  if(game.busy||game.over||game.rolled!==null)return;game.busy=true;ui.roll.disabled=true;ui.die.classList.remove('rolling');void ui.die.offsetWidth;ui.die.classList.add('rolling');let ticks=0;
  const timer=setInterval(()=>{ui.die.querySelector('span').textContent=DIE_GLYPHS[Math.floor(Math.random()*6)];if(++ticks>7){clearInterval(timer);const value=Math.floor(Math.random()*6)+1;game.rolled=value;game.legal=playerLegalMoves(game.turn,value);game.busy=false;ui.die.querySelector('span').textContent=DIE_GLYPHS[value-1];ui.die.classList.remove('rolling');highlightLegal();updateUI();
    if(game.legal.length===0){if(isHuman())toast(value===6?'No token can move with that six.':'No legal moves this time.');setTimeout(()=>{if(!game.over){game.rolled=null;setTurn((game.turn+1)%4);}},850);}else if(!isHuman())setTimeout(cpuChoose,500);
  }},75);
}
function globalCell(token,progress){return (COLORS[token.player].start+progress)%52;}
async function moveToken(token){
  if(game.busy||!game.legal.includes(token)||game.over)return;game.busy=true;game.legal=[];highlightLegal();const die=game.rolled,target=token.progress<0?0:token.progress+die,start=token.progress<0?0:token.progress+1;
  for(let step=start;step<=target;step++){token.progress=step;refreshTokenPositions();await new Promise(resolve=>setTimeout(resolve,95));}
  let captured=0;if(token.progress<52){const cell=globalCell(token,token.progress);if(!SAFE.has(cell))tokens.forEach(other=>{if(other.player!==token.player&&other.progress>=0&&other.progress<52&&globalCell(other,other.progress)===cell){other.progress=-1;captured++;}});}
  const finished=token.progress===57;refreshTokenPositions();game.busy=false;
  if(tokens.filter(t=>t.player===token.player).every(t=>t.progress===57)){game.over=true;game.rolled=null;game.legal=[];highlightLegal();updateUI();toast(token.player===0?'🏆 You are the Ludo champion!':`${COLORS[token.player].name} wins the table!`);return;}
  const extra=die===6||captured>0||finished;if(captured)toast(`Captured ${captured} rival token${captured>1?'s':''}!`);else if(finished)toast('Token safely home! One more roll.');else if(die===6)toast('A six! Roll again.');
  game.rolled=null;game.legal=[];if(extra){highlightLegal();updateUI();if(game.turn!==0)setTimeout(cpuTurn,550);}else setTurn((game.turn+1)%4);
}
function chooseToken(token){if(game.turn===0&&game.rolled!==null&&game.legal.includes(token))moveToken(token);}
function cpuChoose(){
  if(game.turn===0||game.over||game.rolled===null||game.busy)return;const options=game.legal;if(!options.length)return;
  let token=options.find(t=>t.progress>=0&&t.progress+game.rolled===57);if(!token&&options.length>1)token=options.find(t=>t.progress<0)||options.find(t=>t.progress>=0&&t.progress<10);if(!token)token=options[Math.floor(Math.random()*options.length)];moveToken(token);
}
function cpuTurn(){if(game.turn!==0&&!game.over&&!game.busy)roll();}
function resetGame(){tokens.forEach(t=>t.progress=-1);game.turn=0;game.round=1;game.rolled=null;game.legal=[];game.busy=false;game.over=false;refreshTokenPositions();ui.die.querySelector('span').textContent='⚄';highlightLegal();updateUI();toast('New game started — good luck!');}
renderer.domElement.addEventListener('pointerup',event=>{
  const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(tokens.flatMap(t=>t.mesh.children),false);if(hits.length){let obj=hits[0].object;while(obj&&obj.userData.player===undefined&&obj.parent)obj=obj.parent;if(obj?.userData.player!==undefined){const token=tokens.find(t=>t.player===obj.userData.player&&t.id===obj.userData.id);if(token)chooseToken(token);}}
});
ui.roll.addEventListener('click',roll);document.querySelector('#die').addEventListener('click',roll);document.querySelector('#newGameBtn').addEventListener('click',resetGame);
document.querySelector('#cameraBtn').addEventListener('click',()=>{boardGroup.rotation.set(0,0,0);toast('Board view reset');});
document.querySelector('#soundBtn').addEventListener('click',e=>{e.currentTarget.classList.toggle('muted');toast(e.currentTarget.classList.contains('muted')?'Sound off':'Sound on');});
const modal=document.querySelector('#helpModal');document.querySelector('#helpBtn').addEventListener('click',()=>modal.hidden=false);document.querySelector('#closeHelp').addEventListener('click',()=>modal.hidden=true);document.querySelector('#playBtn').addEventListener('click',()=>modal.hidden=true);modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true;});
function resize(){const rect=boardEl.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);const aspect=rect.width/rect.height,h=9.1;camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(boardEl);resize();function animate(){requestAnimationFrame(animate);centerGem.rotation.y+=.004;renderer.render(scene,camera);}animate();highlightLegal();updateUI();
