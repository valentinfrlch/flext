import wixData from 'wix-data';
import { local } from 'wix-storage';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(function () {
    $w("#iTitle").focus()
})

let debounceTimer;
export function iTitle_keyPress(event) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = undefined;
    }
    debounceTimer = setTimeout(() => {
        filter($w('#iTitle').value)
    }, 200)
}

let lastFilterTitle;

async function filter(title) {
    if (lastFilterTitle !== title) {
        $w('#repeater1').show()
        $w('#dataset1').setFilter(wixData.filter().contains('title', title).or(wixData.filter().contains("cast", title)).or(wixData.filter().contains("keywords", title)))
        $w("#dataset1").setSort(wixData.sort().descending("likeCount"))
        var query = await wixData.query("Collections").contains("title", title).ne("bigPicture", undefined).find()
        if (query.items.length === 1) {
            $w("#dataset42").setFilter(wixData.filter().contains("title", title).ne("bigPicture", undefined)).then($w("#repeater2").expand())
        } else {
            $w("#repeater2").collapse()
        }
    }
}

export function lazyLoad(event) {
    $w("#dataset1").loadMore()
}
