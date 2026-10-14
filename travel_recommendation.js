// Time zones for each recommended place (Task 10)
const TIME_ZONES = {
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'tokyo': 'Asia/Tokyo',
  'kyoto': 'Asia/Tokyo',
  'rio de janeiro': 'America/Sao_Paulo',
  'são paulo': 'America/Sao_Paulo',
  'angkor wat': 'Asia/Phnom_Penh',
  'taj mahal': 'Asia/Kolkata',
  'bora bora': 'Pacific/Tahiti',
  'copacabana': 'America/Sao_Paulo'
};

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsEl = document.getElementById('results');

let travelData = null;
let clockTimer = null;

// Tasks 6: fetch the JSON data
fetch('travel_recommendation.json')
  .then(res => res.json())
  .then(data => {
    travelData = data;
    console.log('Travel data loaded:', data);
  })
  .catch(err => console.error('Error fetching travel data:', err));

function getTimeZone(name) {
  const key = Object.keys(TIME_ZONES).find(k => name.toLowerCase().includes(k));
  return key ? TIME_ZONES[key] : null;
}

function formatTime(tz) {
  const options = { timeZone: tz, hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Date().toLocaleTimeString('en-US', options);
}

// Tasks 7 & 8: keyword matching
function findRecommendations(rawKeyword) {
  const keyword = rawKeyword.trim().toLowerCase();
  if (!keyword || !travelData) return [];

  const allCities = travelData.countries.flatMap(c => c.cities);

  if (keyword === 'beach' || keyword === 'beaches') return travelData.beaches;
  if (keyword === 'temple' || keyword === 'temples') return travelData.temples;
  if (keyword === 'country' || keyword === 'countries') return allCities;

  // Also allow a specific country name (e.g. "japan") or a city/place name
  const country = travelData.countries.find(c => c.name.toLowerCase() === keyword);
  if (country) return country.cities;

  return [...allCities, ...travelData.temples, ...travelData.beaches]
    .filter(p => p.name.toLowerCase().includes(keyword));
}

function renderResults(items) {
  resultsEl.innerHTML = '';
  if (items.length === 0) {
    resultsEl.innerHTML = '<p class="no-results">No recommendations found. Try "beach", "temple" or "country".</p>';
    return;
  }

  items.forEach(item => {
    const tz = getTimeZone(item.name);
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" onerror="this.removeAttribute('src')">
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${tz ? `<p class="time" data-tz="${tz}">Local time: ${formatTime(tz)}</p>` : ''}
      </div>`;
    resultsEl.appendChild(card);
  });

  startClock();
}

function startClock() {
  stopClock();
  clockTimer = setInterval(() => {
    document.querySelectorAll('.time').forEach(el => {
      el.textContent = 'Local time: ' + formatTime(el.dataset.tz);
    });
  }, 1000);
}

function stopClock() {
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
}

// Search runs only on button click
searchBtn.addEventListener('click', () => {
  const items = findRecommendations(searchInput.value);
  console.log('Search results:', items);
  if (!searchInput.value.trim()) return;
  renderResults(items);
});

// Task 9: clear results
function clearResults() {
  stopClock();
  resultsEl.innerHTML = '';
  searchInput.value = '';
}
resetBtn.addEventListener('click', clearResults);
