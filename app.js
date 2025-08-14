async function fetchBulletin() {
  const api = new URLSearchParams(window.location.search).get('api') || '/api/v1/bulletin/latest';
  try {
    const r = await fetch(api, {cache:'no-store'});
    if (!r.ok) throw new Error('API not available, using sample');
    return await r.json();
  } catch (e) {
    const r = await fetch('../backend/sample_bulletin.json');
    return await r.json();
  }
}

function badge(label, cls) {
  return `<span class="badge ${cls||''}">${label}</span>`;
}
function tierBadge(t) {
  const cls = t===1?'t1':t===2?'t2':t===3?'t3':'t4';
  return badge('T'+t, cls);
}
function tagBadges(tags) {
  if (!tags) return '';
  return tags.map(t => badge(t)).join('');
}
function renderCard(item) {
  return `<div class="card" data-tags="${(item.topic_tags||[]).join(',')}">
    <h3><a href="${item.source_url}" target="_blank" rel="noopener">${item.title}</a></h3>
    <div class="badges">
      ${tierBadge(item.reliability_tier || 3)}
      ${badge(item.status)}
      ${item.effective_date ? badge('effective '+item.effective_date) : ''}
      ${tagBadges(item.topic_tags || [])}
    </div>
    <p class="summary">${item.summary || ''}</p>
    <p class="meta"><strong>Legal:</strong> ${(item.so_what && item.so_what['Legal']) || '—'}<br>
    <strong>Compliance:</strong> ${(item.so_what && item.so_what['Compliance']) || '—'}<br>
    <strong>Mandate Compliance:</strong> ${(item.so_what && item.so_what['Mandate Compliance']) || '—'}</p>
  </div>`;
}

function applyFilter(tag) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => {
    const has = (c.getAttribute('data-tags') || '').split(',').includes(tag) || tag=='';
    c.style.display = has ? '' : 'none';
  });
}

(async () => {
  const data = await fetchBulletin();
  document.getElementById('meta').innerHTML = `<div class="meta">Week of <strong>${data.week_of}</strong> — ${data.items_authoritative.length} authoritative change(s), ${data.items_signals.length} signal(s).</div>`;

  const auth = document.getElementById('authoritative');
  data.items_authoritative.forEach(i => auth.insertAdjacentHTML('beforeend', renderCard(i)));
  const sig = document.getElementById('signals');
  data.items_signals.forEach(i => sig.insertAdjacentHTML('beforeend', renderCard(i)));

  document.getElementById('filter').addEventListener('change', e => applyFilter(e.target.value));
  document.getElementById('printBtn').addEventListener('click', () => window.print());
})();
