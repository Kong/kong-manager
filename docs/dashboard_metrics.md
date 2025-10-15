# Dashboard Metrics Dokumantasyonu

Bu dokuman, ApiRuler Manager Dashboard'unda gosterilen Kong Gateway metriklerinin ne anlama geldigini aciklamaktadir.

## Veri Kaynagi

Tum metrikler Kong Gateway Admin API'nin iki endpoint'inden alinir:

1. **`GET /status`** - Baglanti metrikleri ve sunucu durum bilgileri
2. **`GET /`** - Node bilgileri ve datastore konfigurasyonu

## Connection Metrics (Baglanti Metrikleri)

Dashboard'un ust kisminda 6 farkli metrik gosterilir:

### 1. ACTIVE (Aktif Baglantilar)
- **Anlami**: Su anda aktif olan toplam client baglanti sayisi
- **Icerdigi**: Reading + Writing + Waiting baglantilarinin toplami
- **Ne zaman artar**: Yeni bir client Kong'a baglandiginda
- **Ne zaman azalir**: Baglanti kapandiginda veya timeout oldugundalari
- **Normal degerler**: 0-100 arasi normal, cok yuksek degerler problem isaretiolabilir

### 2. READING (Okuma Yapilan Baglantilar)
- **Anlami**: Kong'un istek basligini (request header) okudugu baglanti sayisi
- **Ne zaman gozlenir**: Client isteği gonderirken, Kong henuz parse etmemisse
- **Suresi**: Cok kisa (milisaniyeler), hizlica 0'a doner
- **Yuksek deger**: Yavas client'lar veya cok buyuk request header'lari gosterebilir

### 3. WRITING (Yazma Yapilan Baglantilar)
- **Anlami**: Kong'un client'a yanit (response) yazdigi baglanti sayisi
- **Ne zaman gozlenir**: Upstream'den yanit geldikten sonra, client'a gonderilirken
- **Suresi**: Response body boyutuna bagli (buyuk dosyalarda uzun surebilir)
- **Yuksek deger**: Yavas client'lar veya buyuk response'lar gosterebilir

### 4. WAITING (Bekleyen Baglantilar)
- **Anlami**: HTTP Keep-Alive ile acik kalan, yeni istek bekleyen baglanti sayisi
- **HTTP Keep-Alive**: Bir TCP baglantisi uzerinden birden fazla HTTP istegi gonderme ozelliği
- **Neden onemli**: Baglanti yeniden kullanimi, performansi artiran bir ozelliktir
- **Normal degerler**: Trafik yogunluguna gore degisir, 0-50 arasi normal kabul edilir

### 5. ACCEPTED (Kabul Edilen Baglantilar)
- **Anlami**: Kong basladigindan beri kabul ettigi toplam baglanti sayisi
- **Ozelligi**: Surekli artan, reset olmayan bir sayac
- **Ne zaman artar**: Her yeni TCP baglantisinda
- **Kullanim alani**: Toplam trafik hacmini gostermek icin

### 6. HANDLED (Islenen Baglantilar)
- **Anlami**: Kong basladigindan beri basariyla islenen toplam baglanti sayisi
- **Ozelligi**: Surekli artan, reset olmayan bir sayac
- **Normal durum**: ACCEPTED ile ayni olur
- **Farkli ise**: Kaynak limitlerine ulasilmis demektir (memory, file descriptors, vb.)
- **Kontrol**: `ACCEPTED - HANDLED = 0` olmali, 0'dan buyukse sorun var

## Total Requests (Toplam Istek Sayisi)

Dashboard basliginda gosterilen "Total Requests" metrigi:

- **Anlami**: Kong basladigindan beri gelen toplam HTTP istek sayisi
- **Kaynak**: `/status` endpoint'indeki `total_requests` alani
- **HANDLED'dan farkli neden?**: Bir baglanti uzerinden birden fazla istek gonderilebilir

### Ornek Senaryo

Ekrandaki gercek degerler:
- Total Requests: 37K+
- Handled Connections: 734

Bu demek oluyor ki:
1. 734 adet TCP baglantisi acilmis
2. Bu 734 baglanti uzerinden 37,000+ HTTP istegi gelmis
3. Ortalama her baglanti ~50 istek gondermiş (37000 / 734 = ~50)

