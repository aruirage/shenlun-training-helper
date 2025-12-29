// pages/hot-train/index.js
const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    isPad: true,
    activeNav: '热点训练',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',

    // 训练状态
    statusTitle: '激发数字经济新动能',
    topicTitle: '数字化赋能乡村治理',
    goalText: '写出 2-3 个分论点段落，字数 80-200 字。',
    materialSnippet: '数字化赋能乡村治理，是实现乡村振兴的关键一环。通过引入大数据、物联网等技术，可以实现对乡村资源的精准管理和高效配置...',
    materialFull: '数字化赋能乡村治理，是实现乡村振兴的关键一环。通过引入大数据、物联网等技术，可以实现对乡村资源的精准管理和高效配置。例如，在环境监测方面，通过传感器实时监控水质和空气质量；在政务服务方面，通过“一网通办”让村民足不出户就能办理各项业务。这不仅提高了治理效率，也增强了村民的获得感和幸福感。',
    showFullMaterial: false,
    
    // 推荐素材
    recommendedMaterials: [
      { type: '金句', icon: '⭐', content: '“数字经济是转型升级的‘新引擎’，更是民生保障的‘压舱石’。”' },
      { type: '对策案例', icon: '✅', content: '浙江某地推广“一码办事”，将政务服务触角延伸至田间地头。' },
      { type: '金句', icon: '⭐', content: '“以数字化转型驱动生产方式、生活方式和治理方式变革。”' },
      { type: '对策案例', icon: '✅', content: '某市通过“城市大脑”实现交通拥堵指数下降15%。' },
      { type: '政策', icon: '📜', content: '《关于加快推进数字乡村建设的指导意见》明确了阶段性目标。' },
      { type: '金句', icon: '⭐', content: '“让数字红利惠及每一个偏远山村，不让一个人在数字时代掉队。”' },
      { type: '对策案例', icon: '✅', content: '电商进农村工程带动农产品上行金额突破万亿元。' },
      { type: '金句', icon: '⭐', content: '“数字技术与实体经济深度融合，是高质量发展的必由之路。”' },
      { type: '对策案例', icon: '✅', content: '工业互联网平台连接设备数超过8000万台。' },
      { type: '金句', icon: '⭐', content: '“数据要素的流动，正在重塑社会治理的每一个神经末梢。”' }
    ],

    // 写作数据
    activeTabIndex: 0,
    tabs: ['分论点 1', '分论点 2', '分论点 3'],
    paragraphs: [
      '数字化赋能，要以‘精细化’提升公共服务触达率。',
      '',
      ''
    ],
    currentParagraph: '数字化赋能，要以‘精细化’提升公共服务触达率。',
    wordCount: 23,

    // 评分结果
    showScore: false,
    scoreData: null,
    showMaterialModal: false,
    selectedMaterial: null
  },

  onLoad(options) {
    this.detectDeviceType()
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  toggleMaterialFull() {
    this.setData({
      showFullMaterial: !this.data.showFullMaterial
    });
  },

  // 切换分论点 Tab
  onTabTap(e) {
    const index = e.currentTarget.dataset.index
    const prevIndex = this.data.activeTabIndex
    
    // 保存当前段落
    const paragraphs = this.data.paragraphs
    paragraphs[prevIndex] = this.data.currentParagraph

    this.setData({
      activeTabIndex: index,
      paragraphs: paragraphs,
      currentParagraph: paragraphs[index],
      wordCount: paragraphs[index].length,
      showScore: false // 切换 Tab 时收起评分
    })
  },

  // 输入监听
  onInput(e) {
    const value = e.detail.value
    this.setData({
      currentParagraph: value,
      wordCount: value.length
    })
  },

  // 提交评分
  submitScore() {
    if (!this.data.currentParagraph.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }

    wx.showLoading({ title: 'AI 评分中...' })
    
    // 模拟热点数据（实际应从云函数或页面数据获取）
    const hotspot = {
      keyPoints: ["「数字化」", "「乡村治理」", "「公共服务」"],
      topic: this.data.topicTitle
    }

    const scoreResult = this.scoreTraining(this.data.currentParagraph, hotspot)

    setTimeout(() => {
      const mockScoreData = {
        "total": scoreResult.total,
        "details": [
          { "name": "论点准确", "score": Math.round(scoreResult.details.accuracy), "max": 30 },
          { "name": "论据充分", "score": Math.round(scoreResult.details.argument), "max": 25 },
          { "name": "对策针对", "score": Math.round(scoreResult.details.measure), "max": 20 },
          { "name": "语言规范", "score": Math.round(scoreResult.details.language), "max": 15 },
          { "name": "结构完整", "score": Math.round(scoreResult.details.structure), "max": 10 }
        ],
        "rewrite": {
          "rewritten": "数字化赋能乡村治理，应以‘精准化’为导向，打破信息孤岛，提升公共服务触达效率。通过构建统一的数字平台，实现政务服务‘一网通办’，让数据多跑路，群众少跑腿。",
          "scoreBoost": "+15"
        },
        "materials": [
          { "id": 1, "type": "金句", "content": "“数字技术是手段，民生福祉是目的。”", "detail": "强调技术服务于人的本质。" },
          { "id": 2, "type": "案例", "content": "浙江‘千万工程’中的数字化实践。", "detail": "具体做法包括建立村级数据中心等。" },
          { "id": 3, "type": "政策", "content": "《数字乡村发展行动计划》", "detail": "政策背景支持。" },
          { "id": 4, "type": "金句", "content": "“让数字红利惠及每一个角落。”", "detail": "普惠性原则。" },
          { "id": 5, "type": "案例", "content": "某地‘城市大脑’赋能基层治理。", "detail": "城市治理的成功经验借鉴。" }
        ]
      }

      this.setData({
        scoreData: mockScoreData,
        showScore: true
      })
      wx.hideLoading()
      
      // 滚动到评分区域
      wx.createSelectorQuery().select('.score-section').boundingClientRect((rect) => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.top,
            duration: 300
          })
        }
      }).exec()
    }, 1000)
  },

  // 5维度评分标准
  scoreTraining(userAnswer, hotspot) {
    const scores = {
      accuracy: 0,      // 论点准确性 30分
      argument: 0,      // 论证充分性 25分  
      measure: 0,       // 对策针对性 20分
      language: 0,      // 语言规范性 15分
      structure: 0      // 结构完整性 10分
    }

    // 1. 论点准确性：关键词匹配热点核心
    const keyWords = hotspot.keyPoints.map(kp => kp.slice(1, -1)) // 提取「金句」
    scores.accuracy = this.keywordMatch(userAnswer, keyWords) * 30

    // 2. 论证充分性：检测案例/数据
    scores.argument = (this.containsCase(userAnswer) + this.hasData(userAnswer)) * 12.5

    // 3. 对策针对性：检测措施+目的
    scores.measure = this.measureQuality(userAnswer) * 20

    // 4. 语言规范性：句式+错别字
    scores.language = this.syntaxScore(userAnswer) * 15

    // 5. 结构完整性：总分总
    scores.structure = this.structureScore(userAnswer) * 10

    return {
      total: Math.round(scores.accuracy + scores.argument + scores.measure + scores.language + scores.structure),
      details: scores
    }
  },

  // 辅助评分函数
  keywordMatch(text, keywords) {
    if (!keywords.length) return 1
    let matchCount = 0
    keywords.forEach(kw => {
      if (text.includes(kw)) matchCount++
    })
    return matchCount / keywords.length
  },

  containsCase(text) {
    const caseKeywords = ['例如', '比如', '以...为例', '某地', '通过', '实践']
    return caseKeywords.some(kw => text.includes(kw)) ? 1 : 0
  },

  hasData(text) {
    return /\d+%|\d+倍|\d+万|\d+亿/.test(text) ? 1 : 0
  },

  measureQuality(text) {
    const measureKeywords = ['要', '应', '通过', '建立', '完善', '加强', '提升']
    const purposeKeywords = ['从而', '实现', '达到', '为了', '以期']
    const hasMeasure = measureKeywords.some(kw => text.includes(kw))
    const hasPurpose = purposeKeywords.some(kw => text.includes(kw))
    return (hasMeasure ? 0.6 : 0) + (hasPurpose ? 0.4 : 0)
  },

  syntaxScore(text) {
    // 简单判断字数和标点
    if (text.length < 50) return 0.5
    if (text.includes('，') && text.includes('。')) return 1
    return 0.8
  },

  structureScore(text) {
    // 简单判断是否包含逻辑连接词
    const logicWords = ['首先', '其次', '最后', '一方面', '另一方面', '综上所述', '总之']
    let count = 0
    logicWords.forEach(kw => {
      if (text.includes(kw)) count++
    })
    return count >= 2 ? 1 : (count === 1 ? 0.7 : 0.5)
  },

  // 收起点评
  collapseReview() {
    this.setData({
      showScore: false
    })
  },

  // 点击推荐素材
  onMaterialClick(e) {
    const material = e.currentTarget.dataset.item
    this.setData({
      selectedMaterial: material,
      showMaterialModal: true
    })
  },

  // 关闭素材弹窗
  closeMaterialModal() {
    this.setData({
      showMaterialModal: false
    })
  },

  // 复制素材
  copyMaterial() {
    const content = this.data.selectedMaterial.content
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板' })
        this.closeMaterialModal()
      }
    })
  },

  // 完成本段
  finishParagraph() {
    const paragraphs = this.data.paragraphs
    paragraphs[this.data.activeTabIndex] = this.data.currentParagraph
    this.setData({ paragraphs })
    
    wx.showToast({
      title: '本段已完成',
      icon: 'success'
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 暂存
  saveDraft() {
    this.finishParagraph()
    wx.showToast({
      title: '已暂存',
      icon: 'success'
    })
  },

  // 生成 AI 点评
  generateAIComment() {
    wx.showLoading({ title: 'AI 正在分析中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '点评生成成功',
        icon: 'success'
      })
    }, 2000)
  },

  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (name === '热点训练' || !route) return
    wx.navigateTo({ url: route })
  }
})
