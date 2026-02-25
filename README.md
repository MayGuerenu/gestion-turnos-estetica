# Gestión de Turnos – Estética (PP2)
Este proyecto fue desarrollado como trabajo práctico final de la materia Práctica Profesionalizante 2.
Consiste en una aplicación web full stack orientada a la gestión de turnos para un centro de estética.
La aplicación permite registrar usuarios, administrar clientes y gestionar turnos, evitando solapamientos de horarios.
En esta implementación se adaptó el sistema para servicios de uñas, cejas y pestañas, aunque su estructura permite ser extendida a otros rubros.

## Problemática
En un emprendimiento de estética, el manejo manual de agenda (WhatsApp/cuaderno) suele generar:
- turnos superpuestos
- dificultad para visualizar la agenda diaria
- falta de historial de clientes

## Objetivo
Desarrollar un gestor de turnos que permita:
- autenticación de usuarios (admin)
- alta/edición/baja de clientes
- alta/edición/cancelación de turnos
- validación de disponibilidad horaria (sin solapamientos)
- visualización clara de agenda por día (timeline) + mini calendario

## Tecnologías
- Node.js + Express
- Supabase (PostgreSQL)
- JWT (jsonwebtoken)
- bcrypt (hash de contraseñas)
- Zod (validación)
- Frontend: HTML + Tailwind CDN + JavaScript

## Funcionalidades
### Autenticación
- Registro: `POST /api/auth/register`
- Login: `POST /api/auth/login` (devuelve token JWT)
- Logout: se realiza en cliente (eliminando token)

### Clientes (protegido con JWT)
- Listar: `GET /api/clients`
- Crear: `POST /api/clients`
- Editar: `PUT /api/clients/:id`
- Eliminar: `DELETE /api/clients/:id`

### Turnos (protegido con JWT)
- Listar: `GET /api/appointments?date=YYYY-MM-DD&status=...`
- Crear: `POST /api/appointments`
- Editar: `PUT /api/appointments/:id`
- Cancelar: `DELETE /api/appointments/:id` (cambia estado a cancelado)

## Regla de negocio principal (anti-solapamiento)
Al crear o editar un turno, el sistema valida que el rango horario no se superponga con turnos “pendiente” o “confirmado” del mismo día para el mismo usuario.

## Panel Administrador

Acceso exclusivo para usuarios con rol "admin".

Funcionalidades:
- Métricas generales (usuarios, clientes, turnos)
- Próximos turnos (no cancelados)
- Gestión de días bloqueados
- Reportes por rango de fechas:
  - Resumen (total, pendiente, confirmado, cancelado)
  - Servicios más solicitados

## Profesionales (Staff)

Cada turno se asigna a un profesional.

Tabla: `staff`
- id (uuid)
- user_id (uuid)
- name
- active
- created_at

Los turnos incluyen:
- staff_id (FK)

La validación de solapamiento se realiza por profesional.

## Validaciones implementadas

- No se permiten turnos superpuestos por profesional.
- No se permiten turnos en días bloqueados.
- Rutas protegidas mediante JWT.
- Acceso a /admin restringido por rol.

## Instalación y ejecución
1. Clonar el repositorio  
2. Instalar dependencias:
   ```bash
   npm install

3. Crear un archivo .env en la raíz del proyecto con las siguientes variables: 
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=

4. Ejecutar el servidor: 
   ```bash npm
      run dev

5. Abrir en el navegador:
 http://localhost:3000

