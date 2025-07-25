
const store = {
    state: {
        horses: [],
        raceSchedule: [],
        currentRaceIndex: 0,
        raceResults: [],
        isRaceRunning: false,
        animationFrameId: null,
        raceStartTime: 0,
        lastFrameTime: 0, 
        raceDistances: [1200, 1400, 1600, 1800, 2000, 2200],
        horseColors: [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
            '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
            '#C0C0C0', '#FFA500', '#8A2BE2', '#A52A2A', '#DEB887', '#5F9EA0',
            '#7FFF00', '#D2691E'
        ],
        horseNames: [
            "Ada Lovelace", "Grace Hopper", "Lewis Hamilton", "Joan Clarke",
            "Katherine Johnson", "michael schumacher", "Mary Jackson", "Dorothy Vaughan",
            "Radia Perlman", "Sister Mary Keller", "Jean Bartik", "Barbara Liskov",
            "Frances Allen", "Marissa Mayer", "Karen Spärck Jones", "Evelyn Boyd Granville",
            "Adele Goldberg", "Betty Holberton", "Bold Pilot", "Sebastian Vettel"
        ]
    },
    mutations: {
        setHorses(horses) {
            store.state.horses = horses;
            renderHorseList();
        },
        setRaceSchedule(schedule) {
            store.state.raceSchedule = schedule;
            store.state.currentRaceIndex = 0;
            store.state.raceResults = [];
            renderProgram();
            updateRaceInfo();
        },
        nextRace() {
            store.state.currentRaceIndex++;
            updateRaceInfo();
        },
        addRaceResult(result) {
            store.state.raceResults.push(result);
            renderResults();
        },
        setRaceRunning(status) {
            store.state.isRaceRunning = status;
            updateButtonStates();
        },
        setAnimationFrameId(id) {
            store.state.animationFrameId = id;
        },
        setRaceStartTime(time) {
            store.state.raceStartTime = time;
        },
        setLastFrameTime(time) { 
            store.state.lastFrameTime = time;
        },
        resetRaceState() {
            store.state.currentRaceIndex = 0;
            store.state.raceResults = [];
            store.state.isRaceRunning = false;
            if (store.state.animationFrameId) {
                cancelAnimationFrame(store.state.animationFrameId);
                store.state.animationFrameId = null;
            }
            store.state.raceStartTime = 0;
            store.state.lastFrameTime = 0; 
            renderResults(); 
            updateRaceInfo();
            updateButtonStates();
            clearRaceTrack();
        }
    },
    getters: {
        getCurrentRace() {
            return store.state.raceSchedule[store.state.currentRaceIndex];
        },
        getHorsesInCurrentRace() {
            const currentRace = store.getters.getCurrentRace(); 
            if (!currentRace || !Array.isArray(currentRace.horseIds)) {
                console.warn("Current race or its horse IDs are not valid:", currentRace);
                return [];
            }
            return currentRace.horseIds
                .map(id => store.state.horses.find(h => h.id === id))
                .filter(horse => horse !== undefined); 
        },
        isLastRace() {
            return store.state.currentRaceIndex >= store.state.raceSchedule.length - 1;
        }
    }
};

const horseListBody = document.getElementById('horseListBody');
const generateProgramBtn = document.getElementById('generateProgramBtn');
const startRaceBtn = document.getElementById('startRaceBtn');
const pauseRaceBtn = document.getElementById('pauseRaceBtn');
const currentRaceInfo = document.getElementById('currentRaceInfo');
const nextRaceInfo = document.getElementById('nextRaceInfo');
const raceTrack = document.querySelector('.race-track');
const programDetails = document.getElementById('programDetails');
const resultsDetails = document.getElementById('resultsDetails');

const messageBox = document.getElementById('messageBox');
const messageBoxContent = document.getElementById('messageBoxContent');
const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');

messageBoxCloseBtn.addEventListener('click', () => {
    messageBox.classList.add('hidden');
});

function displayMessageBox(message) {
    messageBoxContent.textContent = message;
    messageBox.classList.remove('hidden');
}

generateProgramBtn.addEventListener('click', generateRaceProgram);
startRaceBtn.addEventListener('click', startRace);
pauseRaceBtn.addEventListener('click', pauseRace);

function initializeHorses() {
    const horses = [];
    for (let i = 1; i <= 20; i++) {
        horses.push({
            id: i,
            name: store.state.horseNames[i - 1] || `At ${i}`, 
            condition: Math.floor(Math.random() * 100) + 1, 
            color: store.state.horseColors[i - 1],
            position: 0, 
            speed: 0, 
            finishTime: null 
        });
    }
    store.mutations.setHorses(horses);
}

