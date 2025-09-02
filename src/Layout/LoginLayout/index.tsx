import { View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { checkWechatLoginStatus } from '@/utils/login'
import { goToLogin } from '@/utils/auth'

interface LoginLayoutProps {
  children: React.ReactNode
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查登录状态
    const loginStatus = checkWechatLoginStatus()
    setIsLoggedIn(loginStatus)
    setLoading(false)
    
    if (!loginStatus) {
      goToLogin()
    }
  }, [])

  if (loading) {
    return (
      <View style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #7a8ff0 0%, #8a5bb8 100%)'
      }}>
        <View style={{ color: '#fff', fontSize: '32rpx' }}>加载中...</View>
      </View>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}
