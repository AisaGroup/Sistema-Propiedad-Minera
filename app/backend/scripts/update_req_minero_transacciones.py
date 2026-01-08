"""
Script para actualizar requerimientos mineros existentes con IdTransaccion.
Crea transacciones para todos los requerimientos que no tienen una.
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_path))

from sqlalchemy import text
from datetime import datetime
from backend.database.connection import SessionLocal
from backend.models.req_minero_mov_model import ReqMineroMov
from backend.models.propiedad_minera_model import PropiedadMinera
from backend.models.transaccion_model import Transaccion

def actualizar_requerimientos_con_transacciones():
    """
    Actualiza todos los requerimientos mineros que no tienen IdTransaccion.
    Crea una transacción para cada uno usando la propiedad como padre.
    """
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("SCRIPT: Actualizar requerimientos mineros con transacciones")
        print("=" * 80)
        
        # Buscar todos los requerimientos sin IdTransaccion
        requerimientos_sin_transaccion = db.query(ReqMineroMov).filter(
            ReqMineroMov.IdTransaccion.is_(None)
        ).all()
        
        print(f"\n✓ Encontrados {len(requerimientos_sin_transaccion)} requerimientos sin IdTransaccion")
        
        actualizados = 0
        sin_propiedad = 0
        errores = 0
        
        for req in requerimientos_sin_transaccion:
            try:
                print(f"\n--- Procesando Requerimiento ID: {req.IdReqMineroMov} ---")
                
                # Verificar si tiene propiedad asociada
                if not req.IdPropiedadMinera:
                    print(f"  ⚠ Requerimiento {req.IdReqMineroMov} no tiene propiedad asociada, se omite")
                    sin_propiedad += 1
                    continue
                
                # Obtener la propiedad
                propiedad = db.query(PropiedadMinera).filter(
                    PropiedadMinera.IdPropiedadMinera == req.IdPropiedadMinera
                ).first()
                
                if not propiedad:
                    print(f"  ⚠ No se encontró la propiedad {req.IdPropiedadMinera}")
                    sin_propiedad += 1
                    continue
                
                if not propiedad.IdTransaccion:
                    print(f"  ⚠ La propiedad {req.IdPropiedadMinera} no tiene IdTransaccion")
                    sin_propiedad += 1
                    continue
                
                print(f"  ✓ Propiedad encontrada: {req.IdPropiedadMinera}, IdTransaccion: {propiedad.IdTransaccion}")
                
                # Crear la transacción
                nueva_transaccion = Transaccion(
                    IdTransaccionPadre=propiedad.IdTransaccion,
                    Descripcion=f"Requerimiento Minero #{req.IdReqMineroMov} (actualizado por script)",
                    IdRegistro=req.IdReqMineroMov,
                    Tabla="ReqMineroMov",
                    AudFecha=datetime.now(),
                    AudUsuario="SCRIPT"
                )
                
                db.add(nueva_transaccion)
                db.flush()  # Para obtener el ID sin hacer commit
                
                print(f"  ✓ Transacción creada: ID={nueva_transaccion.IdTransaccion}")
                
                # Actualizar el requerimiento
                req.IdTransaccion = nueva_transaccion.IdTransaccion
                db.flush()
                
                print(f"  ✓ Requerimiento actualizado con IdTransaccion: {nueva_transaccion.IdTransaccion}")
                actualizados += 1
                
            except Exception as e:
                print(f"  ✗ Error al procesar requerimiento {req.IdReqMineroMov}: {e}")
                errores += 1
                db.rollback()
                continue
        
        # Hacer commit final
        db.commit()
        
        print("\n" + "=" * 80)
        print("RESUMEN DE ACTUALIZACIÓN")
        print("=" * 80)
        print(f"✓ Requerimientos actualizados: {actualizados}")
        print(f"⚠ Requerimientos sin propiedad o sin transacción padre: {sin_propiedad}")
        print(f"✗ Errores: {errores}")
        print(f"📊 Total procesados: {len(requerimientos_sin_transaccion)}")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ Error general en el script: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n⚠ ADVERTENCIA: Este script modificará la base de datos.")
    respuesta = input("¿Deseas continuar? (s/n): ")
    
    if respuesta.lower() == 's':
        actualizar_requerimientos_con_transacciones()
        print("\n✓ Script completado.\n")
    else:
        print("\n✗ Operación cancelada.\n")
