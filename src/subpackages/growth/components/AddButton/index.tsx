import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface Props {
    refresh: () => void
}

const AddButton: React.FC<Props> = ({ refresh }) => {
    const handleAddRecord = () => {
        Taro.hideTabBar()
        Taro.navigateTo({ 
            url: '/subpackages/growth/add',
            events: {
                addSuccess: () => {
                    refresh()
                }
            }
        })
    }

    return (
        <View className={styles.addButton} onClick={handleAddRecord}>
            <Text className={styles.addButtonText}>添加</Text>
        </View>
    )
}

export default AddButton
