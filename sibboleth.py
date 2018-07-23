from selenium import webdriver
from selenium.webdriver.support.ui import Select # for <SELECT> HTML form
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

DEBUG_FLAG=0

#driver = webdriver.Chrome('chromedriver')

options = webdriver.ChromeOptions()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument("--user-data-dir=/Users/knoh1/Library/Application Support/Google/Chrome")
#w = webdriver.Chrome(executable_path="C:\\Users\\chromedriver.exe",options=options)
driver = webdriver.Chrome(options=options)

# Service selection
# Here I had to select my school among others 
driver.get("https://cab.brown.edu/")

# #saving the main window handle to switch back to later
main_window_handle = None
while not main_window_handle:
    main_window_handle = driver.current_window_handle

#clicking the signin button
flag=0
try:
    driver.find_element_by_id('sign-in').click()
except:
    flag=1

print(flag)

if flag==0:
    print("Switching to signin pop-up window.")
    signin_window_handle = None
    while not signin_window_handle:
        for handle in driver.window_handles:
            if handle != main_window_handle:
                signin_window_handle = handle
                break
    driver.switch_to.window(signin_window_handle)

    # #Siboleth login popup

    try:
        print("Sending keys...")
        driver.find_element_by_id('username').send_keys("knoh1")
        driver.find_element_by_id('password').send_keys("Kyunghyun12!")
        driver.find_element_by_name('_eventId_proceed').click()
        while(True):
            try:
                driver.switch_to.window(signin_window_handle)
            except:
                break
                
    except:
        print("Error logging into Sibboleth form.")
        driver.quit()

    try:
        print("Logged in, switching back to main window.")
        driver.switch_to.window(main_window_handle)
    except:
        print("Error switching back to main window...")
        driver.quit()

mycart_button=driver.find_elements_by_css_selector('[data-action="my-primary-cart"]')[0]
if DEBUG_FLAG==1:
    print(mycart_button.get_attribute("class"))
    print(mycart_button.get_attribute("data-action"))
    print(mycart_button.get_attribute("data-need-apr"))
    print(mycart_button.get_attribute("type"))

try:
    mycart_button.click()
    #mycart_button.sendKeys(Keys.RETURN)
    #mycart_button.sendKeys(Keys.ENTER)
    print("My primary cart button successfully clicked.")
    time.sleep(3.0)
except:
    print("'MY PRIMARY CART' unable to be clicked...")
    driver.quit()

print(driver.find_elements_by_css_selector('[data-action="register"]'))

# try:
#     element = WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.CLASS_NAME, "panel-body"))
#     )
#     print("found!")
# finally:
#     driver.quit()

# if driver.find_elements_by_css_selector('.panel-active [data-kind="results"]'):
#     print("Element exists")

courses = []
for course in driver.find_elements_by_css_selector('.course-group'):
    try:
        print("hello")
        course_info = course.find_element_by_xpath('.//div[@class="course-code"]/a').text
        print(course_info)
        courses.append(course_info)
    except:
        driver.quit()
#print(courses)

driver.quit()

# driver.find_element_by_id('formMenu:linknotes1').click()
# driver.find_element_by_id('_id137Pluto_108_u1240l1n228_50520_:tabledip:0:_id158Pluto_108_u1240l1n228_50520_').click()

# # Now connected to the home page
# # Click on 3 links in order to reach the page I want to scrape
# driver.find_element_by_id('tabLink_u1240l1s214').click()
# driver.find_element_by_id('formMenu:linknotes1').click()
# driver.find_element_by_id('_id137Pluto_108_u1240l1n228_50520_:tabledip:0:_id158Pluto_108_u1240l1n228_50520_').click()

# # Select and print an interesting element by its ID
# page = driver.find_element_by_id('_id111Pluto_108_u1240l1n228_50520_:tableel:tbody_element')
# print(page.text)