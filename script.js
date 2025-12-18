// BASE DE DATOS DE USUARIOS
const usersDatabase = [
    { id: 1, username: 'basic', password: 'basic123', name: 'Usuario Basic', subscription: 'basic' },
    { id: 2, username: 'advanced', password: 'advanced123', name: 'Usuario Advanced', subscription: 'advanced' },
    { id: 3, username: 'pro', password: 'pro123', name: 'Usuario Pro', subscription: 'pro' },
    { id: 4, username: 'pruebas', password: '123', name: 'Usuario Pruebas', subscription: 'basic' },
    { id: 5, username: 'oscar', password: 'oscar123', name: 'Usuario Pro', subscription: 'pro' },
    { id: 6, username: 'ariane', password: 'ariane123', name: 'Usuaria Pro', subscription: 'pro' }
];

// ESTADO GLOBAL
let currentUser = null;
let currentStep = 1;
const totalSteps = 3;

const userData = {
    nombre: '',
    ocasion: '',
    preferencias: ''
};

// PRENDAS POR DEFECTO: Estas prendas ya están cargadas en la lógica del sistema
const wardrobe = {
    selfie: null,
    tops: [
        'img/camiseta.png', 'img/camiseta2.png', 
        'img/camiseta3.png', 'img/camiseta4.png'
    ],
    bottoms: [
        'img/pantalon.png', 'img/pantalon2.png', 
        'img/pantalon3.png', 'img/pantalon4.png'
    ],
    shoes: [
        'img/zapas.png', 'img/zapas2.png', 
        'img/zapas3.png', 'img/zapas4.png'
    ]
};

let currentOutfit = {
    top: null,
    bottom: null,
    shoes: null
};

let savedOutfits = [];

// VARIABLES PARA EL CHAT PRO
const chatSteps = ['nombre', 'ocasion', 'preferencias'];
let currentChatStepIndex = 0;
let isProChatActive = false;

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    showView('loginView');
    // Forzamos el renderizado para que las prendas por defecto aparezcan visualmente en el armario
    renderWardrobeManager();
});

// SISTEMA DE NOTIFICACIONES
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconPaths = {
        'error': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        'success': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${iconPaths[type]}"></path>
            </svg>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// SISTEMA DE NAVEGACIÓN
function showView(viewId) {
    const views = ['loginView', 'dashboardView', 'wardrobeManagerView', 'subscriptionView', 'outfitGeneratorView', 'savedOutfitsView', 'proChatView'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });
    
    const currentViewEl = document.getElementById(viewId);
    if (currentViewEl) currentViewEl.classList.remove('hidden');
    window.scrollTo(0, 0);
}

// LOGIN
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');

    if (!username || !password) {
        errorDiv.textContent = 'Por favor, completa todos los campos';
        errorDiv.classList.remove('hidden');
        return;
    }

    const user = usersDatabase.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        errorDiv.classList.add('hidden');
        updateHeaderButtons();
        showDashboard();
        showNotification(`¡Bienvenido a MirrorLab, ${user.name}!`);
    } else {
        errorDiv.textContent = 'Usuario o contraseña incorrectos';
        errorDiv.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    showView('loginView');
    updateHeaderButtons();
    showNotification('Sesión cerrada correctamente');
}

function updateHeaderButtons() {
    const container = document.getElementById('headerButtons');
    if (currentUser) {
        container.innerHTML = `
            <button class="btn btn-logout" onclick="handleLogout()">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Cerrar Sesión
            </button>
        `;
    } else {
        container.innerHTML = '';
    }
}

// DASHBOARD
function showDashboard() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userPlan').textContent = currentUser.subscription.toUpperCase();
        updateOutfitCount();
        showView('dashboardView');
    } else {
        showView('loginView');
    }
}

function showWardrobeManager() {
    showView('wardrobeManagerView');
    renderWardrobeManager();
}

function showSubscriptionManager() {
    showView('subscriptionView');
    updateSubscriptionCards();
}

function showOutfitGenerator() {
    // Verificamos si hay prendas (incluye las de por defecto)
    if (wardrobe.tops.length === 0 || wardrobe.bottoms.length === 0 || wardrobe.shoes.length === 0) {
        showNotification('Primero debes tener al menos una prenda de cada categoría en tu armario.', 'warning');
        showWardrobeManager();
        return;
    }

    if (currentUser && currentUser.subscription === 'pro') {
        showView('proChatView');
        initializeProChat();
        return; 
    }
    
    showView('outfitGeneratorView');
    currentStep = 1;
    renderProgressBar();
    updateOutfitUI();
}

