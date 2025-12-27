const { detectPad } = require('../../utils/device.js')
const { logStudyEvent } = require('../../utils/logger.js')

Page({
  data: {
    isPad: false,
    activeNav: '真题训练',

    // 导航项
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '💪', route: '/pages/hot-train/index' },
      { name: 'AI热点分论点点评', icon: '🤖', route: '/pages/comment/index' },
      { name: '真题训练', icon: '✍️', route: '' },
      { name: '背诵本', icon: '🔖', route: '/pages/memory/index' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ],

    // 右侧栏控制
    showRightPanel: true,
    rightPanelWidth: 420,
    minRightPanelWidth: 300,
    maxRightPanelWidth: 720,
    isResizing: false,

    // 题目信息
    essay: {
      year: '2024',
      paperType: '国考副省',
      title: '以"数字化转型赋能基层治理"为主题，写一篇议论文',
      prompt: '随着数字技术的快速发展，各地积极探索运用大数据、人工智能等手段提升基层治理效能。请结合给定材料，围绕"数字化转型赋能基层治理"这一主题，写一篇议论文。',
      materialSummary: '材料1：某市通过"城市大脑"系统实现交通优化，日均处理事件 1.2 万起，拥堵指数下降 15%。该系统整合公安、城管、应急等部门数据，实现跨部门协同响应。\n\n材料2：网格化管理模式在社区治理中的应用。网格员通过手机 App 上报问题，平均处理时长从 3 天缩短至 8 小时。但部分老年人不会使用智能设备，存在数字鸿沟。\n\n材料3：数字政府建设面临的挑战与对策。某县推行"最多跑一次"改革，但基层干部反映系统繁多、重复填报。专家建议加强顶层设计，打破数据孤岛。',
      materialExpanded: false
    },

    // 主论点
    mainArgument: '',

    // 手写勾画模式
    drawMode: false,

    // 分论点写作区（新结构）
    sections: [
      {
        id: 1,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        structureHint: '总起句 → 理由/数据支撑 → 举例论证 → 小结',
        content: '',
        showTip: true,
        completed: false
      },
      {
        id: 2,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        structureHint: '引出问题 → 分析原因 → 提出对策 → 展望效果',
        content: '',
        showTip: true,
        completed: false
      },
      {
        id: 3,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        structureHint: '对比开头 → 正面意义 → 潜在风险 → 平衡结论',
        content: '',
        showTip: true,
        completed: false
      }
    ],

    // 段落结构提示池（用于"换一套"）
    structureHintPool: [
      '总起句 → 理由/数据支撑 → 举例论证 → 小结',
      '引出问题 → 分析原因 → 提出对策 → 展望效果',
      '对比开头 → 正面意义 → 潜在风险 → 平衡结论',
      '观点陈述 → 正例举证 → 反例对比 → 深化升华',
      '现象描述 → 本质剖析 → 对策建议 → 总结回扣',
      '排比句引入 → 分层论述 → 古今对比 → 强化论点'
    ],

    // 底部统计
    completedCount: 0,
    wordCount: 0
  },

  onLoad() {
    console.log('全文训练页加载（重构版：手写支架工具）')
    this.detectDeviceType()
    this.updateDraftStats()
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  /**
   * 展开/折叠材料
   */
  toggleMaterial() {
    this.setData({
      'essay.materialExpanded': !this.data.essay.materialExpanded
    })
  },

  /**
   * 主论点输入
   */
  onMainArgumentInput(e) {
    this.setData({
      mainArgument: e.detail.value
    })
  },

  /**
   * AI 推荐主论点（保留）
   */
  recommendMainArgument() {
    wx.showToast({
      title: 'AI 推荐功能开发中',
      icon: 'none'
    })
  },

  /**
   * 切换手写勾画模式
   */
  toggleDrawMode() {
    this.setData({
      drawMode: !this.data.drawMode
    })
    wx.showToast({
      title: this.data.drawMode ? '已开启勾画模式' : '已关闭勾画模式',
      icon: 'none'
    })
  },

  /**
   * 【收藏入口 A】收藏为案例（事件材料）
   * 保存题目材料到素材库，类型为 raw_event
   */
  collectEventMaterial() {
    const materialData = {
      materialKind: 'raw_event',  // 原始案例类型
      title: this.data.essay.title,
      content: this.data.essay.materialSummary,
      macroField: '治理',
      policyDirection: '数字政府',
      source: `${this.data.essay.year} ${this.data.essay.paperType}`,
      fromTrain: true,  // 标记来自训练页
      tags: ['数字化', '基层治理'],
      createTime: new Date().toISOString()
    }

    // TODO: 调用云函数保存
    wx.cloud.callFunction({
      name: 'saveMaterial',
      data: materialData
    }).then(res => {
      wx.showToast({
        title: '已收藏为案例素材',
        icon: 'success'
      })
    }).catch(err => {
      console.error('收藏失败', err)
      wx.showToast({
        title: '收藏失败',
        icon: 'none'
      })
    })
  },

  /**
   * 【收藏入口 B】收藏金句片段
   * 从用户输入的段落内容中收藏精彩片段
   */
  collectCommentSnippet(e) {
    const { sectionId } = e.currentTarget.dataset
    const section = this.data.sections.find(s => s.id === sectionId)
    
    if (!section || !section.content.trim()) {
      wx.showToast({
        title: '请先填写段落内容',
        icon: 'none'
      })
      return
    }

    // 提取用户选中的文字（如果有），否则保存全部内容
    // 注：小程序暂不支持直接获取 textarea 选中文本，可通过弹窗二次确认
    const snippetData = {
      materialKind: 'comment_snippet',  // 金句片段类型
      content: section.content,
      macroField: section.macroField,
      policyDirection: section.policyDirection,
      source: '我的写作练习',
      fromTrain: false,  // 来自自己写作，不是原始材料
      tags: ['自己写的', section.macroField],
      createTime: new Date().toISOString()
    }

    // TODO: 调用云函数保存
    wx.cloud.callFunction({
      name: 'saveMaterial',
      data: snippetData
    }).then(res => {
      wx.showToast({
        title: '已收藏为金句素材',
        icon: 'success'
      })
    }).catch(err => {
      console.error('收藏失败', err)
      wx.showToast({
        title: '收藏失败',
        icon: 'none'
      })
    })
  },

  saveSection(e) {
    const { id } = e.currentTarget.dataset
    const sectionId = Number(id)
    const section = this.data.sections.find(s => s.id === sectionId)
    if (!section || !section.content.trim()) {
      wx.showToast({ title: '请先填写段落内容', icon: 'none' })
      return
    }
    wx.showToast({ title: '已保存本段', icon: 'success' })
  },

  completeSection(e) {
    const { id } = e.currentTarget.dataset
    const sectionId = Number(id)
    const sections = this.data.sections.map(section =>
      section.id === sectionId ? { ...section, completed: true } : section
    )
    this.setData({ sections }, () => {
      this.updateDraftStats()
    })
    wx.showToast({ title: '已完成本段', icon: 'success' })
  },

  previewFullEssay() {
    const previewLines = []
    previewLines.push(`主论点：${this.data.mainArgument || '尚未填写'}`)
    this.data.sections.forEach(section => {
      const snippet = (section.content || '').slice(0, 60)
      const tail = (section.content || '').length > 60 ? '...' : ''
      previewLines.push(`分论点 ${section.id}：${snippet || '待填写'}${tail}`)
    })
    wx.showModal({
      title: '全文预览',
      content: previewLines.join('\n\n'),
      showCancel: false
    })
  },

  submitAiComment() {
    wx.navigateTo({
      url: '/pages/comment/index',
      fail: () => {
        wx.showToast({ title: 'AI点评无法打开', icon: 'none' })
      }
    })
  },

  /**
   * 切换结构提示（换一套）
   */
  switchStructureHint(e) {
    const { id } = e.currentTarget.dataset
    const sections = [...this.data.sections]
    const section = sections.find(s => s.id === id)
    
    if (section) {
      const currentIndex = this.data.structureHintPool.indexOf(section.structureHint)
      const nextIndex = (currentIndex + 1) % this.data.structureHintPool.length
      section.structureHint = this.data.structureHintPool[nextIndex]
      this.setData({ sections })
    }
  },

  /**
   * 分论点标题输入
   */
  onSectionTitleInput(e) {
    const { id } = e.currentTarget.dataset
    const { value } = e.detail
    const sections = [...this.data.sections]
    const section = sections.find(s => s.id === id)
    if (section) {
      section.title = value
      this.setData({ sections })
    }
  },

  /**
   * 段落内容输入
   */
  onSectionInput(e) {
    const { id } = e.currentTarget.dataset
    const { value } = e.detail
    const sections = [...this.data.sections]
    const section = sections.find(s => s.id === id)
    if (section) {
      section.content = value
      this.setData({ sections })
      this.updateDraftStats()
    }
  },

  /**
   * 更新统计数据
   */
  updateDraftStats() {
    const completed = this.data.sections.filter(s => (s.content || '').length > 50).length
    const words = this.data.sections.reduce((acc, s) => acc + ((s.content || '').length), 0)
    this.setData({ 
      completedCount: completed, 
      wordCount: words 
    })
  },

  /**
   * 页面跳转
   */
  navigateTo(e) {
    const { page } = e.currentTarget.dataset
    if (page) {
      wx.navigateTo({
        url: page
      })
    }
  },

  /**
   * 切换右侧栏显示/隐藏
   */
  toggleRightPanel() {
    this.setData({
      showRightPanel: !this.data.showRightPanel
    })
  },

  /**
   * 开始调整右侧栏宽度
   */
  startResize(e) {
    this.setData({ isResizing: true })
    this.resizeStartX = e.touches[0].pageX
    this.resizeStartWidth = this.data.rightPanelWidth
  },

  /**
   * 调整右侧栏宽度中
   */
  onResize(e) {
    if (!this.data.isResizing) return
    
    const deltaX = this.resizeStartX - e.touches[0].pageX
    let newWidth = this.resizeStartWidth + deltaX
    
    // 限制宽度范围
    newWidth = Math.max(this.data.minRightPanelWidth, Math.min(this.data.maxRightPanelWidth, newWidth))
    
    this.setData({ rightPanelWidth: newWidth })
  },

  /**
   * 结束调整右侧栏宽度
   */
  endResize() {
    this.setData({ isResizing: false })
  },

  /**
   * 导航项点击处理
   */
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (route) {
      wx.navigateTo({
        url: route
      })
    }
  },

  /**
   * 完成练习
   */
  completeTraining() {
    // 简单校验
    if (this.data.completedCount === 0) {
      wx.showToast({
        title: '请至少写一段内容',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '练习完成',
      icon: 'success'
    })

    // 记录日志
    logStudyEvent({
      type: 'full_train',
      createdAt: Date.now()
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  },

  /**
   * 切换分论点提示隐藏/显示
   */
  toggleSectionTip(e) {
    const id = Number(e.currentTarget.dataset.id)
    const sections = this.data.sections.map(section => {
      if (section.id === id) {
        return { ...section, showTip: !section.showTip }
      }
      return section
    })
    this.setData({ sections })
  },

})
