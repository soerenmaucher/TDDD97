from selenium import webdriver
import time


# two variables to have two different browser windows
browser2 = webdriver.Firefox()
browser2.get('http://127.0.0.1:5000/')

browser1 = webdriver.Firefox()
browser1.get('http://127.0.0.1:5000/')


# function that performs the signup with the provided arguments
# argument[0] the webdriver/browser with which the action should be performed
# argument[1-8] user data for the signup
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

# function that performs the login with the provided arguments
# argument[0] the webdriver/browser with which the action should be performed
# argument[1-2] user data for the login
def login(driver,email, password):
    driver.find_element_by_name("email").send_keys(email)
    driver.find_element_by_name("password").send_keys(password)
    driver.find_element_by_xpath("//div[@id='login']/form/div/button[@type='submit']").click()
    checkfeedback(driver,"Login")


# function that performs the logout with the provided webdriver
# argument[0] the webdriver/browser with which the action should be performed
def logout(driver):
    driver.find_elements_by_class_name("tablinks")[2].click()
    driver.find_element_by_id("logoutButton").click()
    checkfeedback(driver,"Logout")

# function that searches for a user in the browse tab
# argument[0] the webdriver/browser with which the action should be performed
# argument[1] user which should be looked for
def browseuser(driver,user):
    driver.find_elements_by_class_name("tablinks")[1].click()
    driver.find_element_by_name("email").send_keys(user)
    driver.find_element_by_id("search").click()
    checkfeedback(driver,"Browsing")

# function that posts a message on either the users own wall or another users wall
# argument[0] the webdriver/browser with which the action should be performed
# argument[1] the message that shall be posted
# argument[2] index indicating wether the message should be posted on the own wall(0) or another users wall(1)
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

# function that changes the password
# argument[0] the webdriver/browser with which the action should be performed
# argument[1] the parameters to change the password
def changepassword(driver, oldpassword, newpassword, passwordconfirm):
    driver.find_elements_by_class_name("tablinks")[2].click()
    driver.find_element_by_name("oldPassword").send_keys(oldpassword)
    driver.find_element_by_name("newPassword").send_keys(newpassword)
    driver.find_element_by_name("passwordConfirmation").send_keys(passwordconfirm)
    driver.find_element_by_xpath("//div[@id='changepw']/form/div/button[@type='submit']").click()
    checkfeedback(driver, "Change Pw")

# function that sets the view to the home tab
# argument[0] the webdriver/browser with which the action should be performed
def home(driver):
    driver.find_elements_by_class_name("tablinks")[0].click()
    checkfeedback(driver, "Home")

# function that prints the message from the feedback popup
# argument[0] the webdriver/browser with which the action should be performed
# argument[1] String that will be appended to the error message to indicate which function has triggered it
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

#Test1: signup and login
print("----test1----")
signup(browser1,"Soeren", "Maucher", "Male", "Linkoeping", "Sweden", "email@web.de", "password", "password")
time.sleep(1)
login(browser1,"email@web.de", "password")
time.sleep(1)

#Test2: browse user and post message
print("----test2----")
browseuser(browser1,"email@web.de")
time.sleep(1)
postmessage(browser1, "testmessage",1)
time.sleep(1)

#Test3: login from a second browser to cause a log out on the first browser
print("----test3----")
login(browser2,"email@web.de", "password")
time.sleep(1)
checkfeedback(browser1,"Other Login")
time.sleep(1)

#Test4: change the user's password
print("----test4----")
changepassword(browser2, "password", "password", "password")
time.sleep(1)

#post a message on the user's own wall and logout
print("----test5----")
home(browser2)
time.sleep(1)
postmessage(browser2, "testmessage",0)
time.sleep(1)
logout(browser2)


#close the browsers
browser1.quit()
browser2.quit()
