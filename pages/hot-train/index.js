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
    wordCount: 23
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
      wordCount: paragraphs[index].length
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
