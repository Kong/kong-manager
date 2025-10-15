#!/bin/bash
# Keycloak Initialization Script
# Bu script Keycloak basladiktan sonra gerekli ayarlari yapar

set -e

echo "Keycloak initialization basladi..."

# Keycloak'un hazir olmasini bekle
echo "Keycloak'un baslamasi bekleniyor..."
timeout=120
elapsed=0
while true; do
    # /dev/tcp kullanarak port kontrolu
    if (echo > /dev/tcp/localhost/8080) >/dev/null 2>&1; then
        echo "Keycloak portu acik, 10 saniye daha bekleniyor..."
        sleep 10
        break
    fi

    if [ $elapsed -ge $timeout ]; then
        echo "HATA: Keycloak baslamadi (timeout: ${timeout}s)"
        exit 1
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "   Bekleniyor... (${elapsed}s)"
done

echo "Keycloak hazir!"

# kcadm.sh ile login
echo "Admin olarak giris yapiliyor..."
/opt/keycloak/bin/kcadm.sh config credentials \
    --server http://localhost:8080 \
    --realm master \
    --user admin \
    --password admin

# SSL Requirement'i kapat
echo "SSL requirement kapatiliyor..."
/opt/keycloak/bin/kcadm.sh update realms/master \
    -s sslRequired=NONE

# vue-spa client'ini kontrol et ve yoksa olustur
echo "vue-spa client kontrol ediliyor..."
CLIENT_ID=$(/opt/keycloak/bin/kcadm.sh get clients -r master -q clientId=vue-spa --fields id --format csv --noquotes 2>/dev/null || echo "")

if [ -z "$CLIENT_ID" ]; then
    echo "vue-spa client olusturuluyor..."
    /opt/keycloak/bin/kcadm.sh create clients -r master \
        -s clientId=vue-spa \
        -s enabled=true \
        -s publicClient=true \
        -s 'redirectUris=["http://localhost:8080/*"]' \
        -s 'webOrigins=["http://localhost:8080"]' \
        -s directAccessGrantsEnabled=true \
        -s standardFlowEnabled=true
    echo "vue-spa client olusturuldu"
else
    echo "vue-spa client zaten mevcut (ID: $CLIENT_ID)"
fi

# Login theme'i apiruler olarak ayarla
echo "Login theme ayarlaniyor..."
/opt/keycloak/bin/kcadm.sh update realms/master \
    -s 'loginTheme=apiruler'

# jekirdek kullanicisini kontrol et ve yoksa olustur
echo "jekirdek kullanicisi kontrol ediliyor..."
USER_ID=$(/opt/keycloak/bin/kcadm.sh get users -r master -q username=jekirdek --fields id --format csv --noquotes 2>/dev/null || echo "")

if [ -z "$USER_ID" ]; then
    echo "jekirdek kullanicisi olusturuluyor..."
    /opt/keycloak/bin/kcadm.sh create users -r master \
        -s username=jekirdek \
        -s enabled=true \
        -s email=jekirdek@apiruler.com

    # Kullanici ID'sini al
    USER_ID=$(/opt/keycloak/bin/kcadm.sh get users -r master -q username=jekirdek --fields id --format csv --noquotes)

    # Sifre ata
    /opt/keycloak/bin/kcadm.sh set-password -r master --username jekirdek --new-password jekirdek123

    # Admin rolunu ata
    /opt/keycloak/bin/kcadm.sh add-roles -r master --uusername jekirdek --rolename admin

    echo "jekirdek kullanicisi olusturuldu ve admin rolu atandi"
else
    echo "jekirdek kullanicisi zaten mevcut (ID: $USER_ID)"
fi

echo ""
echo "Keycloak initialization tamamlandi!"
echo "Admin Console: http://localhost:7080"
echo "Kullanicilar:"
echo "  - admin / admin (super admin)"
echo "  - jekirdek / jekirdek123 (admin)"
echo "Theme: apiruler"
echo "Client: vue-spa"
