from selenium import webdriver
import time


browser2 = webdriver.Firefox()
browser2.get('http://127.0.0.1:5000/')

browser1 = webdriver.Firefox()
browser1.get('http://127.0.0.1:5000/')



def signup(driver,firstName, familyName, gender, city, country, email, password, repeatPassword):
    driver.find_element_by_name("firstName").send_keys(firstName)
    driver.find_element_by_name("familyName").send_keys(familyName)
    element = driver.find_element_by_name("gender")
    for option in element.find_elements_by_tag_name('option'):
        if option.text == gender:
            option.click()
            break
    driver.find_element_by_name("city").send_keys(city)
    driver.find_element_by_name("country").send_keys(country)
    driver.find_element_by_xpath("//div[@id='signup']/form/div/input[@name='email']").send_keys(email) #because there are two fields with the name email
    driver.find_element_by_xpath("//div[@id='signup']/form/div/input[@name='password']").send_keys(password)
    driver.find_element_by_name("passwordConfirmation").send_keys(repeatPassword)
    driver.find_element_by_xpath("//div[@id='signup']/form/div/button[@type='submit']").click()
    checkfeedback(driver,"Signup")


def login(driver,email, password):
    driver.find_element_by_name("email").send_keys(email)
    driver.find_element_by_name("password").send_keys(password)
    driver.find_element_by_xpath("//div[@id='login']/form/div/button[@type='submit']").click()
    checkfeedback(driver,"Login")



def logout(driver):
    driver.find_elements_by_class_name("tablinks")[2].click()
    driver.find_element_by_id("logoutButton").click()
    checkfeedback(driver,"Logout")


def browseuser(driver,user):
    driver.find_elements_by_class_name("tablinks")[1].click()
    driver.find_element_by_name("email").send_keys(user)
    driver.find_element_by_id("search").click()
    checkfeedback(driver,"Browsing")

def postmessage(driver,message, i):
    if i==1:
        driver.find_element_by_id("message").send_keys(message)
    else:
        driver.find_element_by_id("ownMessage").send_keys(message)
    button=driver.find_elements_by_name("Send")[i]
    button.click()
    checkfeedback(driver,"Post Message")
    button=driver.find_elements_by_name("Update")[i]
    button.click()
    checkfeedback(driver,"Update")

def changepassword(driver, oldpassword, newpassword, passwordconfirm):
    driver.find_elements_by_class_name("tablinks")[2].click()
    driver.find_element_by_name("oldPassword").send_keys(oldpassword)
    driver.find_element_by_name("newPassword").send_keys(newpassword)
    driver.find_element_by_name("passwordConfirmation").send_keys(passwordconfirm)
    driver.find_element_by_xpath("//div[@id='changepw']/form/div/button[@type='submit']").click()
    checkfeedback(driver, "Change Pw")

def home(driver):
    driver.find_elements_by_class_name("tablinks")[0].click()
    checkfeedback(driver, "Home")


def checkfeedback(driver,function):
    time.sleep(1)
    message= driver.find_element_by_id("errorMessage").text
    if message != "":
        print(function+ ": "+message)
    else:
        print(function+ ": No Error/Feedback")
    try:
        driver.find_element_by_id("close").click()
    except:
        return

#Test1: Signup and Login
print("----test1----")
signup(browser1,"Soeren", "Maucher", "Male", "Linkoeping", "Sweden", "email@web.de", "password", "password")
time.sleep(1)
login(browser1,"email@web.de", "password")
time.sleep(1)

#Test2: Browse user and post message
print("----test2----")
browseuser(browser1,"soeren_maucher@web.de")
time.sleep(1)
postmessage(browser1, "testmessage",1)
time.sleep(1)

#Test3: login with other device and casue automatic logout
print("----test3----")
login(browser2,"email@web.de", "password")
time.sleep(1)
checkfeedback(browser1,"Other Login")
time.sleep(1)

#Test4: Change Pw
print("----test4----")
changepassword(browser2, "password", "password", "password")
time.sleep(1)

#post message on own wall and logout
print("----test5----")
home(browser2)
time.sleep(1)
postmessage(browser2, "testmessage",0)
time.sleep(1)
logout(browser2)



browser1.quit()
browser2.quit()
