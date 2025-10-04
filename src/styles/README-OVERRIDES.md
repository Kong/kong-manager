# Kong Component Overrides Rehberi

Bu dosya, Kong Kongponents'lerin nasıl özelleştirildiğini açıklar.

## Kullanım

### Global Override (Tüm Sayfalarda)
`src/styles/kong-overrides.scss` dosyası otomatik olarak tüm sayfalara uygulanır.

### Sayfa Bazında Override
Eğer sadece belirli bir sayfada özel stil istiyorsan:

```vue
<style scoped lang="scss">
// Sadece bu sayfada geçerli
:deep(.k-card) {
  background: #f0f0f0;
}
</style>
```

## Özelleştirilebilir Component'ler

### 1. KCard
```scss
:deep(.k-card) {
  border-radius: 12px;
  .card-header { }
  .card-body { }
}
```

### 2. KButton
```scss
:deep(.k-button) {
  border-radius: 8px;
  &.primary { }
  &.secondary { }
}
```

### 3. KBadge
```scss
:deep(.k-badge) {
  &.success { }
  &.error { }
  &.warning { }
}
```

### 4. KTable
```scss
:deep(.k-table) {
  thead { }
  tbody { }
}
```

### 5. Form Elements
```scss
:deep(.k-input),
:deep(.k-select),
:deep(.k-textarea) {
  border-radius: 8px;
}
```

## Renk Paleti

Ana renkler:
- Primary: `#CA3433` (Kırmızı)
- Success: `#10b981`
- Warning: `#f59e0b`
- Error: `#ef4444`
- Info: `#3b82f6`

## Tips

1. **Global değişiklikler için**: `kong-overrides.scss` dosyasını düzenle
2. **Sayfa özel değişiklikler için**: Component içinde `<style scoped>` kullan
3. **!important kullanma**: Mümkünse avoid et, specificity ile çöz
4. **Browser DevTools**: Chrome'da Inspect ile class isimlerini bul

## Figma'dan CSS Kopyalama

1. Figma'da elementi seç
2. Sağ panel → Inspect → CSS
3. Kopyala ve ilgili component override'ına yapıştır
4. Kong design token'larını kullanmayı unutma ($kui-*)

## Örnekler

### Dashboard Card Özelleştirmesi
```scss
// Dashboard.vue içinde
:deep(.k-card) {
  box-shadow: 0 8px 24px rgba(202, 52, 51, 0.1);

  .card-header {
    background: linear-gradient(135deg, #CA3433 0%, #a02827 100%);
    color: white;
  }
}
```

### Login Butonu Özelleştirmesi
```scss
// Login.vue içinde
:deep(.k-button.primary) {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: #CA3433;

  &:hover {
    transform: scale(1.02);
  }
}
```
