import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const wrap = document.getElementById('scene-wrap');
const loading = document.getElementById('loading');
const infoTitle = document.getElementById('part-title');
const infoEn = document.getElementById('part-en');
const infoDesc = document.getElementById('part-desc');
const infoSpecs = document.getElementById('part-specs');
const partIcon = document.getElementById('part-icon');
const partsList = document.getElementById('parts-list');
const partsCount = document.getElementById('parts-count');
const rpmReadout = document.getElementById('rpm-readout');
const modeReadout = document.getElementById('mode-readout');
const speedSlider = document.getElementById('speed-slider');
const runBtn = document.getElementById('run-btn');
const explodeBtn = document.getElementById('explode-btn');
const labelsBtn = document.getElementById('labels-btn');
const resetBtn = document.getElementById('reset-btn');
const focusBtn = document.getElementById('focus-btn');

const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

const PARTS = {
  housing: {
    fa: 'پوسته موتور', en: 'Motor Housing', icon: '◉',
    desc: 'پوسته آلومینیومی سازه اصلی موتور است. از اجزای داخلی محافظت می‌کند، یاتاقان‌ها را هم‌محور نگه می‌دارد و در بسیاری از موتورهای خودرویی بخشی از مسیر دفع حرارت و خنک‌کاری را تشکیل می‌دهد.',
    specs: [['جنس رایج','آلومینیوم ریختگی'],['وظیفه','حفاظت و انتقال حرارت']], explode:[0,0,0], label:[0,3.15,0]
  },
  stator: {
    fa: 'استاتور', en: 'Stator Core', icon: '◎',
    desc: 'استاتور بخش ثابت موتور و از ورق‌های نازک فولاد الکتریکی ساخته می‌شود. شار مغناطیسی سیم‌پیچ‌ها در این هسته هدایت می‌شود و شیارهای آن سیم‌پیچ‌های سه‌فاز را در خود نگه می‌دارند.',
    specs: [['ساختار','ورق‌های فولاد الکتریکی'],['حالت','ثابت']], explode:[-1.15,0,0], label:[0,2.55,0]
  },
  windings: {
    fa: 'سیم‌پیچ‌های مسی', en: 'Copper Windings', icon: '≈',
    desc: 'اینورتر جریان سه‌فاز کنترل‌شده را به سیم‌پیچ‌های مسی می‌فرستد. تغییر پیوسته جریان، میدان مغناطیسی دوّاری می‌سازد که با میدان روتور برهم‌کنش کرده و گشتاور تولید می‌کند.',
    specs: [['ماده','مس عایق‌شده'],['تغذیه','AC سه‌فاز']], explode:[-1.85,.15,0], label:[0,2.15,1.25]
  },
  rotor: {
    fa: 'روتور', en: 'Rotor Core', icon: '●',
    desc: 'روتور بخش دوّار موتور است. در موتور PMSM/IPM، میدان مغناطیسی روتور با میدان دوّار استاتور همگام می‌شود و انرژی الکترومغناطیسی را به حرکت چرخشی و گشتاور مکانیکی تبدیل می‌کند.',
    specs: [['حالت','دوّار'],['انتقال نیرو','به شفت خروجی']], explode:[2.5,0,0], label:[0,1.65,0]
  },
  magnets: {
    fa: 'آهنرباهای دائم', en: 'Permanent Magnets', icon: 'N',
    desc: 'آهنرباهای دائم شار مغناطیسی روتور را ایجاد می‌کنند. در طراحی IPM معمولاً داخل هسته روتور قرار می‌گیرند تا بازده، چگالی توان و محدوده کنترل گشتاور بهتر شود.',
    specs: [['نوع رایج','NdFeB'],['نقش','ایجاد میدان روتور']], explode:[3.0,0,.65], label:[0,1.35,1.1]
  },
  shaft: {
    fa: 'شفت خروجی', en: 'Output Shaft', icon: '━',
    desc: 'شفت، گشتاور تولیدشده در روتور را به گیربکس کاهنده و سپس چرخ‌های خودرو منتقل می‌کند. استحکام پیچشی، بالانس دقیق و هم‌محوری آن برای عملکرد نرم موتور حیاتی است.',
    specs: [['وظیفه','انتقال گشتاور'],['اتصال','گیربکس کاهنده']], explode:[4.7,0,0], label:[2.6,.65,0]
  },
  bearings: {
    fa: 'یاتاقان‌ها', en: 'Bearings', icon: '⊙',
    desc: 'یاتاقان‌ها شفت و روتور را با اصطکاک کم نگه می‌دارند، بارهای شعاعی و محوری را تحمل می‌کنند و فاصله هوایی دقیق بین روتور و استاتور را حفظ می‌کنند.',
    specs: [['وظیفه','کاهش اصطکاک'],['اهمیت','حفظ هم‌محوری']], explode:[0,0,-3.3], label:[-2.1,1.15,0]
  },
  cooling: {
    fa: 'ژاکت خنک‌کاری', en: 'Cooling Jacket', icon: '❄',
    desc: 'کانال‌های خنک‌کاری اطراف پوسته، گرمای تولیدشده در سیم‌پیچ‌ها و هسته را به مدار خنک‌کننده خودرو منتقل می‌کنند. کنترل دما مستقیماً روی توان پیوسته و عمر عایق‌ها اثر دارد.',
    specs: [['سیال','آب/گلیکول'],['هدف','کنترل دمای موتور']], explode:[0,0,-2.15], label:[0,-2.65,0]
  },
  encoder: {
    fa: 'رزولور / انکودر', en: 'Resolver / Encoder', icon: '⌁',
    desc: 'سنسور موقعیت روتور زاویه و سرعت محور را اندازه می‌گیرد. کنترلر موتور از این اطلاعات برای زمان‌بندی دقیق جریان‌های سه‌فاز و کنترل برداری گشتاور استفاده می‌کند.',
    specs: [['اندازه‌گیری','زاویه و سرعت'],['کاربرد','کنترل برداری']], explode:[-4.25,0,0], label:[-2.65,1.0,0]
  },
  terminals: {
    fa: 'ترمینال‌های سه‌فاز', en: 'Three‑Phase Terminals', icon: '⚡',
    desc: 'سه اتصال قدرت U، V و W جریان سه‌فاز خروجی اینورتر را به سیم‌پیچ‌های استاتور می‌رسانند. این اتصالات برای جریان بالا، عایق‌کاری و ایمنی ولتاژ بالا طراحی می‌شوند.',
    specs: [['فازها','U / V / W'],['نوع','اتصال قدرت HV']], explode:[0,3.15,.25], label:[0,3.9,.15]
  },
  sensor: {
    fa: 'سنسور دما', en: 'Temperature Sensor', icon: '°',
    desc: 'سنسور دما شرایط حرارتی سیم‌پیچ یا پوسته را پایش می‌کند. واحد کنترل در صورت افزایش بیش‌ازحد دما، توان و گشتاور را محدود می‌کند تا از آسیب جلوگیری شود.',
    specs: [['نوع رایج','NTC / RTD'],['نقش','حفاظت حرارتی']], explode:[0,-3.0,1.2], label:[0,-2.7,1.45]
  },
  inverter: {
    fa: 'اینورتر محرک', en: 'Traction Inverter', icon: '▦',
    desc: 'اینورتر جزو داخل موتور نیست، اما مغز الکترونیکی سامانه محرکه است. برق DC باتری را با کلیدزنی سریع نیمه‌هادی‌ها به AC سه‌فاز کنترل‌شده تبدیل می‌کند و گشتاور، سرعت و بازیابی انرژی را مدیریت می‌کند.',
    specs: [['ورودی','DC باتری ولتاژ بالا'],['خروجی','AC سه‌فاز کنترل‌شده']], explode:[0,4.4,-.45], label:[0,4.65,-.2]
  }
};

