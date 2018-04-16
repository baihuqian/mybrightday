import os
from io import StringIO
from flask import Flask
from flask import send_file
from pymongo import MongoClient
import pickle

app = Flask(__name__)

@app.route('/')
def source():
    MONGO_URL = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/test_db')
    client = MongoClient(MONGO_URL)
    try:
        db = client.get_default_database().settings
        image_file = StringIO(pickle.loads(db.find_one({'type':'screenshot'})))
        send_file(image_file, attachment_filename='logo.png', mimetype='image/png')
    except Exception as exc:
        print(str(exc))
        
    return 'Hello World!'

if __name__ == '__main__':
    app.run()