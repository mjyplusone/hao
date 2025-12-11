import { View, Text, Image } from '@tarojs/components'
import { VirtualList } from '@tarojs/components-advanced'
import React, { useState, useCallback, useRef } from 'react'
import { Photo } from '@/types'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTransferStore } from '@/store/transfer'
import { formatDateTime } from '../../utils/formatYearMonth'
import { BASE_URL } from '@/utils/request'

// 虚拟列表配置
const ITEM_HEIGHT = 100 // 每个照片项的高度（rpx）
const screenWidth = Taro.getSystemInfoSync().screenWidth
const itemHeightPx = (screenWidth / 750) * ITEM_HEIGHT // 数字类型 px

interface Props {
    photoList: Photo[]
    selectionMode: 'select' | 'selectAll' | null
    onLoadMore?: () => void
}

export const List: React.FC<Props> = ({
    photoList = [],
    selectionMode,
    onLoadMore,
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([]))
    const scrollInfoRef = useRef({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 })

    React.useEffect(() => {
        if (selectionMode === 'selectAll') {
            setSelectedItems(new Set(photoList.map((photo) => photo.id)))
        } else {
            setSelectedItems(new Set())
        }
    }, [selectionMode])

    const handleItemSelect = useCallback((itemId: number) => {
        const newSelectedItems = new Set(selectedItems)
        if (newSelectedItems.has(itemId)) {
            newSelectedItems.delete(itemId)
        } else {
            newSelectedItems.add(itemId)
        }
        setSelectedItems(newSelectedItems)
    }, [selectedItems])

    const handlePhotoClick = useCallback((photo: Photo) => {
        if (selectionMode) {
            handleItemSelect(photo.id)
        } else {
            Taro.navigateTo({
              url: `/pages/album/preview?id=${photo.id}&src=${encodeURIComponent(photo.thumbnail_url || '')}&date=${photo.created_at || ''}`
            })
        }
    }, [selectionMode, handleItemSelect])

    const handleDownload = () => {
        if (selectedItems.size === 0) {
            Taro.showToast({
                title: '请先选择要下载的文件',
                icon: 'none'
            })
            return
        }
        const selectedFiles = Array.from(selectedItems).map((id) => {
            const photo = photoList.find((photo) => photo.id === id);
            return {
                id,
                size: photo?.size || 0,
                name: photo?.name,
            };
        })
        useTransferStore.getState().download(selectedFiles)
        Taro.showToast({
            title: '可至传输列表查看下载进度',
        })
        setSelectedItems(new Set())
    }

    // 处理滚动事件，更新滚动位置信息
    const handleScroll = useCallback((e: any) => {
        const detail = e.detail || e
        scrollInfoRef.current = {
            scrollTop: detail.scrollTop || detail.scrollOffset || 0,
            scrollHeight: detail.scrollHeight || photoList.length * itemHeightPx,
            clientHeight: detail.clientHeight || detail.height || 0,
        }
    }, [photoList.length, itemHeightPx])

    // 处理触摸结束事件，检测是否滚动到底部
    const handleTouchEnd = useCallback(() => {
        onLoadMore?.()
        // const { scrollTop, scrollHeight, clientHeight } = scrollInfoRef.current
        
        // // 当滚动到距离底部 200px 以内时，触发加载更多
        // const distanceToBottom = scrollHeight - scrollTop - clientHeight
        // if (distanceToBottom < 200) {
        //     if (onLoadMore && !loadingMore && !noMore) {
        //         onLoadMore()
        //     }
        // }
    }, [onLoadMore])


    // 渲染单个列表项
    const renderItem = ({ index, data }) => {
        const item = data[index]
        return (
            <View 
                className={`${styles.photoItem} ${selectionMode ? styles.selectionMode : ''}`}
                onClick={() => handlePhotoClick(item)}
            >
                {selectionMode && (
                    <View className={styles.checkbox}>
                        <View className={`${styles.checkboxInner} ${selectedItems.has(item.id) ? styles.checked : ''}`}>
                            {selectedItems.has(item.id) && (
                                <Text className={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    </View>
                )}
                <Image src={`${BASE_URL}${item.thumbnail_url}`} className={styles.photoThumbnail} />
                <View className={styles.photoInfo}>
                    <Text className={styles.photoDate}>{formatDateTime(item.created_at)}</Text>
                </View>
            </View>
        )
    }

    return (
        <>
            <VirtualList
                key={photoList.length}
                className={styles.photoListScrollView}
                height="calc(100vh - 200rpx)" // 使用剩余高度
                itemData={photoList}
                itemCount={photoList.length}
                itemSize={itemHeightPx}
                overscanCount={5} // 预渲染的额外项目数量
                item={renderItem}
                width="100%"
                onScroll={handleScroll}
                onTouchEnd={handleTouchEnd}
            />

            {selectionMode && selectedItems.size > 0 && (
                <View className={styles.downloadButton} onClick={handleDownload}>
                    <Text className={styles.downloadText}>下载至相册 ({selectedItems.size})</Text>
                </View>
            )}
        </>
    )
}