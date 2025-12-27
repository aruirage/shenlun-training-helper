// 云函数入口文件 - 从素材标签聚合观点库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

/**
 * 从素材库按 3维标签聚合观点
 * @param {Object} event - 入参
 *   - macroField: 宏观领域 (可选过滤条件)
 *   - policyDirection: 政策方向 (可选过滤条件)
 *   - subDirection: 分论点方向 (可选过滤条件)
 * @returns {Array} 聚合后的观点列表
 */
exports.main = async (event, context) => {
  console.log('===== 获取观点库 =====')
  console.log('入参:', event)

  try {
    const { macroField, policyDirection, subDirection } = event

    // 构建查询条件
    let query = db.collection('materials')

    if (macroField && macroField !== '全部') {
      query = query.where({
        macroField
      })
    }

    if (policyDirection && policyDirection !== '全部') {
      query = query.where({
        policyDirection
      })
    }

    if (subDirection && subDirection !== '全部') {
      query = query.where({
        subDirection
      })
    }

    // 获取素材
    const res = await query.get()
    const materials = res.data

    // 按 3维标签聚合
    const viewpointsMap = {}

    materials.forEach(material => {
      const key = `${material.macroField}|${material.policyDirection}|${material.subDirection}`

      if (!viewpointsMap[key]) {
        viewpointsMap[key] = {
          macroField: material.macroField,
          policyDirection: material.policyDirection,
          subDirection: material.subDirection,
          subPointSentence: `关于${material.subDirection}的分论点示例。`, // 可从数据库获取或生成
          materialCount: 0
        }
      }

      viewpointsMap[key].materialCount++
    })

    // 转换为数组
    const viewpoints = Object.values(viewpointsMap).sort((a, b) => {
      return b.materialCount - a.materialCount
    })

    console.log(`✅ 获取观点 ${viewpoints.length} 条`)

    return {
      ok: true,
      viewpoints,
      total: viewpoints.length
    }
  } catch (err) {
    console.error('❌ 获取观点失败:', err)
    return {
      ok: false,
      errorCode: 'DB_ERROR',
      message: err.message || '数据库查询失败',
      viewpoints: []
    }
  }
}
