from connection import SessionLocal
from sqlalchemy import text

def test_db():
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).fetchone()
        print("Conexión exitosa:", result)
    except Exception as e:
        print("Error de conexión:", e)
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
