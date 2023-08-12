# Next.js Teslo Shop

Para correr localmente, se necesita la base de datos

```
docker-compose up -d
```

- El -d, significa **detached**

- MongoDB URL Local:

```
MONGO_URL=mongodb://localhost:27017/teslodb
```

## Configurar las variables de entorno:

Renombrar el archivo **.env.template** a **.env**

## Llenar DB con información de pruebas

LLamar:

```
    http://localhost:27017/api/seed
```
