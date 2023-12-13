<template>
  <KCard>
    <div class="konnect-container">
      <div class="konnect-content">
        <p class="konnect-title">
          <img
            class="konnect-kong"
            src="@/assets/kong-text-black.svg?external"
            alt="Kong"
          >
          <span class="konnect-gradient">
            {{ t('konnect-cta.name') }}
          </span>
        </p>
        <p class="konnect-description">
          {{ t('konnect-cta.description') }}
        </p>
        <ul class="konnect-list">
          <li
            v-for="item in listItems"
            :key="item.text"
            class="konnect-item"
          >
            <img
              :src="getIconPath(item.icon)"
              alt=""
              class="konnect-icon"
            >
            <span class="konnect-item-description">
              {{ item.text }}
            </span>
          </li>
        </ul>
        <div class="konnect-footer">
          <KButton
            appearance="primary"
            :to="link"
            rel="noopener"
            target="_blank"
          >
            {{ t('konnect-cta.get.started') }}
          </KButton>
          <span class="konnect-footer-description">
            {{ t('konnect-cta.footer.description') }}
          </span>
        </div>
      </div>
      <a
        :href="link"
        rel="noopener"
        target="_blank"
        class="konnect-preview"
      >
        <img
          class="konnect-preview-screenshot"
          src="@/assets/konnect-preview.png?external"
          alt="konnect-preview"
        >
        <span class="konnect-preview-start">{{ t('konnect-cta.get.started') }}</span>
      </a>
    </div>
  </KCard>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const listItems = [
  {
    icon: 'cloud',
    text: t('konnect-cta.feature.1'),
  },
  {
    icon: 'multiple',
    text: t('konnect-cta.feature.2'),
  },
  {
    icon: 'chart',
    text: t('konnect-cta.feature.3'),
  },
  {
    icon: 'speed',
    text: t('konnect-cta.feature.4'),
  },
  {
    icon: 'grow',
    text: t('konnect-cta.feature.5'),
  },
]

const getIconPath = (icon: string) => new URL(`../assets/icon-${icon}.svg`, import.meta.url).href

const link = 'https://konghq.com/products/kong-konnect/register?utm_medium=product&utm_source=canopy-ui&utm_campaign=gateway-konnect&utm_content=instance-home'
</script>

<style scoped lang="scss">
.konnect-container {
  display: flex;
  justify-content: space-between;
  overflow: auto;

  .konnect-content {
    flex-shrink: 0;
    margin-right: 20px;
  }

  .konnect-title {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    line-height: 1;
  }

  .konnect-kong {
    width: 50px;
    margin-right: 6px;
  }

  .konnect-gradient {
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(92.35deg, #003592 -0.87%, #5151FF 99.68%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .konnect-description {
    font-size: 18px;
    line-height: 24px;
    color: #000;
    margin-bottom: 20px;
  }

  .konnect-list {
    margin: 0;
    padding: 0;
  }

  .konnect-item {
    display: flex;
    align-items: center;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  .konnect-icon {
    height: 32px;
    width: 32px;
    margin-right: 16px;
  }

  .konnect-item-description {
    font-size: 15px;
    color: #000;
    opacity: 0.7;
  }

  .konnect-footer {
    margin-top: 20px;
    display: flex;
    align-items: center;
  }

  .konnect-footer-description {
    margin-left: 16px;
    font-size: 13px;
    color: #000;
    opacity: 0.5;
  }

  .konnect-preview {
    .konnect-preview-screenshot {
      width: 570px;
    }

    .konnect-preview-start {
      // this element is only for screen readers
      display: none;
    }
  }
}
</style>