function renderHorseList() {
    horseListBody.innerHTML = '';
    store.state.horses.forEach(horse => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${horse.name}</td>
            <td>${horse.condition}</td>
        `;
        horseListBody.appendChild(row);
    });
}

function renderProgram() {
    programDetails.innerHTML = '';
    store.state.raceSchedule.forEach((race, index) => {
        const raceDiv = document.createElement('div');
        raceDiv.className = 'mb-4';
        raceDiv.innerHTML = `
            <h4 class="font-semibold text-md mb-2">Tur ${index + 1} - ${race.distance}m</h4>
            <table class="program-table">
                <thead>
                    <tr>
                        <th>Pozisyon</th>
                        <th>Adı</th>
                    </tr>
                </thead>
                <tbody>
                    ${race.horseIds.map((horseId, pos) => {
                        const horse = store.state.horses.find(h => h.id === horseId);
                        return `
                            <tr>
                                <td>${pos + 1}</td>
                                <td>${horse ? horse.name : 'Bilinmeyen At'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        programDetails.appendChild(raceDiv);
    });
}

function renderResults() {
    resultsDetails.innerHTML = '';
    if (store.state.raceResults.length === 0) {
        resultsDetails.innerHTML = '<p class="text-gray-500">Henüz sonuç yok.</p>';
        return;
    }

    store.state.raceResults.forEach((raceResult, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'mb-4';
        resultDiv.innerHTML = `
            <h4 class="font-semibold text-md mb-2">Tur ${index + 1} - ${raceResult.distance}m Sonuçları</h4>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Pozisyon</th>
                        <th>Adı</th>
                        <th>Süre</th>
                    </tr>
                </thead>
                <tbody>
                    ${raceResult.results.map((result, pos) => {
                        const horse = store.state.horses.find(h => h.id === result.horseId);
                        return `
                            <tr>
                                <td>${pos + 1}</td>
                                <td>${horse ? horse.name : 'Bilinmeyen At'}</td>
                                <td>${result.time.toFixed(2)}s</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        resultsDetails.appendChild(resultDiv);
    });
}

function updateRaceInfo() {
    const currentRace = store.getters.getCurrentRace(); 
    if (currentRace) {
        currentRaceInfo.textContent = `Tur ${store.state.currentRaceIndex + 1} - ${currentRace.distance}m`;
        const nextRace = store.state.raceSchedule[store.state.currentRaceIndex + 1];
        if (nextRace) {
            nextRaceInfo.textContent = `Sonraki Tur: ${nextRace.distance}m`;
        } else if (store.state.currentRaceIndex === store.state.raceSchedule.length) {
             nextRaceInfo.textContent = 'Tüm yarışlar tamamlandı!';
        } else {
            nextRaceInfo.textContent = '';
        }
    } else {
        currentRaceInfo.textContent = 'Yarış Programı Oluşturulmadı';
        nextRaceInfo.textContent = '';
    }
}

function updateButtonStates() {
    const hasSchedule = store.state.raceSchedule.length > 0;
    const isRunning = store.state.isRaceRunning;
    const allRacesFinished = store.state.currentRaceIndex >= store.state.raceSchedule.length;

    generateProgramBtn.disabled = isRunning;
    startRaceBtn.disabled = !hasSchedule || isRunning || allRacesFinished;
    pauseRaceBtn.disabled = !isRunning;
}

function clearRaceTrack() {
    raceTrack.querySelectorAll('.horse').forEach(horseEl => horseEl.remove());
}

function generateRaceProgram() {
    store.mutations.resetRaceState(); 
    const schedule = [];
    const allHorseIds = store.state.horses.map(h => h.id);

    store.state.raceDistances.forEach(distance => {
        
        const shuffledHorses = [...allHorseIds].sort(() => 0.5 - Math.random());
        const selectedHorseIds = shuffledHorses.slice(0, 10);

        schedule.push({
            distance: distance,
            horseIds: selectedHorseIds,
            results: [] 
        });
    });
    store.mutations.setRaceSchedule(schedule);
    updateButtonStates();
}

function startRace() {
    if (store.state.isRaceRunning) return;
    if (store.state.currentRaceIndex >= store.state.raceSchedule.length) {
        displayMessageBox('Tüm yarışlar tamamlandı. Yeni bir program oluşturun.');
        return;
    }

    store.mutations.setRaceRunning(true);
    const currentRace = store.getters.getCurrentRace(); 
    if (!currentRace) {
        console.error("Yarış başlatılırken mevcut yarış bulunamadı.");
        store.mutations.setRaceRunning(false); 
        return;
    }

    clearRaceTrack();
    const horsesInRace = store.getters.getHorsesInCurrentRace(); 

    if (!Array.isArray(horsesInRace)) {
        console.error("Hata: horsesInRace bir dizi değil. Gelen değer:", horsesInRace);
        store.mutations.setRaceRunning(false); 
        return; 
    }

    horsesInRace.forEach((horse, index) => {
        const lane = document.createElement('div');
        lane.className = 'lane';
        lane.innerHTML = `<span class="lane-number">${index + 1}</span>`;

        const horseEl = document.createElement('div');
        horseEl.className = 'horse';
        horseEl.id = `horse-${horse.id}`;
        horseEl.innerHTML = `<i class="fas fa-horse" style="color: ${horse.color};"></i>`;
        horseEl.style.left = '0%'; 

        lane.appendChild(horseEl);
        raceTrack.appendChild(lane);

        horse.position = 0;
        horse.finishTime = null;
    });

    store.mutations.setRaceStartTime(performance.now());
    store.mutations.setLastFrameTime(performance.now()); 
    store.mutations.setAnimationFrameId(requestAnimationFrame(raceAnimationLoop)); 
}

function pauseRace() {
    if (store.state.animationFrameId) {
        cancelAnimationFrame(store.state.animationFrameId);
        store.mutations.setAnimationFrameId(null);
    }
    store.mutations.setRaceRunning(false);
}

function raceAnimationLoop(currentTime) {
    if (!store.state.isRaceRunning) return;

    const currentRace = store.getters.getCurrentRace(); 
    if (!currentRace) return; 

    const deltaTime = (currentTime - store.state.lastFrameTime) / 1000; 
    store.mutations.setLastFrameTime(currentTime); 

    const raceDistance = currentRace.distance;
    let allHorsesFinished = true;

    const horsesInRace = store.getters.getHorsesInCurrentRace(); 

    
    if (!Array.isArray(horsesInRace)) {
        console.error("Hata: horsesInRace bir dizi değil. Gelen değer:", horsesInRace);
        pauseRace(); // Stop the animation loop if data is corrupted
        return;
    }

    horsesInRace.forEach(horse => {
        if (horse.finishTime === null) {
            // Calculate speed based on condition and a random factor
          
            const baseSpeed = (horse.condition / 100) * 60 + 10; // m/s, adjust as needed
            const randomFactor = (Math.random() * 2 - 1) * 5; // -5 to +5 m/s
            horse.speed = Math.max(1, baseSpeed + randomFactor); // Ensure speed is positive

            // Update horse position based on deltaTime
            const distanceIncrement = horse.speed * deltaTime;
            horse.position += (distanceIncrement / raceDistance) * 100; // Position as percentage of track

            // Ensure position doesn't exceed 100% and doesn't go backward
            if (horse.position >= 100) {
                horse.position = 100;
                horse.finishTime = (currentTime - store.state.raceStartTime) / 1000; // Total elapsed time for finish
            } else {
                allHorsesFinished = false;
            }

            // Update horse element position using left
            const horseEl = document.getElementById(`horse-${horse.id}`);
            if (horseEl) {
                horseEl.style.left = `${horse.position}%`;
            }
        }
    });

    if (allHorsesFinished) {
        // Race finished
        pauseRace(); // Stop animation
        const sortedResults = horsesInRace
            .filter(h => h.finishTime !== null)
            .sort((a, b) => a.finishTime - b.finishTime)
            .map(h => ({ horseId: h.id, time: h.finishTime }));

        store.mutations.addRaceResult({
            distance: currentRace.distance,
            results: sortedResults
        });

        // Move to next race or end
        if (!store.getters.isLastRace()) {
            setTimeout(() => {
                store.mutations.nextRace();
                updateButtonStates(); // Re-enable start button for next race
            }, 2000); // Wait 2 seconds before enabling for next race
        } else {
            currentRaceInfo.textContent = 'Tüm yarışlar tamamlandı!';
            nextRaceInfo.textContent = '';
            updateButtonStates(); // Disable start button
        }

    } else {
        store.mutations.setAnimationFrameId(requestAnimationFrame(raceAnimationLoop));
    }
}

// --- Initial Setup ---
initializeHorses();
updateButtonStates(); // Set initial button states
