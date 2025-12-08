import { PhotoFolder } from '@/types'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { useCallback } from 'react'
import { useRequest } from 'ahooks'
import { getPhotoFolders } from '@/service'
import { useTransferStore } from '@/store/transfer'
import Taro from '@tarojs/taro'


interface Props {
    onChangeFolder: (folder: PhotoFolder | null) => void
}

export const FolderList: React.FC<Props> = ({ 
    onChangeFolder,
}) => {
    const { data: photoFolders } = useRequest(() => {
      return getPhotoFolders()
    })

    const handleFolderClick = (folder: PhotoFolder) => {
      onChangeFolder(folder)
    }

    const handleUploadPhoto = useCallback(() => {
      Taro.chooseMedia({
        count: 99,
        mediaType: ['image', 'video'],
        sourceType: ['album'],
        success: (res) => {
          console.log('选择照片成功', res.tempFiles)
          useTransferStore.getState().upload(res.tempFiles)
          Taro.showToast({
              title: '请至传输列表查看上传进度',
          })
        }
      })
  }, [])  

    return (
      <>
          <View className={styles.folderList}>
            {photoFolders?.map((folder) => (
              <View 
                key={folder.id} 
                className={styles.folderItem}
                onClick={() => handleFolderClick(folder)}
              >
                <View className={styles.folderInfo}>
                  <Text className={styles.folderTitle}>{folder.name}</Text>
                </View>
                <View className={styles.folderArrow}>
                  <Text className={styles.arrowText}>›</Text>
                </View>
              </View>
            ))}
          </View>
            <View className={styles.floatingAddButton} onClick={handleUploadPhoto}>
                +
            </View>
        </>
    )
}