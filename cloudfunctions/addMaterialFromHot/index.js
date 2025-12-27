// 云函数入口文件 - 从热点添加素材到素材库
// 合规说明：
// - sourceType='official'：仅存储来自官方公开站点（人民日报/新华社/政府官网等）的事实类信息（案例/数据/政策条文）。允许爬虫抓取，但禁止复制培训机构文章全文。
// - sourceType='derived'：由开发者或AI“学习后重写”的原创表达，不直接保存原文长段。
// - sourceType='user'：终端用户手动录入。
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const MAX_MATERIALS = 300
const TARGET_AFTER_CLEAN = 240

/**
 * 从热点页面添加素材到材料库
 * @param {Object} event - 入参
 *   - type: 素材类型 (案例/金句/数据/政策等)
 *   - title: 素材标题
 *   - content: 素材内容
 *   - macroField: 宏观领域 (民生/科技/生态/治理等)
 *   - policyDirection: 政策方向 (乡村振兴/科技创新等)
 *   - subDirection: 分论点方向 (产业/生态/治理/新质生产力等)
 *   - topic: 话题 (可选，用于tags)
 * @returns {Object} 返回结果
 */
exports.main = async (event, context) => {
  console.log('===== 开始添加素材 =====')
  console.log('入参:', event)

  try {
    const {
      type = '',
      title = '',
      content = '',
      macroField = '',
      policyDirection = '',
      subDirection = '',
      topic = '',
      source = '首页热点',
      sourceType = 'derived',
      sourceUrl = '',
      sourceDate = null
    } = event

    // 参数校验
    if (!type || !title || !content) {
      return {
        ok: false,
        errorCode: 'MISSING_PARAMS',
        message: '缺少必要参数: type, title, content'
      }
    }

    // 构建 tags 数组
    const tags = []
    if (topic) tags.push(topic)
    if (macroField) tags.push(macroField)
    if (policyDirection) tags.push(policyDirection)
    if (subDirection) tags.push(subDirection)

    // 先进行智能时效刷新，保证过期状态最新
    try {
      await cloud.callFunction({ name: 'expireMaterials' })
      console.log('✅ 已触发智能时效刷新')
    } catch (e) {
      console.warn('⚠️ 智能时效刷新失败或函数不存在，继续插入流程', e?.message || e)
    }

    // 总量与清理逻辑
    let needClean = false
    try {
      const countRes = await db.collection('materials').count()
      const total = countRes.total || 0
      console.log('当前素材总量:', total)

      if (total >= MAX_MATERIALS) {
        const requiredDeletions = Math.max(0, total - (TARGET_AFTER_CLEAN - 1)) // 插入后不超过240
        console.log('达到上限，尝试清理数量:', requiredDeletions)

        // 找到可清理的过期且未使用素材，按最后使用时间升序
        const deletableRes = await db
          .collection('materials')
          .where({ expireStatus: 'expired', diyCount: _.lt(1) })
          .orderBy('lastUsedAt', 'asc')
          .limit(requiredDeletions)
          .get()

        const deletable = deletableRes.data || []
        console.log('可删除候选数量:', deletable.length)

        let deletedCount = 0
        for (const doc of deletable) {
          try {
            await db.collection('materials').doc(doc._id).remove()
            deletedCount++
          } catch (remErr) {
            console.warn('删除失败，跳过:', doc._id, remErr?.message || remErr)
          }
        }

        console.log('实际删除数量:', deletedCount)
        if (deletedCount < requiredDeletions) {
          needClean = true
        }
      }
    } catch (countErr) {
      console.warn('统计或清理过程异常，跳过清理:', countErr?.message || countErr)
      needClean = true
    }

    // 构建素材对象
    const materialData = {
      type,
      title,
      content,
      macroField: macroField || '',
      policyDirection: policyDirection || '',
      subDirection: subDirection || '',
      tags: [...new Set(tags)].filter(Boolean), // 去重
      source,
      sourceType,
      sourceUrl,
      sourceDate: sourceDate || Date.now(),
      createdAt: Date.now(),
      lastUsedAt: 0,
      diyCount: 0,
      expireStatus: 'active',
      isMemorized: false,
      memoryLevel: 0,
      nextReviewAt: 0
    }

    // 插入数据库
    const result = await db.collection('materials').add({
      data: materialData
    })

    console.log('✅ 素材添加成功，ID:', result._id)

    return {
      ok: true,
      id: result._id,
      message: '素材已加入素材库',
      needClean
    }
  } catch (err) {
    console.error('❌ 添加素材失败:', err)
    return {
      ok: false,
      errorCode: 'DB_ERROR',
      message: err.message || '数据库操作失败'
    }
  }
}
