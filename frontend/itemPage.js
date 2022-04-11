import wixUsers from 'wix-users';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { fusion } from 'backend/Fusion';

//-------------Global Variables-------------//

let movieId;
let user = wixUsers.currentUser;
let fullText;
var r;

//-------------onPageReady-------------//
$w.onReady(async function () {
    await FlextAI()
    movieId = $w('#itemdetails').getCurrentItem()
    recommendationLiked()
    var today = new Date()
    $w("#itemdetails").onReady(async function () {
        var description = $w("#itemdetails").getCurrentItem().description
        if (description !== undefined) {
            fullText = description
            var maxLength = 300
            if (fullText.length > maxLength) {
                var shortText = fullText.split('. ', 1)[0] + "."
                $w("#text2").text = shortText
            } else {
                $w("#text2").text = fullText
                $w("#text68").hide()
            }
        }
        let genre = movieId.genre
        let tags01 = movieId.tags
        let tags02 = movieId.tags02
        let seasons = movieId.seasons
        let publisher = movieId.filmreihe
        let runtime
        let fsk;
        if ($w("#itemdetails").getCurrentItem().serie !== true) {
            runtime = minsToHours($w("#itemdetails").getCurrentItem().runtime)[0] + "h " + minsToHours($w("#itemdetails").getCurrentItem().runtime)[1] + "m"
        }
        if ($w("#itemdetails").getCurrentItem().fsk !== undefined) { fsk = "Ab " + $w("#itemdetails").getCurrentItem().fsk }
        let LikeValue = $w('#itemdetails').getCurrentItem().likeCount * 10
        let theTags = [seasons, genre, tags01, tags02, fsk, runtime].filter(Boolean).join(" • ");
        $w("#text66").text = theTags
        let cast = $w("#itemdetails").getCurrentItem().cast.filter(Boolean).join(", ")
        if (cast === undefined) {
            $w("#text102").collapse()
        } else {
            $w("#text102").text = "Cast: " + cast.substr(0, Math.min(cast.length, cast.substr(0, 70).lastIndexOf(","))) + "... mehr"
        }
        checkWishlist()
        downloadGen_v2()
        //button text
        r = await wixData.query("UserPlayed").eq("title", $w("#itemdetails").getCurrentItem().title).eq("_owner", wixUsers.currentUser.id).find()
        try {
            if (r.items[0].timeWatched !== undefined && r.items[0].timeWatched >= 100 && movieId.runtime - r.items[0].timeWatched / 60 >= 10) {
                $w("#button38").label = "Fortsetzen"
                var rminutes = minsToHours(movieId.runtime - (r.items[0].timeWatched / 60))[1]
                var rhours = minsToHours(movieId.runtime - (r.items[0].timeWatched / 60))[0]
                var percent = (r.items[0].timeWatched / 60) / movieId.runtime * 100
                $w("#progressBar1").value = percent
                $w("#progressBar1").expand()
                if (rhours > 0) {
                    $w("#text103").text = "Noch " + rhours + "h " + rminutes + "m"
                } else {
                    $w("#text103").text = "Noch " + rminutes + "m"
                }
                $w("#text103").expand()
            }
        } catch (err) {}
    })

    //check if item has been downloaded already or is available to download
    let item = await $w('#itemdetails').getCurrentItem();
    wixData.query("Downloads")
        .eq("newField", item._id)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                $w("#downloaded").show()
                $w("#download").hide()
            } else {
                if ($w("#itemdetails").getCurrentItem().serie === true) {
                    $w("#download").hide()
                }
                if ($w("#itemdetails").getCurrentItem().upcoming === true) {
                    $w("#download").hide()
                }
            }
        })
    //first check if trailer is available
    if ($w("#itemdetails").getCurrentItem().trailer === undefined) {
        $w("#videoPlayer1").collapse()
    }
});

