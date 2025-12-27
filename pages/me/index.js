const { computeStatsFromLogs } = require('../../utils/logger.js');
const { detectPad } = require('../../utils/device.js');

Page({
  data: {
    isPad: false,
    activeNav: '我的',
    navItems: [
      { name: '首页', icon: '🏠', route: '/pages/home/index' },
      { name: '今日热点', icon: '🔥', route: '/pages/hot-list/index' },
      { name: '热点训练', icon: '💪', route: '/pages/hot-train/index' },
      { name: '真题训练', icon: '✍️', route: '/pages/full-train/index' },
      { name: '背诵本', icon: '📚', route: '/pages/memory/index' },
      { name: '我的', icon: '👤', route: '' }
    ],
    weekSummary: {
      totalSessions: 0,
      memoryItems: 0,
      writingSessions: 0
    },
    moduleStats: {
      hotTrain: { sessions: 0 },
      fullTrain: { sessions: 0 },
      memory: {
        studyCount: 0,
        quizCount: 0,
        quizCorrectRate: 0
      }
    },
    topicStats: [
      // 示例数据，后续可根据 log 聚合
      { topic: '共同富裕', mastered: 6, toReview: 4 },
      { topic: '数字政府', mastered: 3, toReview: 5 }
    ]
  },

  onLoad() {
    this.isPad = detectPad()
    this.setData({ isPad: this.isPad })
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 导航栏跳转
  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (route) {
      wx.navigateTo({ url: route })
    }
  },

  loadStats() {
    const stats = computeStatsFromLogs();
    if (stats) {
      this.setData({
        weekSummary: stats.weekSummary,
        moduleStats: stats.moduleStats
      });
    }
  },

  goHome() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/home/index',
        });
      }
    });
  }
})