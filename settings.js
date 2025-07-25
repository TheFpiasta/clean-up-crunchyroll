const storage = chrome.storage && chrome.storage.sync ? chrome.storage.sync : chrome.storage.local;
const defaultSettings = {
    duplicateMode: 'first',
    enableExtension: true,
    debugLogging: false,
    theme: 'dark'
};

// Helper function to log debug messages only when debug logging is enabled
function debugLog(...args) {
    // Get current settings to check if debug logging is enabled
    storage.get(['debugLogging'], (result) => {
        if (result.debugLogging) {
            console.log(...args);
        }
    });
}

function loadSettings() {
    if (!chrome.storage) {
        console.error('Chrome storage API not available');
        return;
    }

    storage.get(null, (settings) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }

        // Always use defaults if missing or if storage is empty
        const merged = Object.assign({}, defaultSettings, settings || {});

        // Set duplicate mode checkboxes
        const firstCheckbox = document.getElementById('duplicateMode-first');
        const lastCheckbox = document.getElementById('duplicateMode-last');

        if (firstCheckbox && lastCheckbox) {
            firstCheckbox.checked = merged.duplicateMode === 'first';
            lastCheckbox.checked = merged.duplicateMode === 'last';
        }

        // Update toggle switches
        updateToggleSwitch('enableExtension', merged.enableExtension);
        updateToggleSwitch('debugLogging', merged.debugLogging);

        // Set theme toggle
        updateThemeToggle(merged.theme);
        applyTheme(merged.theme);
    });
}

function updateToggleSwitch(switchId, isActive) {
    const toggleSwitch = document.getElementById(switchId);
    if (toggleSwitch) {
        if (isActive) {
            toggleSwitch.classList.add('active');
        } else {
            toggleSwitch.classList.remove('active');
        }
    }
}

function updateThemeToggle(theme) {
    const themeSwitch = document.getElementById('theme-switch');

    if (theme === 'dark') {
        themeSwitch.classList.add('dark');
    } else {
        themeSwitch.classList.remove('dark');
    }
}

function saveSettings() {
    if (!chrome.storage) {
        console.error('Chrome storage API not available');
        return;
    }

    const firstCheckbox = document.getElementById('duplicateMode-first');
    const lastCheckbox = document.getElementById('duplicateMode-last');
    const enableExtensionEl = document.getElementById('enableExtension');
    const debugLoggingEl = document.getElementById('debugLogging');
    const themeSwitch = document.getElementById('theme-switch');

    // Determine duplicate mode based on which checkbox is checked
    let duplicateMode = 'first'; // default
    if (firstCheckbox.checked) {
        duplicateMode = 'first';
    } else if (lastCheckbox.checked) {
        duplicateMode = 'last';
    }

    const theme = themeSwitch.classList.contains('dark') ? 'dark' : 'light';

    const settings = {
        duplicateMode: duplicateMode,
        enableExtension: enableExtensionEl.classList.contains('active'),
        debugLogging: debugLoggingEl.classList.contains('active'),
        theme: theme
    };

    storage.set(settings, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }

        debugLog('Settings auto-saved:', settings);
        applyTheme(settings.theme);
    });
}

function applyTheme(theme) {
    const container = document.querySelector('.container');
    if (theme === 'dark') {
        document.body.style.background = '#23272f';
        container.style.background = '#2d323c';
        container.style.color = '#fff';
        container.classList.add('dark-theme');
    } else {
        document.body.style.background = '#f7f7f7';
        container.style.background = '#fff';
        container.style.color = '#222';
        container.classList.remove('dark-theme');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial debug logs - these will check the setting before logging
    debugLog('Settings popup loaded');
    debugLog('Chrome storage available:', !!chrome.storage);
    debugLog('Storage object:', storage);

    // Test storage immediately
    storage.get(null, (result) => {
        debugLog('Current storage contents:', result);
        if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
        }
    });

    loadSettings();

    // Duplicate mode checkbox event listeners (mutual exclusivity)
    document.getElementById('duplicateMode-first').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('duplicateMode-last').checked = false;
        }
        saveSettings();
    });

    document.getElementById('duplicateMode-last').addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('duplicateMode-first').checked = false;
        }
        saveSettings();
    });

    // Toggle switch event listeners
    document.getElementById('enableExtension').addEventListener('click', () => {
        const toggle = document.getElementById('enableExtension');
        toggle.classList.toggle('active');
        saveSettings();
    });

    document.getElementById('debugLogging').addEventListener('click', () => {
        const toggle = document.getElementById('debugLogging');
        toggle.classList.toggle('active');
        saveSettings();
    });

    // Theme toggle switch event listener
    document.getElementById('theme-switch').addEventListener('click', () => {
        const themeSwitch = document.getElementById('theme-switch');
        const currentTheme = themeSwitch.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        updateThemeToggle(newTheme);
        applyTheme(newTheme);
        saveSettings();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        debugLog('Reset button clicked');
        storage.set(defaultSettings, () => {
            debugLog('Reset complete, reloading settings');
            loadSettings();
        });
    });
});
