import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React from 'react'
import styles from './index.module.scss'
import { wechatLogin } from '@/utils/login'
import haoImg from '@/assets/hao.jpg'
import { TermsModal } from './components/TermsModal'

export default function Login() {
  const [loading, setLoading] = React.useState(false)
  const [agreed, setAgreed] = React.useState(false)
  const [showTerms, setShowTerms] = React.useState(false)
  const [showButtons, setShowButtons] = React.useState(false)

  const handleGetUserInfo = async (e: any) => {
    console.log('获取用户信息成功:', e.detail)
    
    // 检查是否同意协议
    if (!agreed) {
      setShowTerms(true)
      setShowButtons(true)
      return
    }
    
    if (e.detail.userInfo) {
      // 用户同意授权，继续登录流程
      setLoading(true)
      try {
        const userInfo = await wechatLogin(e.detail.userInfo)
        console.log('微信登录成功', userInfo)
        
        // 登录成功跳转到首页
        Taro.switchTab({
          url: '/pages/index/index'
        })
      } catch (error) {
        console.error('登录错误', error)
        Taro.showToast({
          title: '登录失败',
          icon: 'error'
        })
      } finally {
        setLoading(false)
      }
    } else {
      // 用户拒绝授权
      Taro.showToast({
        title: '需要获取用户信息才能登录',
        icon: 'none'
      })
    }
  }

  // 处理按钮点击事件（当用户未同意协议时）
  const handleButtonClick = () => {
    if (!agreed) {
      setShowTerms(true)
      setShowButtons(true)
    }
  }

  return (
    <View className={styles.login}>
      <View className={styles.top}>
        <View className={styles.logo}>
          <Image src={haoImg} className={styles.logoImg} />
        </View>
        
        <View className={styles.welcome}>
          <View>欢迎使用 <Text className={styles.haoText}>玩小好</Text></View>
          <View className={styles.haoDescription}>记录小好的每一个成长瞬间</View>
        </View>
      </View>
      
      <View className={styles.bottom}>
        <View className={styles.agreement}>
          <View 
            className={styles.checkbox}
            onClick={() => {
              setAgreed(!agreed)
            }}
          >
            <View className={`${styles.checkboxInner} ${agreed ? styles.checked : ''}`}>
              {agreed && <Text className={styles.checkmark}>✓</Text>}
            </View>
            <Text className={styles.agreementText}>
              我已阅读并同意
              <Text 
                className={styles.link}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTerms(true)
                  setShowButtons(false)
                }}
              >
                《小好妈妈说的都对》
              </Text>
            </Text>
          </View>
        </View>
        
        {agreed ? (
          <Button 
            className={styles.loginButton}
            openType="getUserInfo"
            onGetUserInfo={handleGetUserInfo}
            loading={loading}
            disabled={loading}
          >
            {loading ? '登录中...' : '微信登录'}
          </Button>
        ) : (
          <Button 
            className={styles.loginButton}
            onClick={handleButtonClick}
            disabled={loading}
          >
            微信登录
          </Button>
        )}
      </View>
      
      {/* 条款弹窗 */}
      {showTerms && (
        <TermsModal
          showButtons={showButtons}
          onClose={() => setShowTerms(false)}
          onAgreed={() => {
            setAgreed(true)
            setShowTerms(false)
          }}
        />
      )}
    </View>
  )
} 