partsCount.textContent = `${fa(Object.keys(PARTS).length)} جزء`;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05080c, 0.035);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
camera.position.set(9, 5.6, 10.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
wrap.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.inset = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '5';
wrap.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .055;
controls.minDistance = 6.5;
controls.maxDistance = 22;
controls.target.set(0, .15, 0);
controls.autoRotate = false;

const hemi = new THREE.HemisphereLight(0xbfefff, 0x11121a, 1.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xd9f7ff, 5.0);
key.position.set(6, 10, 7); key.castShadow = true; key.shadow.mapSize.set(2048,2048); scene.add(key);
const cyan = new THREE.PointLight(0x23d9ff, 40, 18, 2); cyan.position.set(-4, 2, 5); scene.add(cyan);
const warm = new THREE.PointLight(0xff8f4d, 24, 13, 2); warm.position.set(4, 1, -5); scene.add(warm);

const platform = new THREE.Group();
const p1 = new THREE.Mesh(new THREE.CylinderGeometry(4.6,5.0,.25,96), new THREE.MeshPhysicalMaterial({color:0x0a1218,metalness:.78,roughness:.36,clearcoat:1}));
p1.position.y = -3.18; p1.receiveShadow = true; platform.add(p1);
const p2 = new THREE.Mesh(new THREE.TorusGeometry(4.15,.025,8,128), new THREE.MeshBasicMaterial({color:0x33dfff,transparent:true,opacity:.55}));
p2.rotation.x = Math.PI/2; p2.position.y=-3.04; platform.add(p2);
const grid = new THREE.GridHelper(30, 30, 0x1c5465, 0x102932); grid.position.y=-3.04; grid.material.transparent=true; grid.material.opacity=.22; scene.add(grid);
scene.add(platform);

const motor = new THREE.Group();
motor.rotation.z = -.035;
scene.add(motor);

const componentGroups = {};
const componentMeshes = [];
const rotatingGroups = [];
const emissiveWindings = [];
let selectionBox = null;
let selectedId = null;
let exploded = false;
let running = true;
let labelsVisible = true;
let speed = Number(speedSlider.value) / 100;

function mat(color, metalness=.55, roughness=.35, extra={}){
  return new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.28,clearcoatRoughness:.25,...extra});
}

