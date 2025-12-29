// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 集合配置
// 合规说明（materials来源与类型约束）：
// - sourceType='official'：仅存储官方公开站点事实类信息（人民日报/新华社/政府官网等），可用爬虫抓取原文链接，但不保存培训机构文章全文。
// - sourceType='derived'：阅读他人内容后用自己话重写（或AI生成的重写），不直接保存原文长段。
// - sourceType='user'：终端用户手动录入。

const collections = [
  {
    name: 'viewpoints',
    description: '观点库集合',
    indexes: [
      { keys: { macroField: 1 }, name: 'macroField_index' },
      { keys: { policyDirection: 1 }, name: 'policyDirection_index' },
      { keys: { subDirection: 1 }, name: 'subDirection_index' },
      { keys: { createdAt: -1 }, name: 'createdAt_desc_index' }
    ],
    sampleData: {
      macroField: '民生',
      policyDirection: '乡村振兴',
      subDirection: '产业',
      subPointSentence: '推进乡村产业振兴，夯实中国式现代化根基。',
      argumentTemplates: ['模板1', '模板2'],
      createdAt: Date.now()
    }
  },
  {
    name: 'materials',
    description: '素材库集合',
    indexes: [
      { keys: { type: 1 }, name: 'type_index' },
      { keys: { macroField: 1 }, name: 'macroField_index' },
      { keys: { policyDirection: 1 }, name: 'policyDirection_index' },
      { keys: { subDirection: 1 }, name: 'subDirection_index' },
      { keys: { tags: 1 }, name: 'tags_index' },
      { keys: { expireStatus: 1 }, name: 'expireStatus_index' },
      { keys: { createdAt: -1 }, name: 'createdAt_desc_index' },
      { keys: { lastUsedAt: -1 }, name: 'lastUsedAt_desc_index' }
    ],
    sampleData: [
      // official 示例（人民日报）
      {
        type: '政策',
        title: '人民日报：推进基层治理现代化的政策举措',
        content: '人民日报报道了多地推进基层治理现代化的政策举措与实践成效。',
        source: '人民日报',
        sourceType: 'official',
        sourceUrl: 'https://paper.people.com.cn/',
        sourceDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
        macroField: '治理',
        policyDirection: '数字政府',
        subDirection: '治理',
        tags: ['人民日报', '基层治理'],
        createdAt: Date.now(),
        lastUsedAt: 0,
        diyCount: 0,
        expireStatus: 'active',
        isMemorized: false,
        memoryLevel: 0,
        nextReviewAt: 0
      },
      // derived 示例（自写金句）
      {
        type: '金句',
        title: '自写金句：以人民为中心推进现代化',
        content: '现代化的本质是以人民为中心的发展，落脚在增进民生福祉。',
        source: '自写金句',
        sourceType: 'derived',
        sourceUrl: '',
        sourceDate: null,
        macroField: '民生',
        policyDirection: '乡村振兴',
        subDirection: '产业',
        tags: ['自写', '金句'],
        createdAt: Date.now(),
        lastUsedAt: 0,
        diyCount: 0,
        expireStatus: 'active',
        isMemorized: false,
        memoryLevel: 0,
        nextReviewAt: 0
      },
      // user 示例（用户自建）
      {
        type: '案例',
        title: '用户自建案例：社区共治示范点',
        content: '某社区通过共治共管建立示范点，提升居民满意度与参与度。',
        source: '用户自建',
        sourceType: 'user',
        sourceUrl: '',
        sourceDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        macroField: '治理',
        policyDirection: '数字政府',
        subDirection: '治理',
        tags: ['社区', '共治'],
        createdAt: Date.now(),
        lastUsedAt: 0,
        diyCount: 0,
        expireStatus: 'active',
        isMemorized: false,
        memoryLevel: 0,
        nextReviewAt: 0
      }
    ]
  },
  {
    name: 'material_viewpoint_relations',
    description: '素材-观点关系集合',
    indexes: [
      { keys: { viewpointId: 1 }, name: 'viewpointId_index' },
      { keys: { materialId: 1 }, name: 'materialId_index' },
      { keys: { weight: -1 }, name: 'weight_desc_index' }
    ],
    sampleData: {
      viewpointId: 'sample_viewpoint_id',
      materialId: 'sample_material_id',
      weight: 1.0,
      createdAt: Date.now()
    }
  },
  {
    name: 'diy_histories',
    description: 'DIY历史记录集合',
    indexes: [
      { keys: { userId: 1 }, name: 'userId_index' },
      { keys: { viewpointId: 1 }, name: 'viewpointId_index' },
      { keys: { createdAt: -1 }, name: 'createdAt_desc_index' }
    ],
    sampleData: {
      userId: 'sample_user_id',
      viewpointId: 'sample_viewpoint_id',
      slots: {
        pointId: 'sample_point_id',
        quoteId: 'sample_quote_id',
        caseId: 'sample_case_id',
        dataId: 'sample_data_id'
      },
      generatedText: '这是生成的示例文本内容',
      createdAt: Date.now()
    }
  },
  {
    name: 'hotspots',
    description: '每日热点集合',
    indexes: [
      { keys: { date: -1 }, name: 'date_desc_index' },
      { keys: { tags: 1 }, name: 'tags_index' }
    ],
    sampleData: [
      {
        title: '激发数字经济新动能，绘就民生福祉新画卷',
        summary: '今年以来，我国数字经济规模持续扩大，数字化转型在乡村治理、公共服务领域成效显著。',
        date: '2025-12-27',
        tags: ['数字经济', '乡村振兴'],
        timeline: [
          '2023年10月：政策初步调研',
          '2023年12月：试点城市启动',
          '2024年3月：全国范围推广'
        ],
        keyPoints: [
          '「数字经济是转型升级的‘新引擎’，更是民生保障的‘压舱石’。」',
          '「以数字化转型驱动生产方式、生活方式和治理方式变革。」'
        ],
        examValue: '考察重点：数字政府建设与基层减负的结合点。',
        createdAt: Date.now()
      }
    ]
  }
]

