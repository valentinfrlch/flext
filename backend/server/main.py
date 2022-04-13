# main.py on backend upload server node01

# import beautifulsoup4
from bs4 import BeautifulSoup
from selenium import webdriver
import requests
import time
import urllib

# search for movie on website


def search_movie(movie_name):
    # search for movie on website
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'}
    baseurl = "https://hdtoday.cc"
    # encode movie for url
    movie_name = urllib.parse.quote(movie_name)
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
    dr = webdriver.Chrome()
    dr.get(link)
    # wait for page to load
    time.sleep(10)
    # click close button on popup
    # find the button
    close_button = dr.find_element_by_class_name("close")
    
    # click the button
    close_button.click()
    soup = BeautifulSoup(dr.page_source, "html.parser")
    # select iframe and get src
    src = soup.find_all("iframe")[0].get("src")
    dr.quit()
    return src, movie_name


def download_handler(url, name):
    #add the link to a file in the folder "folderwatch"
    #open a new file in folderwatch
    with open("/home/pi/folderwatch/" + name + ".crawljob", "w") as f:
        f.write("\ntext=" + url + "\n" + "filename=" +
                name.replace("&20", " ") + ".mp4" + "\n" + "packageName=" + movie_name.replace("&20", " ") +
                "\ndeepAnalyseEnabled=true")
        # close file
        f.close()


src, movie_name = search_movie("Bigbug")
print(src, movie_name)
download_handler(src, movie_name)