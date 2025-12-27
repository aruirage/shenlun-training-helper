// 云函数入口文件 - 更新观点库标签并同步到素材库
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 更新 viewpoint 的标签，并自动同步到所有关联的素材
 * @param {Object} event - 入参
 *   - viewpointId: string
 *   - macroField: string (新值)
 *   - policyDirection: string (新值)
 *   - subDirection: string (新值)
 *   - subPointSentence?: string (可选，更新分论点示例句)
 * @returns {Object} 结果
 *   - ok: boolean
 *   - message: string
 *   - updatedMaterials: number (同步更新的素材数)
 */
exports.main = async (event, context) => {
  console.log('===== 开始更新观点库标签 =====')
  console.log('入参:', event)

  try {
    const {
      viewpointId,
      macroField = '',
      policyDirection = '',
      subDirection = '',
      subPointSentence = ''
    } = event

    // 参数校验
    if (!viewpointId) {
      return {
        ok: false,
        message: '缺少 viewpointId'
      }
    }

    // 第一步：更新 viewpoints 集合
    console.log('步骤1：更新 viewpoints 集合')
    const updateData = {
      macroField,
      policyDirection,
      subDirection
    }

    if (subPointSentence) {
      updateData.subPointSentence = subPointSentence
    }

    await db.collection('viewpoints').doc(viewpointId).update({
      data: updateData
    })

    console.log(`✅ viewpointId=${viewpointId} 已更新`)

    // 第二步：查找关联的素材
    console.log('步骤2：查找关联的素材')
    const relationsRes = await db
      .collection('material_viewpoint_relations')
      .where({
        viewpointId
      })
      .get()

    const relations = relationsRes.data
    console.log(`找到 ${relations.length} 条关系记录`)

    // 第三步：批量更新素材
    console.log('步骤3：批量更新素材')
    let updatedCount = 0

    for (const relation of relations) {
      const materialId = relation.materialId

      await db.collection('materials').doc(materialId).update({
        data: {
          macroField,
          policyDirection,
          subDirection
        }
      })

      updatedCount++
      console.log(`✅ 已更新素材 ${materialId}`)
    }

    console.log(`✅ 共更新素材 ${updatedCount} 条`)

    return {
      ok: true,
      message: `观点库标签已更新，同步更新了 ${updatedCount} 条关联素材`,
      updatedMaterials: updatedCount,
      viewpointId
    }
  } catch (err) {
    console.error('❌ 更新观点库标签失败:', err)
    return {
      ok: false,
      message: err.message || '数据库操作失败',
      updatedMaterials: 0
    }
  }
}
