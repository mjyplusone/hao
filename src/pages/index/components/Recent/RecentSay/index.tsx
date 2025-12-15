import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { Say } from '@/types'
import { formatDate } from '@/utils/format'
import { Empty } from "@/components"

interface Props {
    messageList: Say[]
}

const RecentSay: React.FC<Props> = ({ messageList = [] }) => {
    return (
        <View className={styles.messageList}>
            {messageList.length === 0 ? (
                <Empty content="暂无留言" color='#000' />
            ) : messageList.map((message) => (
                <View 
                    key={message.id} 
                    className={styles.messageItem}
                >
                    <Text className={styles.messageContent}>{message.content}</Text>
                    <Text className={styles.messageDate}>{formatDate(message.created_at)}</Text>
                    <Text className={styles.messageUsername}>{message.user_name}</Text>
                </View>
          ))}
        </View>
   )
}

export default RecentSay