Bu tamamen normaldir cunku:
- HTTP/1.1'de Keep-Alive varsayilan olarak aciktir
- Bir client baglanip 50-100 istek gonderebilir (ayni baglanti uzerinden)
- Modern browser'lar ve API client'lari bunu otomatik yapar
- Bu, performans icin cok faydalidir (TCP handshake maliyetinden kacınilir)

## Node Info (Dugum Bilgileri)

Dashboard'un alt kismindaki "NODE INFO" karti:

- **HostName**: Kong Gateway'in calistigi sunucunun hostname'i
- **Tag Line**: Kong'un slogan'i ("Welcome to Kong" gibi)
- **Version**: Kong Gateway'in surum numarasi (ornek: 3.4.0)
- **LUA Version**: Kong'un kullandigi LuaJIT versiyonu
- **Admin listen**: Kong Admin API'nin dinledigi adresler (ornek: ["0.0.0.0:8001"])

## Datastore Info (Veri Deposu Bilgileri)

Dashboard'un alt kismindaki "DATASTORE INFO" karti:

- **Reachable**: Kong'un veritabanina erisebiliyor mu? (Reachable/Unreachable)
- **DBMS**: Kullanilan veritabani sistemi (postgres, cassandra, vb.)
- **Host**: Veritabaninin IP adresi veya hostname'i
- **Database**: Veritabani adi
- **User**: Baglanti icin kullanilan kullanici adi
- **Port**: Veritabani port numarasi (postgres icin varsayilan 5432)

## Performans Metrikleri Yorumlama

### Saglikli Sistem Gostergeleri:

1. **ACCEPTED = HANDLED**: Kaynak sikintisi yok
2. **ACTIVE < 100**: Normal trafik seviyesi
3. **READING ~= 0**: Istekler hizlica okunuyor
4. **WRITING > 0**: Aktif yanit gonderimi var (trafik var demektir)
5. **WAITING > 0**: Keep-Alive calisiyorsa bu normal
6. **Reachable: true**: Veritabani baglantisi saglikli

### Potansiyel Sorun Gostergeleri:

1. **ACCEPTED > HANDLED**: Kaynak limitleri dolmus olabilir
2. **ACTIVE > 1000**: Cok yuksek baglanti sayisi, load balancer gerekebilir
3. **READING > 50**: Yavas client'lar veya buyuk header'lar
4. **WRITING > 200**: Yavas client'lar veya buyuk response'lar
5. **WAITING > 500**: Cok fazla bosta baglanti, timeout ayarlarini kontrol et
6. **Reachable: false**: Veritabani baglantisi yok, kritik hata

## Veri Guncelleme

- Tum metrikler her 5 saniyede bir otomatik olarak guncellenir
- Guncelleme `useConnectionMonitoring` composable'i tarafindan yapilir
- Store: `src/stores/monitoring.ts`
- Composable: `src/composables/useConnectionMonitoring.ts`

## Teknik Detaylar

### API Cagrilari:

```javascript
// Status metrikleri
GET http://localhost:8001/status

// Response yapisi:
{
  "server": {
    "connections_active": 4,
    "connections_reading": 0,
    "connections_writing": 4,
    "connections_waiting": 0,
    "connections_accepted": 734,
    "connections_handled": 734,
    "total_requests": 37000
  },
  "database": {
    "reachable": true
  }
}
```

```javascript
// Node ve datastore bilgileri
GET http://localhost:8001/

// Response yapisi:
{
  "hostname": "kong-gateway",
  "version": "3.4.0",
  "tagline": "Welcome to Kong",
  "lua_version": "LuaJIT 2.1.0",
  "configuration": {
    "admin_listen": ["0.0.0.0:8001"],
    "database": "postgres",
    "pg_host": "localhost",
    "pg_database": "kong",
    "pg_user": "kong",
    "pg_port": 5432
  }
}
```

## Ek Notlar

1. Bu metrikler Kong Gateway'in kendi icsel metrikleridir
2. Upstream service'lerin metrikleri ayri bir yerde takip edilir
3. Total Requests sadece Kong'a gelen istekleri sayar, upstream'e gitmeyenleri de icin (cached, rejected, vb.)
4. Connection metrikler TCP seviyesindedir, HTTP istek sayisi degil
5. Keep-Alive timeout degeri Kong konfigurasyonunda ayarlanabilir (varsayilan 75 saniye)
