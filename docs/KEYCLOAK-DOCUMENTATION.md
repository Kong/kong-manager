# Keycloak Dokumantasyonu - ApiRuler Manager

Bu dokuman, ApiRuler Manager projesinde Keycloak entegrasyonunu ve kulanimini detayli olarak aciklar.

## Icerik

1. [Keycloak Nedir?](#keycloak-nedir)
2. [Docker Compose ile Kurulum](#docker-compose-ile-kurulum)
3. [Temel Kavramlar](#temel-kavramlar)
4. [Admin Console Kullanimi](#admin-console-kullanimi)
5. [Kullanici Yonetimi](#kullanici-yonetimi)
6. [Client Yapilandirmasi](#client-yapilandirmasi)
7. [Guvenlik ve Sifrelemeler](#guvenlik-ve-sifrelemeler)
8. [Proje Entegrasyonu](#proje-entegrasyonu)
9. [Custom Theme](#custom-theme)
10. [Sorun Giderme](#sorun-giderme)

---

## Keycloak Nedir?

Keycloak, acik kaynakli bir kimlik dogrulama ve yetkilendirme sunucusudur (Identity and Access Management - IAM).

### Temel Ozellikleri

- **Single Sign-On (SSO)**: Kullanicilar bir kez giris yapar, tum uygulamalara erisir
- **Social Login**: Google, Facebook, GitHub gibi platformlarla giris
- **User Federation**: LDAP, Active Directory entegrasyonu
- **Multi-Factor Authentication (MFA)**: 2FA, OTP destegi
- **Role-Based Access Control (RBAC)**: Rol tabanli yetkilendirme
- **OAuth 2.0 ve OpenID Connect**: Modern authentication standartlari

### Neden Keycloak?

- Kendi authentication sistemimizi yazmaktan kurtulur
- Guclu guvenlik ozellikleri hazir gelir
- Kullanici yonetimi merkezi bir yerden yapilir
- Sifre politikalari, hesap kilitleme, audit loglari hazir
- Production-ready, enterprise seviyesinde

---

## Docker Compose ile Kurulum

### Dosya Yapisi

```
apiruler-manager/
├── docker-compose.yml
├── keycloak-init.sh
├── init.sh
└── keycloak-theme/
    └── apiruler/
        └── login/
```

### docker-compose.yml

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.4.0
    container_name: keycloak
    ports:
      - "7080:8080"
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin
      KC_HTTP_ENABLED: "true"
      KC_HOSTNAME_STRICT: "false"
      KC_HOSTNAME_STRICT_HTTPS: "false"
    volumes:
      - ./keycloak-theme/apiruler:/opt/keycloak/themes/apiruler
      - ./keycloak-init.sh:/opt/keycloak/bin/init.sh
      - keycloak-data:/opt/keycloak/data
    command: start-dev
    restart: unless-stopped

  keycloak-init:
    image: quay.io/keycloak/keycloak:26.4.0
    container_name: keycloak-init
    depends_on:
      - keycloak
    entrypoint: ["/bin/bash", "/opt/keycloak/bin/init.sh"]
    volumes:
      - ./keycloak-init.sh:/opt/keycloak/bin/init.sh
    network_mode: "service:keycloak"
    restart: "no"

volumes:
  keycloak-data:
```

### Ortam Degiskenleri

| Degisken | Aciklama | Deger |
|----------|----------|-------|
| `KC_BOOTSTRAP_ADMIN_USERNAME` | Ilk admin kullanicisi | admin |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | Admin sifresi | admin |
| `KC_HTTP_ENABLED` | HTTP destegi | true |
| `KC_HOSTNAME_STRICT` | Hostname kontrolu | false |
| `KC_HOSTNAME_STRICT_HTTPS` | HTTPS zorunlulugu | false |

### Baslangic

```bash
# Yontem 1: Init script ile
./init.sh

# Yontem 2: Direkt docker-compose
docker-compose up -d

# Durum kontrolu
docker-compose ps

# Loglari izle
docker-compose logs -f keycloak
docker-compose logs -f keycloak-init

# Durdur
docker-compose down

# Tamamen temizle (database dahil)
docker-compose down -v
```

### Otomatik Yapilandirma

`keycloak-init` servisi asagidaki islemleri otomatik yapar:

1. Keycloak'un baslamasini bekler
2. Admin olarak giris yapar
3. SSL requirement'i kapatir (development icin)
4. `vue-spa` client'ini olusturur
5. ApiRuler login theme'ini aktif eder
6. `jekirdek` kullanicisini olusturur

---

## Temel Kavramlar

### Realm (Alan)

Realm, kullanicilari, rolleri, uygulamalari ve ayarlari iceren izole bir alandir.

- **master realm**: Keycloak'un kendi admin realm'i
- Farkli projeler icin farkli realm'ler olusturulabilir
- Realm'ler birbirinden tamamen izoledir

**Bizim kullanim:**
- Realm: `master`
- Neden master? Basit bir proje oldugu icin ayri realm olusturmadik

### Client (Istemci)

Client, Keycloak'a baglanan bir uygulamayi temsil eder.

**Client Tipleri:**
- **Public Client**: Browser-based uygulamalar (SPA, React, Vue)
- **Confidential Client**: Backend uygulamalar (API, Server)

**Bizim client:**
- Client ID: `vue-spa`
- Type: Public (browser-based Vue.js uygulamasi)

### User (Kullanici)

Keycloak'ta oturum acabilecek kisiler.

**Bizim kullanicilar:**
- `admin` / `admin` - Super admin
- `jekirdek` / `jekirdek123` - Admin

### Role (Rol)

Kullanicilara atanan yetki tanimi.

**Rol Turleri:**
- **Realm Roles**: Tum realm icin gecerli
- **Client Roles**: Sadece belirli bir client icin

**Bizim roller:**
- `admin` - Yonetici rolu

### Token (Jeton)

Kullanici kimlik bilgilerini iceren sifrelenmis veri.

**Token Turleri:**
- **Access Token**: API'lara erisim icin
- **Refresh Token**: Access token'i yenilemek icin
- **ID Token**: Kullanici bilgilerini iceren

---

## Admin Console Kullanimi

### Erisim

```
URL: http://localhost:7080
Username: admin
Password: admin
```

### Ana Sayfa

Sol menude:
- **Realm Settings**: Realm genel ayarlari
- **Clients**: Uygulamalar
- **Users**: Kullanicilar
- **Groups**: Gruplar
- **Roles**: Roller
- **Authentication**: Kimlik dogrulama ayarlari
- **Sessions**: Aktif oturumlar

### Realm Settings

#### General Tab
- **Realm ID**: master
- **Display name**: Master
- **HTML Display name**: HTML formatinda isim
- **Frontend URL**: Kullanicilarin eristigi URL
- **Require SSL**: NONE (development icin)
- **User Managed Access**: Kapalı

#### Login Tab
- **User registration**: Kullanicilarin kayit olabilmesi
- **Forgot password**: Sifre sifirlama
- **Remember me**: Beni hatirla
- **Verify email**: Email dogrulama
- **Login with email**: Email ile giris

#### Themes Tab
- **Login theme**: apiruler (bizim custom theme)
- **Account theme**: keycloak.v2
- **Admin theme**: keycloak.v2
- **Email theme**: keycloak

#### Tokens Tab
- **Access Token Lifespan**: 5 dakika (varsayilan)
- **Refresh Token Lifespan**: 30 dakika
- **SSO Session Idle**: 30 dakika
- **SSO Session Max**: 10 saat

---

## Kullanici Yonetimi

### Kullanici Ekleme (Admin Console)

1. Sol menuden **Users** tikla
2. **Add user** butonuna tikla
3. Bilgileri doldur:
   - Username: zorunlu
   - Email: opsiyonel
   - First name: opsiyonel
   - Last name: opsiyonel
   - Enabled: ON (aktif kullanici)
4. **Create** tikla
5. **Credentials** sekmesine gec
6. **Set password** tikla:
   - Password: sifreyi gir
   - Password confirmation: tekrarla
   - Temporary: OFF (kalici sifre)
7. **Save** tikla
8. **Role Mappings** sekmesine gec
9. **Assign role** tikla
10. Rol sec (ornek: admin)
11. **Assign** tikla

### Kullanici Ekleme (CLI ile)

```bash
# Container'a baglan
docker exec -it keycloak bash

# Admin olarak giris
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin

# Kullanici olustur
/opt/keycloak/bin/kcadm.sh create users -r master \
  -s username=testuser \
  -s enabled=true \
  -s email=testuser@example.com

# Sifre ata
/opt/keycloak/bin/kcadm.sh set-password -r master \
  --username testuser \
  --new-password testpass123

# Rol ata
/opt/keycloak/bin/kcadm.sh add-roles -r master \
  --uusername testuser \
  --rolename admin
```

### Kullanici Duzenleme

1. **Users** menusune git
2. Kullaniciyi bul ve tikla
3. Bilgileri duzenle
4. **Save** tikla

### Kullanici Silme

1. **Users** menusune git
2. Kullaniciyi sec
3. **Actions** dropdown'undan **Delete** sec
4. Onay ver

### Kullanici Aktif/Pasif Yapma

1. Kullanici detay sayfasina git
2. **Enabled** toggle'i OFF yap
3. **Save** tikla

### Sifre Sifirlama

#### Admin tarafindan:
1. Kullanici sayfasina git
2. **Credentials** sekmesi
3. **Reset password** tikla
4. Yeni sifreyi gir
5. **Temporary** ON ise kullanici ilk giriste degistirmek zorunda

#### Kullanici tarafindan:
1. Login sayfasinda "Forgot password" linkine tikla
2. Email gir
3. Email'den gelen linke tikla
4. Yeni sifre ata

---

## Client Yapilandirmasi

### vue-spa Client Ayarlari

#### General Settings
- **Client ID**: vue-spa
- **Name**: Vue SPA Application
- **Description**: ApiRuler Manager Frontend
- **Enabled**: ON

#### Access Settings
- **Root URL**: http://localhost:8080
- **Valid Redirect URIs**: http://localhost:8080/*
- **Valid Post Logout Redirect URIs**: http://localhost:8080
- **Web Origins**: http://localhost:8080
- **Admin URL**: http://localhost:8080

#### Capability Config
- **Client authentication**: OFF (public client)
- **Authorization**: OFF
- **Standard flow**: ON (Authorization Code Flow)
- **Direct access grants**: ON (ROPC - Resource Owner Password Credentials)
- **Implicit flow**: OFF
- **Service accounts roles**: OFF

### Authorization Code Flow vs ROPC

#### Authorization Code Flow (Guvenli - Onerilir)
```
1. Kullanici Login butonuna tiklar
2. Keycloak login sayfasina yonlendirilir
3. Kullanici sifresini Keycloak'a girer
4. Keycloak authorization code doner
5. Frontend code'u token ile degistirir
6. Frontend token'i saklar
```

**Avantajlari:**
- Sifre hicbir zaman frontend'e gelmez
- XSS saldirilarindan korunur
- OAuth 2.0 standardi

#### ROPC Flow (Riskli - Development icin)
```
1. Kullanici username/password girer (frontend form)
2. Frontend sifre ve username'i Keycloak'a gonderir
3. Keycloak token doner
4. Frontend token'i saklar
```

**Riskleri:**
- Sifre frontend'e giriyor
- XSS saldirilarinda sifre calinabilir
- OAuth 2.0'da deprecated

**Bizim kullanim:**
- Custom login UI istedigimiz icin ROPC kullaniyoruz
- Production'da Authorization Code Flow'a gecilmeli

### Client Secret (Confidential Client icin)

Public client oldugu icin secret yok. Confidential olsaydi:

```javascript
// Backend'de kullanilir
const tokenResponse = await fetch(tokenUrl, {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: 'backend-api',
    client_secret: 'super-secret-key'
  })
})
```

---

## Guvenlik ve Sifrelemeler

### Token Sifrelemesi

Keycloak, token'lari **RS256** (RSA + SHA-256) algoritmasi ile imzalar.

**Token Yapisi:**
```
header.payload.signature
```

**Header:**
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id"
}
```

**Payload (Claims):**
```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "unique-id",
  "iss": "http://localhost:7080/realms/master",
  "aud": ["master-realm", "account"],
  "sub": "user-id",
  "typ": "Bearer",
  "azp": "vue-spa",
  "sid": "session-id",
  "preferred_username": "jekirdek",
  "email": "jekirdek@apiruler.com",
  "realm_access": {
    "roles": ["admin"]
  }
}
```

### Sifre Hashleme

Keycloak varsayilan olarak **PBKDF2** (Password-Based Key Derivation Function 2) kullanir.

**Ayarlar (Realm Settings > Security Defenses > Brute Force Detection):**
- **Hash Algorithm**: pbkdf2-sha256
- **Hash Iterations**: 27,500
- **Max Login Failures**: 30
- **Wait Increment**: 60 seconds
- **Quick Login Check**: 1000ms
- **Minimum Quick Login Wait**: 60 seconds

### HTTPS Zorunlulugu

Production'da HTTPS zorunlu olmali:

```yaml
environment:
  KC_HOSTNAME_STRICT_HTTPS: "true"
```

Development'ta kapali:
```yaml
environment:
  KC_HOSTNAME_STRICT_HTTPS: "false"
```

Admin Console'dan da ayarlanabilir:
- Realm Settings > General > Require SSL: external requests

### CORS Ayarlari

Client ayarlarinda:
- **Web Origins**: http://localhost:8080

Bu ayar, frontend'in token endpoint'e CORS istegi yapabilmesini saglar.

---

## Proje Entegrasyonu

### Dosya Yapisi

```
src/
├── keycloak.ts              # Keycloak instance ve fonksiyonlar
├── main.ts                  # App entry point
├── stores/
│   └── auth.ts              # Authentication store
├── composables/
│   └── useAuth.ts           # Auth composable
├── pages/
│   └── auth/
│       └── Login.vue        # Login sayfasi (su an kullanilmiyor)
└── components/
    └── UserMenuTopRight.vue # User dropdown menu
```

### keycloak.ts

```typescript
import Keycloak from 'keycloak-js'

// Keycloak instance
export const keycloak = new Keycloak({
  url: 'http://localhost:7080',
  realm: 'master',
  clientId: 'vue-spa',
})

// Keycloak initialization
export async function initKeycloak(app, router) {
  const authenticated = await keycloak.init({
    onLoad: 'check-sso',      // Token varsa auto-login
    pkceMethod: 'S256',       // PKCE guvenlik
    checkLoginIframe: false,  // Dev icin kapatildi
  })

  app.mount('#app')

  if (authenticated) {
    // User bilgisini store'a yukle
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.loadUserFromKeycloak()
  } else {
    // Login sayfasina yonlendir
    router.push('/login')
  }
}
```

### stores/auth.ts

```typescript
import { keycloak, loginWithPassword } from '@/keycloak'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value && keycloak.authenticated)

  // Keycloak'tan user bilgisini yukle
  const loadUserFromKeycloak = () => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      user.value = {
        username: keycloak.tokenParsed.preferred_username,
        email: keycloak.tokenParsed.email,
      }
    }
  }

  // ROPC ile login
  const login = async (username, password) => {
    const success = await loginWithPassword(username, password)
    if (success) {
      loadUserFromKeycloak()
    }
    return success
  }

  // Logout
  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    })
    user.value = null
  }

  return { user, isAuthenticated, login, logout, loadUserFromKeycloak }
})
```

### Router Guard

```typescript
router.beforeEach(async (to, from, next) => {
  const { keycloak } = await import('@/keycloak')

  // Login sayfasina gidiliyorsa ve authenticated ise
  if (to.name === 'login' && keycloak.authenticated) {
    next('/')
    return
  }

  // Protected route ve authenticated degilse
  if (to.meta.requiresAuth && !keycloak.authenticated) {
    next('/login')
    return
  }

  next()
})
```

### API Isteklerinde Token Kullanimi

```typescript
// src/services/apiService.ts
import { keycloak } from '@/keycloak'

axios.interceptors.request.use(config => {
  if (keycloak.authenticated && keycloak.token) {
    config.headers.Authorization = `Bearer ${keycloak.token}`
  }
  return config
})

// Token expire olunca refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      try {
        await keycloak.updateToken(30)
        error.config.headers.Authorization = `Bearer ${keycloak.token}`
        return axios(error.config)
      } catch {
        keycloak.logout()
      }
    }
    return Promise.reject(error)
  }
)
```

### Login Akisi

#### Yontem 1: Authorization Code Flow (Onerilir)
```typescript
// Kullanici login butonuna tiklar
const login = () => {
  keycloak.login({
    redirectUri: window.location.origin + '/dashboard'
  })
}
```

#### Yontem 2: ROPC Flow (Mevcut)
```typescript
// Login.vue
const handleLogin = async () => {
  const success = await authStore.login(username, password)
  if (success) {
    router.push('/dashboard')
  }
}
```

### Logout Akisi

```typescript
const logout = () => {
  keycloak.logout({
    redirectUri: window.location.origin
  })
}
```

---

## Custom Theme

### Theme Dosya Yapisi

```
keycloak-theme/
└── apiruler/
    └── login/
        ├── theme.properties
        ├── login.ftl
        └── resources/
            ├── css/
            │   └── login.css
            └── img/
                └── apiruler-logo.svg
```

### theme.properties

```properties
parent=keycloak
import=common/keycloak
styles=css/login.css
locales=tr,en
meta=viewport==width=device-width,initial-scale=1
```

### login.ftl (FreeMarker Template)

```html
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password'); section>
    <#if section = "header">
        ApiRuler Manager
    <#elseif section = "form">
    <div id="kc-form">
      <div class="login-logo">
        <img src="${url.resourcesPath}/img/apiruler-logo.svg" alt="Logo">
      </div>
      <form action="${url.loginAction}" method="post">
        <input name="username" type="text" placeholder="Kullanici adi">
        <input name="password" type="password" placeholder="Sifre">
        <button type="submit">Giris Yap</button>
      </form>
    </div>
    </#if>
</@layout.registrationLayout>
```

### CSS Ozellestirme

```css
/* resources/css/login.css */
body {
  background: #CA3433;
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;
}

.login-button {
  background: #CA3433;
  color: white;
}
```

### Theme Aktif Etme

1. Admin Console > Realm Settings > Themes
2. Login theme: apiruler sec
3. Save

Veya CLI ile:
```bash
/opt/keycloak/bin/kcadm.sh update realms/master -s 'loginTheme=apiruler'
```

---

## Sorun Giderme

### Keycloak Baslamiyor

```bash
# Loglari kontrol et
docker logs keycloak

# Container durumu
docker ps -a | grep keycloak

# Port kulanimda mi?
lsof -i :7080
```

### "Database is read only" Hatasi

Database bozulmus. Sifirla:
```bash
docker-compose down -v
docker-compose up -d
```

### "HTTPS required" Hatasi

SSL requirement kapali degil:
```bash
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master --user admin --password admin

docker exec keycloak /opt/keycloak/bin/kcadm.sh update realms/master \
  -s sslRequired=NONE
```

### "Client not found" Hatasi

vue-spa client olusturulmamis:
```bash
docker-compose up keycloak-init
```

### Token Expire Sorunu

Token refresh ayarlari:
```javascript
// Her 30 saniyede bir kontrol et
setInterval(() => {
  keycloak.updateToken(30).then(refreshed => {
    if (refreshed) {
      console.log('Token refreshed')
    }
  }).catch(() => {
    console.log('Token refresh failed')
    keycloak.logout()
  })
}, 30000)
```

### CORS Hatasi

Client ayarlarinda Web Origins ekle:
- http://localhost:8080
- http://localhost:3000

### Theme Gorunmuyor

```bash
# Theme dosyalarini kontrol
docker exec keycloak ls -la /opt/keycloak/themes/apiruler/login/

# Cache temizle
docker restart keycloak

# Browser cache temizle
Ctrl+Shift+R (hard refresh)
```

### Init Script Calismadi

```bash
# Manuel calistir
docker-compose up keycloak-init

# Loglari kontrol et
docker-compose logs keycloak-init
```

---

## Ek Kaynaklar

### Resmi Dokumantasyon

- Keycloak Documentation: https://www.keycloak.org/documentation
- Getting Started: https://www.keycloak.org/getting-started
- Server Administration: https://www.keycloak.org/docs/latest/server_admin/
- Securing Applications: https://www.keycloak.org/docs/latest/securing_apps/

### API Referanslari

- Admin REST API: https://www.keycloak.org/docs-api/latest/rest-api/
- Token Endpoint: /realms/{realm}/protocol/openid-connect/token
- User Info Endpoint: /realms/{realm}/protocol/openid-connect/userinfo
- Logout Endpoint: /realms/{realm}/protocol/openid-connect/logout

### Community

- GitHub: https://github.com/keycloak/keycloak
- Discussions: https://github.com/keycloak/keycloak/discussions
- Stack Overflow: https://stackoverflow.com/questions/tagged/keycloak

---

## Sonuc

Keycloak, guclu ve esnek bir authentication cozumu sunar. Bu dokumanda:

- Docker Compose ile kurulum yapildi
- Temel kavramlar aciklandi
- Kullanici ve client yonetimi gosterildi
- Guvenlik ozellikleri aciklandi
- Vue.js projemize nasil entegre edildigini gorduk
- Custom theme nasil yapilir ogrendik
- Sorun giderme ipuclari verildi

Daha fazla detay icin resmi dokumantasyonu inceleyebilirsiniz.
