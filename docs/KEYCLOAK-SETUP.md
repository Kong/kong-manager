# Keycloak Setup - ApiRuler Manager

Bu dokuman, ApiRuler Manager icin Keycloak kurulumunu ve yapilandirmasini aciklar.

## Hizli Baslangic

Tek komutla tum sistemi baslatin:

```bash
# Yontem 1: Init script ile (onerilir)
./init.sh

# Yontem 2: Direkt docker-compose ile
docker-compose up -d
```

Bu komut otomatik olarak:
1. Keycloak container'ini baslatir
2. Custom theme'i (apiruler) yukler
3. SSL requirement'i kapatir
4. vue-spa client'ini olusturur
5. Login theme'i apiruler olarak ayarlar

## Sistem Mimarisi

### Docker Compose Servisleri

1. **keycloak**: Ana Keycloak sunucusu
   - Port: 7080 (host) -> 8080 (container)
   - Database: H2 (embedded, persistent volume)
   - Theme: apiruler (custom)
   - Health check: /health/ready endpoint

2. **keycloak-init**: Initialization servisi
   - Keycloak hazir olana kadar bekler
   - Realm ve client ayarlarini yapar
   - Sadece bir kere calisir (restart: no)

### Volumes

- **keycloak-data**: Keycloak database ve konfigurasyonu
  - Persist edilir
  - docker-compose down -v ile silinmedikce ayarlar korunur

### Dosya Yapisi

```
apiruler-manager/
├── docker-compose.yml          # Docker Compose konfigurasyonu
├── keycloak-init.sh            # Initialization script
└── keycloak-theme/
    └── apiruler/
        └── login/
            ├── theme.properties
            ├── login.ftl
            └── resources/
                ├── css/login.css
                └── img/apiruler-logo.svg
```

## Keycloak Ayarlari

### Realm Ayarlari

- **Realm**: master
- **SSL Required**: NONE (HTTP destegi aktif)
- **Login Theme**: apiruler
- **Admin User**: admin / admin

### Client Ayarlari (vue-spa)

- **Client ID**: vue-spa
- **Client Type**: Public
- **Valid Redirect URIs**: http://localhost:8080/*
- **Web Origins**: http://localhost:8080
- **Direct Access Grants**: Enabled (ROPC flow icin)
- **Standard Flow**: Enabled (Authorization Code flow icin)

## Kullanim

### Baslatma

```bash
# Ilk kez baslatma
docker-compose up -d

# Loglari izleme
docker-compose logs -f keycloak
docker-compose logs -f keycloak-init
```

### Durdurma

```bash
# Container'lari durdur (ayarlar korunur)
docker-compose down

# Container'lari durdur ve volume'leri sil (ayarlar sifirlanir)
docker-compose down -v
```

### Yeniden Baslatma

```bash
# Restart (ayarlar korunur)
docker-compose restart keycloak

# Tamamen yeniden olustur
docker-compose down
docker-compose up -d
```

## Erisim Bilgileri

- **Admin Console**: http://localhost:7080
- **Username**: admin
- **Password**: admin
- **Realm**: master
- **Token Endpoint**: http://localhost:7080/realms/master/protocol/openid-connect/token

## Init Script Detaylari

`keycloak-init.sh` scripti asagidaki islemleri yapar:

1. **Health Check**: Keycloak'un /health/ready endpoint'ine istek atar
   - 120 saniye timeout
   - 2 saniyede bir kontrol eder

2. **Admin Login**: kcadm.sh ile admin olarak giris yapar

3. **SSL Kapat**: Realm settings'te sslRequired=NONE ayarlar

4. **Client Olustur**: vue-spa client'ini kontrol eder
   - Yoksa olusturur
   - Varsa atlar (idempotent)

5. **Theme Ayarla**: Login theme'i apiruler olarak ayarlar

## Troubleshooting

### Keycloak baslamiyor

```bash
# Loglari kontrol et
docker logs keycloak

# Container durumunu kontrol et
docker ps -a | grep keycloak

# Healthcheck durumunu kontrol et
docker inspect keycloak | grep -A 10 Health
```

### Init script calismadi

```bash
# Init loglarina bak
docker logs keycloak-init

# Manuel calistir
docker-compose up keycloak-init
```

### "Database is read only" hatasi

Database bozulmus olabilir. Sifirdan baslatın:

```bash
docker-compose down -v
docker-compose up -d
```

### HTTPS required hatasi

Init script calismamiş olabilir:

```bash
# Manuel olarak SSL'i kapat
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8080 --realm master --user admin --password admin

docker exec keycloak /opt/keycloak/bin/kcadm.sh update realms/master \
    -s sslRequired=NONE
```

### Theme gorunmuyor

```bash
# Theme dosyalarini kontrol et
docker exec keycloak ls -la /opt/keycloak/themes/apiruler/login/

# Cache'i temizle
docker restart keycloak
```

## Yeni Makinede Kurulum

Baska bir makinede ayni ortami kurmak icin:

1. Repository'i clone'la:
```bash
git clone <repo-url>
cd apiruler-manager
```

2. Docker Compose'u baslat:
```bash
docker-compose up -d
```

3. Init scriptinin tamamlanmasini bekle:
```bash
docker-compose logs -f keycloak-init
```

4. Admin Console'a giris yap:
```bash
open http://localhost:7080
```

Tum ayarlar otomatik olarak yapilacaktir!

## Production Notlari

Bu konfigürasyon development icin hazirlanmistir. Production'da asagidaki degisiklikleri yapin:

1. **HTTPS**: SSL sertifikasi kullanin
2. **Database**: PostgreSQL veya MySQL kullanin (H2 yerine)
3. **Admin Sifre**: Guclu sifre kullanin
4. **Environment Variables**: Hassas bilgileri .env dosyasinda saklayin
5. **Resource Limits**: CPU ve memory limitleri ekleyin
6. **Backup**: Database'i duzenli olarak yedekleyin

## Ek Kaynaklar

- Keycloak Dokumantasyonu: https://www.keycloak.org/documentation
- Custom Theme Guide: https://www.keycloak.org/docs/latest/server_development/#_themes
- Docker Compose Reference: https://docs.docker.com/compose/compose-file/
