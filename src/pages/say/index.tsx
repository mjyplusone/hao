import { View, Text, Textarea, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import React from 'react'
import styles from './index.module.scss'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { createSay, getSayList } from '@/service'
import { useRequest } from 'ahooks'
import { formatDate } from '@/utils/format'

export default function Say() {
  const [inputValue, setInputValue] = React.useState('')

  const { data, run } = useRequest(getSayList)

  // 页面显示时刷新数据
  useDidShow(() => {
    run()
  })

  const handleSend = React.useCallback(async () => {
    try {
    if (!inputValue.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    const newMessage = {
      id: Date.now(),
      content: inputValue,
      date: new Date().toLocaleString('zh-CN'),
      username: '用户'
    }

    await createSay(newMessage)
    run()
    setInputValue('')
    
    Taro.showToast({
      title: '小好收到啦',
        icon: 'success'
      })
    } catch (error) {
      Taro.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  }, [inputValue, run])

  return (
    <LoginLayout>
      <View className={styles.say}>
        <Header title="对小好说" subtitle="记录对小好的每一份爱" />
        
        <View className={styles.messageList}>
          {data?.map((message) => (
            <View key={message.id} className={styles.messageItem}>
              <View className={styles.messageContent}>
                <Text className={styles.messageText}>{message.content}</Text>
              </View>
              <View className={styles.messageInfo}>
                <Text className={styles.messageUsername}>{message.user_name}</Text>
                <Text className={styles.messageDate}>{formatDate(message.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View className={styles.inputSection}>
          <Textarea
            className={styles.textarea}
            placeholder="写下想对小好说的话..."
            placeholderStyle="color: rgba(255, 255, 255, 0.3);"
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <Button 
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            发送
          </Button>
        </View>
      </View>
    </LoginLayout>
  )
} 