import { View, Text, Image } from '@tarojs/components'
import { VirtualList } from '@tarojs/components-advanced'
import React, { useState, useCallback } from 'react'
import { Photo } from '@/types'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTransferStore } from '@/store/transfer'

// 虚拟列表配置
const ITEM_HEIGHT = 86 // 每个照片项的高度（rpx）
const screenWidth = Taro.getSystemInfoSync().screenWidth
const itemHeightPx = (screenWidth / 750) * ITEM_HEIGHT // 数字类型 px

interface Props {
    photoList: Photo[]
    selectionMode: 'select' | 'selectAll' | null
}

export const List: React.FC<Props> = ({
    photoList = [],
    selectionMode
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([]))

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
              url: `/pages/album/preview?id=${photo.id}&src=${encodeURIComponent(photo.src)}&date=${photo.date}`
            })
        }
    }, [selectionMode, handleItemSelect])

    const handleUploadPhoto = useCallback(() => {
        Taro.chooseMedia({
          count: 99,
          mediaType: ['image', 'video'],
          sourceType: ['album'],
          success: (res) => {
            console.log('选择照片成功', res.tempFiles)
            useTransferStore.getState().upload(res.tempFiles)
            Taro.showToast({
                title: '请至传输列表查看上传进度',
            })
          }
        })
    }, [])

    const handleDownload = () => {
        if (selectedItems.size === 0) {
            Taro.showToast({
                title: '请先选择要下载的文件',
                icon: 'none'
            })
            return
        }
        useTransferStore.getState().download(Array.from(selectedItems))
        Taro.showToast({
            title: '请至传输列表查看下载进度',
        })
    }

    // 渲染单个列表项
    const renderItem = ({ id, index, data }) => {
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
                <Image src={item.src} className={styles.photoThumbnail} />
                <View className={styles.photoInfo}>
                    <Text className={styles.photoDate}>{item.date}</Text>
                </View>
            </View>
        )
    }

    return (
        <>
            <VirtualList
                className={styles.photoListScrollView}
                height="calc(100vh - 200rpx)" // 使用剩余高度
                itemData={photoList}
                itemCount={photoList.length}
                itemSize={itemHeightPx}
                overscanCount={5} // 预渲染的额外项目数量
                item={renderItem}
                width="100%"
            />

            {!selectionMode && (
                <View className={styles.floatingAddButton} onClick={handleUploadPhoto}>
                    +
                </View>
            )}

            {selectionMode && selectedItems.size > 0 && (
                <View className={styles.downloadButton} onClick={handleDownload}>
                    <Text className={styles.downloadText}>下载至相册 ({selectedItems.size})</Text>
                </View>
            )}
        </>
    )
}