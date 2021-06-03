import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { fusion } from 'backend/Fusion';

let user = wixUsers.currentUser

$w.onReady(async function () {
    var disliked = []
    var searchDisliked = await wixData.query("MemberAntiPredictions").eq("_owner", user.id).find()
    for (var z = 0; z < searchDisliked.items.length; z++) {
        disliked.push(searchDisliked.items[z].movie)
    }
    console.log(disliked)
    var titles = []
    var searchLiked = await wixData.query("MemberPredictions").eq("_owner", user.id).find()
    for (var z = 0; z < searchLiked.items.length; z++) {
        titles.push(searchLiked.items[z].movie.title)
    }
    console.log(titles)
    var fusionReturn = await fusion(titles) //cloud computed predictions
    await $w("#dataset42").setFilter(wixData.filter().hasSome("title", fusionReturn).not(wixData.filter().hasSome("_id", disliked)))

    $w("#dataset5").onReady(function () {
        $w("#dataset42").onReady(function () {
            forEachItem()
        })
    })
})

function forEachItem() {
    $w("#repeater1").forEachItem(async ($item, itemData, index) => {
        //check if item is in wishlist
        var query = await wixData.query("myList").eq("movieId", itemData.item._id).eq("_owner", wixUsers.currentUser.id).find()
        if (query.items.length > 0) {
            $item("#inWishlist").show()
        } else {
            $item("#notInWishlist").show()
        }
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
        $item("#text105").text = theTags
        $item("#text106").text = shortText
    })

    $w("#repeater2").forEachItem(async ($item, itemData, index) => {
        //check if item is in wishlist
        var query = await wixData.query("myList").eq("movieId", itemData.item._id).eq("_owner", wixUsers.currentUser.id).find()
        if (query.items.length > 0) {
            $item("#image94").show()
        } else {
            $item("#image93").show()
        }
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
        $item("#text66").text = theTags
        $item("#text103").text = shortText
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
    console.log(itemID)

    wixData.query("myList")
        .eq("movieId", itemID)
        .find()
        .then((queried) => {
            console.log(queried)
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
    console.log(itemID)

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
    $w("#top10").hide()
    $w("#top10text").show()
    $w("#coming").hide()
    $w("#comingsoontext").show()
    $w("#foryoutext").hide()
    $w("#foryou").show()
}

export function comingsoontext_click(event) {
    $w("#top10").hide()
    $w("#top10text").show()
    $w("#coming").show()
    $w("#comingsoontext").hide()
    $w("#foryoutext").show()
    $w("#foryou").hide()
}

export function top10text_click(event) {
    $w("#top10").show()
    $w("#top10text").hide()
    $w("#coming").hide()
    $w("#comingsoontext").show()
    $w("#foryoutext").show()
    $w("#foryou").hide()
    $w("#anchor1").scrollTo()
}
