const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    isPad: false,

    // AI 总评结果
    overallGrade: 'A',
    dimensions: [
      { name: '立意', score: 85, comment: '主题明确，符合时代要求' },
      { name: '结构', score: 90, comment: '层次清晰，逻辑严密' },
      { name: '材料', score: 82, comment: '案例丰富，论证有力' },
      { name: '语言', score: 88, comment: '表达流畅，用词准确' }
    ],

    // 分论点反馈
    viewpointFeedback: [
      { title: '分论点 1', comment: '角度新颖，论述清晰，建议增加具体案例支撑。', score: 85 },
      { title: '分论点 2', comment: '切合主题，逻辑严密，可以进一步展开论述。', score: 88 },
      { title: '分论点 3', comment: '深度不足，建议结合政策背景深入分析。', score: 78 }
    ],

    // 评论参考区展开状态
    referenceExpanded: false,

    // 评论核心分论点
    referenceViewpoints: [
      { title: '数字技术提升基层治理效能', explanation: '运用大数据、人工智能等技术手段', match: '高度一致' },
      { title: '创新治理模式促进精细化管理', explanation: '通过城市大脑、网格化管理实现智能化', match: '部分覆盖' },
      { title: '数字政府建设增进民生福祉', explanation: '解决群众急难愁盼问题', match: '缺失' }
    ],

    // 推荐素材列表
    recommendedMaterials: [
      {
        id: 1,
        type: '金句',
        typeClass: 'chip-primary',
        content: '数字化转型不仅是技术革新，更是治理理念的深刻变革。',
        source: '人民日报',
        date: '2024-12',
        selected: false
      },
      {
        id: 2,
        type: '案例',
        typeClass: 'chip-blue',
        content: '浙江省杭州市通过"城市大脑"系统，实现了交通拥堵治理、应急指挥调度等多场景应用，提升了城市治理效率30%以上。',
        source: '新华社',
        date: '2024-11',
        selected: false
      },
      {
        id: 3,
        type: '哲学',
        typeClass: 'chip-green',
        content: '治大国如烹小鲜，数字治理需要精细化、智能化。',
        source: '学习强国',
        date: '2024-10',
        selected: false
      }
    ],

    // 已选素材数量
    selectedCount: 0,

    // 选中素材用于右侧详情
    selectedMaterial: null
  },

  onLoad() {
    console.log('总评页加载')
    this.detectDeviceType()
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  /**
   * 切换评论参考展开状态
   */
  toggleReference() {
    this.setData({
      referenceExpanded: !this.data.referenceExpanded
    })
  },

  /**
   * 切换素材选中状态
   */
  toggleMaterial(e) {
    const { id } = e.currentTarget.dataset
    const materials = this.data.recommendedMaterials.map(m => {
      if (m.id === id) {
        return { ...m, selected: !m.selected }
      }
      return m
    })
    const selectedCount = materials.filter(m => m.selected).length
    this.setData({
      recommendedMaterials: materials,
      selectedCount
    })
  },

  /**
   * 选择素材，展示右侧详情（iPad优先）
   */
  selectMaterial(e) {
    const { id } = e.currentTarget.dataset
    const material = this.data.recommendedMaterials.find(m => m.id === id)
    if (!material) return
    this.setData({ selectedMaterial: material })
  },

  /**
   * 加入背诵本（从右侧详情）
   */
  addToMemoryFromSelected() {
    const material = this.data.selectedMaterial
    if (!material) {
      wx.showToast({ title: '请先选择素材', icon: 'none' })
      return
    }
    wx.showToast({ title: '已加入背诵本', icon: 'success' })
    // TODO: 调用云函数加入背诵本
  },

  /**
   * 查看原文出处（占位）
   */
  openSourceLink() {
    wx.showToast({ title: '打开原文链接（示例）', icon: 'none' })
  },

  /**
   * 加入素材库
   */
  addToLibrary() {
    const selectedMaterials = this.data.recommendedMaterials.filter(m => m.selected)
    if (selectedMaterials.length === 0) {
      wx.showToast({
        title: '请先选择素材',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: `已加入 ${selectedMaterials.length} 条素材`,
      icon: 'success'
    })

    // TODO: 调用云函数将素材加入素材库
  }
})
