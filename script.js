document.addEventListener('DOMContentLoaded', async () => {
  const list = document.querySelector('#starred');
  const status = document.getElementById('starred-empty');

  function showStatus(message){
    if(status){
      status.textContent = message;
      status.style.display = '';
    }
  }
  function hideStatus(){ if(status) status.style.display = 'none'; }

  if(!list){
    console.error('Missing #starred element');
    return;
  }

  list.innerHTML = '';
  showStatus('Loading…');

  try{
    const res = await fetch('events.json', {cache: 'no-store'});
    if(!res.ok) throw new Error(`Network error: ${res.status}`);
    const events = await res.json();

    if(!Array.isArray(events) || events.length === 0){
      showStatus('No starred repositories found.');
      return;
    }

    hideStatus();

    for(const ev of events){
      const item = document.createElement('li');

      // support two data shapes: { name: 'owner/repo', starred: 'YYYY-MM-DD' }
      // and { repo: { owner, name, html_url, description, stargazers_count }, starred_at }
      let repoName = null;
      let repoUrl = null;
      let description = '';
      let stars = null;
      let starredAt = null;

      if(ev.repo){
        const r = ev.repo;
        repoName = `${r.owner}/${r.name}`;
        repoUrl = r.html_url || `https://github.com/${r.owner}/${r.name}`;
        description = r.description || '';
        stars = r.stargazers_count;
        starredAt = ev.starred_at || ev.starred;
      } else if(typeof ev.name === 'string'){
        repoName = ev.name;
        repoUrl = `https://github.com/${ev.name}`;
        starredAt = ev.starred;
      } else {
        // unexpected shape; skip
        console.warn('Skipping unexpected event shape', ev);
        continue;
      }

      const a = document.createElement('a');
      a.href = repoUrl || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'repo-link';

      const title = document.createElement('span');
      title.className = 'repo-name';
      title.textContent = repoName;
      a.appendChild(title);

      if(description){
        const desc = document.createElement('div');
        desc.className = 'repo-desc';
        desc.textContent = description;
        a.appendChild(desc);
      }

      const meta = document.createElement('div');
      meta.className = 'repo-meta';
      if(stars != null){
        const s = document.createElement('span');
        s.className = 'repo-stars';
        s.textContent = `★ ${stars}`;
        meta.appendChild(s);
      }
      if(starredAt){
        const t = document.createElement('time');
        t.dateTime = starredAt;
        const d = new Date(starredAt);
        t.textContent = isNaN(d) ? starredAt : d.toLocaleDateString();
        t.className = 'repo-date';
        meta.appendChild(t);
      }

      item.appendChild(a);
      item.appendChild(meta);
      list.appendChild(item);
    }

  }catch(err){
    console.error('Failed to load starred events', err);
    showStatus('Failed to load starred repositories.');
  }
});
