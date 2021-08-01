import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { local } from 'wix-storage';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import { fusion } from 'backend/Fusion';
import { dataQuery } from 'backend/cloud';

var type; //values: undefined (default), true (showing only tv shows), false (showing only movies)
var data; //holds value "genre"
let movieId;
let fullText;
let user = wixUsers.currentUser;
var item;
var featureItem;
var disliked = []
var fusionReturn = []
let id;

$w.onReady(async function () {
    if (wixWindow.formFactor !== "Mobile") {
        //Desktop
        $w("#image52").collapse()
        $w("#dataset28").onReady(async function () {
            await $w("#dataset28").loadMore()
        })
    }
    $w("#dataset33").onReady(function () {
        let name = $w("#dataset33").getCurrentItem().firstName
        if (name !== undefined) {
            $w("#text60").text = "Mit dem Profil von " + name + " weiterschauen"
            $w('#text47').text = "Top-Auswahl für " + name
        } else {
            $w("#text60").text = "Weiterschauen"
            $w('#text47').text = "Top-Auswahl für dich"
        }
    })

    if (wixWindow.rendering.env === "browser") {
        var search = await wixData.query("MemberAntiPredictions").eq("_owner", user.id).find()
        for (var z = 0; z < search.items.length; z++) {
            disliked.push(search.items[z].movie)
        }

        await Featured()

        var titles = []
        $w("#dataset25").onReady(async function () {
            var items = await $w("#dataset25").getItems(0, 5)
            for (var k = 0; k < items.items.length; k++) {
                titles.push(items.items[k].movie.title)
            }
            fusionReturn = await fusion(titles) //cloud computed predictions
            await $w("#dataset21").setFilter(wixData.filter().hasSome("title", fusionReturn).not(wixData.filter().hasSome("_id", disliked)))

        })
    }
    if (!local.getItem("githubUpdate")) {
        wixWindow.openLightbox("Patch");
        local.setItem("githubUpdate", "true");
    }
    lazyLoad()
})

//----------------------Set Featured-------------------

export async function Featured(product) {
    var feature = await dataQuery(type, data, product)
    var rnd = Math.floor(Math.random() * feature.items.length)
    featureItem = feature.items[rnd]
    if (wixWindow.formFactor !== "Mobile") {
        try {
            $w("#columnStrip1").background.src = await featureItem.poster
        } catch (err) {}
    }
    $w("#text104").text = await featureItem.title
    $w("#image52").src = await featureItem.poster
    $w("#image86").link = featureItem['link-dataCollection-title']
    let genre = featureItem.genre
    let tags01 = featureItem.tags
    let tags02 = featureItem.tags02
    let keyword01 = featureItem.keywords[0]
    let keyword02 = featureItem.keywords[1]
    let season = featureItem.season
    let fsk;
    if (featureItem.fsk !== undefined) { fsk = "Ab " + featureItem.fsk }
    let theTags = [genre, tags01, tags02, season, fsk, keyword01, keyword02].filter(Boolean).join(" • ");
    $w("#text66").text = theTags
    fullText = featureItem.description
    var maxLength = 300
    if (wixWindow.formFactor !== "Mobile") {
        var shortText = fullText.substr(0, maxLength);
        shortText = shortText.substr(0, Math.min(shortText.length, shortText.lastIndexOf(".") + 1))
        $w("#text64").text = shortText
    }
    if (wixUsers.currentUser.loggedIn) {
        var wishListResult = await wixData.query("myList").eq("movieId", featureItem._id).eq("_owner", user.id).find()
        if (wishListResult.items.length > 0)
            $w('#inWishlist').show()
        else
            $w('#notInWishlist').show()
    } else {
        $w('#notInWishlist').show()
    }
    return;
}

