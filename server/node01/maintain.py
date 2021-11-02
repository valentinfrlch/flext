import os
from progress.bar import Bar

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

movies()
tv()
