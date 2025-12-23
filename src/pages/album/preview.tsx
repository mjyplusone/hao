import { View, Text, Image, Video } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import styles from './preview.module.scss'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { formatDateTime } from '@/utils/format'
import { getFileType } from '@/utils/fileType'

interface PhotoData {
  id: string
  src: string
  date: string
  name: string
}

export default function PhotoPreview() {
  const router = useRouter()
  const [photoData, setPhotoData] = useState<PhotoData | null>(null)

  useEffect(() => {
    if (router.params) {
      const { id, src, date, name } = router.params
      setPhotoData({
        id: id || '',
        src: decodeURIComponent(src || ''),
        date: date || '',
        name: name || ''
      })
    }
  }, [router.params])

  if (!photoData) {
    return (
      <LoginLayout>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </LoginLayout>
    )
  }

  return (
    <LoginLayout>
      <View className={styles.preview}>
        <Header 
          title="预览" 
        />
        
        <View className={styles.photoContainer}>
          {getFileType(photoData.name) === 'video' ? (
            <Video 
              src={photoData.src}
              className={styles.photoImage}
            />
          ) : (
            <Image 
              src={photoData.src}
              className={styles.photoImage}
              mode="aspectFit"
            />
          )}
        </View>
        
        <View className={styles.photoDetails}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>上传时间</Text>
            <Text className={styles.detailValue}>{formatDateTime(photoData.date)}</Text>
          </View>
        </View>
      </View>
    </LoginLayout>
  )
} 