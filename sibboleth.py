from selenium import webdriver
from selenium.webdriver.support.ui import Select # for <SELECT> HTML form
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

DEBUG_FLAG=0
VERBOSE_FLAG=True

class SibbolethLogger():
    def __init__(self, username, password):
        self.options=None
        self.driver=None
        self.flag=0
        self.username=username
        self.password=password

    def setup_selenium(self):
        self.options = webdriver.ChromeOptions()
        # run headless to prevent the user from seeing automation
        self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument("--user-data-dir=/Users/knoh1/Library/Application Support/Google/Chrome")
        #w = webdriver.Chrome(executable_path="C:\\Users\\chromedriver.exe",options=options)
        self.driver = webdriver.Chrome(options=self.options)
        #driver = webdriver.Chrome('chromedriver')
        if VERBOSE_FLAG:
            print("Succesfully launched Selenium Chromedriver.")
            
    def get_classes(self):
        # Get the Courses@Brown website
        self.driver.get("https://cab.brown.edu/")
    
        # saving the main window handle to switch back to later
        main_window_handle = None
        while not main_window_handle:
            main_window_handle = self.driver.current_window_handle

        # clicking the signin button
        self.flag=0
        try:
            self.driver.find_element_by_id('sign-in').click()
        except:
            self.flag=1

        # a = driver.execute_script("return prompt('Enter smth','smth')")

        if self.flag==0:
            # Find the sign-in pop-up window to switch the driver window
            if VERBOSE_FLAG:
                print("Switching to sign-in pop-up window.")
            signin_window_handle = None
            while not signin_window_handle:
                for handle in self.driver.window_handles:
                    if handle != main_window_handle:
                        signin_window_handle = handle
                        break
            self.driver.switch_to.window(signin_window_handle)

            # Siboleth login popup
            try:
                # Attemping to login using the Sibboleth form
                self.driver.find_element_by_id('username').send_keys(self.username)
                self.driver.find_element_by_id('password').send_keys(self.password)
                self.driver.find_element_by_name('_eventId_proceed').click()
                while(True):
                    try:
                        self.driver.switch_to.window(signin_window_handle)
                    except:
                        break
                        
            except:
                print("ERROR: Failed to login via Sibboleth form.")
                self.driver.quit()

            if VERBOSE_FLAG:
                print("Successfully logged in via Sibboleth.")

            try:
                self.driver.switch_to.window(main_window_handle)
            except:
                print("ERROR: Unable to switch driver window back to Main (cab.brown.edu).")
                self.driver.quit()

        mycart_button=None
        if self.driver.find_elements_by_css_selector('[data-action="my-primary-cart"]'):
            mycart_button=self.driver.find_elements_by_css_selector('[data-action="my-primary-cart"]')[0]
        else:
            print("ERROR: Unable to find 'MY PRIMARY CART' button.")
            self.driver.quit()

        if DEBUG_FLAG==1:
            print(mycart_button.get_attribute("class"))
            print(mycart_button.get_attribute("data-action"))
            print(mycart_button.get_attribute("data-need-apr"))
            print(mycart_button.get_attribute("type"))

        try:
            mycart_button.click()
        except:
            print("ERROR: 'MY PRIMARY CART' button click failed.")
            self.driver.quit()

        try:
            element = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "course-group"))
            )
            if VERBOSE_FLAG:
                print("Courses found, continuing with scraping...")
        except:
            self.driver.quit()

        # if driver.find_elements_by_css_selector('.panel-active [data-kind="results"]'):
        #     print("Element exists")

        self.courses = []
        for course in self.driver.find_elements_by_css_selector('.course-bar'):
            try:
                try:
                    #course_code = course.driver.find_elements_by_css_selector('.course-left').driver.find_elements_by_css_selector('.course-code')
                    course_code = course.find_element_by_css_selector('.course-code').text
                except:
                    print("Failed to retrieve course code...")
                try:
                    #course_title = course.driver.find_elements_by_css_selector('.course-right').driver.find_elements_by_css_selector('.course-title')
                    course_title = course.find_element_by_css_selector('.course-title').text
                except:
                    print("Failed to retrieve course title...")
                print(course_code, course_title)
                self.courses.append((course_code,course_title))
            except:
                self.driver.quit()
        #print(courses)

        self.driver.quit()