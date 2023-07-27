export const formatVersion = (version: string) => {
  return version.substring(0, (version.indexOf('-') > -1 && version.indexOf('-')) || version.length).split('.').slice(0, 2).join('.')
}