export async function listAddons(disliked) {
    var query = []
    if ($w("#dataset31").getCurrentItem() !== undefined) {
        var qry = await $w("#dataset31").getItems(0, 5)
        for (var q = 0; q < qry.items.length; q++) {
            query.push(qry.items[q].movieId.title)
        }
        fusion(query).then(async product => {
            if (type !== undefined) {
                if (type === false) {
                    if (data !== undefined) {
                        await $w("#dataset32").setFilter(wixData.filter().hasSome("title", product).ne("serie", true).contains("genre", data))
                    } else {
                        await $w("#dataset32").setFilter(wixData.filter().hasSome("title", product).ne("serie", true))
                    }
                } else {
                    if (data !== undefined) {
                        await $w("#dataset32").setFilter(wixData.filter().hasSome("title", product).eq("serie", true).contains("genre", data))
                    } else {
                        await $w("#dataset32").setFilter(wixData.filter().hasSome("title", product).eq("serie", true))
                    }
                }
            } else {
                await $w("#dataset32").setFilter(wixData.filter().hasSome("title", product).not(wixData.filter().hasSome("_id", disliked)))
            }
        })
    }
    return
}

export async function lazyLoad() {
    await listAddons(disliked)
    $w("#dataset25").onReady(async function () {
        var cast = await $w("#dataset25").getCurrentItem().movie.cast[0]
        if (type !== undefined && cast !== undefined) {
            if (type === false) {
                if (data !== undefined) {
                    await $w("#dataset34").setFilter(wixData.filter().contains("cast", cast).contains("genre", data).ne("serie", true))
                    $w("#text103").text = data + " Filme mit " + cast
                } else {
                    await $w("#dataset34").setFilter(wixData.filter().contains("cast", cast).ne("serie", true))
                    $w("#text103").text = "Filme mit " + cast
                }
            } else {
                if (data !== undefined) {
                    await $w("#dataset34").setFilter(wixData.filter().contains("cast", cast).contains("genre", data).eq("serie", true))
                    $w("#text103").text = data + " Serien mit " + cast
                } else {
                    await $w("#dataset34").setFilter(wixData.filter().contains("cast", cast).eq("serie", true))
                    $w("#text103").text = "Serien mit " + cast
                }
            }
        } else {
            await $w("#dataset34").setFilter(wixData.filter().contains("cast", cast))
            $w("#text103").text = "Filme und Serien mit " + cast
        }

        if ($w("#dataset34").getTotalCount() <= 3) {
            await $w("#gallery19").collapse()
            await $w("#text103").collapse()
        } else {
            await $w("#gallery19").expand()
            await $w("#text103").expand()
        }

        var basedKeywords = ["historical fiction", "based on a true story", "history", "true crime", "biography"]
        if (type !== undefined) {
            if (type === false) {
                if (data !== undefined) {
                    await $w("#dataset42").setFilter(wixData.filter().ne("serie", true).contains("genre", data).hasSome("keywords", basedKeywords))
                } else {
                    await $w("#dataset42").setFilter(wixData.filter().ne("serie", true).hasSome("keywords", basedKeywords))
                }
            } else {
                if (data !== undefined) {
                    await $w("#dataset42").setFilter(wixData.filter().eq("serie", true).contains("genre", data).hasSome("keywords", basedKeywords))
                } else {
                    await $w("#dataset42").setFilter(wixData.filter().eq("serie", true).hasSome("keywords", basedKeywords))
                }
            }
        } else {
            await $w("#dataset42").setFilter(wixData.filter().hasSome("keywords", basedKeywords))
        }

        //suspenseful
        if ($w("#dataset40").getTotalCount() <= 3) {
            await $w("#text71").collapse()
            await $w("#gallery23").collapse()
        } else {
            await $w("#text71").expand()
            await $w("#gallery23").expand()
        }

        //based on a real story
        if ($w("#dataset42").getTotalCount() <= 3) {
            await $w("#text102").collapse()
            await $w("#gallery22").collapse()
        } else {
            await $w("#text102").expand()
            await $w("#gallery22").expand()
        }

        //based on your list
        if ($w("#dataset32").getTotalCount() <= 3) {
            await $w("#text70").collapse()
            await $w("#gallery18").collapse()
        } else {
            await $w("#text70").expand()
            await $w("#gallery18").expand()
        }

        var suspensefulKeywords = ["heist", "serial killer", "thriller", "spy thriller", "spy", "nuclear missile", "conspiracy of murder", "framed for a crime", "framed for murder", "dystopia", "investigation", "mysterious", "mystery"]

        if (type !== undefined) {
            if (type === false) {
                $w("#text71").text = "Spannende Filme"
                if (data !== undefined) {
                    await $w("#dataset40").setFilter(wixData.filter().hasSome("keywords", suspensefulKeywords).ne("serie", true).contains("genre", data))
                } else {
                    await $w("#dataset40").setFilter(wixData.filter().hasSome("keywords", suspensefulKeywords).ne("serie", true))
                }
            } else {
                $w("#text71").text = "Spannende Serien"
                if (data !== undefined) {
                    await $w("#dataset40").setFilter(wixData.filter().hasSome("keywords", suspensefulKeywords).eq("serie", true).contains("genre", data))
                } else {
                    await $w("#dataset40").setFilter(wixData.filter().hasSome("keywords", suspensefulKeywords).eq("serie", true))
                }
            }
        } else {
            $w("#text71").text = "Spannende Filme & Serien"
            await $w("#dataset40").setFilter(wixData.filter().hasSome("keywords", suspensefulKeywords))
        }
    })
}

