import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

export default function About() {
  // 返回上一页
  const goBack = () => {
    Taro.navigateBack()
  }

  return (
    <View className={styles.about}>
      <View className={styles.title}>关于我们</View>
      <View className={styles.content}>
        <Text>这是一个使用Taro框架开发的微信小程序</Text>
        <Text>支持多端开发，包括微信小程序、支付宝小程序、H5等</Text>
        <Text>使用React作为开发框架，TypeScript提供类型支持</Text>
      </View>
      <View className={styles.actions}>
        <Button className={styles.btn} onClick={goBack}>
          返回上一页
        </Button>
      </View>
    </View>
  )
} 