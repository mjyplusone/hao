import React from 'react'
import { View, Text } from '@tarojs/components'
import { PhotoFolder } from '@/types'
import { useRequest } from 'ahooks'
import { getPhotos } from '@/service'
import { List } from './List'
import { formatYearMonth } from '../../utils/formatYearMonth'
import styles from './index.module.scss'

interface Props {
    folder: PhotoFolder
    selectionMode: 'select' | 'selectAll' | null
}

export const PhotoList: React.FC<Props> = ({ 
    folder, 
    selectionMode,
}) => {
    const { data: photoList = [], loading } = useRequest(() => {
        if (!folder) {
          return Promise.resolve([])
        }
        return getPhotos({ folderId: folder.id })
    }, {
        refreshDeps: [folder],
    })

    if (loading) {
        return null
    }

    if (photoList.length === 0) {
        return (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无照片</Text>
          </View>
        )
    }

    return (
        <View className={styles.photoListContainer}>
            <View className={styles.photoListHeader}>
                <Text className={styles.currentFolderTitle}>
                    {formatYearMonth(folder.yearMonth)}
                </Text>
            </View>

            <List
                photoList={photoList}
                selectionMode={selectionMode}
            />
        </View>
    )
}