import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useMemo, lazy, Suspense } from 'react'
import LoginLayout from '@/Layout/LoginLayout'
import { PhotoFolder } from '@/types'
import { Header } from '@/components'
import { useTransferStore } from '@/store/transfer'

import styles from './index.module.scss'

const FolderList = lazy(() => import('./components/FolderList'))
const PhotoList = lazy(() => import('./components/PhotoList'))

export default function Album() {
  const [currentFolder, setCurrentFolder] = useState<PhotoFolder | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'select' | 'selectAll' | null>(null)
  const { tasks } = useTransferStore()

  const hasActiveTasks = useMemo(() => tasks.some((task) => task.status === "pending"), [tasks]);

  const handleMoreClick = (e: any) => {
    if (selectionMode) {
      setSelectionMode(null)
      return
    }
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleSelect = () => {
    setSelectionMode('select')
    setShowMenu(false)
  }

  const handleSelectAll = () => {
    setSelectionMode("selectAll")
    setShowMenu(false)
  }

  const handleTransferClick = () => {
    Taro.navigateTo({
      url: '/subpackages/transfer/index'
    })
  }

  const renderTransferButton = () => (
    <View className={styles.transferButton} onClick={handleTransferClick}>
      <Text className={styles.transferText}>📤</Text>
      {hasActiveTasks && <View className={styles.redDot} />}
    </View>
  )

  const renderMoreButton = () => {
    if (!currentFolder) return null
    return (
      <View className={styles.moreButtonContainer}>
        <View className={styles.moreButton} onClick={handleMoreClick}>
          <Text className={styles.moreText}>{selectionMode ? '取消' : '⋯'}</Text>
        </View>
        {showMenu && (
          <View className={styles.dropdownMenu}>
            <View className={styles.menuItem} onClick={handleSelect}>
              <Text className={styles.menuText}>选择</Text>
            </View>
            <View className={styles.menuItem} onClick={handleSelectAll}>
              <Text className={styles.menuText}>全选</Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  const renderBackButton = () => {
    if (!currentFolder) return null
    return (
      <View className={styles.backButton} onClick={() => {
        setCurrentFolder(null)
        setSelectionMode(null)
      }}>
        ‹ 返回
      </View>
    )
  }

  return (
    <LoginLayout>
      <View 
        className={currentFolder
          ? `${styles.album} ${styles.photoAlbum}`
          : `${styles.album} ${styles.folderAlbum}`}
        onTap={() => setShowMenu(false)}
      >
        <Header 
          title="云相册" 
          subtitle="记录小好的每一个精彩瞬间" 
          rightButtons={[renderTransferButton(), renderMoreButton()]}
            leftButton={renderBackButton()}
        />

        <Suspense fallback={<View>加载中...</View>}>
          {currentFolder ? (
            <PhotoList 
              folder={currentFolder} 
              selectionMode={selectionMode}
            />
          ) : (
            <FolderList 
              onChangeFolder={(folder) => setCurrentFolder(folder)}
            />
          )}
        </Suspense>
      </View>
    </LoginLayout>
  )
}
