const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    isPad: false,

    // 题目信息
    essay: {
      year: '2024',
      paperType: '国考副省',
      title: '以"数字化转型赋能基层治理"为主题，写一篇议论文',
      prompt: '随着数字技术的快速发展，各地积极探索运用大数据、人工智能等手段提升基层治理效能。请结合给定材料，围绕"数字化转型赋能基层治理"这一主题，写一篇议论文。',
      materialSummary: '材料1：某市通过"城市大脑"系统实现交通优化...\n材料2：网格化管理模式在社区治理中的应用...\n材料3：数字政府建设面临的挑战与对策...',
      materialExpanded: false
    },

    // 主论点
    mainArgument: '',

    // 分论点槽（3-4个）
    argumentSlots: [
      {
        id: 1,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        selectedMaterials: [],
        paragraph: ''
      },
      {
        id: 2,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        selectedMaterials: [],
        paragraph: ''
      },
      {
        id: 3,
        title: '',
        macroField: '治理',
        policyDirection: '数字政府',
        selectedMaterials: [],
        paragraph: ''
      }
    ],

    // 底部工具栏统计
    completedCount: 0,
    wordCount: 0,

    // 右侧素材侧栏与选择状态
    isMaterialSidebarOpen: false,
    selectedSlotIndex: null,
    libraryMaterials: [
      { id: 101, type: '金句', content: '数字乡村不仅是技术的下沉，更是治理的重塑。', source: '人民日报' },
      { id: 102, type: '案例', content: '浙江“邻里码”实现政务不出村。', source: '求是网' },
      { id: 103, type: '句式', content: '要有“绣花功夫”，也要有“系统思维”。', source: '光明日报' }
    ]
  },

  onLoad() {
    console.log('全文训练页加载')
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
   * AI 推荐主论点
   */
  recommendMainArgument() {
    wx.showToast({
      title: 'AI 推荐功能开发中',
      icon: 'none'
    })
  },

  /**
   * 分论点标题输入
   */
  onSlotTitleInput(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const argumentSlots = [...this.data.argumentSlots]
    argumentSlots[index].title = value
    this.setData({ argumentSlots })
  },

  /**
   * 从素材库选素材
   */
  selectMaterials(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      isMaterialSidebarOpen: true,
      selectedSlotIndex: index
    })
    this.recomputeLibraryCheckedState()
  },

  /**
   * 段落输入
   */
  onParagraphInput(e) {
    const { index } = e.currentTarget.dataset
    const { value } = e.detail
    const argumentSlots = [...this.data.argumentSlots]
    argumentSlots[index].paragraph = value
    this.setData({ argumentSlots })
    this.updateDraftStats()
  },

  /**
   * 在侧栏中切换素材选中状态（加入/移除当前槽位）
   */
  toggleSlotMaterial(e) {
    const { id } = e.currentTarget.dataset
    const material = this.data.libraryMaterials.find(m => m.id === id)
    if (this.data.selectedSlotIndex === null || !material) return

    const slots = [...this.data.argumentSlots]
    const slot = slots[this.data.selectedSlotIndex]
    const existsIndex = slot.selectedMaterials.findIndex(m => m.id === material.id)
    if (existsIndex !== -1) {
      slot.selectedMaterials.splice(existsIndex, 1)
    } else {
      slot.selectedMaterials.push(material)
    }
    this.setData({ argumentSlots: slots })
    this.recomputeLibraryCheckedState()
  },

  /**
   * 从槽位已选素材中移除
   */
  removeMaterialFromSlot(e) {
    const { slotIndex, id } = e.currentTarget.dataset
    const slots = [...this.data.argumentSlots]
    const list = slots[slotIndex].selectedMaterials
    const idx = list.findIndex(m => m.id === id)
    if (idx !== -1) {
      list.splice(idx, 1)
      this.setData({ argumentSlots: slots })
      this.recomputeLibraryCheckedState()
    }
  },

  updateDraftStats: function() {
    const completed = this.data.argumentSlots.filter(s => (s.paragraph || '').length > 50).length
    const words = this.data.argumentSlots.reduce((acc, s) => acc + ((s.paragraph || '').length), 0)
    this.setData({ completedCount: completed, wordCount: words })
  },

  recomputeLibraryCheckedState: function() {
    const idx = this.data.selectedSlotIndex
    const setIds = new Set(idx !== null && this.data.argumentSlots[idx] ? this.data.argumentSlots[idx].selectedMaterials.map(m => m.id) : [])
    const libraryMaterials = this.data.libraryMaterials.map(m => ({ ...m, checked: setIds.has(m.id) }))
    this.setData({ libraryMaterials })
  },

  /**
   * 关闭素材侧栏并确认加入
   */
  confirmMaterials() {
    this.setData({ isMaterialSidebarOpen: false })
    wx.showToast({ title: '已加入当前分论点', icon: 'success' })
  },

  /**
   * AI 生成本段
   */
  generateParagraph(e) {
    const { index } = e.currentTarget.dataset
    wx.showToast({
      title: 'AI 生成功能开发中',
      icon: 'none'
    })
  },

  /**
   * 加入素材库
   */
  addToLibrary(e) {
    const { index } = e.currentTarget.dataset
    const slot = this.data.argumentSlots[index]
    if (!slot.paragraph.trim()) {
      wx.showToast({
        title: '请先填写段落内容',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '已加入素材库',
      icon: 'success'
    })
  },

  /**
   * 生成全文草稿
   */
  generateFullDraft() {
    if (!this.data.mainArgument.trim()) {
      wx.showToast({
        title: '请先填写主论点',
        icon: 'none'
      })
      return
    }

    const filledSlots = this.data.argumentSlots.filter(s => s.title.trim().length > 0)
    if (filledSlots.length < 2) {
      wx.showToast({
        title: '请至少填写 2 个分论点',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '生成全文草稿...',
      icon: 'loading',
      duration: 2000
    })

    // TODO: 调用云函数生成全文
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
  }
})
