// pages/home/index.js
const { detectPad } = require('../../utils/device.js')
const { computeStatsFromLogs } = require('../../utils/logger.js')

Page({
  data: {
    currentDate: '',
    isPad: false,
    activeNav: '首页',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',
    
    // 右侧栏控制
    showRightPanel: true,
    rightPanelWidth: 320,
    minRightPanelWidth: 280,
    maxRightPanelWidth: 480,
    isResizing: false,
    
    userName: '志在必得',
    practiceDays: 14,
    todayStats: {
      total: 12, // 今日练习总次数
      memory: 25, // 今日背诵完成条数
      hot: 3     // 热点训练篇数
    },
    memoryProgress: 68,
    aiSuggestion: "你本周在 ‘数字经济’ 话题练习较多，表达风格渐趋稳健；建议搭配 2 组 ‘民生类’ 案例，丰富论证维度。",
    hotCount: 8,
    pendingMemoryCount: 12,
    weekTrend: [40, 65, 50, 85, 70, 45, 90], // 模拟练习趋势数据
    
    // 导航项
     navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '🖋️', route: '' },
      { name: '素材库', icon: '📚', route: '/pages/materials/index' },
      { name: '背诵本', icon: '🔖', route: '/pages/memory/index' },
      { name: 'AI建议', icon: '✨', route: '' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ],
    
    // 快捷操作
    quickActions: [
      { title: '今日热点', desc: '分论点强化训练', icon: '🔥', color: '#F1F5F9', route: '/pages/hot-list/index' },
      { title: '分论点结构训练', desc: '限时模拟练题', icon: '✍️', color: '#F2F6F1', route: '/pages/hot-train/index' },
      { title: '背诵本', desc: '巩固已收藏金句', icon: '🔖', color: '#F5F2F9', route: '/pages/memory/index' }
    ],
    
    // 最近练习
    recentExercises: [
      { title: '论数字化时代的基层减负', type: '热点', time: '2小时前', status: '已完成', statusType: 'completed' },
      { title: '2023年国考真题：文化自信', type: '真题', time: '昨天', status: '待批改', statusType: 'pending' },
      { title: '乡村振兴与产业兴旺的逻辑', type: '热点', time: '3天前', status: '已完成', statusType: 'completed' }
    ],
    
    // 今日提醒（结构化）
    todayReminder: {
      title: '今日提醒',
      text: '',          // 主文案
      actionText: '前往背诵本 >',
      actionPage: '/pages/memory/index'
    },
    
    // 本周统计
    weekStats: {
      essayCount: 0,      // 本周完成的大作文/分论点训练次数
      materialCount: 0,   // 本周新增或收藏的素材条数
      articlesWritten: 4,
      materialsCollected: 28,
      weekGrowth: '+12%',
      activityData: [30, 60, 45, 90, 70, 40, 55]
    },
    mockHotTopics: [
      {
        topic: '数字化转型赋能基层治理',
        desc: '运用大数据、AI等技术提升基层治理效能',
        materials: [
          {
            id: 'h001',
            type: '案例',
            title: '杭州"城市大脑"数字治理案例',
            content: '杭州市充分利用大数据、云计算、人工智能等技术，打造"城市大脑"，实现城市治理的智能化、精细化...',
            macroField: '治理',
            policyDirection: '数字政府',
            subDirection: '治理'
          },
          {
            id: 'h002',
            type: '数据',
            title: '2023年数字政府建设指数达88.9',
            content: '根据中国信息通信研究院发布数据，2023年全国数字政府建设指数达88.9，比2022年增长5.9个百分点...',
            macroField: '治理',
            policyDirection: '数字政府',
            subDirection: '治理'
          }
        ]
      },
      {
        topic: '乡村振兴战略实践路径',
        desc: '产业兴旺、生态宜居、乡风文明、治理有效',
        materials: [
          {
            id: 'h003',
            type: '案例',
            title: '浙江"千万工程"从千村示范到全域美丽',
            content: '浙江用二十多年坚持不懈实施"千万工程"，从"千村示范、万村整治"到如今的全域美丽，成为全省人民安居乐业的幸福家园...',
            macroField: '民生',
            policyDirection: '乡村振兴',
            subDirection: '生态'
          },
          {
            id: 'h004',
            type: '政策',
            title: '中央一号文件：持续推进乡村全面振兴',
            content: '2024年中央一号文件强调，要持续推进乡村全面振兴，加强农业科技创新...',
            macroField: '民生',
            policyDirection: '乡村振兴',
            subDirection: '产业'
          }
        ]
      },
      {
        topic: '青年人才引进与培养',
        desc: '构建多层次人才梯队，激发创新创业活力',
        materials: [
          {
            id: 'h005',
            type: '金句',
            title: '习近平：青年兴则国家兴，青年强则国家强',
            content: '青年兴则国家兴，青年强则国家强。青年一代有理想、有本领、有担当，国家就有前途，民族就有希望。',
            macroField: '治理',
            policyDirection: '人才培养',
            subDirection: '治理'
          }
        ]
      }
    ]
  },

  onLoad(options) {
    this.setCurrentDate()
    this.detectDeviceType()
    this.loadUserNickname()
    this.updateTodayReminder()
    this.updateWeekStats()
    this.refreshStats()
  },

  onShow() {
    this.updateWeekStats()
    this.refreshStats()
  },

  refreshStats() {
    const stats = computeStatsFromLogs();
    this.setData({
      todayStats: {
        total: stats.todayTotal,
        memory: stats.todayMemory,
        hot: stats.todayHot
      },
      practiceDays: stats.streakDays,
      hotCount: stats.todayHot,
      pendingMemoryCount: stats.todayMemory
    });
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
   * 加载用户昵称
   */
  loadUserNickname() {
    // 优先从本地存储读取
    const cachedNickname = wx.getStorageSync('userNickname')
    if (cachedNickname) {
      this.setData({ 
        userNickname: cachedNickname,
        userName: cachedNickname // 同时更新userName以兼容现有逻辑
      })
      return
    }

    // 如果本地没有，使用mock值或从云端获取
    // TODO: 接入真实用户系统后，从云函数获取用户信息
    const mockNickname = '志在必得'
    this.setData({ 
      userNickname: mockNickname,
      userName: mockNickname
    })
    wx.setStorageSync('userNickname', mockNickname)
  },

  /**
   * 更新用户昵称（供授权后调用）
   */
  updateNickname(nick) {
    this.setData({ 
      userNickname: nick,
      userName: nick
    })
    wx.setStorageSync('userNickname', nick)
  },

  /**
   * 更新今日提醒
   */
  updateTodayReminder() {
    // TODO: 从背诵本或云函数获取今天到期的复习任务
    // 目前使用mock数据
    const reviewCount = this.data.pendingReviewCount || 5
    this.setData({
      todayReminder: {
        title: '今日提醒',
        text: `建议今日复习"共同富裕"相关的 ${reviewCount} 个金句，目前背诵熟练度较低。`,
        actionText: '前往背诵本 >',
        actionPage: '/pages/memory/index'
      }
    })
  },

  /**
   * 更新本周统计
   */
  updateWeekStats() {
    const stats = computeStatsFromLogs()
    if (stats) {
      this.setData({
        'weekStats.essayCount': stats.weekSummary.writingSessions,
        'weekStats.materialCount': stats.weekSummary.memoryItems // 暂时用背诵条数代替素材积累
      })
    }
  },

  /**
   * 跳转到我的页面
   */
  goToMe() {
    wx.navigateTo({
      url: '/pages/me/index'
    })
  },

  /**
   * 切换导航项
   */
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    this.setData({ activeNav: name })
    
    // 如果是首页，不跳转
    if (name === '首页' || !route) {
      return
    }
    
    wx.reLaunch({
      url: route,
      fail: (err) => {
        console.error('导航失败:', route, err);
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  /**
   * 快捷操作点击
   */
  onQuickActionTap(e) {
    const { route } = e.currentTarget.dataset
    wx.navigateTo({
      url: route,
      fail: (err) => {
        console.error('导航失败:', route, err);
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  /**
   * 最近练习点击
   */
  onExerciseTap(e) {
    const { index } = e.currentTarget.dataset
    wx.showToast({
      title: '查看练习详情',
      icon: 'none'
    })
  },

  /**
   * 设置当前日期
   */
  setCurrentDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    this.setData({
      currentDate: `${year}年${month}月${day}日`
    })
  },

  /**
   * 查看示例素材：通过 eventChannel 传递到素材库页面
   */
  onViewSample(e) {
    const material = e.currentTarget.dataset.material
    
    if (!material) {
      wx.showToast({
        title: '数据错误',
        icon: 'error'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/materials/index',
      success(res) {
        // 通过 eventChannel 将示例素材传给目标页面
        res.eventChannel.emit('fromHotSample', material)
      }
    })
  },

  /**
   * 查看素材：跳转到素材库并传递材料ID或话题
   */
  onViewMaterial(e) {
    const { materialId, topic } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/materials/index?materialId=${materialId}&topic=${encodeURIComponent(topic)}`
    })
  },

  /**
   * 加入素材库：调用云函数将素材添加到素材库
   */
  onAddMaterialTap(e) {
    const material = e.currentTarget.dataset.material
    
    if (!material) {
      wx.showToast({
        title: '数据错误',
        icon: 'error'
      })
      return
    }

    wx.showLoading({
      title: '添加中...',
      mask: true
    })

    // 调用云函数
    wx.cloud.callFunction({
      name: 'addMaterialFromHot',
      data: {
        type: material.type,
        title: material.title,
        content: material.content,
        macroField: material.macroField,
        policyDirection: material.policyDirection,
        subDirection: material.subDirection,
        topic: e.currentTarget.dataset.topic
      },
      success: (res) => {
        wx.hideLoading()
        if (res.result.ok) {
          wx.showToast({
            title: '已加入素材库',
            icon: 'success',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.result.message || '添加失败',
            icon: 'error'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('云函数调用失败:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        })
      }
    })
  },

  /**
   * 今日提醒点击跳转
   */
  onTodayReminderTap() {
    const page = this.data.todayReminder.actionPage
    if (!page) return
    wx.navigateTo({ 
      url: page,
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  /**
   * 跳转到记忆复习页
   */
  goToMemory() {
    wx.navigateTo({
      url: '/pages/memory/index'
    })
  },

  /**
   * 跳转到热点列表
   */
  goToHotList() {
    wx.navigateTo({
      url: '/pages/hot-list/index'
    })
  },

  /**
   * 跳转到热点训练页
   */
  goToHotTrain() {
    wx.navigateTo({
      url: '/pages/hot-train/index',
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },


  /**
   * 跳转到素材库
   */
  goToMaterials() {
    wx.navigateTo({
      url: '/pages/materials/index'
    })
  },

  /**
   * 查看话题详情
   */
  onViewTopic(e) {
    const topic = e.currentTarget.dataset.topic
    // 可以跳转到话题详情页或热点训练页
    wx.navigateTo({
      url: '/pages/hot-train/index',
      fail: () => {
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        })
      }
    })
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
  }
})
