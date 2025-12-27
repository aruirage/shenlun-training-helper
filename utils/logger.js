const LOG_KEY = 'study_logs';

/**
 * 记录学习日志
 * @param {Object} event
 * @param {string} event.type - 'hot_train' | 'full_train' | 'memory'
 * @param {string} [event.mode] - 'study' | 'quiz' | null
 * @param {string} [event.result] - 'pass' | 'fail' | null
 * @param {string} [event.materialId] - material ID
 * @param {number} [event.createdAt] - timestamp
 */
function logStudyEvent(event) {
  try {
    const logs = wx.getStorageSync(LOG_KEY) || [];
    const newLog = {
      ...event,
      createdAt: event.createdAt || Date.now()
    };
    logs.push(newLog);
    // 简单限制日志数量，避免无限增长，保留最近 1000 条
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    wx.setStorageSync(LOG_KEY, logs);
    console.log('Study event logged:', newLog);
  } catch (e) {
    console.error('Failed to log study event:', e);
  }
}

/**
 * 计算最近 7 天的统计数据
 * @returns {Object} { weekSummary, moduleStats }
 */
function computeStatsFromLogs() {
  try {
    const logs = wx.getStorageSync(LOG_KEY) || [];
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // 过滤最近 7 天的日志
    const recentLogs = logs.filter(log => log.createdAt >= oneWeekAgo);

    const weekSummary = {
      totalSessions: recentLogs.length,
      memoryItems: 0,
      writingSessions: 0
    };

    const moduleStats = {
      hotTrain: { sessions: 0 },
      fullTrain: { sessions: 0 },
      memory: {
        studyCount: 0,
        quizCount: 0,
        quizCorrectRate: 0
      }
    };

    let quizPassCount = 0;

    recentLogs.forEach(log => {
      // 统计 weekSummary
      if (log.type === 'memory') {
        weekSummary.memoryItems++;
      } else if (log.type === 'hot_train' || log.type === 'full_train') {
        weekSummary.writingSessions++;
      }

      // 统计 moduleStats
      if (log.type === 'hot_train') {
        moduleStats.hotTrain.sessions++;
      } else if (log.type === 'full_train') {
        moduleStats.fullTrain.sessions++;
      } else if (log.type === 'memory') {
        if (log.mode === 'study') {
          moduleStats.memory.studyCount++;
        } else if (log.mode === 'quiz') {
          moduleStats.memory.quizCount++;
          if (log.result === 'pass') {
            quizPassCount++;
          }
        } else {
            // 兼容旧数据或默认归为 study
             moduleStats.memory.studyCount++;
        }
      }
    });

    // 计算正确率
    if (moduleStats.memory.quizCount > 0) {
      moduleStats.memory.quizCorrectRate = (quizPassCount / moduleStats.memory.quizCount).toFixed(2);
    }

    return { weekSummary, moduleStats };

  } catch (e) {
    console.error('Failed to compute stats:', e);
    return null;
  }
}

module.exports = {
  logStudyEvent,
  computeStatsFromLogs
};