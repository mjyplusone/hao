import { PhotoFolder, ViewMode } from '@/types'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { formatYearMonth } from '../../utils/formatYearMonth'
import { useState } from 'react'
import { useRequest } from 'ahooks'
import { getPhotoFolders } from '@/service'

interface Props {
    onChangeFolder: (folder: PhotoFolder | null) => void
}

export const FolderList: React.FC<Props> = ({ 
    onChangeFolder,
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('my')

    const { data: photoFolders } = useRequest(() => {
      return getPhotoFolders({ viewMode })
    }, {
      refreshDeps: [viewMode],
    })

    const handleViewModeChange = (mode: ViewMode) => {
      setViewMode(mode)
      onChangeFolder(null) // 重置当前文件夹
    }

    const handleFolderClick = (folder: PhotoFolder) => {
      onChangeFolder(folder)
    }

    return (
      <>
        <View className={styles.viewModeSelector}>
          <View 
            className={`${styles.viewModeItem} ${viewMode === 'my' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('my')}
          >
            我上传的
          </View>
          <View 
            className={`${styles.viewModeItem} ${viewMode === 'all' ? styles.active : ''}`}
            onClick={() => handleViewModeChange('all')}
          >
            全部
          </View>
        </View>
        <View className={styles.folderList}>
          {photoFolders?.map((folder) => (
            <View 
              key={folder.yearMonth} 
              className={`${styles.folderItem}`}
              onClick={() => handleFolderClick(folder)}
            >
              <View className={styles.folderInfo}>
                <Text className={styles.folderTitle}>{formatYearMonth(folder.yearMonth)}</Text>
                <Text className={styles.folderCount}>{folder.photoCount}张照片</Text>
              </View>
              <View className={styles.folderArrow}>
                <Text className={styles.arrowText}>›</Text>
              </View>
            </View>
          ))}
        </View>
        </>
    )
}