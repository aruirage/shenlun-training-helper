// 云函数入口文件 - 更新素材库标签并调整关联的观点
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

/**
 * 更新素材的标签，并自动调整它关联到的 viewpoint
 * 逻辑：
 * 1. 更新素材的 macroField/policyDirection/subDirection
 * 2. 查找素材关联的 viewpointId
 * 3. 尝试找到新标签组合对应的 viewpoint（或创建新的）
 * 4. 更新 material_viewpoint_relations 表
 * 
 * @param {Object} event - 入参
 *   - materialId: string
 *   - macroField: string (新值)
 *   - policyDirection: string (新值)
 *   - subDirection: string (新值)
 * @returns {Object} 结果
 *   - ok: boolean
 *   - message: string
 *   - oldViewpointId: string
 *   - newViewpointId: string
 *   - isCreated: boolean (是否创建了新的观点)
 */
exports.main = async (event, context) => {
  console.log('===== 开始更新素材标签 =====')
  console.log('入参:', event)

  try {
    const {
      materialId,
      macroField = '',
      policyDirection = '',
      subDirection = ''
    } = event

    // 参数校验
    if (!materialId) {
      return {
        ok: false,
        message: '缺少 materialId'
      }
    }

    // 第一步：获取素材的原有关联观点
    console.log('步骤1：获取素材原有关联观点')
    const relationRes = await db
      .collection('material_viewpoint_relations')
      .where({
        materialId
      })
      .get()

    const relations = relationRes.data
    const oldRelation = relations.length > 0 ? relations[0] : null
    const oldViewpointId = oldRelation ? oldRelation.viewpointId : null

    console.log(`原有关联 viewpointId: ${oldViewpointId}`)

    // 第二步：更新素材本身
    console.log('步骤2：更新素材集合')
    await db.collection('materials').doc(materialId).update({
      data: {
        macroField,
        policyDirection,
        subDirection,
        updatedAt: db.serverDate()
      }
    })

    console.log(`✅ 素材 ${materialId} 已更新`)

    // 第三步：寻找或创建对应的观点
    console.log('步骤3：寻找或创建对应的观点')

    // 先尝试找到新标签组合对应的观点
    // 查询 subDirection 相同的观点（作为同一分论点的观点）
    const viewpointRes = await db
      .collection('viewpoints')
      .where({
        macroField,
        policyDirection,
        subDirection
      })
      .get()

    const viewpoints = viewpointRes.data
    let newViewpointId = null
    let isCreated = false

    if (viewpoints.length > 0) {
      // 找到现有观点，使用第一个
      newViewpointId = viewpoints[0]._id
      console.log(`✅ 找到现有观点: ${newViewpointId}`)
    } else {
      // 需要创建新观点
      console.log('创建新观点...')

      const newViewpoint = {
        macroField,
        policyDirection,
        subDirection,
        subPointSentence: '（待补充）',
        relatedMaterials: [materialId],
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }

      const addRes = await db.collection('viewpoints').add({
        data: newViewpoint
      })

      newViewpointId = addRes._id
      isCreated = true
      console.log(`✅ 创建新观点: ${newViewpointId}`)
    }

    // 第四步：更新关系表
    console.log('步骤4：更新关系表')

    if (oldRelation) {
      // 关系记录已存在，直接更新
      if (oldViewpointId !== newViewpointId) {
        // viewpoint 发生了变化，需要更新
        await db
          .collection('material_viewpoint_relations')
          .doc(oldRelation._id)
          .update({
            data: {
              viewpointId: newViewpointId,
              updatedAt: db.serverDate()
            }
          })
        console.log(`✅ 关系记录已更新: ${oldViewpointId} → ${newViewpointId}`)
      } else {
        console.log(`ℹ️ viewpoint 未变化，关系记录保持不变`)
      }
    } else {
      // 关系记录不存在，创建新的
      await db.collection('material_viewpoint_relations').add({
        data: {
          materialId,
          viewpointId: newViewpointId,
          weight: 1,
          createdAt: db.serverDate()
        }
      })
      console.log(`✅ 新建关系记录: ${materialId} → ${newViewpointId}`)
    }

    console.log('✅ 标签同步完成')

    return {
      ok: true,
      message: '素材标签已更新并自动调整了关联观点',
      materialId,
      oldViewpointId,
      newViewpointId,
      isCreated
    }
  } catch (err) {
    console.error('❌ 更新素材标签失败:', err)
    return {
      ok: false,
      message: err.message || '数据库操作失败',
      materialId: event.materialId
    }
  }
}