//Handlers
async function taskHandler() {
    $w("#inWishlist").hide()
    $w("#notInWishlist").hide()
    if (wixWindow.formFactor === "Mobile") {
        //Mobile
        $w("#image52").hide("float", { "duration": 300, "direction": "top" });
        $w("#text104").hide("float", { "duration": 300, "direction": "top" });
        await $w("#text66").hide("float", { "duration": 300, "direction": "top" });
        await Featured(fusionReturn)
        $w("#text104").show("float", { "duration": 300, "direction": "bottom" });
        $w("#text66").show("float", { "duration": 300, "direction": "bottom" });
        await $w("#image52").show("float", { "duration": 300, "direction": "bottom" });

    } else {
        //Desktop
        $w("#text104").hide("float", { "duration": 300, "direction": "top" });
        $w("#text66").hide("float", { "duration": 300, "direction": "top" });
        $w("#text64").hide("float", { "duration": 300, "direction": "top" });
        await $w("#columnStrip1").hide("float", { "duration": 300, "direction": "top" });
        await Featured(fusionReturn)
        $w("#text66").show("float", { "duration": 300, "direction": "bottom" });
        $w("#text64").show("float", { "duration": 300, "direction": "bottom" });
        $w("#text104").show("float", { "duration": 300, "direction": "bottom" });
        $w("#columnStrip1").show("float", { "duration": 300, "direction": "bottom" });
    }
    lazyLoad()

    if (type !== undefined) {
        if (type === false) {
            if (data !== undefined) {
                $w("#text58").text = "Neu in " + data
                await $w("#dataset27").setFilter(wixData.filter().ne("serie", true).contains("genre", data))
                await $w("#dataset31").setFilter(wixData.filter().eq("_owner", user.id).ne("serie", true).contains("genre", data))
            } else {
                $w("#text58").text = "Neue Filme"
                await $w("#dataset27").setFilter(wixData.filter().ne("serie", true))
                await $w("#dataset31").setFilter(wixData.filter().eq("_owner", user.id).ne("serie", true))
            }
        } else {
            if (data !== undefined) {
                $w("#text58").text = "Neu in " + data
                await $w("#dataset27").setFilter(wixData.filter().eq("serie", true).contains("genre", data))
                await $w("#dataset31").setFilter(wixData.filter().eq("_owner", user.id).eq("serie", true).contains("genre", data))
            } else {
                $w("#text58").text = "Neue Serien"
                await $w("#dataset27").setFilter(wixData.filter().eq("serie", true))
                await $w("#dataset31").setFilter(wixData.filter().eq("_owner", user.id).eq("serie", true))
            }
        }

        await $w("#text72").collapse()
        await $w("#gallery24").collapse()

    } else {
        $w("#text58").text = "Neuerscheinungen"
        await $w("#dataset27").setFilter(wixData.filter())
        await $w("#dataset31").setFilter(wixData.filter().eq("_owner", user.id))
        await $w("#gallery24").expand()
        await $w("#text72").expand()
    }

    // collapse top picks
    $w("#dataset21").onReady(async function () {
        if ($w("#dataset21").getTotalCount() <= 3) {
            await $w("#text47").collapse()
            await $w("#gallery16").collapse()
        } else {
            await $w("#text47").expand()
            await $w("#gallery16").expand()
        }

    })

    // collapse my list
    if ($w("#dataset31").getTotalCount() <= 3) {
        await $w("#text67").collapse()
        await $w("#gallery17").collapse()
    } else {
        await $w("#text67").expand()
        await $w("#gallery17").expand()
    }
}

