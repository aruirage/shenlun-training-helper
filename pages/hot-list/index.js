// pages/hot-list/index.js
Page({
  data: {
    currentDate: '',
    activeNav: '今日热点',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',
    showTopicModal: false,
    selectedTopic: null,
    hotTopics: [
      {
        id: 't1',
        title: '激发数字经济新动能，绘就民生福祉新画卷',
        summary: '今年以来，我国数字经济规模持续扩大，数字化转型在乡村治理、公共服务领域成效显著。',
        date: '2025-12-27',
        tags: ['数字经济', '乡村振兴', '公共服务'],
        aiCase: '',
        isGenerating: false
      },
      {
        id: 't2',
        title: '以文化出海为契机，讲好中国故事',
        summary: '国产游戏与影视作品在全球市场走红，文化软实力的提升成为高质量发展的重要支撑。',
        date: '2025-12-26',
        tags: ['文化强国', '数字出海', '高质量发展'],
        aiCase: '',
        isGenerating: false
      },
      {
        id: 't3',
        title: '绿色低碳转型：生态红利如何转化为发展红利',
        summary: '某地通过碳汇交易实现村民致富，探索出一条生态优先、绿色发展的新路子。',
        date: '2025-12-25',
        tags: ['绿色发展', '碳中和', '共同富裕'],
        aiCase: '',
        isGenerating: false
      }
    ]
  },

  onLoad() {
    this.setCurrentDate();
  },

  setCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    this.setData({
      currentDate: `${year}年${month}月${day}日`
    });
  },

  showFullTopic(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      selectedTopic: this.data.hotTopics[index],
      showTopicModal: true
    });
  },

  closeTopicModal() {
    this.setData({
      showTopicModal: false
    });
  },

  addToLibrary(e) {
    const { topicindex, materialindex } = e.currentTarget.dataset;
    const material = this.data.hotTopics[topicindex].materials[materialindex];
    
    // 获取现有素材库
    let userMaterials = wx.getStorageSync('user_materials') || [];
    
    // 检查是否已存在
    const exists = userMaterials.some(m => m.id === material.id || m.content === material.content);
    if (exists) {
      wx.showToast({ title: '已在素材库中', icon: 'none' });
      return;
    }

    // 添加到素材库
    userMaterials.unshift({
      ...material,
      id: material.id || Date.now(),
      collectDate: new Date().toISOString().split('T')[0]
    });
    
    wx.setStorageSync('user_materials', userMaterials);
    
    wx.showToast({
      title: '已加入素材库',
      icon: 'success'
    });
  },

  addToLibraryFromModal(e) {
    const { topicid, materialindex } = e.currentTarget.dataset;
    const topic = this.data.hotTopics.find(t => t.id === topicid);
    if (!topic) return;
    const material = topic.materials[materialindex];
    
    // 获取现有素材库
    let userMaterials = wx.getStorageSync('user_materials') || [];
    
    // 检查是否已存在
    const exists = userMaterials.some(m => m.id === material.id || m.content === material.content);
    if (exists) {
      wx.showToast({ title: '已在素材库中', icon: 'none' });
      return;
    }

    // 添加到素材库
    userMaterials.unshift({
      ...material,
      id: material.id || Date.now(),
      collectDate: new Date().toISOString().split('T')[0]
    });
    
    wx.setStorageSync('user_materials', userMaterials);
    
    wx.showToast({
      title: '已加入素材库',
      icon: 'success'
    });
  },

  /**
   * 切换导航项
   */
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    this.setData({ activeNav: name })
    
    if (name === '今日热点' || !route) {
      return
    }
    
    wx.navigateTo({
      url: route,
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  },

  /**
   * 模拟 AI 生成案例
   */
  generateAICase(e) {
    const { id } = e.currentTarget.dataset;
    const index = this.data.hotTopics.findIndex(t => t.id === id);
    if (index === -1) return;

    const topic = this.data.hotTopics[index];
    
    // 如果已经生成过素材，则直接展开
    if (topic.materials && topic.materials.length > 0) {
      const showMaterialsKey = `hotTopics[${index}].showMaterials`;
      this.setData({ [showMaterialsKey]: !this.data.hotTopics[index].showMaterials });
      return;
    }

    // 设置加载状态
    const isGeneratingKey = `hotTopics[${index}].isGenerating`;
    this.setData({ [isGeneratingKey]: true });
    if (this.data.showTopicModal && this.data.selectedTopic.id === id) {
      this.setData({ 'selectedTopic.isGenerating': true });
    }

    // 模拟 AI 延迟
    setTimeout(() => {
      const mockMaterials = [
        {
          id: Date.now() + 1,
          type: '案例',
          category: topic.tags[0] || '热点',
          content: '某省通过建设‘数字乡村’综合服务平台，实现了政务服务‘一网通办’。',
          background: '该省地处内陆，以往村民办事需要往返县城多次，耗时耗力。',
          actions: '投入专项资金建设数字化平台，覆盖 80% 行政村，培训直播人才。',
          results: '办事往返次数减少 70%，农产品线上销售额增长 45%。',
          source: '新华社',
          date: '2025-12-27',
          proficiency: 20
        },
        {
          id: Date.now() + 2,
          type: '金句',
          category: topic.tags[0] || '热点',
          content: '“数字经济是转型升级的‘新引擎’，更是民生保障的‘压舱石’。” ——《人民日报》',
          fullContent: '“数字经济是转型升级的‘新引擎’，更是民生保障的‘压舱石’。我们要以数字化转型驱动生产方式、生活方式和治理方式变革。” ——《人民日报》',
          source: '人民日报',
          date: '2025-12-26',
          proficiency: 35
        },
        {
          id: Date.now() + 3,
          type: '政策',
          category: topic.tags[0] || '热点',
          content: '《关于加快推进数字乡村建设的指导意见》明确了阶段性目标。',
          fullContent: '《关于加快推进数字乡村建设的指导意见》指出，要坚持系统观念，处理好发展和减排、整体和局部、短期和中长期的关系。',
          source: '国务院官网',
          date: '2025-12-25',
          proficiency: 50
        }
      ];
      
      const materialsKey = `hotTopics[${index}].materials`;
      const showMaterialsKey = `hotTopics[${index}].showMaterials`;
      
      this.setData({
        [materialsKey]: mockMaterials,
        [showMaterialsKey]: true,
        [isGeneratingKey]: false
      });

      if (this.data.showTopicModal && this.data.selectedTopic.id === id) {
        this.setData({ 
          'selectedTopic.materials': mockMaterials,
          'selectedTopic.isGenerating': false
        });
      }

      // 存入本地缓存
      const allGenerated = wx.getStorageSync('generated_materials') || {};
      allGenerated[topic.id] = mockMaterials;
      wx.setStorageSync('generated_materials', allGenerated);

      wx.showToast({
        title: '生成成功',
        icon: 'success'
      });
    }, 1500);
  },

  /**
   * 跳转到素材详情
   */
  goToMaterialDetail(e) {
    const { topicindex, materialindex, topicid } = e.currentTarget.dataset;
    let material;
    
    if (topicid) {
      const topic = this.data.hotTopics.find(t => t.id === topicid);
      material = topic.materials[materialindex];
    } else {
      material = this.data.hotTopics[topicindex].materials[materialindex];
    }
    
    wx.setStorageSync('current_material_detail', material);
    wx.navigateTo({
      url: '/pages/material-detail/index'
    });
  },

  /**
   * 跳转到训练页
   */
  goToTrain(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/hot-train/index?id=${id}`
    });
  }
})
