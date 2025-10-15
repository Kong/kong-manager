#!/bin/bash
# ApiRuler Manager Initialization Script
# Keycloak ve diger servisleri baslatir

set -e

echo "ApiRuler Manager initialization basladi..."

# Docker Compose ile tum servisleri baslat
echo "Docker Compose servisleri baslatiliyor..."
docker-compose up -d

echo ""
echo "ApiRuler Manager servisleri baslatildi!"
echo ""
echo "Keycloak hazir olana kadar bekleyin (60-90 saniye surebildi)."
echo "Durum kontrolu:"
echo "  docker-compose ps"
echo ""
echo "Keycloak loglari:"
echo "  docker-compose logs -f keycloak"
echo ""
echo "Init script loglari:"
echo "  docker-compose logs -f keycloak-init"
echo ""
echo "Erisim:"
echo "  Keycloak Admin Console: http://localhost:7080"
echo "  Username: admin"
echo "  Password: admin"
