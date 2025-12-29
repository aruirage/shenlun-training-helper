// pages/me/index.js
const { detectPad } = require('../../utils/device.js')
const { computeStatsFromLogs } = require('../../utils/logger.js')

Page({
  data: {
    isPad: true,
    activeNav: '我的',

    // 用户信息
    userInfo: {
      nickname: '笔耕者 #8848',
      level: '白银考手 LV.12',
      motto: '“笔耕不辍，金榜题名。”',
      streakDays: 14,
      avatar: 'https://mgx-backend-cdn.metadl.com/generate/images/869485/2025-12-27/97908f92-7bdb-4515-8666-8093dcb25b5b.png'
    },

    // 本周复盘
    weekStats: {
      range: '12/21 - 12/27',
      trainCount: 42,
      trainTrend: '+12%',
      memoryTime: '8.5h',
      aiAdoption: 128
    },

    // 主题分布
    topicDistribution: [
      { name: '数字经济', percentage: 40, color: '#34D399' },
      { name: '乡村振兴', percentage: 25, color: '#FCD34D' },
      { name: '生态文明', percentage: 20, color: '#10B981' },
      { name: '其他', percentage: 15, color: '#94A3B8' }
    ],

    // AI 建议
    aiSuggestions: [
      { title: '重点关注', content: '“你在‘政治理论’模块背诵准确率仅 65%，建议下周一二重点复习。”' },
      { title: '拓展建议', content: '“尝试将‘科技创新’话题与‘共同富裕’进行跨维度联觉训练。”' }
    ],

    // 打卡网格 (28天)
    streakGrid: []
  },

  onLoad() {
    this.detectDeviceType()
    this.refreshStats()
  },

  onShow() {
    this.refreshStats()
  },

  refreshStats() {
    const stats = computeStatsFromLogs();
    this.setData({
      'userInfo.streakDays': stats.streakDays,
      'weekStats.trainCount': stats.todayTotal // 简化展示
    });
    this.initStreakGrid(stats.streakDays);
  },

  detectDeviceType() {
    detectPad((isPad) => {
      this.setData({ isPad })
    })
  },

  initStreakGrid(streakDays = 14) {
    const grid = []
    for (let i = 0; i < 28; i++) {
      grid.push({
        active: i < streakDays
      })
    }
    this.setData({ streakGrid: grid })
  },

  onNavItemTap(e) {
    const { name, route } = e.currentTarget.dataset
    if (name === '我的' || !route) return
    wx.navigateTo({ url: route })
  },

  onSettingsTap() {
    wx.showToast({ title: '设置', icon: 'none' })
  },

  onLogoutTap() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  }
})
