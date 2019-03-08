from flask import Flask, request, jsonify, send_from_directory, app
import flask_bcrypt
import database_helper
from flask import request
app = Flask(__name__)
import json
from random import randint
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
import hashlib

import datetime

bcrypt = flask_bcrypt.Bcrypt(app)
active_sockets = dict()
i= 0

@app.route('/')
def hello_world():
    return app.send_static_file('client.html')


@app.route('/signin', methods=['POST'])
def sign_in():
    email = request.json['email']
    password = request.json['password']
    if ((email!="")&(password!="")):
         hashedPassword= database_helper.get_hashedpw_by_email(email)
         try:
             result = bcrypt.check_password_hash(hashedPassword, password)
         except:
             result =False;
         if(result & (hashedPassword != None)):
             letters = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
             token = ''
             for i in range(0, 36):
                 token += letters[randint(0,len(letters) - 1)]
             result = database_helper.add_loggedIn(token, email)
             print ("token "+ token)
             if (result):
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
    email = request.json['email']
    if (not user_exists(email)):
        firstName = request.json['firstName']
        familyName = request.json['familyName']
        gender =  request.json['gender']
        city = request.json['city']
        country = request.json['country']
        password = request.json['password']
        passwordConfirmation = request.json['passwordConfirmation']
        if ((firstName != "")&(familyName!="")&(city!="")&(country !="")&( (gender== "Male") or (gender =="Female"))&(len(password)>4)&(len(passwordConfirmation)>4)):
            if (password==passwordConfirmation):
                hashedPassword=bcrypt.generate_password_hash(password)
                print ("Hashed PW: "+hashedPassword)
                result = database_helper.insert_user(firstName,familyName,gender,city, country,email,hashedPassword)
                return json.dumps({'success': True, 'message': 'New user successfully created'})
            else:
                return json.dumps({'success': False, 'message': 'Password and Password Confirmation are not the same'})
        else:
            return json.dumps({'success': False, 'message': 'Wrong Form input'})
    else:
        return json.dumps({'success': False, 'message': 'User already exists'})


@app.route('/logout', methods=['POST'])
def sign_out():
    hashedData = request.headers.get('hashedData')
    email = request.json['email']
    serverHash = server_hash(email, email)
    if (serverHash==hashedData):
        try: #close connection when manually logged out
            active_sockets[email].send(json.dumps("close"))
            del active_sockets[email]
        except:
            print("log out")
        token = database_helper.get_loggedIn_by_email(email)[0][0]
        result = database_helper.remove_loggedIn(token)
        if(result):
            return json.dumps({'success': True, 'message': 'Sucessfully logged out'})
        else:
            return json.dumps({'success': False, 'message': 'Logout not possible'})
    else:
        return json.dumps({'success': False, 'message': 'Authentication failed'})

@app.route('/getmyself', methods=['POST'])
def get_user_data_by_token():
    hashedData = request.headers.get('hashedData')
    email = request.json['email']
    serverHash = server_hash(email, email)
    if (serverHash==hashedData):
        token = database_helper.get_loggedIn_by_email(email)[0][0]
        user = database_helper.get_user_by_token(token)
        if (user !=None):
            return json.dumps({'success': True, 'message': 'User data received', 'data': user})
        else:
            return json.dumps({'success': False, 'message': 'User does not exist or You are not signed in'})
    else:
        return json.dumps({'success': False, 'message': 'Authentication failed'})

@app.route('/getuser', methods=['POST'])
def get_user_data_by_email():
    myEmail = request.json['myEmail']
    email = request.json['email']
    hashedData = request.headers.get('hashedData')
    serverHash = server_hash(email+myEmail, myEmail)
    if (serverHash==hashedData):
        user = database_helper.get_user_by_email(email)
        if (user !=None):
            return json.dumps({'success': True, 'message': 'User data received', 'data': user})
        else:
            return json.dumps({'success': False, 'message': 'User does not exist'})
    else:
        return json.dumps({'success': False, 'message': 'Authentication failed'})