const materials = {
  housing: mat(0x88a4ad,.85,.26,{transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}),
  housingSolid: mat(0x65747b,.88,.24),
  steel: mat(0x353d43,.92,.27),
  steelDark: mat(0x1d242a,.94,.29),
  copper: mat(0xcc672a,.68,.23,{emissive:0x7a2608,emissiveIntensity:.18}),
  magnetN: mat(0xe45452,.62,.25,{emissive:0x4e0a0a,emissiveIntensity:.1}),
  magnetS: mat(0x397de5,.62,.25,{emissive:0x071f55,emissiveIntensity:.1}),
  bearing: mat(0xbec8cd,.96,.18),
  blueGlass: mat(0x31ccec,.28,.2,{transparent:true,opacity:.26,transmission:.18,emissive:0x08748f,emissiveIntensity:.25,depthWrite:false}),
  orange: mat(0xff8d32,.58,.24,{emissive:0x5d2103,emissiveIntensity:.2}),
  black: mat(0x12191e,.8,.36),
  pcb: mat(0x174136,.42,.48),
  gold: mat(0xdca63e,.8,.22),
  sensor: mat(0x5ae5ff,.35,.25,{emissive:0x0e879f,emissiveIntensity:.8})
};

function makeComponent(id, base=[0,0,0]){
  const g = new THREE.Group();
  g.name=id;
  g.position.set(...base);
  g.userData.basePosition = new THREE.Vector3(...base);
  g.userData.explodeOffset = new THREE.Vector3(...PARTS[id].explode);
  componentGroups[id]=g;
  motor.add(g);
  return g;
}

