# main.py on backend upload server node01

# import beautifulsoup4
from bs4 import BeautifulSoup
from selenium import webdriver
import requests
import time

# search for movie on website


def search_movie(movie_name):
    # search for movie on website
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'}
    baseurl = "https://hdtoday.cc"
    # encode movie for url
    movie_name = movie_name.replace(" ", "+")
    print(movie_name)
    url = baseurl + "/search/" + movie_name
    # get the first element on page
    soup = BeautifulSoup(requests.get(
        url, headers=headers).text, "html.parser")
    # get links for movie poster, get href
    link_frag = soup.find_all(
        "a", class_="film-poster-ahref flw-item-tip")[0].get("href")
    link = baseurl + link_frag.replace("/movie/", "/watch-movie/")

    # headless browser
    options = webdriver.ChromeOptions()
    options.add_argument('headless')
    dr = webdriver.Chrome(options=options)
    s = requests.Session()
    r = s.get(link, headers=headers)
    soup = BeautifulSoup(r.content, "html.parser")
    # find all iframes with id "iframe-embed"
    iframes = soup.find_all("iframe", id="iframe-embed")
    # get the first iframe src
    iframe_src = iframes[0].get("src")
    print(iframe_src)



search_movie("Uncharted")
