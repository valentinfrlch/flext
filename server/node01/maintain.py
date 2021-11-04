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

def maintain(mode=["movie", "tv"]):
    jobs = []
    if "movie" in mode:
        jobs.append(moviePath)
    if "tv" in mode:
        jobs.append(tvPath)
    
    for go in jobs:
        size = len([name for name in os.listdir(go) if os.path.isfile(os.path.join(go, name))])
        bar = Bar('scanning...', max=size)
        mode = ""
        for files in os.walk(go):
            if go == moviePath:
                i = 2
                mode = "movie"
            else:
                i = 1
                mode = "tv"
            for file in files[i]:
                if "Staffel" in file or "staffel" in file or "Season" in file or "season" in file:
                    break
                title = file.replace(".mp4", "")
                query = requests.get("https://api.themoviedb.org/3/search/" + mode + "?api_key=" + TMDB_KEY + "&language=de-DE&query=" + title.replace(".mp4", ""))
                query = query.json()
                matches = []
                try:
                    for match in query["results"]:
                        matches.append(match["title"])
                except:
                    try:
                        for match in query["results"]:
                            matches.append(match["name"])
                    except:
                        print("[404] no match found")
                
                #check if NOT 100% match:
                if title not in matches:
                    try:
                        match = matches[0]
                    except:
                        print(title, "cannot be matched")
                        break
                    print("No match found for " + title)
                    ans = input("rename " + title + " -> " + match + "? ")
                    if mode == "movie":
                        match = match + ".mp4"
                    oldPath = os.path.join(go, title)
                    newPath = os.path.join(go, match)
                    if ans == "y":
                        os.rename(oldPath, newPath)
                    elif ans == "m":
                        ren = input("provide a new name: ")
                        if mode == "movie":
                            ren = ren + ".mp4"
                        os.rename(oldPath, os.path.join(go, ren))
                    else:
                        print("not changing")
                matches = []
                bar.next()
        bar.finish()


maintain()
