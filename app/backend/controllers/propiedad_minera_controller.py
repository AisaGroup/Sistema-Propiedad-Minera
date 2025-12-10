from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.services.propiedad_minera_service import PropiedadMineraService
from backend.schemas.propiedad_minera_schema import (
    PropiedadMineraRead,
    PropiedadMineraCreate,
    PropiedadMineraExportFilters,
)
from backend.database.connection import get_db
from typing import List
import json
from backend.services.auth_jwt import get_current_user
from backend.services.audit_logger import AuditLogger
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime

router = APIRouter(prefix="/propiedades-mineras", tags=["Propiedades Mineras"])


@router.get("", response_model=List[PropiedadMineraRead])
def listar_propiedades(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    filter: str = Query(None),
):
    service = PropiedadMineraService(db)
    filters = {}
    if filter:
        filters_json = json.loads(filter)
        if "Nombre" in filters_json:
            filters["nombre"] = filters_json["Nombre"]
        if "Provincia" in filters_json:
            filters["provincia"] = filters_json["Provincia"]
        if "IdTitular" in filters_json:
            try:
                filters["id_titular"] = int(filters_json["IdTitular"])
            except Exception:
                pass
        if "Expediente" in filters_json:
            filters["expediente"] = filters_json["Expediente"]
    start, end = 0, 9
    if range:
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    limit = end - start + 1
    items, total = service.get_filtered_paginated(filters, offset=start, limit=limit)
    response.headers["Content-Range"] = (
        f"propiedades-mineras {start}-{start + len(items) - 1}/{total}"
    )
    return items


@router.get("/{id_propiedad}", response_model=PropiedadMineraRead)
def obtener_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    service = PropiedadMineraService(db)
    propiedad = service.get_by_id(id_propiedad)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return propiedad


@router.post("/", response_model=PropiedadMineraRead)
@router.post("", response_model=PropiedadMineraRead)
def crear_propiedad(
    propiedad_data: PropiedadMineraCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = PropiedadMineraService(db)
    try:
        propiedad = service.create(propiedad_data)
        AuditLogger(db, current_user).log_creation(
            entidad="PropiedadMinera",
            entity_id=propiedad.IdPropiedadMinera,
            payload=propiedad_data.model_dump(),
        )
        return propiedad
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id_propiedad}", response_model=PropiedadMineraRead)
def actualizar_propiedad(
    id_propiedad: int,
    propiedad_data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = PropiedadMineraService(db)
    try:
        updated = service.update(id_propiedad, propiedad_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Propiedad no encontrada")
        AuditLogger(db, current_user).log_update(
            entidad="PropiedadMinera",
            entity_id=id_propiedad,
            changes=propiedad_data,
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id_propiedad}")
def borrar_propiedad(
    id_propiedad: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = PropiedadMineraService(db)
    deleted = service.delete(id_propiedad)
    if not deleted:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    AuditLogger(db, current_user).log_deletion(
        entidad="PropiedadMinera",
        entity_id=id_propiedad,
    )
    return {"ok": True}


def _format_date(value: datetime | str | None) -> str:
    """Devuelve la fecha formateada dd/mm/YYYY o cadena vacía."""
    if not value:
        return ""
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value)
        except Exception:
            return value
    return value.strftime("%d/%m/%Y")


@router.post("/export/pdf")
def export_propiedades_pdf(
    filtros: PropiedadMineraExportFilters,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Genera un PDF con el listado de propiedades mineras utilizando el mismo
    estilo que el reporte de auditorías.
    """
    service = PropiedadMineraService(db)

    filters_repo = {}
    if filtros.nombre:
        filters_repo["nombre"] = filtros.nombre.strip()
    if filtros.provincia:
        filters_repo["provincia"] = filtros.provincia.strip()
    if filtros.idTitular:
        filters_repo["id_titular"] = filtros.idTitular
    if filtros.expediente:
        filters_repo["expediente"] = filtros.expediente.strip()

    propiedades, total = service.get_filtered_paginated(
        filters_repo, offset=0, limit=10000
    )

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=30,
        rightMargin=30,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Reporte de Propiedades Mineras", styles["Title"]))
    resumen = f"Total de registros: {len(propiedades)}"
    filtros_aplicados = []
    if filtros.nombre:
        filtros_aplicados.append(f"Nombre: {filtros.nombre}")
    if filtros.provincia:
        filtros_aplicados.append(f"Provincia: {filtros.provincia}")
    if filtros.idTitular:
        filtros_aplicados.append(f"Títular ID: {filtros.idTitular}")
    if filtros.expediente:
        filtros_aplicados.append(f"Expediente: {filtros.expediente}")

    if filtros_aplicados:
        resumen += " | Filtros: " + " - ".join(filtros_aplicados)

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(resumen, styles["Normal"]))
    elements.append(Spacer(1, 12))

    data = [
        [
            "ID",
            "Nombre",
            "Titular",
            "Provincia",
            "Área (Ha)",
            "Solicitud",
            "Notificación",
            "Referente",
        ]
    ]

    for p in propiedades:
        titular_nombre = getattr(p, "TitularNombre", None) or ""
        if not titular_nombre and getattr(p, "IdTitular", None):
            titular_nombre = f"ID: {p.IdTitular}"

        referente_val = getattr(p, "Referente", None)
        if referente_val is None:
            referente = "-"
        else:
            referente = "Sí" if bool(referente_val) else "No"

        data.append(
            [
                str(getattr(p, "IdPropiedadMinera", "")),
                getattr(p, "Nombre", "") or "",
                titular_nombre,
                getattr(p, "Provincia", "") or "",
                f"{getattr(p, 'AreaHectareas', 0) or 0:.2f}",
                _format_date(getattr(p, "Solicitud", None)),
                _format_date(getattr(p, "Notificacion", None)),
                referente,
            ]
        )

    table = Table(
        data,
        colWidths=[30, 120, 110, 60, 50, 60, 60, 45],
        repeatRows=1,
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#416759")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.whitesmoke, colors.lightgrey],
                ),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )

    elements.append(table)
    doc.build(elements)
    buffer.seek(0)

    headers = {
        "Content-Disposition": 'attachment; filename="propiedades-mineras.pdf"',
        "Content-Type": "application/pdf",
    }

    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
