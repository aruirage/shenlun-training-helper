// component/sidebar-nav/index.js
Component({
  properties: {
    activeNav: {
      type: String,
      value: '首页'
    },
    userAvatar: {
      type: String,
      value: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png'
    }
  },

  data: {
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '🖋️', route: '/pages/hot-train/index' },
      { name: '素材库', icon: '📚', route: '/pages/materials/index' },
      { name: '背诵本', icon: '🔖', route: '/pages/memory/index' },
      { name: '我的', icon: '👤', route: '/pages/me/index' }
    ]
  },

  methods: {
    onNavItemTap(e) {
      const { name, route } = e.currentTarget.dataset;
      
      if (name === this.properties.activeNav) return;

      if (!route) {
        wx.showToast({ title: '功能开发中', icon: 'none' });
        return;
      }

      wx.navigateTo({
        url: route,
        fail: (err) => {
          console.error('导航失败:', route, err);
          wx.showToast({ title: '页面跳转失败', icon: 'none' });
        }
      });
    },

    onUserTap() {
      wx.navigateTo({
        url: '/pages/me/index',
        fail: (err) => {
          console.error('导航失败:', '/pages/me/index', err);
        }
      });
    }
  }
})
