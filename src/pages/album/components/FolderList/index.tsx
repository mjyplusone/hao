import { PhotoFolder } from '@/types'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { useCallback } from 'react'
import { useRequest } from 'ahooks'
import { getPhotoFolders } from '@/service'
import { useTransferStore } from '@/store/transfer'
import Taro, { useDidShow } from '@tarojs/taro'


interface Props {
    onChangeFolder: (folder: PhotoFolder | null) => void
}

const FolderList: React.FC<Props> = ({ 
    onChangeFolder,
}) => {
    const { data: photoFolders, run } = useRequest(() => {
      return getPhotoFolders()
    })

    // 页面显示时刷新数据
    useDidShow(() => {
      run()
    })

    const handleFolderClick = (folder: PhotoFolder) => {
      onChangeFolder(folder)
    }

    const handleUploadPhoto = useCallback(() => {
      Taro.chooseMedia({
        count: 99,
        mediaType: ['image', 'video'],
        sourceType: ['album'],
        success: async (res) => {
          console.log('选择照片成功', res.tempFiles)
          Taro.showToast({
              title: '可至传输列表查看上传进度',
          })
          await useTransferStore.getState().upload(res.tempFiles)
          run()
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

export default FolderList