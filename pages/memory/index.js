// pages/memory/index.js
const { detectPad } = require('../../utils/device.js')
const { logStudyEvent, computeStatsFromLogs } = require('../../utils/logger.js')

const CATEGORIES = ['全部', '金句', '案例', '对策']

Page({
  data: {
    activeNav: '背诵本',
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '💪', route: '/pages/hot-train/index' },
      { name: 'AI热点分论点点评', icon: '🤖', route: '/pages/comment/index' },
      { name: '真题训练', icon: '✍️', route: '/pages/full-train/index' },
      { name: '背诵本', icon: '📚', route: '' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ],
    // 数据源（后面可以换成云端）
    mockMemoryMaterials: [
      {
        id: 'mem001',
        type: '金句',
        field: '民生治理',
        content: '数字乡村不仅是技术的下沉，更是治理的重塑与民生的回响。',
        keywords: ['数字乡村', '治理的重塑'],
        source: '人民日报',
        memoryLevel: 1,
        nextReviewAt: Date.now() - 1000,
        lastReviewAt: Date.now() - 86400000,
        isCoreForMemory: true,
        structure: '不仅是...更是...',
        meaning: '强调数字化不仅是硬件改变，核心在于治理逻辑和民众获得感的提升。',
        usageTip: '适合作为分论点小结句'
      },
      {
        id: 'mem002',
        type: '案例',
        field: '共同富裕',
        content: '浙江“千万工程”数字化实践：通过“邻里码”实现办事不出村。',
        keywords: ['千万工程', '邻里码'],
        source: '求是网',
        memoryLevel: 1,
        nextReviewAt: Date.now() - 5000,
        lastReviewAt: Date.now() - 86400000,
        isCoreForMemory: false,
        structure: '地名 + 做法 + 效果',
        meaning: '体现数字化在基层治理和便民服务中的具体落地成效。',
        usageTip: '可用在事实支撑段落'
      },
      {
        id: 'mem003',
        type: '对策',
        field: '科技创新',
        content: '要健全关键核心技术攻关新型举国体制，把政府、市场、社会有机结合起来。',
        keywords: ['新型举国体制', '有机结合'],
        source: '新华社',
        memoryLevel: 2,
        nextReviewAt: Date.now() - 2000,
        lastReviewAt: Date.now() - 172800000,
        isCoreForMemory: true,
        structure: '要...把...与...结合',
        meaning: '强调科技创新要在体制机制上统筹各方力量。',
        usageTip: '适合放在对策段首句'
      },
      {
        id: 'mem004',
        type: '金句',
        field: '文化传承',
        content: '坚持创造性转化、创新性发展，让收藏在博物馆里的文物“活”起来。',
        keywords: ['创造性转化', '活起来'],
        source: '人民网',
        memoryLevel: 1,
        nextReviewAt: Date.now() - 8000,
        lastReviewAt: Date.now() - 86400000,
        isCoreForMemory: true,
        structure: '坚持...让...活起来',
        meaning: '提出文化遗产工作的重要方法论。',
        usageTip: '适合作为开头引题或结尾升华'
      },
      {
        id: 'mem005',
        type: '对策',
        field: '生态文明',
        content: '要像保护眼睛一样保护生态环境，像对待生命一样对待生态环境。',
        keywords: ['保护眼睛', '对待生命'],
        source: '光明日报',
        memoryLevel: 1,
        nextReviewAt: Date.now() + 86400000,
        lastReviewAt: Date.now(),
        isCoreForMemory: true,
        structure: '要像...一样...，像...一样...',
        meaning: '强调生态环境保护的极端重要性。',
        usageTip: '适合用在收尾段落的强调句'
      }
    ],

    // 运行状态
    isPad: false,
    activeNav: '背诵本',

    viewMode: 'study',       // 'study' | 'quiz'
    categories: CATEGORIES,
    currentCategory: '全部',
    shuffleEnabled: false,

    reviewList: [],
    currentIndex: 0,
    currentMaterial: null,

    isFlipped: false,
    isPeek: false,

    showSettings: false,
    weekReviewCount: 0,
    pendingCount: 0,

    // study 模式用：填空显示结构
    displayParts: []
  },

  onLoad() {
    this.detectDeviceType()
    this.rebuildReviewList()
    this.updateStats()
  },

  onShow() {
    this.updateStats()
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  updateStats() {
    const stats = computeStatsFromLogs && computeStatsFromLogs()
    if (stats && stats.moduleStats && stats.moduleStats.memory) {
      this.setData({
        weekReviewCount: stats.moduleStats.memory.studyCount + stats.moduleStats.memory.quizCount
      })
    }
  },

  // Fisher–Yates
  shuffleArray(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
    return a
  },

  // 重建复习列表：按类别 + 时间 + 随机
  rebuildReviewList() {
    const now = Date.now()
    let filtered = this.data.mockMemoryMaterials.filter(item => {
      const categoryMatch =
        this.data.currentCategory === '全部'
          ? item.isCoreForMemory
          : item.type === this.data.currentCategory
      const timeMatch = item.nextReviewAt <= now
      return categoryMatch && timeMatch
    })

    if (this.data.shuffleEnabled) {
      filtered = this.shuffleArray(filtered)
    }

    this.setData(
      {
        reviewList: filtered,
        currentIndex: 0,
        isFlipped: false,
        isPeek: false,
        pendingCount: filtered.length
      },
      () => {
        this.updateCurrentMaterial()
      }
    )
  },

  updateCurrentMaterial() {
    const material = this.data.reviewList[this.data.currentIndex] || null
    if (!material) {
      this.setData({
        currentMaterial: null,
        displayParts: []
      })
      return
    }

    // study 模式下用来做挖空
    const regex = new RegExp(`(${material.keywords.join('|')})`, 'g')
    const parts = material.content.split(regex).map(t => ({
      text: t,
      isKeyword: material.keywords.includes(t)
    }))

    this.setData({
      currentMaterial: material,
      displayParts: parts
    })
  },

  // 记忆操作
  handleMemoryAction(e) {
    const action = e.currentTarget.dataset.action // 'pass' | 'fail'
    const material = this.data.currentMaterial
    if (!material) return

    const now = Date.now()
    let newLevel = material.memoryLevel
    let daysToAdd = 1

    if (action === 'fail') {
      newLevel = 1
      daysToAdd = 1
    } else {
      newLevel = Math.min(newLevel + 1, 3)
      daysToAdd = newLevel === 2 ? 2 : newLevel === 3 ? 7 : 1
    }

    // 记 log
    if (logStudyEvent) {
      logStudyEvent({
        type: 'memory',
        mode: this.data.viewMode,
        result: action,
        materialId: material.id,
        createdAt: now
      })
    }

    const updated = this.data.mockMemoryMaterials.map(item =>
      item.id === material.id
        ? {
            ...item,
            memoryLevel: newLevel,
            nextReviewAt: now + daysToAdd * 86400000,
            lastReviewAt: now
          }
        : item
    )

    const nextIndex =
      this.data.currentIndex < this.data.reviewList.length - 1
        ? this.data.currentIndex + 1
        : 0

    const stillHas =
      this.data.currentIndex < this.data.reviewList.length - 1
        ? this.data.reviewList.length - (this.data.currentIndex + 1)
        : 0

    this.setData(
      {
        mockMemoryMaterials: updated,
        weekReviewCount: this.data.weekReviewCount + 1,
        currentIndex: nextIndex,
        isFlipped: false,
        isPeek: false,
        pendingCount: stillHas
      },
      () => {
        if (stillHas === 0) {
          this.rebuildReviewList()
        } else {
          this.updateCurrentMaterial()
        }
      }
    )
  },

  // 导航栏跳转
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (route) {
      wx.navigateTo({ url: route })
    }
  },

  // 顶部、侧边交互
  switchNav(e) {
    const name = e.currentTarget.dataset.name
    if (name === '首页') wx.navigateTo({ url: '/pages/home/index' })
    if (name === '今日热点') wx.navigateTo({ url: '/pages/hot-list/index' })
    if (name === '素材库') wx.navigateTo({ url: '/pages/materials/index' })
  },

  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData(
      {
        viewMode: mode,
        isFlipped: false,
        isPeek: false
      },
      () => {
        // quiz 模式可以只测 memoryLevel>=2 的卡，后续需要可以在 rebuild 里加条件
        this.rebuildReviewList()
      }
    )
  },

  toggleFlip() {
    if (!this.data.currentMaterial) return
    this.setData({ isFlipped: !this.data.isFlipped, isPeek: false })
  },

  startPeek() {
    if (this.data.viewMode !== 'study') return
    this.setData({ isPeek: true })
  },

  endPeek() {
    this.setData({ isPeek: false })
  },

  togglePeek() {
    this.setData({ isPeek: !this.data.isPeek })
  },

  toggleSettings() {
    this.setData({ showSettings: !this.data.showSettings })
  },

  switchCategory(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ currentCategory: cat }, () => {
      this.rebuildReviewList()
    })
  },

  toggleShuffle() {
    this.setData({ shuffleEnabled: !this.data.shuffleEnabled }, () => {
      this.rebuildReviewList()
    })
  },

  restartReview() {
    this.setData({ currentCategory: '全部' }, () => {
      this.rebuildReviewList()
    })
  },

  goToMe() {
    wx.navigateTo({ url: '/pages/me/index' })
  }
})
