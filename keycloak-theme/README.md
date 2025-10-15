# ApiRuler Keycloak Theme - Kurulum Rehberi

Bu klasor, ApiRuler Manager'in ozel Keycloak login tema dosyalarini icerir.

## Klasor Yapisi

```
keycloak-theme/
└── apiruler/
    └── login/
        ├── theme.properties      # Tema konfigurasyonu
        ├── login.ftl             # Login sayfasi HTML template
        └── resources/
            ├── css/
            │   └── login.css     # Login sayfasi CSS
            └── img/
                └── apiruler-logo.svg  # ApiRuler logosu
```

## Kurulum Yontemleri

### Yontem 1: Docker Container'a Mount (Onerilir)

Eger Keycloak'u Docker ile calistiriyorsaniz:

```bash
# Docker Compose ile
version: '3'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    volumes:
      - ./keycloak-theme/apiruler:/opt/keycloak/themes/apiruler
    ports:
      - "7080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev
```

```bash
# Docker run ile
docker run -d \
  -p 7080:8080 \
  -v $(pwd)/keycloak-theme/apiruler:/opt/keycloak/themes/apiruler \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

### Yontem 2: Keycloak Sunucusuna Kopyala

Eger Keycloak standalone calisiyorsa:

```bash
# Tema klasorunu Keycloak'un themes klasorune kopyala
cp -r keycloak-theme/apiruler /opt/keycloak/themes/

# veya manuel olarak:
# 1. Keycloak kurulum klasorunu bul (ornek: /opt/keycloak)
# 2. themes/ alt klasorunu ac
# 3. apiruler/ klasorunu buraya kopyala
```

### Yontem 3: JAR Dosyasi Olarak Deploy

```bash
# Tema klasorunu JAR olarak paketle
cd keycloak-theme
jar -cvf apiruler-theme.jar -C apiruler .

# JAR dosyasini Keycloak'un deployments klasorune kopyala
cp apiruler-theme.jar /opt/keycloak/providers/
```

## Temayi Aktif Et

1. **Keycloak Admin Console'a giris yap:**
   - URL: http://localhost:7080
   - Username: admin
   - Password: admin

2. **Realm Settings'e git:**
   - Sol menuden "Realm Settings" tikla

3. **Themes sekmesine gec:**
   - "Themes" tab'ina tikla

4. **Login Theme'i ayarla:**
   - "Login theme" dropdown'undan **"apiruler"** sec
   - "Save" butonuna tikla

5. **Test et:**
   - Logout yap veya incognito window ac
   - Login sayfasina git
   - ApiRuler tasarimini gormelisin!

## Troubleshooting

### Tema gorunmuyor mu?

1. **Keycloak'u yeniden baslat:**
   ```bash
   docker restart keycloak
   # veya standalone icin:
   /opt/keycloak/bin/kc.sh restart
   ```

2. **Cache temizle:**
   - Admin Console → Realm Settings → Themes → Cache → Clear

3. **Klasor yapisini kontrol et:**
   ```bash
   ls -la /opt/keycloak/themes/apiruler/login/
   # Beklenen:
   # - theme.properties
   # - login.ftl
   # - resources/css/login.css
   # - resources/img/apiruler-logo.svg
   ```

4. **Log dosyalarini incele:**
   ```bash
   docker logs keycloak
   # veya
   tail -f /opt/keycloak/data/log/keycloak.log
   ```

### CSS degisiklikleri gorunmuyor mu?

1. **Browser cache'i temizle:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) veya Cmd+Shift+R (Mac)

2. **Keycloak theme cache'i temizle:**
   - Admin Console → Realm Settings → Themes → Cache → Clear

3. **Dev mode'da calistir:**
   ```bash
   # Cache'i devre disi birak (development icin)
   docker run -e KC_SPI_THEME_STATIC_MAX_AGE=-1 ...
   ```

## Ozellestirme

### CSS Degisiklikleri

`resources/css/login.css` dosyasini duzenle:

```css
/* Ornek: Primary rengi degistir */
.login-button {
  background: #CA3433;  /* Yeni renk */
}
```

### Logo Degistir

`resources/img/apiruler-logo.svg` dosyasini degistir veya farkli bir logo kullan:

```html
<!-- login.ftl icinde -->
<img src="${url.resourcesPath}/img/yeni-logo.svg" alt="Logo">
```

### Metin Degisiklikleri

`login.ftl` dosyasini duzenle:

```html
<!-- Baslik degistir -->
<h2>Yeni Baslik</h2>
<p>Yeni alt baslik</p>
```

## Vue App'i Guncelle

Keycloak Custom Theme'i aktif ettikten sonra, Vue app'inizde ROPC flow'u devre disi birakin:

```typescript
// main.ts'i guncelle
keycloak.init({
  onLoad: 'login-required',  // check-sso yerine
  pkceMethod: 'S256',
  checkLoginIframe: false,
});
```

## Notlar

- Bu tema Keycloak 21+ ile test edilmistir
- Login.vue'daki tasarim birebir kopyalanmistir
- Responsive tasarim dahildir (mobil uyumlu)
- Turkceleştirme mevcuttur
- "Sifremi Unuttum" linki eklenmiştir

## Destek

Sorun yasarsan:
1. Keycloak log dosyalarini kontrol et
2. Browser console'u ac (F12)
3. Network tab'inda CSS/img dosyalarinin yuklendigini kontrol et
4. Tema klasor yapisini kontrol et

## Sonraki Adimlar

Theme aktif olduktan sonra:
1. Vue app'inde ROPC kodunu kaldir (guvenlik icin)
2. main.ts'i guncelle (`login-required` mode)
3. Login.vue sayfasini kaldir (artik gerek yok)
4. router.ts'teki login route'unu kaldir
