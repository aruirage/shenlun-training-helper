// pages/memory/index.js
const { detectPad } = require('../../utils/device.js')
const { logStudyEvent } = require('../../utils/logger.js')

Page({
  data: {
    isPad: true,
    activeNav: '背诵本',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',

    // 背诵状态
    isFlipped: false,
    peek: false,
    currentIndex: 0,
    totalCount: 12,
    currentProgress: 4,
    progressDots: [0, 1, 2, 3, 4, 5, 6, 7], // 固定8个进度点

    // 素材列表
    materials: [
      {
        id: 1,
        type: '金句',
        topic: '文化强国',
        backText: '文化是一个国家、一个民族的“灵魂”。在数字化转型的浪潮中，坚定“文化自信”方能行稳致远。',
        usageTip: '常用于论述文化与科技结合、文化出海等主题的结尾升华段落。',
        memoryLevel: 1,
        reviewCount: 2
      },
      {
        id: 2,
        type: '案例',
        topic: '乡村振兴',
        backText: '浙江“千万工程”通过数字化手段实现了“精准治理”。通过邻里码、乡村大脑等工具，让办事不出村成为现实。',
        usageTip: '适合作为事实论据，支撑数字化赋能基层治理的论点。',
        memoryLevel: 2,
        reviewCount: 5
      },
      {
        id: 3,
        type: '金句',
        topic: '数字经济',
        backText: '数据是新时代的“生产要素”，也是连接千家万户的“治理密码”。我们要以数字化转型驱动生产方式变革。',
        usageTip: '适用于论述数据要素价值、智慧城市建设等话题。',
        memoryLevel: 0,
        reviewCount: 1
      },
      {
        id: 4,
        type: '政策',
        topic: '高质量发展',
        backText: '坚持以人民为中心的发展思想，切实增强人民群众的“获得感”、“幸福感”和“安全感”。',
        usageTip: '申论大作文民生类话题的万能结尾句。',
        memoryLevel: 3,
        reviewCount: 8
      }
    ],
    currentMaterial: null
  },

  onLoad() {
    this.detectDeviceType()
    this.initMaterials()
    this.updateCurrentMaterial()
  },

  initMaterials() {
    const OFFICIAL_WORDS = ['灵魂', '精准治理', '新引擎', '压舱石', '必由之路', '获得感', '幸福感', '安全感', '守正创新', '文化自信', '高质量发展', '新动能', '生产要素', '治理密码'];
    
    const materials = this.data.materials.map(m => {
      const backText = m.backText;
      let hiddenWords = [];
      let segments = [];
      
      // 查找需要遮挡的词
      let tempText = backText;
      OFFICIAL_WORDS.forEach(word => {
        if (tempText.includes(word) && hiddenWords.length < 2) {
          hiddenWords.push(word);
        }
      });

      if (hiddenWords.length === 0) {
        const match = backText.match(/“(.+?)”/);
        if (match) hiddenWords.push(match[1]);
      }

      // 将文本拆分为段落和遮挡块
      let lastIdx = 0;
      let sortedHidden = hiddenWords.sort((a, b) => backText.indexOf(a) - backText.indexOf(b));
      
      sortedHidden.forEach(word => {
        const idx = backText.indexOf(word, lastIdx);
        if (idx > -1) {
          if (idx > lastIdx) {
            segments.push({ text: backText.substring(lastIdx, idx), isHidden: false });
          }
          segments.push({ text: word, isHidden: true });
          lastIdx = idx + word.length;
        }
      });
      
      if (lastIdx < backText.length) {
        segments.push({ text: backText.substring(lastIdx), isHidden: false });
      }

      // 动态计算字号，确保不超出卡片
      const textLength = backText.length;
      let fontSize = 32;
      if (textLength > 40) fontSize = 28;
      if (textLength > 60) fontSize = 24;
      if (textLength > 80) fontSize = 20;
      if (textLength > 100) fontSize = 18;

      return { 
        ...m, 
        backText,
        segments, 
        hiddenWord: hiddenWords.join('、'),
        fontSize
      };
    });

    this.setData({ materials, totalCount: materials.length });
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  updateCurrentMaterial() {
    const { materials, currentIndex } = this.data
    const material = materials[currentIndex % materials.length];
    
    // 计算熟练度
    const memoryLevel = material.memoryLevel || 0;
    const reviewCount = material.reviewCount || 0;
    const lastResult = material.lastResult || 0;
    const proficiency = Math.min(100, 20 * memoryLevel + 5 * reviewCount + 20 * lastResult);
    
    this.setData({
      currentMaterial: { ...material, proficiency },
      isFlipped: false,
      peek: false
    })
  },

  toggleFlip() {
    this.setData({
      isFlipped: !this.data.isFlipped
    })
  },

  onPeekStart() {
    this.setData({ peek: true })
  },

  onPeekEnd() {
    this.setData({ peek: false })
  },

  onPrev() {
    let { currentIndex } = this.data
    if (currentIndex > 0) {
      this.setData({ currentIndex: currentIndex - 1 }, () => {
        this.updateCurrentMaterial()
      })
    }
  },

  onNext() {
    let { currentIndex, totalCount } = this.data
    if (currentIndex < totalCount - 1) {
      this.setData({ currentIndex: currentIndex + 1 }, () => {
        this.updateCurrentMaterial()
      })
    }
  },

  onMastered() {
    const material = this.data.currentMaterial;
    logStudyEvent('memory_study', {
      materialId: material.id,
      result: 1
    });
    wx.showToast({ title: '已掌握', icon: 'success' })
    this.onNext()
  },

  onNotRemembered() {
    const material = this.data.currentMaterial;
    logStudyEvent('memory_study', {
      materialId: material.id,
      result: 0
    });
    wx.showToast({ title: '需复习', icon: 'none' })
    this.onNext()
  },

  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (name === '背诵本' || !route) return
    wx.navigateTo({ url: route })
  },

  refreshCurve() {
    wx.showLoading({ title: '刷新中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '曲线已更新' })
    }, 1000)
  }
})
