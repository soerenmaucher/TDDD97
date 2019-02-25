from flask import Flask, request, jsonify, send_from_directory, app
import database_helper
from flask import request
app = Flask(__name__)
import json
from random import randint
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError
import datetime


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
         if(database_helper.verify(email, password)):
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
                result = database_helper.insert_user(firstName,familyName,gender,city, country,email,password)
                return json.dumps({'success': True, 'message': 'New user successfully created'})
            else:
                return json.dumps({'success': False, 'message': 'Password and Password confirmation are not the same'})
        else:
            return json.dumps({'success': False, 'message': 'Wrong Form input'})
    else:
        return json.dumps({'success': False, 'message': 'User already exists'})


@app.route('/logout', methods=['POST'])
def sign_out():
    token = request.headers.get('token')
    email=str(database_helper.get_email_by_token(token))
    try: #close connection when manually logged out
        active_sockets[email].send(json.dumps("close"))
        del active_sockets[email]
    except:
        print("log out")
    result = database_helper.remove_loggedIn(token)
    if(result):
        return json.dumps({'success': True, 'message': 'Sucessfully logged out'})
    else:
        return json.dumps({'success': False, 'message': 'Logout not possible'})

@app.route('/getmyself', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('token')
    user = database_helper.get_user_by_token(token)
    if (user !=None):
        return json.dumps({'success': True, 'message': 'User data received', 'data': user})
    else:
        return json.dumps({'success': False, 'message': 'User does not exist or You are not signed in'})


@app.route('/getuser/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('token')
    if(database_helper.get_email_by_token(token) != None):
        user = database_helper.get_user_by_email(email)
        if (user !=None):
             return json.dumps({'success': True, 'message': 'User data received', 'data': user})
        else:
             return json.dumps({'success': False, 'message': 'User does not exist'})
    else:
        return json.dumps({'success': False, 'message': 'You have to be logged in to see other users'})

@app.route('/newpassword', methods=['POST'])
def change_password():
    token = request.headers.get('token')
    email=database_helper.get_email_by_token(token)
    if (email!=None):
        oldPassword = request.json['oldPassword']
        newPassword = request.json['newPassword']
        passwordConfirmation = request.json['passwordConfirmation']
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

@app.route('/usermessages/', defaults={'email': None}, methods=['GET'])
@app.route('/usermessages/<email>', methods=['GET'])
def get_user_messages(email): #is both. get messages by email and token!!!
    token = request.headers.get('token')
    if email is None:
        email = database_helper.get_email_by_token(token)
    if(database_helper.get_email_by_token(token) != None):
        result = database_helper.get_messages(email)
        if (result!=[]):
            return json.dumps({"success": True, "message": "Messages collected", "data": result})
        else:
            return json.dumps({"success": False, "message": "No Messages"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in to see messages"})

@app.route('/post/<userEmail>', methods=['POST'])
def post_message(userEmail):
    token = request.headers.get('token')
    message = request.json['message']
    authorEmail = database_helper.get_email_by_token(token)
    if(authorEmail !=None):
        if (database_helper.get_user_by_email(userEmail)!=None):
            database_helper.add_to_messages(userEmail,authorEmail, message)
            return json.dumps({"success": True, "message": "Message posted"})
        else:
            return json.dumps({"success": False, "message": "User doesn't exist"})
    else:
        return json.dumps({"success": False, "message": "You have to be logged in"})

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
                    break
        except WebSocketError as e:
            print("Client Disconnected Websocket")
    return ""

if __name__ == '__main__':
    http_server = WSGIServer(('127.0.0.1', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
