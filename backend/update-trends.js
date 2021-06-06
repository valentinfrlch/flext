//scheduled tasks

import wixData from 'wix-data';
import { fetch } from 'wix-fetch';
import { getSecret } from 'wix-secrets-backend';

export async function updateTrends() {
    const tmdbAPI = await getSecret("tmdb_apikey");
    var titles = []
    var queryTitles = []
    var x = await fetch("https://api.themoviedb.org/3/trending/all/week?api_key=" + tmdbAPI + "&language=de-DE")
    var y = await x.json()

    console.log("before", y)
    var results = y.results.sort(sortByProperty("popularity"))
    console.log("after", results)

    for (var i = 0; i < y.results.length; i++) {
        if (y.results[i].title !== undefined) {
            titles.push(y.results[i].title)
        } else {
            titles.push(y.results[i].name)
        }
    }
    console.log(titles)
    var query = await wixData.query("netflyxData").descending("likeCount").hasSome("title", titles).find() //.descending("_updatedDate")
    var top = await wixData.query("Top").ascending("rank").find() //Defines the item to update
    console.log(top.items)

    for (var j = 0; j < query.items.length; j++) {
        queryTitles.push(query.items[j].title)
        if (j < 10) {
            if (query.items[j].title) {
                let item = top.items[j]
                item.item = query.items[j]._id

                wixData.update("Top", item)
            }
        }
    }

    titles = titles.filter((el) => !queryTitles.includes(el));

    var existingQuery = await wixData.query("DUS").find() //already existing item
    var existing = existingQuery.items[0].request //already existing titles as array
    var unfiltered = existing.concat(titles) // Merged exisiting titles with new requests
    var newRequest = [...new Set([...unfiltered, ...existing])] //filtering the duplicates out
    console.log("data to insert: ", newRequest)
    var update = existingQuery.items[0] //setting the to be updated item
    update.request = newRequest //updating the requests
    await wixData.update("DUS", update) //requesing the update
}

// Sort by popularity
function sortByProperty(property) {
    return function (a, b) {
        if (a[property] > b[property])
            return 1;
        else if (a[property] < b[property])
            return -1;

        return 0;
    }
}

export async function downloadCollections() {
    const tmdbAPI = await getSecret("tmdb_apikey");
    var collections = []
    var collectionTitles = await wixData.query("netflyxData").isNotEmpty("collection").limit(400).find()
    for (var i = 0; i < collectionTitles.items.length; i++) {
        if (collections.includes(collectionTitles.items[i].collection) === false) {
            collections.push(collectionTitles.items[i].collection)
        }
    }
    for (var h = 0; h < collections.length; h++) {
        var q = await wixData.query("netflyxData").eq("collection", collections[h]).find() //title
        fetch("https://api.themoviedb.org/3/search/movie?api_key=" + tmdbAPI + "&language=de-DE&query=" + q.items[0].title).then(x => x.json()) //item in TMDB
            .then(y => {
                fetch("https://api.themoviedb.org/3/movie/" + y.results[0].id + "?api_key=" + tmdbAPI + "&language=de-DE").then(f => f.json())
                    .then(z => {
                        fetch("https://api.themoviedb.org/3/collection/" + z.belongs_to_collection.id + "?api_key=" + tmdbAPI + "&language=de-DE").then(f => f.json())
                            .then(u => {
                                let item = {
                                    "title": u.name,
                                    "cover": "https://image.tmdb.org/t/p/original" + u.poster_path,
                                    "bigPicture": "https://image.tmdb.org/t/p/original" + u.backdrop_path,
                                    "image": "https://image.tmdb.org/t/p/w400" + u.backdrop_path
                                }
                                console.log(item.title)
                                wixData.query("Collections").contains("title", u.name).find().then((c) => {
                                    if (c.items.length === 0) {
                                        console.log("inserted")
                                        wixData.insert("Collections", item)
                                    } else {
                                        console.log("rejected")
                                    }
                                })
                            })
                    })
            })
    }
}

