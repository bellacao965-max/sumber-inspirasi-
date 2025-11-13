/* app.js: Chat (GPT-3.5), YouTube paste-play, social preview via /api/preview */
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const quoteText = document.getElementById('quoteText');
const nextQuote = document.getElementById('nextQuote');
const quotes = [
  "Kerja cerdas, bukan hanya keras.",
  "Ide besar lahir dari tindakan kecil yang konsisten.",
  "Jangan menunggu inspirasi — ciptakanlah.",
  "Gagal adalah bukti bahwa kamu berani mencoba.",
  "Sederhana adalah bentuk kecanggihan tertinggi."
];
function setQuoteRandom(){ quoteText.textContent = quotes[Math.floor(Math.random()*quotes.length)]; }
setQuoteRandom();
nextQuote?.addEventListener('click', setQuoteRandom);
function appendMessage(text, role='assistant'){ const d=document.createElement('div'); d.className='chatMessage '+(role==='user'?'user':'assistant'); d.textContent=text; chatBox.appendChild(d); chatBox.scrollTop=chatBox.scrollHeight; }
let messages = [{ role:'system', text:'Kamu adalah asisten kreatif.' }];
document.getElementById('chatForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const prompt = chatInput.value.trim();
  if(!prompt) return;
  appendMessage(prompt,'user'); chatInput.value=''; appendMessage('Menunggu jawaban...','assistant');
  try{
    const res = await fetch('/api/ai/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
    const j = await res.json();
    const assists = chatBox.querySelectorAll('.chatMessage.assistant');
    if(assists.length) assists[assists.length-1].remove();
    appendMessage(j.response || j.error || 'Tidak ada balasan.','assistant');
  }catch(err){ console.error(err); appendMessage('Gagal menghubungi server: '+err.message,'assistant'); }
});
const ytInput = document.getElementById('ytInput');
const ytPlayBtn = document.getElementById('ytPlayBtn');
const ytPlayer = document.getElementById('ytPlayer');
const ytMeta = document.getElementById('ytMeta');
function extractYouTubeId(input){
  try{ const u=new URL(input); if(u.hostname.includes('youtu.be')) return u.pathname.slice(1); const v=u.searchParams.get('v'); if(v) return v; }catch(e){}; return input.trim();
}
ytPlayBtn.addEventListener('click', ()=>{
  const q = ytInput.value.trim(); if(!q) return;
  const id = extractYouTubeId(q);
  if(!id){ ytPlayer.innerHTML='ID tidak valid'; return; }
  ytPlayer.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  ytMeta.innerText = 'Memutar video: ' + id;
});
async function fetchPreview(url){
  try{ const res = await fetch('/api/preview?url='+encodeURIComponent(url)); if(!res.ok) throw new Error('Preview gagal'); return await res.json(); }catch(err){ console.error(err); return null; }
}
document.getElementById('previewTiktok').addEventListener('click', async ()=>{
  const url = document.getElementById('tiktokUrl').value.trim(); if(!url) return;
  const box = document.getElementById('tiktokPreview'); box.innerHTML='Memuat...';
  const j = await fetchPreview(url);
  if(j && j.ogImage){ box.innerHTML = `<img src="${j.ogImage}" style="max-width:100%;height:auto;display:block"><div style="padding:6px;color:#223">${j.title||''}</div>`; } else box.innerText='Tidak dapat menampilkan preview.';
});
document.getElementById('previewInsta').addEventListener('click', async ()=>{
  const url = document.getElementById('instaUrl').value.trim(); if(!url) return;
  const box = document.getElementById('instaPreview'); box.innerHTML='Memuat...';
  const j = await fetchPreview(url);
  if(j && j.ogImage){ box.innerHTML = `<img src="${j.ogImage}" style="max-width:100%;height:auto;display:block"><div style="padding:6px;color:#223">${j.title||''}</div>`; } else box.innerText='Tidak dapat menampilkan preview.';
});
