import { View, Text, Input, Button } from '@tarojs/components'
import React from 'react'
import Taro from '@tarojs/taro'
import LoginLayout from '@/Layout/LoginLayout'
import { Header } from '@/components'
import { addGrowthRecord } from '@/service/growth'
import { useRequest } from 'ahooks'

import styles from './add.module.scss'

export default function AddGrowthRecord() {
  const [formData, setFormData] = React.useState({
    height: '',
    weight: '',
  })

  React.useEffect(() => {
    return () => {
      Taro.showTabBar()
    }
  }, [])

  const { run, loading } = useRequest(addGrowthRecord, {
    manual: true,
    onSuccess: () => {
      // 提交成功后触发事件并返回上一页
      const eventChannel = Taro.getCurrentPages()[Taro.getCurrentPages().length - 1].getOpenerEventChannel()
      eventChannel.emit('addSuccess')
      Taro.navigateBack()
    }
  })

  const handleInputChange = React.useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = React.useCallback(() => {
    if (!formData.height || !formData.weight) {
      Taro.showToast({
        title: '请输入身高和体重',
        icon: 'none',
      })
      return
    }

    // 校验身高体重
    if (
      isNaN(parseFloat(formData.height))
      || isNaN(parseFloat(formData.weight))
      || parseFloat(formData.height) <= 0
      || parseFloat(formData.weight) <= 0
    ) {
      Taro.showToast({
        title: '请输入正确的身高和体重',
        icon: 'none',
      })
      return
    }

    run({
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
    })
  }, [formData, run])

  return (
    <LoginLayout>
      <View className={styles.addRecord}>
        <Header title="添加记录" subtitle="记录小好的成长数据" />
        
        <View className={styles.formContainer}>
          <View className={styles.formItem}>
            <Text className={styles.label}>身高 (cm)</Text>
            <Input
              className={styles.input}
              type="digit"
              value={formData.height}
              onInput={(e) => handleInputChange('height', e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>体重 (kg)</Text>
            <Input
              className={styles.input}
              type="digit"
              value={formData.weight}
              onInput={(e) => handleInputChange('weight', e.detail.value)}
            />
          </View>

          <Button
            className={styles.submitButton}
            onClick={handleSubmit}
            loading={loading}
            disabled={!formData.height || !formData.weight}
          >
            <Text className={styles.submitText}>保存记录</Text>
          </Button>
        </View>
      </View>
    </LoginLayout>
  )
} 