import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from contextlib import contextmanager
from sqlalchemy.ext.declarative import declarative_base

# Cargar variables de entorno desde .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

SQLSERVER_USER = os.getenv('SQLSERVER_USER')
SQLSERVER_PASSWORD = os.getenv('SQLSERVER_PASSWORD')
SQLSERVER_HOST = os.getenv('SQLSERVER_HOST')
SQLSERVER_PORT = os.getenv('SQLSERVER_PORT', '1433')
SQLSERVER_DB = os.getenv('SQLSERVER_DB')

DATABASE_URL = (
    f"mssql+pyodbc://{SQLSERVER_USER}:{SQLSERVER_PASSWORD}@{SQLSERVER_HOST}:{SQLSERVER_PORT}/"
    f"{SQLSERVER_DB}?driver=ODBC+Driver+17+for+SQL+Server"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base = declarative_base()        