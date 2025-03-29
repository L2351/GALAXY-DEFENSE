        // --- Game Constants ---
        let GAME_WIDTH, GAME_HEIGHT;
        let BASE_X, BASE_Y;
        const BASE_RADIUS = 40;
        const BASE_MAX_HEALTH = 100;
        const GRID_SIZE = 40;
        const TARGETING_PRIORITIES = ['first', 'last', 'strongest', 'weakest'];
        const MAX_TOWER_LEVEL = 5; // Limit max upgrades
        const MAX_WAVES = 100; // Maximum waves for non-endless mode

        const TOWER_TYPES = {
            // Existing
            laser: { name: "Laser Tower", color: '#60a0ff', cost: 40, range: 160, damage: 7, fireRate: 6, projectileSpeed: 12, projectileColor: '#80c0ff', projectileSize: 3, upgradeCost: 40, upgradeMultiplier: 1.35, description: "Rapid fire, single target." },
            cannon: { name: "Cannon Tower", color: '#ff9050', cost: 80, range: 210, damage: 30, fireRate: 1.1, projectileSpeed: 8, projectileColor: '#ffb080', projectileSize: 6, upgradeCost: 80, upgradeMultiplier: 1.4, description: "Slow fire, high damage." },
            missile: { name: "Missile Tower", color: '#ff60a0', cost: 120, range: 190, damage: 20, fireRate: 0.9, projectileSpeed: 6, splashRadius: 75, projectileColor: '#ff80b0', projectileSize: 4, upgradeCost: 120, upgradeMultiplier: 1.35, description: "Homing missile, area damage." },
            slow: { name: "Slow Tower", color: '#40e0d0', cost: 60, range: 130, damage: 0, fireRate: 1.5, slowFactor: 0.5, slowDuration: 2000, projectileSpeed: 0, projectileColor: 'rgba(64, 224, 208, 0.3)', projectileSize: 130, upgradeCost: 60, upgradeMultiplier: 1.1, description: "Slows enemies in area.\nUpgrade increases range & duration.", nonTargeting: true },
            // New Towers
            chain: { name: "Chain Tower", color: '#f0e68c', cost: 90, range: 170, damage: 12, fireRate: 1.3, chainTargets: 3, chainRange: 100, chainFalloff: 0.7, projectileSpeed: 0, projectileColor: '#fffacd', projectileSize: 4, upgradeCost: 90, upgradeMultiplier: 1.3, description: "Lightning jumps to nearby targets.\nUpgrade: Dmg, Chains, Range." },
            railgun: { name: "Railgun Tower", color: '#ffffff', cost: 150, range: 280, damage: 60, fireRate: 0.5, pierce: 3, projectileSpeed: 25, projectileColor: '#e0ffff', projectileSize: 5, upgradeCost: 150, upgradeMultiplier: 1.4, description: "Pierces multiple enemies.\nUpgrade: Dmg, Pierce Count." },
            flame: { name: "Flame Tower", color: '#ff4500', cost: 75, range: 100, damage: 5, fireRate: 8, projectileSpeed: 7, projectileColor: '#ff8000', projectileSize: 25, // Size represents cone width here
                  upgradeCost: 75, upgradeMultiplier: 1.25, description: "Short range cone burst.\nHigh fire rate. Upgrade: Dmg.", isCone: true }, // Flag for drawing/logic
            generator: { name: "Resource Generator", color: '#ffd700', cost: 100, range: 0, damage: 0, fireRate: 0, incomeRate: 0.5, projectileSpeed: 0, upgradeCost: 125, upgradeMultiplier: 1.5, description: "Generates passive income.\nUpgrade increases income rate.", nonTargeting: true, isUtility: true },
            amplifier: { name: "Amplifier Tower", color: '#da70d6', cost: 110, range: 140, damage: 0, fireRate: 0.8, ampFactor: 1.3, ampDuration: 3000, projectileSpeed: 0, projectileColor: 'rgba(218, 112, 214, 0.3)', projectileSize: 140, upgradeCost: 110, upgradeMultiplier: 1.15, description: "Enemies hit take increased damage.\nUpgrade: Amp%, Range, Duration.", nonTargeting: true },
            mortar: { name: "Mortar Tower", color: '#8fbc8f', cost: 200, range: 350, damage: 50, fireRate: 0.4, projectileSpeed: 4, splashRadius: 100, projectileColor: '#556b2f', projectileSize: 8, upgradeCost: 200, upgradeMultiplier: 1.3, description: "Very long range, large AoE.\nMinimum range applies.", minRange: 80 },
            sniper: { name: "Sniper Tower", color: '#b0c4de', cost: 180, range: 450, damage: 100, fireRate: 0.6, projectileSpeed: 30, projectileColor: '#f0f8ff', projectileSize: 4, upgradeCost: 180, upgradeMultiplier: 1.45, description: "Extreme range, high single target dmg.\nUpgrade: Dmg." },
            mine: { name: "Mine Layer", color: '#a0522d', cost: 85, range: 50, damage: 0, fireRate: 0.3, // Rate of laying mines
                   mineDamage: 40, mineRadius: 60, mineLifetime: 20000, maxMines: 3, // Max mines per tower
                   projectileSpeed: 0, upgradeCost: 90, upgradeMultiplier: 1.2, description: "Places mines near the tower.\nUpgrade: Mine Dmg, Max Mines.", nonTargeting: true },
            booster: { name: "Booster Tower", color: '#00bfff', cost: 130, range: 120, // Range of buff effect
                       damage: 0, fireRate: 0, buffFactor: 0.15, // 15% boost to damage/rate
                       projectileSpeed: 0, upgradeCost: 140, upgradeMultiplier: 1.1, description: "Boosts Damage & Fire Rate\nof nearby towers. Effect stacks.\nUpgrade: Boost%, Range.", nonTargeting: true, isUtility: true },
            cryo: { name: "Cryo Tower", color: '#add8e6', cost: 140, range: 150, damage: 5, fireRate: 0.9, freezeDuration: 1500, projectileSpeed: 9, projectileColor: '#e0ffff', projectileSize: 5, upgradeCost: 150, upgradeMultiplier: 1.25, description: "Freezes enemies briefly.\nUpgrade: Freeze Duration, Range." },
        };

        const DIFFICULTY_SETTINGS = {
            easy: { health: 0.8, speed: 0.9, wave: 0.8, resource: 1.25, income: 2.5 },
            normal: { health: 1.0, speed: 1.0, wave: 1.0, resource: 1.0, income: 1.5 },
            hard: { health: 1.2, speed: 1.1, wave: 1.2, resource: 0.8, income: 0.8 }
        };

        // --- Game Variables ---
        let canvas, ctx;
        let score, resources, waveNumber, baseHealth, passive_income;
        let gameRunning, gameOver, gamePaused, isEndlessMode;
        let lastTime, animationId, timeScale = 1, timestamp = 0;
        let towers = [];
        let enemies, projectiles, particles, floatingTexts, resourceDrops, mines, activeEffects;
        let projectilePool = [], particlePool = [], minePool = [];
        let nextWaveTime = 0, waveStartTime = 0;
        let selectedTowerType = null;
        let selectedTower = null;
        let mouseX = 0, mouseY = 0;
        let spawnPoints = [];
        let placementGrid = [];
        let difficulty = 'easy';
        let lastResourceTime = 0, lastResourceDrop = 0;
        let stars = [];
        let currentMusic = null;
        let activeDisableEffects = [];

        // --- DOM Elements ---
        const gameContainer = document.getElementById('game-container');
        const scoreDisplay = document.getElementById('score-display');
        const resourcesDisplay = document.getElementById('resources-display');
        const waveDisplay = document.getElementById('wave-display');
        const incomeDisplay = document.getElementById('income-display');
        const nextWaveTimerDisplay = document.getElementById('next-wave-timer');
        const healthBar = document.getElementById('health-bar');
        const gameOverScreen = document.getElementById('game-over');
        const startScreen = document.getElementById('start-screen');
        const pauseScreen = document.getElementById('pause-screen');
        const finalScoreDisplay = document.getElementById('final-score');
        const wavesSurvivedDisplay = document.getElementById('waves-survived');
        const startButton = document.getElementById('start-button');
        const restartButton = document.getElementById('restart-button');
        const pauseButton = document.getElementById('pause-button');
        const resumeButton = document.getElementById('resume-button');
        const mainMenuButton = document.getElementById('main-menu-button');
        const towerSelectContainer = document.querySelector('.tower-select');
        // Query all tower options again in case they change dynamically later
        // const towerOptions = document.querySelectorAll('.tower-option'); // Query dynamically if needed
        const towerMenu = document.getElementById('tower-menu');
        const upgradeButton = document.getElementById('upgrade-button');
        const sellButton = document.getElementById('sell-button');
        const targetingButtons = towerMenu.querySelectorAll('.target-priority-btn');
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        // Query all icon canvases again
        // const towerIconCanvases = document.querySelectorAll('.tower-icon-canvas'); // Query dynamically if needed
        const towerTooltip = document.getElementById('tower-tooltip');
        const endlessModeCheckbox = document.getElementById('endless-mode-checkbox');
        const screenFlashElement = document.getElementById('screen-flash');


        // --- Initialization ---
        function init() {
            canvas = document.getElementById('game-canvas');
            ctx = canvas.getContext('2d');
            resizeCanvas();
            createStars(300);
            resetGame();
            setupEventHandlers();
            drawTowerIcons(); // Draw icons after setup
            updateTowerCostDisplay();
            startScreen.style.display = 'flex';
            gameOverScreen.style.display = 'none';
            pauseScreen.style.display = 'none';
        }

        function setupEventHandlers() {
            window.addEventListener('resize', handleResize);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('click', handleCanvasClick);
            canvas.addEventListener('contextmenu', handleCanvasRightClick); // Use contextmenu for right-click
            document.addEventListener('click', handleDocumentClick); // Handle clicks outside menu
            document.addEventListener('keydown', handleKeyDown);

            // Tower Selection Handlers
            document.querySelectorAll('.tower-option').forEach(opt => {
                opt.addEventListener('click', handleTowerOptionClick);
                opt.addEventListener('mouseenter', handleTowerOptionEnter);
                opt.addEventListener('mouseleave', handleTowerOptionLeave);
            });

            // Tower Menu Handlers
            upgradeButton.addEventListener('click', handleUpgradeClick);
            sellButton.addEventListener('click', handleSellClick);

            // Difficulty and Start Handlers
            difficultyButtons.forEach(button => button.addEventListener('click', handleDifficultyClick));
            startButton.addEventListener('click', startGame);
            restartButton.addEventListener('click', restartGame);
            pauseButton.addEventListener('click', togglePause);
            resumeButton.addEventListener('click', togglePause);
            mainMenuButton.addEventListener('click', returnToMainMenu);
            endlessModeCheckbox.addEventListener('change', () => { isEndlessMode = endlessModeCheckbox.checked; updateWaveDisplay(); });
        }

        function handleResize() {
            resizeCanvas();
            drawTowerIcons(); // Redraw icons on resize
            if (!gameRunning || gamePaused) redrawStaticElements();
        }

        function resizeCanvas() {
            canvas.width = gameContainer.clientWidth;
            canvas.height = gameContainer.clientHeight;
            GAME_WIDTH = canvas.width; GAME_HEIGHT = canvas.height;
            BASE_X = GAME_WIDTH / 2; BASE_Y = GAME_HEIGHT / 2;
            setupPlacementGrid(); setupSpawnPoints(); createStars(300);
        }

        function redrawStaticElements() {
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            drawStarBackground(); drawGrid(); drawBase(); drawTowers(); drawMines();
            // drawTowerIcons(); // Icons are usually static once drawn, unless resize happens
        }

        function setupPlacementGrid() {
            placementGrid = [];
            for (let y = 0; y < GAME_HEIGHT; y += GRID_SIZE) {
                for (let x = 0; x < GAME_WIDTH; x += GRID_SIZE) {
                    const dist = getDistance(x + GRID_SIZE/2, y + GRID_SIZE/2, BASE_X, BASE_Y);
                    const edge = x < GRID_SIZE || x >= GAME_WIDTH - GRID_SIZE || y < GRID_SIZE || y >= GAME_HEIGHT - GRID_SIZE;
                    if (dist > BASE_RADIUS + GRID_SIZE * 1.5 && !edge) {
                        placementGrid.push({ x, y, occupied: false, tower: null });
                    }
                }
            }
             // Re-link towers if they exist (e.g., after resize)
            if (towers && towers.length > 0) {
                towers.forEach(tower => {
                    const cell = placementGrid.find(c => c.x === tower.origGridX && c.y === tower.origGridY);
                    if (cell) { cell.occupied = true; cell.tower = tower; tower.gridCell = cell; }
                    else { console.warn("Tower lost grid cell after grid rebuild:", tower); } // Should not happen often
                });
            }
        }


        function setupSpawnPoints() {
            spawnPoints = [];
            const num = Math.max(4, Math.floor(Math.min(GAME_WIDTH, GAME_HEIGHT) / 120));
            const buffer = 50; const w = GAME_WIDTH, h = GAME_HEIGHT;
            for (let i = 0; i < num; i++) spawnPoints.push({ x: buffer + (w - 2*buffer) * (i / (num -1||1)), y: 0 });
            for (let i = 0; i < num; i++) spawnPoints.push({ x: w, y: buffer + (h - 2*buffer) * (i / (num -1||1)) });
            for (let i = 0; i < num; i++) spawnPoints.push({ x: buffer + (w - 2*buffer) * (i / (num -1||1)), y: h });
            for (let i = 0; i < num; i++) spawnPoints.push({ x: 0, y: buffer + (h - 2*buffer) * (i / (num -1||1)) });
        }

        // --- Game State Management ---
        function resetGame() {
            // Clear active entities and return to pools
            if(projectiles) projectilePool.push(...projectiles);
            if(particles) particlePool.push(...particles);
            if(mines) minePool.push(...mines);
            projectiles = []; particles = []; mines = []; activeEffects = [];
            activeDisableEffects = [];

            score = 0; resources = 150; waveNumber = 0; baseHealth = BASE_MAX_HEALTH; // Start waveNumber at 0
            gameRunning = false; gameOver = false; gamePaused = false; timeScale = 1;
            applyDifficultySettings();
            isEndlessMode = endlessModeCheckbox.checked;

            towers = []; // Ensure towers is empty
            enemies = []; floatingTexts = []; resourceDrops = [];

            setupPlacementGrid(); // Setup grid before placing towers

            selectedTowerType = null; selectedTower = null;
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            towerMenu.style.display = 'none';
            // Reset game over screen title
            gameOverScreen.querySelector('h1').textContent = "MISSION FAILED";

            updateScoreDisplay(); updateResourcesDisplay(); updateWaveDisplay(); // Initial display will show Wave 0
            updateIncomeDisplay(); updateHealthBar(); updateNextWaveTimerDisplay(0, false);
            pauseButton.textContent = "PAUSE (SPACE)";
            updateAllTowerOptionStatus();
        }

        function applyDifficultySettings() {
            passive_income = DIFFICULTY_SETTINGS[difficulty].income;
            updateIncomeDisplay();
        }

        function startGame() {
            if (!gameRunning) {
                resetGame();
                gameRunning = true;
                startScreen.style.display = 'none'; gameOverScreen.style.display = 'none'; pauseScreen.style.display = 'none';
                lastTime = performance.now(); timestamp = lastTime;
                lastResourceTime = timestamp; lastResourceDrop = timestamp;
                nextWaveTime = 5000;
                waveStartTime = timestamp + nextWaveTime;
                requestAnimationFrame(gameLoop);
            }
        }

        function restartGame() { startGame(); }

        function togglePause() {
            if (!gameRunning || gameOver) return;
            gamePaused = !gamePaused;
            if (gamePaused) {
                timeScale = 0; pauseScreen.style.display = 'flex'; pauseButton.textContent = "RESUME (SPACE)";
                cancelAnimationFrame(animationId);
                redrawStaticElements();
                drawEnemies(); drawProjectiles(); drawParticles(); drawResourceDrops(); drawMines(); drawActiveEffects();
                drawTowerRange(selectedTower);
                drawDisableEffects();
            } else {
                timeScale = 1; pauseScreen.style.display = 'none'; pauseButton.textContent = "PAUSE (SPACE)";
                lastTime = performance.now();
                requestAnimationFrame(gameLoop);
            }
        }

        function showGameOver() {
            gameRunning = false; gameOver = true;
            gameOverScreen.querySelector('h1').textContent = "MISSION FAILED"; // Ensure correct title
            gameOverScreen.style.display = 'flex';
            finalScoreDisplay.textContent = score;
            wavesSurvivedDisplay.textContent = waveNumber - 1;
            cancelAnimationFrame(animationId);
        }

        // Add the new showGameWin function
        function showGameWin() {
            gameRunning = false; gameOver = true; // Reuse gameOver state
            gameOverScreen.querySelector('h1').textContent = "MISSION ACCOMPLISHED!";
            gameOverScreen.style.display = 'flex';
            finalScoreDisplay.textContent = score;
            // Show 100 for waves survived on win
            wavesSurvivedDisplay.textContent = MAX_WAVES;
            cancelAnimationFrame(animationId);
        }

        // --- Music & Sound ---
        // Music functions should be completely removed here


        // --- Updates ---
        function updateScoreDisplay() { scoreDisplay.textContent = `Score: ${score}`; }
        function updateResourcesDisplay() {
            resourcesDisplay.textContent = `Resources: $${Math.floor(resources)}`;
            updateAllTowerOptionStatus();
        }
        function updateWaveDisplay() { 
            // Update wave display based on endless mode
            waveDisplay.textContent = `Wave: ${isEndlessMode ? waveNumber : `${waveNumber}/${MAX_WAVES}`}`;
         }
        function updateIncomeDisplay() {
            let totalIncome = passive_income;
            towers.forEach(tower => { if(tower.type === 'generator' && !tower.isDisabled) totalIncome += tower.incomeRate; }); // Only add if not disabled
            incomeDisplay.textContent = `Income: +$${totalIncome.toFixed(1)}/sec`;
        }
        function updateNextWaveTimerDisplay(timeRemaining, waveInProgress) {
             if (waveInProgress) {
                const enemiesRemaining = enemies.length;
                 nextWaveTimerDisplay.textContent = `Enemies Left: ${enemiesRemaining}`;
                 nextWaveTimerDisplay.style.color = '#ff4080';
             } else if (waveNumber === 0) { // Special handling for before Wave 1 (Fix syntax)
                 if (timeRemaining > 0) {
                     nextWaveTimerDisplay.textContent = `Wave 1 starts: ${Math.ceil(timeRemaining / 1000)}s`;
                     nextWaveTimerDisplay.style.color = '#ff8040';
                 } else {
                     nextWaveTimerDisplay.textContent = `Wave 1 starts: NOW`;
                     nextWaveTimerDisplay.style.color = '#ff6060';
                 }
             } else if (timeRemaining > 0) {
                nextWaveTimerDisplay.textContent = `Next wave: ${Math.ceil(timeRemaining / 1000)}s`;
                nextWaveTimerDisplay.style.color = '#ff8040';
             } else {
                nextWaveTimerDisplay.textContent = `Next wave: NOW`;
                 nextWaveTimerDisplay.style.color = '#ff6060';
             }
        }
        function updateHealthBar() {
            const healthPercent = Math.max(0, (baseHealth / BASE_MAX_HEALTH) * 100);
            healthBar.style.width = `${healthPercent}%`;
            healthBar.style.backgroundColor = healthPercent > 60 ? '#4080ff' : healthPercent > 30 ? '#ffc040' : '#ff4040';
        }
        function updateTowerCostDisplay() {
             document.querySelectorAll('.tower-option').forEach(option => {
                 const type = option.getAttribute('data-type');
                 const cost = TOWER_TYPES[type]?.cost ?? 0;
                 option.querySelector('.tower-cost').textContent = `$${cost}`;
             });
        }
        function updateAllTowerOptionStatus() {
             document.querySelectorAll('.tower-option').forEach(option => {
                 const type = option.getAttribute('data-type');
                 const cost = TOWER_TYPES[type]?.cost ?? Infinity;
                 option.classList.toggle('disabled', resources < cost);
             });
        }


        // --- Event Handlers ---
        function handleMouseMove(e) {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top;
            if (towerTooltip.style.display === 'block') positionTooltip(e);
        }

        function handleCanvasClick(e) {
            e.preventDefault();
            if (!gameRunning || gamePaused || gameOver) return;
            const clickX = mouseX; const clickY = mouseY;

            // Resource drops check
            let dropClicked = false;
            for (let i = resourceDrops.length - 1; i >= 0; i--) {
                const drop = resourceDrops[i];
                if (getDistance(clickX, clickY, drop.x, drop.y) <= drop.radius * 1.5) {
                    resources += drop.value;
                    createFloatingText(`+$${drop.value}`, drop.x, drop.y, 'resource');
                    resourceDrops.splice(i, 1);
                    updateResourcesDisplay(); playSound('collect');
                    createHitEffect(drop.x, drop.y, 10, '#40ff80', 3, 300);
                    dropClicked = true;
                    break; // Only collect one drop per click
                }
            }
            if (dropClicked) return; // Don't place tower if drop was clicked

            // Place tower
            if (selectedTowerType) placeTower(clickX, clickY);
        }

        function handleCanvasRightClick(e) {
            e.preventDefault();
            if (!gameRunning || gamePaused || gameOver) return;
            const clickX = mouseX; const clickY = mouseY;
            const clickedTower = towers.find(tower => isPointInTower(clickX, clickY, tower));

            if (clickedTower) {
                showTowerMenu(clickedTower, clickX, clickY);
                deselectTowerType();
            } else {
                hideTowerMenu();
                deselectTowerType();
            }
        }

        // Updated to use event delegation
        function handleTowerOptionClick(e) {
            const targetOption = e.target.closest('.tower-option');
            if (!targetOption || gamePaused) return;
            e.stopPropagation();

            const type = targetOption.getAttribute('data-type');
             const cost = TOWER_TYPES[type]?.cost ?? Infinity;
             if (resources < cost) {
                 playSound('error');
                 resourcesDisplay.classList.add('error');
                 setTimeout(() => resourcesDisplay.classList.remove('error'), 300);
                 return;
             }
            selectTowerType(type);
            hideTowerMenu();
        }
         // Updated to use event delegation target check
        function handleTowerOptionEnter(e) {
            const targetOption = e.target.closest('.tower-option');
            if (!targetOption) {
                 // If moving mouse out of an option but still within container, hide tooltip
                 if (towerTooltip.style.display === 'block' && !e.relatedTarget?.closest('.tower-option')) {
                     handleTowerOptionLeave();
                 }
                 return;
            }
            const type = targetOption.getAttribute('data-type');
            const towerData = TOWER_TYPES[type];
            if (!towerData) return;

            // --- Tooltip content generation (unchanged) ---
             let tooltipContent = `<strong>${towerData.name}</strong> <span class="cost">($${towerData.cost})</span>\n`;
             if (towerData.range > 0) tooltipContent += `Range: ${towerData.range}`;
             if (towerData.minRange > 0) tooltipContent += ` (Min: ${towerData.minRange})`;
             tooltipContent += `\n`;
             if (towerData.damage > 0) { const dps = (towerData.damage * towerData.fireRate).toFixed(1); tooltipContent += `Damage: ${towerData.damage}\nFire Rate: ${towerData.fireRate.toFixed(1)}/s\nDPS: ${dps}\n`; }
             if (towerData.chainTargets > 0) tooltipContent += `<span class="special">Chain: ${towerData.chainTargets} (Falloff: ${Math.round((1-towerData.chainFalloff)*100)}%)</span>\n`;
             if (towerData.pierce > 0) tooltipContent += `<span class="special">Pierce: ${towerData.pierce} targets</span>\n`;
             if (towerData.isCone) tooltipContent += `<span class="special">Type: Cone Burst</span>\n`;
             if (towerData.splashRadius > 0) tooltipContent += `<span class="special">Splash: ${towerData.splashRadius} radius</span>\n`;
             if (towerData.slowFactor > 0) tooltipContent += `<span class="special">Slow: ${Math.round((1-towerData.slowFactor)*100)}% for ${towerData.slowDuration/1000}s</span>\n`;
             if (towerData.ampFactor > 0) tooltipContent += `<span class="special">Amplify: +${Math.round((towerData.ampFactor-1)*100)}% Dmg for ${towerData.ampDuration/1000}s</span>\n`;
             if (towerData.mineDamage > 0) tooltipContent += `<span class="special">Mine Dmg: ${towerData.mineDamage} (Max: ${towerData.maxMines})</span>\n`;
             if (towerData.freezeDuration > 0) tooltipContent += `<span class="special">Freeze: ${towerData.freezeDuration/1000}s</span>\n`;
             if (towerData.incomeRate > 0) tooltipContent += `<span class="income">Income: +$${towerData.incomeRate.toFixed(1)}/sec</span>\n`;
             if (towerData.buffFactor > 0) tooltipContent += `<span class="buff">Boost: +${Math.round(towerData.buffFactor*100)}% Dmg/Rate (Range: ${towerData.range})</span>\n`;
             tooltipContent += `\n${towerData.description}`;
            // --- End Tooltip content ---

             towerTooltip.innerHTML = tooltipContent;
             towerTooltip.style.display = 'block';
             positionTooltip(e);
        }
        // Updated to use event delegation check
        function handleTowerOptionLeave(e) {
             const relatedTargetOption = e.relatedTarget?.closest('.tower-option');
             // Hide only if moving outside the container or to a non-option element
             if (!relatedTargetOption || !towerSelectContainer.contains(e.relatedTarget)) {
                  towerTooltip.style.display = 'none';
             }
        }


        function handleDifficultyClick(e) {
             e.stopPropagation(); if (gameRunning) return;
             difficulty = e.currentTarget.getAttribute('data-difficulty');
             difficultyButtons.forEach(btn => btn.classList.remove('selected'));
             e.currentTarget.classList.add('selected');
             applyDifficultySettings();
        }

        function handleUpgradeClick() { if (selectedTower) upgradeTower(selectedTower); hideTowerMenu(); }
        function handleSellClick() { if (selectedTower) sellTower(selectedTower); hideTowerMenu(); }

        function handleDocumentClick(e) {
             if (towerMenu.style.display === 'block' && !towerMenu.contains(e.target) && !e.target.closest('.tower-option') && !towers.some(t => isPointInTower(mouseX, mouseY, t))) {
                 hideTowerMenu();
             }
        }

        function handleKeyDown(e) {
             if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePause(); return; }
             if (gamePaused || gameOver) return;

             let targetType = null;
             switch (e.key) {
                 case '1': targetType = 'laser'; break; case '2': targetType = 'cannon'; break; case '3': targetType = 'missile'; break; case '4': targetType = 'slow'; break;
                 case '5': targetType = 'chain'; break; case '6': targetType = 'railgun'; break; case '7': targetType = 'flame'; break; case '8': targetType = 'generator'; break;
                 case '9': targetType = 'amplifier'; break; case '0': targetType = 'mortar'; break; case '-': targetType = 'sniper'; break; case '=': targetType = 'mine'; break;
                 case '[': targetType = 'booster'; break; case ']': targetType = 'cryo'; break;
                 case 'Escape': deselectTowerType(); break;
             }

             if (targetType) {
                 const cost = TOWER_TYPES[targetType]?.cost ?? Infinity;
                 if (resources >= cost) {
                     selectTowerType(targetType);
                 } else {
                     playSound('error');
                     resourcesDisplay.classList.add('error');
                     setTimeout(() => resourcesDisplay.classList.remove('error'), 300);
                 }
             }
        }

        function selectTowerType(type) {
             if (!TOWER_TYPES[type]) return;
             if (selectedTowerType === type) {
                 deselectTowerType();
             } else {
                 selectedTowerType = type;
                 document.querySelectorAll('.tower-option').forEach(opt => {
                     opt.classList.toggle('selected', opt.getAttribute('data-type') === type);
                 });
                 hideTowerMenu();
             }
         }

         function deselectTowerType() {
             selectedTowerType = null;
             document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
         }

        function positionTooltip(e) {
             const rect = gameContainer.getBoundingClientRect(); let x = e.clientX - rect.left + 15; let y = e.clientY - rect.top - towerTooltip.offsetHeight - 10;
             if (y < 10) y = e.clientY - rect.top + 15; if (x + towerTooltip.offsetWidth > GAME_WIDTH - 10) x = GAME_WIDTH - towerTooltip.offsetWidth - 10;
             x = Math.max(10, x); towerTooltip.style.left = `${x}px`; towerTooltip.style.top = `${y}px`;
        }


        // --- Tower Logic ---
        function placeTower(clickX, clickY) {
            const gridX = Math.floor(clickX / GRID_SIZE) * GRID_SIZE; const gridY = Math.floor(clickY / GRID_SIZE) * GRID_SIZE;
            if (!selectedTowerType) return; // Add check
            const towerCost = TOWER_TYPES[selectedTowerType].cost;
            const gridCell = placementGrid.find(cell => cell.x === gridX && cell.y === gridY);

            if (gridCell && !gridCell.occupied && resources >= towerCost) {
                resources -= towerCost;
                const towerData = TOWER_TYPES[selectedTowerType];
                const newTower = {
                    type: selectedTowerType, x: gridX + GRID_SIZE / 2, y: gridY + GRID_SIZE / 2,
                    origGridX: gridX, origGridY: gridY, width: GRID_SIZE * 0.8, height: GRID_SIZE * 0.8,
                    range: towerData.range, minRange: towerData.minRange || 0,
                    damage: towerData.damage, fireRate: towerData.fireRate,
                    slowFactor: towerData.slowFactor, slowDuration: towerData.slowDuration,
                    chainTargets: towerData.chainTargets, chainRange: towerData.chainRange, chainFalloff: towerData.chainFalloff,
                    pierce: towerData.pierce, incomeRate: towerData.incomeRate,
                    ampFactor: towerData.ampFactor, ampDuration: towerData.ampDuration,
                    mineDamage: towerData.mineDamage, mineRadius: towerData.mineRadius, mineLifetime: towerData.mineLifetime, maxMines: towerData.maxMines, currentMines: 0,
                    buffFactor: towerData.buffFactor, freezeDuration: towerData.freezeDuration,
                    lastFireTime: 0, target: null, level: 1, rotation: 0, // Removed targetPriority: 'first',
                    gridCell: gridCell, isDisabled: false, disabledUntil: 0, currentBuffFactor: 1.0,
                };
                towers.push(newTower);
                gridCell.occupied = true; gridCell.tower = newTower;
                updateResourcesDisplay(); updateIncomeDisplay();
                playSound('build'); deselectTowerType();
            } else {
                showPlacementError(clickX, clickY, gridCell, towerCost);
            }
        }

        function showPlacementError(clickX, clickY, gridCell, towerCost) {
             playSound('error'); let message = "Cannot place here!";
             if (!selectedTowerType) message = "No tower selected!"; // Added check
             else if (!gridCell) message = "Too close to edge/base!";
             else if (gridCell.occupied) message = "Location occupied!";
             else if (resources < towerCost) { message = "Insufficient Funds!"; resourcesDisplay.classList.add('error'); setTimeout(() => resourcesDisplay.classList.remove('error'), 300); }
             createFloatingText(message, clickX, clickY - 20, 'error');
        }

        function isPointInTower(px, py, tower) { return px >= tower.x - tower.width/2 && px <= tower.x + tower.width/2 && py >= tower.y - tower.height/2 && py <= tower.y + tower.height/2; }

        function showTowerMenu(tower, menuX, menuY) {
             selectedTower = tower;
             const upgradeCost = getTowerUpgradeCost(tower);
             const sellValue = getTowerSellValue(tower);
             const canUpgrade = tower.level < MAX_TOWER_LEVEL;

             upgradeButton.textContent = canUpgrade ? `Upgrade ($${upgradeCost})` : `Max Level`;
             sellButton.textContent = `Sell ($${sellValue})`;
             upgradeButton.disabled = resources < upgradeCost || !canUpgrade;

             // Remove targeting UI logic
             /*
             const showTargeting = !TOWER_TYPES[tower.type].nonTargeting;
             towerMenu.querySelector('.target-priority-label').style.display = showTargeting ? 'block' : 'none';
             targetingButtons.forEach(btn => {
                 btn.style.display = showTargeting ? 'block' : 'none';
                 if (showTargeting) btn.classList.toggle('active', btn.getAttribute('data-priority') === tower.targetPriority);
             });
             */

             // Adjust menu height calculation if needed (it might auto-adjust now)
             const menuWidth = towerMenu.offsetWidth || 150;
             // const menuHeight = towerMenu.offsetHeight || (showTargeting ? 200 : 100); // Simplified height or let CSS handle it
             const menuHeight = towerMenu.offsetHeight || 100; // Estimate a fixed height or rely on auto


             let left = menuX + 10, top = menuY + 10;
             if (left + menuWidth > GAME_WIDTH) left = menuX - menuWidth - 10;
             if (top + menuHeight > GAME_HEIGHT) top = menuY - menuHeight - 10;
             towerMenu.style.left = `${Math.max(5, left)}px`;
             towerMenu.style.top = `${Math.max(5, top)}px`;
             towerMenu.style.display = 'block';
        }

        function hideTowerMenu() { towerMenu.style.display = 'none'; selectedTower = null; }

        function getTowerUpgradeCost(tower) {
             const baseUpgradeCost = TOWER_TYPES[tower.type].upgradeCost;
             return Math.floor(baseUpgradeCost * Math.pow(1.5, tower.level - 1));
        }

        function getTowerSellValue(tower) {
            let totalCost = TOWER_TYPES[tower.type].cost;
            for (let i = 1; i < tower.level; i++) totalCost += getTowerUpgradeCost({ ...tower, level: i }); // Use getTowerUpgradeCost for accuracy
            return Math.floor(totalCost * 0.6);
        }


        function upgradeTower(tower) {
            if (tower.level >= MAX_TOWER_LEVEL) return;
            const cost = getTowerUpgradeCost(tower);
            if (resources >= cost) {
                resources -= cost; tower.level++;
                const typeData = TOWER_TYPES[tower.type];
                const multiplier = typeData.upgradeMultiplier;

                // Apply upgrades - Re-calculating from base stats is safer for complex upgrades
                const baseTower = TOWER_TYPES[tower.type];
                if (tower.damage > 0) tower.damage = Math.round(baseTower.damage * Math.pow(multiplier, tower.level - 1));
                if (tower.range > 0) tower.range = baseTower.range + (tower.level - 1) * (tower.type === 'slow' || tower.type === 'amplifier' || tower.type === 'booster' ? 8 : 5); // Linear range increase from base
                if (tower.type === 'slow') tower.slowDuration = baseTower.slowDuration + (tower.level - 1) * 250;
                if (tower.type === 'chain') { tower.chainTargets = baseTower.chainTargets + Math.floor((tower.level - 1) / 2); tower.chainRange = baseTower.chainRange + (tower.level - 1) * 5;}
                if (tower.type === 'railgun') tower.pierce = baseTower.pierce + Math.min(2, tower.level - 1); // Cap pierce upgrade
                if (tower.type === 'generator') tower.incomeRate = baseTower.incomeRate * Math.pow(multiplier, tower.level - 1);
                if (tower.type === 'amplifier') { tower.ampFactor = baseTower.ampFactor + (tower.level - 1) * 0.1; tower.ampDuration = baseTower.ampDuration + (tower.level - 1) * 300;}
                if (tower.type === 'mine') { tower.mineDamage = baseTower.mineDamage + (tower.level - 1) * 15; tower.maxMines = baseTower.maxMines + (tower.level - 1) * 1; }
                if (tower.type === 'booster') tower.buffFactor = baseTower.buffFactor + (tower.level - 1) * 0.05;
                if (tower.type === 'cryo') tower.freezeDuration = baseTower.freezeDuration + (tower.level - 1) * 200;

                updateResourcesDisplay(); updateIncomeDisplay(); playSound('upgrade');
                createHitEffect(tower.x, tower.y, 15, '#40ff80', 4, 400);
                 if (towerMenu.style.display === 'block' && selectedTower === tower) {
                     showTowerMenu(tower, parseInt(towerMenu.style.left), parseInt(towerMenu.style.top));
                 }
            } else {
                playSound('error'); createFloatingText("Insufficient Funds!", tower.x, tower.y - 20, 'error');
            }
        }

        function sellTower(tower) {
            const sellValue = getTowerSellValue(tower);
            resources += sellValue;
            if (tower.gridCell) { tower.gridCell.occupied = false; tower.gridCell.tower = null; }
            mines = mines.filter(mine => { if (mine.owner === tower) { returnMine(mine); return false; } return true; });
            towers = towers.filter(t => t !== tower); // Filter OUT the sold tower
            updateResourcesDisplay(); updateIncomeDisplay(); playSound('sell');
            createHitEffect(tower.x, tower.y, 10, '#ff6060', 3, 500);
        }


        // --- Enemy Logic ---
        function spawnWave() {
             // waveNumber++; // MOVED - increment now happens in handleWaveClear
             // updateWaveDisplay(); // MOVED - display update now happens in handleWaveClear

             const diffMult = DIFFICULTY_SETTINGS[difficulty];
             const endlessScale = isEndlessMode ? Math.pow(1.025, waveNumber - 1) : 1;
             let enemyCount = 8 + Math.floor(waveNumber * 2.2 * diffMult.wave * endlessScale);
             enemyCount = Math.max(5, Math.min(enemyCount, 200)); // Ensure at least 5, max 200

             const spawnInterval = Math.max(100, 550 - waveNumber * 8);
             let enemiesSpawned = 0; waveStartTime = timestamp;

             const spawnTimer = setInterval(() => {
                if (!gameRunning || gamePaused) return;
                 if (enemiesSpawned >= enemyCount) { clearInterval(spawnTimer); return; }

                 const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
                 let type = 'basic'; const rand = Math.random(); const waveFactor = (waveNumber / 25);
                 if (waveNumber > 3 && rand < 0.18 + waveFactor * 0.2) type = 'fast';
                 if (waveNumber > 8 && rand < 0.10 + waveFactor * 0.15) type = 'tank';
                 if (waveNumber > 6 && rand < 0.12 + waveFactor * 0.18) type = 'shielded';
                 if (waveNumber > 10 && rand < 0.08 + waveFactor * 0.12) type = 'disruptor';
                 if (waveNumber > 14 && rand < 0.06 + waveFactor * 0.1) type = 'boss';

                 enemies.push(createEnemy(spawnPoint.x, spawnPoint.y, type)); enemiesSpawned++;
             }, spawnInterval);
             nextWaveTime = 0;
        }

        function createEnemy(x, y, type) {
            const diffMult = DIFFICULTY_SETTINGS[difficulty];
            const waveScale = 1 + (waveNumber - 1) * 0.07;
            const endlessScale = isEndlessMode ? Math.pow(1.035, Math.max(0, waveNumber - 5)) : 1;
            let health, speed, size, color, points, value, shape, shield = 0, maxShield = 0, shieldRegen = 0;
            let isDisabler = false, disablingRange = 0, disableDuration = 0, disableCooldown = 0;

            switch(type) {
                case 'fast':      health=25; speed=1.9; size=12; color='#80ff40'; points=12; value=6; shape='delta'; break;
                case 'tank':      health=180; speed=0.6; size=22; color='#a060ff'; points=25; value=15; shape='block'; break;
                case 'shielded':  health=60; speed=0.8; size=18; color='#40a0ff'; points=20; value=12; shape='shield'; shield=90; maxShield=90; shieldRegen=1.8; break;
                case 'disruptor': health=80; speed=1.1; size=17; color='#dda0dd'; points=30; value=18; shape='disrupt'; isDisabler=true; disablingRange=150; disableDuration=5000; disableCooldown=8000; break;
                case 'boss':      health=600; speed=0.4; size=35; color='#ff4040'; points=100; value=40; shape='diamond'; break;
                default:          health=50; speed=1.0; size=16; color='#ff8040'; points=8; value=4; shape='standard'; break;
            }

            health = (health + waveNumber * (type === 'boss' ? 18 : type === 'tank' ? 6 : type === 'shielded' ? 5 : type === 'disruptor' ? 5 : 4)) * waveScale * diffMult.health * endlessScale;
            speed = (speed + waveNumber * 0.002) * diffMult.speed;
            shield = (shield + waveNumber * (type === 'shielded' ? 6 : 0)) * waveScale * diffMult.health * endlessScale; maxShield = shield;
            value = value * diffMult.resource;

            return {
                x, y, type, shape, health: Math.floor(health), maxHealth: Math.floor(health),
                shield: Math.floor(shield), maxShield: Math.floor(shield), shieldRegen: shieldRegen * endlessScale, lastShieldDamageTime: 0,
                baseSpeed: speed, size, color, points, value: Math.ceil(value), alive: true, rotation: Math.random() * Math.PI * 2,
                isSlowed: false, slowFactor: 1, slowEndTime: 0, isFrozen: false, freezeEndTime: 0,
                damageTakenMultiplier: 1.0, ampEndTime: 0, isDisabler, disablingRange, disableDuration, disableCooldown, lastDisableTime: 0,
                distanceToBase: Infinity
            };
        }

        function damageBase(enemy) {
            let damage = 5;
            switch(enemy.type) { case 'fast': damage=3; break; case 'tank': damage=12; break; case 'boss': damage=30; break; case 'shielded': damage = 6; break; case 'disruptor': damage=4; break; }
            baseHealth -= damage; updateHealthBar(); createExplosion(BASE_X, BASE_Y, 20, '#ff6060', 5, 800); playSound('baseHit'); flashScreen('#ff0000');
        }

        function damageEnemy(enemy, damage, projectileX, projectileY) {
            if (!enemy.alive || enemy.health <= 0) return;

            let finalDamage = damage;
            if (enemy.damageTakenMultiplier > 1.0 && timestamp < enemy.ampEndTime) { finalDamage *= enemy.damageTakenMultiplier; }
            else if (timestamp >= enemy.ampEndTime) { enemy.damageTakenMultiplier = 1.0; }
            finalDamage = Math.floor(finalDamage);

            let damageDealt = 0; let damageType = 'damage';

            if (enemy.shield > 0) {
                 const shieldDamage = Math.min(enemy.shield, finalDamage); enemy.shield -= shieldDamage; damageDealt = shieldDamage; damageType = 'shield-damage';
                 enemy.lastShieldDamageTime = timestamp; if (enemy.shield <= 0) playSound('shieldBreak'); else playSound('shieldHit');
            }
            if (enemy.shield <= 0 && finalDamage > damageDealt) {
                 const healthDamage = Math.min(enemy.health, finalDamage - damageDealt); enemy.health -= healthDamage; damageDealt += healthDamage;
                 damageType = (damageType === 'shield-damage' && healthDamage > 0) ? 'damage' : damageType; playSound('enemyHit');
            }
            if (damageDealt > 0) createFloatingText(Math.floor(damageDealt).toString(), projectileX, projectileY, damageType);

            if (enemy.health <= 0) {
                enemy.alive = false; score += enemy.points; resources += enemy.value;
                const dropChance = enemy.type==='boss'?0.4:enemy.type==='tank'?0.2:enemy.type==='disruptor'?0.15:enemy.type==='shielded'?0.12:0.08;
                if (Math.random() < dropChance) { spawnResourceDrop(enemy.x, enemy.y, Math.ceil(enemy.value * (0.6 + Math.random()*0.6))); }
                updateScoreDisplay(); updateResourcesDisplay();
                createExplosion(enemy.x, enemy.y, 15 + enemy.size * 0.5, enemy.color, 4 + enemy.size * 0.2, 600 + enemy.size * 10);
                playSound('enemyDestroyed');
            }
        }

        function handleWaveClear() {
            // Calculate bonus for current wave
            const currentWave = waveNumber;
            const waveBonus = Math.floor(50 + currentWave * 5 * DIFFICULTY_SETTINGS[difficulty].resource);
            resources += waveBonus;
            
            // Increment wave number after calculating bonus
            waveNumber++;
            updateWaveDisplay(); // Update display to show new wave
            
            // Message now references the wave we are moving to, not the one that just ended
            createFloatingText(`Wave ${currentWave} Complete! +$${waveBonus}`, BASE_X, BASE_Y - BASE_RADIUS - 30, 'wave-bonus');
            updateResourcesDisplay();

            // Check for win condition (we just completed MAX_WAVES)
            if (!isEndlessMode && waveNumber > MAX_WAVES) { 
                showGameWin();
                return; // Stop further wave processing
            }

            // Prepare next wave
            nextWaveTime = 15000 - Math.min(10000, waveNumber * 100); // Time between waves decreases
            nextWaveTime = Math.max(5000, nextWaveTime); // Minimum 5 seconds between waves
            waveStartTime = timestamp + nextWaveTime;
            
            // Display message for upcoming wave
            createFloatingText(`Wave ${waveNumber} Incoming!`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'wave-start');
        }

        // --- Resource Drops ---
        function spawnResourceDrop(x, y, value = 0) { let dropX, dropY, dropValue; if (x !== undefined && y !== undefined) { dropX = x + (Math.random() - 0.5) * 20; dropY = y + (Math.random() - 0.5) * 20; dropValue = value; } else { let attempts = 0; do { dropX = GRID_SIZE + Math.random()*(GAME_WIDTH - 2*GRID_SIZE); dropY = GRID_SIZE + Math.random()*(GAME_HEIGHT - 2*GRID_SIZE); attempts++; } while (attempts < 20 && (getDistance(dropX, dropY, BASE_X, BASE_Y) < BASE_RADIUS * 2.5 || towers.some(t => getDistance(dropX, dropY, t.x, t.y) < GRID_SIZE))); if (attempts === 20) return; dropValue = 10 + Math.floor(Math.random()*5) + Math.floor(waveNumber * 1.2 * DIFFICULTY_SETTINGS[difficulty].resource); } dropValue = Math.max(1, dropValue); resourceDrops.push({ x: dropX, y: dropY, value: dropValue, radius: 8 + Math.log(dropValue + 1), createdAt: timestamp, pulseOffset: Math.random() * Math.PI * 2 }); }

        // --- Floating Text & Screen Flash ---
         function createFloatingText(text, x, y, type = 'damage') { const element = document.createElement('div'); element.className = `floating-text ${type}`; element.textContent = text; element.style.left = `${(x / GAME_WIDTH) * 100}%`; element.style.top = `${(y / GAME_HEIGHT) * 100}%`; gameContainer.appendChild(element); const duration = parseFloat(getComputedStyle(element).animationDuration || '1') * 1000; setTimeout(() => element.remove(), duration); }
         function flashScreen(color = '#ff0000') { screenFlashElement.style.backgroundColor = color; screenFlashElement.style.display = 'block'; screenFlashElement.style.animation = 'none'; void screenFlashElement.offsetWidth; screenFlashElement.style.animation = 'flash 0.3s ease-out'; setTimeout(() => screenFlashElement.style.display = 'none', 310); }


        // --- Game Loop ---
        function gameLoop(newTime) {
            timestamp = newTime; if (gameOver) return;
            const deltaTime = Math.min(50, (timestamp - lastTime)) * timeScale; // Clamp deltaTime
            lastTime = timestamp;

            if (!gamePaused) {
                updatePassiveIncome(deltaTime); updateWaveSpawning(deltaTime);
                updateBoosters(); updateTowers(deltaTime); updateEnemies(deltaTime);
                updateProjectiles(deltaTime); updateMines(deltaTime); updateParticles(deltaTime);
                updateResourceDrops(deltaTime); updateActiveEffects(deltaTime);

                if (enemies.length === 0 && nextWaveTime <= 0 && gameRunning && waveStartTime !== 0 && timestamp > waveStartTime) { handleWaveClear(); }
                if (baseHealth <= 0) { showGameOver(); return; }
            }

            // --- Drawing ---
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            drawStarBackground(); drawGrid(); drawBase(); drawMines(); drawTowers(); drawEnemies();
            drawProjectiles(); drawParticles(); drawResourceDrops(); drawActiveEffects();
            if (selectedTowerType && !gamePaused) drawTowerPreview();
            if (selectedTower) drawTowerRange(selectedTower);
            drawDisableEffects();

            animationId = requestAnimationFrame(gameLoop);
        }

        // --- Update Sub-functions ---
        function updatePassiveIncome(deltaTime) {
            let currentPassive = passive_income;
            towers.forEach(tower => { if(tower.type === 'generator' && !tower.isDisabled) currentPassive += tower.incomeRate; });
            resources += currentPassive * (deltaTime / 1000);
            if (timestamp - lastResourceTime >= 1000) { updateResourcesDisplay(); updateIncomeDisplay(); lastResourceTime = timestamp; }
        }
        function updateWaveSpawning(deltaTime) {
            if (timestamp - lastResourceDrop > 12000) { spawnResourceDrop(); lastResourceDrop = timestamp; }
            const waveInProgress = enemies.length > 0;
             if (!waveInProgress && nextWaveTime > 0) { const timeRemaining = waveStartTime - timestamp; updateNextWaveTimerDisplay(timeRemaining, false); if (timeRemaining <= 0) { spawnWave(); updateNextWaveTimerDisplay(0, true); } }
             else if (waveInProgress) { updateNextWaveTimerDisplay(0, true); }
        }

        function updateBoosters() {
            towers.forEach(t => t.currentBuffFactor = 1.0);
            const boosterTowers = towers.filter(t => t.type === 'booster' && !t.isDisabled);
            towers.forEach(targetTower => {
                 if (targetTower.type === 'booster' || targetTower.type === 'generator' || targetTower.isDisabled) return;
                 let totalBuff = 0;
                 boosterTowers.forEach(booster => { if (getDistance(targetTower.x, targetTower.y, booster.x, booster.y) <= booster.range) { totalBuff += booster.buffFactor; } });
                 targetTower.currentBuffFactor = 1.0 + totalBuff;
            });
        }

        function updateTowers(deltaTime) {
            towers.forEach(tower => {
                if (tower.isDisabled && timestamp < tower.disabledUntil) return;
                else if (tower.isDisabled && timestamp >= tower.disabledUntil) { tower.isDisabled = false; createHitEffect(tower.x, tower.y, 10, '#ffffff', 2, 300); playSound('enableTower'); }

                const isTargetingTower = !TOWER_TYPES[tower.type].nonTargeting;
                if (isTargetingTower) {
                    if (!tower.target || !tower.target.alive || tower.target.isFrozen ||
                        getDistance(tower.x, tower.y, tower.target.x, tower.target.y) > tower.range * tower.currentBuffFactor ||
                        getDistance(tower.x, tower.y, tower.target.x, tower.target.y) < tower.minRange)
                    { tower.target = findTarget(tower); }
                    updateTowerRotation(tower, deltaTime);
                }

                 const effectiveFireRate = tower.fireRate * tower.currentBuffFactor;
                 if (effectiveFireRate > 0 && timestamp > tower.lastFireTime + (1000 / effectiveFireRate)) {
                    if ((isTargetingTower && tower.target) || !isTargetingTower) {
                         if (tower.type === 'mortar' && tower.target && getDistance(tower.x, tower.y, tower.target.x, tower.target.y) < tower.minRange) { /* Too close */ }
                         else { fireTowerWeapon(tower); tower.lastFireTime = timestamp; }
                    }
                 }
            });
        }
        function updateTowerRotation(tower, deltaTime) {
             if (!tower.target || TOWER_TYPES[tower.type].nonTargeting) { tower.rotation = 0; return; } // Reset rotation for non-targeting or no target
             const targetAngle = Math.atan2(tower.target.y - tower.y, tower.target.x - tower.x);
             let angleDiff = targetAngle - tower.rotation; while (angleDiff > Math.PI) angleDiff -= Math.PI * 2; while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
             const rotationSpeed = Math.PI * 4 * (deltaTime / 1000);
             tower.rotation += Math.max(-rotationSpeed, Math.min(rotationSpeed, angleDiff));
         }
        function updateEnemies(deltaTime) {
            enemies = enemies.filter(e => e.alive);
            const dtSeconds = deltaTime / 1000;
            enemies.forEach(enemy => {
                if (enemy.isSlowed && timestamp > enemy.slowEndTime) enemy.isSlowed = false;
                if (enemy.isFrozen && timestamp > enemy.freezeEndTime) enemy.isFrozen = false;
                if (enemy.damageTakenMultiplier > 1.0 && timestamp > enemy.ampEndTime) enemy.damageTakenMultiplier = 1.0;

                let speedFactor = 1; if (enemy.isFrozen) speedFactor = 0; else if (enemy.isSlowed) speedFactor = enemy.slowFactor;
                const currentSpeed = enemy.baseSpeed * speedFactor * timeScale;

                if (currentSpeed > 0) {
                    const angle = Math.atan2(BASE_Y - enemy.y, BASE_X - enemy.x);
                    enemy.x += Math.cos(angle) * currentSpeed * dtSeconds * 60;
                    enemy.y += Math.sin(angle) * currentSpeed * dtSeconds * 60;
                    enemy.rotation = angle;
                }
                enemy.distanceToBase = getDistance(enemy.x, enemy.y, BASE_X, BASE_Y);
                if (enemy.distanceToBase < BASE_RADIUS + enemy.size / 2) { damageBase(enemy); enemy.alive = false; }
                if (enemy.isDisabler && enemy.alive && !gamePaused && timestamp > enemy.lastDisableTime + enemy.disableCooldown) { tryDisableTower(enemy); }
            });
        }
         function tryDisableTower(disruptor) {
             let closestTower = null; let minDist = disruptor.disablingRange + 1;
             towers.forEach(tower => {
                 if (!tower.isDisabled) {
                     const dist = getDistance(disruptor.x, disruptor.y, tower.x, tower.y);
                     if (dist < minDist && dist <= disruptor.disablingRange) { minDist = dist; closestTower = tower; }
                 }
             });
             if (closestTower) {
                 closestTower.isDisabled = true; closestTower.disabledUntil = timestamp + disruptor.disableDuration;
                 disruptor.lastDisableTime = timestamp; createDisableEffect(disruptor, closestTower);
                 playSound('disableTower'); createFloatingText('Disabled!', closestTower.x, closestTower.y - 20, 'disable');
             }
         }
         function createDisableEffect(source, target) {
             activeDisableEffects.push({ sourceX: source.x, sourceY: source.y, targetX: target.x, targetY: target.y, startTime: timestamp, duration: 500 });
         }
         function updateActiveEffects(deltaTime) {
             activeDisableEffects = activeDisableEffects.filter(effect => timestamp < effect.startTime + effect.duration);
             activeEffects = activeEffects.filter(effect => { if (timestamp > effect.endTime) { if (effect.element) effect.element.remove(); return false; } return true; });
         }


        function updateProjectiles(deltaTime) {
             const dtSeconds = deltaTime / 1000;
             projectiles.forEach(proj => {
                 if (!proj.alive) return;
                 const speed = proj.speed * timeScale * dtSeconds * 60;

                 if (proj.type === 'missile' && proj.target?.alive && !proj.target.isFrozen) {
                     const targetAngle = Math.atan2(proj.target.y - proj.y, proj.target.x - proj.x);
                     let angleDiff = targetAngle - proj.angle; while (angleDiff > Math.PI) angleDiff -= Math.PI*2; while (angleDiff < -Math.PI) angleDiff += Math.PI*2;
                     const turnRate = Math.PI * 3.5 * dtSeconds; proj.angle += Math.max(-turnRate, Math.min(turnRate, angleDiff));
                 } else if (proj.type === 'missile') { proj.target = null; }

                 proj.x += Math.cos(proj.angle) * speed; proj.y += Math.sin(proj.angle) * speed;
                 proj.lifetime -= deltaTime;
                 if (proj.lifetime <= 0 || proj.x < -50 || proj.x > GAME_WIDTH+50 || proj.y < -50 || proj.y > GAME_HEIGHT+50) { proj.alive = false; returnProjectile(proj); return; }

                 let hit = false; let piercedCount = 0;
                 for (const enemy of enemies) {
                     if (!enemy.alive || enemy.isFrozen) continue;
                     if (getDistance(proj.x, proj.y, enemy.x, enemy.y) < enemy.size/2 + proj.size/2) {
                        hit = true;
                         if (proj.splashRadius > 0) { applyAreaDamage(proj.x, proj.y, proj.splashRadius, proj.damage); createExplosion(proj.x, proj.y, 10+proj.splashRadius*0.2, proj.color, 3+proj.splashRadius*0.1, 400+proj.splashRadius*2); playSound('explosion'); }
                         else if (proj.type === 'railgun') { damageEnemy(enemy, proj.damage, proj.x, proj.y); createHitEffect(proj.x, proj.y, 8, proj.color, 5, 300); piercedCount++; if (piercedCount >= proj.pierce) { proj.alive = false; returnProjectile(proj); return; } }
                         else if (proj.type === 'cryo') { damageEnemy(enemy, proj.damage, proj.x, proj.y); applyFreezeEffect(enemy, proj.freezeDuration); createHitEffect(proj.x, proj.y, 10, '#ffffff', 3, 400); playSound('freezeHit'); }
                         else { damageEnemy(enemy, proj.damage, proj.x, proj.y); createHitEffect(proj.x, proj.y, 5, proj.color, 3, 300); }

                         if (proj.pierce <= 0 && proj.splashRadius <= 0 && hit) { proj.alive = false; returnProjectile(proj); return; }
                         if (proj.splashRadius > 0 && hit) { proj.alive = false; returnProjectile(proj); return; }
                     }
                 }
             });
             projectiles = projectiles.filter(p => p.alive);
        }
         function updateMines(deltaTime) {
             mines = mines.filter(mine => {
                 mine.lifetime -= deltaTime;
                 if (mine.lifetime <= 0 || !mine.alive) { if(mine.owner) mine.owner.currentMines = Math.max(0, mine.owner.currentMines - 1); returnMine(mine); return false; }
                 for (const enemy of enemies) {
                     if (!enemy.alive || enemy.isFrozen) continue;
                     if (getDistance(mine.x, mine.y, enemy.x, enemy.y) < mine.radius + enemy.size / 2) {
                         applyAreaDamage(mine.x, mine.y, mine.radius, mine.damage); createExplosion(mine.x, mine.y, 20, '#a0522d', 5, 500); playSound('explosion');
                         mine.alive = false; if(mine.owner) mine.owner.currentMines = Math.max(0, mine.owner.currentMines - 1); returnMine(mine); return false;
                     }
                 }
                 return true;
             });
         }

        function updateParticles(deltaTime) { particles.forEach(p => { if (!p.alive) return; p.x += p.vx * timeScale; p.y += p.vy * timeScale; p.vx *= p.drag; p.vy *= p.drag; p.lifetime -= deltaTime; p.size *= p.shrink; if (p.lifetime <= 0 || p.size < 0.5) { p.alive = false; returnParticle(p); } }); particles = particles.filter(p => p.alive); }
        function updateResourceDrops(deltaTime) { const dropLifetime = 20000; resourceDrops = resourceDrops.filter(drop => { const age = timestamp - drop.createdAt; if (age > dropLifetime) return false; drop.pulse = Math.sin(timestamp / 200 + drop.pulseOffset) * 0.2 + 0.9; drop.alpha = 1.0 - Math.max(0, age - (dropLifetime * 0.7)) / (dropLifetime * 0.3); return true; }); }

        // --- Object Pooling ---
        function getProjectile() { let p = projectilePool.pop(); if(!p) p = {}; p.alive = true; return p; } // Ensure alive is true
        function returnProjectile(proj) { proj.alive = false; projectilePool.push(proj); }
        function getParticle() { let p = particlePool.pop(); if(!p) p = {}; p.alive = true; return p; }
        function returnParticle(part) { part.alive = false; particlePool.push(part); }
        function getMine() { let m = minePool.pop(); if(!m) m = {}; m.alive = true; m.owner = null; return m; }
        function returnMine(mine) { mine.alive = false; mine.owner = null; minePool.push(mine); }


        // --- Drawing Functions ---
        function createStars(count) { stars = Array.from({ length: count }, () => ({ x: Math.random()*GAME_WIDTH, y: Math.random()*GAME_HEIGHT, size: Math.random()*1.5+0.5, brightness: Math.random()*0.5+0.5 })); }
        function drawStarBackground() { stars.forEach((star, index) => { const twinkle = Math.sin(timestamp / (600 + index*11) + index) * 0.2 + 0.8; ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle * 0.8})`; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI*2); ctx.fill(); }); }
        function drawGrid() { ctx.strokeStyle='rgba(64, 128, 255, 0.08)'; ctx.lineWidth=1; for(let x=0; x<GAME_WIDTH; x+=GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,GAME_HEIGHT); ctx.stroke(); } for(let y=0; y<GAME_HEIGHT; y+=GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(GAME_WIDTH,y); ctx.stroke(); } }
        function drawBase() { const pulse = Math.sin(timestamp / 500) * 0.1 + 0.9; const healthPercent = baseHealth / BASE_MAX_HEALTH; const baseColor = healthPercent > 0.6 ? '64,128,255' : healthPercent > 0.3 ? '255,192,64' : '255,64,64'; const gradient = ctx.createRadialGradient(BASE_X, BASE_Y, 0, BASE_X, BASE_Y, BASE_RADIUS * 1.8 * pulse); gradient.addColorStop(0, `rgba(${baseColor}, 0.6)`); gradient.addColorStop(0.7, `rgba(${baseColor}, 0.2)`); gradient.addColorStop(1, `rgba(${baseColor}, 0)`); ctx.fillStyle = gradient; ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT); ctx.fillStyle = `rgb(${baseColor})`; ctx.beginPath(); ctx.arc(BASE_X, BASE_Y, BASE_RADIUS, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = `rgba(255, 255, 255, 0.3)`; ctx.beginPath(); ctx.arc(BASE_X+BASE_RADIUS*0.3, BASE_Y-BASE_RADIUS*0.2, BASE_RADIUS*0.5, 0, Math.PI*2); ctx.arc(BASE_X-BASE_RADIUS*0.4, BASE_Y+BASE_RADIUS*0.3, BASE_RADIUS*0.3, 0, Math.PI*2); ctx.fill(); let coreColor = healthPercent > 0.6 ? '#80c0ff' : healthPercent > 0.3 ? '#ffff80' : '#ff8080'; ctx.fillStyle = coreColor; ctx.beginPath(); ctx.arc(BASE_X, BASE_Y, BASE_RADIUS * 0.5 * healthPercent, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + healthPercent*0.5})`; ctx.lineWidth=2; ctx.stroke(); }

        function drawTowerPreview() {
             if(!selectedTowerType) return; // Added check
             const gridX = Math.floor(mouseX / GRID_SIZE) * GRID_SIZE; const gridY = Math.floor(mouseY / GRID_SIZE) * GRID_SIZE;
             const towerData = TOWER_TYPES[selectedTowerType]; const canPlace = checkPlacement(gridX, gridY);
             ctx.globalAlpha = 0.5; ctx.fillStyle = canPlace ? 'rgba(64, 255, 128, 0.5)' : 'rgba(255, 64, 64, 0.5)';
             ctx.fillRect(gridX, gridY, GRID_SIZE, GRID_SIZE); ctx.globalAlpha = 1.0;
             const previewX = gridX + GRID_SIZE/2, previewY = gridY + GRID_SIZE/2;
             ctx.save(); ctx.translate(previewX, previewY); ctx.globalAlpha = 0.7;
             drawSingleTowerGraphic({ type: selectedTowerType, width: GRID_SIZE*0.8, height: GRID_SIZE*0.8, level: 1, rotation: 0, color: towerData.color, isDisabled: false, currentMines: 0, maxMines: towerData.maxMines || 0 });
             ctx.restore(); ctx.globalAlpha = 1.0;
             if (towerData.range > 0) { ctx.strokeStyle = canPlace ? 'rgba(64, 255, 128, 0.4)' : 'rgba(255, 64, 64, 0.4)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(previewX, previewY, towerData.range, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); }
             if (towerData.minRange > 0) { ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(previewX, previewY, towerData.minRange, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); }
        }
        function checkPlacement(gridX, gridY) { const gridCell = placementGrid.find(cell => cell.x === gridX && cell.y === gridY); return gridCell && !gridCell.occupied && selectedTowerType && resources >= TOWER_TYPES[selectedTowerType].cost; }
        function drawTowers() { towers.forEach(tower => { ctx.save(); ctx.translate(tower.x, tower.y); drawSingleTowerGraphic(tower); ctx.restore(); }); }

        // --- MODIFIED drawSingleTowerGraphic ---
        function drawSingleTowerGraphic(tower, targetCtx = ctx) { // Accept optional context
            const w = tower.width, h = tower.height, level = tower.level;
            const typeData = TOWER_TYPES[tower.type];
            if (!typeData) { console.error("Invalid tower type for drawing:", tower.type); return; } // Safety check

            const detailColor = lightenColor(typeData.color, 1.3);
            const darkColor = darkenColor(typeData.color, 0.7);
            const baseColor = tower.isDisabled ? '#555' : typeData.color;
            const isIcon = targetCtx !== ctx; // Check if drawing an icon

            targetCtx.save();
            if (tower.isDisabled) { targetCtx.filter = 'grayscale(80%) brightness(0.6)'; }

            // Base platform
            targetCtx.fillStyle = tower.isDisabled ? darkenColor('#555', 0.7) : darkColor;
            targetCtx.beginPath(); targetCtx.rect(-w/2, -h/2, w, h); targetCtx.fill();
            targetCtx.strokeStyle='#222'; targetCtx.lineWidth=isIcon ? 0.5 : 1; targetCtx.stroke(); // Thinner lines for icons

            // Main structure
            targetCtx.fillStyle = baseColor;
            targetCtx.strokeStyle = tower.isDisabled ? '#777' : detailColor;
            targetCtx.lineWidth = isIcon ? 1 : 1.5; // Thinner lines for icons
            targetCtx.save(); targetCtx.rotate(tower.rotation);

            const sizeBoost = isIcon ? 1 : (1 + Math.min(0.15, (level - 1) * 0.05)); // No size boost for icons
            targetCtx.scale(sizeBoost, sizeBoost);

            // --- Draw Specific Tower Types (using targetCtx) ---
            switch(tower.type) {
                 case 'laser': targetCtx.beginPath(); targetCtx.moveTo(0,-h*0.3); targetCtx.lineTo(w*0.2,0); targetCtx.lineTo(0,h*0.3); targetCtx.lineTo(-w*0.2,0); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillRect(-w*0.4, -h*0.1, w*0.2, h*0.2); targetCtx.fillRect(w*0.2, -h*0.1, w*0.2, h*0.2); if (!isIcon && level > 2) { targetCtx.fillStyle=detailColor; targetCtx.beginPath(); targetCtx.arc(0,0,w*0.1,0,Math.PI*2); targetCtx.fill(); } break;
                 case 'cannon': targetCtx.beginPath(); targetCtx.arc(0, 0, w*0.3, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=darkenColor(baseColor, 0.8); targetCtx.fillRect(w*0.1, -h*0.1, w*0.4 + w*0.05*(level-1), h*0.2); targetCtx.beginPath(); targetCtx.arc(w*0.5 + w*0.05*(level-1), 0, h*0.12, 0, Math.PI*2); targetCtx.fill(); if (!isIcon && level > 3) { targetCtx.fillStyle=detailColor; targetCtx.fillRect(w*0.1, -h*0.15, w*0.1, h*0.3); } break;
                 case 'missile': const mSz = w*0.3, podH = h*0.4; targetCtx.save(); targetCtx.rotate(-0.2); targetCtx.fillRect(-w*0.4, -podH/2, mSz, podH); targetCtx.beginPath(); targetCtx.arc(-w*0.4+mSz/2, 0, podH*0.3, 0, Math.PI*2); targetCtx.fillStyle=lightenColor(baseColor, 1.2); targetCtx.fill(); targetCtx.restore(); targetCtx.save(); targetCtx.fillStyle=baseColor; targetCtx.rotate(0.2); targetCtx.fillRect(w*0.1, -podH/2, mSz, podH); targetCtx.beginPath(); targetCtx.arc(w*0.1+mSz/2, 0, podH*0.3, 0, Math.PI*2); targetCtx.fillStyle=lightenColor(baseColor, 1.2); targetCtx.fill(); targetCtx.restore(); if (!isIcon && level > 2) { targetCtx.fillStyle=detailColor; targetCtx.beginPath(); targetCtx.rect(-w*0.1, -h*0.1, w*0.2, h*0.2); targetCtx.fill();} break;
                 case 'slow': targetCtx.fillStyle = baseColor; targetCtx.beginPath(); targetCtx.arc(0,0, w*0.4, 0, Math.PI*2); targetCtx.fill(); targetCtx.strokeStyle = detailColor; targetCtx.lineWidth= isIcon ? 1 : 2; targetCtx.stroke(); if (!tower.isDisabled && !isIcon) { const angle = (timestamp / (1500 - level*100)) % (Math.PI * 2); targetCtx.save(); targetCtx.rotate(angle); targetCtx.beginPath(); targetCtx.moveTo(0, -h*0.25); targetCtx.lineTo(w*0.15, h*0.15); targetCtx.lineTo(-w*0.15, h*0.15); targetCtx.closePath(); targetCtx.fillStyle = lightenColor(baseColor, 1.4); targetCtx.fill(); if (level > 2) { targetCtx.beginPath(); targetCtx.arc(0,0,w*0.1,0,Math.PI*2); targetCtx.fillStyle=darkColor; targetCtx.fill(); } targetCtx.restore(); } else if (isIcon) { targetCtx.beginPath(); targetCtx.moveTo(0, -h*0.25); targetCtx.lineTo(w*0.15, h*0.15); targetCtx.lineTo(-w*0.15, h*0.15); targetCtx.closePath(); targetCtx.fillStyle = lightenColor(baseColor, 1.4); targetCtx.fill(); } targetCtx.fillStyle=darkColor; targetCtx.beginPath(); targetCtx.arc(0,0,w*0.15 + w*0.02*(level-1),0,Math.PI*2); targetCtx.fill(); break; // Static version for icon
                 case 'chain': targetCtx.beginPath(); targetCtx.moveTo(0, -h*0.4); targetCtx.lineTo(w*0.3, h*0.1); targetCtx.lineTo(-w*0.3, h*0.1); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=lightenColor(baseColor,1.5); targetCtx.beginPath(); targetCtx.arc(0, -h*0.1, w*0.15 + w*0.02*(level-1), 0, Math.PI*2); targetCtx.fill(); break;
                 case 'railgun': targetCtx.fillStyle=darkenColor(baseColor, 0.6); targetCtx.fillRect(-w*0.1, -h*0.1, w*0.2, h*0.2); targetCtx.fillStyle=baseColor; targetCtx.fillRect(w*0.1, -h*0.08, w*0.5 + w*0.04*(level-1), h*0.16); targetCtx.strokeRect(w*0.1, -h*0.08, w*0.5 + w*0.04*(level-1), h*0.16); break;
                 case 'flame': targetCtx.beginPath(); targetCtx.arc(0, 0, w*0.35, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=darkenColor(baseColor, 0.7); targetCtx.beginPath(); targetCtx.rect(w*0.2, -h*0.2, w*0.25, h*0.4); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=lightenColor(baseColor,1.3); targetCtx.beginPath(); targetCtx.arc(w*0.45, 0, h*0.1, 0, Math.PI*2); targetCtx.fill(); break;
                 case 'generator': targetCtx.beginPath(); targetCtx.arc(0, 0, w*0.4, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); if (!tower.isDisabled && !isIcon) { const angle = timestamp/800 % (Math.PI*2); targetCtx.save(); targetCtx.rotate(angle); targetCtx.fillStyle=lightenColor(baseColor,1.6); targetCtx.fillRect(-w*0.3, -h*0.05, w*0.6, h*0.1); targetCtx.rotate(Math.PI/2); targetCtx.fillRect(-w*0.3, -h*0.05, w*0.6, h*0.1); targetCtx.restore(); } else if (isIcon) { targetCtx.save(); targetCtx.fillStyle=lightenColor(baseColor,1.6); targetCtx.fillRect(-w*0.3, -h*0.05, w*0.6, h*0.1); targetCtx.rotate(Math.PI/2); targetCtx.fillRect(-w*0.3, -h*0.05, w*0.6, h*0.1); targetCtx.restore(); } targetCtx.fillStyle=darkColor; targetCtx.beginPath(); targetCtx.arc(0,0,w*0.15 + w*0.02*(level-1),0,Math.PI*2); targetCtx.fill(); break; // Static version for icon
                 case 'amplifier': targetCtx.beginPath(); targetCtx.moveTo(0,-h*0.35); targetCtx.lineTo(w*0.25,h*0.25); targetCtx.lineTo(-w*0.25,h*0.25); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke(); if (!tower.isDisabled && !isIcon) { const pulse = Math.sin(timestamp/300)*0.1+0.9; targetCtx.fillStyle = lightenColor(baseColor, 1.5); targetCtx.beginPath(); targetCtx.arc(0,0,w*0.15*pulse,0,Math.PI*2); targetCtx.fill(); } else if (isIcon) { targetCtx.fillStyle = lightenColor(baseColor, 1.5); targetCtx.beginPath(); targetCtx.arc(0,0,w*0.15,0,Math.PI*2); targetCtx.fill(); } break; // Static version for icon
                 case 'mortar': targetCtx.fillStyle=darkColor; targetCtx.beginPath(); targetCtx.arc(0, 0, w*0.4, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=baseColor; targetCtx.save(); targetCtx.rotate(Math.PI/4); targetCtx.fillRect(-w*0.15, -h*0.15, w*0.3, h*0.3); targetCtx.stroke(); targetCtx.restore(); targetCtx.fillStyle=darkenColor(baseColor,0.7); targetCtx.fillRect(w*0.1, -h*0.1, w*0.1 + w*0.03*(level-1), h*0.2); break;
                 case 'sniper': targetCtx.fillStyle=darkenColor(baseColor, 0.7); targetCtx.beginPath(); targetCtx.arc(0, 0, w*0.25, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=baseColor; targetCtx.fillRect(w*0.1, -h*0.05, w*0.6 + w*0.05*(level-1), h*0.1); targetCtx.strokeRect(w*0.1, -h*0.05, w*0.6 + w*0.05*(level-1), h*0.1); break;
                 case 'mine': targetCtx.beginPath(); targetCtx.rect(-w*0.35, -h*0.35, w*0.7, h*0.7); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=darkenColor(baseColor, 0.8); targetCtx.beginPath(); targetCtx.arc(0,0,w*0.2, 0, Math.PI*2); targetCtx.fill(); if (!isIcon) { targetCtx.fillStyle=lightenColor(baseColor, 1.3); targetCtx.textAlign='center'; targetCtx.textBaseline='middle'; targetCtx.font='bold 9px monospace'; targetCtx.fillText(tower.currentMines+'/'+tower.maxMines, 0, 0); } break; // Don't show mine count on icon
                 case 'booster': targetCtx.beginPath(); targetCtx.arc(0,0, w*0.35, 0, Math.PI*2); targetCtx.fill(); targetCtx.stroke(); if (!tower.isDisabled && !isIcon) { const angle = timestamp/1000 % (Math.PI*2); for(let i=0; i<3; ++i) { targetCtx.save(); targetCtx.rotate(angle + i*Math.PI*2/3); targetCtx.fillStyle=lightenColor(baseColor, 1.5); targetCtx.beginPath(); targetCtx.arc(w*0.25, 0, w*0.1, 0, Math.PI*2); targetCtx.fill(); targetCtx.restore(); } } else if (isIcon) { for(let i=0; i<3; ++i) { targetCtx.save(); targetCtx.rotate(i*Math.PI*2/3); targetCtx.fillStyle=lightenColor(baseColor, 1.5); targetCtx.beginPath(); targetCtx.arc(w*0.25, 0, w*0.1, 0, Math.PI*2); targetCtx.fill(); targetCtx.restore(); }} break; // Static version for icon
                 case 'cryo': targetCtx.beginPath(); targetCtx.moveTo(0,-h*0.4); targetCtx.lineTo(w*0.2,0); targetCtx.lineTo(0,h*0.4); targetCtx.lineTo(-w*0.2,0); targetCtx.closePath(); targetCtx.fill(); targetCtx.stroke(); targetCtx.fillStyle=lightenColor(baseColor,1.4); targetCtx.beginPath(); targetCtx.arc(0,0, w*0.2 + w*0.02*(level-1), 0, Math.PI*2); targetCtx.fill(); targetCtx.fillStyle=darkColor; targetCtx.beginPath(); targetCtx.arc(0,0,w*0.1,0,Math.PI*2); targetCtx.fill(); break;
             }
            targetCtx.restore(); // Restore from rotation/scaling

            targetCtx.restore(); // Restore from disable filter

            // Level indicator - skip for icons
            if (!isIcon) {
                 targetCtx.fillStyle = tower.isDisabled ? '#aaa' : '#fff';
                 targetCtx.font = 'bold 10px Courier New'; targetCtx.textAlign = 'center'; targetCtx.textBaseline = 'middle';
                 targetCtx.fillText(level.toString(), 0, h * 0.38);

                 // Boost aura - skip for icons
                 if (tower.currentBuffFactor > 1.0 && !tower.isDisabled) {
                      targetCtx.globalAlpha = 0.3 + (tower.currentBuffFactor - 1.0) * 0.5;
                      targetCtx.fillStyle = '#00bfff';
                      targetCtx.beginPath(); targetCtx.arc(0, 0, w * 0.6, 0, Math.PI * 2); targetCtx.fill();
                      targetCtx.globalAlpha = 1.0;
                 }
            }

            targetCtx.filter = 'none'; // Reset filter
        }


        function drawTowerRange(tower) {
            if (!tower) return;
            const effectiveRange = tower.range * tower.currentBuffFactor;
            ctx.strokeStyle = 'rgba(64, 255, 128, 0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(tower.x, tower.y, effectiveRange, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
            if (tower.minRange > 0) { ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(tower.x, tower.y, tower.minRange, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]); }
        }

        // --- MODIFIED drawTowerIcons ---
        function drawTowerIcons() {
            // console.log("Drawing tower icons..."); // Keep for debugging if needed
            document.querySelectorAll('.tower-icon-canvas').forEach(iconCanvas => {
                const type = iconCanvas.getAttribute('data-type');
                if (!TOWER_TYPES[type]) {
                    console.warn(`No tower type found for icon: ${type}`);
                    return;
                }

                // Set canvas resolution to match CSS dimensions
                const style = getComputedStyle(iconCanvas);
                const canvasWidth = parseInt(style.width);
                const canvasHeight = parseInt(style.height);

                // Only resize if necessary (avoids flicker on frequent calls)
                if (iconCanvas.width !== canvasWidth || iconCanvas.height !== canvasHeight) {
                    iconCanvas.width = canvasWidth;
                    iconCanvas.height = canvasHeight;
                }

                const iconCtx = iconCanvas.getContext('2d');
                const w = iconCanvas.width;
                const h = iconCanvas.height;

                iconCtx.clearRect(0,0,w,h);
                iconCtx.save();
                iconCtx.translate(w/2, h/2); // Center the drawing

                // Create a simplified tower object for the drawing function
                const iconTowerData = {
                    type: type,
                    width: w * 0.85, // Use a larger percentage for icons
                    height: h * 0.85,
                    level: 1,
                    rotation: 0, // Static rotation for icons
                    color: TOWER_TYPES[type].color,
                    isDisabled: false, // Icons are never disabled
                    // Provide defaults for potentially missing properties used in drawing
                    currentMines: 0,
                    maxMines: TOWER_TYPES[type].maxMines || 0,
                    currentBuffFactor: 1.0,
                    // Add other properties if needed by drawSingleTowerGraphic
                };

                drawSingleTowerGraphic(iconTowerData, iconCtx); // Pass the icon context

                iconCtx.restore();
            });
            // console.log("Finished drawing tower icons.");
        }


        function drawEnemies() {
            enemies.forEach(enemy => {
                ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.rotate(enemy.rotation);
                 if (enemy.isFrozen) { ctx.filter = 'brightness(1.5) saturate(0.5)'; ctx.globalAlpha = 0.8; }
                drawEnemyShape(enemy);
                if (enemy.maxShield > 0 && enemy.shield > 0) { const shieldPercent = enemy.shield / enemy.maxShield; ctx.strokeStyle = `rgba(64, 160, 255, ${0.3 + shieldPercent * 0.6})`; ctx.lineWidth = 1 + shieldPercent * 2; ctx.beginPath(); ctx.arc(0, 0, enemy.size * 1.1 + 1, 0, Math.PI * 2); ctx.stroke(); }
                 if (enemy.isSlowed && !enemy.isFrozen) { ctx.fillStyle = 'rgba(64, 224, 208, 0.3)'; ctx.beginPath(); ctx.arc(0, 0, enemy.size * 1.2, 0, Math.PI * 2); ctx.fill(); }
                 if (enemy.damageTakenMultiplier > 1.0 && timestamp < enemy.ampEndTime) { ctx.strokeStyle = 'rgba(218, 112, 214, 0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0, enemy.size * 1.3, 0, Math.PI * 2); ctx.stroke(); }
                ctx.restore();

                // Health/Shield Bars
                const barW = enemy.size*1.5, barH=5, barX=enemy.x-barW/2, barY=enemy.y-enemy.size-12;
                const hp = Math.max(0, enemy.health/enemy.maxHealth);
                ctx.fillStyle='#333'; ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle=hp>0.6?'#40ff80':hp>0.3?'#ffff40':'#ff4040'; ctx.fillRect(barX, barY, barW*hp, barH);
                ctx.strokeStyle='#111'; ctx.lineWidth=1; ctx.strokeRect(barX, barY, barW, barH);
                 if (enemy.maxShield > 0) { const shieldY = barY + barH + 1; const sp = Math.max(0, enemy.shield / enemy.maxShield); ctx.fillStyle='#224'; ctx.fillRect(barX, shieldY, barW, 3); ctx.fillStyle='#60a0ff'; ctx.fillRect(barX, shieldY, barW*sp, 3); }
            });
        }

        function drawEnemyShape(enemy) {
             const sz = enemy.size; ctx.fillStyle=enemy.color; ctx.strokeStyle=darkenColor(enemy.color, 0.6); ctx.lineWidth=1.5;
             ctx.beginPath();
             switch(enemy.shape) {
                 case 'delta': ctx.moveTo(sz*0.8, 0); ctx.lineTo(-sz*0.5, sz*0.6); ctx.lineTo(-sz*0.5, -sz*0.6); break;
                 case 'block': ctx.rect(-sz*0.7, -sz*0.5, sz*1.4, sz); break;
                 case 'shield': ctx.moveTo(sz*0.8, 0); ctx.lineTo(sz*0.2, sz*0.7); ctx.lineTo(-sz*0.6, sz*0.5); ctx.lineTo(-sz*0.6, -sz*0.5); ctx.lineTo(sz*0.2, -sz*0.7); break;
                 case 'diamond': ctx.moveTo(sz, 0); ctx.lineTo(0, sz*0.8); ctx.lineTo(-sz, 0); ctx.lineTo(0, -sz*0.8); break;
                 case 'disrupt': ctx.moveTo(sz*0.8, 0); ctx.lineTo(sz*0.3, sz*0.4); ctx.lineTo(sz*0.5, sz*0.8); ctx.lineTo(-sz*0.2, sz*0.3); ctx.lineTo(-sz*0.7, sz*0.6); ctx.lineTo(-sz*0.5, 0); ctx.lineTo(-sz*0.7, -sz*0.6); ctx.lineTo(-sz*0.2, -sz*0.3); ctx.lineTo(sz*0.5, -sz*0.8); ctx.lineTo(sz*0.3, -sz*0.4); break;
                 default:        ctx.moveTo(sz*0.8, 0); ctx.lineTo(sz*0.4, sz*0.7); ctx.lineTo(-sz*0.4, sz*0.7); ctx.lineTo(-sz*0.8, 0); ctx.lineTo(-sz*0.4, -sz*0.7); ctx.lineTo(sz*0.4, -sz*0.7); break;
             }
             ctx.closePath(); ctx.fill(); ctx.stroke();
             ctx.fillStyle=lightenColor(enemy.color, 1.5); ctx.beginPath(); // Detail
             if (enemy.shape==='delta') ctx.arc(sz*0.3,0,sz*0.2,0,Math.PI*2);
             else if (enemy.shape==='block') ctx.rect(-sz*0.1,-sz*0.2,sz*0.2,sz*0.4);
             else if (enemy.shape==='shield') { ctx.moveTo(sz*0.3, 0); ctx.lineTo(-sz*0.1, sz*0.3); ctx.lineTo(-sz*0.1, -sz*0.3); ctx.closePath(); }
             else if (enemy.shape === 'disrupt') { ctx.arc(0,0,sz*0.3,0,Math.PI*2); }
             else ctx.arc(0,0,sz*0.3,0,Math.PI*2);
             ctx.fill();
        }

        function drawProjectiles() {
             projectiles.forEach(proj => {
                 if (!proj.alive) return;
                 ctx.save(); ctx.translate(proj.x, proj.y); ctx.rotate(proj.angle);
                 ctx.fillStyle=proj.color; ctx.strokeStyle='#fff'; ctx.lineWidth=1;

                 switch(proj.type) {
                     case 'laser': ctx.globalAlpha=0.8; ctx.lineWidth=proj.size; ctx.strokeStyle=lightenColor(proj.color, 1.5); ctx.beginPath(); ctx.moveTo(-proj.speed*0.5,0); ctx.lineTo(0,0); ctx.stroke(); ctx.globalAlpha=1.0; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,proj.size*0.5,0,Math.PI*2); ctx.fill(); break;
                     case 'cannon': ctx.beginPath(); ctx.arc(0,0,proj.size,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(-proj.size*0.3,-proj.size*0.3,proj.size*0.4,0,Math.PI*2); ctx.fill(); break;
                     case 'missile': const mSz = proj.size; ctx.beginPath(); ctx.moveTo(mSz,0); ctx.lineTo(-mSz*0.5,mSz*0.5); ctx.lineTo(-mSz*0.5,-mSz*0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); createParticle(proj.x-Math.cos(proj.angle)*mSz, proj.y-Math.sin(proj.angle)*mSz, proj.angle+Math.PI+(Math.random()-0.5)*0.5, proj.speed*0.2+Math.random()*1, mSz*(0.5+Math.random()*0.5), Math.random()<0.6?'#ffcc66':'#ff6633', 150+Math.random()*100, 0.98, 0.98); break;
                     case 'slow-pulse': case 'amp-pulse': if (proj.initialLifetime > 0) { const lifeRatio = Math.max(0, proj.lifetime / proj.initialLifetime); const currentRadius = proj.size * (1 - lifeRatio); ctx.globalAlpha = lifeRatio * 0.6; ctx.fillStyle = proj.color; ctx.beginPath(); ctx.arc(0, 0, currentRadius, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;} break;
                     case 'chain': break;
                     case 'railgun': ctx.lineWidth = proj.size * 0.8; ctx.strokeStyle=proj.color; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(-proj.speed*0.6, 0); ctx.lineTo(0, 0); ctx.stroke(); ctx.globalAlpha = 1.0; break;
                     case 'flame': if (proj.initialLifetime > 0) { const flameLife = Math.max(0, proj.lifetime / proj.initialLifetime); const baseHexColor = proj.color; const lightHexColor = lightenColor(baseHexColor, 1.5); ctx.globalAlpha = flameLife * 0.8; ctx.beginPath(); ctx.ellipse(0, 0, proj.speed * 0.3, proj.size * 0.5, 0, -Math.PI/2, Math.PI/2); ctx.closePath(); const grad = ctx.createRadialGradient(0,0,0, proj.speed * 0.3, 0, proj.size * 0.5); grad.addColorStop(0, lightHexColor); grad.addColorStop(0.8, baseHexColor); grad.addColorStop(1, 'transparent'); ctx.fillStyle = grad; ctx.fill(); ctx.globalAlpha = 1.0; } break;                     case 'mortar': ctx.beginPath(); ctx.arc(0,0,proj.size,0,Math.PI*2); ctx.fill(); ctx.fillStyle=darkenColor(proj.color, 0.6); ctx.beginPath(); ctx.arc(0,0,proj.size*0.6,0,Math.PI*2); ctx.fill(); break;
                     case 'sniper': ctx.lineWidth = proj.size * 0.5; ctx.strokeStyle=proj.color; ctx.beginPath(); ctx.moveTo(-proj.speed*0.3, 0); ctx.lineTo(0, 0); ctx.stroke(); break;
                     case 'cryo': ctx.fillStyle = proj.color; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(proj.size, 0); ctx.lineTo(-proj.size*0.5, proj.size*0.4); ctx.lineTo(-proj.size*0.5, -proj.size*0.4); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
                 }
                 ctx.restore();
             });

             // Draw chain lightning
              activeEffects.forEach(effect => {
                  if (effect.type === 'chain_lightning' && timestamp < effect.endTime) {
                       ctx.save(); const life = Math.max(0, (effect.endTime - timestamp) / effect.duration); ctx.globalAlpha = life * 0.8; ctx.lineWidth = effect.size * life; ctx.strokeStyle = effect.color;
                       ctx.beginPath(); ctx.moveTo(effect.startX, effect.startY);
                       const dx = effect.endX - effect.startX, dy = effect.endY - effect.startY; const dist = Math.sqrt(dx*dx + dy*dy); const segments = Math.max(3, Math.floor(dist / 15));
                       ctx.lineTo(effect.startX + dx * 0.2 + (Math.random()-0.5)*10, effect.startY + dy * 0.2 + (Math.random()-0.5)*10); // Initial point jitter
                       for (let i=1; i < segments; i++) { const ratio = i / segments; ctx.lineTo(effect.startX + dx * ratio + (Math.random()-0.5)*8, effect.startY + dy * ratio + (Math.random()-0.5)*8); }
                       ctx.lineTo(effect.endX, effect.endY); ctx.stroke(); ctx.restore();
                  }
              });
        }
         function drawMines() {
             mines.forEach(mine => {
                 const pulse = Math.sin(timestamp / 150 + mine.x) * 0.1 + 0.9; const scale = pulse; ctx.save();
                 const baseMineLifetime = TOWER_TYPES['mine']?.mineLifetime || 20000; // Fallback
                 const ageRatio = Math.max(0, mine.lifetime / baseMineLifetime);
                 ctx.globalAlpha = 0.6 + ageRatio * 0.4;
                 ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.arc(mine.x, mine.y, mine.size * scale, 0, Math.PI*2); ctx.fill();
                 ctx.fillStyle = '#ff6347'; ctx.beginPath(); ctx.arc(mine.x, mine.y, mine.size*0.6 * scale, 0, Math.PI*2); ctx.fill();
                 if (Math.floor(timestamp/250) % 2 === 0) { ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(mine.x, mine.y, mine.size*0.2 * scale, 0, Math.PI*2); ctx.fill(); }
                 ctx.restore();
             });
         }

        function drawParticles() { particles.forEach(p => { if(!p.alive || !p.initialLifetime) return; const alpha = Math.max(0, p.lifetime / p.initialLifetime); ctx.globalAlpha = alpha * p.initialAlpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0,p.size), 0, Math.PI*2); ctx.fill(); }); ctx.globalAlpha = 1.0; }
        function drawResourceDrops() { resourceDrops.forEach(drop => { const scale = drop.pulse ?? 1.0, alpha = drop.alpha ?? 1.0; ctx.save(); ctx.globalAlpha = alpha; const glowR = drop.radius*1.8*scale; const grad = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, glowR); grad.addColorStop(0,'rgba(64,255,128,0.6)'); grad.addColorStop(0.7,'rgba(64,255,128,0.1)'); grad.addColorStop(1,'rgba(64,255,128,0)'); ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(drop.x, drop.y, glowR, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#40ff80'; ctx.beginPath(); ctx.arc(drop.x, drop.y, drop.radius*scale, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle='#80ffc0'; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle=`rgba(255,255,255,${alpha*0.9})`; ctx.font='bold 11px Courier New'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(`+$${drop.value}`, drop.x, drop.y - drop.radius*scale - 8); ctx.restore(); }); }
         function drawActiveEffects() { /* Could draw booster auras here */ }
         function drawDisableEffects() {
             ctx.save();
             activeDisableEffects.forEach(effect => {
                  const elapsed = timestamp - effect.startTime; const life = Math.max(0, (effect.duration - elapsed) / effect.duration);
                  if (life > 0) {
                      const dx = effect.targetX - effect.sourceX; const dy = effect.targetY - effect.sourceY;
                      ctx.lineWidth = 2 + Math.sin(timestamp / 50) * 1; ctx.strokeStyle = `rgba(221, 160, 221, ${life * 0.7})`; ctx.setLineDash([5, 3]);
                      ctx.beginPath(); ctx.moveTo(effect.sourceX, effect.sourceY); ctx.lineTo(effect.targetX, effect.targetY); ctx.stroke();
                  }
             });
             ctx.restore();
         }


        // --- Particle Effects ---
        function createParticle(x, y, angle, speed, size, color, lifetime, drag = 1.0, shrink = 1.0, alpha = 1.0) { const p = getParticle(); p.x=x; p.y=y; p.vx = Math.cos(angle)*speed; p.vy = Math.sin(angle)*speed; p.size=size; p.color=color; p.lifetime=lifetime; p.initialLifetime=lifetime; p.drag=drag; p.shrink=shrink; p.initialAlpha=alpha; /* p.alive already true from getParticle */ particles.push(p); }
        function createHitEffect(x, y, count, color, speedRange = 3, lifetime = 300) { for (let i = 0; i < count; i++) createParticle( x, y, Math.random()*Math.PI*2, 1+Math.random()*speedRange, 1+Math.random()*2, color, lifetime*(0.8+Math.random()*0.4), 0.96, 0.98, 0.8 ); }
        function createExplosion(x, y, count, baseColor, speedRange = 5, lifetime = 600) { for (let i = 0; i < count; i++) createParticle( x, y, Math.random()*Math.PI*2, 1+Math.random()*speedRange, 2+Math.random()*3, Math.random()<0.3?'#fff':baseColor, lifetime*(0.7+Math.random()*0.6), 0.95, 0.96, 1.0 ); createParticle(x, y, 0, 0, count*1.5, '#fff', 100, 1, 0.85, 0.7); }

        // --- Tower Firing & Targeting ---
        function findTarget(tower) {
            const effectiveRange = tower.range * tower.currentBuffFactor;
            const candidates = enemies.filter(enemy => enemy.alive && !enemy.isFrozen && getDistance(tower.x, tower.y, enemy.x, enemy.y) <= effectiveRange && getDistance(tower.x, tower.y, enemy.x, enemy.y) >= tower.minRange );
            if (candidates.length === 0) return null;
             // Always target the enemy closest to the tower (first in range) by default
             // Keep sniper override for now
             if (tower.type === 'sniper') {
                 candidates.sort((a, b) => (b.health + b.shield) - (a.health + a.shield)); // Sniper default: strongest
             } else {
                 // Default: Sort by distance to tower (closest first)
                 candidates.sort((a, b) => getDistance(tower.x,tower.y, a.x,a.y) - getDistance(tower.x,tower.y, b.x,b.y));
             }
            return candidates[0];
        }

        function fireTowerWeapon(tower) {
             const isTargetingTower = !TOWER_TYPES[tower.type].nonTargeting;
             if (isTargetingTower && !tower.target) return;

             const angle = tower.rotation; const towerData = TOWER_TYPES[tower.type];
             const startX = tower.x + Math.cos(angle) * tower.width * 0.3; const startY = tower.y + Math.sin(angle) * tower.height * 0.3;
             const effectiveDamage = tower.damage * tower.currentBuffFactor;
             const effectiveRange = tower.range * tower.currentBuffFactor; // For lifetime calc

             switch(tower.type) {
                 case 'laser': case 'cannon': case 'missile': case 'railgun': case 'sniper': case 'mortar': case 'flame': case 'cryo':
                     const proj = getProjectile(); proj.x=startX; proj.y=startY; proj.speed=towerData.projectileSpeed; proj.damage=effectiveDamage; proj.angle=angle; proj.size=towerData.projectileSize; proj.color=towerData.projectileColor; proj.type=tower.type; proj.splashRadius=towerData.splashRadius || 0; proj.pierce=towerData.pierce || 0; proj.freezeDuration=towerData.freezeDuration || 0;
                     proj.lifetime = (effectiveRange * 1.5 / towerData.projectileSpeed * 1000) || 2000; // Calculate lifetime or default
                     proj.initialLifetime = proj.lifetime; proj.target=(tower.type === 'missile' ? tower.target : null);
                     projectiles.push(proj); playSound(tower.type + 'Shot');
                     break;
                 case 'slow': applySlowEffect(tower.x, tower.y, tower.range, tower.slowFactor, tower.slowDuration); const pulseSlow = getProjectile(); pulseSlow.x=tower.x; pulseSlow.y=tower.y; pulseSlow.speed=0; pulseSlow.damage=0; pulseSlow.angle=0; pulseSlow.size=tower.range; pulseSlow.color=towerData.projectileColor; pulseSlow.type='slow-pulse'; pulseSlow.splashRadius=0; pulseSlow.lifetime=300; pulseSlow.initialLifetime = 300; pulseSlow.target=null; projectiles.push(pulseSlow); playSound('slowPulse'); break;
                 case 'amplifier': applyAmplifierEffect(tower.x, tower.y, tower.range, tower.ampFactor, tower.ampDuration); const pulseAmp = getProjectile(); pulseAmp.x=tower.x; pulseAmp.y=tower.y; pulseAmp.speed=0; pulseAmp.damage=0; pulseAmp.angle=0; pulseAmp.size=tower.range; pulseAmp.color=towerData.projectileColor; pulseAmp.type='amp-pulse'; pulseAmp.splashRadius=0; pulseAmp.lifetime=350; pulseAmp.initialLifetime = 350; pulseAmp.target=null; projectiles.push(pulseAmp); playSound('ampPulse'); break;
                 case 'chain': fireChainLightning(tower, effectiveDamage); playSound('chainShot'); break;
                 case 'mine': if (tower.currentMines < tower.maxMines) { layMine(tower); playSound('layMine'); } break;
                 case 'generator': case 'booster': break; // No action on fire
             }
        }

         function fireChainLightning(tower, damage) {
             if (!tower.target) return;
             let currentTarget = tower.target; let lastTarget = tower; let remainingChains = tower.chainTargets;
             let currentDamage = damage; const hitEnemies = new Set([currentTarget]);

             for (let i = 0; i <= remainingChains; i++) {
                 if (!currentTarget || !currentTarget.alive || currentTarget.isFrozen) break;
                 createChainLinkEffect(lastTarget.x, lastTarget.y, currentTarget.x, currentTarget.y, TOWER_TYPES.chain.projectileColor, TOWER_TYPES.chain.projectileSize);
                 damageEnemy(currentTarget, currentDamage, currentTarget.x, currentTarget.y);

                 let nextTarget = null; let minDist = tower.chainRange + 1;
                 enemies.forEach(enemy => { if (enemy.alive && !enemy.isFrozen && !hitEnemies.has(enemy)) { const dist = getDistance(currentTarget.x, currentTarget.y, enemy.x, enemy.y); if (dist <= tower.chainRange && dist < minDist) { minDist = dist; nextTarget = enemy; } } });
                 if (nextTarget) { lastTarget = currentTarget; currentTarget = nextTarget; hitEnemies.add(currentTarget); currentDamage *= tower.chainFalloff; } else break;
             }
         }
         function createChainLinkEffect(startX, startY, endX, endY, color, size) { activeEffects.push({ type: 'chain_lightning', startX, startY, endX, endY, color, size, startTime: timestamp, duration: 200, endTime: timestamp + 200 }); }
         function layMine(tower) { const mine = getMine(); const angle = Math.random() * Math.PI * 2; const dist = tower.width * 0.6 + Math.random() * 15; mine.x = tower.x + Math.cos(angle) * dist; mine.y = tower.y + Math.sin(angle) * dist; mine.damage = tower.mineDamage; mine.radius = tower.mineRadius; mine.lifetime = tower.mineLifetime; mine.size = 10; mine.owner = tower; mines.push(mine); tower.currentMines++; }

        function applySlowEffect(x, y, range, factor, duration) { enemies.forEach(enemy => { if (enemy.alive && !enemy.isFrozen && getDistance(x, y, enemy.x, enemy.y) <= range) { if (!enemy.isSlowed || factor < enemy.slowFactor || timestamp > enemy.slowEndTime) { enemy.isSlowed = true; enemy.slowFactor = factor; enemy.slowEndTime = timestamp + duration; } else if (factor === enemy.slowFactor) { enemy.slowEndTime = Math.max(enemy.slowEndTime, timestamp + duration); } } }); }
        function applyAmplifierEffect(x, y, range, factor, duration) { enemies.forEach(enemy => { if (enemy.alive && !enemy.isFrozen && getDistance(x, y, enemy.x, enemy.y) <= range) { if (factor > enemy.damageTakenMultiplier || timestamp > enemy.ampEndTime) { enemy.damageTakenMultiplier = factor; enemy.ampEndTime = timestamp + duration; } else if (factor === enemy.damageTakenMultiplier) { enemy.ampEndTime = Math.max(enemy.ampEndTime, timestamp + duration); } } }); }
        function applyFreezeEffect(enemy, duration) { if (!enemy.alive) return; if (!enemy.isFrozen || timestamp + duration > enemy.freezeEndTime) { enemy.isFrozen = true; enemy.freezeEndTime = timestamp + duration; } }
        function applyAreaDamage(x, y, radius, damage) { enemies.forEach(enemy => { if (!enemy.alive /* Don't check frozen here? */ ) return; const dist = getDistance(x, y, enemy.x, enemy.y); if (dist <= radius + enemy.size / 2) { const falloff = Math.max(0.1, 1 - dist / (radius + enemy.size / 2)); damageEnemy(enemy, damage * falloff, enemy.x, enemy.y); } }); }

        // --- Utilities ---
        function getDistance(x1, y1, x2, y2) { const dx=x2-x1, dy=y2-y1; return Math.sqrt(dx*dx+dy*dy); }
        function darkenColor(hex, factor) { if (!hex || typeof hex !== 'string') return '#000'; hex=hex.replace('#',''); let r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16); r=Math.max(0,Math.floor(r*factor)); g=Math.max(0,Math.floor(g*factor)); b=Math.max(0,Math.floor(b*factor)); return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`; }
        function lightenColor(hex, factor) { if (!hex || typeof hex !== 'string') return '#fff'; hex=hex.replace('#',''); let r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16); r=Math.min(255,Math.floor(r*factor)); g=Math.min(255,Math.floor(g*factor)); b=Math.min(255,Math.floor(b*factor)); return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`; }

        // --- Sound ---
        let audioContext; function getAudioContext() { if (!audioContext && (window.AudioContext || window.webkitAudioContext)) { try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){console.error("Audio Error",e);} } return audioContext; }
        function playSound(type) {
            const ac = getAudioContext(); if (!ac) return; if (ac.state==='suspended') ac.resume(); if (ac.state!=='running') return;
            const osc = ac.createOscillator(), gain = ac.createGain(); osc.connect(gain); gain.connect(ac.destination);
            let f1=440, f2=440, dur=0.1, vol=0.1, oType='sine', decay=0.05;
            switch(type) {
                case 'laserShot': oType='sine'; f1=1200; f2=400; dur=0.08; vol=0.05; decay=0.05; break; case 'cannonShot': oType='square'; f1=150; f2=50; dur=0.25; vol=0.10; decay=0.2; break; case 'missileShot': oType='sawtooth'; f1=200; f2=100; dur=0.35; vol=0.09; decay=0.3; break; case 'slowPulse': oType='sine'; f1=300; f2=200; dur=0.4; vol=0.07; decay=0.35; break; case 'enemyHit': oType='triangle'; f1=660; f2=1200; dur=0.06; vol=0.04; decay=0.05; break; case 'shieldHit': oType='sine'; f1=1500; f2=1000; dur=0.05; vol=0.04; decay=0.04; break; case 'shieldBreak': oType='noise'; dur=0.2; vol=0.09; decay=0.18; break; case 'enemyDestroyed': oType='square'; f1=330; f2=80; dur=0.4; vol=0.13; decay=0.35; break; case 'baseHit': oType='sawtooth'; f1=100; f2=40; dur=0.5; vol=0.18; decay=0.45; break; case 'build': oType='sine'; f1=440; f2=880; dur=0.2; vol=0.08; decay=0.15; break; case 'error': oType='square'; f1=220; f2=110; dur=0.15; vol=0.08; decay=0.1; break; case 'upgrade': oType='sine'; f1=523; f2=1046; dur=0.3; vol=0.10; decay=0.25; break; case 'sell': oType='sine'; f1=784; f2=392; dur=0.3; vol=0.08; decay=0.25; break; case 'collect': oType='sine'; f1=660; f2=1046; dur=0.12; vol=0.08; decay=0.1; break;
                case 'chainShot': oType='sawtooth'; f1=1400; f2=1000; dur=0.15; vol=0.07; decay=0.1; break; case 'railgunShot': oType='sawtooth'; f1=1800; f2=100; dur=0.1; vol=0.15; decay=0.4; break; case 'flameShot': oType='noise'; dur=0.15; vol=0.08; decay=0.1; break; case 'ampPulse': oType='triangle'; f1=400; f2=600; dur=0.3; vol=0.06; decay=0.2; break; case 'mortarShot': oType='square'; f1=80; f2=40; dur=0.4; vol=0.14; decay=0.3; break; case 'sniperShot': oType='sine'; f1=2000; f2=1500; dur=0.05; vol=0.12; decay=0.2; break; case 'layMine': oType='square'; f1=300; f2=200; dur=0.1; vol=0.07; decay=0.05; break; case 'cryoShot': oType='sine'; f1=1000; f2=1300; dur=0.15; vol=0.08; decay=0.1; break; case 'freezeHit': oType='triangle'; f1=1200; f2=1600; dur=0.1; vol=0.06; decay=0.08; break; case 'explosion': oType='noise'; dur=0.3; vol=0.12; decay=0.25; break; case 'disableTower': oType='sawtooth'; f1=500; f2=300; dur=0.25; vol=0.09; decay=0.2; break; case 'enableTower': oType='sine'; f1=300; f2=600; dur=0.2; vol=0.08; decay=0.15; break;
                default: return;
            }
            const now = ac.currentTime; osc.type = oType; gain.gain.setValueAtTime(vol, now);
            if (oType !== 'noise') { osc.frequency.setValueAtTime(f1, now); if (f1 !== f2) osc.frequency.exponentialRampToValueAtTime(f2, now + dur*0.8); }
            // Curve for flame shot handled slightly differently
             if (type === 'flameShot' && gain.gain.setValueCurveAtTime) {
                 gain.gain.setValueAtTime(0, now); gain.gain.setValueCurveAtTime([0, vol, vol*0.8, vol*0.2, 0.001], now, dur + decay);
             } else { gain.gain.exponentialRampToValueAtTime(0.001, now + dur + decay); }
            osc.start(now); osc.stop(now + dur + decay + 0.05);
        }

        // --- Add CSS for screen shake ---
        const existingShakeStyle = document.querySelector('style[data-purpose="shake"]'); if (!existingShakeStyle) { const styleSheet = document.createElement("style"); styleSheet.dataset.purpose = "shake"; styleSheet.innerText = `@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }`; document.head.appendChild(styleSheet); }

        function returnToMainMenu() {
            // Cancel any game loops and reset the game state
            cancelAnimationFrame(animationId);
            resetGame(); // Reset game state
            
            // Hide game screens and show the start screen
            pauseScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            startScreen.style.display = 'flex';
            
            // Redraw the static background elements for the start screen
            redrawStaticElements();
        }

        // --- Start ---
        window.addEventListener('load', init);