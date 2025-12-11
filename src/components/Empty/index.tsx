import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
    content: string
    color?: string
}

export const Empty: React.FC<Props> = ({ content, color }) => {
    return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyText} style={color ? { color } : {}}>{content}</Text>
        </View>
      )
}