function showSavedOutfitsView() {
    showView('savedOutfitsView');
    renderSavedOutfits();
}

// GESTOR DE ARMARIO
function renderWardrobeManager() {
    renderWardrobeGrid('topsGridManager', wardrobe.tops, 'tops');
    renderWardrobeGrid('bottomsGridManager', wardrobe.bottoms, 'bottoms');
    renderWardrobeGrid('shoesGridManager', wardrobe.shoes, 'shoes');
}

function renderWardrobeGrid(gridId, items, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'wardrobe-item';
        div.innerHTML = `
            <img src="${item}">
            <button class="remove-btn" onclick="removeItem(this, '${type}', '${item}')">×</button>
        `;
        grid.appendChild(div);
    });
}

// SUSCRIPCIONES
function updateSubscriptionCards() {
    ['basic', 'advanced', 'pro'].forEach(plan => {
        const card = document.getElementById(`${plan}Card`);
        if (card) {
            if (currentUser && currentUser.subscription === plan) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        }
    });
}

function changePlan(newPlan) {
    if (!currentUser) return;

    if (currentUser.subscription === newPlan) {
        showNotification('Ya tienes este plan activo', 'warning');
        return;
    }
    
    currentUser.subscription = newPlan;
    showNotification(`¡Plan cambiado exitosamente a ${newPlan.toUpperCase()}!`);
    updateSubscriptionCards();
    document.getElementById('userPlan').textContent = newPlan.toUpperCase();
}

// MANEJO DE IMÁGENES
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleSelfieUpload(input) {
    const file = input.files[0];
    if (file) {
        try {
            const base64 = await readFileAsBase64(file);
            wardrobe.selfie = base64;
            
            const container = document.getElementById('selfiePreviewContainer');
            container.innerHTML = `<img src="${base64}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 50%; border: 3px solid #10b981;">
                                   <p style="color: #10b981; margin-top: 10px;">¡Selfie Cargado!</p>`;
        } catch (e) {
            showNotification("Error al leer la imagen", 'error');
        }
    }
}

async function handleWardrobeUpload(input, type) {
    const files = Array.from(input.files);
    if (files.length === 0) return;

    for (const file of files) {
        try {
            const base64 = await readFileAsBase64(file);
            wardrobe[type].push(base64);
        } catch (e) {
            console.error(e);
        }
    }
    
    input.value = '';
    renderWardrobeManager();
}

function removeItem(btn, type, base64Data) {
    const parent = btn.parentElement;
    if (parent) parent.remove();
    wardrobe[type] = wardrobe[type].filter(item => item !== base64Data);
}

// CHAT DEL ASISTENTE PRO
function initializeProChat() {
    const chatContainer = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    
    chatContainer.innerHTML = '';
    currentChatStepIndex = 0;
    isProChatActive = true;
    
    chatInput.placeholder = 'Escribe tu nombre...';
    chatInput.disabled = false;
    sendChatBtn.disabled = false;
    
    addMessage('assistant', `¡Hola, **${currentUser.name}**! Soy **Mira**, tu estilista virtual. Empecemos a crear tu look. ¿Cuál es el **nombre** que quieres usar para esta sesión?`);
    
    userData.nombre = '';
    userData.ocasion = '';
    userData.preferencias = '';
}

