import os
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import Dict

class MongoDB:
    def __init__(self):

        load_dotenv()
        user = os.getenv("MONGO_ROOT_USER")
        password = os.getenv("MONGO_ROOT_PASSWORD")
        host = os.getenv("MONGO_HOST", "localhost")
        port = os.getenv("MONGO_PORT", "27017")
        
        uri = f"mongodb://{user}:{password}@{host}:{port}/"
        self.client = MongoClient(uri)
        self.db = self.client["grocewise_db"]

    def _get_coll(self, collection_name: str):
        return self.db[collection_name]
    
    def insert_one(self, collection_name: str, data: Dict) -> str:
        coll = self._get_coll(collection_name)
        result = coll.insert_one(data)
        return str(result.inserted_id)