function register(group,id){
  group.traverse(o=>{
    if(o.isMesh){
      o.userData.componentId=id;
      o.castShadow=true;
      o.receiveShadow=true;
      if(Array.isArray(o.material)) o.material=o.material.map(m=>m.clone()); else o.material=o.material.clone();
      componentMeshes.push(o);
    }
  });
  const el=document.createElement('div');
  el.className='part-label';
  el.textContent=PARTS[id].fa;
  const label=new CSS2DObject(el);
  label.position.set(...PARTS[id].label);
  label.userData.componentId=id;
  group.add(label);
}

function cylinder(radius,length,material,segments=64){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,segments,1,false),material);
  m.rotation.z=Math.PI/2;
  return m;
}

function openCylinder(radius,length,material){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,80,1,true),material);
  m.rotation.z=Math.PI/2;
  return m;
}

// HOUSING
{
  const g=makeComponent('housing');
  const shell=openCylinder(2.86,3.35,materials.housing); g.add(shell);
  [-1.62,0,1.62].forEach((x,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.86,i===1?.055:.09,12,96),materials.housingSolid);
    ring.rotation.y=Math.PI/2; ring.position.x=x; g.add(ring);
  });
  for(let i=0;i<10;i++){
    const fin=new THREE.Mesh(new THREE.BoxGeometry(2.8,.07,.18),materials.housingSolid);
    const a=(i/10)*Math.PI*2; fin.position.set(0,Math.cos(a)*2.88,Math.sin(a)*2.88); fin.rotation.x=a; g.add(fin);
  }
  register(g,'housing');
}

// STATOR
{
  const g=makeComponent('stator');
  for(let i=0;i<18;i++){
    const x=-1.16+i*(2.32/17);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.08,.38,12,72),materials.steelDark);
    ring.rotation.y=Math.PI/2; ring.position.x=x; ring.scale.x=.98; g.add(ring);
  }
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2;
    const tooth=new THREE.Mesh(new THREE.BoxGeometry(2.45,.25,.43),materials.steel);
    tooth.position.set(0,Math.cos(a)*1.62,Math.sin(a)*1.62); tooth.rotation.x=a; g.add(tooth);
  }
  register(g,'stator');
}

// WINDINGS
{
  const g=makeComponent('windings');
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2;
    const m=new THREE.Mesh(new THREE.TorusGeometry(1.82,.072,8,72),materials.copper);
    m.rotation.y=Math.PI/2; m.position.x=-1.32+(i%3)*1.32; m.scale.set(1,1,1+(i%2)*.05); g.add(m); emissiveWindings.push(m);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(2.65,.09,.22),materials.copper);
    bar.position.set(0,Math.cos(a)*1.83,Math.sin(a)*1.83); bar.rotation.x=a; g.add(bar); emissiveWindings.push(bar);
  }
  register(g,'windings');
}

// ROTOR
{
  const g=makeComponent('rotor');
  for(let i=0;i<22;i++){
    const core=cylinder(1.32,.10,materials.steel,i%3===0?72:48); core.position.x=-1.05+i*.10; g.add(core);
  }
  const end1=cylinder(1.38,.11,materials.steelDark); end1.position.x=-1.2; g.add(end1);
  const end2=cylinder(1.38,.11,materials.steelDark); end2.position.x=1.2; g.add(end2);
  rotatingGroups.push(g); register(g,'rotor');
}

// MAGNETS
{
  const g=makeComponent('magnets');
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2;
    const mag=new THREE.Mesh(new THREE.BoxGeometry(2.2,.14,.42),i%2?materials.magnetN:materials.magnetS);
    mag.position.set(0,Math.cos(a)*1.17,Math.sin(a)*1.17); mag.rotation.x=a; g.add(mag);
  }
  rotatingGroups.push(g); register(g,'magnets');
}

