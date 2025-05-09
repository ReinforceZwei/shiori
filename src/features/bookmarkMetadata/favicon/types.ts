export type Favicon = {
  href: string
  source: 'link' | 'manifest' | 'favicon' | 'externalApi' | undefined
  sizes?: number
  type?: string
  base64?: string
}