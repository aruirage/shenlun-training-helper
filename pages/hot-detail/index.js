Page({
  data: {
    userAvatar: '',
    hotspot: {},
    isLoading: true
  },

  onLoad(options) {
    const hotspotId = options.id;
    this.loadHotspot(hotspotId);
  },

  async loadHotspot(hotspotId) {
    this.setData({ isLoading: true });
    
    try {
      // 1. 尝试从云端获取结构化数据
      // 注意：此处为逻辑演示，实际需配置云环境
      /*
      const { result } = await wx.cloud.callFunction({
        name: 'getStructuredHotspot',
        data: { hotspotId }
      });
      */
      
      // 模拟逻辑：如果没找到，则调用改写函数
      let structuredData = null;
      
      // 模拟 AI 改写后的数据
      setTimeout(() => {
        structuredData = {
          id: hotspotId,
          title: "【时政热点】数字乡村建设：以数字化转型驱动乡村振兴新引擎",
          date: "2025-12-29",
          tags: ["数字经济", "乡村振兴", "基层治理"],
          timeline: [
            "中央政治局会议强调要加快数字乡村建设步伐，完善农村信息基础设施。",
            "农业农村部发布《数字乡村发展行动计划》，明确了阶段性目标。",
            "多地试点“互联网+政务服务”向基层延伸，实现办事不出村。"
          ],
          keyPoints: [
            "“数字经济是乡村振兴的‘新引擎’，更是民生保障的‘压舱石’。”",
            "“要以数字化转型驱动生产方式、生活方式和治理方式变革。”",
            "“让手机成为‘新农具’，让直播成为‘新农活’，让数据成为‘新农资’。”"
          ],
          examValue: "申论热点：数字乡村、高质量发展、城乡融合。可作为“科技赋能”、“民生改善”等主题的论据。",
          summary: "本文深入解读了数字乡村建设的核心逻辑，强调通过数字化手段破解城乡二元结构，提升基层治理效能，为乡村振兴注入持久动力。"
        };

        this.setData({
          hotspot: structuredData,
          isLoading: false
        });
      }, 800);

    } catch (err) {
      console.error('加载热点详情失败', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  goToTraining() {
    wx.navigateTo({
      url: `/pages/hot-train/index?id=${this.data.hotspot.id}`
    });
  },

  // 复制热点摘要
  copyContent(e) {
    const field = e.currentTarget.dataset.field;
    const content = this.data.hotspot[field];
    
    if (!content) return;
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  }
})