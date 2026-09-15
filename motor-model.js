import * as THREE from 'three';

const D=Math.PI/180;
function physical(c,m=.5,r=.35,x={}){return new THREE.MeshPhysicalMaterial({color:c,metalness:m,roughness:r,clearcoat:.18,clearcoatRoughness:.3,...x})}
function noise(){const c=document.createElement('canvas');c.width=c.height=192;const q=c.getContext('2d'),im=q.createImageData(192,192);for(let i=0;i<im.data.length;i+=4){const v=150+Math.random()*90;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}q.putImageData(im,0,0);q.globalAlpha=.18;q.fillStyle='#fff';for(let y=0;y<192;y+=3)q.fillRect(0,y,192,1);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,2);return t}
const n=noise();
const M={
 cast:physical(0x8b9698,.82,.39,{roughnessMap:n}),dark:physical(0x424b4e,.86,.32,{roughnessMap:n}),cut:physical(0x8fa7aa,.82,.28,{transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide,roughnessMap:n}),lam:physical(0x30383e,.92,.29,{roughnessMap:n}),edge:physical(0x606b70,.88,.34),cu:physical(0xc56f2f,.82,.24,{clearcoat:.42}),cu2:physical(0x7f3d1c,.78,.3),shaft:physical(0xb6c0c4,.97,.18,{roughnessMap:n}),bearing:physical(0xcbd1d4,.96,.16),magN:physical(0xb92d3d,.72,.27),magS:physical(0x2269a6,.72,.27),cool:physical(0x26c9ff,.1,.12,{transparent:true,opacity:.36,transmission:.45,thickness:.25,emissive:0x0a6d99,emissiveIntensity:.24,depthWrite:false}),orange:physical(0xf47a24,.28,.32),poly:physical(0x12181c,.08,.48),cer:physical(0xd8d7ca,.12,.32),pcb:physical(0x174b38,.05,.62),blue:physical(0x2bdfff,.4,.25,{emissive:0x0b6e87,emissiveIntensity:.35})
};
function me(g,m,c=true,r=true){const o=new THREE.Mesh(g,m);o.castShadow=c;o.receiveShadow=r;return o}
function cy(r1,r2,l,s=64,m=M.lam,open=false,a=0,arc=Math.PI*2){const o=me(new THREE.CylinderGeometry(r1,r2,l,s,1,open,a,arc),m);o.rotation.z=Math.PI/2;return o}
function to(r,t,m=M.lam,rs=16,ts=96,arc=Math.PI*2){const o=me(new THREE.TorusGeometry(r,t,rs,ts,arc),m);o.rotation.y=Math.PI/2;return o}
function bx(x,y,z,m=M.lam){return me(new THREE.BoxGeometry(x,y,z),m)}
function bolt(s=.1,l=.24){const g=new THREE.Group(),b=cy(s*.45,s*.45,l,12,M.shaft),h=cy(s,s,.07,6,M.bearing);h.position.x=l/2+.03;g.add(b,h);return g}
function tube(p,r,m,seg=48,rad=8){return me(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),seg,r,rad,false),m)}

