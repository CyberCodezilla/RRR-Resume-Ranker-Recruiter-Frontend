import { detectTimelineAnomaly } from "./scoreUtils";

/**
 * Extracts the top 5 most frequent skills within the currently filtered shortlisted candidates.
 */
const getTopSkills = (filtered) => {
  const counts = {};
  filtered.forEach((item) => {
    (item.candidate?.skills || []).forEach((s) => {
      const name = s.name;
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};

/**
 * Generates an array of A4 HTML pages (each representation inside a styled .report-page container)
 * suited for browser rendering and html2canvas visual page-by-page PDF capturing.
 */
export const generateHtmlPages = (
  filtered,
  jobDescription,
  stats,
  query,
  sortBy,
  filtersText
) => {
  // Compute score distribution intervals
  const scoreIntervals = { "90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "Below 60": 0 };
  filtered.forEach((item) => {
    const s = item.result.score <= 1 ? item.result.score * 100 : item.result.score;
    if (s >= 90) scoreIntervals["90-100"]++;
    else if (s >= 80) scoreIntervals["80-89"]++;
    else if (s >= 70) scoreIntervals["70-79"]++;
    else if (s >= 60) scoreIntervals["60-69"]++;
    else scoreIntervals["Below 60"]++;
  });
  
  const totalFiltered = filtered.length || 1;

  // Compute top skills
  const topSkills = getTopSkills(filtered);
  const skillBarsHtml = topSkills.map(([skillName, count]) => {
    const percentage = Math.round((count / totalFiltered) * 100);
    return `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${skillName}</div>
        <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
          <div style="background: linear-gradient(90deg, #3B82F6, #2563EB); height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
        </div>
        <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${count} (${percentage}%)</div>
      </div>
    `;
  }).join("");

  const scoreBarsHtml = `
    <div style="display: flex; align-items: center; margin-bottom: 7px;">
      <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569;">Top Match (90-100%)</div>
      <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #10B981, #059669); height: 100%; width: ${(scoreIntervals["90-100"] / totalFiltered) * 100}%; border-radius: 4px;"></div>
      </div>
      <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${scoreIntervals["90-100"]}</div>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 7px;">
      <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569;">Strong Fit (80-89%)</div>
      <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #34D399, #10B981); height: 100%; width: ${(scoreIntervals["80-89"] / totalFiltered) * 100}%; border-radius: 4px;"></div>
      </div>
      <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${scoreIntervals["80-89"]}</div>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 7px;">
      <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569;">Medium Fit (70-79%)</div>
      <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #3B82F6, #2563EB); height: 100%; width: ${(scoreIntervals["70-79"] / totalFiltered) * 100}%; border-radius: 4px;"></div>
      </div>
      <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${scoreIntervals["70-79"]}</div>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 7px;">
      <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569;">Low Fit (60-69%)</div>
      <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #6366F1, #4F46E5); height: 100%; width: ${(scoreIntervals["60-69"] / totalFiltered) * 100}%; border-radius: 4px;"></div>
      </div>
      <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${scoreIntervals["60-69"]}</div>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 7px;">
      <div style="width: 100px; font-size: 10px; font-weight: bold; color: #475569;">Unsuitable (&lt;60%)</div>
      <div style="flex-grow: 1; background-color: #F1F5F9; height: 10px; border-radius: 4px; margin: 0 10px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, #94A3B8, #64748B); height: 100%; width: ${(scoreIntervals["Below 60"] / totalFiltered) * 100}%; border-radius: 4px;"></div>
      </div>
      <div style="width: 45px; text-align: right; font-size: 9px; font-weight: bold; color: #475569; font-family: monospace;">${scoreIntervals["Below 60"]}</div>
    </div>
  `;

  const pages = [];

  // PAGE 1: COVER PAGE
  pages.push(`
    <div class="report-page" style="justify-content: space-between; padding: 80px 60px;">
      <div style="height: 10px; background: linear-gradient(90deg, #0F172A, #2563EB, #059669); width: 100%; border-radius: 4px;"></div>
      
      <div style="margin-top: 100px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #2563EB; font-weight: bold; font-family: monospace; display: block; margin-bottom: 10px;">REDROB ANALYTICAL CONSOLE</span>
        <h1 style="font-size: 34px; line-height: 1.1; font-weight: 800; color: #0F172A; margin: 0 0 15px 0; letter-spacing: -0.5px;">TALENT DISCOVERY &<br/>ALIGNMENT REPORT</h1>
        <div style="width: 80px; height: 4px; background-color: #2563EB; margin-bottom: 20px;"></div>
        <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6; max-width: 500px;">
          An automated candidate fit assessment and compliance audit report generated based on matching profiles against search criteria.
        </p>
      </div>

      <div style="margin: 40px 0;">
        <svg width="100%" height="80" viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="40" r="4" fill="#2563EB" opacity="0.3"/>
          <circle cx="60" cy="40" r="6" fill="#2563EB" opacity="0.5"/>
          <circle cx="100" cy="40" r="8" fill="#2563EB" opacity="0.7"/>
          <circle cx="140" cy="40" r="10" fill="#2563EB"/>
          <circle cx="180" cy="40" r="8" fill="#059669"/>
          <circle cx="220" cy="40" r="6" fill="#059669" opacity="0.7"/>
          <circle cx="260" cy="40" r="4" fill="#059669" opacity="0.5"/>
          <path d="M280 40H380" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="4 4"/>
        </svg>
      </div>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 25px; margin-top: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; padding: 4px 0; font-size: 11px; color: #64748B;">Prepared For:</td>
            <td style="width: 50%; padding: 4px 0; font-size: 11px; color: #64748B;">Evaluation Pipeline:</td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; font-size: 13px; font-weight: bold; color: #1E293B;">Talent Acquisition Team</td>
            <td style="padding-bottom: 12px; font-size: 13px; font-weight: bold; color: #1E293B;">Redrob Discover Matrix</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 11px; color: #64748B;">Date Generated:</td>
            <td style="padding: 4px 0; font-size: 11px; color: #64748B;">Active Search Filter:</td>
          </tr>
          <tr>
            <td style="font-size: 13px; font-weight: bold; color: #1E293B; font-family: monospace;">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            <td style="font-size: 13px; font-weight: bold; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${filtersText || "Unconstrained Pool"}</td>
          </tr>
        </table>
      </div>
    </div>
  `);

  // PAGE 2: EXECUTIVE SUMMARY & DASHBOARD
  pages.push(`
    <div class="report-page" data-page-num="2">
      <div class="page-header">
        <span class="page-header-title">Talent Discovery Report | Executive Summary & Analytics</span>
        <span class="page-header-confidential">CONFIDENTIAL</span>
      </div>

      <div style="flex-grow: 1;">
        <h2 class="section-title">Executive Summary</h2>
        
        <!-- KPI Row -->
        <div style="display: flex; gap: 12px; margin-bottom: 15px;">
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; text-align: center;">
            <div style="font-size: 9px; text-transform: uppercase; color: #64748B; font-weight: bold;">Ingested Candidates</div>
            <div style="font-size: 18px; font-weight: bold; color: #0F172A; font-family: monospace; margin-top: 4px;">${stats.total}</div>
          </div>
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; text-align: center;">
            <div style="font-size: 9px; text-transform: uppercase; color: #64748B; font-weight: bold;">Mean Fit Score</div>
            <div style="font-size: 18px; font-weight: bold; color: #059669; font-family: monospace; margin-top: 4px;">${stats.avgScore}%</div>
          </div>
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; text-align: center;">
            <div style="font-size: 9px; text-transform: uppercase; color: #64748B; font-weight: bold;">Notice &le; 30d</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563EB; font-family: monospace; margin-top: 4px;">${stats.availablePct}%</div>
          </div>
          <div style="flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 12px; text-align: center;">
            <div style="font-size: 9px; text-transform: uppercase; color: #64748B; font-weight: bold;">Anomalies Flagged</div>
            <div style="font-size: 18px; font-weight: bold; color: ${stats.anomalies > 0 ? "#D97706" : "#475569"}; font-family: monospace; margin-top: 4px;">${stats.anomalies}</div>
          </div>
        </div>

        <h2 class="section-title">Job Description Parameters</h2>
        <div class="jd-block" style="max-height: 80px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">${jobDescription ? jobDescription.trim() : "No parameters provided."}</div>

        <!-- Charts Grid (flex layout) -->
        <div style="display: flex; gap: 20px; margin-top: 15px;">
          <!-- Chart 1: Fit Score -->
          <div class="chart-container" style="flex: 1; height: 165px;">
            <div class="chart-title">Fit Score Distribution</div>
            ${scoreBarsHtml}
          </div>

          <!-- Chart 2: Top Skills -->
          <div class="chart-container" style="flex: 1; height: 165px;">
            <div class="chart-title">Shortlist Key Skills Coverage</div>
            ${skillBarsHtml || `<p style="font-size: 10px; color: #64748B; font-style: italic; margin-top: 10px;">No skill coverage data available.</p>`}
          </div>
        </div>
      </div>

      <div class="page-footer">
        <span class="page-footer-copy">© 2026 Redrob Inc. All Rights Reserved.</span>
        <span class="page-footer-num">Page 2 of [TotalPages]</span>
      </div>
    </div>
  `);

  // PAGE 3: TOP CANDIDATES SPOTLIGHT (Only if filtered list has entries)
  if (filtered.length > 0) {
    const item1 = filtered[0];
    const score1 = item1.result.score <= 1 ? item1.result.score * 100 : item1.result.score;
    const isAnomaly1 = detectTimelineAnomaly(item1.candidate);
    const skillsList1 = (item1.candidate?.skills || [])
      .slice(0, 8)
      .map(s => s.name)
      .join(", ");
    const salary1 = item1.candidate?.redrob_signals?.expected_salary_range_inr_lpa
      ? `${item1.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item1.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
      : "--";
    const notice1 = item1.candidate?.redrob_signals?.notice_period_days != null
      ? `${item1.candidate.redrob_signals.notice_period_days} days`
      : "--";
    const trace1 = isAnomaly1 
      ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
      : '<span style="color: #059669; font-weight: 500;">✓ Clean</span>';

    let card2Html = "";
    let card3Html = "";

    if (filtered.length > 1) {
      const item2 = filtered[1];
      const score2 = item2.result.score <= 1 ? item2.result.score * 100 : item2.result.score;
      const isAnomaly2 = detectTimelineAnomaly(item2.candidate);
      const skillsList2 = (item2.candidate?.skills || [])
        .slice(0, 5)
        .map(s => s.name)
        .join(", ");
      const salary2 = item2.candidate?.redrob_signals?.expected_salary_range_inr_lpa
        ? `${item2.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item2.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
        : "--";
      const notice2 = item2.candidate?.redrob_signals?.notice_period_days != null
        ? `${item2.candidate.redrob_signals.notice_period_days}d`
        : "--";
      const trace2 = isAnomaly2 
        ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
        : '<span style="color: #059669; font-weight: 500;">✓ Clean</span>';

      card2Html = `
        <div class="spotlight-card" style="margin-bottom: 0; padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background-color: #F8FAFC;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <span style="font-size: 8px; font-weight: bold; background-color: #475569; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">MATCH #2</span>
                <h3 style="margin: 2px 0 1px 0; color: #1E293B; font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${item2.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: top;">
                <div style="font-size: 15px; font-weight: bold; color: #059669; font-family: monospace;">${score2.toFixed(1)}%</div>
              </td>
            </tr>
          </table>
          
          <div style="font-size: 9px; color: #64748B; font-weight: 600; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item2.candidate?.profile?.headline || "N/A"}</div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9px; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
            <tr>
              <td style="padding: 1px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;"><strong>Role:</strong> ${item2.candidate?.profile?.current_title || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;"><strong>Company:</strong> ${item2.candidate?.profile?.current_company || "N/A"} (${item2.candidate?.profile?.years_of_experience || 0} yrs)</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569;"><strong>Notice/Sal:</strong> ${notice2} / ${salary2}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569;"><strong>Timeline:</strong> ${trace2}</td>
            </tr>
          </table>

          <div style="margin-top: 5px; font-size: 9px; color: #475569; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 5px; border-radius: 4px; font-family: monospace; line-height: 1.3; height: 32px; overflow: hidden;">
            <strong>Reason:</strong> ${item2.result.reasoning || "N/A"}
          </div>

          <div style="margin-top: 4px; font-size: 9px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <strong>Skills:</strong> <span style="color: #475569;">${skillsList2 || "None"}</span>
          </div>
        </div>
      `;
    }

    if (filtered.length > 2) {
      const item3 = filtered[2];
      const score3 = item3.result.score <= 1 ? item3.result.score * 100 : item3.result.score;
      const isAnomaly3 = detectTimelineAnomaly(item3.candidate);
      const skillsList3 = (item3.candidate?.skills || [])
        .slice(0, 5)
        .map(s => s.name)
        .join(", ");
      const salary3 = item3.candidate?.redrob_signals?.expected_salary_range_inr_lpa
        ? `${item3.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item3.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
        : "--";
      const notice3 = item3.candidate?.redrob_signals?.notice_period_days != null
        ? `${item3.candidate.redrob_signals.notice_period_days}d`
        : "--";
      const trace3 = isAnomaly3 
        ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
        : '<span style="color: #059669; font-weight: 500;">✓ Clean</span>';

      card3Html = `
        <div class="spotlight-card" style="margin-bottom: 0; padding: 12px; border: 1px solid #E2E8F0; border-radius: 6px; background-color: #F8FAFC;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <span style="font-size: 8px; font-weight: bold; background-color: #475569; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">MATCH #3</span>
                <h3 style="margin: 2px 0 1px 0; color: #1E293B; font-size: 12px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">${item3.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: top;">
                <div style="font-size: 15px; font-weight: bold; color: #059669; font-family: monospace;">${score3.toFixed(1)}%</div>
              </td>
            </tr>
          </table>
          
          <div style="font-size: 9px; color: #64748B; font-weight: 600; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item3.candidate?.profile?.headline || "N/A"}</div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9px; border-top: 1px dashed #E2E8F0; padding-top: 4px;">
            <tr>
              <td style="padding: 1px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;"><strong>Role:</strong> ${item3.candidate?.profile?.current_title || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;"><strong>Company:</strong> ${item3.candidate?.profile?.current_company || "N/A"} (${item3.candidate?.profile?.years_of_experience || 0} yrs)</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569;"><strong>Notice/Sal:</strong> ${notice3} / ${salary3}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #475569;"><strong>Timeline:</strong> ${trace3}</td>
            </tr>
          </table>

          <div style="margin-top: 5px; font-size: 9px; color: #475569; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 5px; border-radius: 4px; font-family: monospace; line-height: 1.3; height: 32px; overflow: hidden;">
            <strong>Reason:</strong> ${item3.result.reasoning || "N/A"}
          </div>

          <div style="margin-top: 4px; font-size: 9px; color: #334155; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <strong>Skills:</strong> <span style="color: #475569;">${skillsList3 || "None"}</span>
          </div>
        </div>
      `;
    }

    const row2Html = card2Html || card3Html ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed;">
        <tr>
          <td style="width: 49%; vertical-align: top; padding: 0;">
            ${card2Html || `<div class="spotlight-card" style="visibility: hidden;"></div>`}
          </td>
          <td style="width: 2%;"></td>
          <td style="width: 49%; vertical-align: top; padding: 0;">
            ${card3Html || `<div class="spotlight-card" style="visibility: hidden;"></div>`}
          </td>
        </tr>
      </table>
    ` : "";

    const spotlightsHtml = `
      <!-- TOP MATCH #1 -->
      <div class="spotlight-card" style="padding: 15px; border: 1px solid #E2E8F0; border-radius: 6px; background-color: #F8FAFC; margin-bottom: 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 80%; vertical-align: top;">
              <span style="font-size: 8px; font-weight: bold; background-color: #2563EB; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">TOP MATCH #1</span>
              <h3 style="margin: 3px 0 1px 0; color: #1E293B; font-size: 14px; font-weight: bold;">${item1.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              <p style="margin: 0; font-size: 10px; font-weight: 600; color: #64748B;">${item1.candidate?.profile?.headline || "N/A"}</p>
            </td>
            <td style="width: 20%; text-align: right; vertical-align: top;">
              <div style="font-size: 8px; text-transform: uppercase; color: #64748B; font-weight: bold; font-family: monospace;">Fit Score</div>
              <div style="font-size: 20px; font-weight: bold; color: #059669; font-family: monospace; line-height: 1;">${score1.toFixed(1)}%</div>
            </td>
          </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; border-top: 1px dashed #E2E8F0; padding-top: 6px;">
          <tr>
            <td style="width: 33%; padding: 2px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;"><strong>Role:</strong> <span style="color: #1E293B;">${item1.candidate?.profile?.current_title || "N/A"}</span></td>
            <td style="width: 33%; padding: 2px 0; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;"><strong>Company:</strong> <span style="color: #1E293B;">${item1.candidate?.profile?.current_company || "N/A"}</span></td>
            <td style="width: 34%; padding: 2px 0; color: #475569;"><strong>Experience:</strong> <span style="color: #1E293B;">${item1.candidate?.profile?.years_of_experience || 0} Years</span></td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #475569;"><strong>Notice:</strong> <span style="color: #1E293B;">${notice1}</span></td>
            <td style="padding: 2px 0; color: #475569;"><strong>Expected Salary:</strong> <span style="color: #1E293B;">${salary1}</span></td>
            <td style="padding: 2px 0; color: #475569;"><strong>Timeline Trace:</strong> ${trace1}</td>
          </tr>
        </table>

        <div style="margin-top: 6px; font-size: 9.5px; color: #475569; background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: 6px; border-radius: 4px; font-family: monospace; line-height: 1.4;">
          <strong>Fit Synthesizer Reason:</strong> ${item1.result.reasoning || "No reasoning generated."}
        </div>

        <div style="margin-top: 4px; font-size: 9.5px; color: #334155;">
          <strong>Skills:</strong> <span style="color: #475569;">${skillsList1 || "None"}</span>
        </div>
      </div>

      <!-- MATCH #2 & #3 SIDE-BY-SIDE -->
      ${row2Html}
    `;

    pages.push(`
      <div class="report-page" data-page-num="3">
        <div class="page-header">
          <span class="page-header-title">Talent Discovery Report | Top Matches Spotlight</span>
          <span class="page-header-confidential">CONFIDENTIAL</span>
        </div>

        <div style="flex-grow: 1;">
          <h2 class="section-title">Top Matches Spotlight</h2>
          ${spotlightsHtml}
        </div>

        <div class="page-footer">
          <span class="page-footer-copy">© 2026 Redrob Inc. All Rights Reserved.</span>
          <span class="page-footer-num">Page 3 of [TotalPages]</span>
        </div>
      </div>
    `);
  }

  // PAGES 4+: LEDGER TABLE (Chunked by 10 candidates to give plenty of vertical breathing room)
  const rowsPerPage = 10;
  const totalLedgerPages = Math.ceil(filtered.length / rowsPerPage);

  for (let pageIdx = 0; pageIdx < totalLedgerPages; pageIdx++) {
    const start = pageIdx * rowsPerPage;
    const end = Math.min(start + rowsPerPage, filtered.length);
    const chunk = filtered.slice(start, end);

    const rowsHtml = chunk.map((item) => {
      const score = item.result.score <= 1 ? item.result.score * 100 : item.result.score;
      const isAnomaly = detectTimelineAnomaly(item.candidate);
      const skills = (item.candidate?.skills || [])
        .slice(0, 6)
        .map((s) => s.name)
        .join(", ");

      return `
        <tr>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; text-align: center; font-weight: bold; font-family: monospace;">#${item.result.rank}</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; font-family: monospace; font-size: 9px; color: #475569; white-space: nowrap;">${item.result.candidate_id}</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; font-weight: bold; color: #1E293B;">${item.candidate?.profile?.anonymized_name || "Unknown"}</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0;">
            <div style="font-weight: 600; color: #1E293B;">${item.candidate?.profile?.current_title || "N/A"}</div>
            <div style="font-size: 9px; color: #64748B; margin-top: 2px;">${item.candidate?.profile?.current_company || "N/A"}</div>
          </td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; text-align: center; white-space: nowrap;">${item.candidate?.profile?.years_of_experience || 0} yrs</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; text-align: center; font-weight: bold; color: #059669; font-family: monospace; white-space: nowrap;">${score.toFixed(1)}%</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; text-align: center; white-space: nowrap;">${item.candidate?.redrob_signals?.notice_period_days ?? "--"} d</td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; text-align: center; white-space: nowrap;">
            ${isAnomaly 
              ? '<span style="color: #D97706; font-weight: bold; font-size: 9px;">⚠️ FLAG</span>' 
              : '<span style="color: #059669; font-size: 9px; font-weight: 500;">✓ OK</span>'}
          </td>
          <td style="padding: 10px 12px; border: 1px solid #E2E8F0; font-size: 9px; color: #475569; line-height: 1.3;">${skills || "--"}</td>
        </tr>
      `;
    }).join("");

    const pageNumber = 1 + 1 + (filtered.length > 0 ? 1 : 0) + 1 + pageIdx;

    pages.push(`
      <div class="report-page" data-page-num="${pageNumber}">
        <div class="page-header">
          <span class="page-header-title">Talent Discovery Report | Candidate Ledger</span>
          <span class="page-header-confidential">CONFIDENTIAL</span>
        </div>

        <div style="flex-grow: 1;">
          <h2 class="section-title">Full Shortlist Ledger (Page ${pageIdx + 1} of ${totalLedgerPages})</h2>
          
          <table class="ledger-table" style="width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed;">
            <thead>
              <tr style="background-color: #0F172A; color: white;">
                <th style="width: 5%; text-align: center; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Rank</th>
                <th style="width: 12%; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Candidate ID</th>
                <th style="width: 15%; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Name</th>
                <th style="width: 22%; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Role / Company</th>
                <th style="width: 7%; text-align: center; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Exp</th>
                <th style="width: 8%; text-align: center; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Fit Index</th>
                <th style="width: 8%; text-align: center; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Notice</th>
                <th style="width: 8%; text-align: center; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Trace</th>
                <th style="width: 15%; padding: 10px 12px; font-weight: bold; border: 1px solid #0F172A;">Key Skills</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <div class="page-footer">
          <span class="page-footer-copy">© 2026 Redrob Inc. All Rights Reserved.</span>
          <span class="page-footer-num">Page ${pageNumber} of [TotalPages]</span>
        </div>
      </div>
    `);
  }

  // Handle empty state gracefully
  if (filtered.length === 0) {
    pages.push(`
      <div class="report-page" data-page-num="3">
        <div class="page-header">
          <span class="page-header-title">Talent Discovery Report | Candidate Ledger</span>
          <span class="page-header-confidential">CONFIDENTIAL</span>
        </div>

        <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 100px 0;">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" style="margin: 0 auto 15px auto;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style="font-size: 15px; font-weight: bold; color: #1E293B;">No Matching Candidates Found</h3>
          <p style="font-size: 11px; color: #64748B; max-width: 320px; margin: 8px auto 0 auto; line-height: 1.4;">No candidates matched the current search filters and parameters. Please expand your parameters to populate the talent matrix.</p>
        </div>

        <div class="page-footer">
          <span class="page-footer-copy">© 2026 Redrob Inc. All Rights Reserved.</span>
          <span class="page-footer-num">Page 3 of 3</span>
        </div>
      </div>
    `);
  }

  const totalPages = pages.length;
  return pages.map((page) => page.replace(/\[TotalPages\]/g, totalPages.toString()));
};

/**
 * Generates Microsoft Word (.doc) friendly HTML structure containing single continuous layouts.
 */
export const generateWordHtml = (filtered, jobDescription, stats, query, sortBy, filtersText) => {
  const scoreIntervals = { "90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "Below 60": 0 };
  filtered.forEach((item) => {
    const s = item.result.score <= 1 ? item.result.score * 100 : item.result.score;
    if (s >= 90) scoreIntervals["90-100"]++;
    else if (s >= 80) scoreIntervals["80-89"]++;
    else if (s >= 70) scoreIntervals["70-79"]++;
    else if (s >= 60) scoreIntervals["60-69"]++;
    else scoreIntervals["Below 60"]++;
  });
  const totalFiltered = filtered.length || 1;

  const topSkills = getTopSkills(filtered);
  const skillBarsHtml = topSkills.map(([skillName, count]) => {
    const percentage = Math.round((count / totalFiltered) * 100);
    return `
      <tr>
        <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">${skillName}</td>
        <td style="width: 240px; padding: 4px 0;">
          <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
            <div style="background-color: #3B82F6; height: 10px; width: ${percentage}%; border-radius: 3px;"></div>
          </div>
        </td>
        <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${count} (${percentage}%)</td>
      </tr>
    `;
  }).join("");

  const scoreBarsHtml = `
    <tr>
      <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">Top Match (90-100%)</td>
      <td style="width: 240px; padding: 4px 0;">
        <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
          <div style="background-color: #059669; height: 10px; width: ${(scoreIntervals["90-100"] / totalFiltered) * 100}%; border-radius: 3px;"></div>
        </div>
      </td>
      <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${scoreIntervals["90-100"]}</td>
    </tr>
    <tr>
      <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">Strong Fit (80-89%)</td>
      <td style="width: 240px; padding: 4px 0;">
        <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
          <div style="background-color: #10B981; height: 10px; width: ${(scoreIntervals["80-89"] / totalFiltered) * 100}%; border-radius: 3px;"></div>
        </div>
      </td>
      <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${scoreIntervals["80-89"]}</td>
    </tr>
    <tr>
      <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">Medium Fit (70-79%)</td>
      <td style="width: 240px; padding: 4px 0;">
        <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
          <div style="background-color: #3B82F6; height: 10px; width: ${(scoreIntervals["70-79"] / totalFiltered) * 100}%; border-radius: 3px;"></div>
        </div>
      </td>
      <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${scoreIntervals["70-79"]}</td>
    </tr>
    <tr>
      <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">Low Fit (60-69%)</td>
      <td style="width: 240px; padding: 4px 0;">
        <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
          <div style="background-color: #6366F1; height: 10px; width: ${(scoreIntervals["60-69"] / totalFiltered) * 100}%; border-radius: 3px;"></div>
        </div>
      </td>
      <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${scoreIntervals["60-69"]}</td>
    </tr>
    <tr>
      <td style="width: 140px; font-size: 11px; padding: 4px 0; font-weight: bold; color: #475569;">Unsuitable (&lt;60%)</td>
      <td style="width: 240px; padding: 4px 0;">
        <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; height: 12px; width: 100%; border-radius: 4px;">
          <div style="background-color: #94A3B8; height: 10px; width: ${(scoreIntervals["Below 60"] / totalFiltered) * 100}%; border-radius: 3px;"></div>
        </div>
      </td>
      <td style="width: 60px; text-align: right; font-size: 11px; font-family: monospace; font-weight: bold; color: #475569; padding: 4px 0;">${scoreIntervals["Below 60"]}</td>
    </tr>
  `;

  const tableRowsHtml = filtered.map((item) => {
    const score = item.result.score <= 1 ? item.result.score * 100 : item.result.score;
    const isAnomaly = detectTimelineAnomaly(item.candidate);
    const skills = (item.candidate?.skills || [])
      .slice(0, 6)
      .map((s) => s.name)
      .join(", ");

    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #CCCCCC; text-align: center; font-weight: bold; font-family: monospace;">#${item.result.rank}</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; font-family: monospace; font-size: 10px; color: #555555; white-space: nowrap;">${item.result.candidate_id}</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; font-weight: bold; color: #111111;">${item.candidate?.profile?.anonymized_name || "Unknown"}</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC;">
          <div style="font-weight: bold; color: #111111;">${item.candidate?.profile?.current_title || "N/A"}</div>
          <div style="font-size: 10px; color: #666666; margin-top: 2px;">${item.candidate?.profile?.current_company || "N/A"} · ${item.candidate?.profile?.location || "N/A"}</div>
        </td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; text-align: center; white-space: nowrap;">${item.candidate?.profile?.years_of_experience || 0} yrs</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; text-align: center; font-weight: bold; color: #008000; font-family: monospace; white-space: nowrap;">${score.toFixed(1)}%</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; text-align: center; white-space: nowrap;">${item.candidate?.redrob_signals?.notice_period_days ?? "--"} days</td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; text-align: center; white-space: nowrap;">
          ${isAnomaly 
            ? '<span style="color: #D97706; font-weight: bold; font-size: 10px;">⚠️ FLAG</span>' 
            : '<span style="color: #008000; font-size: 10px; font-weight: bold;">✓ OK</span>'}
        </td>
        <td style="padding: 8px; border: 1px solid #CCCCCC; font-size: 10px; color: #555555; line-height: 1.3;">${skills || "--"}</td>
      </tr>
    `;
  }).join("");

  let spotlightCardsHtml = "";
  if (filtered.length > 0) {
    const item1 = filtered[0];
    const score1 = item1.result.score <= 1 ? item1.result.score * 100 : item1.result.score;
    const isAnomaly1 = detectTimelineAnomaly(item1.candidate);
    const skillsList1 = (item1.candidate?.skills || [])
      .slice(0, 8)
      .map(s => s.name)
      .join(", ");
    const salary1 = item1.candidate?.redrob_signals?.expected_salary_range_inr_lpa
      ? `${item1.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item1.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
      : "--";
    const notice1 = item1.candidate?.redrob_signals?.notice_period_days != null
      ? `${item1.candidate.redrob_signals.notice_period_days} days`
      : "--";
    const trace1 = isAnomaly1 
      ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
      : '<span style="color: #008000; font-weight: bold;">✓ Clean</span>';

    let card2Html = "";
    let card3Html = "";

    if (filtered.length > 1) {
      const item2 = filtered[1];
      const score2 = item2.result.score <= 1 ? item2.result.score * 100 : item2.result.score;
      const isAnomaly2 = detectTimelineAnomaly(item2.candidate);
      const skillsList2 = (item2.candidate?.skills || [])
        .slice(0, 5)
        .map(s => s.name)
        .join(", ");
      const salary2 = item2.candidate?.redrob_signals?.expected_salary_range_inr_lpa
        ? `${item2.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item2.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
        : "--";
      const notice2 = item2.candidate?.redrob_signals?.notice_period_days != null
        ? `${item2.candidate.redrob_signals.notice_period_days}d`
        : "--";
      const trace2 = isAnomaly2 
        ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
        : '<span style="color: #008000; font-weight: bold;">✓ Clean</span>';

      card2Html = `
        <div class="spotlight-card" style="margin-bottom: 0; padding: 12px; border: 1px solid #CCCCCC; background-color: #F8FAFC;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <span style="font-size: 8px; font-weight: bold; background-color: #555555; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">MATCH #2</span>
                <h3 style="margin: 2px 0 1px 0; color: #1E293B; font-size: 12px; font-weight: bold;">${item2.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: top;">
                <div style="font-size: 15px; font-weight: bold; color: #059669; font-family: monospace;">${score2.toFixed(1)}%</div>
              </td>
            </tr>
          </table>
          <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #64748B; font-weight: bold;">${item2.candidate?.profile?.headline || "N/A"}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9.5px; border-top: 1px dashed #CCCCCC; padding-top: 4px;">
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Role:</strong> ${item2.candidate?.profile?.current_title || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Company:</strong> ${item2.candidate?.profile?.current_company || "N/A"} (${item2.candidate?.profile?.years_of_experience || 0} yrs)</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Notice/Sal:</strong> ${notice2} / ${salary2}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Timeline:</strong> ${trace2}</td>
            </tr>
          </table>

          <div style="margin-top: 5px; font-size: 9px; color: #555555; background-color: #FFFFFF; border: 1px solid #CCCCCC; padding: 5px; border-radius: 4px; font-family: monospace; line-height: 1.3; height: 32px; overflow: hidden;">
            <strong>Reason:</strong> ${item2.result.reasoning || "N/A"}
          </div>

          <div style="margin-top: 4px; font-size: 9px; color: #333333;">
            <strong>Skills:</strong> <span style="color: #555555;">${skillsList2 || "None"}</span>
          </div>
        </div>
      `;
    }

    if (filtered.length > 2) {
      const item3 = filtered[2];
      const score3 = item3.result.score <= 1 ? item3.result.score * 100 : item3.result.score;
      const isAnomaly3 = detectTimelineAnomaly(item3.candidate);
      const skillsList3 = (item3.candidate?.skills || [])
        .slice(0, 5)
        .map(s => s.name)
        .join(", ");
      const salary3 = item3.candidate?.redrob_signals?.expected_salary_range_inr_lpa
        ? `${item3.candidate.redrob_signals.expected_salary_range_inr_lpa.min}-${item3.candidate.redrob_signals.expected_salary_range_inr_lpa.max} LPA`
        : "--";
      const notice3 = item3.candidate?.redrob_signals?.notice_period_days != null
        ? `${item3.candidate.redrob_signals.notice_period_days}d`
        : "--";
      const trace3 = isAnomaly3 
        ? '<span style="color: #D97706; font-weight: bold;">⚠️ Anomaly</span>' 
        : '<span style="color: #008000; font-weight: bold;">✓ Clean</span>';

      card3Html = `
        <div class="spotlight-card" style="margin-bottom: 0; padding: 12px; border: 1px solid #CCCCCC; background-color: #F8FAFC;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 70%; vertical-align: top;">
                <span style="font-size: 8px; font-weight: bold; background-color: #555555; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">MATCH #3</span>
                <h3 style="margin: 2px 0 1px 0; color: #1E293B; font-size: 12px; font-weight: bold;">${item3.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              </td>
              <td style="width: 30%; text-align: right; vertical-align: top;">
                <div style="font-size: 15px; font-weight: bold; color: #059669; font-family: monospace;">${score3.toFixed(1)}%</div>
              </td>
            </tr>
          </table>
          <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #64748B; font-weight: bold;">${item3.candidate?.profile?.headline || "N/A"}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9.5px; border-top: 1px dashed #CCCCCC; padding-top: 4px;">
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Role:</strong> ${item3.candidate?.profile?.current_title || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Company:</strong> ${item3.candidate?.profile?.current_company || "N/A"} (${item3.candidate?.profile?.years_of_experience || 0} yrs)</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Notice/Sal:</strong> ${notice3} / ${salary3}</td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555555;"><strong>Timeline:</strong> ${trace3}</td>
            </tr>
          </table>

          <div style="margin-top: 5px; font-size: 9px; color: #555555; background-color: #FFFFFF; border: 1px solid #CCCCCC; padding: 5px; border-radius: 4px; font-family: monospace; line-height: 1.3; height: 32px; overflow: hidden;">
            <strong>Reason:</strong> ${item3.result.reasoning || "N/A"}
          </div>

          <div style="margin-top: 4px; font-size: 9px; color: #333333;">
            <strong>Skills:</strong> <span style="color: #555555;">${skillsList3 || "None"}</span>
          </div>
        </div>
      `;
    }

    const row2Html = card2Html || card3Html ? `
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px; table-layout: fixed;">
        <tr>
          <td style="width: 49%; vertical-align: top; padding: 0;">
            ${card2Html || `<div class="spotlight-card" style="visibility: hidden;"></div>`}
          </td>
          <td style="width: 2%;"></td>
          <td style="width: 49%; vertical-align: top; padding: 0;">
            ${card3Html || `<div class="spotlight-card" style="visibility: hidden;"></div>`}
          </td>
        </tr>
      </table>
    ` : "";

    spotlightCardsHtml = `
      <!-- TOP MATCH #1 -->
      <div class="spotlight-card" style="padding: 15px; border: 1px solid #CCCCCC; border-radius: 6px; background-color: #F8FAFC; margin-bottom: 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 80%; vertical-align: top;">
              <span style="font-size: 8px; font-weight: bold; background-color: #2563EB; color: white; padding: 1px 5px; border-radius: 2px; font-family: monospace;">TOP MATCH #1</span>
              <h3 style="margin: 3px 0 1px 0; color: #1E293B; font-size: 14px; font-weight: bold;">${item1.candidate?.profile?.anonymized_name || "Unknown"}</h3>
              <p style="margin: 0; font-size: 10px; font-weight: 600; color: #64748B;">${item1.candidate?.profile?.headline || "N/A"}</p>
            </td>
            <td style="width: 20%; text-align: right; vertical-align: top;">
              <div style="font-size: 8px; text-transform: uppercase; color: #64748B; font-weight: bold; font-family: monospace;">Fit Score</div>
              <div style="font-size: 20px; font-weight: bold; color: #059669; font-family: monospace; line-height: 1;">${score1.toFixed(1)}%</div>
            </td>
          </tr>
        </table>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; border-top: 1px dashed #CCCCCC; padding-top: 6px;">
          <tr>
            <td style="width: 33%; padding: 2px 0; color: #555555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;"><strong>Role:</strong> <span style="color: #111111;">${item1.candidate?.profile?.current_title || "N/A"}</span></td>
            <td style="width: 33%; padding: 2px 0; color: #555555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;"><strong>Company:</strong> <span style="color: #111111;">${item1.candidate?.profile?.current_company || "N/A"}</span></td>
            <td style="width: 34%; padding: 2px 0; color: #555555;"><strong>Experience:</strong> <span style="color: #111111;">${item1.candidate?.profile?.years_of_experience || 0} Years</span></td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #555555;"><strong>Notice:</strong> <span style="color: #111111;">${notice1}</span></td>
            <td style="padding: 2px 0; color: #555555;"><strong>Expected Salary:</strong> <span style="color: #111111;">${salary1}</span></td>
            <td style="padding: 2px 0; color: #555555;"><strong>Timeline Trace:</strong> ${trace1}</td>
          </tr>
        </table>

        <div style="margin-top: 6px; font-size: 9.5px; color: #555555; background-color: #FFFFFF; border: 1px solid #CCCCCC; padding: 6px; border-radius: 4px; font-family: monospace; line-height: 1.4;">
          <strong>Fit Synthesizer Reason:</strong> ${item1.result.reasoning || "No reasoning generated."}
        </div>

        <div style="margin-top: 4px; font-size: 9.5px; color: #333333;">
          <strong>Skills:</strong> <span style="color: #555555;">${skillsList1 || "None"}</span>
        </div>
      </div>

      <!-- MATCH #2 & #3 SIDE-BY-SIDE -->
      ${row2Html}
    `;
  }

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Redrob Candidate Discovery & Fit Assessment Report</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333333;
          background-color: #FFFFFF;
        }
        h1 { font-size: 26px; color: #0F172A; margin-bottom: 5px; font-weight: bold; }
        h2 { font-size: 16px; color: #0F172A; margin-top: 25px; margin-bottom: 12px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
        h3 { font-size: 13px; color: #0F172A; margin: 0; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 6px; font-size: 12px; }
        .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .kpi-card-td { width: 25%; padding: 6px; }
        .kpi-card { background-color: #F8FAFC; border: 1px solid #CCCCCC; border-radius: 6px; padding: 12px; text-align: center; }
        .kpi-val { font-size: 20px; font-weight: bold; color: #0F172A; font-family: monospace; margin-top: 4px; }
        .chart-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .chart-table td { vertical-align: middle; }
        .spotlight-card {
          border: 1px solid #CCCCCC;
          border-radius: 6px;
          background-color: #F8FAFC;
        }
      </style>
    </head>
    <body style="padding: 40px;">
      
      <!-- COVER PAGE -->
      <div style="text-align: left; padding-top: 50px; height: 100%; justify-content: space-between; display: flex; flex-direction: column;">
        <div>
          <div style="height: 6px; background-color: #2563EB; width: 100%; margin-bottom: 40px;"></div>
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #2563EB; font-weight: bold; font-family: monospace;">REDROB ANALYTICAL CONSOLE</span>
          <h1 style="font-size: 32px; font-weight: bold; color: #0F172A; margin-top: 10px; margin-bottom: 15px;">TALENT DISCOVERY &<br/>ALIGNMENT REPORT</h1>
          <p style="font-size: 14px; color: #555555; max-width: 500px; line-height: 1.6;">
            An automated candidate discover shortlist derived from multi-dimensional profile screening and alignment checks.
          </p>
        </div>
        
        <div style="margin-top: 150px; background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 11px; color: #666666; padding: 4px 0;">Prepared For:</td>
              <td style="font-size: 11px; color: #666666; padding: 4px 0;">Evaluation Pipeline:</td>
            </tr>
            <tr>
              <td style="font-size: 13px; font-weight: bold; color: #111111; padding-bottom: 10px;">Talent Acquisition Team</td>
              <td style="font-size: 13px; font-weight: bold; color: #111111; padding-bottom: 10px;">Multi-Signal Discovery Matrix</td>
            </tr>
            <tr>
              <td style="font-size: 11px; color: #666666; padding: 4px 0;">Date Generated:</td>
              <td style="font-size: 11px; color: #666666; padding: 4px 0;">Active Constraints:</td>
            </tr>
            <tr>
              <td style="font-size: 13px; font-weight: bold; color: #111111;">${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              <td style="font-size: 13px; font-weight: bold; color: #111111;">${filtersText || "Unconstrained Pool"}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div style="page-break-before: always; clear: both;"></div>

      <!-- EXECUTIVE DASHBOARD -->
      <h2>Executive Matrix Summary</h2>
      <table class="kpi-table">
        <tr>
          <td class="kpi-card-td">
            <div class="kpi-card">
              <div style="font-size: 9px; text-transform: uppercase; color: #666666; font-weight: bold;">Ingested Candidates</div>
              <div class="kpi-val">${stats.total}</div>
            </div>
          </td>
          <td class="kpi-card-td">
            <div class="kpi-card">
              <div style="font-size: 9px; text-transform: uppercase; color: #666666; font-weight: bold;">Mean Fit Score</div>
              <div class="kpi-val" style="color: #059669;">${stats.avgScore}%</div>
            </div>
          </td>
          <td class="kpi-card-td">
            <div class="kpi-card">
              <div style="font-size: 9px; text-transform: uppercase; color: #666666; font-weight: bold;">Notice &le; 30 Days</div>
              <div class="kpi-val" style="color: #3B82F6;">${stats.availablePct}%</div>
            </div>
          </td>
          <td class="kpi-card-td">
            <div class="kpi-card">
              <div style="font-size: 9px; text-transform: uppercase; color: #666666; font-weight: bold;">Anomalies Flagged</div>
              <div class="kpi-val" style="color: ${stats.anomalies > 0 ? "#D97706" : "#475569"};">${stats.anomalies}</div>
            </div>
          </td>
        </tr>
      </table>

      <h2>Job Description Parameters</h2>
      <div style="background-color: #F8FAFC; border-left: 4px solid #3B82F6; padding: 12px; font-family: monospace; font-size: 11px; white-space: pre-wrap; line-height: 1.5; color: #555555; margin-bottom: 25px;">
        ${jobDescription || "No job description parameters defined."}
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 48%; vertical-align: top; padding-right: 15px;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #CCCCCC; padding-bottom: 4px; margin-bottom: 10px;">Fit Score Distribution</h3>
            <table class="chart-table">
              ${scoreBarsHtml}
            </table>
          </td>
          <td style="width: 4%; border-left: 1px solid #E2E8F0;"></td>
          <td style="width: 48%; vertical-align: top; padding-left: 15px;">
            <h3 style="font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #CCCCCC; padding-bottom: 4px; margin-bottom: 10px;">Key Skills Coverage</h3>
            <table class="chart-table">
              ${skillBarsHtml || "<tr><td colspan='3' style='font-size:11px; color:#999; font-style:italic;'>No skills data</td></tr>"}
            </table>
          </td>
        </tr>
      </table>

      <div style="page-break-before: always; clear: both;"></div>

      <!-- SPOTLIGHT MATCHES -->
      <h2>Top Matches Spotlight</h2>
      ${spotlightCardsHtml || "<p style='color: #666; font-style: italic;'>No candidates match the parameters.</p>"}

      <div style="page-break-before: always; clear: both;"></div>

      <!-- CANDIDATE LEDGER -->
      <h2>Full Candidate Ledger</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 10px;">
        <thead>
          <tr style="background-color: #0F172A; color: white;">
            <th style="padding: 8px; border: 1px solid #0F172A; text-align: center; width: 5%; font-weight: bold;">Rank</th>
            <th style="padding: 8px; border: 1px solid #0F172A; width: 12%; font-weight: bold;">Candidate ID</th>
            <th style="padding: 8px; border: 1px solid #0F172A; width: 15%; font-weight: bold;">Name</th>
            <th style="padding: 8px; border: 1px solid #0F172A; width: 22%; font-weight: bold;">Role / Company</th>
            <th style="padding: 8px; border: 1px solid #0F172A; text-align: center; width: 7%; font-weight: bold;">Exp</th>
            <th style="padding: 8px; border: 1px solid #0F172A; text-align: center; width: 8%; font-weight: bold;">Fit Index</th>
            <th style="padding: 8px; border: 1px solid #0F172A; text-align: center; width: 8%; font-weight: bold;">Notice</th>
            <th style="padding: 8px; border: 1px solid #0F172A; text-align: center; width: 8%; font-weight: bold;">Timeline</th>
            <th style="padding: 8px; border: 1px solid #0F172A; width: 15%; font-weight: bold;">Key Skills</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml || "<tr><td colspan='9' style='text-align:center; padding:15px;'>No candidates found.</td></tr>"}
        </tbody>
      </table>

    </body>
    </html>
  `;
};

/**
 * Downloads a pre-formatted HTML document with application/msword type,
 * which MS Word natively parses as a formatted page-layout document.
 */
export const exportWordReport = (filtered, jobDescription, stats, query, sortBy, filtersText) => {
  const htmlContent = generateWordHtml(filtered, jobDescription, stats, query, sortBy, filtersText);
  const blob = new Blob([htmlContent], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Talent_Discovery_Report_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Renders the report layout into separate hidden HTML A4 containers, compiles them
 * into canvases via html2canvas, and adds them into an A4 PDF document sequentially.
 */
export const exportPdfReport = async (filtered, jobDescription, stats, query, sortBy, filtersText) => {
  const pageHtmls = generateHtmlPages(filtered, jobDescription, stats, query, sortBy, filtersText);
  
  const container = document.createElement("div");
  container.id = "report-temp-container";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";

  // Create style element for html2canvas to interpret styles correctly
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .report-page {
      width: 794px;
      height: 1123px;
      box-sizing: border-box;
      padding: 50px 60px;
      position: relative;
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #334155;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-bottom: 20px;
      width: 100%;
    }
    .page-header-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748B;
      font-family: monospace;
    }
    .page-header-confidential {
      font-size: 10px;
      color: #E11D48;
      font-weight: bold;
      font-family: monospace;
      letter-spacing: 1px;
    }
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 8px;
      margin-top: auto;
      width: 100%;
    }
    .page-footer-copy {
      font-size: 9px;
      color: #94A3B8;
    }
    .page-footer-num {
      font-size: 9px;
      color: #94A3B8;
      font-family: monospace;
    }
    .section-title {
      font-size: 12px;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 10px;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: bold;
    }
    .chart-container {
      background-color: #ffffff;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 12px;
      box-sizing: border-box;
    }
    .chart-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .jd-block {
      background-color: #F8FAFC;
      border-left: 4px solid #2563EB;
      padding: 10px;
      margin-bottom: 15px;
      font-family: monospace;
      font-size: 10px;
      white-space: pre-wrap;
      line-height: 1.4;
      color: #475569;
    }
    .spotlight-card {
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      background-color: #F8FAFC;
    }
    .ledger-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    .ledger-table th {
      background-color: #0F172A;
      color: #ffffff;
      font-weight: bold;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid #0F172A;
    }
    .ledger-table td {
      padding: 10px 12px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
      line-height: 1.4;
    }
  `;
  container.appendChild(styleEl);

  // Append page HTML elements into off-screen container
  pageHtmls.forEach((html) => {
    const pageDiv = document.createElement("div");
    pageDiv.innerHTML = html;
    container.appendChild(pageDiv.firstElementChild);
  });

  document.body.appendChild(container);

  try {
    const { jsPDF } = window.jspdf;
    
    // A4 Dimensions: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pageElements = container.querySelectorAll(".report-page");

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await window.html2canvas(pageElements[i], {
        scale: 2, // High resolution rendering scale
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }

    pdf.save(`Talent_Discovery_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("Unable to construct PDF report.");
  } finally {
    document.body.removeChild(container);
  }
};