@app.route('/newpassword', methods=['POST'])
def change_password():
    hashedData = request.headers.get('hashedData')
    oldPassword = request.json['oldPassword']
    newPassword = request.json['newPassword']
    passwordConfirmation = request.json['passwordConfirmation']
    email = request.json['email']
    data = email + newPassword + oldPassword
    serverHash = server_hash(data, email)

    if (serverHash == hashedData):
        oldPasswordHashed = database_helper.get_hashedpw_by_email(email)
        if(bcrypt.check_password_hash(oldPasswordHashed,oldPassword)):
            if(newPassword==passwordConfirmation):
                if(len(newPassword)>4):
                    newPasswordHashed = bcrypt.generate_password_hash(newPassword)
                    database_helper.update_password(email, newPasswordHashed)
                    return json.dumps({'success': True, 'message': 'Password has been changed'})
                else:
                    return json.dumps({'success': False, 'message': 'New Password is too short'})
            else:
                return json.dumps({'success': False, 'message': 'New Password and Password confirmation are different'})
        else:
            return json.dumps({'success': False, 'message': 'Old Password is incorrect'})
    else:
        return json.dumps({'success': False, 'message': 'You have to be logged in'})


@app.route('/usermessages', methods=['POST'])
def get_user_messages():
    hashedData = request.headers.get('hashedData')
    myEmail = request.json['myEmail']
    email = request.json['email']
    serverHash = server_hash(myEmail + email, myEmail)
    if (hashedData==serverHash):
        result = database_helper.get_messages(email)
        if (result!=[]):
            return json.dumps({"success": True, "message": "Messages collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No Messages"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in to see messages"})


@app.route('/mymessages', methods=['POST'])
def get_my_messages():
    hashedData = request.headers.get('hashedData')
    myEmail = request.json['myEmail']
    serverHash = server_hash(myEmail, myEmail)
    if (hashedData==serverHash):
        result = database_helper.get_messages(myEmail)
        if (result!=[]):
            return json.dumps({"success": True, "message": "Messages collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No Messages"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in to see messages"})


@app.route('/post/<userEmail>', methods=['POST'])
def post_message(userEmail):
    authorEmail= request.json['myEmail']
    hashedData = request.headers.get('hashedData')
    message = request.json['message']
    data = authorEmail+userEmail + message;
    serverHash = server_hash(data, authorEmail)
    if (hashedData==serverHash):
        if (database_helper.get_user_by_email(userEmail)!=None):
            database_helper.add_to_messages(userEmail,authorEmail, message)
            return json.dumps({"success": True, "message": "Message posted"})
        else:
            return json.dumps({"success": False, "message": "User doesn't exist"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in"})

@app.route('/uploadprofilepicture/', methods=['POST'])
def update_profile_picture():
    userEmail = request.json['email']
    hashedData = request.headers.get('hashedData')
    profilePicture = request.json['profilePicture']
    serverHash = server_hash(userEmail, userEmail)
    if ((hashedData==serverHash) & (userEmail != None)):
        database_helper.remove_old_profile_picture(userEmail)
        database_helper.add_to_profile_pictures(userEmail, profilePicture);
        return json.dumps({"success": True, "message": "Profile picture uploaded"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in"})

@app.route('/profilepicture/', defaults={'email': None}, methods=['POST'])
@app.route('/profilepicture/<email>', methods=['POST'])
def get_user_picture(email):
    hashedData = request.headers.get('hashedData')
    myEmail = request.json['myEmail']
    if (email != None):
        data= email
    else:
        data = myEmail
    serverHash = server_hash(data, myEmail)
    if (hashedData==serverHash):
        result = database_helper.get_profile_pictures(data)
        if (result!=[]):
            return json.dumps({"success": True, "message": "picture collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No picture"})
    else:
        return json.dumps({"success": False, "message": "You are not logged in"})

@app.route('/api')
def api():
    if request.environ.get("wsgi.websocket"):
        ws = request.environ["wsgi.websocket"]
        token = ws.receive()
        email=str(database_helper.get_email_by_token(token))
        if email in active_sockets:
            try:
                active_sockets[email].send(json.dumps("logout"))
                print("Active Websocket deleted: " +email)
            except:
                print("Active Websocket deleted (due to reload): " +email)
            del active_sockets[email]
            active_sockets[email] = ws
            print("New Active Websocket added: " +email)
        else:
            active_sockets[email] = ws
            print("New Active Websocket added: " +email)
        try:
            while True:
                message=ws.receive()
                if message == "close":
                    database_helper.remove_loggedIn(token)
                    break
        except WebSocketError as e:
            print("Client Disconnected Websocket")
    return ""

def server_hash(data, email):#this function gets the current token and does the hashing
    token = database_helper.get_loggedIn_by_email(email)[0][0]
    data = data + token;
    return hashlib.sha512(data.encode('utf-8')).hexdigest()


if __name__ == '__main__':
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
