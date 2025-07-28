// Chrome extension content script for cleaning up Crunchyroll simulcast calendar

// Use chrome.storage.sync if available, otherwise fallback to chrome.storage.local
const storage = chrome.storage && chrome.storage.sync ? chrome.storage.sync : chrome.storage.local;

const defaultSettings = {
    duplicateMode: 'first',
    enableExtension: true,
    debugLogging: false,
    theme: 'dark'
};

// Helper function to log debug messages only when debug logging is enabled
function debugLog(...args) {
    storage.get(['debugLogging'], (result) => {
        if (result.debugLogging) {
            console.debug(...args);
        }
    });
}

/**
 * Remove duplicates from the dayInner list, keeping the first occurrence of each anime name.
 * Uses a Set to track seen names and an array to collect indices of items to remove.
 * @param {HTMLCollection} dayInner - The collection of list items for a specific day.
 */
function removeDuplicatesKeepFirst_TwoPass(dayInner) {
    const seen = new Set();
    const toRemove = [];
    for (let i = 0; i < dayInner.length; i++) {
        const item = dayInner[i];
        const animeName = item.getElementsByTagName("cite")[0].innerText;
        if (seen.has(animeName)) {
            toRemove.push(i);
        } else {
            seen.add(animeName);
        }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
        dayInner[toRemove[i]].remove();
    }
}

/**
 * Remove duplicates from the dayInner list, keeping the last occurrence of each anime name.
 * Uses an array to track names and iterates backwards to remove duplicates.
 * @param {HTMLCollection} dayInner - The collection of list items for a specific day.
 */
function removeDuplicatesKeepLast(dayInner) {
    const names = [];
    for (let i = dayInner.length - 1; i >= 0; i--) {
        const item = dayInner[i];
        const animeName = item.getElementsByTagName("cite")[0].innerText;
        if (names.includes(animeName)) {
            item.remove();
        } else {
            names.push(animeName);
        }
    }
}

/**
 * Get the days container from the document.
 * This function assumes there is only one unique container with the class "days".
 * If multiple containers are found, it logs a debug message and returns an empty array.
 *
 * @returns {HTMLCollection|*[]} - Returns the children of the days container or an empty array if not found.
 */
function getDays() {
    const daysContainer = document.getElementsByClassName("days");

    if (daysContainer.length !== 1) {
        debugLog('No unique days containers found in the document');
        return [];
    }

    return daysContainer[0].children;
}

/**
 * Main function to clean up the Crunchyroll simulcast calendar
 */
function cleanupCrunchyrollCalendar() {
    debugLog('starting Crunchyroll calendar cleanup');

    storage.get(defaultSettings, (settings) => {
        // Ensure defaults if settings are missing
        const mergedSettings = Object.assign({}, defaultSettings, settings);

        if (!mergedSettings.enableExtension) {
            debugLog('Extension is disabled, skipping cleanup');
            return;
        }

        const days = getDays();

        if (days.length === 0) {
            debugLog('Days container not found, skipping cleanup');
            return;
        }

        let totalCleaned = 0;

        for (let day of days) {
            const dayInner = day.getElementsByTagName("li");
            const dayInnerCount = dayInner.length;

            if (mergedSettings.duplicateMode === 'first') {
                removeDuplicatesKeepFirst_TwoPass(dayInner);
            } else {
                removeDuplicatesKeepLast(dayInner);
            }

            const remainingItems = day.getElementsByTagName("li").length;
            const cleanedCount = dayInnerCount - remainingItems;
            totalCleaned += cleanedCount;

            if (cleanedCount > 0) {
                debugLog(`Day cleanup: removed ${cleanedCount}/${dayInnerCount} duplicates, ${remainingItems} unique titles remaining`);
            }
        }

        if (totalCleaned > 0) {
            debugLog(`Calendar cleanup complete: ${totalCleaned} duplicate items removed`);
        }
    });
}

// Initialize the extension when the DOM is ready
window.cleanupCrunchyrollCalendar = cleanupCrunchyrollCalendar;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupCrunchyrollCalendar);
} else {
    cleanupCrunchyrollCalendar();
}
