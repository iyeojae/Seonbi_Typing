export const HERO_PATH = `${process.env.PUBLIC_URL}/hero`;

export const RANK_GROUPS = [
  {
    code: "01",
    baseRank: "도사",
    ranks: ["도사", "정랑", "참정"],
    icon: "grade-icon-01.svg",
  },
  {
    code: "02",
    baseRank: "사인",
    ranks: ["사인", "집의"],
    icon: "grade-icon-02.svg",
  },
  {
    code: "03",
    baseRank: "참의",
    ranks: ["참의", "동지사"],
    icon: "grade-icon-03.svg",
  },
  {
    code: "04",
    baseRank: "지사",
    ranks: ["지사", "판사"],
    icon: "grade-icon-04.svg",
  },
  {
    code: "05",
    baseRank: "영의정",
    ranks: ["영의정"],
    icon: "grade-icon-05.svg",
  },
];

export const GRADE_TRACK_DOTS = 9;

export function getRankGroup(rank) {
  return (
    RANK_GROUPS.find((group) => group.ranks.includes(rank)) ||
    RANK_GROUPS[0]
  );
}

export function getProfileIconPath(rank) {
  return `${HERO_PATH}/${rank === "영의정" ? "profile-icon-max.svg" : "profile-icon.svg"}`;
}