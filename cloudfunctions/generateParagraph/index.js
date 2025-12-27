// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 构建生成段落的 Prompt
 */
function buildPrompt({ subPointText, slots, skeletonHint }) {
  const parts = []

  parts.push(
    '你现在是一名长期参加国家公务员考试命题和阅卷的申论专家，擅长写出38分以上的分论点段落。'
  )

  parts.push(
    '请根据下面提供的分论点、论点提示、金句、案例、数据，写一段公务员考试申论的【分论点段落】。'
  )

  parts.push(`【分论点】${subPointText || '（用户未填写，可根据素材概括一个分论点）'}`)

  if (skeletonHint) {
    parts.push('【结构提示】请尽量按照下面的结构组织段落：')
    parts.push(skeletonHint)
  }

  if (slots?.point?.content) {
    parts.push('【论点提示】可以参考以下表述，进行优化和改写：')
    parts.push(slots.point.content)
  }

  if (slots?.quote?.content) {
    parts.push('【金句】请在段落中自然嵌入下面的金句（可做适度改写，但不改变核心含义）：')
    parts.push(slots.quote.content)
  }

  if (slots?.case?.content) {
    parts.push('【案例】请选取下列案例中的关键信息，用1-2句话概括说明：')
    parts.push(slots.case.content)
  }

  if (slots?.data?.content) {
    parts.push('【数据】请在论证中恰当引用以下数据，增强说服力：')
    parts.push(slots.data.content)
  }

  parts.push(
    '【写作要求】' +
      '1）输出一段完整的申论分论点段落，字数控制在200-250字；' +
      '2）语言要规范、庄重，有逻辑，有层次，避免口语化和网络用语；' +
      '3）结构上建议"提出分论点 → 理论/案例/数据论证 → 小结回扣题干"；' +
      '4）不要出现小标题，不要出现"分论点一""首先""其次""再次"等明显痕迹；' +
      '5）只输出正文段落，不要任何解释性话语。'
  )

  return parts.join('\n\n')
}

/**
 * 调用大模型生成文本（DeepSeek API）
 */
async function callLLM(prompt) {
  console.log('\n🤖 调用 DeepSeek API...')
  console.log('📝 Prompt 长度:', prompt.length, '字符')
  
  // 从环境变量或使用占位符（部署时替换）
  const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-567d3b31d2634b039910b1acf4a110af'
  const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1/chat/completions'
  
  try {
    const res = await axios({
      method: 'post',
      url: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: 'deepseek-v3.2',  // 可替换为其他模型名
        messages: [
          { 
            role: 'system', 
            content: '你是一名资深公务员申论阅卷专家，负责根据用户提供的素材生成高质量申论文段。' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      },
      timeout: 30000  // 30秒超时
    })
    
    // 提取生成的文本
    const text =
      res.data &&
      res.data.choices &&
      res.data.choices[0] &&
      res.data.choices[0].message &&
      res.data.choices[0].message.content
    
    // 如果没有正常内容，返回兜底文案
    if (!text) {
      console.warn('⚠️ API 返回格式异常，使用兜底文案')
      return '【系统提示】生成失败，请稍后重试。'
    }
    
    console.log('✅ DeepSeek API 调用成功')
    console.log('📊 生成字数:', text.trim().length)
    
    return text.trim()
    
  } catch (err) {
    console.error('❌ callLLM error:', err && err.response && err.response.data || err.message)
    
    // 出错时返回兜底文案，避免前端崩溃
    return '【系统提示】当前生成服务繁忙，请稍后再试，建议先用已有金句和案例自行组织一段文字。'
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('========================================')
  console.log('✨ 开始生成申论段落...')
  console.log('执行时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
  console.log('========================================')
  
  try {
    // 从 event 中解构参数
    const { subPointText, slots = {}, skeletonHint = '', usedMaterialIds = [] } = event
    
    // 参数验证
    if (!subPointText || typeof subPointText !== 'string' || subPointText.trim().length === 0) {
      console.error('❌ 参数错误：缺少分论点文本')
      return {
        ok: false,
        error: '请输入分论点'
      }
    }
    
    console.log('\n📋 接收参数：')
    console.log('  分论点:', subPointText)
    console.log('  骨架提示:', skeletonHint ? '有' : '无')
    console.log('  槽位情况:')
    console.log('    - 论点:', slots.point ? '✓' : '✗')
    console.log('    - 金句:', slots.quote ? '✓' : '✗')
    console.log('    - 案例:', slots.case ? '✓' : '✗')
    console.log('    - 数据:', slots.data ? '✓' : '✗')
    
    // 1. 构建 Prompt
    console.log('\n🔨 构建 Prompt...')
    const prompt = buildPrompt({ subPointText, slots, skeletonHint })
    console.log('✅ Prompt 构建完成')
    
    // 2. 调用大模型
    const text = await callLLM(prompt)
    
    // 3. 返回结果
    console.log('\n📊 生成结果：')
    console.log('  字数:', text.length)
    console.log('  内容预览:', text.substring(0, 100) + '...')
    
    // 3. 成功后更新素材使用统计
    const cloud = require('wx-server-sdk')
    cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
    const db = cloud.database()
    const _ = db.command

    let updatedCount = 0
    if (Array.isArray(usedMaterialIds) && usedMaterialIds.length > 0) {
      console.log('\n🧮 更新素材使用统计，数量:', usedMaterialIds.length)
      const now = Date.now()
      for (const mid of usedMaterialIds) {
        try {
          await db.collection('materials').doc(mid).update({
            data: {
              lastUsedAt: now,
              diyCount: _.inc(1)
            }
          })
          updatedCount++
        } catch (uErr) {
          console.warn('更新素材统计失败，跳过:', mid, uErr?.message || uErr)
        }
      }
      console.log('✅ 使用统计更新完成，成功数量:', updatedCount)
    }

    console.log('\n========================================')
    console.log('✅ 段落生成成功')
    console.log('========================================')
    
    return {
      ok: true,
      text,
      updatedUsage: updatedCount
    }
    
  } catch (err) {
    console.error('\n❌ 生成失败:', err)
    return {
      ok: false,
      error: err.message || '生成失败，请稍后重试'
    }
  }
}