// SHAFT
{
  const g=makeComponent('shaft');
  const s=cylinder(.31,6.15,materials.bearing,56); g.add(s);
  const spline=cylinder(.38,.65,materials.steelDark,32); spline.position.x=3.1; g.add(spline);
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    const tooth=new THREE.Mesh(new THREE.BoxGeometry(.68,.055,.09),materials.bearing);
    tooth.position.set(3.1,Math.cos(a)*.38,Math.sin(a)*.38); tooth.rotation.x=a; g.add(tooth);
  }
  rotatingGroups.push(g); register(g,'shaft');
}

// BEARINGS
{
  const g=makeComponent('bearings');
  [-1.82,1.82].forEach(x=>{
    const outer=new THREE.Mesh(new THREE.TorusGeometry(.63,.15,12,48),materials.bearing); outer.rotation.y=Math.PI/2; outer.position.x=x; g.add(outer);
    const cage=new THREE.Mesh(new THREE.TorusGeometry(.47,.06,10,48),materials.gold); cage.rotation.y=Math.PI/2; cage.position.x=x; g.add(cage);
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2; const ball=new THREE.Mesh(new THREE.SphereGeometry(.075,14,10),materials.bearing);
      ball.position.set(x,Math.cos(a)*.54,Math.sin(a)*.54); g.add(ball);
    }
  });
  register(g,'bearings');
}

// COOLING JACKET
{
  const g=makeComponent('cooling');
  for(let i=0;i<8;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.68,.045,8,96),materials.blueGlass);
    ring.rotation.y=Math.PI/2; ring.position.x=-1.45+i*.415; g.add(ring);
  }
  const pts=[];
  for(let i=0;i<180;i++){
    const t=i/179*Math.PI*8; const x=-1.45+i/179*2.9; pts.push(new THREE.Vector3(x,Math.cos(t)*2.69,Math.sin(t)*2.69));
  }
  const curve=new THREE.CatmullRomCurve3(pts);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,220,.025,6,false),materials.blueGlass); g.add(tube);
  register(g,'cooling');
}

// ENCODER / RESOLVER
{
  const g=makeComponent('encoder');
  const disk=cylinder(1.0,.18,materials.black,64); disk.position.x=-2.08; g.add(disk);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.08,10,64),materials.gold); ring.rotation.y=Math.PI/2; ring.position.x=-2.19; g.add(ring);
  const hub=cylinder(.38,.25,materials.sensor,48); hub.position.x=-2.24; g.add(hub);
  register(g,'encoder');
}

// THREE-PHASE TERMINALS
{
  const g=makeComponent('terminals');
  const plate=new THREE.Mesh(new THREE.BoxGeometry(1.65,.25,.95),materials.black); plate.position.set(0,2.8,.15); g.add(plate);
  [-.52,0,.52].forEach((z,i)=>{
    const pin=cylinder(.13,.65,i===0?materials.magnetN:i===1?materials.gold:materials.magnetS,28);
    pin.rotation.set(0,0,0); pin.position.set(z,3.08,.15); g.add(pin);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.18,24),materials.orange); cap.position.set(z,3.42,.15); g.add(cap);
  });
  register(g,'terminals');
}

// TEMPERATURE SENSOR
{
  const g=makeComponent('sensor');
  const probe=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.45,6,14),materials.sensor); probe.position.set(.45,-2.25,1.18); probe.rotation.z=.7; g.add(probe);
  const wirePts=[new THREE.Vector3(.45,-2.0,1.18),new THREE.Vector3(.25,-2.5,1.6),new THREE.Vector3(-.3,-2.7,1.75)];
  const wire=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePts),30,.035,6,false),materials.orange); g.add(wire);
  register(g,'sensor');
}

