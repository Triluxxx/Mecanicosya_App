# Pedido de cambios al backend (mecanicosya-backend)

Ya conectamos el front contra tu API (`/health`, `/service-types`, `/mechanics`, `/sos`, `/payments`,
`/subscriptions` — todo probado y funcionando 👌). El problema es que `users_app` guarda muy poco del
perfil real que la app ya pide en el registro, así que ese perfil se queda solo en el celular y no llega
al backend. Esto es lo que falta, y el por qué de cada cosa:

## 1. Columnas nuevas en `users_app` (perfil de mecánico)

```sql
ALTER TABLE users_app ADD COLUMN specialties TEXT[] DEFAULT '{}';
ALTER TABLE users_app ADD COLUMN vehicle_types TEXT[] DEFAULT '{}';
ALTER TABLE users_app ADD COLUMN ruc TEXT;
ALTER TABLE users_app ADD COLUMN price_per_hour NUMERIC(10,2) DEFAULT 0;
ALTER TABLE users_app ADD COLUMN years_experience INTEGER DEFAULT 0;
ALTER TABLE users_app ADD COLUMN bio TEXT;
ALTER TABLE users_app ADD COLUMN rating NUMERIC(2,1) DEFAULT 5.0;
ALTER TABLE users_app ADD COLUMN total_reviews INTEGER DEFAULT 0;
ALTER TABLE users_app ADD COLUMN has_towing_vehicle BOOLEAN DEFAULT false;
ALTER TABLE users_app ADD COLUMN towing_plate TEXT;
```

**Por qué:** el registro de mecánico en la app ya pide especialidades, tipos de moto, RUC, precio/hora,
años de experiencia, bio, y si tiene vehículo de carga/grúa (eso último define si puede pasar a plan
`expert`). Hoy `users_app` solo tiene `plate`, `verified`, `badge` — nada de esto se está guardando en
el servidor, vive únicamente en AsyncStorage del celular. Si el backend va a ser la fuente real, necesita
estas columnas.

> `has_towing_vehicle`/`towing_plate` son nuevos conceptos que yo agregué del lado del front: el mecánico
> "Experto" no es solo plan pagado, también debe declarar que tiene movilidad de carga para remolque.

## 2. Tabla de reseñas (no existe)

```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  sos_id TEXT NOT NULL REFERENCES sos_requests(id),
  mechanic_id TEXT NOT NULL REFERENCES users_app(id),
  driver_id TEXT NOT NULL REFERENCES users_app(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Endpoint sugerido: `POST /reviews` (crear) y `GET /mechanics/:id/reviews` (listar).

**Por qué:** la app tiene pantalla de "Calificar servicio" después de pagar, pero hoy no hay dónde
guardar esa calificación en el backend — ni tabla ni endpoint. Sin esto, las reseñas son puro adorno
visual del front.

## 3. Tabla/endpoints de repuestos (no existe nada)

```sql
CREATE TABLE parts (
  id TEXT PRIMARY KEY,
  mechanic_id TEXT NOT NULL REFERENCES users_app(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('llanta','camara','cadena','aceite','frenos','otro')),
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Endpoints sugeridos: `GET /parts`, `GET /parts?category=llanta`, `GET /mechanics/:id/parts`,
`POST /parts` (que el mecánico publique algo que vende).

**Por qué:** es la sección nueva de "Repuestos" que agregamos (llantas, cámaras, cadenas, etc. que
venden los mecánicos). Hoy la armé en el front con datos de prueba (mock) porque no hay nada de esto
en el backend — apenas exista, cambio el front para que jale de ahí en vez del mock.

## 4. Filtrar el matching de `/sos` por tipo de falla y plan (mejora, no urgente)

Hoy `POST /sos` asigna siempre al mecánico disponible más cercano, sin importar `serviceTypeId` ni si
es `basic` o `expert`. Para que el plan Experto tenga sentido (atender remolques/fallas complejas como
`svc_grua`), el matching debería priorizar mecánicos `expert` cuando el `serviceTypeId` lo requiera.

**Por qué:** ahora mismo un mecánico Normal puede terminar asignado a un remolque que en teoría solo
debería atender un Experto con grúa — el plan Premium/Experto no cambia nada en la asignación real.

---

Con los puntos 1 y 2 ya el backend cubre el 100% del perfil que la app pide hoy. El punto 3 es necesario
si quieren que Repuestos deje de ser mock. El punto 4 es una mejora de lógica, no bloquea nada.
