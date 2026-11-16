/* Original, lightweight vector schematics. Coordinates describe each movement's two key positions. */
function exerciseFigure(pose,phase=0,decorative=false,description='Posizione illustrata'){
 const standing={head:[112,24],torso:[[112,43],[106,100]],legs:[[[106,100],[101,132],[96,163]],[[106,100],[121,131],[128,163]]],arms:[[[112,47],[129,73],[134,100]],[[112,47],[98,74],[97,99]]]};
 const squat={head:[144,46],torso:[[137,65],[91,109]],legs:[[[91,109],[140,118],[121,163]],[[91,109],[124,124],[108,163]]],arms:[[[137,66],[113,76],[117,54]],[[137,66],[156,80],[154,55]]]};
 const splitUp={head:[112,24],torso:[[112,43],[111,96]],legs:[[[111,96],[147,124],[164,163]],[[111,96],[81,124],[63,163]]],arms:[[[112,47],[132,69],[118,92]],[[112,47],[94,68],[108,91]]]};
 const splitDown={head:[124,53],torso:[[124,72],[119,121]],legs:[[[119,121],[165,121],[165,163]],[[119,121],[75,154],[60,163]]],arms:[[[124,76],[142,98],[123,113]],[[124,76],[105,97],[120,113]]]};
 const hinge={head:[169,64],torso:[[151,73],[88,104]],legs:[[[88,104],[111,130],[104,163]],[[88,104],[99,134],[96,163]]],arms:[[[151,76],[147,109],[143,140]],[[151,76],[136,107],[132,140]]]};
 const bench={head:[43,112],torso:[[64,115],[135,116]],legs:[[[135,116],[164,138],[165,163]],[[135,116],[153,139],[153,163]]],arms:phase?[[[70,115],[72,78],[74,40]],[[70,115],[88,77],[88,40]]]:[[[70,115],[103,130],[101,87]],[[70,115],[84,131],[89,87]]]};
 const row={...hinge,arms:phase?[[[151,76],[113,64],[105,102]],[[151,76],[130,64],[120,101]]]:[[[151,76],[151,108],[151,139]],[[151,76],[136,106],[135,137]]]};
 const plank={head:[46,102],torso:[[65,111],[139,132]],legs:[[[139,132],[175,146],[207,160]],[[139,132],[170,145],[199,160]]],arms:[[[65,111],[65,157],[37,158]],[[65,111],[76,157],[49,158]]]};
 const curl={head:[47,103],torso:[[67,111],[130,111]],legs:phase?[[[130,111],[169,114],[152,71]],[[130,111],[161,114],[143,75]]]:[[[130,111],[169,114],[209,120]],[[130,111],[164,117],[203,124]]],arms:[[[67,111],[80,137],[49,137]],[[67,111],[91,130],[60,135]]]};
 const dead={head:[43,147],torso:[[63,151],[127,151]],legs:phase?[[[127,151],[168,154],[205,155]],[[127,151],[137,108],[176,109]]]:[[[127,151],[132,106],[175,106]],[[127,151],[143,112],[184,112]]],arms:phase?[[[67,151],[44,127],[14,119]],[[67,151],[73,112],[75,81]]]:[[[67,151],[70,112],[72,80]],[[67,151],[82,115],[88,84]]]};
 const warm={...standing,legs:phase?[[[106,100],[133,112],[151,132]],[[106,100],[104,131],[104,163]]]:standing.legs,arms:phase?[[[112,47],[143,38],[164,19]],[[112,47],[88,61],[65,57]]]:standing.arms};
 const ankle={...splitUp,head:phase?[136,31]:[124,28],torso:phase?[[134,50],[118,99]]:[[124,47],[112,98]],legs:phase?[[[118,99],[165,124],[151,163]],[[118,99],[84,128],[65,163]]]:[[[112,98],[144,123],[151,163]],[[112,98],[87,130],[65,163]]],arms:[[[130,53],[154,70],[177,69]],[[130,53],[149,66],[177,65]]]};
 let p=pose==='squat'?(phase?squat:standing):pose==='hinge'?(phase?hinge:standing):pose==='bench'?bench:pose==='row'?row:pose==='lunge'?(phase?splitDown:standing):pose==='split'?(phase?splitDown:splitUp):pose==='plank'?plank:pose==='curl'?curl:pose==='deadbug'?dead:pose==='warmup'?warm:pose==='ankle'?ankle:standing;
 const line=(points,klass='')=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" class="${klass}"/>`;
 const limbs=(parts,klass)=>parts.map((v,i)=>line(v,klass+(i?' figure-far':''))).join('');
 let equipment='';
 if(pose==='bench'||pose==='curl')equipment=`<g class="figure-equipment"><path d="M30 126h113m-95 1v37m79-37v37"/>${pose==='curl'?'<path d="M143 126h38m-11 0v38"/>':''}</g>`;
 if(pose==='squat')equipment+=`<g class="figure-weight"><path d="M${phase?109:87} ${phase?59:49}h65"/><rect x="${phase?111:89}" y="${phase?48:38}" width="9" height="23" rx="2"/><rect x="${phase?160:138}" y="${phase?48:38}" width="9" height="23" rx="2"/></g>`;
 if(pose==='bench'){const y=phase?40:87;equipment+=`<g class="figure-weight"><path d="M49 ${y}h72"/><rect x="51" y="${y-10}" width="9" height="20" rx="2"/><rect x="109" y="${y-10}" width="9" height="20" rx="2"/></g>`;}
 if(pose==='row'||pose==='hinge'){const hands=p.arms.map(a=>a[2]);equipment+=`<g class="figure-weight">${hands.map(([x,y])=>`<path d="M${x-11} ${y}h22"/><path d="M${x-9} ${y-5}v10m18-10v10"/>`).join('')}</g>`;}
 if(pose==='curl')equipment+=`<g class="figure-weight"><path d="M${phase?137:194} ${phase?73:119}l17 -3"/></g>`;
 if(pose==='ankle')equipment+='<path class="figure-equipment" d="M183 24v140"/>';
 const ghost=pose==='plank'&&phase?'<path class="figure-alignment" d="M34 96 212 162"/>':'';
 const cue=pose==='plank'?(phase?'Corpo allineato':'Gomiti sotto le spalle'):pose==='hinge'&&phase?'Anche indietro':pose==='squat'&&phase?'Piedi appoggiati':pose==='deadbug'&&phase?'Tronco stabile':'';
 return `<svg class="exercise-figure" viewBox="0 0 240 188" ${decorative?'aria-hidden="true"':`role="img" aria-label="${String(description).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}"`}><path class="figure-floor" d="M17 165h206"/>${equipment}<g class="figure-person">${limbs(p.legs,'figure-leg')}${line(p.torso,'figure-torso')}${limbs(p.arms,'figure-arm')}<circle class="figure-head" cx="${p.head[0]}" cy="${p.head[1]}" r="10"/>${p.legs.map(v=>`<circle class="figure-joint" cx="${v[1][0]}" cy="${v[1][1]}" r="3"/>`).join('')}</g>${ghost}${cue?`<text x="120" y="184" class="figure-caption">${cue}</text>`:''}</svg>`;
}