// INVERTER MODULE
{
  const g=makeComponent('inverter');
  const caseM=new THREE.MeshPhysicalMaterial({color:0x202d34,metalness:.82,roughness:.25,clearcoat:.55});
  const box=new THREE.Mesh(new THREE.BoxGeometry(3.0,.62,2.25,8,2,8),caseM); box.position.set(0,3.4,-.45); g.add(box);
  const lid=new THREE.Mesh(new THREE.BoxGeometry(2.72,.08,1.98),materials.housingSolid); lid.position.set(0,3.75,-.45); g.add(lid);
  for(let i=0;i<7;i++){
    const fin=new THREE.Mesh(new THREE.BoxGeometry(2.55,.18,.07),materials.housingSolid); fin.position.set(0,3.86,-1.25+i*.27); g.add(fin);
  }
  const pcb=new THREE.Mesh(new THREE.BoxGeometry(2.4,.07,1.55),materials.pcb); pcb.position.set(0,3.22,-.45); g.add(pcb);
  for(let i=0;i<6;i++){
    const chip=new THREE.Mesh(new THREE.BoxGeometry(.35,.09,.28),materials.black); chip.position.set(-.9+i*.36,3.14,-.55+(i%2)*.45); g.add(chip);
  }
  register(g,'inverter');
}

// Decorative energy rings
const energyGroup=new THREE.Group(); motor.add(energyGroup);
for(let i=0;i<3;i++){
  const r=new THREE.Mesh(new THREE.TorusGeometry(3.45+i*.18,.015,6,128),new THREE.MeshBasicMaterial({color:0x41dbff,transparent:true,opacity:.17-i*.04}));
  r.rotation.y=Math.PI/2; energyGroup.add(r);
}

function buildPartsList(){
  Object.entries(PARTS).forEach(([id,p])=>{
    const b=document.createElement('button'); b.className='part-item'; b.dataset.id=id;
    b.innerHTML=`<span class="mini-icon">${p.icon}</span><div><strong>${p.fa}</strong><span>${p.en}</span></div>`;
    b.addEventListener('click',()=>selectPart(id,true)); partsList.appendChild(b);
  });
}
buildPartsList();

function setActiveButton(id){
  document.querySelectorAll('.part-item').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
}

function clearHighlights(){
  Object.values(componentGroups).forEach(g=>g.traverse(o=>{
    if(o.isMesh && o.material?.emissive && o.userData._emissiveBackup){
      o.material.emissive.copy(o.userData._emissiveBackup);
      o.material.emissiveIntensity=o.userData._emissiveIntensity ?? 0;
      delete o.userData._emissiveBackup;
    }
  }));
  if(selectionBox){scene.remove(selectionBox);selectionBox.geometry?.dispose();selectionBox.material?.dispose();selectionBox=null;}
}

function highlight(id){
  clearHighlights();
  const g=componentGroups[id];
  g.traverse(o=>{
    if(o.isMesh && o.material?.emissive){
      o.userData._emissiveBackup=o.material.emissive.clone(); o.userData._emissiveIntensity=o.material.emissiveIntensity;
      o.material.emissive.setHex(0x0ac9f2); o.material.emissiveIntensity=Math.max(.35,o.material.emissiveIntensity||0);
    }
  });
  selectionBox=new THREE.BoxHelper(g,0x57e6ff); selectionBox.material.transparent=true; selectionBox.material.opacity=.38; scene.add(selectionBox);
}

function selectPart(id,focus=false){
  if(!PARTS[id]) return;
  selectedId=id; const p=PARTS[id];
  partIcon.textContent=p.icon; infoTitle.textContent=p.fa; infoEn.textContent=p.en; infoDesc.textContent=p.desc;
  infoSpecs.innerHTML=p.specs.map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  setActiveButton(id); highlight(id); if(focus) focusPart(id);
}

