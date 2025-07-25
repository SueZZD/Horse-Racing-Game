const state = {
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
    }

    const setHorses =  (horses) => {
        state.horses = horses;
            renderHorseList();
    }

    const setRaceSchedule = (schedule) => {
        state.raceSchedule = schedule;
        state.currentRaceIndex = 0;
            state.raceResults = [];
            renderProgram();
            updateRaceInfo();
    }

    const nextRace = () => {
        state.currentRaceIndex++;
            updateRaceInfo();
    }

    const addRaceResult = (result) => {
        state.raceResults.push(result);
            renderResults();
    }

    const setRaceRunning = (status) => {
        state.isRaceRunning = status;
            updateButtonStates();
    }

    const setAnimationFrameId = (id) => {
        state.animationFrameId = id;
    }

    const setRaceStartTime = (time) => {
        state.raceStartTime = time;
    }

    const setLastFrameTime = (time) => {
        state.lastFrameTime = time;
    }

    const resetRaceState = () => {
        state.currentRaceIndex = 0;
        state.raceResults = [];
        state.isRaceRunning = false;
        if (state.animationFrameId) {
            cancelAnimationFrame(state.animationFrameId);
            state.animationFrameId = null;
        }
        state.raceStartTime = 0;
        state.lastFrameTime = 0; 
        renderResults(); 
        updateRaceInfo();
        updateButtonStates();
        clearRaceTrack();
    }

    const getCurrentRace = () => {
        return state.raceSchedule[state.currentRaceIndex];
    }

    const getHorsesInCurrentRace = () => {
         const currentRace = getCurrentRace(); 
            if (!currentRace || !Array.isArray(currentRace.horseIds)) {
                console.warn("Current race or its horse IDs are not valid:", currentRace);
                return [];
            }
            return currentRace.horseIds
                .map(id => state.horses.find(h => h.id === id))
                .filter(horse => horse !== undefined); 
    }

    const isLastRace = () => {
        return currentRaceIndex >= raceSchedule.length - 1;
    }

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
            name: state.horseNames[i - 1] || `At ${i}`, 
            condition: Math.floor(Math.random() * 100) + 1, 
            color: state.horseColors[i - 1],
            position: 0, 
            speed: 0, 
            finishTime: null 
        });
    }
    setHorses(horses);
}

function renderHorseList() {
    horseListBody.innerHTML = '';
    state.horses.forEach(horse => {
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
    state.raceSchedule.forEach((race, index) => {
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
                        const horse = state.horses.find(h => h.id === horseId);
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
    if (state.raceResults.length === 0) {
        resultsDetails.innerHTML = '<p class="text-gray-500">Henüz sonuç yok.</p>';
        return;
    }

    state.raceResults.forEach((raceResult, index) => {
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
                        const horse = state.horses.find(h => h.id === result.horseId);
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
    const currentRace = getCurrentRace(); 
    if (currentRace) {
        currentRaceInfo.textContent = `Tur ${state.currentRaceIndex + 1} - ${currentRace.distance}m`;
        const nextRace = state.raceSchedule[state.currentRaceIndex + 1];
        if (nextRace) {
            nextRaceInfo.textContent = `Sonraki Tur: ${nextRace.distance}m`;
        } else if (state.currentRaceIndex === state.raceSchedule.length) {
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
    const hasSchedule = state.raceSchedule.length > 0;
    const isRunning = state.isRaceRunning;
    const allRacesFinished = state.currentRaceIndex >= state.raceSchedule.length;

    generateProgramBtn.disabled = isRunning;
    startRaceBtn.disabled = !hasSchedule || isRunning || allRacesFinished;
    pauseRaceBtn.disabled = !isRunning;
}

function clearRaceTrack() {
    raceTrack.querySelectorAll('.horse').forEach(horseEl => horseEl.remove());
}

function generateRaceProgram() {
    resetRaceState(); 
    const schedule = [];
    const allHorseIds = state.horses.map(h => h.id);

    state.raceDistances.forEach(distance => {
        
        const shuffledHorses = [...allHorseIds].sort(() => 0.5 - Math.random());
        const selectedHorseIds = shuffledHorses.slice(0, 10);

        schedule.push({
            distance: distance,
            horseIds: selectedHorseIds,
            results: [] 
        });
    });
    setRaceSchedule(schedule);
    updateButtonStates();
}

function startRace() {
    if (state.isRaceRunning) return;
    if (state.currentRaceIndex >= state.raceSchedule.length) {
        displayMessageBox('Tüm yarışlar tamamlandı. Yeni bir program oluşturun.');
        return;
    }

    setRaceRunning(true);
    const currentRace =getCurrentRace(); 
    if (!currentRace) {
        console.error("Yarış başlatılırken mevcut yarış bulunamadı.");
        setRaceRunning(false); 
        return;
    }

    clearRaceTrack();
    const horsesInRace = getHorsesInCurrentRace(); 

    if (!Array.isArray(horsesInRace)) {
        console.error("Hata: horsesInRace bir dizi değil. Gelen değer:", horsesInRace);
        setRaceRunning(false); 
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

    setRaceStartTime(performance.now());
    setLastFrameTime(performance.now()); 
    setAnimationFrameId(requestAnimationFrame(raceAnimationLoop)); 
}

function pauseRace() {
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        setAnimationFrameId(null);
    }
    setRaceRunning(false);
}

function raceAnimationLoop(currentTime) {
    if (!state.isRaceRunning) return;

    const currentRace = getCurrentRace(); 
    if (!currentRace) return; 

    const deltaTime = (currentTime - state.lastFrameTime) / 1000; 
    setLastFrameTime(currentTime); 

    const raceDistance = currentRace.distance;
    let allHorsesFinished = true;

    const horsesInRace = getHorsesInCurrentRace(); 

    
    if (!Array.isArray(horsesInRace)) {
        console.error("Hata: horsesInRace bir dizi değil. Gelen değer:", horsesInRace);
        pauseRace(); 
        return;
    }

    horsesInRace.forEach(horse => {
        if (horse.finishTime === null) {
          
            const baseSpeed = (horse.condition / 100) * 60 + 10; 
            const randomFactor = (Math.random() * 2 - 1) * 5; 
            horse.speed = Math.max(1, baseSpeed + randomFactor); 

            const distanceIncrement = horse.speed * deltaTime;
            horse.position += (distanceIncrement / raceDistance) * 100;

            if (horse.position >= 100) {
                horse.position = 100;
                horse.finishTime = (currentTime - state.raceStartTime) / 1000; 
            } else {
                allHorsesFinished = false;
            }

           
            const horseEl = document.getElementById(`horse-${horse.id}`);
            if (horseEl) {
                horseEl.style.left = `${horse.position}%`;
            }
        }
    });

    if (allHorsesFinished) {
        pauseRace(); 
        const sortedResults = horsesInRace
            .filter(h => h.finishTime !== null)
            .sort((a, b) => a.finishTime - b.finishTime)
            .map(h => ({ horseId: h.id, time: h.finishTime }));

        addRaceResult({
            distance: currentRace.distance,
            results: sortedResults
        });

        if (!isLastRace()) {
            setTimeout(() => {
                nextRace();
                updateButtonStates(); 
            }, 2000); 
        } else {
            currentRaceInfo.textContent = 'Tüm yarışlar tamamlandı!';
            nextRaceInfo.textContent = '';
            updateButtonStates(); 
        }

    } else {
        setAnimationFrameId(requestAnimationFrame(raceAnimationLoop));
    }
}


initializeHorses();
updateButtonStates(); 
