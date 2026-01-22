# Deploy Next.js en EC2 sin Docker

## Arquitectura

```
Internet
    ↓
  Nginx (reverse proxy, puerto 80)
    ↓
  Next.js (Node.js + PM2, puerto 3000)
```

---

## Requisitos Previos

- Instancia EC2 (Amazon Linux 2 / 2023)
- Key pair (.pem) para SSH
- Security Group configurado

---

## Paso 1: Conectar al EC2

```bash
ssh -4 -i "my-key.pem" ec2-user@<EC2_PUBLIC_IP>
```

> Reemplaza `my-key.pem` con el nombre de tu archivo de clave y `<EC2_PUBLIC_IP>` con la IP pública de tu instancia.

---

## Paso 2: Instalar Node.js 20

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

Verificar instalación:

```bash
node -v
npm -v
```

---

## Paso 3: Configurar Swap (Recomendado para t2.micro)

Las instancias t2.micro tienen poca RAM (1GB). Agregar swap previene errores de memoria durante el build.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Para hacer el swap permanente (persiste después de reiniciar):

```bash
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

---

## Paso 4: Subir el Proyecto

### Opción A: Clonar desde Git

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### Opción B: Subir con SCP (desde tu máquina local)

```bash
scp -i "my-key.pem" -r ./tu-proyecto ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/
```

---

## Paso 5: Instalar Dependencias

```bash
cd tu-repo
npm install --production=false
```

> `--production=false` asegura que se instalen las devDependencies necesarias para el build.

---

## Paso 6: Build de Next.js

```bash
npm run build
```

Este proceso genera la carpeta `.next` con la aplicación optimizada para producción.

---

## Paso 7: Configurar PM2

PM2 mantiene la aplicación corriendo y la reinicia automáticamente si falla.

### Instalar PM2 globalmente

```bash
sudo npm install -g pm2
```

### Iniciar la aplicación

```bash
pm2 start npm --name "nextjs-app" -- start
```

### Configurar inicio automático

```bash
pm2 save
pm2 startup
```

> Ejecuta el comando que PM2 te indique (generalmente un `sudo env PATH=...`).

### Comandos útiles de PM2

| Comando | Descripción |
|---------|-------------|
| `pm2 list` | Ver aplicaciones corriendo |
| `pm2 logs` | Ver logs en tiempo real |
| `pm2 restart nextjs-app` | Reiniciar la app |
| `pm2 stop nextjs-app` | Detener la app |
| `pm2 delete nextjs-app` | Eliminar la app de PM2 |

---

## Paso 8: Instalar y Configurar Nginx

### Instalar Nginx

```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Crear configuración del proxy

```bash
sudo nano /etc/nginx/conf.d/nextjs.conf
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Reiniciar Nginx

```bash
sudo nginx -t          # Verificar configuración
sudo systemctl restart nginx
```

---

## Paso 9: Configurar Security Group (AWS Console)

### Abrir puerto HTTP (80)

1. Ve a **AWS Console** → **EC2** → **Instances**
2. Selecciona tu instancia
3. Click en la pestaña **Security**
4. Click en el nombre del **Security Group** (ej: `sg-0a1b2c3d...`)
5. Click en **Edit inbound rules**
6. Click en **Add rule**
7. Configura:

| Campo | Valor |
|-------|-------|
| Type | HTTP |
| Protocol | TCP |
| Port range | 80 |
| Source | Anywhere-IPv4 (0.0.0.0/0) |

8. Click en **Save rules**

---

## Paso 10: Obtener la IP Pública

### Desde AWS Console

1. Ve a **EC2** → **Instances**
2. Selecciona tu instancia
3. En el panel inferior, busca:
   - **Public IPv4 address**: `3.25.67.89`
   - **Public IPv4 DNS**: `ec2-3-25-67-89.compute-1.amazonaws.com`

### Acceder a la aplicación

```
http://<EC2_PUBLIC_IP>
```

o

```
http://ec2-X-X-X-X.compute-1.amazonaws.com
```

---

## Troubleshooting

### La app no carga

```bash
# Verificar que PM2 está corriendo
pm2 list

# Ver logs de la aplicación
pm2 logs nextjs-app

# Verificar que Nginx está activo
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Error de memoria durante build

```bash
# Verificar swap activo
free -h

# Si no hay swap, crearlo (ver Paso 3)
```

### Puerto 80 no accesible

- Verificar Security Group en AWS Console
- Verificar que Nginx está corriendo: `sudo systemctl status nginx`

### Reiniciar todo después de cambios

```bash
pm2 restart nextjs-app
sudo systemctl restart nginx
```

---

## Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
cd tu-repo
git pull                    # Si usas git
npm install                 # Si hay nuevas dependencias
npm run build               # Rebuild
pm2 restart nextjs-app      # Reiniciar
```

---

## Resumen de Puertos

| Servicio | Puerto | Acceso |
|----------|--------|--------|
| SSH | 22 | Tu IP o 0.0.0.0/0 |
| HTTP (Nginx) | 80 | 0.0.0.0/0 |
| Next.js | 3000 | Solo localhost |

---

## Recomendaciones

### Para t2.micro (1GB RAM)

- Siempre configurar swap (2GB)
- NO usar Docker
- NO usar Turbopack
- Evitar builds paralelos

### Cuándo usar Docker

- Instancias t3.medium o superiores
- Despliegues en ECS/EKS
- Necesidad de autoscaling
- Ambientes de producción con múltiples servicios

---

## Comandos de Referencia Rápida

```bash
# Conectar
ssh -4 -i "my-key.pem" ec2-user@<IP>

# PM2
pm2 list
pm2 logs
pm2 restart nextjs-app

# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# Logs
pm2 logs nextjs-app
sudo tail -f /var/log/nginx/error.log
```