//Listeners
export async function movies(event) {
    if (type === undefined) {
        //Coming from main home going to movies
        type = false
        taskHandler()
        await $w("#series").hide("fade", { "duration": 100 })
        $w("#series").text = "Alle Genres ▾"
        await $w("#series").show("float", { "duration": 300, "direction": "left" })
    } else if (type === true) {
        //Coming from Series going home
        type = undefined
        data = undefined
        taskHandler()
        $w("#series").hide("float", { "duration": 100, "direction": "left" })
        await $w("#movies").hide("fade", { "duration": 100 })
        $w("#movies").text = "Filme"
        $w("#series").text = "Serien"
        await $w("#movies").show("fade", { "duration": 100 })
        await $w("#series").show("float", { "duration": 100, "direction": "left" })
    } else if (type === false) {
        //Coming from Movies going home
        type = undefined
        data = undefined
        taskHandler()
        await $w("#series").hide("float", { "duration": 100, "direction": "left" })
        $w("#series").text = "Serien"
        await $w("#series").show("float", { "duration": 100, "direction": "left" })
    }
}

export async function series(event) {
    if (type !== undefined) {
        $w("#series").hide("fade", { "duration": 100 })
        data = undefined
        data = await wixWindow.openLightbox("Genres")
        if (data !== null && data !== undefined) {
            $w("#series").text = data + " ▾"
            taskHandler()
        }
        await $w("#series").show("float", { "duration": 300, "direction": "left" })
    } else {
        type = true
        data = undefined
        taskHandler()
        $w("#movies").hide("fade", { "duration": 100 })
        await $w("#series").hide("float", { "duration": 100, "direction": "left" })
        $w("#movies").text = "Serien"
        $w("#series").text = "Alle Genres ▾"
        await $w("#movies").show("float", { "duration": 300, "direction": "right" })
        $w("#series").show("fade", { "duration": 100 })
    }
}

export function inWishlist(event, $w) {
    removeFromWishlist()
}

export function notInWishlist(event, $w) {
    addToWishlist()
}

async function addToWishlist() {
    movieId = featureItem
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
    $w('#inWishlist').show();
    await wixData.insert("myList", wishListItem);
}

async function removeFromWishlist() {
    movieId = featureItem
    let wishListResult = await wixData.query("myList")
        .eq("movieId", movieId._id)
        .eq("_owner", user.id)
        .find();

    if (wishListResult.length > 0) {
        $w('#notInWishlist').show();
        $w('#inWishlist').hide();
        await wixData.remove("myList", wishListResult.items[0]._id)
    }
}

export function playFullscreen(event) {
    playiFrame(featureItem)
}

export function continueWatching(event) {
    let $item = $w.at(event.context);
    let currentItem = $item("#dataset28").getCurrentItem().movieId
    playiFrame(currentItem)
}

//-----------------playFullscreen------------------------------------------------------
export function playiFrame(data) {
    let url = data.link
    if (data.link.substring(0, 39) === "https://drive.google.com/drive/folders/") {
        wixLocation.to(data.link)
    } else if (data.link.substring(0, 32) === "https://drive.google.com/file/d/") {
        wixWindow.openLightbox("PlayFullscreen", {
            "id": url.substring(32, 65),
            "title": data.title
        })
        $w("#dataset28").refresh()
    } else if (data.link.substring(0, 33) === "https://drive.google.com/open?id=") {
        if (data.serie === true) {
            wixLocation.to(data.link)
        } else {
            wixWindow.openLightbox("PlayFullscreen", {
                "id": url.substring(33, 66),
                "title": data.title
            })
        }
        $w("#dataset28").refresh()
    } else if (data.link.substring(0, 41) === "https://drive.google.com/a/kzo.ch/file/d/") {
        wixWindow.openLightbox("PlayFullscreen", {
            "id": url.substring(41, 74),
            "title": data.title
        })
        $w("#dataset28").refresh()
    } else if (data.serie === true) {
        wixLocation.to(data.link)
    }
}



/*                                              








 ******  **                   **  
 ******  **   *****   ** **  *****
 **      **  *******   ***    **  
 **      **   *****  *** **    *** valentinfrlch

 You know, for movies.
*/
