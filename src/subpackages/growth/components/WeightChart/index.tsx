import React from 'react'
import { View } from '@tarojs/components'
import styles from './index.module.scss'
import { GrowthRecord } from "@/types"

interface Props {
    data: GrowthRecord[]
}

const WeightChart: React.FC<Props> = ({ data = [] }) => {
    return (
        <View className={styles.chartContainer}>
            <View className={styles.chartWrapper}>
                
            </View>
        </View>
    )
}

export default WeightChart