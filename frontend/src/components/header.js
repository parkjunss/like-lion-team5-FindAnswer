'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, logout } from '@/lib/api'

const Header = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // localStorage는 브라우저에만 있다.
  // 서버에서 그린 화면과 어긋나지 않게 useEffect 안에서 읽는다.
  useEffect(() => {
    setIsLoggedIn(Boolean(getToken()))
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="border-b border-gray-200">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          MentorBridge
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/questions">질문 목록</Link>

          {isLoggedIn ? (
            <button type="button" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
