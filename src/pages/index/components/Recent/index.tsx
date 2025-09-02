import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import RecentSay from './RecentSay'
import RecentGrowth from './RecentGrowth'
import RecentPhoto from './RecentPhoto'
import { useRequest } from 'ahooks'
import { getRecentInfo } from '@/service'

export default function Recent() {
  const { data } = useRequest(getRecentInfo)

  return (
    <View className={styles.content}>      
      <View className={styles.section}>
        <Text className={styles.sectionHeader}>📸 最近照片</Text>
        <RecentPhoto photoList={data?.photos ?? []} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionHeader}>📊 生长记录</Text>
        <RecentGrowth growthRecord={data?.growthRecord} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionHeader}>💬 对小好说</Text>
        <RecentSay messageList={data?.says ?? []} />
      </View>
    </View>
  )
} 