export function buildMotor(PARTS){
 const root=new THREE.Group();root.rotation.z=-2*D;
 const groups={},meshes=[],rotating=[],emissive=[],field=[];
 function reg(id,g,ray=true){g.name=id;g.userData.componentId=id;g.userData.basePosition=g.position.clone();g.userData.explodeOffset=new THREE.Vector3(...PARTS[id].explode);groups[id]=g;g.traverse(o=>{if(o.isMesh){o.userData.componentId=id;if(ray&&!o.userData.skipRaycast)meshes.push(o)}});root.add(g);return g}
 // Housing
 const h=new THREE.Group();const shell=cy(3.28,3.28,4.9,96,M.cut,true,30*D,278*D);shell.userData.skipRaycast=true;h.add(shell);
 [-2.42,2.42].forEach(x=>{const f=to(3.28,.23,M.cast,20,128);f.position.x=x;h.add(f);const inn=to(2.83,.10,M.dark,16,96);inn.position.x=x+(x<0?.12:-.12);h.add(inn);for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=bolt(.13,.24);b.position.set(x+(x<0?-.13:.13),Math.cos(a)*3.03,Math.sin(a)*3.03);b.rotation.x=a;h.add(b)}});
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2;if(a<1.02)continue;const r=bx(4.25,.12,.30,M.cast);r.position.set(0,Math.cos(a)*3.23,Math.sin(a)*3.23);r.rotation.x=a;h.add(r)}
 const bl=cy(3.1,2.92,.34,96,M.cast,true),br=bl.clone();bl.position.x=-2.58;br.position.x=2.58;h.add(bl,br);
 [-1.55,1.55].forEach(x=>{const neck=bx(.72,.62,1.05,M.cast),foot=bx(1.18,.18,1.55,M.cast);neck.position.set(x,-3.18,0);foot.position.set(x,-3.5,0);h.add(neck,foot)});reg('housing',h);
 // Stator laminations + 48 teeth
 const s=new THREE.Group();for(let i=0;i<34;i++){const r=to(2.68,.29,i%4?M.lam:M.edge,10,96);r.position.x=-1.82+i*(3.64/33);s.add(r)}
 for(let i=0;i<48;i++){const a=i/48*Math.PI*2,t=bx(3.74,.62,.16,i%2?M.lam:M.edge),liner=bx(3.82,.12,.20,physical(0xd8c893,.05,.62));t.position.set(0,Math.cos(a)*2.23,Math.sin(a)*2.23);t.rotation.x=a;liner.position.set(0,Math.cos(a)*1.93,Math.sin(a)*1.93);liner.rotation.x=a;s.add(t,liner)}reg('stator',s);
 // Windings
 const w=new THREE.Group(),pm=[physical(0xd87931,.8,.23,{emissive:0x5a1d05,emissiveIntensity:.12}),physical(0xc45a27,.8,.23,{emissive:0x3e1004,emissiveIntensity:.12}),physical(0xef9a4a,.8,.23,{emissive:0x6a2808,emissiveIntensity:.12})];
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,p=i%3;[-.075,.075].forEach(d=>{const b=bx(3.58,.16,.105,pm[p]);b.position.set(0,Math.cos(a)*(1.93+d),Math.sin(a)*(1.93+d));b.rotation.x=a;w.add(b);emissive.push(b)});[-1.94,1.94].forEach(x=>{const e=to(1.95,.075,pm[p],8,40,Math.PI/3);e.position.x=x;e.rotation.x=a+Math.PI/2;e.rotation.z=(i%2?1:-1)*.42;e.position.y=Math.cos(a)*.18;e.position.z=Math.sin(a)*.18;w.add(e);emissive.push(e)})}reg('windings',w);
 // Rotor stack
 const r=new THREE.Group();for(let i=0;i<42;i++){const d=cy(1.52,1.52,.055,72,i%5?M.lam:M.edge);d.position.x=-1.63+i*(3.26/41);r.add(d)}[-1.72,1.72].forEach(x=>{const p=cy(1.47,1.47,.12,72,M.dark);p.position.x=x;r.add(p);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,v=cy(.075,.075,.16,16,M.poly);v.position.set(x,Math.cos(a)*1.18,Math.sin(a)*1.18);r.add(v)}});for(let p=0;p<8;p++){const a=p/8*Math.PI*2;[-.22,.22].forEach(o=>{const b=bx(3.16,.10,.62,M.poly);b.position.set(0,Math.cos(a+o)*.84,Math.sin(a+o)*.84);b.rotation.x=a+o;r.add(b)})}rotating.push(r);reg('rotor',r);
 // Buried magnets
 const mg=new THREE.Group();for(let p=0;p<8;p++){const a=p/8*Math.PI*2;[-.19,.19].forEach((sp,j)=>{const an=a+sp,b=bx(3,.22,.62,(p+j)%2?M.magN:M.magS),c=bx(3.04,.035,.66,M.edge);b.position.set(0,Math.cos(an)*.91,Math.sin(an)*.91);b.rotation.x=an;c.position.copy(b.position);c.rotation.copy(b.rotation);c.translateY(.13);mg.add(b,c)})}rotating.push(mg);reg('magnets',mg);
 // Shaft + splines
 const sh=new THREE.Group();sh.add(cy(.36,.36,7.65,64,M.shaft));[-2.12,2.12].forEach(x=>{const q=cy(.48,.48,.78,64,M.shaft);q.position.x=x;sh.add(q)});for(let i=0;i<18;i++){const a=i/18*Math.PI*2,z=bx(1.18,.055,.1,M.shaft);z.position.set(3.67,Math.cos(a)*.39,Math.sin(a)*.39);z.rotation.x=a;sh.add(z)}rotating.push(sh);reg('shaft',sh);
 // Bearings
 const bg=new THREE.Group();[-2.48,2.48].forEach(x=>{const a=new THREE.Group();a.position.x=x;a.add(to(.74,.16,M.bearing,16,64),to(.48,.1,M.bearing,16,64));for(let i=0;i<14;i++){const ang=i/14*Math.PI*2,b=me(new THREE.SphereGeometry(.105,16,12),M.bearing);b.position.set(0,Math.cos(ang)*.61,Math.sin(ang)*.61);a.add(b)}bg.add(a)});reg('bearings',bg);
 // Cooling jacket
 const cg=new THREE.Group();for(let i=0;i<9;i++){const q=to(3,.075,M.cool,10,96);q.position.x=-1.8+i*.45;cg.add(q)}[1,-1].forEach(sign=>{const p=[];for(let i=0;i<9;i++)p.push(new THREE.Vector3(-1.8+i*.45,sign*2.9,-.63));cg.add(tube(p,.085,M.cool))});cg.add(tube([new THREE.Vector3(-1.7,2.88,-.63),new THREE.Vector3(-2,3.18,-.72),new THREE.Vector3(-2.35,3.55,-.78)],.13,M.cool),tube([new THREE.Vector3(1.7,-2.88,-.63),new THREE.Vector3(2.05,-3.12,-.8),new THREE.Vector3(2.38,-3.42,-.88)],.13,M.cool));reg('cooling',cg);
 // Resolver
 const eg=new THREE.Group(),eb=cy(1.05,1.05,.34,72,M.dark),er=to(.77,.13,M.cu2,12,64),ec=cy(.55,.55,.16,48,M.shaft);eb.position.x=-3.05;er.position.x=-3.25;ec.position.x=-3.26;eg.add(eb,er,ec);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,t=bx(.18,.18,.1,M.edge);t.position.set(-3.36,Math.cos(a)*.68,Math.sin(a)*.68);t.rotation.x=a;eg.add(t)}reg('encoder',eg);
 // U/V/W terminal box
 const tg=new THREE.Group(),tb=bx(1.95,.34,1.42,M.dark),tc=bx(2.02,.18,1.5,physical(0x677579,.72,.38,{transparent:true,opacity:.72}));tb.position.set(-.55,3.25,.1);tc.position.set(-.55,3.5,.1);tg.add(tb,tc);[-.52,0,.52].forEach(z=>{const ins=cy(.19,.19,.48,32,M.cer),stud=cy(.07,.07,.74,20,M.cu),nut=cy(.13,.13,.1,6,M.bearing),bus=bx(1.55,.07,.18,M.cu);ins.rotation.z=stud.rotation.z=nut.rotation.z=0;ins.position.set(-.55,3.44,z);stud.position.set(-.55,3.56,z);nut.position.set(-.55,3.86,z);bus.position.set(.1,3.25,z);tg.add(ins,stud,nut,bus)});reg('terminals',tg);
 // Temperature sensor
 const sn=new THREE.Group(),pr=cy(.08,.08,.74,20,physical(0xb8c4c9,.85,.2)),hd=bx(.3,.2,.26,M.poly);pr.rotation.z=0;pr.position.set(.2,-2,1.65);hd.position.set(.2,-2.38,1.65);sn.add(pr,hd,tube([new THREE.Vector3(.2,-2.48,1.65),new THREE.Vector3(.55,-2.75,1.9),new THREE.Vector3(1.05,-2.55,2.2)],.035,physical(0x181d20,.05,.7),26,7));reg('sensor',sn);
 // Inverter
 const iv=new THREE.Group(),ib=bx(3.55,.42,2.45,M.cast),ic=bx(3.35,.95,2.25,M.dark);ib.position.set(.45,3.8,-1.45);ic.position.set(.45,4.42,-1.45);iv.add(ib,ic);for(let i=0;i<17;i++){const f=bx(.08,.55,2.1,M.cast);f.position.set(-1.1+i*.195,5.15,-1.45);iv.add(f)}const pcb=bx(2.45,.05,1.48,M.pcb);pcb.position.set(.25,4.94,-1.45);iv.add(pcb);for(let rr=0;rr<2;rr++)for(let c=0;c<3;c++){const mo=bx(.48,.12,.48,physical(0x23282c,.28,.35));mo.position.set(-.55+c*.76,5.03,-1.82+rr*.75);iv.add(mo)}const dc=bx(.72,.62,.92,M.orange);dc.position.set(2.05,4.28,-1.45);iv.add(dc);[-.34,0,.34].forEach((z,i)=>iv.add(tube([new THREE.Vector3(-1+i*.28,3.92,-.65+z),new THREE.Vector3(-.8+i*.2,3.55,-.2+z),new THREE.Vector3(-.55,3.25,z)],.07,M.cu,28,8)));reg('inverter',iv);
 // Non-clickable 3-phase field particles
 const fg=new THREE.Group();root.add(fg);const cols=[0x48e9ff,0xff5cc9,0xffc95c];for(let p=0;p<3;p++)for(let i=0;i<10;i++){const a=i/10*Math.PI*2+p*Math.PI*2/3,d=me(new THREE.SphereGeometry(.055,12,8),new THREE.MeshBasicMaterial({color:cols[p],transparent:true,opacity:.55}),false,false);d.position.set(-1.6+i*.35,Math.cos(a)*1.72,Math.sin(a)*1.72);fg.add(d);field.push({dot:d,phase:p,angle:a})}
 return {root,groups,meshes,rotating,emissive,field};
}
