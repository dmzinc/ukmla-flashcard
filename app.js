let conditions = [];
let currentIndex = 0;

// Function to save current index to localStorage
function saveProgress() {
    localStorage.setItem('ukmlaFlashcardIndex', currentIndex);
}

// Function to load saved progress
function loadProgress() {
    const savedIndex = localStorage.getItem('ukmlaFlashcardIndex');
    return savedIndex ? parseInt(savedIndex) : 0;
}

async function loadConditions() {
    try {
        const response = await fetch('medical_conditions_detailed.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        conditions = data.conditions || [];
        document.getElementById('totalCards').textContent = conditions.length;
        
        // Load saved progress and show the corresponding card
        currentIndex = loadProgress();
        showCard(currentIndex);
    } catch (error) {
        console.error('Error loading conditions:', error);
        document.getElementById('flashcard').innerHTML = `
            <div class="error">
                Error loading conditions. Please check the console for details.
            </div>
        `;
    }
}

function showCard(index) {
    if (!conditions.length) return;
    
    const condition = conditions[index];
    document.getElementById('condition').textContent = condition.condition;
    document.getElementById('currentCard').textContent = index + 1;
    
    const notesElement = document.getElementById('notes');
    notesElement.innerHTML = '';
    
    // Create sections for each type of note
    Object.entries(condition.important_notes).forEach(([title, points]) => {
        const section = document.createElement('div');
        section.innerHTML = `
            <div class="section-title">${formatTitle(title)}</div>
            <ul class="note-list">
                ${points.map(point => `<li>${point}</li>`).join('')}
            </ul>
        `;
        notesElement.appendChild(section);
    });
    
    updateButtons();
    
    // Save progress after showing new card
    saveProgress();
}

function formatTitle(title) {
    return title.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = currentIndex === 0;
    document.getElementById('nextBtn').disabled = currentIndex === conditions.length - 1;
}

function showNextCard() {
    if (currentIndex < conditions.length - 1) {
        currentIndex++;
        showCard(currentIndex);
    }
}

function showPreviousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        showCard(currentIndex);
    }
}

// Add touch swipe support
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeLength = touchEndX - touchStartX;
    
    if (Math.abs(swipeLength) > swipeThreshold) {
        if (swipeLength > 0) {
            showPreviousCard();
        } else {
            showNextCard();
        }
    }
}

// Save progress when user leaves the page
window.addEventListener('beforeunload', saveProgress);

// Initialize the app
document.addEventListener('DOMContentLoaded', loadConditions); 