let autoRefreshInterval;
let countdownInterval;
let items = [];

async function fetchItemTypes() {
    try {
        const response = await fetch('https://xplay.gg/api/items/getList');
        if (!response.ok) {
            throw new Error('Ошибка при получении данных.');
        }

        const data = await response.json();
        items = data.items.filter(item => item.Category === 'premium');
        
        // Получаем уникальные типы предметов и объединяем типы
        const types = [...new Set(items.map(item => {
            if (item.WeaponName.includes('StatTrak™')) {
                return item.WeaponName.replace('StatTrak™', '').trim();
            }
            return item.WeaponName;
        }))];

        displayItemTypes(types);
    } catch (error) {
        alert(error.message);
    }
}

function displayItemTypes(types) {
    const itemTypeSelect = document.getElementById('item-type-select');
    itemTypeSelect.innerHTML = '<option value="">Выберите тип предмета</option>';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        itemTypeSelect.appendChild(option);
    });
}

function displayItemListByType(type) {
    const filteredItems = items.filter(item => {
        const weaponName = item.WeaponName.includes('StatTrak™') ? item.WeaponName.replace('StatTrak™', '').trim() : item.WeaponName;
        return weaponName === type;
    });

    const itemListDiv = document.getElementById('item-list');
    itemListDiv.innerHTML = '';

    if (filteredItems.length === 0) {
        itemListDiv.innerHTML = '<p>Нет элементов для выбранного типа.</p>';
        return;
    }

    const ul = document.createElement('ul');
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        
        // Определяем стиль обводки
        const isStatTrak = item.WeaponName.includes('StatTrak™');
        if (isStatTrak) {
            li.classList.add('stat-trak-item');
        }

        li.innerHTML = `
            <p class="item-name">${item.SkinName}</p>
            <div class="dropdown-content">
                <p><strong>ID:</strong> ${item.ID}</p>
                <p><strong>Weapon:</strong> ${item.WeaponName}</p>
                <p><strong>Skin:</strong> ${item.SkinName}</p>
                <p><strong>Цена:</strong> ${item.XPrice}</p>
                <p><strong>Разблокируется:</strong> ${item.UnBannedDate}</p>
                <a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank">Посмотреть в магазине</a>
            </div>
        `;

        // Добавляем обработчик события клика для элемента
        li.addEventListener('click', () => {
            displayItem(item);
        });

        ul.appendChild(li);
    });

    itemListDiv.appendChild(ul);
}






async function fetchItem() {
    const itemIdStr = document.getElementById('item-id').value.trim();
    if (!itemIdStr) {
        alert('Пожалуйста, введите ID элемента.');
        return;
    }

    const itemId = parseInt(itemIdStr, 10); // Преобразуем введенный ID в число

    const item = items.find(i => i.ID === itemId);
    if (item) {
        displayItem(item);
    } else {
        alert('Элемент с таким ID не найден в загруженном списке.');
    }
}

function startAutoRefresh() {
    // Обновление данных каждые 30 секунд
    autoRefreshInterval = setInterval(fetchItem, 30000);
}

function stopAutoRefresh() {
    clearInterval(autoRefreshInterval);
}

function stopCountdown() {
    clearInterval(countdownInterval);
}

function displayItem(item) {
    const infoDiv = document.getElementById('info');
    if (!item) {
        infoDiv.innerHTML = 'Элемент не найден.';
        stopCountdown();
        stopAutoRefresh();
        return;
    }

    const now = new Date();
    const unbannedDate = new Date(item.UnBannedDate);
    const timeDiff = unbannedDate - now;

    function formatTimeDiff(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    infoDiv.innerHTML = `<p>Выбранный скин: ${item.WeaponName} | ${item.SkinName}</p>
                          <p>ID: ${item.ID}</p>
                          <p>Цена: ${item.XPrice}</p>
                          <p>Разблокируется: ${item.UnBannedDate}</p>
                          <p class="time">Время до разблокировки: <span id="countdown">${formatTimeDiff(timeDiff)}</span></p>
                          <p><a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank" class="link">Посмотреть в магазине</a></p>`;

    // Очистка предыдущего таймера
    stopCountdown();
    
    countdownInterval = setInterval(() => {
        const now = new Date();
        const timeDiff = unbannedDate - now;
        if (timeDiff <= 0) {
            document.getElementById('countdown').innerText = '00:00:00.000';
            stopCountdown();
            return;
        }
        document.getElementById('countdown').innerText = formatTimeDiff(timeDiff);
    }, 100);  // Обновление таймера каждые 0.1 секунды

    startAutoRefresh();  // Начать автоматическое обновление
}
