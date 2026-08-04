// 브라우저에서는 항상 /api/... 로 요청한다.
// 진짜 백엔드 주소는 next.config.mjs 의 rewrites 가 대신 처리해줘서
// 여기서는 백엔드 주소를 몰라도 된다.

export function saveToken(accessToken) {
  localStorage.setItem('accessToken', accessToken)
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export function clearToken() {
  localStorage.removeItem('accessToken')
}

// API 요청할 때 이 함수를 거쳐서 부른다.
// 토큰 자동으로 붙여주고, 에러랑 204 처리도 여기서 같이 한다.
async function request(path, options = {}) {
  const token = getToken()

  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include', // refreshToken이 쿠키로 오가려면 필요함
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // TODO: 백엔드 토큰 재발급 API 완성되면 여기서 자동 재로그인 시도하기
    clearToken()
    throw new Error('로그인이 필요합니다')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || '요청에 실패했습니다')
  }

  // 삭제 성공하면 204라서 본문이 없음. json()으로 읽으면 에러남
  if (res.status === 204) return null

  return res.json()
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveToken(data.accessToken)
  return data
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' }).catch(() => {})
  clearToken()
}

// 이 함수는 서버 컴포넌트에서만 쓴다 (page.js처럼).
// BACKEND_URL은 서버에만 있는 값이라 브라우저 쪽 코드에선 쓸 수 없다.
export async function getHealth() {
  const BACKEND_URL = process.env.BACKEND_URL

  if (!BACKEND_URL) {
    throw new Error('BACKEND_URL이 없습니다')
  }

  const response = await fetch(`${BACKEND_URL}/health`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Fail')
  }

  return response.text()
}
