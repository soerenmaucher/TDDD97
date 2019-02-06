from flask import Flask
from flask import g
app = Flask(__name__)
import sqlite3

DATABASE = 'database2.db'
connection = None

def connect_db():
    global connection
    connection = sqlite3.connect(DATABASE)

def close_db():
	db = getattr(g, '_database', None)
	if db is not None:
            db.close()

def query_db(querry, arguments, one = True):
    connect_db()
    cursor = connection.cursor()
    cursor.execute(querry, arguments)
    connection.commit()
    if not one:
        result = cursor.fetchall()
    else:
        result = cursor.fetchone()
    cursor.close()
    close_db()
    return result

def insert_user(firstName, familyName, gender, city, country, email, password):
    result = query_db('insert into users values (?, ?, ?, ?, ?, ?, ?)', [firstName, familyName, gender, city, country, email, password])
    return True # validaton etc.!


def verify(email, password):
    passwordFromDb = query_db('select password from users where email = ?', (email,), True)
    result=False
    if (passwordFromDb!= None):
        passwordFromDb = passwordFromDb[0]
        if (passwordFromDb == password):
            result = True
    return result

def add_loggedInUsers(token, email):
    #maybe later perform check, if email and token match!
    query_db('insert into loggedInUsers values (?, ?)', (token, email))
    return True

def remove_signedInUsers(token):
        result= query_db('select email from loggedInUsers where token = ?', (token,), True)
        if(result!=None):
            query_db('delete from loggedInUsers where token = ?', (token,))
            return True
        else:
            return False

def get_user_by_email(email):
    result = query_db('select * from users where email = ?', (email,), True)
    return result

def get_email_by_token(token):
    result = query_db('select email from loggedInusers where token = ?', (token,), True)
    if (result!= None):
        result=result[0]
    return result

def get_user_by_token(token):
    email = get_email_by_token(token)
    result = None
    if (email !=None):
        result = query_db('select * from users where email = ?', (email,), True)
    return result

def get_password(email):
    result = query_db('select password from users where email = ?', (email,), True)
    if (result!= None):
        result=result[0]
        print result
    return result

def update_password(email, password):
    return query_db('update users set password = ? where email = ?', (password, email))

def get_messages(userEmail):
    result = query_db('select * from messages where userEmail = ?', (userEmail,), False)#what type is this? is it enough?
    return result

def add_to_messages(userEmail, authorEmail, message):
    result = query_db('insert into messages (userEmail, authorEmail, message) values (?, ?, ?)', (userEmail, authorEmail, message))
    return result

@app.route('/')
def hello_world():
    return 'Database Helper'


if __name__ == '__main__':
    app.debug = True
    app.run()
