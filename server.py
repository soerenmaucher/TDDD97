from flask import Flask
import database_helper
from flask import request
app = Flask(__name__)
import json
from random import randint

@app.route('/signin', methods=['POST'])
def sign_in():
    email = request.form['email']
    password = request.form['password']
    if ((email!="")&(password!="")):
         if(database_helper.verify(email, password)):
             letters = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
             token = ''
             for i in range(0, 36):
                 token += letters[randint(0,len(letters) - 1)]
             result = database_helper.add_loggedInUsers(token, email)
             if (result):# not implemented yet. Currently is always true
                 return json.dumps({'success': True, 'message': 'Signed in', 'data': token})
             else:
                 return json.dumps({'success': False, 'message': 'Error signing in'})
         else:
             return json.dumps({'success': False, 'message': 'Wrong Password or Username'})
    else:
        return json.dumps({'success': False, 'message': 'Password or email missing'})

def user_exists(email):
    user= database_helper.get_user_by_email(email)
    if user == None:
        result= False
    else:
        result = True
    return result

@app.route('/signup', methods=['POST'])
def sign_up():
    email = request.form['email']
    if (not user_exists(email)):
        firstName = request.form['firstName']
        familyName = request.form['familyName']
        gender =  request.form['gender']
        city = request.form['city']
        country = request.form['country']
        password = request.form['password'] #maybe still have to comapre that both pw match
        if ((firstName != "")&(familyName!="")&(city!="")&(country !="")&( (gender== "Male") or (gender =="Female"))&(len(password)>4)):
            result = database_helper.insert_user(firstName,familyName,gender,city, country,email,password)
            return json.dumps({'success': True, 'message': 'New user successfully created'})
        else:
            return json.dumps({'success': False, 'message': 'Wrong Form input'})
    else:
        return json.dumps({'success': False, 'message': 'User already exists'})


@app.route('/logout/<token>', methods=['GET'])
def sign_out(token):
    result = database_helper.remove_signedInUsers(token)
    print result
    if(result):
        return json.dumps({'success': True, 'message': 'Sucessfully logged out'})
    else:
        return json.dumps({'success': False, 'message': 'Logout not possible'})

@app.route('/')
def hello_world():
    return 'Server'

@app.route('/get_myself/<token>', methods=['GET'])# not secure, i can see my token???
def get_user_data_by_token(token):
    user = database_helper.get_user_by_token(token)
    if (user !=None):
        return json.dumps({'success': True, 'message': 'User data received', 'data': user})
    else:
        return json.dumps({'success': False, 'message': 'User does not exist or You are not signed in'})


@app.route('/get_user/<email>/<token>', methods=['GET'])
def get_user_data_by_email(email,token):
    if(database_helper.get_email_by_token(token) != None):
        user = database_helper.get_user_by_email(email)
        if user is None:
             return json.dumps({'success': False, 'message': 'User does not exist'})
        else:
             return json.dumps({'success': True, 'message': 'User data received', 'data': user})
    else:
        return json.dumps({'success': False, 'message': 'You have to be logged in to see other users'})

@app.route('/newpassword/<token>', methods=['GET', 'POST'])
def change_password(token):
    email=database_helper.get_email_by_token(token)
    if (email!=None):
        oldPassword = request.form['oldPassword']
        newPassword = request.form['newPassword']
        passwordConfirmation = request.form['passwordConfirmation']
        if(oldPassword == database_helper.get_password(email)):
            if(newPassword==passwordConfirmation):
                if(len(newPassword)>4):
                    database_helper.update_password(email, newPassword)
                    return json.dumps({'success': True, 'message': 'Password has been changed'})
                else:
                    return json.dumps({'success': False, 'message': 'New Password is too short'})
            else:
                return json.dumps({'success': False, 'message': 'New Password and Password confirmation are different'})
        else:
            return json.dumps({'success': False, 'message': 'Old Password is incorrect'})
    else:
        return json.dumps({'success': False, 'message': 'You have to be logged in'})

@app.route('/usermessages/<token>', defaults={'email': None}, methods=['GET'])
@app.route('/usermessages/<token>/<email>', methods=['GET'])
def get_user_messages(token, email): #is both. get messages by email and token!!!
    if email is None:
        email = database_helper.get_email_by_token(token)
    if(database_helper.get_email_by_token(token) != None):
        result = database_helper.get_messages(email)
        print result
        if (result!=[]):
            return json.dumps({"success": True, "message": "Messages collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No Messages"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in to see messages"})

@app.route('/post/<token>/<userEmail>', methods=['GET', 'POST'])
def post_message(token, userEmail):
    message = request.form['message']
    authorEmail = database_helper.get_email_by_token(token)
    if(authorEmail !=None): #more validation
        if (database_helper.get_user_by_email(userEmail)!=None):
            database_helper.add_to_messages(userEmail,authorEmail, message)
            return json.dumps({"success": True, "message": "Message posted"})
        else:
            return json.dumps({"success": False, "message": "User doesn't exist"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in"})



if __name__ == '__main__':
    app.debug = True
    app.run()
