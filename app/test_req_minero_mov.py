"""
Test script para verificar la funcionalidad de ReqMineroMov
"""
import requests
import json

# URL base del API
BASE_URL = "http://localhost:8000"

def test_create_req_minero_mov_for_propiedad():
    """
    Test para crear un requerimiento minero para una propiedad específica
    """
    # ID de propiedad minera existente (ajustar según tu base de datos)
    id_propiedad_minera = 1
    
    # Datos del requerimiento minero
    req_data = {
        "Descripcion": "Estudio de Impacto Ambiental",
        "Importe": 15000.50,
        "Fecha": "2025-09-08T10:00:00"
    }
    
    # Hacer POST request
    url = f"{BASE_URL}/propiedades-mineras/{id_propiedad_minera}/req-minero-movs"
    response = requests.post(url, json=req_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Requerimiento creado exitosamente!")
        print(f"   - ID: {result['IdReqMineroMov']}")
        print(f"   - IdPropiedadMinera: {result['IdPropiedadMinera']}")
        print(f"   - IdTransaccion: {result['IdTransaccion']}")
        print(f"   - Descripcion: {result['Descripcion']}")
    else:
        print(f"❌ Error: {response.json()}")

def test_get_req_minero_movs_by_propiedad():
    """
    Test para obtener requerimientos de una propiedad
    """
    id_propiedad_minera = 1
    
    url = f"{BASE_URL}/propiedades-mineras/{id_propiedad_minera}/req-minero-movs"
    response = requests.get(url)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Requerimientos encontrados: {len(response.json())}")
    
    if response.status_code == 200:
        for req in response.json():
            print(f"   - {req['Descripcion']} (ID: {req['IdReqMineroMov']})")

if __name__ == "__main__":
    print("🧪 Probando funcionalidad ReqMineroMov...")
    
    # Test 1: Crear requerimiento para propiedad específica
    test_create_req_minero_mov_for_propiedad()
    
    # Test 2: Obtener requerimientos de la propiedad
    test_get_req_minero_movs_by_propiedad()
