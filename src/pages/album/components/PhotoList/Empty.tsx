import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

export const Empty: React.FC = () => {
    return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>暂无照片</Text>
        </View>
      )
}