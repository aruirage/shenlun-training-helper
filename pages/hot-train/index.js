// pages/viewpoints/index.js
const { detectPad } = require('../../utils/device.js')
const { logStudyEvent } = require('../../utils/logger.js')

Page({
  data: {
    isPad: false,
    activeNav: '热点训练',
    
    // 右侧栏控制
    showRightPanel: false,
    rightPanelWidth: 360,
    minRightPanelWidth: 300,
    maxRightPanelWidth: 500,
    isResizing: false,
    
    // 导航项
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '💪', route: '' },
      { name: 'AI热点分论点点评', icon: '🤖', route: '/pages/comment/index' },
      { name: '真题训练', icon: '✍️', route: '/pages/full-train/index' },
      { name: '背诵本', icon: '🔖', route: '/pages/memory/index' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ],
    
    // 宏观领域Tab
    macroFields: ['民生', '科技', '生态', '治理'],
    currentMacroField: '民生',
    currentMacroFieldIndex: 0,
    
    // 观点列表
    mockViewpoints: [
      {
        macroField: '民生',
        policyDirection: '乡村振兴',
        subDirection: '产业',
        subPointSentence: '推进乡村产业振兴，夯实中国式现代化根基。',
        materialCount: 8
      },
      {
        macroField: '民生',
        policyDirection: '乡村振兴',
        subDirection: '生态',
        subPointSentence: '生态宜居是乡村振兴的重要内容，需要保护农业生产环境。',
        materialCount: 6
      },
      {
        macroField: '治理',
        policyDirection: '数字政府',
        subDirection: '治理',
        subPointSentence: '数字技术赋能政府治理，提升公共服务质量。',
        materialCount: 5
      },
      {
        macroField: '科技',
        policyDirection: '科技创新',
        subDirection: '新质生产力',
        subPointSentence: '发展新质生产力是推动高质量发展的必然要求。',
        materialCount: 7
      },
      {
        macroField: '生态',
        policyDirection: '生态保护',
        subDirection: '生态',
        subPointSentence: '生态文明建设要因地制宜，科学规划。',
        materialCount: 4
      }
    ],
    
    filteredViewpoints: [],

    // 训练模式：当前话题与分论点训练
    currentTopic: {
      title: '深化新时代数字乡村建设，绘就乡村振兴新画卷',
      summary: '随着数字技术的飞速发展，农村地区正迎来前所未有的数字化转型机遇。通过“数字+”赋能产业、治理与服务，不仅能缩小城乡数字鸿沟，更能激活乡村发展的内生动力，让广大农民共享数字红利。',
      source: '人民日报',
      date: '2025-12-26',
      field: '民生治理',
      policy: '数字中国 / 乡村振兴'
    },

    // 分论点列表
    trainingViewpoints: [
      {
        id: 1,
        title: '分论点 1',
        input: '',
        paragraph: ''
      },
      {
        id: 2,
        title: '分论点 2',
        input: '',
        paragraph: ''
      },
      {
        id: 3,
        title: '分论点 3',
        input: '',
        paragraph: ''
      }
    ],

    // 推荐素材
    recommendedMaterials: [
      '赋能产业升级',
      '缩小数字鸿沟',
      '治理之基',
      '内生动力',
      '数字红利'
    ],

    // 当前选中的分论点索引
    selectedViewpointIndex: null,

    // 当前段落输入
    paragraphInput: ''
  },

  onLoad(options) {
    this.detectDeviceType()
    this.filterViewpoints()
  },

  /**
   * 检测设备类型
   */
  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  /**
   * 切换宏观领域 Tab
   */
  onMacroFieldTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const field = this.data.macroFields[index]
    this.setData({
      currentMacroFieldIndex: index,
      currentMacroField: field
    })
    this.filterViewpoints()
  },

  /**
   * 过滤观点列表
   */
  filterViewpoints() {
    const filtered = this.data.mockViewpoints.filter(
      v => v.macroField === this.data.currentMacroField
    )
    this.setData({
      filteredViewpoints: filtered
    })
  },

  /**
   * 点击分论点方向跳转到素材库
   */
  goToMaterialsWithFilter(e) {
    const { macrofield, policydirection, subdirection } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/materials/index?macroField=${encodeURIComponent(macrofield)}&policyDirection=${encodeURIComponent(policydirection)}&subDirection=${encodeURIComponent(subdirection)}`
    })
  },

  /**
   * 选中分论点卡片
   */
  selectViewpoint(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      selectedViewpointIndex: index,
      paragraphInput: this.data.trainingViewpoints[index].paragraph || ''
    })
  },

  /**
   * 分论点输入
   */
  onViewpointInput(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const trainingViewpoints = [...this.data.trainingViewpoints]
    trainingViewpoints[index].input = value
    this.setData({ trainingViewpoints })
  },

  /**
   * 段落输入
   */
  onParagraphInput(e) {
    this.setData({
      paragraphInput: e.detail.value
    })
  },

  /**
   * 保存本段
   */
  saveParagraph() {
    const { selectedViewpointIndex, paragraphInput, trainingViewpoints } = this.data
    if (selectedViewpointIndex === null) return

    trainingViewpoints[selectedViewpointIndex].paragraph = paragraphInput
    this.setData({ trainingViewpoints })

    wx.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1500
    })
  },

  /**
   * 完成本段
   */
  completeTraining() {
    const { trainingViewpoints } = this.data
    const filledCount = trainingViewpoints.filter(v => v.input.trim().length > 0).length
    if (filledCount < 2) {
      wx.showToast({
        title: '请至少填写 2 个分论点',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '训练完成',
      icon: 'success',
      duration: 2000
    })

    // 记录日志
    logStudyEvent({
      type: 'hot_train',
      createdAt: Date.now()
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 2000)
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
   * 跳转到素材库
   */
  goToMaterials() {
    wx.navigateTo({
      url: '/pages/materials/index'
    })
  },

  goToAiComment() {
    wx.navigateTo({
      url: '/pages/comment/index',
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  previewFullText() {
    wx.navigateTo({
      url: '/pages/full-train/index',
      fail: () => {
        wx.showToast({ title: '预览页打开失败', icon: 'none' })
      }
    })
  },

  submitAiComment() {
    this.goToAiComment()
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
   * 开始拖拽调整大小
   */
  startResize() {
    this.setData({ isResizing: true })
  },

  /**
   * 拖拽调整宽度
   */
  onResize(e) {
    if (!this.data.isResizing) return
    const { clientX } = e.touches[0]
    const windowWidth = wx.getWindowSync().windowWidth
    const newWidth = windowWidth - clientX - 240 // 240px = left nav width
    const { minRightPanelWidth, maxRightPanelWidth } = this.data
    if (newWidth >= minRightPanelWidth && newWidth <= maxRightPanelWidth) {
      this.setData({ rightPanelWidth: newWidth })
    }
  },

  /**
   * 结束拖拽
   */
  endResize() {
    this.setData({ isResizing: false })
  }
})