/**
 * 检查集合是否存在
 */
async function checkCollectionExists(collectionName) {
  try {
    const res = await db.collection(collectionName).limit(1).get()
    return true
  } catch (err) {
    if (err.errCode === -1) {
      return false
    }
    throw err
  }
}

/**
 * 创建集合
 */
async function createCollection(collectionName) {
  try {
    await db.createCollection(collectionName)
    console.log(`✅ 集合 ${collectionName} 创建成功`)
    return true
  } catch (err) {
    console.error(`❌ 集合 ${collectionName} 创建失败:`, err)
    return false
  }
}

/**
 * 初始化示例数据
 */
async function initSampleData(collectionName, sampleData) {
  try {
    const count = await db.collection(collectionName).count()
    if (count.total === 0) {
      if (Array.isArray(sampleData)) {
        for (const doc of sampleData) {
          await db.collection(collectionName).add({ data: doc })
        }
        console.log(`✅ 集合 ${collectionName} 示例数据批量插入成功（${sampleData.length} 条）`)
      } else {
        await db.collection(collectionName).add({ data: sampleData })
        console.log(`✅ 集合 ${collectionName} 示例数据插入成功`)
      }
    } else {
      console.log(`ℹ️ 集合 ${collectionName} 已有数据，跳过示例数据插入`)
    }
  } catch (err) {
    console.error(`❌ 集合 ${collectionName} 示例数据插入失败:`, err)
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('========================================')
  console.log('🚀 开始初始化数据库...')
  console.log('========================================')
  
  const results = {
    success: true,
    message: '数据库初始化完成',
    collections: [],
    errors: []
  }

  try {
    // 遍历所有集合配置
    for (const collection of collections) {
      const { name, description, sampleData } = collection
      
      console.log(`\n📦 处理集合: ${name} (${description})`)
      
      try {
        // 检查集合是否存在
        const exists = await checkCollectionExists(name)
        
        if (!exists) {
          console.log(`  ➡️ 集合不存在，开始创建...`)
          const created = await createCollection(name)
          
          if (created) {
            results.collections.push({
              name,
              status: 'created',
              message: '集合创建成功'
            })
            
            // 插入示例数据
            await initSampleData(name, sampleData)
          } else {
            results.collections.push({
              name,
              status: 'failed',
              message: '集合创建失败'
            })
            results.errors.push(`集合 ${name} 创建失败`)
          }
        } else {
          console.log(`  ✓ 集合已存在`)
          results.collections.push({
            name,
            status: 'exists',
            message: '集合已存在'
          })
          
          // 尝试插入示例数据（如果集合为空）
          await initSampleData(name, sampleData)
        }
      } catch (err) {
        console.error(`  ❌ 处理集合 ${name} 时出错:`, err)
        results.errors.push(`集合 ${name} 处理失败: ${err.message}`)
        results.collections.push({
          name,
          status: 'error',
          message: err.message
        })
      }
    }
    
    // 判断是否有错误
    if (results.errors.length > 0) {
      results.success = false
      results.message = `数据库初始化完成，但存在 ${results.errors.length} 个错误`
    }
    
  } catch (err) {
    console.error('❌ 数据库初始化过程出错:', err)
    results.success = false
    results.message = '数据库初始化失败'
    results.errors.push(err.message)
  }
  
  console.log('\n========================================')
  console.log('📊 初始化结果汇总:')
  console.log(`  成功: ${results.success}`)
  console.log(`  集合总数: ${results.collections.length}`)
  console.log(`  错误数: ${results.errors.length}`)
  console.log('========================================')
  
  return results
}