function minsToHours(min) {
    var hours = (min / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return [rhours, rminutes]
}


export async function recommendationLiked() {
    var rec;
    var positiveK = []
    var negativeK = []
    let likeValue = $w('#itemdetails').getCurrentItem().likeCount * 10
    var keywords = movieId.keywords
    var results = await wixData.query("MemberPredictions").include("movie").find()
    for (var p = 0; p < results.items.length; p++) {
        positiveK = positiveK.concat(results.items[p].movie.keywords)
    }
    console.log("positive: ", positiveK)
    var antiResults = await wixData.query("MemberAntiPredictions").include("movie").find()
    for (var n = 0; n < antiResults.items.length; n++) {
        negativeK = negativeK.concat(antiResults.items[n].movie.keywords)
    }
    console.log("negative: ", negativeK)

    var positiveCount = keywords.filter(item => positiveK.includes(item)).length
    var antiCount = keywords.filter(item => negativeK.includes(item)).length
    var count = positiveCount - 2 * antiCount
    console.log(positiveCount, antiCount, count)
    if (count >= 0) {
        rec = Math.round(likeValue + Math.pow(count, 2))
    } else {
        rec = Math.round(likeValue - Math.pow(count, 2))
    }
    if (rec >= 100) {
        rec = 100
    }
    if (rec <= 0) {
        rec = 0
    }
    console.log("rec: ", rec)
    $w("#text64").text = rec + "% Match"
}

async function checkWishlist() {
    if (wixUsers.currentUser.loggedIn) {
        let wishListResult = await wixData.query("myList")
            .eq("movieId", movieId._id)
            .eq("_owner", user.id)
            .find();

        if (wishListResult.items.length > 0)
            $w('#inWishlist').show();
        else
            $w('#notInWishlist').show();
    } else {
        $w('#notInWishlist').show();
    }
}

export function inWishlist(event, $w) {
    removeFromWishlist()
}

export function notInWishlist(event, $w) {
    addToWishlist()
}

//-------------Wishlist Button Events-------------

async function addToWishlist() {
    let wishListItem = {
        movieId: movieId._id,
        userId: user.id,
        genre: movieId.genre,
        tags01: movieId.tags,
        tags02: movieId.tags02,
        tags03: movieId.tags03,
        likeCount: movieId.likeCount
    };

    $w('#notInWishlist').hide();
    $w('#inWishlist').show("bounce", Options);
    let result = await wixData.insert("myList", wishListItem)
}

async function removeFromWishlist() {
    let wishListResult = await wixData.query("myList")
        .eq("movieId", movieId._id)
        .eq("_owner", user.id)
        .find();

    if (wishListResult.length > 0) {
        $w('#inWishlist').hide();
        $w('#notInWishlist').show("bounce", Options);
        await wixData.remove("myList", wishListResult.items[0]._id)
    }
}

//---------------Like and Dislike check before showing the buttons---------------

$w.onReady(async function checkLikeList() {
    let item = await $w('#itemdetails').getCurrentItem();
    wixData.query("MemberPredictions")
        .eq("movie", item._id)
        .find()
        .then((results) => {
            console.log(results)
            if (results.items.length > 0) {
                $w('#likeClicked').show()
                $w("#text64").hide()
            } else {
                $w('#like').show()
            }
        })
});

$w.onReady(async function checkDislikeList() {
    let item = await $w('#itemdetails').getCurrentItem();
    wixData.query("MemberAntiPredictions")
        .eq("movie", item._id)
        .find()
        .then((results) => {
            console.log(results)
            if (results.items.length > 0) {
                $w('#dislikeClicked').show()
                $w("#text64").hide()
            } else {
                $w('#dislike').show()
            }
        })
});
//---------------------Like Button Events-------------------

//Options for Animations
let Options = {
    "duration": 1000,
    "delay": 0,
    "direction": "center"
};

export async function like_click(event) {
    let toInsert = {
        userId: user.id,
        genre: movieId.genre,
        tag: movieId.tags,
        publisher: movieId.filmreihe,
        movie: movieId._id,
        title: movieId.title,
        tags02: movieId.tags02,
        tags03: movieId.tags03,
        likeCount: movieId.likeCount
    };

    $w('#like').hide();
    $w('#likeClicked').show("bounce", Options);
    $w("#dislikeClicked").hide();
    $w("#dislike").show();
    await wixData.insert("MemberPredictions", toInsert)
    var result = await wixData.query("MemberAntiPredictions").eq("movie", $w('#itemdetails').getCurrentItem()._id).find()
    await wixData.remove("MemberAntiPredictions", result.items[0]._id)
    $w("#text64").hide("fade")
    if (!local.getItem("like")) {
        wixWindow.openLightbox("like");
        local.setItem("like", "yes");
    }
}

export async function dislike_click(event) {
    let toInsert = {
        movie: movieId._id,
        genre: $w("#itemdetails").getCurrentItem().genre,
        tags: $w("#itemdetails").getCurrentItem().tags,
    };

    $w('#dislike').hide();
    $w('#dislikeClicked').show("bounce", Options);
    $w("#likeClicked").hide();
    $w("#like").show()
    $w("#text64").hide("fade")
    await wixData.insert("MemberAntiPredictions", toInsert)
    var result = await wixData.query("MemberPredictions").eq("movie", $w('#itemdetails').getCurrentItem()._id).find()
    await wixData.remove("MemberPredictions", result.items[0]._id)
    if (!local.getItem("like")) {
        wixWindow.openLightbox("like");
        local.setItem("like", "yes");
    }
}

export async function dislikeClicked_click(event) {
    let toInsert = {
        userId: user.id,
        genre: movieId.genre,
        movieId: movieId._id,
        title: movieId.title,
        tags01: movieId.tags,
        tags02: movieId.tags02,
        tags03: movieId.tags03,
        likeCount: movieId.likeCount
    };
    $w('#dislikeClicked').hide();
    $w('#dislike').show("bounce", Options);
    var result = await wixData.query("MemberAntiPredictions").eq("movie", $w('#itemdetails').getCurrentItem()._id).find()
    await wixData.remove("MemberAntiPredictions", result.items[0]._id)
    await recommendationLiked()
    $w("#text64").show("fade")
}

export async function likeClicked_click(event) {
    var result = await wixData.query("MemberPredictions").eq("movie", $w('#itemdetails').getCurrentItem()._id).find()
    $w('#likeClicked').hide();
    $w('#like').show("bounce", Options);
    await wixData.remove("MemberPredictions", result.items[0]._id)
    await recommendationLiked()
    $w("#text64").show("fade")
}

//------------Continue watching-----------------

export async function play(event) {
    var watchlist = await wixData.query("UserPlayed").eq("movieId", movieId._id).eq("_owner", user.id).find()
    if (watchlist.items.length > 0) {
        let item = watchlist.items[0]
        item.likeCount += 1.0
        await wixData.update("UserPlayed", item)
    } else {
        let toInsert = {
            "title": movieId.title,
            "movieId": movieId._id,
        }
        await wixData.insert("UserPlayed", toInsert)
    }
    playiFrame($w("#itemdetails").getCurrentItem())
}

//----------------Download-----------------

export function downloaded_click(event) {
    removeDownload()
    $w("#download").show()
    $w("#downloaded").hide()
}

export async function download() {
    addDownload()
    $w("#download").target = "_blank"
    $w("#download").link = downloadGen_v2()
    $w("#download").hide()
    $w("#downloaded").show()
}

export function addDownload() {
    let toInsert = {
        newField: movieId._id,
        title: movieId.title
    };
    wixData.insert("Downloads", toInsert)
}

export function removeDownload() {
    wixData.query("Downloads")
        .eq("newField", $w('#itemdetails').getCurrentItem()._id)
        .find()
        .then((downloadedItem) => {
            wixData.remove("Downloads", downloadedItem.items[0]._id)
            $w('#download').show();
            $w('#downloaded').hide();
        })
}

async function playiFrame(data) {
    $w.onReady(function () {
        let url = data.link
        if (data.link.substring(0, 39) === "https://drive.google.com/drive/folders/") {
            wixLocation.to(data.link)
        } else if (data.link.substring(0, 32) === "https://drive.google.com/file/d/") {
            wixWindow.openLightbox("PlayFullscreen", {
                "id": url.substring(32, 65),
                "title": data.title
            })
            $w("#dataset4").refresh()
        } else if (data.link.substring(0, 33) === "https://drive.google.com/open?id=") {
            if (data.serie === true) {
                wixLocation.to(data.link)
            } else {
                wixWindow.openLightbox("PlayFullscreen", {
                    "id": url.substring(33, 66),
                    "title": data.title
                })
                $w("#dataset4").refresh()
            }
        } else if (data.link.substring(0, 41) === "https://drive.google.com/a/kzo.ch/file/d/") {
            wixWindow.openLightbox("PlayFullscreen", {
                "id": url.substring(41, 74),
                "title": data.title
            })
            $w("#dataset4").refresh()
        } else if (data.serie === true) {
            wixLocation.to(data.link)
        }
    })
}

//----------------more expand button----------------

export function more(event) {
    $w("#text2").text = fullText;
    $w("#text68").hide()
}

export function Trailer(event) {
    let foldOptions = {
        "duration": 350,
        delay: 0
    }
    let floatOptionsRIGHT = {
        duration: 350,
        direction: "right",
        delay: 0
    }
    let floatOptionsLEFT = {
        duration: 350,
        direction: "left",
        delay: 0
    }
    $w("#line3").hide("fold", foldOptions)
    $w("#line2").show("fold", foldOptions)
    $w("#repeater2").hide("float", floatOptionsRIGHT)
    $w("#videoPlayer1").show("float", floatOptionsLEFT)
}

export function similarTitles(event) {
    let foldOptions = {
        "duration": 350,
        delay: 0
    }
    let floatOptionsRIGHT = {
        duration: 350,
        direction: "right",
        delay: 0
    }
    let floatOptionsLEFT = {
        duration: 350,
        direction: "left",
        delay: 0
    }
    $w("#line2").hide("fold", foldOptions)
    $w("#line3").show("fold", foldOptions)
    $w("#videoPlayer1").hide("float", floatOptionsLEFT)
    $w("#repeater2").show("float", floatOptionsRIGHT)
}

//----------------Prediction Algorithm--------------
export function FlextAI() {
    $w("#dataset2").onReady(function () {
        var title = movieId.title
        console.log("title: ", title)
        fusion([title]).then(product => {
            $w("#dataset2").setFilter(wixData.filter().hasSome("title", product))
            console.log("suggestions: ", product)
        })
    })
}

export function closePlayer(event) {
    $w("#group2").expand()
}

export function downloadGen_v2() {
    let url = $w("#itemdetails").getCurrentItem().link
    let apiKey = "AIzaSyA0VK4HhVKAm4P5rqWc6d8qL_Q5BynOncM"

    if ($w("#itemdetails").getCurrentItem().link.substring(0, 32) === "https://drive.google.com/file/d/") {
        setTimeout(function () {}, 3000);
        let id = url.substring(32, 65)
        let downloadKey = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&key=" + apiKey
        $w("#download").target = "_blank"
        $w("#download").link = downloadKey
    }
    if ($w("#itemdetails").getCurrentItem().link.substring(0, 33) === "https://drive.google.com/open?id=") {
        setTimeout(function () {}, 3000);
        let id = url.substring(33, 66)
        let downloadKey = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&key=" + apiKey
        $w("#download").target = "_blank"
        $w("#download").link = downloadKey
    }

    if ($w("#itemdetails").getCurrentItem().link.substring(0, 41) === "https://drive.google.com/a/kzo.ch/file/d/") {
        setTimeout(function () {}, 3000);
        let id = url.substring(41, 74)
        let downloadKey = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&key=" + apiKey
        $w("#download").target = "_blank"
        $w("#download").link = downloadKey
    }
    if ($w("#itemdetails").getCurrentItem().serie === true) {
        console.log($w("#itemdetails").getCurrentItem().serie)
        $w("#download").collapse()
    }
}

export function castPopup(event) {
	wixWindow.openLightbox("Cast", $w("#itemdetails").getCurrentItem().cast)
}


/*                                              
 ******  **                   **  
 ******  **   *****   ** **  *****
 **      **  *******   ***    **  
 **      **   *****  *** **    *** valentinfrlch
 You know, for movies.
*/
