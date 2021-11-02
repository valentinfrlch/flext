import os
from progress.bar import Bar
import requests
import json

#secrets
TMDB_KEY = "b47d0bbacc0cfd37962b6bb28118f099"

moviePath = "/media/pi/F01/Flext/movies/"
tvPath = "/media/pi/F01/Flext/tv/"

def movies():
    size = len([name for name in os.listdir(moviePath) if os.path.isfile(os.path.join(moviePath, name))])
    bar = Bar('cleaning up...', max=size)
    for movies in os.walk(moviePath):
        for file in movies[2]:
            if ((file[len(file)-4:len(file)]) != ".mp4"):
                old_file = os.path.join(moviePath, file)
                new_file = os.path.join(moviePath, file + ".mp4")
                os.rename(old_file, new_file)
                print(file + " -> " + file + ".mp4")
                bar.next()
    bar.finish()

def tv():
    size = len([name for name in os.listdir(tvPath) if os.path.isfile(os.path.join(tvPath, name))])
    bar = Bar('cleaning up...', max=size)

    for folders in os.walk(tvPath):
        for season in os.walk(folders[0]):
            for files in os.walk(season[0]):
                for file in files[2]:
                    if ((file[len(file)-4:len(file)]) != ".mp4"):
                        old_file = os.path.join(files[0], file)
                        new_file = os.path.join(files[0], file + ".mp4")
                        os.rename(old_file, new_file)
                        print("    " + file + " -> " + file + ".mp4")
                        bar.next()
    bar.finish()

def maintain(mode):
    path = ""
    if mode == "movie":
        path = moviePath
    else:
        path = tvPath
    for files in os.walk(path):
        movieQuery = requests.get("https://api.themoviedb.org/3/search/movie?api_key=" + TMDB_KEY + "&language=de-DE&query=" + file[0].replace(".mp4", ""))
        tvQuery= requests.get("https://api.themoviedb.org/3/search/tv?api_key=" + TMDB_KEY + "&language=de-DE&query=" + file[0].replace(".mp4", ""))

        movieQuery = movieQuery.json()
        tvQuery = tvQuery.json()
        match = ""
        try:
            if mode == "movie":
                match = movieQuery["results"][0]["title"]
            else:
                match = tvQuery["results"][0]["title"]
        except:
            print("[404] no match found")
        
        #check if NOT 100% match:
        if match != title:
            print("No match found: ")
            print(title, match)
            ans = input("rename " + title + " -> " + match + "?")
            if ans == "y":
                os.rename("<oldPath>, <newPath>")
            else:
                print("not changing")
        else:
            print(title + " is a match.")


movies()
tv()
