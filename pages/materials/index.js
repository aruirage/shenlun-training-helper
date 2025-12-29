// pages/materials/index.js
const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    isPad: true,
    activeNav: '素材库',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',

    // 分类 Tabs
    tabs: ['全部', '金句', '案例', '政策/理论', '对策建议', '句式', '用户片段'],
    activeTabIndex: 0,

    // 搜索
    searchKeyword: '',

    // 弹窗控制
    showDetail: false,
    selectedMaterial: null,
    showAddModal: false,
    showFilterModal: false,
    
    // 筛选话题（分层级）
    filterCategories: [
      {
        name: '经济发展',
        sub: ['数字经济', '乡村振兴', '高质量发展', '共同富裕']
      },
      {
        name: '社会治理',
        sub: ['基层治理', '公共服务', '社会保障', '平安建设']
      },
      {
        name: '文化建设',
        sub: ['文化自信', '文化出海', '精神文明', '传统文化']
      },
      {
        name: '生态文明',
        sub: ['绿色发展', '碳中和', '环境整治', '美丽中国']
      }
    ],
    selectedCategory: '全部',
    
    // 新增素材表单
    newMaterial: {
      type: '金句',
      category: '',
      content: '',
      tags: ''
    },

    // 原始素材列表
    allMaterials: [
      {
        id: 1,
        type: '金句',
        category: '数字经济',
        content: '“数据是新时代的‘生产要素’，也是连接千家万户的‘治理密码’。”',
        source: '人民日报',
        date: '2023-10-24',
        fullContent: '“数据是新时代的‘生产要素’，也是连接千家万户的‘治理密码’。”',
        link: 'https://www.people.com.cn/example1',
        tags: ['经济', '科技'],
        proficiency: 4
      },
      {
        id: 2,
        type: '案例',
        category: '乡村振兴',
        content: '江苏某村通过直播带货，将特色农产品销往全国，带动村民年增收2万元。',
        source: '新华网',
        date: '2023-11-12',        background: '该村地处偏远，农产品销路不畅，传统销售模式效率低下。',
        actions: '1. 搭建村级直播基地；2. 培养本土“网红”带货达人；3. 建立农产品标准化分拣中心。',
        results: '实现了农产品从田间直达餐桌的跨越，村民人均年收入增长30%。',        fullContent: 'AI总结：该村通过搭建直播基地，培养本土网红，实现了农产品从田间直达餐桌的跨越。',
        link: 'https://www.xinhuanet.com/example2',
        tags: ['致富', '民生'],
        proficiency: 2
      },
      {
        id: 3,
        type: '政策/理论',
        category: '生态文明',
        content: '《关于完整准确全面贯彻新发展理念做好碳达峰碳中和工作的意见》指出...',
        source: '国务院官网',
        date: '2023-09-15',
        fullContent: '《关于完整准确全面贯彻新发展理念做好碳达峰碳中和工作的意见》指出，要坚持系统观念，处理好发展和减排、整体和局部、短期和中长期的关系...',
        link: 'http://www.gov.cn/example3',
        tags: [],
        proficiency: 5
      },
      {
        id: 4,
        type: '用户片段',
        category: '文化自信',
        content: '文化是一个国家、一个民族的灵魂。在数字浪潮中，守正创新是必然选择。',
        source: '个人笔记',
        date: '2023-12-01',
        fullContent: '文化是一个国家、一个民族的灵魂。在数字浪潮中，守正创新是必然选择。我们要坚定文化自信，讲好中国故事。',
        link: '',
        tags: [],
        proficiency: 1
      },
      {
        id: 5,
        type: '金句',
        category: '社会治理',
        content: '“治国有常，而利民为本。”',
        source: '《淮南子》',
        date: '2023-08-20',
        fullContent: '“治国有常，而利民为本。”',
        link: '',
        tags: ['民生'],
        proficiency: 3
      },
      {
        id: 6,
        type: '句式',
        category: '公文写作',
        content: '“不仅要...更要...从而...”',
        source: '写作指南',
        date: '2023-12-20',
        fullContent: '“不仅要...更要...从而...” 这种递进式句式常用于论述政策执行的深度和广度。',
        link: '',
        tags: ['逻辑', '递进'],
        proficiency: 0
      }
    ],
    
    // 过滤后的列表
    filteredMaterials: []
  },

  onLoad(options) {
    console.log('[materials] 页面加载，options:', options);
    this.detectDeviceType()
    this.filterMaterials()

    if (options.showDetail === 'true') {
      const tempDetail = wx.getStorageSync('temp_material_detail')
      if (tempDetail) {
        console.log('[materials] 加载详情数据:', tempDetail);
        this.setData({
          selectedMaterial: tempDetail,
          showDetail: true
        })
        wx.removeStorageSync('temp_material_detail')
      }
    }
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  // 过滤逻辑
  filterMaterials() {
    const { allMaterials, activeTabIndex, tabs, searchKeyword, selectedCategory } = this.data
    const activeTab = tabs[activeTabIndex]
    
    let filtered = allMaterials.filter(item => {
      const matchTab = activeTab === '全部' || item.type === activeTab
      const matchSearch = !searchKeyword || item.content.includes(searchKeyword) || item.category.includes(searchKeyword)
      const matchCategory = selectedCategory === '全部' || item.category === selectedCategory
      return matchTab && matchSearch && matchCategory
    })

    // 排序逻辑：熟练度高的优先
    filtered.sort((a, b) => b.proficiency - a.proficiency)

    this.setData({ filteredMaterials: filtered })
  },

  onFilterTap() {
    this.setData({
      showFilterModal: true
    })
  },

  onSelectCategory(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({
      selectedCategory: cat,
      showFilterModal: false
    }, () => {
      this.filterMaterials()
    })
  },

  onOpenLink(e) {
    const link = e.currentTarget.dataset.link
    if (!link) return
    
    wx.navigateTo({
      url: `/pages/web-view/index?url=${encodeURIComponent(link)}`
    })
  },

  onTabTap(e) {
    const index = e.currentTarget.dataset.index
    const { activeTabIndex } = this.data
    
    // 如果点击已选中的 tab（且不是“全部”），则取消选中，回到“全部”
    let newIndex = index
    if (index === activeTabIndex && index !== 0) {
      newIndex = 0
    }
    
    this.setData({ activeTabIndex: newIndex }, () => {
      this.filterMaterials()
    })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value }, () => {
      this.filterMaterials()
    })
  },

  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (name === '素材库' || !route) return
    wx.navigateTo({ url: route })
  },

  // 打开详情
  onMaterialTap(e) {
    const id = e.currentTarget.dataset.id
    const material = this.data.allMaterials.find(m => m.id === id)
    this.setData({
      selectedMaterial: material,
      showDetail: true
    })
  },

  // 关闭弹窗
  onCloseModal() {
    this.setData({
      showDetail: false,
      showAddModal: false
    })
  },

  // 打开添加弹窗
  addMaterial() {
    this.setData({
      showAddModal: true
    })
  },

  // 输入处理
  onInputNew(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`newMaterial.${field}`]: e.detail.value
    })
  },

  // 确认添加
  onConfirmAdd() {
    const { newMaterial, allMaterials, tabs } = this.data
    if (!newMaterial.content || !newMaterial.category) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    const newItem = {
      ...newMaterial,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      source: '个人添加',
      fullContent: newMaterial.content,
      tags: newMaterial.tags ? newMaterial.tags.split(/[,，]/) : [],
      proficiency: 0
    }

    const updatedMaterials = [newItem, ...allMaterials]
    
    // 自动进入该分类
    const tabIndex = tabs.indexOf(newItem.type)
    
    this.setData({
      allMaterials: updatedMaterials,
      showAddModal: false,
      activeTabIndex: tabIndex !== -1 ? tabIndex : 0,
      newMaterial: { type: '金句', category: '', content: '', tags: '' }
    }, () => {
      this.filterMaterials()
      wx.showToast({ title: '添加成功' })
    })
  },

  onFilterTap() {
    wx.showToast({
      title: '点击了筛选主题',
      icon: 'none'
    })
  },

  onCopyLink(e) {
    const link = e.currentTarget.dataset.link
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({ title: '链接已复制' })
      }
    })
  }
})
