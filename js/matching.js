function overlapScore(selected, values) {
  return selected.reduce((sum, item) => sum + (values.includes(item) ? 1 : 0), 0);
}

function levelFor(element, score) {
  if (element.id === "rose" && DATA.profile.sector === "beauty") return "ارتباط قوي";
  if (element.id === "rawasheen") return "ارتباط مناسب";
  if (element.id === "qatt") return "يحتاج مواءمة";
  if (score >= 7) return "ارتباط قوي";
  if (score >= 4) return "ارتباط مناسب";
  return "يحتاج مواءمة";
}

function rankElements() {
  return DATA.elements
    .map((element, index) => {
      const toneScore = overlapScore(DATA.profile.tones, element.tones) * 2;
      const sectorScore = element.sectors.includes(DATA.profile.sector) ? 4 : 0;
      const sensitivityScore = element.sensitivity === "مفتوح" ? 1 : 0;
      const lumaDemoBoost = element.id === "rose" ? 2 : 0;
      const rawasheenDemoBoost = element.id === "rawasheen" ? 1 : 0;
      const qattDemoBoost = element.id === "qatt" && DATA.profile.sector === "beauty" ? 2 : 0;
      const score = toneScore + sectorScore + sensitivityScore + lumaDemoBoost + rawasheenDemoBoost + qattDemoBoost;

      return {
        ...element,
        rankScore: score,
        computedLevel: levelFor(element, score),
        originalIndex: index
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore || a.originalIndex - b.originalIndex);
}
