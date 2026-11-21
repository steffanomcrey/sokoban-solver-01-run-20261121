import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
const D=[[0,-1,'u'],[0,1,'d'],[-1,0,'l'],[1,0,'r']];
function solve(L){
 const R=L.split('\n');while(R.length&&R[R.length-1]==='')R.pop();
 const H=R.length,W=Math.max(...R.map(r=>r.length));
 const c=(x,y)=>y<0||y>=H||x<0||x>=W?'#':(R[y][x]??' ');
 const wall=(x,y)=>c(x,y)==='#',goal=(x,y)=>'.+*'.includes(c(x,y)),isBox=(x,y)=>'$*'.includes(c(x,y));
 const id=(x,y)=>y*W+x,xy=i=>[i%W,(i/W)|0];
 let px=0,py=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if('@+'.includes(c(x,y))){px=x;py=y}
 const hy=py,boxes=new Set();
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(isBox(x,y))boxes.add(id(x,y));
 const fl=(p,bs,ok)=>{const m=new Map([[p,[-1,'']]]),q=[p];
  for(let h=0;h<q.length;h++){const i=q[h],[x,y]=xy(i);
   for(const[ax,ay,cc]of D){const j=id(x+ax,y+ay);
    if(!m.has(j)&&ok(j)&&!bs.has(j)){m.set(j,[i,cc]);q.push(j)}}}return m};
 const back=(m,t)=>{let s='',k=t;while(m.get(k)[0]>=0){s=m.get(k)[1]+s;k=m.get(k)[0]}return s};
 const dead=(bs,gs)=>{for(const b of bs){if(gs.has(b))continue;const[x,y]=xy(b);
   const u=wall(x,y-1),d=wall(x,y+1),l=wall(x-1,y),r=wall(x+1,y);
   if(u&&l||u&&r||d&&l||d&&r)return 1;
   for(const[ox,oy]of[[-1,-1],[0,-1],[-1,0],[0,0]]){const q=[[x+ox,y+oy],[x+ox+1,y+oy],[x+ox,y+oy+1],[x+ox+1,y+oy+1]];
    if(q.every(([sx,sy])=>wall(sx,sy)||bs.has(id(sx,sy)))&&q.some(([sx,sy])=>bs.has(id(sx,sy))&&!gs.has(id(sx,sy))))return 1}}return 0};
 const doors=[];
 for(const dy of[-1,1])for(let x=0;x<W;x++)if(!wall(x,hy+dy)&&!wall(x,hy))doors.push([x,hy+dy]);
 let cur=id(px,py),out='';
 const rooms=doors.map(([dx,dy])=>{
  const seen=new Set([id(dx,dy)]),st=[id(dx,dy)];
  while(st.length){const i=st.pop(),[x,y]=xy(i);
   for(const[ax,ay]of D){const nx=x+ax,ny=y+ay;
    if(ny!==hy&&!wall(nx,ny)&&!seen.has(id(nx,ny))){seen.add(id(nx,ny));st.push(id(nx,ny));}}}
  const cells=[...seen];
  return{cells:new Set(cells),bs:cells.filter(i=>boxes.has(i)),gs:new Set(cells.filter(i=>goal(...xy(i)))),door:id(dx,dy),ent:id(dx,hy)}});
 rooms.sort((a,b)=>Math.abs(xy(a.ent)[0]-px)-Math.abs(xy(b.ent)[0]-px));
 for(const rm of rooms){
  const walk=new Set([...rm.cells,rm.ent]),ok=j=>walk.has(j);
  const bs0=[...rm.bs].sort((a,b)=>a-b);
  const key=(bb,p)=>bb.join()+ '|'+Math.min(...fl(p,new Set(bb),ok).keys());
  const st=[{b:bs0,p:rm.ent,par:-1,e:''}],seen=new Map([[key(bs0,rm.ent),0]]);
  let fin=-1;
  for(let h=0;h<st.length;h++){const s=st[h],S=new Set(s.b),m=fl(s.p,S,ok);
   if(s.b.every(b=>rm.gs.has(b))){if(m.has(rm.door)||m.has(rm.ent)){fin=h;break}continue}
   for(const b of s.b){const[bx,by]=xy(b);
    for(const[ax,ay,cc]of D){const be=id(bx-ax,by-ay),tg=id(bx+ax,by+ay);
     if(!m.has(be)||!rm.cells.has(tg)||S.has(tg))continue;
     const nb=[...s.b];nb[nb.indexOf(b)]=tg;nb.sort((a,b)=>a-b);
     if(dead(new Set(nb),rm.gs))continue;
     const k=key(nb,b);if(seen.has(k))continue;
     seen.set(k,st.length);st.push({b:nb,p:b,par:h,e:back(m,be)+cc});}}}
  if(fin<0)return'';
  const parts=[];let k=fin;while(k>0){parts.push(st[k].e);k=st[k].par}parts.reverse();
  const m2=fl(cur,boxes,j=>!wall(...xy(j)));
  if(!m2.has(rm.ent))return'';
  out+=back(m2,rm.ent)+parts.join('');
  for(const b of rm.bs)boxes.delete(b);
  for(const g of rm.gs)boxes.add(g);
  cur=st[fin].p;
 }
 return out;
}
for(const id of readdirSync(I).sort()){
 const m=solve(readFileSync(join(I,id,'level.txt'),'utf8'));
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'solution.txt'),m+'\n');
}
