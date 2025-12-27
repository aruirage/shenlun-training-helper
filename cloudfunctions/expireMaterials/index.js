// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 时间常量（毫秒）
const DAY_MS = 24 * 60 * 60 * 1000
const DAYS_90 = 90 * DAY_MS
const DAYS_180 = 180 * DAY_MS

/**
 * 判断素材的过期状态
 */
function calculateExpireStatus(material, now) {
  const { type, createdAt, sourceDate, diyCount = 0 } = material
  const baseTime = sourceDate || createdAt
  const age = now - (baseTime || 0)
  
  // 金句/理论 永远有效
  if (type === '金句' || type === '理论') {
    return 'active'
  }
  
  // 案例或数据：90天判断
  if (type === '案例' || type === '数据') {
    if (age > DAYS_90) {
      return diyCount >= 3 ? 'old_but_hot' : 'expired'
    }
    return 'active'
  }
  
  // 政策：180天判断
  if (type === '政策') {
    if (age > DAYS_180) {
      return diyCount >= 3 ? 'old_but_hot' : 'expired'
    }
    return 'active'
  }
  
  // 默认保持活跃
  return 'active'
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('========================================')
  console.log('🔄 开始更新素材过期状态...')
  console.log('执行时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
  console.log('========================================')
  
  const result = {
    success: true,
    message: '素材过期状态更新完成',
    statistics: {
      total: 0,
      updated: 0,
      unchanged: 0,
      active: 0,
      expired: 0,
      old_but_hot: 0
    },
    errors: []
  }
  
  try {
    const now = Date.now()
    
    // 1. 获取所有素材
    console.log('\n📦 正在获取所有素材...')
    const { data: materials } = await db.collection('materials').get()
    
    result.statistics.total = materials.length
    console.log(`✅ 成功获取 ${materials.length} 条素材`)
    
    if (materials.length === 0) {
      console.log('ℹ️ 没有素材需要处理')
      return result
    }
    
    // 2. 分析每条素材并更新
    console.log('\n🔍 开始分析素材状态...')
    
    const updatePromises = []
    const statusChanges = []
    
    for (const material of materials) {
      const oldStatus = material.expireStatus || 'active'
      const newStatus = calculateExpireStatus(material, now)
      
      // 统计最终状态
      result.statistics[newStatus]++
      
      // 如果状态有变化，准备更新
      if (oldStatus !== newStatus) {
        result.statistics.updated++
        statusChanges.push({
          id: material._id,
          title: material.title?.substring(0, 30) || '(无标题)',
          type: material.type,
          oldStatus,
          newStatus,
          age: Math.floor((now - (material.sourceDate || material.createdAt)) / DAY_MS),
          diyCount: material.diyCount || 0
        })
        
        // 批量更新
        updatePromises.push(
          db.collection('materials')
            .doc(material._id)
            .update({
              data: {
                expireStatus: newStatus,
                lastExpireCheckAt: now
              }
            })
        )
      } else {
        result.statistics.unchanged++
      }
    }
    
    // 3. 执行批量更新
    if (updatePromises.length > 0) {
      console.log(`\n⚡ 正在批量更新 ${updatePromises.length} 条素材...`)
      
      await Promise.all(updatePromises)
      
      console.log('✅ 批量更新完成')
      
      // 输出状态变化详情
      console.log('\n📊 状态变化详情：')
      statusChanges.forEach((change, index) => {
        console.log(`  ${index + 1}. [${change.type}] ${change.title}`)
        console.log(`     ${change.oldStatus} → ${change.newStatus}`)
        console.log(`     年龄: ${change.age}天 | 使用次数: ${change.diyCount}`)
      })
    } else {
      console.log('\nℹ️ 所有素材状态均正常，无需更新')
    }
    
    // 4. 输出统计信息
    console.log('\n========================================')
    console.log('📈 统计结果：')
    console.log(`  总素材数: ${result.statistics.total}`)
    console.log(`  已更新: ${result.statistics.updated}`)
    console.log(`  未变化: ${result.statistics.unchanged}`)
    console.log('\n  当前状态分布：')
    console.log(`  ✅ 活跃 (active): ${result.statistics.active}`)
    console.log(`  ❌ 过期 (expired): ${result.statistics.expired}`)
    console.log(`  🔥 陈年热点 (old_but_hot): ${result.statistics.old_but_hot}`)
    console.log('========================================')
    // 按需返回简化统计
    result.expired = result.statistics.expired
    result.oldButHot = result.statistics.old_but_hot
    
  } catch (err) {
    console.error('❌ 更新过程出错:', err)
    result.success = false
    result.message = '素材过期状态更新失败'
    result.errors.push(err.message)
  }
  
  return result
}
