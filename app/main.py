from fastapi import FastAPI
from backend.controllers.propiedad_minera_controller import router as propiedad_minera_router
from backend.controllers.estado_alerta_controller import router as estado_alerta_router
from backend.controllers.expediente_controller import router as expediente_router
from backend.controllers.tipo_expediente_controller import router as tipo_expediente_router
from backend.controllers.titular_minero_controller import router as titular_minero_router
from backend.controllers.acta_controller import router as acta_router
from backend.controllers.resolucion_controller import router as resolucion_router
from backend.controllers.autoridad_controller import router as autoridad_router
from backend.controllers.area_controller import router as area_router
from backend.controllers.archivo_controller import router as archivo_router
from backend.controllers.notificacion_controller import router as notificacion_router
from backend.controllers.alerta_controller import router as alerta_router
from backend.controllers.auditoria_controller import router as auditoria_router
from backend.controllers.transaccion_controller import router as transaccion_router
from backend.controllers.observaciones_controller import router as observaciones_router
from backend.controllers.tipo_alerta_controller import router as tipo_alerta_router
from backend.controllers.req_minero_mov_controller import router as req_minero_mov_router
from backend.controllers.req_minero_controller import router as req_minero_router
from backend.controllers.periodicidad_alerta_controller import router as periodicidad_alerta_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range"],
)

app.include_router(propiedad_minera_router)
app.include_router(expediente_router)
app.include_router(tipo_expediente_router)
app.include_router(titular_minero_router)
app.include_router(acta_router)
app.include_router(resolucion_router)
app.include_router(autoridad_router)
app.include_router(area_router)
app.include_router(archivo_router)
app.include_router(notificacion_router)
app.include_router(estado_alerta_router)
app.include_router(alerta_router)
app.include_router(auditoria_router)
app.include_router(transaccion_router)
app.include_router(observaciones_router)
app.include_router(tipo_alerta_router)
app.include_router(req_minero_mov_router)
app.include_router(req_minero_router)
app.include_router(periodicidad_alerta_router)
