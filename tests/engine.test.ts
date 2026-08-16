import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parseCsvText, csvToPosts } from "../src/lib/csv";
import { analyze } from "../src/lib/postmortem";

describe("parseCsvText", () => {
  it("parses quoted fields with commas and escaped quotes", () => {
    const rows = parseCsvText(
      'a,b,"hello, world","say ""hi"""\n1,2,3,4'
    );
    expect(rows).toEqual([
      ["a", "b", "hello, world", 'say "hi"'],
      ["1", "2", "3", "4"],
    ]);
  });

  it("strips a UTF-8 BOM and handles CRLF", () => {
    const rows = parseCsvText("\uFEFFa,b\r\n1,2\r\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps newlines inside quoted fields", () => {
    const rows = parseCsvText('a,"line1\nline2"\n1,x');
    expect(rows[0][1]).toBe("line1\nline2");
  });
});

describe("csvToPosts", () => {
  it("maps X analytics headers and parses rows", () => {
    const csv =
      "Tweet id,Tweet text,time,impressions,engagements,likes\n" +
      '1,"Hello world #buildinpublic",2026-08-05 09:00 +0000,1000,50,40\n';
    const result = csvToPosts(csv);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].text).toBe("Hello world #buildinpublic");
    expect(result.rows[0].impressions).toBe(1000);
    expect(result.rows[0].likes).toBe(40);
  });

  it("reports missing required columns", () => {
    const csv = "Tweet id,Tweet text\n1,hello\n";
    const result = csvToPosts(csv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.join(" ")).toContain("time");
  });
});

describe("analyze", () => {
  const sample = readFileSync("public/sample-export.csv", "utf-8");

  it("classifies the sample into hits and misses with autopsies", () => {
    const { rows, errors } = csvToPosts(sample);
    expect(errors).toEqual([]);
    const report = analyze(rows);
    expect(report.enoughData).toBe(true);
    expect(report.hitCount).toBeGreaterThan(0);
    expect(report.missCount).toBeGreaterThan(0);
    expect(report.hits.length + report.misses.length).toBeLessThan(
      report.validCount
    );
    for (const m of report.misses) {
      expect(m.why.length).toBeGreaterThan(0);
    }
    expect(report.recipe.topOpenings.length).toBeGreaterThan(0);
    expect(report.recipe.voiceSamples.length).toBeGreaterThan(0);
  });

  it("flags small samples as not enough data", () => {
    const small = csvToPosts(
      "Tweet id,Tweet text,time,impressions,engagements\n" +
        '1,"a",2026-08-01 09:00 +0000,100,5\n' +
        '2,"b",2026-08-02 09:00 +0000,100,4\n'
    );
    const report = analyze(small.rows);
    expect(report.enoughData).toBe(false);
    expect(report.hitCount).toBe(0);
    expect(report.missCount).toBe(0);
  });
});
