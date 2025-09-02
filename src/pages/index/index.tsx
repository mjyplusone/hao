import { View } from '@tarojs/components'
import LoginLayout from '@/Layout/LoginLayout'
import Header from './components/Header'
import Recent from './components/Recent'
import styles from './index.module.scss'

export default function Index() {
  return (
    <LoginLayout>
      <View className={styles.index}>
        <Header />
        <Recent />
      </View>
    </LoginLayout>
  )
}