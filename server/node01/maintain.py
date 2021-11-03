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
    if mode == "movie":
        i = 2
    else:
        i = 1
    for files in os.walk(path):
        for file in files[i]:
            title = file.replace(".mp4", "")
            query = requests.get("https://api.themoviedb.org/3/search/" + mode + "?api_key=" + TMDB_KEY + "&language=de-DE&query=" + title.replace(".mp4", ""))
            query = query.json()
            match = ""
            try:
                match = query["results"][0]["title"]
            except:
                try:
                    match = query["results"][0]["name"]
                except:
                    print("[404] no match found")
            
            #check if NOT 100% match:
            if match != title:
                print("No match found for " + title)
                ans = input("rename " + title + " -> " + match + "? ")
                if mode == "movie":
                    match = match + ".mp4"
                oldPath = os.path.join(path, title)
                newPath = os.path.join(path, match)
                if ans == "y":
                    os.rename(oldPath, newPath)
                elif ans == "m":
                    ren = input("provide a new name: ")
                    if mode == "movie":
                        ren = ren + ".mp4"
                    os.rename(oldPath, os.path.join(path, ren))
                else:
                    print("not changing")
            else:
                print(title + " is a match.")


maintain("tv")
