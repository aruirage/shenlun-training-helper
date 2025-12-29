// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const { answer, hotspotData } = event
  
  // 这里模拟 AI 评分逻辑
  
  return {
    "total": 78,
    "details": [
      { "name": "论点准确", "score": 26, "max": 30 },
      { "name": "论据充分", "score": 18, "max": 20 },
      { "name": "逻辑严密", "score": 15, "max": 20 },
      { "name": "语言规范", "score": 10, "max": 15 },
      { "name": "字数达标", "score": 9, "max": 15 }
    ],
    "rewrite": {
      "rewritten": "数字化赋能乡村治理，应以‘精准化’为导向，打破信息孤岛，提升公共服务触达效率。通过构建统一的数字平台，实现政务服务‘一网通办’，让数据多跑路，群众少跑腿。",
      "scoreBoost": "+15"
    },
    "materials": [
      { "id": 1, "type": "金句", "content": "“数字技术是手段，民生福祉是目的。”" },
      { "id": 2, "type": "案例", "content": "浙江‘千万工程’中的数字化实践。" },
      { "id": 3, "type": "政策", "content": "《数字乡村发展行动计划（2022-2025年）》" },
      { "id": 4, "type": "金句", "content": "“让数字红利惠及每一个角落。”" },
      { "id": 5, "type": "案例", "content": "某地‘城市大脑’赋能基层治理。" }
    ]
  }
}
