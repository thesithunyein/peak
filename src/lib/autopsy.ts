import type { AnalyzedPost, Recipe } from "./types";
import { DAY_NAMES, hourLabel } from "./metrics";

export function buildAutopsy(
  post: AnalyzedPost,
  recipe: Recipe,
  medianRate: number
): string {
  const causes: string[] = [];

  if (
    recipe.idealLength.max > 0 &&
    post.length > recipe.idealLength.max + 20
  ) {
    causes.push(
      `runs long at ${post.length} chars, your hits stay around ${recipe.idealLength.median}`
    );
  }

  if (!post.hasQuestion && !post.hasNumber) {
    causes.push("opens with no question and no number, the two openers your hits use");
  }

  if (post.hashtags.length === 0 && recipe.idealHashtagCount > 0) {
    causes.push(
      `has no hashtags, your hits average ${recipe.idealHashtagCount}`
    );
  }

  const inBestDay = recipe.bestDays.includes(DAY_NAMES[post.day]);
  const inBestHour = recipe.bestHours.includes(post.hour);
  if ((!inBestDay || !inBestHour) && recipe.bestDays.length > 0) {
    const window = `${recipe.bestDays.join(" and ")} at ${recipe.bestHours
      .map(hourLabel)
      .join(" or ")}`;
    causes.push(
      `went out ${DAY_NAMES[post.day]} at ${hourLabel(post.hour)}, outside your ${window} window`
    );
  }

  if (medianRate > 0 && post.engagementRate < medianRate * 0.5) {
    causes.push("pulled less than half your baseline rate");
  }

  if (causes.length === 0) {
    causes.push("no single cause stands out, it just did not clear your baseline");
  }

  const top = causes.slice(0, 2);
  const body = top.length === 1 ? top[0] : `${top[0]}, and it ${top[1]}`;
  return `It flopped because it ${body}.`;
}
