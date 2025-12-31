
// script.js — main behavior (enhanced: heatmap, beams, audit log, server pane, tour mode)

// ---------- Utilities ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Ensure AUTH_FLOW_STEPS and SCENARIOS exist (from data.js)
if (typeof window.AUTH_FLOW_STEPS === 'undefined' || typeof window.SCENARIOS === 'undefined') {
  console.error('Missing AUTH_FLOW_STEPS or SCENARIOS. Ensure data.js is loaded before script.js');
}

// ---------- Animated Grid Background ----------
(function grid() {
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  function resize() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  }
  addEventListener('resize', resize);
  resize();

  function draw() {
    t += 0.006;
    ctx.clearRect(0,0,innerWidth,innerHeight);

    const spacing = 64;
    ctx.save();
    ctx.translate(innerWidth/2, innerHeight/2);
    ctx.rotate(t * 0.28);
    ctx.translate(-innerWidth/2, -innerHeight/2);

    for (let x = -spacing; x < innerWidth + spacing; x += spacing) {
      const alpha = 0.06 + 0.04 * Math.sin((x / 120) + t * 1.2);
      ctx.beginPath();
      ctx.moveTo(x, -30);
      ctx.lineTo(x, innerHeight + 30);
      ctx.strokeStyle = `rgba(0,160,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let y = -spacing; y < innerHeight + spacing; y += spacing) {
      const alpha = 0.03 + 0.03 * Math.cos((y / 120) + t * 1.1);
      ctx.beginPath();
      ctx.moveTo(-30, y);
      ctx.lineTo(innerWidth + 30, y);
      ctx.strokeStyle = `rgba(0,160,255,${alpha * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

// ---------- Authentication Flow Demo (unchanged behavior + tour mode) ----------
(function authFlow() {
  const container = $('#flowSteps');
  const card = $('#flowCard');
  const tourBtn = $('#tourBtn');

  let index = 0;
  let playing = false;
  let intervalId = null;
  let speed = 1000;

  function renderSteps() {
    container.innerHTML = '';
    AUTH_FLOW_STEPS.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'flow-step' + (i === index ? ' active' : '');
      el.dataset.index = i;
      el.innerHTML = `<div class="step-index">${i+1}</div><div class="step-title">${s.title}</div>`;
      container.appendChild(el);
    });
    updateCard();
  }

  function updateCard() {
    const s = AUTH_FLOW_STEPS[index];
    card.innerHTML = `<strong style="color:#bfeeff">${s.title}</strong>
      <p style="margin:8px 0 0;color:var(--muted)">${s.details}</p>
      <p style="margin:8px 0 0;font-size:12px;color:var(--muted)">Zero Trust: continuous verification • Context-aware authentication • Smooth transitions</p>`;
  }

  function stepTo(i) {
    index = clamp(i, 0, AUTH_FLOW_STEPS.length - 1);
    renderSteps();
  }

  function next() {
    stepTo((index + 1) % AUTH_FLOW_STEPS.length);
  }

  function play() {
    if (playing) return;
    playing = true;
    intervalId = setInterval(next, speed);
  }

  function pause() {
    playing = false;
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  }

  // Bind controls
  $('#flowPlay').addEventListener('click', () => { play(); });
  $('#flowPause').addEventListener('click', () => { pause(); });
  $('#flowStepBack').addEventListener('click', () => { pause(); stepTo(index - 1); });
  $('#flowStepForward').addEventListener('click', () => { pause(); stepTo(index + 1); });
  $('#flowSpeed').addEventListener('input', (e) => {
    speed = Number(e.target.value);
    if (playing) { pause(); play(); }
  });

  // Tour Mode: automated interactive narrative
  let touring = false;
  async function runTour() {
    if (touring) return;
    touring = true;
    tourBtn.textContent = 'Stop Tour';
    // loop through steps with visuals
    for (let i=0;i<AUTH_FLOW_STEPS.length && touring;i++){
      stepTo(i);
      // trigger a policy beam-like event along multiple edges in risk engine
      window.triggerPolicyBeamsForStep(AUTH_FLOW_STEPS[i].title);
      window.pushAuditEvent(`${AUTH_FLOW_STEPS[i].title} — ${AUTH_FLOW_STEPS[i].details}`);
      await new Promise(r => setTimeout(r, 1700));
    }
    touring = false;
    tourBtn.textContent = 'Start Tour Mode';
  }

  tourBtn.addEventListener('click', (e) => {
    if (!touring) runTour(); else touring = false;
  });

  // Auto-start a gentle playback
  renderSteps();
  play();
  setTimeout(() => { pause(); }, 7000);
})();

// ---------- Risk Analysis Engine (enhanced visuals) ----------
(function riskEngine() {
  const netCanvas = document.getElementById('networkCanvas');
  const heatCanvas = document.getElementById('heatmapCanvas');
  const ctx = netCanvas.getContext('2d');
  const hctx = heatCanvas.getContext('2d');
  let dpr = devicePixelRatio || 1;

  function resizeCanvases() {
    const rect = netCanvas.getBoundingClientRect();
    const w = Math.max(200, rect.width);
    const h = Math.max(120, rect.height);

    [netCanvas, heatCanvas].forEach(c => {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + 'px';
      c.style.height = h + 'px';
    });

    ctx.setTransform(dpr,0,0,dpr,0,0);
    hctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // nodes & edges (same as before)
  const nodes = [
    {id:'A', x:80, y:60},
    {id:'B', x:220, y:40},
    {id:'C', x:360, y:80},
    {id:'D', x:140, y:170},
    {id:'E', x:300, y:160},
  ];
  const edges = [
    ['A','B'],['B','C'],['A','D'],['D','E'],['C','E'],['B','E']
  ];

  // packets & visual state
  const packets = [];
  const heatPoints = []; // {x,y,intensity,ttl}
  const beams = []; // {x1,y1,x2,y2,t,duration,color}

  function spawnPacket(fromNode, toNode, speed, color){
    const from = nodes.find(n=>n.id===fromNode) || nodes[Math.floor(Math.random()*nodes.length)];
    const to = nodes.find(n=>n.id===toNode) || nodes[Math.floor(Math.random()*nodes.length)];
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    packets.push({
      x: from.x,
      y: from.y,
      tx: to.x, ty: to.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: color || '#00f5ff',
      life: 1
    });
    // add heatpoint at start
    heatPoints.push({x:from.x, y:from.y, intensity:1.0, ttl: 1200});
  }

  function updatePackets(dt) {
    for (let i = packets.length -1; i>=0; i--) {
      const p = packets[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const d2 = (p.x - p.tx)*(p.x - p.tx) + (p.y - p.ty)*(p.y - p.ty);
      if (d2 < 9) {
        // on arrival, create small heatpoint and possibly a beam
        heatPoints.push({x:p.tx, y:p.ty, intensity:1.2, ttl:900});
        beams.push({
          x1: p.tx, y1: p.ty, x2: p.x + (Math.random()-0.5)*20, y2: p.y + (Math.random()-0.5)*20,
          t: performance.now(), duration: 700, color: p.color
        });
        packets.splice(i,1);
      }
    }
  }

  function drawNetwork(now) {
    ctx.clearRect(0,0,netCanvas.width/dpr, netCanvas.height/dpr);
    // edges
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    edges.forEach(e=>{
      const a = nodes.find(n=>n.id===e[0]);
      const b = nodes.find(n=>n.id===e[1]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    // nodes (pulsing)
    nodes.forEach((n,i)=>{
      const pulse = 1 + 0.06 * Math.sin(now/400 + i);
      ctx.beginPath();
      const grad = ctx.createRadialGradient(n.x-6, n.y-6, 2, n.x, n.y, 18);
      grad.addColorStop(0, 'rgba(0,245,255,0.95)');
      grad.addColorStop(0.6, 'rgba(0,160,255,0.6)');
      grad.addColorStop(1, 'rgba(3,6,8,0.12)');
      ctx.fillStyle = grad;
      ctx.arc(n.x, n.y, 8 * pulse, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '11px Inter, Arial';
      ctx.fillText(n.id, n.x-4, n.y+4);
    });

    // packets
    packets.forEach(p=>{
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // beams
    for (let i = beams.length-1;i>=0;i--){
      const b = beams[i];
      const age = performance.now() - b.t;
      if (age > b.duration) { beams.splice(i,1); continue; }
      const alpha = 1 - (age / b.duration);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Heatmap drawing (separate canvas for blur)
  function drawHeatmap(now) {
    // clear with slight fade for trails
    hctx.clearRect(0,0,heatCanvas.width/dpr, heatCanvas.height/dpr);

    // decay and draw points
    for (let i = heatPoints.length - 1; i >= 0; i--) {
      const p = heatPoints[i];
      p.ttl -= 16;
      p.intensity *= 0.985;
      if (p.ttl <= 0 || p.intensity < 0.02) { heatPoints.splice(i,1); continue; }

      const grad = hctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 60);
      const color = `rgba(0,200,255,${0.35 * p.intensity})`;
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      hctx.globalCompositeOperation = 'lighter';
      hctx.fillStyle = grad;
      hctx.beginPath();
      hctx.arc(p.x, p.y, 60, 0, Math.PI*2);
      hctx.fill();
      hctx.globalCompositeOperation = 'source-over';
    }
  }

  // Gauge helpers (same as before)
  const gaugeArc = $('#gaugeArc');
  const gaugeText = $('#gaugeText');
  const latencyLabel = $('#latencyMs');
  const scenarioDetails = $('#scenarioDetails');

  function setGauge(value) {
    const circumference = 2 * Math.PI * 40;
    const fraction = clamp(value / 100, 0, 1);
    const dash = circumference * (1 - fraction);
    gaugeArc.style.strokeDasharray = `${circumference}`;
    gaugeArc.style.strokeDashoffset = `${dash}`;
    gaugeText.textContent = Math.round(value);
    let color = '#00f5ff';
    if (value > 75) color = '#ff6b6b';
    else if (value > 45) color = '#ffb86b';
    gaugeArc.style.stroke = color;
  }

  // Audit log
  const auditLog = $('#auditLog');
  function pushAuditEvent(text) {
    if (!auditLog) return;
    const el = document.createElement('div');
    el.className = 'audit-item';
    el.textContent = text;
    auditLog.appendChild(el);
    // animate in
    requestAnimationFrame(() => {
      el.style.transform = 'translateX(0%)';
      el.style.opacity = '1';
    });
    // remove after X seconds
    setTimeout(()=> {
      el.style.transform = 'translateX(-120%)';
      el.style.opacity = '0';
      setTimeout(()=> el.remove(), 900);
    }, 4500);
    // update server stats
    const sessions = Math.max(0, Math.round(Math.random()*80 + 20));
    const alerts = Math.max(0, Math.round(Math.random()*5));
    $('#statSessions').textContent = sessions;
    $('#statAlerts').textContent = alerts;
  }
  // expose for auth tour
  window.pushAuditEvent = pushAuditEvent;

  // Expose beam trigger for tour steps
  window.triggerPolicyBeamsForStep = function(stepTitle) {
    // randomly pick few edges and create beams
    const count = 3;
    for (let i=0;i<count;i++){
      const e = edges[Math.floor(Math.random()*edges.length)];
      const a = nodes.find(n=>n.id===e[0]);
      const b = nodes.find(n=>n.id===e[1]);
      beams.push({
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        t: performance.now(), duration: 900, color: (Math.random()>0.6? '#ffb86b' : '#00f5ff')
      });
    }
  };

  // Main simulation state
  let currentScenario = SCENARIOS.safeUser;
  let last = performance.now();
  let spawnAccumulator = 0;

  function applyScenario(id) {
    currentScenario = SCENARIOS[id] || SCENARIOS.safeUser;
    $('#scenarioSelect').value = id;
    $('#packetRate').value = currentScenario.packetRate;
    scenarioDetails.innerHTML = `<strong style="color:#bfeeff">${currentScenario.title}</strong>
      <p style="margin:8px 0 0;color:var(--muted)">${currentScenario.description}</p>
      <p style="margin:8px 0 0;font-size:12px;color:var(--muted)">Anomaly Score: ${currentScenario.anomalyScore}</p>`;
    computeRiskAndApply();
    replayBurst();
  }

  function computeRiskAndApply() {
    const r = clamp(currentScenario.anomalyScore * 0.7 + currentScenario.accessLevel * 6 + Math.random()*6, 0, 100);
    setGauge(r);
    latencyLabel.textContent = String(currentScenario.expectedLatencyMs);
    // create visual beams proportional to risk
    const beamsToCreate = Math.min(6, Math.max(1, Math.round(r/20)));
    for (let i=0;i<beamsToCreate;i++){
      const e = edges[Math.floor(Math.random()*edges.length)];
      const a = nodes.find(n=>n.id===e[0]);
      const b = nodes.find(n=>n.id===e[1]);
      beams.push({
        x1: a.x + (Math.random()-0.5)*10, y1: a.y + (Math.random()-0.5)*10,
        x2: b.x + (Math.random()-0.5)*10, y2: b.y + (Math.random()-0.5)*10,
        t: performance.now(), duration: 800 + Math.random()*600,
        color: (r > 70) ? '#ff6b6b' : (r > 45 ? '#ffb86b' : '#00f5ff')
      });
    }
    pushAuditEvent(`Risk computed: ${Math.round(r)}`);
  }

  function replayBurst() {
    packets.length = 0;
    const count = clamp(currentScenario.packetRate * 2, 6, 60);
    for (let i=0;i<count;i++) {
      const from = nodes[Math.floor(Math.random()*nodes.length)].id;
      let to = nodes[Math.floor(Math.random()*nodes.length)].id;
      if (from === to) to = nodes[(Math.floor(Math.random()*(nodes.length-1))+1) % nodes.length].id;
      const speed = 0.8 + Math.random()*1.6;
      const color = (currentScenario.anomalyScore > 70) ? '#ff6b6b' : '#00f5ff';
      spawnPacket(from, to, speed, color);
    }
  }

  // Stepper / simulation loop
  function loop() {
    const now = performance.now();
    const dt = Math.min(40, now - last) / 16.666;
    last = now;

    // spawn logic
    const packetRate = Number($('#packetRate').value) || currentScenario.packetRate;
    spawnAccumulator += dt;
    const spawnInterval = Math.max(0.08, 1 / (packetRate * 0.45));
    while (spawnAccumulator > spawnInterval) {
      spawnAccumulator -= spawnInterval;
      const from = nodes[Math.floor(Math.random()*nodes.length)].id;
      let to = nodes[Math.floor(Math.random()*nodes.length)].id;
      if (from === to) continue;
      spawnPacket(from, to, 1 + Math.random()*1.6, (currentScenario.anomalyScore > 70 && Math.random() > 0.45) ? '#ff6b6b' : '#00f5ff');
    }

    updatePackets(dt);
    drawNetwork(now);
    drawHeatmap(now);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Bind UI
  $('#scenarioSelect').addEventListener('change', (e) => applyScenario(e.target.value));
  $('#packetRate').addEventListener('input', (e) => { replayBurst(); });
  $('#replayRisk').addEventListener('click', () => { computeRiskAndApply(); replayBurst(); });

  // Initialize gauge stroke-dasharray values once DOM is ready
  window.addEventListener('load', () => {
    const circumference = 2 * Math.PI * 40;
    gaugeArc.style.strokeDasharray = `${circumference}`;
    gaugeArc.style.strokeDashoffset = `${circumference}`;
    applyScenario('safeUser');
    resizeCanvases();
  });

})();
  
// ---------- Server Pane (pseudo-3D boxes) ----------
(function serverPane() {
  const canvas = $('#serverCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(200, rect.width);
    const h = Math.max(120, rect.height);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  addEventListener('resize', resize);
  resize();

  let t = 0;
  function draw() {
    t += 0.01;
    ctx.clearRect(0,0,canvas.width/dpr, canvas.height/dpr);
    // background subtle grid
    ctx.fillStyle = 'rgba(2,6,10,0.35)';
    ctx.fillRect(0,0,canvas.width/dpr, canvas.height/dpr);

    // draw rotating "server stacks"
    const cx = canvas.width/dpr / 2;
    const cy = canvas.height/dpr / 2 + 8;
    for (let i=0;i<4;i++){
      const angle = t + i*0.6;
      const x = cx + Math.cos(angle) * 24;
      const y = cy + Math.sin(angle) * 8 - i*6;
      // box shadow and glass color
      ctx.fillStyle = `rgba(0,160,255,${0.08 + i*0.06})`;
      roundRect(ctx, x-42, y-16, 84, 28, 6);
      ctx.fill();
      // lights
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x-36, y-10, 10, 6);
      ctx.fillRect(x-12, y-10, 10, 6);
      ctx.fillRect(x+12, y-10, 10, 6);
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
})();