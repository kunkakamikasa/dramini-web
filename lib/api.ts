interface ApiResponse<T> {
  ok: boolean
  data: T
  error?: string
}

export async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${endpoint}`)
    
    if (!response.ok) {
      return {
        ok: false,
        data: null as T,
        error: `HTTP ${response.status}`
      }
    }
    
    const data = await response.json()
    return {
      ok: true,
      data: data
    }
  } catch (error) {
    return {
      ok: false,
      data: null as T,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 添加缺失的 getBrowseData 函数
export async function getBrowseData(category?: string, page = 1, limit = 20) {
  try {
    let endpoint = `/movies?page=${page}&limit=${limit}`
    if (category) {
      endpoint += `&category=${category}`
    }
    
    const response = await fetchApi(endpoint)
    return response
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
