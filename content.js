(() => {
    const days = document.getElementsByClassName("days")[0].children;
    for (let day of days) {
        const dayInner = day.getElementsByTagName("li");
        const dayInnerCount = dayInner.length;
        removeDuplicatesKeepFirst_TwoPass(dayInner);
        removeDuplicatesKeepLast(dayInner)
        const names = Array.from(day.getElementsByTagName("li")).map(item => item.getElementsByTagName("cite")[0].innerText);
        console.debug(`cleaned-up ${dayInnerCount - names.length}/${dayInnerCount} useless Items. Unique Titles: ${names.length}`);
    }
})();

/**
 * Remove duplicates from the dayInner list, keeping the first occurrence of each anime name.
 * Uses a Set to track seen names and an array to collect indices of items to remove.
 *
 * @param dayInner {HTMLCollection} - The collection of list items for a specific day.
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
 *
 * @param dayInner {HTMLCollection} - The collection of list items for a specific day.
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
