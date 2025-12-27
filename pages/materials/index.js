// pages/materials/index.js
const { detectPad } = require('../../utils/device.js')

Page({
  data: {
    // iPad 适配
    isPad: false,

    // 右侧栏控制
    showRightPanel: true,
    rightPanelWidth: 360,
    minRightPanelWidth: 300,
    maxRightPanelWidth: 500,
    isResizing: false,

    // 示例素材（从首页传来）
    sampleMaterial: null,

    // 三栏布局：选中的素材（用于右侧详情面板）
    selectedMaterial: null,

    // 搜索关键词
    searchKeyword: '',

    // 筛选 chips（显示在中间列表顶部）
    selectedChips: [],

    // 导航树展开状态
    expandedNavItems: ['民生'],

    // 3维过滤标签
    macroFieldList: ['全部', '民生', '科技', '生态', '治理'],
    selectedMacroField: '全部',
    selectedMacroFieldIndex: 0,

    policyList: ['全部', '乡村振兴', '科技创新', '生态保护', '数字政府'],
    selectedPolicy: '全部',
    selectedPolicyIndex: 0,

    subDirectionList: ['全部', '产业', '生态', '治理', '新质生产力', '人才'],
    selectedSubDirection: '全部',
    selectedSubDirectionIndex: 0,

    // 类型 Tab
    typeList: ['全部', '案例', '数据', '金句', '政策', '对策'],
    currentTypeIndex: 0,

    // 时效筛选
    expireList: ['全部', '3个月内', '6个月内', '长期有效'],
    currentExpireIndex: 0,

    // 标签编辑抽屉
    showTagDrawer: false,
    editingMaterial: null,
    editMacroField: '',
    editPolicyDirection: '',
    editSubDirection: '',
    // 编辑用的完整列表（不包含"全部"）
    editMacroFieldList: ['民生', '科技', '生态', '治理'],
    editPolicyList: ['乡村振兴', '科技创新', '生态保护', '数字政府'],
    editSubDirectionList: ['产业', '生态', '治理', '新质生产力', '人才'],
    isUpdatingTags: false,

    // 数据库查询与分页
    filteredMaterials: [],
    selectedMaterials: [],
    selectedIds: [],
    pageNum: 1,
    pageSize: 20,
    isLoading: false,
    hasMore: true,
    db: null
  },

  onLoad(options) {
    // 检测设备类型
    this.detectDeviceType()

    // 初始化数据库
    this.initDatabase()

    // 监听来自首页的示例素材
    const eventChannel = this.getOpenerEventChannel && this.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.on('fromHotSample', (material) => {
        this.setData({
          sampleMaterial: material
        })
      })
    }

    // 从 URL 参数读取初始过滤条件
    if (options.macroField) {
      const field = decodeURIComponent(options.macroField)
      const idx = this.data.macroFieldList.indexOf(field)
      if (idx !== -1) {
        this.setData({
          selectedMacroField: field,
          selectedMacroFieldIndex: idx
        })
      }
    }

    if (options.policyDirection) {
      const policy = decodeURIComponent(options.policyDirection)
      const idx = this.data.policyList.indexOf(policy)
      if (idx !== -1) {
        this.setData({
          selectedPolicy: policy,
          selectedPolicyIndex: idx
        })
      }
    }

    if (options.subDirection) {
      const sub = decodeURIComponent(options.subDirection)
      const idx = this.data.subDirectionList.indexOf(sub)
      if (idx !== -1) {
        this.setData({
          selectedSubDirection: sub,
          selectedSubDirectionIndex: idx
        })
      }
    }

    // 首次加载素材
    this.loadMaterials(true)
  },

  /**
   * 初始化数据库
   */
  initDatabase() {
    const db = wx.cloud.database()
    this.setData({ db })
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
   * 映射素材数据，添加前端展示字段
   */
  mapMaterial(item) {
    // typeShort 和 typeClass 映射
    const typeMap = {
      '案例': { short: '案', class: 'anli' },
      '数据': { short: '数', class: 'shuju' },
      '金句': { short: '句', class: 'jinju' },
      '政策': { short: '策', class: 'zhengce' }
    }

    // macroFieldClass 映射
    const macroFieldMap = {
      '民生': 'minsheng',
      '科技': 'keji',
      '生态': 'shengtai',
      '治理': 'zhili'
    }

    const typeInfo = typeMap[item.type] || { short: '■', class: 'other' }
    const macroFieldClass = macroFieldMap[item.macroField] || 'other'

    return {
      ...item,
      typeShort: typeInfo.short,
      typeClass: typeInfo.class,
      macroFieldClass: macroFieldClass,
      displaySource: item.source || '未知',
      displayDate: this.formatDate(item.sourceDate || item.createdAt),
      displayStatusText: this.mapExpireText(item.expireStatus || 'active'),
      displayStatusClass: (item.expireStatus === 'expired') ? 'meta-expired' : ((item.expireStatus === 'old_but_hot') ? 'meta-hot' : '')
    }
  },

  /**
   * 构建数据库查询条件
   */
  buildDbQuery() {
    let query = this.data.db.collection('materials')

    // 按宏观领域过滤
    if (this.data.selectedMacroField !== '全部') {
      query = query.where({ macroField: this.data.selectedMacroField })
    }

    // 按政策方向过滤
    if (this.data.selectedPolicy !== '全部') {
      query = query.where({ policyDirection: this.data.selectedPolicy })
    }

    // 按分论点方向过滤
    if (this.data.selectedSubDirection !== '全部') {
      query = query.where({ subDirection: this.data.selectedSubDirection })
    }

    // 按类型过滤
    const currentType = this.data.typeList[this.data.currentTypeIndex]
    if (currentType !== '全部') {
      query = query.where({ type: currentType })
    }

    return query
  },

  /**
   * 加载素材（支持分页）
   */
  loadMaterials(reset = false) {
    if (this.data.isLoading) return

    const pageNum = reset ? 1 : this.data.pageNum

    this.setData({ isLoading: true })

    this.buildDbQuery()
      .orderBy('createdAt', 'desc')
      .skip((pageNum - 1) * this.data.pageSize)
      .limit(this.data.pageSize)
      .get()
      .then((res) => {
        const materials = res.data || []

        // 为每条素材计算展示字段和映射数据
        const decorated = materials.map(it => this.mapMaterial(it))

        const newMaterials = reset ? decorated : [...this.data.filteredMaterials, ...decorated]
        const hasMore = materials.length === this.data.pageSize

        this.setData({
          filteredMaterials: newMaterials,
          isLoading: false,
          pageNum: reset ? 1 : pageNum,
          hasMore,
          selectedIds: reset ? [] : this.data.selectedIds,
          selectedMaterials: reset ? [] : this.data.selectedMaterials
        })
      })
      .catch((err) => {
        console.error('素材查询失败:', err)
        this.setData({ isLoading: false })
        wx.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      })
  },

  /**
   * 宏观领域改变
   */
  onMacroFieldChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedMacroFieldIndex: index,
      selectedMacroField: this.data.macroFieldList[index]
    })
    this.loadMaterials(true)
  },

  /**
   * 政策方向改变
   */
  onPolicyChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedPolicyIndex: index,
      selectedPolicy: this.data.policyList[index]
    })
    this.loadMaterials(true)
  },

  /**
   * 分论点方向改变
   */
  onSubDirectionChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      selectedSubDirectionIndex: index,
      selectedSubDirection: this.data.subDirectionList[index]
    })
    this.loadMaterials(true)
  },

  /**
   * 类型 Tab 切换
   */
  onTypeChange(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      currentTypeIndex: index
    })
    this.loadMaterials(true)
  },

  /**
   * 时效筛选改变
   */
  onExpireChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      currentExpireIndex: index
    })
    // 时效筛选当前未实现（需在buildDbQuery中加判断逻辑）
    this.loadMaterials(true)
  },

  /**
   * 页面滚动到底部，加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMaterials(false)
    }
  },

  /**
   * 点击"加载更多"按钮
   */
  loadMoreMaterials() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadMaterials(false)
    }
  },

  /**
   * 时间格式化
   */
  formatDate(ts) {
    if (!ts) return '-'
    const d = new Date(ts)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },

  /**
   * 映射状态文案
   */
  mapExpireText(status) {
    if (status === 'expired') return '已过期'
    if (status === 'old_but_hot') return '常用但略旧'
    return '正常'
  },

  /**
   * 过滤素材列表（已弃用，改用数据库查询）
   */
  filterMaterials() {
    // 本方法保留以兼容旧代码
    this.loadMaterials(true)
  },

  /**
   * 点击素材块（用于三栏iPad显示详情，或打开标签编辑）
   */
  onMaterialTap(e) {
    const { id } = e.currentTarget.dataset
    // 在 iPad 三栏模式下，设置右侧详情面板
    if (this.data.isPad) {
      const material = this.data.filteredMaterials.find(m => m._id === id)
      if (material) {
        this.setData({ selectedMaterial: material })
      }
    }
  },

  /**
   * 切换素材选中状态
   */
  toggleMaterial(e) {
    const { id } = e.currentTarget.dataset
    const material = this.data.filteredMaterials.find(m => m._id === id)

    if (!material) return

    let selectedMaterials = [...this.data.selectedMaterials]
    let selectedIds = [...this.data.selectedIds]

    const index = selectedIds.indexOf(id)
    if (index > -1) {
      selectedMaterials.splice(index, 1)
      selectedIds.splice(index, 1)
    } else {
      selectedMaterials.push(material)
      selectedIds.push(id)
    }

    this.setData({
      selectedMaterials,
      selectedIds
    })
  },

  /**
   * iPad 左侧导航：领域点击
   */
  onMacroFieldNavTap(e) {
    const macro = e.currentTarget.dataset.macro
    const index = this.data.macroFieldList.indexOf(macro)
    
    // 更新筛选 chips
    let chips = [...this.data.selectedChips]
    if (macro !== '全部' && !chips.includes(macro)) {
      chips.push(macro)
    }
    
    this.setData({
      selectedMacroField: macro,
      selectedMacroFieldIndex: index,
      selectedChips: chips,
      pageNum: 1
    }, () => {
      this.loadMaterials(true)
    })
  },

  /**
   * iPad 左侧导航：政策点击
   */
  onPolicyNavTap(e) {
    const policy = e.currentTarget.dataset.policy
    const index = this.data.policyList.indexOf(policy)
    
    // 更新筛选 chips
    let chips = [...this.data.selectedChips]
    if (policy !== '全部' && !chips.includes(policy)) {
      chips.push(policy)
    }
    
    this.setData({
      selectedPolicy: policy,
      selectedPolicyIndex: index,
      selectedChips: chips,
      pageNum: 1
    }, () => {
      this.loadMaterials(true)
    })
  },

  /**
   * iPad 左侧导航：分论点点击
   */
  onSubDirectionNavTap(e) {
    const sub = e.currentTarget.dataset.sub
    const index = this.data.subDirectionList.indexOf(sub)
    
    // 更新筛选 chips
    let chips = [...this.data.selectedChips]
    if (sub !== '全部' && !chips.includes(sub)) {
      chips.push(sub)
    }
    
    this.setData({
      selectedSubDirection: sub,
      selectedSubDirectionIndex: index,
      selectedChips: chips,
      pageNum: 1
    }, () => {
      this.loadMaterials(true)
    })
  },

  /**
   * iPad 左侧导航：类型点击
   */
  onTypeNavChange(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentTypeIndex: index,
      pageNum: 1
    }, () => {
      this.loadMaterials(true)
    })
  },

  /**
   * iPad 右侧详情：编辑标签按钮
   */
  onEditTagTap(e) {
    const { id } = e.currentTarget.dataset
    this.openTagDrawer({ currentTarget: { dataset: { id } } })
  },

  /**
   * 打开标签编辑抽屉
   */
  openTagDrawer(e) {
    const { id } = e.currentTarget.dataset
    const material = this.data.filteredMaterials.find(m => m._id === id)

    if (!material) return

    // 查找当前选项的索引
    const macroIdx = this.data.editMacroFieldList.indexOf(material.macroField)
    const policyIdx = this.data.editPolicyList.indexOf(material.policyDirection)
    const subIdx = this.data.editSubDirectionList.indexOf(material.subDirection)

    this.setData({
      showTagDrawer: true,
      editingMaterial: material,
      editMacroField: macroIdx >= 0 ? macroIdx.toString() : '0',
      editPolicyDirection: policyIdx >= 0 ? policyIdx.toString() : '0',
      editSubDirection: subIdx >= 0 ? subIdx.toString() : '0'
    })
  },

  /**
   * 关闭标签编辑抽屉
   */
  closeTagDrawer() {
    this.setData({
      showTagDrawer: false,
      editingMaterial: null
    })
  },

  /**
   * 编辑过程中改变宏观领域
   */
  onEditMacroFieldChange(e) {
    this.setData({
      editMacroField: e.detail.value
    })
  },

  /**
   * 编辑过程中改变政策方向
   */
  onEditPolicyChange(e) {
    this.setData({
      editPolicyDirection: e.detail.value
    })
  },

  /**
   * 编辑过程中改变分论点方向
   */
  onEditSubDirectionChange(e) {
    this.setData({
      editSubDirection: e.detail.value
    })
  },

  /**
   * 提交标签更新（调用云函数）
   */
  submitTagUpdate() {
    if (!this.data.editingMaterial) return

    const newMacroField = this.data.editMacroFieldList[parseInt(this.data.editMacroField)]
    const newPolicyDirection = this.data.editPolicyList[parseInt(this.data.editPolicyDirection)]
    const newSubDirection = this.data.editSubDirectionList[parseInt(this.data.editSubDirection)]

    // 检查是否有实际改变
    const material = this.data.editingMaterial
    if (
      material.macroField === newMacroField &&
      material.policyDirection === newPolicyDirection &&
      material.subDirection === newSubDirection
    ) {
      wx.showToast({
        title: '标签未改变',
        icon: 'none'
      })
      return
    }

    this.setData({ isUpdatingTags: true })

    wx.cloud.callFunction({
      name: 'updateMaterialTags',
      data: {
        materialId: material._id,
        macroField: newMacroField,
        policyDirection: newPolicyDirection,
        subDirection: newSubDirection
      },
      success: (res) => {
        console.log('标签更新结果:', res.result)

        if (res.result.ok) {
          // 更新本地列表中的素材
          const materials = this.data.filteredMaterials.map(m => {
            if (m._id === material._id) {
              return {
                ...m,
                macroField: newMacroField,
                policyDirection: newPolicyDirection,
                subDirection: newSubDirection
              }
            }
            return m
          })

          this.setData({
            filteredMaterials: materials,
            showTagDrawer: false,
            editingMaterial: null,
            isUpdatingTags: false
          })

          wx.showToast({
            title: '标签已更新',
            icon: 'success',
            duration: 1500
          })

          // 重新加载以确保数据最新
          this.loadMaterials(true)
        } else {
          this.setData({ isUpdatingTags: false })
          wx.showToast({
            title: res.result.message || '更新失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('云函数调用失败:', err)
        this.setData({ isUpdatingTags: false })
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 从示例或热点中添加素材到数据库
   */
  onAddMaterialTap(e) {
    const material = e.currentTarget.dataset.material
    const topic = e.currentTarget.dataset.topic

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
        topic: topic || '热点素材'
      },
      success: (res) => {
        wx.hideLoading()
        if (res.result.ok) {
          wx.showToast({
            title: '已加入素材库',
            icon: 'success',
            duration: 2000
          })
          // 重新加载数据
          this.loadMaterials(true)
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
   * 跳转到 DIY 页面（唯一的DIY入口）
   */
  goToDiy() {
    if (this.data.selectedMaterials.length === 0) {
      wx.showToast({
        title: '请先选择素材',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/diy/index',
      success: (res) => {
        res.eventChannel.emit('selectedMaterials', {
          materials: this.data.selectedMaterials
        })
      }
    })
  },

  /**
   * 搜索关键词输入
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  /**
   * 执行搜索
   */
  performSearch() {
    this.loadMaterials(true)
  },

  /**
   * 切换导航树展开状态
   */
  toggleNavItem(e) {
    const { name } = e.currentTarget.dataset
    const expanded = [...this.data.expandedNavItems]
    const index = expanded.indexOf(name)
    
    if (index > -1) {
      expanded.splice(index, 1)
    } else {
      expanded.push(name)
    }
    
    this.setData({ expandedNavItems: expanded })
  },

  /**
   * 移除筛选 chip
   */
  removeChip(e) {
    const { value } = e.currentTarget.dataset
    const chips = this.data.selectedChips.filter(c => c !== value)
    this.setData({ selectedChips: chips })
    
    // 同步更新对应的筛选条件
    if (this.data.macroFieldList.includes(value)) {
      this.setData({
        selectedMacroField: '全部',
        selectedMacroFieldIndex: 0
      })
    } else if (this.data.policyList.includes(value)) {
      this.setData({
        selectedPolicy: '全部',
        selectedPolicyIndex: 0
      })
    } else if (this.data.subDirectionList.includes(value)) {
      this.setData({
        selectedSubDirection: '全部',
        selectedSubDirectionIndex: 0
      })
    }
    
    this.loadMaterials(true)
  },

  /**
   * 加入背诵本
   */
  addToMemory() {
    const material = this.data.selectedMaterial
    if (!material) {
      wx.showToast({
        title: '请先选择素材',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '已加入背诵本',
      icon: 'success'
    })

    // TODO: 调用云函数将素材加入背诵本
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
