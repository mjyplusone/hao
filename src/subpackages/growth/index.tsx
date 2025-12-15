import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { getGrowthRecordList } from '@/service'
import { useRequest } from 'ahooks'
import RecordList from './components/RecordList'
import HeightChart from './components/HeightChart'
import WeightChart from './components/WeightChart'
import AddButton from './components/AddButton'

import styles from './index.module.scss'

const tabs = [
  { key: 0, title: '记录列表' },
  { key: 1, title: '身高曲线' },
  { key: 2, title: '体重曲线' }
]

export default function Growth() {
  const { data, refresh } = useRequest(getGrowthRecordList)
  const [activeTab, setActiveTab] = useState(0)

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <RecordList data={data || []} />
      case 1:
        return <HeightChart data={data || []} />
      case 2:
        return <WeightChart data={data || []} />
      default:
        return <RecordList data={data || []} />
    }
  }

  return (
    <LoginLayout>
      <View className={styles.growth}>
        <Header 
          title="生长记录" 
          subtitle="记录小好的成长轨迹"
          rightButtons={[<AddButton refresh={refresh} />]}
        />
        
        <View className={styles.tabContainer}>
          {tabs.map((tab) => (
            <View
              key={tab.key}
              className={`${styles.tabItem} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={styles.tabText}>{tab.title}</Text>
            </View>
          ))}
        </View>
        
        <View className={styles.content}>
          {renderContent()}
        </View>
      </View>
    </LoginLayout>
  )
} 