let cameraTween=null;
function tweenCamera(toPos,toTarget,duration=850){
  cameraTween={start:performance.now(),duration,fromPos:camera.position.clone(),toPos:toPos.clone(),fromTarget:controls.target.clone(),toTarget:toTarget.clone()};
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function focusPart(id){
  const g=componentGroups[id]; if(!g)return;
  g.updateWorldMatrix(true,true);
  const box=new THREE.Box3().setFromObject(g); const center=box.getCenter(new THREE.Vector3()); const size=box.getSize(new THREE.Vector3()).length();
  const dir=new THREE.Vector3(1,.55,1).normalize();
  const distance=Math.max(4.7,Math.min(9,size*1.55));
  tweenCamera(center.clone().add(dir.multiplyScalar(distance)),center,850);
}
function resetCamera(){tweenCamera(new THREE.Vector3(9,5.6,10.5),new THREE.Vector3(0,.15,0),900)}

focusBtn.addEventListener('click',()=>selectedId&&focusPart(selectedId));
resetBtn.addEventListener('click',resetCamera);

runBtn.addEventListener('click',()=>{
  running=!running; runBtn.classList.toggle('active',running); runBtn.setAttribute('aria-pressed',String(running));
  runBtn.querySelector('.ico').textContent=running?'▶':'❚❚';
});
explodeBtn.addEventListener('click',()=>{
  exploded=!exploded; explodeBtn.classList.toggle('active',exploded); explodeBtn.setAttribute('aria-pressed',String(exploded));
  modeReadout.textContent=exploded?'نمای انفجاری':'حالت آموزشی';
});
labelsBtn.addEventListener('click',()=>{
  labelsVisible=!labelsVisible; labelsBtn.classList.toggle('active',labelsVisible); labelsBtn.setAttribute('aria-pressed',String(labelsVisible));
  labelRenderer.domElement.classList.toggle('labels-hidden',!labelsVisible);
});
speedSlider.addEventListener('input',()=>{speed=Number(speedSlider.value)/100});

// Raycast selection
const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2();
let down={x:0,y:0};
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',e=>{
  if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointer,camera);
  const hit=raycaster.intersectObjects(componentMeshes,false)[0];
  if(hit?.object?.userData?.componentId) selectPart(hit.object.userData.componentId,false);
});

function updateExplode(){
  Object.entries(componentGroups).forEach(([id,g])=>{
    const base=g.userData.basePosition; const off=g.userData.explodeOffset;
    const target=exploded?base.clone().add(off):base;
    g.position.lerp(target,.075);
  });
}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.033); const t=performance.now()/1000;
  controls.update(); updateExplode();

  if(running){
    const omega=(.65+speed*4.6)*dt;
    rotatingGroups.forEach(g=>g.rotation.x-=omega);
  }

  const rpm=running?Math.round(300+speed*9700):0;
  rpmReadout.textContent=`${fa(rpm)} RPM`;
  emissiveWindings.forEach((m,i)=>{m.material.emissiveIntensity=.16+(running?.22+.18*Math.sin(t*5+i*.5):.03)});
  energyGroup.rotation.x+=dt*(running?.08+.18*speed:.01);
  energyGroup.children.forEach((r,i)=>r.material.opacity=(running?.12+.055*Math.sin(t*2+i):.04));
  cyan.intensity=32+(running?10*Math.sin(t*2.2):0);

  if(selectionBox) selectionBox.update();
  if(cameraTween){
    const q=Math.min(1,(performance.now()-cameraTween.start)/cameraTween.duration); const e=ease(q);
    camera.position.lerpVectors(cameraTween.fromPos,cameraTween.toPos,e); controls.target.lerpVectors(cameraTween.fromTarget,cameraTween.toTarget,e);
    if(q>=1) cameraTween=null;
  }

  renderer.render(scene,camera); labelRenderer.render(scene,camera);
}

function onResize(){
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); labelRenderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
}
addEventListener('resize',onResize);

selectPart('stator',false);
setTimeout(()=>loading.classList.add('hidden'),700);
animate();
