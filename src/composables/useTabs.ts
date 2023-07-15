import { computed } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw, type RouteLocationNamedRaw } from 'vue-router'

interface Tab {
  title: string
  route: RouteLocationRaw & { name: string }
}

const convertTitleToHash = (title: string) => `#${title.replace(/\s+/g, '-').toLowerCase()}`

// <KTabs> expects an array of hash-based objects (e.g. [{hash: '#tab1', title: 'Tab 1'}, {hash: '#tab2', title: 'Tab 2'}]).
// But in our app, we expect the tab to switch between paths instead of hashes.
// This composable takes an array of route-based objects and converts it to an array of hash-based objects,
// so that the consuming component can pass the returned array to <KTabs>.
export const useTabs = (tabs: Array<Tab>) => {
  const route = useRoute()
  const router = useRouter()

  const initialTab = computed(() => tabs.find((tab) => tab.route.name === route.name))
  const initialHash = computed(() => convertTitleToHash(initialTab.value?.title || ''))

  const kongponentTabs = tabs.map((tab) => ({
    title: tab.title,
    hash: convertTitleToHash(tab.title),
  }))

  const onTabChange = (hash: string) => {
    const activeKongponentTab = kongponentTabs.find((tab) => tab.hash === hash)
    if (!activeKongponentTab) {
      return
    }

    const activeTab = tabs.find((tab) => tab.title === activeKongponentTab.title)
    if (!activeTab) {
      return
    }

    router.push({
      query: route.query,
      ...(activeTab.route as RouteLocationNamedRaw),
    })
  }

  return {
    kongponentTabs,
    onTabChange,
    initialHash,
  }
}
