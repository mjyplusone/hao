import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { GrowthRecord } from '@/types'

interface Props {
    growthRecord?: GrowthRecord
}

const RecentGrowth: React.FC<Props> = ({ growthRecord }) => {
    if (!growthRecord) {
        return null
    }

    return (
        <View className={styles.growthList}>
            <Text className={styles.growthTitle}>身高：{growthRecord.height} cm</Text>
            <Text className={styles.growthTitle}>体重：{growthRecord.weight} kg</Text>
        </View>
    )
}

export default RecentGrowth