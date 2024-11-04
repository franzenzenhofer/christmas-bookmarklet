// assets/js/bookmarklet.js

(function() {
    // Initialize chaos level
    let chaosLevel = 1;
    const maxInitialChaos = 10;
    const maxChaosLevel = 30;
    const chaosIncrement = 0.2;
    const startTime = Date.now();

    // Set to keep track of transformed words to avoid re-transforming
    const transformedWords = new Set();

    // Helper function to determine if an element should be excluded
    function isExcluded(el) {
        return el.id === 'bookmarklet-link' ||
               el.classList.contains('bookmarklet-button') ||
               el.closest('main') ||
               el.tagName === 'SCRIPT' ||
               el.tagName === 'STYLE' ||
               el.isContentEditable || // Exclude editable areas
               el.tagName === 'INPUT' ||
               el.tagName === 'TEXTAREA' ||
               el.tagName === 'SELECT';
    }

    // Inject necessary CSS styles
    function injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Wiggle Animation for Headlines */
            @keyframes wiggle {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
                75% { transform: rotate(-5deg); }
                100% { transform: rotate(0deg); }
            }
            .wiggle {
                animation: wiggle 1s ease-in-out infinite;
            }

            /* Christmas Colors Animation */
            @keyframes christmas-colors {
                0% { color: #FF0000; } /* Red */
                25% { color: #00FF00; } /* Green */
                50% { color: #FFD700; } /* Gold */
                75% { color: #FFFFFF; } /* White */
                100% { color: #FF0000; } /* Red */
            }
            .christmas-colors {
                animation: christmas-colors 10s linear infinite;
            }

            /* Snowflake Animation */
            @keyframes snow-fall {
                from { transform: translateY(-10px); opacity: 1; }
                to { transform: translateY(100vh); opacity: 0.5; }
            }
            .snowflake {
                position: fixed;
                top: -10px;
                color: #fff;
                user-select: none;
                pointer-events: none;
                animation: snow-fall 10s linear infinite;
                font-size: 1em;
                z-index: 9999;
            }

            /* Ornament Animation */
            @keyframes ornament-fall {
                from { transform: translateY(-50px) rotate(0deg); opacity: 1; }
                to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            .ornament {
                position: fixed;
                top: -50px;
                user-select: none;
                pointer-events: none;
                animation: ornament-fall 8s linear infinite;
                font-size: 1.5em;
                z-index: 9999;
            }

            /* Christmas Lights */
            .christmas-lights {
                position: fixed;
                width: 100%;
                height: 30px;
                top: 0;
                left: 0;
                display: flex;
                justify-content: space-around;
                z-index: 10001;
                pointer-events: none;
            }
            .christmas-lights .light {
                width: 15px;
                height: 25px;
                background-color: red;
                border-radius: 50%;
                animation: blink 1s infinite;
            }
            .christmas-lights .light:nth-child(odd) {
                background-color: green;
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }

            /* Merry Christmas Banner */
            #merry-christmas-banner {
                position: fixed;
                top: 0;
                width: 100%;
                background-color: #ff0000;
                color: #fff;
                text-align: center;
                font-size: 2em;
                padding: 10px 0;
                z-index: 10002;
                pointer-events: none;
            }

            /* Santa Animation */
            @keyframes santa-move {
                from { left: -50px; }
                to { left: 100%; }
            }
            .santa-animation {
                position: fixed;
                top: 50%;
                left: -50px;
                font-size: 3em;
                animation: santa-move 10s linear forwards;
                pointer-events: none;
                z-index: 10003;
            }
        `;
        document.head.appendChild(style);
    }

    // Update chaos level based on elapsed time
    function updateChaosLevel() {
        const elapsed = (Date.now() - startTime) / 1000; // in seconds
        if (elapsed <= 10) {
            chaosLevel = 1 + (maxInitialChaos - 1) * (elapsed / 10);
        } else {
            chaosLevel = Math.min(chaosLevel + chaosIncrement, maxChaosLevel);
        }
    }

    // Helper function to replace the first 'o' or 'O' with 'hoho'
    function replaceOWithHoho(word) {
        return word.replace(/o/i, 'hoho');
    }

    // Function to replace words with Christmas-themed words
    function replaceWordsWithChristmasWords(word) {
        const christmasWords = [
            'Santa', 'Elf', 'Reindeer', 'Sleigh', 'Snowman', 'Candy', 'Christmas', 'Snow', 
            'Merry', 'Jolly', 'Festive', 'Holiday', 'Yule', 'Tinsel', 'Ornament', 'Star', 
            'Gift', 'Mistletoe', 'Bauble', 'Icicle', 'Gingerbread', 'Nutcracker', 'Carol', 
            'Frost', 'Twinkle', 'Bells', 'Wreath', 'Peppermint', 'Snowflake', 'North Pole'
        ];
        const randomIndex = Math.floor(Math.random() * christmasWords.length);
        return christmasWords[randomIndex];
    }

    // Function to transform words
    function transformWords() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    const parent = node.parentElement;
                    if (isExcluded(parent)) return NodeFilter.FILTER_REJECT;
                    if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        let node;
        while ((node = walker.nextNode())) {
            const text = node.nodeValue;
            const words = text.split(/(\s+)/);
            let modified = false;

            for (let i = 0; i < words.length; i++) {
                const originalWord = words[i];
                if (/^[\w]+$/.test(originalWord)) {
                    if (transformedWords.has(originalWord.toLowerCase())) continue; // Case-insensitive check

                    const rand = Math.random();
                    const replaceHohoProb = 0.5 * (chaosLevel / maxInitialChaos);
                    const replaceChristmasWordProb = 0.3 * (chaosLevel / maxInitialChaos);
                    const replaceHohoAndChristmasProb = 0.2 * (chaosLevel / maxInitialChaos);

                    if (rand < replaceHohoProb) {
                        words[i] = replaceOWithHoho(originalWord);
                        transformedWords.add(originalWord.toLowerCase());
                        modified = true;
                    } else if (rand < replaceHohoProb + replaceChristmasWordProb) {
                        words[i] = replaceWordsWithChristmasWords(originalWord);
                        transformedWords.add(originalWord.toLowerCase());
                        modified = true;
                    } else if (rand < replaceHohoProb + replaceChristmasWordProb + replaceHohoAndChristmasProb) {
                        words[i] = replaceOWithHoho(replaceWordsWithChristmasWords(originalWord));
                        transformedWords.add(originalWord.toLowerCase());
                        modified = true;
                    }

                    // Continue transforming until all words are replaced
                }
            }

            if (modified) {
                node.nodeValue = words.join('');
            }
        }
    }

    // Function to change text colors to Christmas colors
    function changeTextColors() {
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, div, li, td, th');
        elements.forEach(el => {
            if (isExcluded(el)) return;
            el.classList.add('christmas-colors');
        });
    }

    // Function to wiggle headlines
    function wiggleHeadlines() {
        const headlines = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headlines.forEach(el => {
            if (isExcluded(el)) return;
            if (Math.random() < 0.6 * (chaosLevel / maxInitialChaos)) {
                el.classList.add('wiggle');
            }
        });
    }

    // Function to add snowflakes
    function addSnowflakes() {
        const snowflakeCount = 15 + Math.floor(chaosLevel * 3);
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.textContent = '❄️';
            snowflake.classList.add('snowflake');
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
            snowflake.style.opacity = Math.random();
            snowflake.style.fontSize = `${Math.random() * 2 + 0.5}em`;
            document.body.appendChild(snowflake);

            // Remove snowflake after animation
            snowflake.addEventListener('animationend', () => {
                snowflake.remove();
            });
        }
    }

    // Function to add ornaments
    function addOrnaments() {
        const ornamentCount = 10 + Math.floor(chaosLevel * 2);
        for (let i = 0; i < ornamentCount; i++) {
            const ornament = document.createElement('div');
            ornament.textContent = '🎄';
            ornament.classList.add('ornament');
            ornament.style.left = `${Math.random() * 100}%`;
            ornament.style.animationDuration = `${8 + Math.random() * 5}s`;
            ornament.style.opacity = Math.random();
            ornament.style.fontSize = `${Math.random() * 2 + 1}em`;
            document.body.appendChild(ornament);

            // Remove ornament after animation
            ornament.addEventListener('animationend', () => {
                ornament.remove();
            });
        }
    }

    // Function to add Christmas lights
    function addChristmasLights() {
        if (document.querySelector('.christmas-lights')) return;
        const lightsContainer = document.createElement('div');
        lightsContainer.classList.add('christmas-lights');
        for (let i = 0; i < 20; i++) {
            const light = document.createElement('div');
            light.classList.add('light');
            lightsContainer.appendChild(light);
        }
        document.body.appendChild(lightsContainer);
    }

    // Function to add Merry Christmas banner
    function addMerryChristmasBanner() {
        if (document.getElementById('merry-christmas-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'merry-christmas-banner';
        banner.textContent = 'Merry Christmas!';
        document.body.appendChild(banner);
    }

    // Function to show festive decorations
    function showFestiveDecorations() {
        addSnowflakes();
        addOrnaments();
    }

    // Function to execute all Christmas-themed effects
    function executeChristmasEffects() {
        transformWords();
        changeTextColors();
        wiggleHeadlines();
        showFestiveDecorations();
    }

    // Function to decorate elements after 1 minute
    function decorateElements() {
        wiggleHeadlines();
        changeTextColors();
        showFestiveDecorations();
    }

    // Main execution function
    function executeEffects() {
        executeChristmasEffects();

        // Schedule decoration of elements after 1 minute
        setTimeout(() => {
            decorateElements();
        }, 60000); // 1 minute in milliseconds

        // Update chaos level and reapply effects every second
        setInterval(() => {
            updateChaosLevel();
            executeChristmasEffects();
        }, 1000);
    }

    // Initialize all effects
    function init() {
        injectStyles();
        addChristmasLights();
        addMerryChristmasBanner();
        executeEffects();
        playFestiveSounds();
        flickerWebsite();
    }

    // Function to play festive sounds
    function playFestiveSounds() {
        const context = new (window.AudioContext || window.webkitAudioContext)();

        function playBellSound() {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1760, context.currentTime + 1);

            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 1);
        }

        // Schedule bell sounds at random intervals between 10 and 20 seconds, scaled by chaosLevel
        function scheduleSounds() {
            const delayFactor = chaosLevel / maxInitialChaos;
            const minDelay = 10000 / delayFactor;
            const maxDelay = 20000 / delayFactor;
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;

            setTimeout(() => {
                playBellSound();
                scheduleSounds();
            }, delay);
        }

        scheduleSounds();
    }

    // Function to flicker the website with Christmas-themed effects
    function flickerWebsite() {
        // Create overlay for flicker
        const overlay = document.createElement('div');
        overlay.id = 'festive-overlay';
        overlay.style.backgroundColor = 'rgba(0, 51, 102, 0.5)'; // Semi-transparent Dark Blue
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10000';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s';
        document.body.appendChild(overlay);

        function showSanta() {
            const santa = document.createElement('div');
            santa.textContent = '🎅';
            santa.classList.add('santa-animation');
            document.body.appendChild(santa);

            // Remove Santa after animation
            santa.addEventListener('animationend', () => {
                santa.remove();
            });
        }

        function increaseSnowfallIntensity() {
            addSnowflakes();
        }

        function flicker() {
            // Flicker to dark blue
            overlay.style.opacity = '1';
            setTimeout(() => {
                overlay.style.opacity = '0';
                // Randomly choose effect
                const rand = Math.random();
                if (rand < 0.5) {
                    showSanta();
                } else {
                    increaseSnowfallIntensity();
                }
            }, 200); // Dark screen for 200ms

            // Schedule next flicker
            const delayFactor = chaosLevel / maxInitialChaos;
            const minDelay = 8000 / delayFactor;
            const maxDelay = 25000 / delayFactor;
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;

            setTimeout(flicker, delay);
        }

        flicker();
    }

    // Start the bookmarklet effects
    init();
})();