function addMessage(sender, text) {
    const chatContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `<p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleChatSubmit() {
    if (!isProChatActive) return;
    
    const inputElement = document.getElementById('chatInput');
    const userText = inputElement.value.trim();
    
    if (!userText) {
        addMessage('assistant', 'Por favor, introduce una respuesta válida para continuar.');
        return;
    }

    addMessage('user', userText);
    inputElement.value = '';

    const currentStepName = chatSteps[currentChatStepIndex];
    
    if (currentStepName === 'nombre') {
        userData.nombre = userText;
    } else if (currentStepName === 'ocasion') {
        userData.ocasion = userText.toLowerCase();
    } else if (currentStepName === 'preferencias') {
        userData.preferencias = userText;
    }
    
    currentChatStepIndex++;

    setTimeout(() => {
        const nextStepName = chatSteps[currentChatStepIndex];

        if (nextStepName === 'ocasion') {
            document.getElementById('chatInput').placeholder = 'Ej: casual, cita, trabajo...';
            addMessage('assistant', `Perfecto, **${userData.nombre}**. ¿Para qué **ocasión** es este outfit? (Ej: Casual, Trabajo, Cita, Fiesta)`);
        } else if (nextStepName === 'preferencias') {
            document.getElementById('chatInput').placeholder = 'Ej: colores oscuros, cómoda...';
            addMessage('assistant', '¿Tienes alguna **preferencia** de estilo o color que deba considerar? (Opcional, si no tienes, simplemente di "No")');
        } else {
            isProChatActive = false;
            const inputEl = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendChatBtn');

            inputEl.placeholder = 'Generando outfit...';
            inputEl.disabled = true;
            sendBtn.disabled = true;
            
            addMessage('assistant', `¡Excelente! Ya tengo toda la información. Ahora voy a mi laboratorio virtual a generar tu look ideal...`);
            
            setTimeout(() => {
                showView('outfitGeneratorView');
                currentStep = 3;
                renderProgressBar();
                updateOutfitUI();
                generateOutfit();
            }, 3000);
        }
    }, 800);
}

// GENERADOR DE OUTFITS
function goToStep(step) {
    if (step > currentStep) {
        if (currentStep === 1) {
            const nombre = document.getElementById('nombre').value;
            const ocasion = document.getElementById('ocasion').value;
            
            if (!nombre) {
                showNotification("Por favor, introduce tu nombre.", 'warning');
                return;
            }
            if (!ocasion) {
                showNotification("Por favor, selecciona una ocasión.", 'warning');
                return;
            }
            
            userData.nombre = nombre;
            userData.ocasion = ocasion;
            userData.preferencias = document.getElementById('preferencias').value;
        }
        if (currentStep === 2 && !wardrobe.selfie) {
            showNotification("Por favor, sube un selfie para continuar.", 'warning');
            return;
        }
    }

    currentStep = step;
    renderProgressBar();
    updateOutfitUI();
    window.scrollTo(0, 0);
}

function updateOutfitUI() {
    for (let i = 1; i <= totalSteps; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) step.classList.add('hidden');
    }
    
    const currentStepEl = document.getElementById(`step${currentStep}`);
    if (currentStepEl) currentStepEl.classList.remove('hidden');
}

function renderProgressBar() {
    const container = document.getElementById('progressBar');
    if (!container) return; 
    
    container.innerHTML = '';
    
    for (let i = 1; i <= totalSteps; i++) {
        const circle = document.createElement('div');
        circle.className = `step-circle ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`;
        circle.innerText = i;
        circle.onclick = () => goToStep(i);
        container.appendChild(circle);

        if (i < totalSteps) {
            const line = document.createElement('div');
            line.className = `step-line ${i < currentStep ? 'active' : ''}`;
            container.appendChild(line);
        }
    }
}

function generateOutfit() {
    if (wardrobe.tops.length === 0 || wardrobe.bottoms.length === 0 || wardrobe.shoes.length === 0) {
        showNotification("Necesitas tener al menos una prenda de cada categoría en tu armario.", 'warning');
        return;
    }

    currentOutfit.top = wardrobe.tops[Math.floor(Math.random() * wardrobe.tops.length)];
    currentOutfit.bottom = wardrobe.bottoms[Math.floor(Math.random() * wardrobe.bottoms.length)];
    currentOutfit.shoes = wardrobe.shoes[Math.floor(Math.random() * wardrobe.shoes.length)];

    const display = document.getElementById('finalOutfitDisplay');
    if (!display) return;
    
    display.innerHTML = `
        <div class="outfit-layer selfie-layer">
            <img src="${wardrobe.selfie}" alt="Selfie">
            <span class="layer-label">Tú</span>
        </div>
        <div class="outfit-layer top-layer">
            <img src="${currentOutfit.top}" alt="Top">
            <span class="layer-label">SUPERIOR</span>
        </div>
        <div class="outfit-layer bottom-layer">
            <img src="${currentOutfit.bottom}" alt="Pantalón">
            <span class="layer-label">INFERIOR</span>
        </div>
        <div class="outfit-layer shoes-layer">
            <img src="${currentOutfit.shoes}" alt="Calzado">
            <span class="layer-label">CALZADO</span>
        </div>
    `;

    const ocasionTextos = {
        'casual': 'un look relajado y cómodo para el día a día',
        'trabajo': 'un estilo profesional perfecto para la oficina',
        'entrevista': 'una apariencia impecable para causar la mejor impresión',
        'cita': 'un outfit encantador para tu cita romántica',
        'fiesta': 'un look vibrante para brillar en la noche',
        'deportivo': 'un conjunto cómodo ideal para entrenar',
        'formal': 'un estilo elegante y sofisticado',
        'viaje': 'un outfit práctico y versátil para viajar'
    };
    
    const cleanedOcasion = userData.ocasion.split(' ')[0].toLowerCase();
    
    let consejo = `Hola ${userData.nombre}. `;
    consejo += `Hemos creado ${ocasionTextos[cleanedOcasion] || `un outfit especial para la ocasión "${userData.ocasion}"`}. `;
    
    if (userData.preferencias && userData.preferencias.toLowerCase() !== 'no') {
        consejo += `Consideramos tus preferencias: "${userData.preferencias}".`;
    }
    
    document.getElementById('weatherAdvice').innerText = consejo;
    if (!isProChatActive) {
        goToStep(3);
    }
}

function saveCurrentOutfit() {
    if (!currentUser) {
        showNotification('Debes iniciar sesión para guardar outfits.', 'error');
        return;
    }
    
    if (currentUser.subscription === 'basic') {
         showNotification('Tu plan Basic no permite guardar outfits.', 'error');
         return;
    }
    
    if (currentUser.subscription === 'advanced' && savedOutfits.length >= 20) {
         showNotification('Tu plan Advanced solo te permite guardar hasta 20 outfits. Por favor, considera el plan Pro.', 'error');
         return;
    }
    
    if (!currentOutfit.top || !currentOutfit.bottom || !currentOutfit.shoes) {
        showNotification('No hay un outfit generado para guardar.', 'warning');
        return;
    }

    const outfitToSave = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        ocasion: userData.ocasion,
        nombre: userData.nombre,
        ...currentOutfit,
        selfie: wardrobe.selfie
    };

    savedOutfits.push(outfitToSave);
    updateOutfitCount();
    showNotification('¡Outfit guardado exitosamente!');
}

function renderSavedOutfits() {
    const container = document.getElementById('savedOutfitsContainer');
    if (!container) return;
    
    if (savedOutfits.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #525252; padding: 3rem;">Aún no has guardado ningún outfit.</p>';
        return;
    }

    container.innerHTML = '';
    const ocasionTextos = {
        'casual': 'Casual', 'trabajo': 'Trabajo', 'entrevista': 'Entrevista',
        'cita': 'Cita', 'fiesta': 'Fiesta', 'deportivo': 'Deportivo',
        'formal': 'Formal', 'viaje': 'Viaje'
    };

    savedOutfits.forEach(outfit => {
        const card = document.createElement('div');
        card.className = 'saved-card';
        const displayOcasion = ocasionTextos[outfit.ocasion.split(' ')[0].toLowerCase()] || outfit.ocasion;

        card.innerHTML = `
            <div style="font-size: 0.8rem; color: #737373; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items: center;">
                <div>
                    <div><strong style="color: #10b981;">${displayOcasion}</strong></div>
                    <div>${outfit.date}</div>
                </div>
                <button class="remove-btn" style="position: static; background: transparent; color: #dc2626;" onclick="deleteOutfit(${outfit.id})">Borrar</button>
            </div>
            <div class="saved-mini-stack">
                <img src="${outfit.selfie}" alt="Selfie" style="object-position: top;">
                <img src="${outfit.top}" alt="Top">
                <img src="${outfit.bottom}" alt="Bottom">
                <img src="${outfit.shoes}" alt="Shoes">
            </div>
        `;
        container.appendChild(card);
    });
}

function deleteOutfit(id) {
    savedOutfits = savedOutfits.filter(o => o.id !== id);
    renderSavedOutfits();
    updateOutfitCount();
    showNotification('Outfit eliminado');
}

function updateOutfitCount() {
    const countEl = document.getElementById('outfitCountTitle');
    if (countEl) countEl.innerText = savedOutfits.length;
}