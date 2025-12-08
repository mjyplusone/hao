import { View, Text, Image } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import styles from './preview.module.scss'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { BASE_URL } from '@/utils/request'
import { formatDateTime } from './utils/formatYearMonth'

interface PhotoData {
  id: string
  src: string
  date: string
}

export default function PhotoPreview() {
  const router = useRouter()
  const [photoData, setPhotoData] = useState<PhotoData | null>(null)

  useEffect(() => {
    if (router.params) {
      const { id, src, date } = router.params
      setPhotoData({
        id: id || '',
        src: decodeURIComponent(src || ''),
        date: date || ''
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
          title="照片预览" 
        />
        
        <View className={styles.photoContainer}>
          <Image 
            src={`${BASE_URL}${photoData.src}`} 
            className={styles.photoImage}
            mode="aspectFit"
          />
        </View>
        
        <View className={styles.photoDetails}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>拍摄时间</Text>
            <Text className={styles.detailValue}>{formatDateTime(photoData.date)}</Text>
          </View>
        </View>
      </View>
    </LoginLayout>
  )
} 