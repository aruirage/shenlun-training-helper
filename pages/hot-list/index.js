// pages/hot-list/index.js
const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    isPad: false,
    currentDate: '',
    activeNav: '今日热点',
    
    // 右侧栏控制
    showRightPanel: false,
    rightPanelWidth: 360,
    minRightPanelWidth: 300,
    maxRightPanelWidth: 500,
    isResizing: false,
    
    // 导航项
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '' },
      { name: '热点训练', icon: '💪', route: '/pages/hot-train/index' },
      { name: 'AI热点分论点点评', icon: '🤖', route: '/pages/comment/index' },
      { name: '真题训练', icon: '✍️', route: '/pages/full-train/index' },
      { name: '背诵本', icon: '🔖', route: '/pages/memory/index' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ],
    
    // 热点列表
    hotTopics: [
      {
        id: 't1',
        title: '深化新时代数字乡村建设，绘就乡村振兴新画卷',
        summary: '随着数字技术的飞速发展，农村地区正迎来前所未有的数字化转型机遇。通过“数字+”赋能产业、治理与服务，不仅能缩小城乡数字鸿沟，更能激活乡村发展的内生动力。',
        source: '人民日报',
        date: '2025-12-26',
        field: '民生治理',
        tags: ['数字乡村', '乡村振兴']
      },
      {
        id: 't2',
        title: '以“绿色动力”驱动高质量发展，共建生态文明之基',
        summary: '生态环境部近日强调，要协同推进减污、降碳、扩绿、增长。在经济结构调整的关键期，如何平衡好“绿水青山”与“金山银山”的关系，是每一位治理者必须回答的时代命题。',
        source: '求是网',
        date: '2025-12-25',
        field: '生态环境',
        tags: ['双碳目标', '绿色发展']
      },
      {
        id: 't3',
        title: '破除“指尖上的形式主义”，为基层治理切实减负',
        summary: '政务APP、打卡任务过多曾让基层干部苦不堪言。近期中央下发通知，要求全面清理各类政务账号，将干部从繁重的线上考勤中解脱出来，回归服务群众的本职。',
        source: '学习强国',
        date: '2024-12-24',
        field: '行政效能',
        tags: ['基层减负', '作风建设']
      }
    ],
    
    // 训练流程
    trainingSteps: [
      { step: '01', title: '选择热点', desc: '根据兴趣或薄弱领域选择话题' },
      { step: '02', title: '拆分论点', desc: '分析材料并尝试提炼三个分论点' },
      { step: '03', title: '撰写片段', desc: '选一个分论点进行扩展示范' },
      { step: '04', title: 'AI 点评', desc: '系统根据评分标准给出改进建议' }
    ]
  },

  onLoad() {
    this.detectDeviceType()
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    this.setData({ currentDate: `${y}-${m}-${d}` })
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  /**
   * 切换导航项
   */
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    this.setData({ activeNav: name })
    
    if (route) {
      wx.navigateTo({
        url: route,
        fail: () => {
          wx.showToast({ title: '功能开发中', icon: 'none' })
        }
      })
    }
  },

  /**
   * 点击热点卡片
   */
  goToTrain(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/hot-train/index?id=${id}`,
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  /**
   * 查看历史热点
   */
  viewHistory() {
    wx.showToast({
      title: '历史热点功能开发中',
      icon: 'none'
    })
  },

  goHome() {
    wx.switchTab
      ? wx.switchTab({ url: '/pages/home/index' })
      : wx.navigateTo({ url: '/pages/home/index' })
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
    
    newWidth = Math.max(this.data.minRightPanelWidth, Math.min(this.data.maxRightPanelWidth, newWidth))
    
    this.setData({ rightPanelWidth: newWidth })
  },

  /**
   * 结束调整右侧栏宽度
   */
  endResize() {
    this.setData({ isResizing: false })
  }
})
