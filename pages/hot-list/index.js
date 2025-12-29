const { fetchMixedHotspots } = require('../../utils/rss');

Page({
  data: {
    currentDate: '',
    activeNav: '今日热点',
    userAvatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png',
    hotTopics: [],
    loading: false
  },

  async onLoad() {
    this.setCurrentDate();
    this.setData({ loading: true });
    try {
      const hotspots = await fetchMixedHotspots();
      this.setData({
        hotTopics: hotspots,
        loading: false
      });
    } catch (err) {
      console.error('加载热点失败:', err);
      this.setData({ loading: false });
    }
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

  /**
   * 跳转到训练页
   */
  goToTraining(e) {
    const { title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/hot-train/index?title=${encodeURIComponent(title)}`
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
    
    wx.reLaunch({
      url: route,
      fail: () => {
        wx.showToast({ title: '功能开发中', icon: 'none' })
      }
    })
  }
})
