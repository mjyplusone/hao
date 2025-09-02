import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
    title: string
    subtitle?: string
    color?: string
    rightButtons?: React.ReactNode[]
    leftButton?: React.ReactNode
}

const Header: React.FC<Props> = ({ title, subtitle, color, rightButtons = [], leftButton }) => {
  return (
    <View className={styles.header}>
        <View className={styles.headerContent}>
            <View className={styles.titleSection}>
                <Text className={styles.title} style={{ color }}>{title}</Text>
                {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View className={styles.rightButtons}>
                {rightButtons && rightButtons.length > 0 && rightButtons}
            </View>
            <View className={styles.leftButton}>
                {leftButton}
            </View>
        </View>
    </View>
  )
}

export default Header