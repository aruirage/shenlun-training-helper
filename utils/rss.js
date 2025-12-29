// utils/rss.js - 混合RSS + 本地库
const LOCAL_HOTSPOTS = [
  "中央经济工作会议部署2026年经济工作",
  "数字经济高质量发展提速",
  "新质生产力培育加快推进",
  "积极财政政策适度加力",
  "稳中求进工作总基调",
  "产业链供应链安全稳定",
  "扩大内需战略实施",
  "房地产市场保交楼稳房价",
  "资本市场改革深化",
  "区域协调发展新格局",
  "二十届三中全会精神",
  "全面从严治党向纵深发展",
  "反腐败斗争永远在路上",
  "总体国家安全观",
  "网络强国建设",
  "全面依法治国",
  "党的二十大精神",
  "高质量发展新征程",
  "扎实推进共同富裕",
  "教育强国建设",
  "健康中国战略实施",
  "乡村振兴战略",
  "就业优先政策",
  "养老服务提质增效",
  "食品安全底线",
  "生态文明建设",
  "碳达峰碳中和目标",
  "文化自信自强",
  "科技创新引领发展",
  "国防和军队现代化"
];

async function fetchMixedHotspots() {
  // 内部辅助函数：获取本地随机热点
  const getLocalHotspots = (count) => {
    return [...LOCAL_HOTSPOTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((title, index) => ({
        id: `local_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
        title: title,
        date: new Date().toLocaleDateString('zh-CN'),
        source: '热点库',
        tags: ['精选', '申论']
      }));
  };

  try {
    console.log('🔄 尝试获取人民日报RSS...');
    
    const rssRes = await wx.request({
      url: 'https://www.people.com.cn/rss/politics.xml',
      timeout: 5000
    });

    if (rssRes.statusCode !== 200) {
      console.warn('RSS 资源响应异常:', rssRes.statusCode);
      return getLocalHotspots(8);
    }

    const rssHotspots = parseRSS(rssRes.data);
    console.log(`✅ RSS解析结果：${rssHotspots.length}条`);

    if (rssHotspots.length >= 8) {
      return rssHotspots.slice(0, 8);
    } else {
      // 补齐逻辑
      const supplement = getLocalHotspots(8 - rssHotspots.length);
      return [...rssHotspots, ...supplement];
    }

  } catch (error) {
    console.error('❌ RSS获取失败，切换全本地模式:', error);
    return getLocalHotspots(8);
  }
}

// RSS解析函数 (针对人民日报RSS格式的简单正则解析)
function parseRSS(data) {
  if (typeof data !== 'string') return [];
  const hotspots = [];
  
  // 简单的正则匹配 <item> 中的 <title>
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/;
  const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/;
  
  let match;
  let count = 0;
  while ((match = itemRegex.exec(data)) !== null && count < 8) {
    const itemContent = match[1];
    const titleMatch = itemContent.match(titleRegex);
    const dateMatch = itemContent.match(dateRegex);
    
    let title = titleMatch ? (titleMatch[1] || titleMatch[2]) : '';
    title = title.replace(/【[^】]*】/g, '').trim();
    
    if (title && title.length > 5 && title.length < 50) {
      hotspots.push({
        id: `rss_${Date.now()}_${count}`,
        title: title.length > 25 ? title.slice(0, 25) + '...' : title,
        fullTitle: title,
        date: dateMatch ? formatDate(dateMatch[1]) : new Date().toLocaleDateString('zh-CN'),
        source: '人民日报',
        tags: ['实时', '热点']
      });
      count++;
    }
  }
  
  return hotspots;
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  } catch (e) {
    return new Date().toLocaleDateString('zh-CN');
  }
}

module.exports = { fetchMixedHotspots };
