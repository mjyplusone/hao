import { View, Text } from '@tarojs/components'
import React from 'react'
import styles from './index.module.scss'
import { GrowthRecord } from '@/types'
import { calculateAge } from '@/utils/calcAge'

interface Props {
    data: GrowthRecord[]
}

const RecordList: React.FC<Props> = ({ data = [] }) => {
    const calcAge = React.useCallback((record: GrowthRecord) => {
        const age = calculateAge(new Date(record.date))
        return `${age.years}岁${age.months}月${age.days}天`
    }, [])

    return (
        <View className={styles.recordList}>
            {data.map((record) => (
                <View key={record.id} className={styles.recordCard}>
                    <View className={styles.cardHeader}>
                        <Text className={styles.recordDate}>{record.date}</Text>
                        <Text className={styles.recordAge}>
                            {calcAge(record)}
                        </Text>
                    </View>
                    
                    <View className={styles.cardContent}>
                        <View className={styles.growthItem}>
                            <Text className={styles.growthLabel}>身高</Text>
                            <Text className={styles.growthValue}>{record.height}</Text>
                            <Text className={styles.growthUnit}>cm</Text>
                        </View>
                        
                        <View className={styles.growthItem}>
                            <Text className={styles.growthLabel}>体重</Text>
                            <Text className={styles.growthValue}>{record.weight}</Text>
                            <Text className={styles.growthUnit}>kg</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    )
}

export default RecordList