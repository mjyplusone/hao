import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { PhotoFolder, Photo } from '@/types'
import { usePagination } from 'ahooks'
import { getPhotos } from '@/service'
import { List } from './List'
import styles from './index.module.scss'
import Taro from '@tarojs/taro'

interface Props {
    folder: PhotoFolder
    selectionMode: 'select' | 'selectAll' | null
}

export const PhotoList: React.FC<Props> = ({ 
    folder, 
    selectionMode,
}) => {
    const [photoList, setPhotoList] = useState<Photo[]>([])
    const [noMore, setNoMore] = useState(false)
    
    const { loading, pagination, run} = usePagination(
        async ({ current, pageSize }) => {
            Taro.showLoading({
                title: '加载中...',
              })

            const photos = await getPhotos({ 
                folderId: folder.id, 
                page: current ?? 1
            })
            
            // 如果是第一页，直接设置；否则追加
            const currentPhotoList = current === 1 ? photos : [...photoList, ...photos]
            setPhotoList(currentPhotoList)
            
            // 判断是否还有更多数据
            setNoMore(photos.length < pageSize)

            Taro.hideLoading()
   
            return {
                list: currentPhotoList,
                total: photos.length < pageSize 
                    ? currentPhotoList.length
                    : currentPhotoList.length + pageSize,
            }
        },
        {
            manual: true,
            defaultPageSize: 20,
        }
    )

    React.useEffect(() => {
        run({ current: 1, pageSize: 20 })
    }, [folder])

    
    // 加载更多的函数
    const loadMore = React.useCallback(() => {
            if (!noMore && !loading) {
            run({ current: pagination.current + 1, pageSize: 20 })
            
        }
    }, [noMore, loading])

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
                    {folder.name}
                </Text>
            </View>

            <List
                photoList={photoList}
                selectionMode={selectionMode}
                onLoadMore={loadMore}
            />
        </View>
    )
}