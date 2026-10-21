# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Mining property management system ("Sistema de Gestión de Propiedad Minera"). Everything lives under `app/`:
- `app/main.py` + `app/backend/`: FastAPI API on SQL Server (SQLAlchemy + pyodbc).
- `app/frontend/`: Angular 20 SPA with Angular Material.

Code, identifiers, comments and UI text are in Spanish. Keep new code in Spanish to match.

## Commands

Backend (run from `app/`, because imports are `backend.*` relative to that directory):
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 9000      # frontend expects port 9000
python backend/database/test_connection.py # DB connectivity check
python backend/scripts/update_req_minero_transacciones.py  # one-off data backfill script
python backend/scripts/migrar_archivos_a_minio.py [--dry-run|--verificar]  # copy local uploads to MinIO / check DB rows against bucket
```
Configuration comes from `app/.env` (see `app/.env-example`): `SQLSERVER_USER/PASSWORD/HOST/PORT/DB`, and `MINIO_ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET/SECURE` for file storage. `FILEROUTE` (default `app/backend/uploads/`) is now only the source folder for the migration script. For local development the S3 server is RustFS (S3/MinIO-compatible; MinIO OSS is no longer maintained), started with `docker compose -f docker-compose.minio.yml --env-file .env up -d` from `app/`. It reuses `MINIO_ACCESS_KEY/SECRET_KEY` as its credentials. Its API is on **9002**, not 9000, because the backend uses 9000; the console is on 9001. You need **ODBC Driver 17 for SQL Server** installed. The backend has no automated test suite.

Frontend (run from `app/frontend/`):
```bash
npm install
npm start                                  # ng serve on :4200
npm run build
npm test                                   # Karma/Jasmine
npx ng test --include src/app/app.spec.ts  # single spec file
```
Prettier settings are in `frontend/package.json` (printWidth 100, singleQuote).

## Backend architecture

Each entity is a vertical slice spread across five folders, all with the same base name:
`controllers/<x>_controller.py` (APIRouter) → `services/<x>_service.py` → `repositories/<x>_repositorie.py` → `models/<x>_model.py` (SQLAlchemy), with Pydantic DTOs in `schemas/<x>_schema.py`. Every new router must be imported and passed to `include_router` in `app/main.py`.

- **File names have typos.** The suffix is `_repositorie.py`, and some files are misspelled further: `expediente_respositorie.py`, `tipo_notifacion_repositorie.py`, `models/req_min_exp.py` (no `_model`). Check the real filename before you import.
- **The database schema already exists.** There are no migrations. Models map onto existing SQL Server tables, with PascalCase column names (`IdActa`, `IdExpediente`, `AudFecha`, `AudUsuario`). Model columns must match the DB exactly.
- **DB sessions:** inject `get_db` from `backend/database/connection.py`. Services take `db` in their constructor and create their own repositories. Repositories call `commit()` themselves.
- **Auth:** `Depends(get_current_user)` (in `services/auth_jwt.py`) protects nearly every endpoint and returns the decoded JWT payload. `require_role(...)` checks the `rol` claim. Login is `POST /usuarios/login`. JWT settings are in `backend/config_jwt.py`.
- **Auditing:** controllers write audit rows explicitly with `AuditLogger(db, current_user).log(accion=..., entidad=..., descripcion=...)` (`services/audit_logger.py`).
- **Transaccion hierarchy (key cross-cutting concept):** the `Transaccion` table links records into a tree (`IdTransaccion`, `IdTransaccionPadre`, `Tabla`, `IdRegistro`). When a service creates a PropiedadMinera, Expediente, Acta, Resolucion and so on, it also creates a `Transaccion` whose parent is the parent entity's transaction, then writes the new `IdTransaccion` back onto the record. Child lookups such as "actas of an expediente" and alerts for a record usually join through `IdTransaccion`/`IdTransaccionPadre` rather than direct FKs. Keep this chain intact when you add entities.
- **List endpoint convention (react-admin style):** list endpoints accept `range=[start,end]` and `filter=<json>` query params, paginate in Python, and set a `Content-Range: <resource> start-end/total` response header. The frontend reads the total from that header, and CORS exposes it in `main.py`.
- **Files:** files live in a MinIO (S3-compatible) bucket, and all access goes through `services/storage_service.py`. `controllers/archivo_controller.py` (`_upload_archivo`) first creates the `Archivo` row, then uploads the object under the key `<entity-folder>/<IdArchivo>_<prefijo>_<name>`. The entity folders are `actas`, `expedientes`, `resoluciones`, `notificaciones`, `propiedad-minera` and `requerimientos`. If the upload fails, the row is deleted. `Archivo.Link` keeps the historical format `/uploads/<key>`, which `StorageService.key_desde_link` maps back to the key. Old rows whose Link is only the folder also resolve. The backend streams files through `/archivos/download` and `/archivos/preview`; the bucket is private and the frontend never talks to MinIO.
- **Requerimientos:** `ReqMinero` (requirement catalog) → `ReqMineroMov` (a requirement instance on a property). `ReqMinExp` links a `ReqMineroMov` to one or more Expedientes. `view_req_min_mov_global` maps a DB view used for global listings.
- PDF reports are built with Jinja2 (`backend/templates/`) and reportlab (`services/expediente_report_service.py`).

## Frontend architecture

- Standalone components with lazy-loaded routes (`src/app/app.routes.ts`). Each feature under `src/app/features/<feature>/` usually has `components/`, `models/`, `services/` and `routes/` (or a `*.routes.ts` file).
- Everything except `/login` renders inside `layout/main-layout.component.ts` (sidebar plus toolbar) behind `AuthGuard`.
- The backend URL is hardcoded as `API_BASE_URL` in `src/app/core/api.constants.ts`.
- Auth (`features/auth/`): the token is stored in `localStorage`. `JwtInterceptor` adds the Bearer header and `AuthErrorInterceptor` handles 401s. Both are registered in `app.config.ts`.
- Dates use Moment with a custom date adapter and formats (`core/custom-moment-date-adapter.ts`, `core/date-formats.ts`, `shared/shared-datepicker.module.ts`).
- Some legacy NgModule files (`app.module.ts`, `app-routing.module.ts`, `features/home/*.module.ts`) remain alongside the standalone bootstrap in `main.ts`/`app.config.ts`. The standalone setup is the one in use.
