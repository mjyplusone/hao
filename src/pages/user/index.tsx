import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { checkWechatLoginStatus, getWechatUserInfo, clearWechatLogin } from '@/utils/login'
import { goToLogin } from '@/utils/auth'

export default function User() {
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 检查登录状态
    if (!checkWechatLoginStatus()) {
      goToLogin()
      return
    }
    
    // 获取用户信息
    const info = getWechatUserInfo()
    setUserInfo(info)
  }, [])

  // 退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearWechatLogin()
          goToLogin()
        }
      }
    })
  }

  // 返回首页
  const goToHome = () => {
    Taro.switchTab({
      url: '/pages/index/index'
    })
  }

  return (
    <View className={styles.user}>
      <View className={styles.avatar}>
        <Text className={styles['avatar-text']}>
          {userInfo?.nickName?.charAt(0) || '用'}
        </Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{userInfo?.nickName || '用户名'}</Text>
        <Text className={styles.desc}>这是用户页面</Text>
      </View>
      <View className={styles.actions}>
        <Button className={styles.btn} onClick={goToHome}>
          返回首页
        </Button>
        <Button className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  )
} 