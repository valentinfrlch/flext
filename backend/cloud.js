import wixData from 'wix-data';
import { fetch } from 'wix-fetch';

export async function UserData(userId) {
    var positiveKeywords = []
    var data = await wixData.query("MemberPredictions").eq("_owner", userId).limit(200).find()
    for (var i = 0; i < data.items.length; i++) {
        positiveKeywords.push(data.items[i].movie.keywords) //must include property movie
    }
}

export async function dataQuery(type, data, product) {
    var feature;
    if (type === null) {
        type = undefined
    }
    if (data === null) {
        data = undefined
    }
    if (product === null) {
        product = undefined
    }
    console.log(type, data, product)
    if (type !== undefined) {
        if (type === false) {
            if (data !== undefined) {
                feature = await wixData.query("netflyxData").ne("serie", true).isNotEmpty("poster").hasSome("title", product).contains("genre", data).find()
            } else {
                feature = await wixData.query("netflyxData").ne("serie", true).isNotEmpty("poster").hasSome("title", product).find()
            }
            if (feature[0] === undefined) {
                feature = await wixData.query("netflyxData").ne("serie", true).isNotEmpty("poster").find()
            }
        } else {
            if (data !== undefined) {
                feature = await wixData.query("netflyxData").eq("serie", true).isNotEmpty("poster").hasSome("title", product).contains("genre", data).find()
            } else {
                feature = await wixData.query("netflyxData").eq("serie", true).isNotEmpty("poster").hasSome("title", product).find()
            }
            if (feature[0] === undefined) {
                feature = await wixData.query("netflyxData").eq("serie", true).isNotEmpty("poster").find()
            }
        }
    } else {
        if (product === undefined) {
            console.log(product)
            feature = await wixData.query("netflyxData").isNotEmpty("poster").find()
        } else {
            feature = await wixData.query("netflyxData").isNotEmpty("poster").hasSome("title", product).find()
        }
    }
    return feature
}

export function pull(title, type, url) {
    let base = "https://image.tmdb.org/t/p/"
    let size = "w300"
    let sizePoster = "original"
    let filePath;
    let image;
    let item = {}
    wixData.query("netflyxData").eq("title", title).find().then((res) => {
        if (res.items.length === 0) {
            console.log(res.items)
            fetch("https://api.themoviedb.org/3/search/" + type + "?api_key=APIKEY&language=de-DE&query=" + title)
                .then(x => x.json())
                .then(y => {
                    console.log(y)
                    if (y.results[0] === undefined) {
                        console.log("Not found. Skipping...")
                        return false
                    } else {
                        let id = y.results[0].id
                        fetch("https://api.themoviedb.org/3/" + type + "/" + id + "?api_key=APIKEY&language=de-DE&append_to_response=videos,keywords,images,credits,logos")
                            .then(q => q.json())
                            .then(e => {
                                console.log(e)
                                try {
                                    filePath = e.backdrop_path
                                } catch (err) {}
                                console.log(item)
                                item.poster = base + sizePoster + filePath
                                item.cover = base + size + e.poster_path
                                item.likeCount = e.vote_average
                                item.description = e.overview
                                if (type === "movie") {
                                    item.title = e.title
                                    item.release = parseInt(e.release_date.substring(0, 4), 10)
                                    try {
                                        item.collection = e.belongs_to_collection.name
                                    } catch (err) {}
                                } else {
                                    item.title = e.name
                                    item.seasons = e.number_of_seasons + " Seasons"
                                    item.release = parseInt(e.first_air_date.substring(0, 4), 10)
                                }
                                try {
                                    item.genre = e.genres[0].name
                                } catch (err) {}
                                try {
                                    item.tags = e.genres[1].name
                                } catch (err) {}
                                try {
                                    item.tags02 = e.genres[2].name
                                } catch (err) {}
                                try {
                                    item.tags03 = e.genres[3].name
                                } catch (err) {}
                                if (e.runtime > 0) {
                                    item.runtime = e.runtime
                                }
                                if (e.adult === true) {
                                    item.fsk = 18
                                }
                                try {
                                    if (e.videos.results[0].type === "Trailer") {
                                        item.trailer = "https://www.youtube.com/watch?v=" + e.videos.results[0].key
                                    }
                                } catch (err) {}

                                if (type === "movie") {
                                    try {
                                        let keywordsArray = e.keywords.keywords.map(({ name }) => name)
                                        item.keywords = keywordsArray
                                        console.log(keywordsArray)
                                    } catch (err) {}
                                } else {
                                    try {
                                        let keywordsArray = e.keywords.results.map(({ name }) => name)
                                        item.keywords = keywordsArray
                                        item.serie = true
                                        console.log(keywordsArray)
                                    } catch (err) {}
                                }
                                let castArray = e.credits.cast.map(({ name }) => name)
                                item.cast = castArray
                                item.link = url
                                console.log(item)

                                wixData.insert("netflyxData", item).then((done) => {
                                    console.log(done)
                                    return done
                                }).catch((err) => {
                                    console.log(err)
                                });
                            })
                    }
                })
        } else {
            console.log("item already exists")
            return false
        }
    })
}

export function test() {
    wixData.insert("netflyxData", { "title": "hello" })
}
