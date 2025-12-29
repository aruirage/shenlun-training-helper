// utils/ai-prompt.js
function generateShenLunPrompt(hotspotTitle) {
  return `你是一名资深申论阅卷专家。根据人民日报热点"${hotspotTitle}"，生成完整训练材料。

**输出严格JSON格式**（无其他文字）：

\`\`\`json
{
  "question": "以'${hotspotTitle}'为题，写分论点。（30分）",
  "material": "100字人民日报风格材料，包含最新数据、案例、问题、建议",
  "scoring_criteria": {
    "结构": "总分总结构、逻辑清晰、层次分明",
    "论点": "紧扣热点、站位准确、有深度", 
    "论据": "数据支撑有力、案例典型、人民日报风格",
    "语言": "精炼准确、文采斐然、无错别字"
  },
  "reference_answer": "120字标准范文（总分总结构）",
  "recommended_materials": [
    "2025年该领域核心产业增加值占GDP比重达10%",
    "相关区域增速15.2%，高于全国平均水平",
    "基础设施建设突破关键节点，位居全球前列"
  ]
}
\`\`\`

**要求**：
1. 题目：紧扣热点关键词+分论点要求
2. 材料：人民日报口吻，数据真实感，问题对策并重
3. 评分标准：4维度具体标准
4. 参考答案：120字总分总，人民日报文风
5. 推荐素材：3条具体数据/案例`;
}

module.exports = { generateShenLunPrompt };
