import { View, Text } from '@tarojs/components'
import { useState } from 'react'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { useTransferStore } from '@/store/transfer'
import Taro from '@tarojs/taro'

import styles from './index.module.scss'
import Tab from './components/Tab'
import TransferList from './components/TransferList'

export default function Transfer() {
  const [showMenu, setShowMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload')
  
  const {  clearTempFiles } = useTransferStore()

  // 清理所有临时文件
  const handleClearTempFiles = () => {
    Taro.showModal({
      title: '确认清理',
      content: '确定要清理所有临时文件吗？这将删除所有未完成的下载文件。',
      success: (res) => {
        if (res.confirm) {
          clearTempFiles();
          Taro.showToast({ title: '临时文件已清理', icon: 'success' });
        }
      }
    });
  };

  const handleMoreClick = (e: any) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const renderMoreButton = () => {
    return (
      <View className={styles.moreButtonContainer}>
        <View className={styles.moreButton} onClick={handleMoreClick}>
          <Text className={styles.moreText}>⋯</Text>
        </View>
        {showMenu && (
          <View className={styles.dropdownMenu}>
            <View className={styles.menuItem} onClick={handleClearTempFiles}>
              <Text className={styles.menuText}>清理临时文件</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <LoginLayout>
      <View className={styles.transfer} onTap={() => setShowMenu(false)}>
        <Header 
          title="传输列表" 
          color="#333"
          rightButtons={[renderMoreButton()]}
        />

        {/* Tab切换 */}
        <Tab activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 按状态分组的任务列表 */}
        <TransferList activeTab={activeTab} />
      </View>
    </LoginLayout>
  )
}
