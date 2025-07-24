(() => {
    const days = document.getElementsByClassName("days")[0].children;
    for (let day of days) {
        const dayInner = day.getElementsByTagName("li");
        const dayInnerCount = dayInner.length;
        const names = [];

        // Iterate through the items in reverse order to remove duplicates and don't affect the index of remaining items
        for (let i = dayInner.length - 1; i >= 0; i--) {
            const item = dayInner[i];
            const animeName = item.getElementsByTagName("cite")[0].innerText;

            if (names.includes(animeName)) {
                item.remove();
            } else {
                names.push(animeName);
            }
        }
        console.debug(`cleaned-up ${dayInnerCount - names.length}/${dayInnerCount} useless Items. Unique Titles: ${names.length}`);
    }
})();
