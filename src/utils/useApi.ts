// composables/useApi.ts

const baseURL = 'http://localhost:8998/v1'

const apiMap: Record<string, string> = {
  watertank: `${baseURL}/device?keyword&type=DATALOGGER&sort=DESC&perPage=10&page=1&roleId`,
  waterpumb: 'https://api.example.com/waterpumb',
  gatewave: 'https://api.example.com/gatewave',
  'pressure-gauge': 'https://api.example.com/pressure-gauge',
  'water-level-sensor': 'https://api.example.com/water-level-sensor',
  device: `${baseURL}/device?type=DMA&sort=DESC&perPage=10&page=1&roleId`,
  'water-pipe': 'https://api.example.com/water-pipe',
  pipe: 'https://api.example.com/pipe',
  'grid-square': 'https://api.example.com/grid-square',
  'pressure-meter': `${baseURL}/device`,
  create: `${baseURL}/scada`,
}

export function useApi() {
  const getToken = () => {
    return document.cookie.match(/(^| )accessToken=([^;]+)/)?.[2]
  }

  const baseRequest = async (
    type: string,
    method: string,
    options: {
      body?: unknown
      params?: Record<string, string | number>
    } = {},
  ) => {
    let url = apiMap[type]
    if (!url) {
      console.warn(`❌ No endpoint for type: ${type}`)
      return null
    }

    if (options.params) {
      const query = new URLSearchParams(options.params as Record<string, string>).toString()
      url += (url.includes('?') ? '&' : '?') + query
    }

    const token = getToken()

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${decodeURIComponent(token)}` }),
        },
        ...(typeof options.body !== 'undefined' ? { body: JSON.stringify(options.body) } : {}),
      })

      if (!res.ok) {
        console.error(`❌ Fetch failed with status: ${res.status}`)
        return null
      }

      return await res.json()
    } catch (e) {
      console.error('❌ Fetch error:', e)
      return null
    }
  }

  const request = {
    get: (type: string, params?: Record<string, string | number>) =>
      baseRequest(type, 'GET', { params }),
    post: (type: string, body?: unknown) => baseRequest(type, 'POST', { body }),
    put: (type: string, body?: unknown) => baseRequest(type, 'PUT', { body }),
    patch: (type: string, body?: unknown) => baseRequest(type, 'PATCH', { body }),
    delete: (type: string) => baseRequest(type, 'DELETE'),
  }

  return { request }
}
