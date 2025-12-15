import React from 'react'
import styles from './index.module.scss'
import { View } from '@tarojs/components'
import { GrowthRecord } from '@/types'

interface Props {
    data: GrowthRecord[]
}

const HeightChart: React.FC<Props> = ({ data = [] }) => {
    return (
        <View className={styles.chartContainer}>
            <View className={styles.chartWrapper}>
                
            </View>
        </View>
    )
}

export default HeightChart