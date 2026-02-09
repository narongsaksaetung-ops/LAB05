let explorerController = null;

// 🔍 ค้นหา Pokemon
async function searchPokemon() {
    const search = document.getElementById('explorer-search').value.trim().toLowerCase();
    const grid = document.getElementById('explorer-grid');
    const status = document.getElementById('explorer-status');

    if (!search) {
        status.innerHTML = '⚠️ กรุณาใส่ชื่อหรือ ID';
        return;
    }

    if (explorerController) {
        explorerController.abort();
    }
    explorerController = new AbortController();

    grid.innerHTML = '🔍 กำลังค้นหา...';
    status.innerHTML = 'Loading...';

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${search}`,
            { signal: explorerController.signal }
        );

        if (!response.ok) {
            throw new Error('ไม่พบ Pokemon นี้');
        }

        const pokemon = await response.json();
        grid.innerHTML = '';
        displayPokemon(pokemon);
        status.innerHTML = `✅ พบ ${pokemon.name}`;

    } catch (error) {
        if (error.name === 'AbortError') return;
        grid.innerHTML = '';
        status.innerHTML = `❌ ${error.message}`;
    }
}

// 🎲 สุ่ม Pokemon 6 ตัว
async function getRandomPokemon() {
    const grid = document.getElementById('explorer-grid');
    const status = document.getElementById('explorer-status');

    if (explorerController) {
        explorerController.abort();
    }
    explorerController = new AbortController();

    grid.innerHTML = '🎲 กำลังสุ่ม...';
    status.innerHTML = 'Loading...';

    const ids = Array.from({ length: 6 }, () => Math.floor(Math.random() * 898) + 1);

    try {
        const results = await Promise.allSettled(
            ids.map(id =>
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                    signal: explorerController.signal
                }).then(r => r.json())
            )
        );

        grid.innerHTML = '';
        results
            .filter(r => r.status === 'fulfilled')
            .forEach(r => displayPokemon(r.value));

        status.innerHTML = '✅ โหลดข้อมูลเรียบร้อย';

    } catch (error) {
        if (error.name === 'AbortError') return;
        status.innerHTML = '❌ เกิดข้อผิดพลาด';
    }
}

// 🧩 แสดง Pokemon
function displayPokemon(pokemon) {
    const grid = document.getElementById('explorer-grid');

    const card = document.createElement('div');
    card.className = 'data-card';

    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}">
        <h4>#${pokemon.id} ${pokemon.name.toUpperCase()}</h4>
        <p>Height: ${pokemon.height / 10} m</p>
        <p>Weight: ${pokemon.weight / 10} kg</p>
    `;

    grid.appendChild(card);
}

// ⌨️ กด Enter เพื่อค้นหา
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('explorer-search').addEventListener('keypress', e => {
        if (e.key === 'Enter') searchPokemon();
    });
});
