import { View, Text, Image, Video } from '@tarojs/components'
import styles from './index.module.scss'
import { formatDateTime } from '@/utils/format'
import { getFileType } from '@/utils/fileType'
import { Photo } from '@/types'
import { getUsername } from '@/utils/username'

interface PreviewProps {
  photo: Photo | null
  onClose: () => void
}

export const Preview: React.FC<PreviewProps> = ({ photo, onClose }) => {
  return (
    <View className={`${styles.overlay} ${!photo && styles.hidden}`}>
      <View className={styles.preview} onClick={(e) => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>预览</Text>
          <View className={styles.closeButton} onClick={onClose}>
            <Text className={styles.closeText}>✕</Text>
          </View>
        </View>
        {photo && (
          <>
            <View className={styles.photoContainer}>
              {getFileType(photo.name) === 'video' ? (
                <Video 
                  src={photo.preview_url || photo.thumbnail_url || ''}
                  className={styles.photoImage}
                />
              ) : (
                <Image 
                  src={photo.preview_url || photo.thumbnail_url || ''}
                  className={styles.photoImage}
                  mode="aspectFit"
                />
              )}
            </View>
            
            <View className={styles.photoDetails}>
              <View className={styles.detailItem}>
                <Text className={styles.detailLabel}>上传时间</Text>
                <Text className={styles.detailValue}>{formatDateTime(photo.created_at)}</Text>
              </View>
              <View className={styles.detailItem}>
                <Text className={styles.detailLabel}>上传人</Text>
                <Text className={styles.detailValue}>{getUsername(photo.user_name) || '--'}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

