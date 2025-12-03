from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from backend.services.auditoria_service import AuditoriaService
from backend.schemas.auditoria_schema import (
    AuditoriaCreate,
    AuditoriaUpdate,
    AuditoriaOut,
    AuditoriaExportFilters,
)
from backend.database.connection import get_db
from typing import List
from backend.services.auth_jwt import get_current_user
from fastapi.responses import StreamingResponse
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
import json
from datetime import datetime

router = APIRouter(prefix="/auditorias", tags=["auditorias"])


@router.get("/", response_model=List[AuditoriaOut])
def list_auditorias(
    db: Session = Depends(get_db),
    response: Response = None,
    range: str = Query(None, alias="range"),
    current_user: int = Depends(get_current_user),
):
    service = AuditoriaService(db)
    items = service.get_auditorias()
    total = len(items)
    start, end = 0, total - 1
    if range:
        try:
            start, end = json.loads(range)
        except Exception:
            pass
    paginated_items = items[start : end + 1]
    if response is not None:
        response.headers["Content-Range"] = f"auditorias {start}-{end}/{total}"
    # Convierte los diccionarios a modelos Pydantic para la serialización correcta
    return [AuditoriaOut(**item) for item in paginated_items]


@router.get("/{id}", response_model=AuditoriaOut)
def get_auditoria(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    service = AuditoriaService(db)
    obj = service.get_auditoria(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return AuditoriaOut(**obj)


@router.post("/", response_model=AuditoriaOut)
def create_auditoria(
    auditoria: AuditoriaCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    service = AuditoriaService(db)
    return service.create_auditoria(auditoria)


@router.put("/{id}", response_model=AuditoriaOut)
def update_auditoria(
    id: int,
    auditoria: AuditoriaUpdate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    service = AuditoriaService(db)
    obj = service.update_auditoria(id, auditoria)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return obj


@router.delete("/{id}", response_model=AuditoriaOut)
def delete_auditoria(
    id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    service = AuditoriaService(db)
    obj = service.delete_auditoria(id)
    if not obj:
        raise HTTPException(status_code=404, detail="Auditoria not found")
    return obj


def _matches_text(value: str | None, filtro: str | None) -> bool:
    if not filtro:
        return True
    return (value or "").lower().find(filtro.lower()) != -1


def _matches_date_range(
    aud_fecha: datetime | None,
    fecha_desde: datetime | None,
    fecha_hasta: datetime | None,
) -> bool:
    if not fecha_desde and not fecha_hasta:
        return True
    if not aud_fecha:
        return False
    if fecha_desde and aud_fecha < fecha_desde:
        return False
    if fecha_hasta and aud_fecha > fecha_hasta:
        return False
    return True


def _matches_id_transaccion(descripcion: str | None, filtro: str | None) -> bool:
    if not filtro:
        return True
    if not descripcion:
        return False
    try:
        data = json.loads(descripcion)
    except Exception:
        # si no es JSON, buscar texto plano
        return filtro.lower() in descripcion.lower()

    # recorrido recursivo para encontrar cualquier clave que contenga "idtransaccion"
    def search(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if (
                    "idtransaccion" in str(k).lower()
                    and filtro.lower() in str(v).lower()
                ):
                    return True
                if search(v):
                    return True
        elif isinstance(obj, list):
            for item in obj:
                if search(item):
                    return True
        return False

    return search(data)


def _flatten_descripcion(value, prefix=""):
    """
    Aplana la estructura de descripcion (similar al frontend) para poder mostrarla en el PDF.
    Devuelve una lista de (label, value).
    """
    entries = []

    if value is None:
        return [("Detalle", "Sin datos")]

    if isinstance(value, list):
        if not value:
            return [("Detalle", "[]")]
        for index, item in enumerate(value):
            new_prefix = f"{prefix}[{index}]" if prefix else f"[{index}]"
            entries.extend(_flatten_descripcion(item, new_prefix))
        return entries

    if isinstance(value, dict):
        for key, val in value.items():
            new_prefix = f"{prefix}.{key}" if prefix else key
            entries.extend(_flatten_descripcion(val, new_prefix))
        return entries

    label = prefix or "Detalle"
    return [(label, str(value))]


def _build_descripcion_text(descripcion: str | None) -> str:
    if not descripcion:
        return "Sin detalle disponible"

    try:
        parsed = json.loads(descripcion)
        entries = _flatten_descripcion(parsed)
        # armo un texto tipo "campo: valor" por línea
        parts = [f"{label}: {val}" for label, val in entries]
        return "<br/>".join(parts)
    except Exception:
        # si no es JSON, devuelvo el texto crudo
        return descripcion


@router.post("/export/pdf")
def export_auditorias_pdf(
    filtros: AuditoriaExportFilters,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    """
    Genera un PDF de auditorías usando solo los filtros enviados desde el frontend.
    Si no hay filtros activos, devuelve todas las auditorías.
    """
    service = AuditoriaService(db)
    items = service.get_auditorias(skip=0, limit=10000)  # límite alto para el reporte

    usuario_filter = (filtros.usuario or "").strip().lower() or None
    entidad_filter = [e.lower() for e in (filtros.entidad or [])]
    accion_filter = [a.lower() for a in (filtros.accion or [])]
    id_transaccion_filter = (filtros.idTransaccion or "").strip().lower() or None
    fecha_desde = filtros.fechaDesde
    fecha_hasta = filtros.fechaHasta

    filtered_items = []
    for item in items:
        usuario_nombre = item.get("UsuarioNombre") or ""
        aud_usuario = item.get("AudUsuario")
        usuario_id = str(aud_usuario) if aud_usuario is not None else ""

        if usuario_filter:
            if (
                usuario_filter not in usuario_nombre.lower()
                and usuario_filter not in usuario_id.lower()
            ):
                continue

        if entidad_filter:
            entidad_val = (item.get("Entidad") or "").lower()
            if entidad_val not in entidad_filter:
                continue

        if accion_filter:
            accion_val = (item.get("Accion") or "").lower()
            if accion_val not in accion_filter:
                continue

        if id_transaccion_filter and not _matches_id_transaccion(
            item.get("Descripcion"), id_transaccion_filter
        ):
            continue

        aud_fecha = item.get("AudFecha")
        if isinstance(aud_fecha, str):
            try:
                aud_fecha_dt = datetime.fromisoformat(aud_fecha)
            except Exception:
                aud_fecha_dt = None
        else:
            aud_fecha_dt = aud_fecha

        if not _matches_date_range(aud_fecha_dt, fecha_desde, fecha_hasta):
            continue

        filtered_items.append(item)

    # Genero PDF version tabla usando ReportLab Platypus
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

    # Título
    title = Paragraph("Reporte de Auditorías", styles["Title"])
    elements.append(title)

    # Resumen de filtros
    resumen = f"Total de registros: {len(filtered_items)}"
    if (
        usuario_filter
        or entidad_filter
        or accion_filter
        or id_transaccion_filter
        or fecha_desde
        or fecha_hasta
    ):
        filtros_text = []
        if usuario_filter:
            filtros_text.append(f"Usuario: {usuario_filter}")
        if entidad_filter:
            filtros_text.append(f"Entidades: {', '.join(entidad_filter)}")
        if accion_filter:
            filtros_text.append(f"Acciones: {', '.join(accion_filter)}")
        if id_transaccion_filter:
            filtros_text.append(f"ID Transacción: {id_transaccion_filter}")
        if fecha_desde:
            filtros_text.append(f"Desde: {fecha_desde.strftime('%d/%m/%Y')}")
        if fecha_hasta:
            filtros_text.append(f"Hasta: {fecha_hasta.strftime('%d/%m/%Y')}")
        resumen += " | Filtros: " + " - ".join(filtros_text)

    elements.append(Spacer(1, 8))
    elements.append(Paragraph(resumen, styles["Normal"]))
    elements.append(Spacer(1, 12))

    # Encabezados de tabla
    data = [
        ["ID", "Fecha", "Acción", "Entidad", "Usuario", "Detalle"],
    ]

    # Filas de datos
    for item in filtered_items:
        fecha_val = item.get("AudFecha")
        if isinstance(fecha_val, datetime):
            fecha_str = fecha_val.strftime("%d/%m/%Y %H:%M:%S")
        elif isinstance(fecha_val, str):
            try:
                fecha_dt = datetime.fromisoformat(fecha_val)
                fecha_str = fecha_dt.strftime("%d/%m/%Y %H:%M:%S")
            except Exception:
                fecha_str = fecha_val
        else:
            fecha_str = ""

        usuario_str = item.get("UsuarioNombre") or item.get("AudUsuario") or ""

        desc_html = _build_descripcion_text(item.get("Descripcion"))
        detalle_para = Paragraph(desc_html, styles["Normal"])

        data.append(
            [
                str(item.get("IdAuditoria", "")),
                fecha_str,
                item.get("Accion") or "",
                item.get("Entidad") or "",
                str(usuario_str),
                detalle_para,
            ]
        )

    # Configuración de tabla
    table = Table(
        data,
        colWidths=[35, 80, 70, 80, 80, 200],
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
        "Content-Disposition": 'attachment; filename="auditorias.pdf"',
        "Content-Type": "application/pdf",
    }

    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
