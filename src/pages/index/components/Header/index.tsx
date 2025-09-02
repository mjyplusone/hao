import { View, Text, Image } from '@tarojs/components'
import { calculateAge } from '@/utils/calcAge'
import haoImg from '@/assets/hao.jpg'
import React from 'react'
import styles from './index.module.scss'

export default function Header() {
    const ageInfo = React.useMemo(() => {
        const today = new Date()
        const age = calculateAge(today)
        
        return age
    }, [])

    return (
        <View className={styles.header}>
            <View className={styles.backgroundImage}>
                <Image src={haoImg} className={styles.bgImg} />
            </View>
            <View className={styles.glassEffect}>
                <View className={styles.avatarContainer}>
                    <Image src={haoImg} className={styles.avatar} />
                </View>
                <View className={styles.infoContainer}>
                    <Text className={styles.name}>小好</Text>
                    <Text className={styles.age}>{ageInfo.years}岁{ageInfo.months}月{ageInfo.days}天</Text>
                </View>
            </View>
        </View>
    )
}