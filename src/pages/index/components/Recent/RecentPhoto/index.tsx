import { View, Text, Image } from '@tarojs/components'
import styles from './index.module.scss'
import { Photo } from '@/types'

interface Props {
    photoList: Photo[]
}

const RecentPhoto: React.FC<Props> = ({ photoList = [] }) => {
    return (
        <View className={styles.photoGrid}>
          {photoList.map((photo) => (
            <View 
              key={photo.id} 
              className={styles.photoItem}
            >
              <View className={styles.photoContent}>
                <Text className={styles.photoDate}>
                  {photo.date}
                </Text>
                <Image
                  src={photo.src}
                  mode="widthFix"
                  style={{ width: "70%" }}
                  className={styles.photo}
                />
              </View>
            </View>
          ))}
        </View>
    )
}

export default RecentPhoto