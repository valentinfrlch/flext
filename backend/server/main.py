# main.py on backend upload server node01

# import beautifulsoup4
from turtle import ScrolledCanvas
from bs4 import BeautifulSoup
import requests
import time

# search for movie on website


def search_movie(movie_name):
    # search for movie on website
    baseurl = "https://hdtoday.cc"
    # encode movie for url
    movie_name = movie_name.replace(" ", "+")
    print(movie_name)
    url = baseurl + "/search/" + movie_name
    # get the first element on page
    soup = BeautifulSoup(requests.get(url).text, "html.parser")
    # get links for movie poster, get href
    link_frag = soup.find_all(
        "a", class_="film-poster-ahref flw-item-tip")[0].get("href")
    link = baseurl + link_frag.replace("/movie/", "/watch-movie/")
    print(link)
    # get movie stream url
    soup = BeautifulSoup(requests.get(link).text, "html.parser")
    time.sleep(3)
    # find iframe on page and get src
    src = soup.find_all("iframe")
    print(src)


search_movie("Uncharted")
