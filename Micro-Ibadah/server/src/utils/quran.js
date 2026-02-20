const TOTAL_QURAN_AYAHS = 6236;

const calculateQuranPlan = ({ ayahsPerRead, timesPerDay, startedAt = null }) => {
  const totalPerDay = Number(ayahsPerRead) * Number(timesPerDay);
  const daysToFinish = totalPerDay > 0 ? Math.ceil(TOTAL_QURAN_AYAHS / totalPerDay) : 0;

  let paceText = "Set a plan to start tracking progress.";
  if (startedAt && totalPerDay > 0) {
    const startDate = new Date(startedAt);
    const today = new Date();
    const diffDays = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const expectedByNow = diffDays * totalPerDay;
    const completionRatio = Math.min(1, expectedByNow / TOTAL_QURAN_AYAHS);
    const expectedDaysDone = Math.ceil(completionRatio * daysToFinish);
    const delta = diffDays - expectedDaysDone;

    if (delta > 0) {
      paceText = `You're ahead by ${delta} day(s). Keep the rhythm.`;
    } else if (delta < 0) {
      paceText = `You're behind by ${Math.abs(delta)} day(s). Small catch-up works.`;
    } else {
      paceText = "You're exactly on track. BarakAllahu feek.";
    }
  }

  return {
    totalAyahsPerDay: totalPerDay,
    daysToCompletion: daysToFinish,
    totalAyahsInQuran: TOTAL_QURAN_AYAHS,
    paceText,
  };
};

module.exports = { calculateQuranPlan, TOTAL_QURAN_AYAHS };