export async function DynamicUploadSystem() {
    const tmdbAPI = await getSecret("tmdb_apikey");
    var liked = []
    var list = []
    var download = []
    var played = []
    var trending = []

    var likedQuery = await wixData.query("MemberPredictions").include("movie").find() //.ge("_updatedDate", filterDate)
    var listQuery = await wixData.query("myList").include("movieId").find()
    var downloadQuery = await wixData.query("Downloads").include("newField").find()
    var playedQuery = await wixData.query("UserPlayed").include("movieId").find()

    //also take trending data into consideration:
    var trendingRaw = await fetch("https://api.themoviedb.org/3/trending/all/week?api_key=" + tmdbAPI + "&language=de-DE")
    var trendingJson = await trendingRaw.json()

    for (var i = 0; i < trendingJson.results.length; i++) {
        if (trendingJson.results[i].title !== undefined) {
            if (trendingJson.results[i].title.includes("'") === false) {
                trending.push(trendingJson.results[i].title)
            }
        } else {
            if (trendingJson.results[i].name.includes("'") === false) {
                trending.push(trendingJson.results[i].name)
            }
        }
    }

    for (var i = 0; i < likedQuery.items.length; i++) {
        if (likedQuery.items[i].movie.title !== undefined) {
            if (likedQuery.items[i].movie.title.includes("'") === false) {
                liked.push(likedQuery.items[i].movie.title)
            }
        }
    }
    for (var j = 0; j < listQuery.items.length; j++) {
        if (listQuery.items[j].movieId.title !== undefined) {
            if (listQuery.items[j].movieId.title.includes("'") === false) {
                list.push(listQuery.items[j].movieId.title)
            }
        }
    }
    for (var t = 0; t < downloadQuery.items.length; t++) {
        if (downloadQuery.items[t].newField.title !== undefined) {
            if (downloadQuery.items[t].newField.title.includes("'") === false) {
                download.push(downloadQuery.items[t].newField.title)
            }
        }
    }
    for (var o = 0; o < playedQuery.items.length; o++) {
        if (playedQuery.items[o].movieId.title !== undefined) {
            if (playedQuery.items[o].movieId.title.includes("'") === false) {
                played.push(playedQuery.items[o].movieId.title)
            }
        }
    }

    //weights distribute 1000 (at most) slots (Limit is no longer required)

    if (liked.length > 400) { //40%
        liked.length = 400
    }
    if (list.length > 250) { //25%
        list.length = 250
    }
    if (download.length > 250) { //25%
        download.length = 250
    }
    if (played.length > 100) { //10%
        played.length = 100
    }

    var query = [...new Set([...list, ...download, ...played, ...liked])]
    console.log("Data given: ", query)

    //Find similar titles

    var output = trending
    let movieId;
    let tvId;

    var movieCount = 0
    var tvCount = 0

    var request = []

    const pro = query.map(async elem => {
        var x = await fetch("https://api.themoviedb.org/3/search/movie?api_key=" + tmdbAPI + "&language=de-DE&query=" + encodeURI(elem))
        var y = await x.json()

        var w = await fetch("https://api.themoviedb.org/3/search/tv?api_key=" + tmdbAPI + "&language=de-DE&query=" + encodeURI(elem))
        var q = await w.json()

        try {
            movieId = y.results[0].id
            tvId = q.results[0].id
        } catch (err) {}
        var f = await fetch("https://api.themoviedb.org/3/movie/" + movieId + "/recommendations?api_key=" + tmdbAPI + "&language=de-DE&page=1")
        var movieResults = await f.json()

        var e = await fetch("https://api.themoviedb.org/3/tv/" + tvId + "/recommendations?api_key=" + tmdbAPI + "&language=de-DE&page=1")
        var tvResults = await e.json()

        try {
            for (var p = 0; p < movieResults.results.length; p++) {
                if ((parseFloat(movieResults.results[p].popularity) >= 100) && (parseInt(movieResults.results[p].release_date.substring(0, 4), 10) > 2000)) { //filters out unpopular and old content (threshold for popularity is 100, content released before the year 2000 is not considered)
                    output.push(movieResults.results[p].title)
                    movieCount += 1
                }
            }
            for (var b = 0; b < tvResults.results.length; b++) {
                if ((parseFloat(tvResults.results[b].popularity) >= 100) && (parseInt(tvResults.results[b].first_air_date.substring(0, 4), 10) > 2000)) { //filters out unpopular and old content (threshold for popularity is 100, content released before the year 2000 is not considered)
                    output.push(tvResults.results[b].name)
                    tvCount += 1
                }
            }
        } catch (err) { console.log(err) }
    })
    await Promise.all(pro)
    output = [...new Set([...output])]
    console.log("data calculated: ", output)

    //insert the items into the database

    const promises = output.map(async element => {
        var validity = await wixData.query("netflyxData").contains("title", element).find() // check if title is already in netflyxData => if yes there is no need to file a request, use "cotains" for more accurate results.
        if (validity.items.length === 0) { //if item is not yet recorded
            request.push(element)
        }
    })
    await Promise.all(promises)
    var existingQuery = await wixData.query("DUS").find() //already existing request
    var existing = existingQuery.items[0].request //already existing titles as array

    var frequent = existingQuery.items[0].frequency
    var ignore = existingQuery.items[0].ignore

    var unfiltered = existing.concat(request) // Merged exisiting titles with new requests
    var newRequest = [...new Set([...unfiltered, ...existing])] //filtering the duplicates out

    newRequest = newRequest.filter(newRequest => !ignore.includes(newRequest));

    console.log("requesting upload: ", newRequest)
    var update = existingQuery.items[0] //setting the to be updated item
    console.log(update)
    update.request = newRequest //updating the requests
    await wixData.update("DUS", update)
}
