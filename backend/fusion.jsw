import { fetch } from 'wix-fetch';
import wixData from 'wix-data';

export async function fusion(titles) {
    var moviesOutput = []
    let movieId;
    let tvId;
    const pro = titles.map(async element => {
        var x = await fetch("https://api.themoviedb.org/3/search/movie?api_key=b47d0bbacc0cfd37962b6bb28118f099&language=de-DE&query=" + encodeURIComponent(element))
        var y = await x.json()

        var w = await fetch("https://api.themoviedb.org/3/search/tv?api_key=b47d0bbacc0cfd37962b6bb28118f099&language=de-DE&query=" + encodeURIComponent(element))
        var q = await w.json()

        try {
            movieId = y.results[0].id
            tvId = q.results[0].id
        } catch (err) {console.log(err)}
        var f = await fetch("https://api.themoviedb.org/3/movie/" + movieId + "/recommendations?api_key=b47d0bbacc0cfd37962b6bb28118f099&language=de-DE&page=1")
        var movieResults = await f.json()

        var e = await fetch("https://api.themoviedb.org/3/tv/" + tvId + "/recommendations?api_key=b47d0bbacc0cfd37962b6bb28118f099&language=de-DE&page=1")
        var tvResults = await e.json()

        try {
            for (var o = 0; o < movieResults.results.length; o++) {
                moviesOutput.push(movieResults.results[o].title)
            }
        } catch (err) { console.log(err) }
        try {
            for (var t = 0; t < tvResults.results.length; t++) {
                moviesOutput.push(tvResults.results[t].name)
            }
        } catch (err) { console.log(err) }
    })
    await Promise.all(pro)
    return moviesOutput
}
