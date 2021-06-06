import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { fusion } from 'backend/Fusion';

let user = wixUsers.currentUser

$w.onReady(async function () {
    var titles = []
    var disliked = []
    var search = await wixData.query("MemberAntiPredictions").eq("_owner", user.id).find()
    for (var z = 0; z < search.items.length; z++) {
        disliked.push(search.items[z].movie)
    }
    var items = await $w("#dataset25").getItems(0, 5)
    for (var i = 0; i < items.items.length; i++) {
        titles.push(items.items[i].movie.title)
    }
    var fusionReturn = await fusion(titles) //cloud computed predictions
    await $w("#dataset42").setFilter(wixData.filter().hasSome("title", fusionReturn).not(wixData.filter().hasSome("_id", disliked)))

    $w("#dataset5").onReady(function () {
        $w("#dataset42").onReady(function () {
            forEachItem()
        })
    })
})

function forEachItem() {
    $w("#repeater1").forEachItem(async ($item, itemData) => {
        //check if item is in wishlist
        var query = await wixData.query("myList").eq("movieId", itemData.item._id).eq("_owner", user.id).find()
        if (query.items.length > 0) {
            $item("#inWishlist").show()
        } else {
            $item("#notInWishlist").show()
        }
        try {
            let seasons = itemData.item.seasons
            let genre = itemData.item.genre
            let tags01 = itemData.item.tags
            let tags02 = itemData.item.tags02
            let fsk = itemData.item.fsk
            let keyword01 = itemData.item.keywords[0]
            let keyword02 = itemData.item.keywords[1]
            var shortText = itemData.item.description.split('. ', 1)[0] + "."

            let runtime;
            if (itemData.item.serie !== true) {
                runtime = minsToHours(itemData.item.runtime)[0] + "h " + minsToHours(itemData.item.runtime)[1] + "m"
            }
            let theTags = [seasons, genre, tags01, tags02, fsk, keyword01, keyword02, runtime].filter(Boolean).join(" • ")
            $item("#text103").text = theTags
            $item("#text66").text = shortText
        } catch (err) {}
    })

    $w("#repeater2").forEachItem(async ($item, itemData) => {
        //check if item is in wishlist
        var query = await wixData.query("myList").eq("movieId", itemData._id).eq("_owner", user.id).find()
        if (query.items.length > 0) {
            $item("#image94").show()
        } else {
            $item("#image93").show()
        }
        try {
            let seasons = itemData.seasons
            let genre = itemData.genre
            let tags01 = itemData.tags
            let tags02 = itemData.tags02
            let fsk = itemData.fsk
            let keyword01 = itemData.keywords[0]
            let keyword02 = itemData.keywords[1]
            var shortText = itemData.description.split('. ', 1)[0] + "."

            let runtime;
            if (itemData.serie !== true) {
                runtime = minsToHours(itemData.runtime)[0] + "h " + minsToHours(itemData.runtime)[1] + "m"
            }
            let theTags = [seasons, genre, tags01, tags02, fsk, keyword01, keyword02, runtime].filter(Boolean).join(" • ")
            $item("#text105").text = theTags
            $item("#text106").text = shortText
        } catch (err) {}
    })

    $w("#repeater3").forEachItem(async ($item, itemData) => {
        //check if item is in wishlist
        try {
            let seasons = itemData.seasons
            let genre = itemData.genre
            let tags01 = itemData.tags
            let tags02 = itemData.tags02
            let fsk = itemData.fsk
            let keyword01 = itemData.keywords[0]
            let keyword02 = itemData.keywords[1]
            var shortText = itemData.description.split('. ', 1)[0] + "."

            let runtime;
            if (itemData.serie !== true) {
                runtime = minsToHours(itemData.runtime)[0] + "h " + minsToHours(itemData.runtime)[1] + "m"
            }
            let theTags = [seasons, genre, tags01, tags02, fsk, keyword01, keyword02, runtime].filter(Boolean).join(" • ")
            $item("#text109").text = theTags
            $item("#text110").text = shortText
        } catch (err) {}
    })
}

function minsToHours(min) {
    var hours = (min / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return [rhours, rminutes]
}

export function remove(event) {
    let $item = $w.at(event.context);
    let currentItem = $item("#dataset5").getCurrentItem();
    let itemID = `${currentItem._id}`;

    wixData.query("myList")
        .eq("movieId", itemID)
        .find()
        .then((queried) => {
            wixData.remove("myList", queried.items[0]._id).then(() => {
                $item("#inWishlist").hide()
                $item("#notInWishlist").show()
            })
        })
}

export function add(event) {
    let $item = $w.at(event.context);
    let currentItem = $item("#dataset5").getCurrentItem();
    let itemID = `${currentItem._id}`;

    let toInsert = {
        "movieId": itemID
    }

    wixData.insert("myList", toInsert).then(() => {
        $item("#notInWishlist").hide()
        $item("#inWishlist").show()
    })
}

//----------click options for different tabs-------------

export function foryoutext_click(event) {
    $w("#anchor2").scrollTo()
}

export function comingsoontext_click(event) {
    $w("#anchor3").scrollTo()
}

export function top10text_click(event) {
    $w("#anchor1").scrollTo()
}

export function text115_click(event) {
    $w("#anchor1").scrollTo()
}

export function text114_click(event) {
    $w("#anchor3").scrollTo()
}

export function text118_click(event) {
    $w("#anchor2").scrollTo()
}

export function text117_click(event) {
    $w("#anchor1").scrollTo()
}
