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

#initializing the Bycrypt object
bcrypt = flask_bcrypt.Bcrypt(app)
#initializing dictionary for active sockets
active_sockets = dict()

#function to set the the initial directory to client.html
@app.route('/')
def hello_world():
    return app.send_static_file('client.html')

#signin function that compares the hashed password from the server with the hased password from the POST request
#on success a random token is created and returned
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
             if (result):
                 return json.dumps({'success': True, 'message': 'Signed in', 'data': token})
             else:
                 return json.dumps({'success': False, 'message': 'Error signing in'})
         else:
             return json.dumps({'success': False, 'message': 'Wrong Password or Username'})
    else:
        return json.dumps({'success': False, 'message': 'Password or email missing'})

#function that checks if a user with the given email already exists and returns true/false accordingly
def user_exists(email):
    user= database_helper.get_user_by_email(email)
    if user == None:
        result= False
    else:
        result = True
    return result

#signup function that checks if the inputs are valid and if successful calls the appropriate function to insert a new user
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
                result = database_helper.insert_user(firstName,familyName,gender,city, country,email,hashedPassword)
                return json.dumps({'success': True, 'message': 'New user successfully created'})
            else:
                return json.dumps({'success': False, 'message': 'Password and Password Confirmation are not the same'})
        else:
            return json.dumps({'success': False, 'message': 'Wrong Form input'})
    else:
        return json.dumps({'success': False, 'message': 'User already exists'})

#logout function that checks the validity of the hashed data and on sucess removes the token and the user from the logedIn table
@app.route('/logout', methods=['POST'])
def sign_out():
    hashedData = request.headers.get('hashedData')
    email = request.json['email']
    serverHash = server_hash(email, email)
    if (serverHash==hashedData):
        try:
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

#function that returns the users data after validating the hashed data from the POST request
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

#function that returns the browsed user's data after validating the hashed data from the POST request
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

#function that sets the new password after validating the hashed data from the POST request
#additional password validation is performed to not blindly trust the client
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

#function that returns the browsed user's messages after validating the hashed data from the POST request
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

#function that returns the  user's own messages after validating the hashed data from the POST request
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

#function that posts a message the users wall after validating the hashed data from the POST request
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

#function that uploads a video to the database after validating the hashed data from the POST request
@app.route('/uploadvideo', methods=['POST'])
def upload_video():
    userEmail = request.json['email']
    hashedData = request.headers.get('hashedData')
    video = request.json['video']
    serverHash = server_hash(userEmail, userEmail)
    if ((hashedData==serverHash) & (userEmail != None)):
        database_helper.remove_old_video(userEmail)
        database_helper.add_video(userEmail, video);
        return json.dumps({"success": True, "message": "video uploaded"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in"})

#function that returns a video for the given user after validating the hashed data from the POST request
#depending on whether an email is provided or not the own video or the video of the browsed user is returned
@app.route('/getvideo', defaults={'email': None}, methods=['POST'])
@app.route('/getvideo/<email>', methods=['POST'])
def get_video(email):
    hashedData = request.headers.get('hashedData')
    myEmail = request.json['myEmail']
    if (email != None):
        data= email
    else:
        data = myEmail
    serverHash = server_hash(data, myEmail)
    if (hashedData==serverHash):
        result = database_helper.get_video(data)
        if (result!=[]):
            return json.dumps({"success": True, "message": "video collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No video"})
    else:
        return json.dumps({"success": False, "message": "You are not logged in"})

#function that uploads a profile picture to the database after validating the hashed data from the POST request
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

#function that returns the profile picture for the given user after validating the hashed data from the POST request
#depending on whether an email is provided or not the own profile picture or the profile picture of the browsed user is returned
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

#function that opens a new socket, keeps it open and closes it when the client sends the message "close"
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

#function that retrieves the token from the provided email and recreates the hash with the provided data
def server_hash(data, email):
    token = database_helper.get_loggedIn_by_email(email)[0][0]
    data = data + token;
    return hashlib.sha512(data.encode('utf-8')).hexdigest()


#function to set the url of the application to localhost and run the server
if __name__ == '__main__':
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
