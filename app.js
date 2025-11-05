// Fetch all events from the backend
async function fetchEvents() {
  const res = await fetch('/api/events');
  return res.ok ? res.json() : [];
}

// Format datetime to readable string
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

// Render the event list
async function render() {
  const list = document.getElementById('events-list');
  const noEvents = document.getElementById('no-events');
  list.innerHTML = '';

  const events = await fetchEvents();

  if (!events || events.length === 0) {
    noEvents.style.display = 'block';
    return;
  }
  noEvents.style.display = 'none';

  events.forEach(ev => {
    const li = document.createElement('li');
    li.className = 'event-item';

    const left = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = ev.title;

    const meta = document.createElement('div');
    meta.className = 'event-meta';
    meta.textContent = `${formatDateTime(ev.datetime)}${ev.description ? ' — ' + ev.description : ''}`;

    left.appendChild(title);
    left.appendChild(meta);

    const right = document.createElement('div');
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm('Delete this event?')) return;
      const resp = await fetch(`/api/events/${ev.id}`, { method: 'DELETE' });
      if (resp.ok) render();
      else alert('Failed to delete event');
    });

    right.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    list.appendChild(li);
  });
}

// Handle event form submission
document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const description = document.getElementById('description').value.trim();

  if (!title || !date || !time) {
    alert('Title, date, and time are required');
    return;
  }

  const body = { title, date, time, description };

  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    document.getElementById('event-form').reset();
    render();
  } else {
    const err = await res.json();
    alert(err.error || 'Failed to create event');
  }
});

// Clear form button
document.getElementById('clear').addEventListener('click', () => {
  document.getElementById('event-form').reset();
});

// Initial render on page load
render();
