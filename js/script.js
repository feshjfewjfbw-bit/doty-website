document.addEventListener('DOMContentLoaded', function() {
    // Default hero data in case JSON fails to load
    const defaultHeroes = [
        {
            id: 1, name: "Anti-Mage", primaryAttr: "agi",
            roles: ["Carry", "Escape"],
            abilities: ["Mana Break", "Blink", "Spell Shield", "Mana Void"],
            lore: "A hero who breaks mana and blinks away from danger."
        },
        {
            id: 2, name: "Sven", primaryAttr: "str",
            roles: ["Offlane", "Durable"],
            abilities: ["Storm Hammer", "God Strength", "Warcry", "Silver Edge"],
            lore: "A mighty warrior inspired by legendary strength."
        },
        {
            id: 3, name: "Dragon Knight", primaryAttr: "str",
            roles: ["Fighter", "Carry"],
            abilities: ["Dragon Form", "Fire Breath", "Dragon's Blood", "Splash Damage"],
            lore: "A warrior who can transform into a dragon."
        }
    ];

    // Load heroes data
    fetch('heroes.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            window.allHeroes = data.heroes || defaultHeroes;
            window.filteredHeroes = [...(window.allHeroes || defaultHeroes)];

            // Check for hero detail in URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const heroId = urlParams.get('id');

            if (heroId) {
                // Show hero detail for the specified ID
                const hero = window.allHeroes.find(h => h.id == heroId);
                if (hero) {
                    renderHeroDetail(hero);
                    return;
                }
            }

            // Initialize: render grid and filters
            renderHeroGrid(filteredHeroes);
            setupFilters(window.allHeroes || defaultHeroes);
            setupHeroDetailHandlers(window.allHeroes || defaultHeroes);
        })
        .catch(err => {
            console.error('Failed to load heroes data, using fallback:', err);
            // Use default heroes as fallback
            window.allHeroes = defaultHeroes;
            window.filteredHeroes = [...defaultHeroes];

            // Initialize with default heroes
            renderHeroGrid(filteredHeroes);
            setupFilters(defaultHeroes);
            setupHeroDetailHandlers(defaultHeroes);
        });
});

function renderHeroGrid(heroes) {
    const grid = document.querySelector('.hero-grid');
    if (!grid) return;

    grid.innerHTML = heroes.map((hero, index) => `
        <div class="hero-card" data-id="${hero.id}" data-attr="${hero.primaryAttr}" data-name="${hero.name}">
            <img src="${hero.photo}" alt="${hero.name}" class="hero-card-img">
            <h3>${hero.name}</h3>
            <div class="attr">Attribute: ${getAttrLabel(hero.primaryAttr)}</div>
            <div class="abilities">
                ${hero.abilities.map(abil => `<span class="ability">${abil}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function getAttrLabel(attr) {
    const labels = { 'str': 'Strength', 'agi': 'Agility', 'int': 'Intelligence' };
    return labels[attr] || attr;
}

function setupFilters(allHeroes) {
    // Create filter buttons
    const uniqueAttrs = [...new Set(allHeroes.map(h => h.primaryAttr))];
    const filterContainer = document.querySelector('.grid-filter');

    if (!filterContainer) return;

    // Always show filter buttons, even if no heroes
    filterContainer.innerHTML = uniqueAttrs.map(attr => `
        <button class="filter-btn" data-attr="${attr}">
            ${getAttrLabel(attr)}
        </button>
    `).join('');

    // Add click handlers
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter heroes
            const attr = this.getAttribute('data-attr');
            if (attr === 'all') {
                filteredHeroes = [...allHeroes];
            } else {
                filteredHeroes = allHeroes.filter(h => h.primaryAttr === attr);
            }

            renderHeroGrid(filteredHeroes);
        });
    });
}

function setupHeroDetailHandlers(heroes) {
    // Handle hero card clicks for detail page
    document.querySelectorAll('.hero-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking on ability spans
            if (e.target.className === 'ability' || e.target.parentElement.className === 'ability') return;

            const heroId = this.getAttribute('data-id');
            openHeroDetail(heroId);
        });
    });
}

function openHeroDetail(heroId) {
    const hero = window.allHeroes.find(h => h.id == heroId);
    if (!hero) return;

    // Update URL with hero id parameter
    const searchParams = new URLSearchParams();
    searchParams.set('id', hero.id);
    searchParams.set('name', hero.name.replace(/\s+/g, '-').toLowerCase());
    window.history.pushState({ page: 'hero-detail', id: hero.id }, '', `?${searchParams.toString()}`);

    renderHeroDetail(hero);
}

function renderHeroDetail(hero) {
    const detailContainer = document.querySelector('.hero-detail');
    if (!detailContainer) {
        // Create detail page if it doesn't exist
        const main = document.querySelector('main');
        if (main) {
            const detailHTML = `
                <section class="hero-detail">
                    <a href="index.html" class="hero-detail-back">← Back to Heroes</a>
                    <h1>${hero.name}</h1>
                    <div class="lore">${hero.lore}</div>
                    <div class="attr-row">
                        <span class="attr-label">Primary Attribute:</span>
                        <span class="attr-value">${getAttrLabel(hero.primaryAttr)}</span>
                    </div>
                    <div class="attr-row">
                        <span class="attr-label">Roles:</span>
                        <span class="attr-value">${hero.roles.join(', ')}</span>
                    </div>
                    <div class="attr-row">
                        <span class="attr-label">Lore:</span>
                        <span></span>
                    </div>
                    <div class="abilities-list">
                        ${hero.abilities.map(abil => `<span class="ability">${abil}</span>`).join('')}
                    </div>
                </section>
            `;
            main.innerHTML = detailHTML;
            setupHeroDetailHandlers(window.allHeroes);
        }
        return;
    }

    detailContainer.innerHTML = `
        <a href="index.html" class="hero-detail-back">← Back to Heroes</a>
        <h1>${hero.name}</h1>
        <div class="lore">${hero.lore}</div>
        <div class="attr-row">
            <span class="attr-label">Primary Attribute:</span>
            <span class="attr-value">${getAttrLabel(hero.primaryAttr)}</span>
        </div>
        <div class="attr-row">
            <span class="attr-label">Roles:</span>
            <span class="attr-value">${hero.roles.join(', ')}</span>
        </div>
        <div class="attr-row">
            <span class="attr-label">Lore:</span>
            <span></span>
        </div>
        <div class="abilities-list">
            ${hero.abilities.map(abil => `<span class="ability">${abil}</span>`).join('')}
        </div>
    `;
}