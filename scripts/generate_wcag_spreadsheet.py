import json
import os
import re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Paths
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVOLUTION_JSON = os.path.join(ROOT_DIR, "public", "data", "wcag-evolution-matrix.json")
CATALOG_JSON = os.path.join(ROOT_DIR, "public", "data", "wcag3-catalog.json")
OUTPUT_XLSX = os.path.join(ROOT_DIR, "WCAG_Old_vs_New_and_WCAG3_Explorer.xlsx")

GROUP_NAMES = {
    'animation-and-movement': 'Animation & Movement',
    'consistency-across-views': 'Consistency Across Views',
    'error-handling': 'Error Handling',
    'help-and-feedback': 'Help & Feedback',
    'images-and-media': 'Images & Media',
    'input-operation': 'Input & Operation',
    'interactive-components': 'Interactive Components',
    'layout': 'Layout & Structure',
    'policy-and-protection': 'Policy & Protection',
    'process-and-task-completion': 'Process & Task Completion',
    'text-and-wording': 'Text & Wording',
    'user-control': 'User Control & Settings'
}

def clean_html_to_text(html_list):
    if not html_list:
        return ""
    combined = " ".join(html_list)
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", " ", combined)
    # Collapse multiple whitespace
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.split("\n")]
    clean_lines = [l for l in lines if l]
    return "; ".join(clean_lines)

def provision_type_label(t):
    if not t:
        return "Requirement"
    t_lower = t.lower()
    if t_lower == "foundational":
        return "Core requirement"
    if t_lower == "supplemental":
        return "Supplemental requirement"
    if t_lower == "assertion":
        return "Assertion"
    if t_lower == "recommended practice":
        return "Recommended practice"
    return t.capitalize()

def main():
    print(f"Loading data from {ROOT_DIR}...")
    with open(EVOLUTION_JSON, "r", encoding="utf-8") as f:
        matrix = json.load(f)
    with open(CATALOG_JSON, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    wb = Workbook()

    # Style definitions
    font_name = "Segoe UI"
    header_font = Font(name=font_name, size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Dark slate
    header_fill_accent = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")

    row_even_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
    row_odd_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid") # Very soft slate/white zebra

    border_thin = Border(
        left=Side(style="thin", color="E2E8F0"),
        right=Side(style="thin", color="E2E8F0"),
        top=Side(style="thin", color="E2E8F0"),
        bottom=Side(style="thin", color="E2E8F0")
    )
    header_border = Border(
        left=Side(style="thin", color="334155"),
        right=Side(style="thin", color="334155"),
        top=Side(style="medium", color="0F172A"),
        bottom=Side(style="medium", color="0F172A")
    )

    align_center = Alignment(horizontal="center", vertical="top", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="top", wrap_text=True)
    align_header_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_header_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

    # ----------------------------------------------------
    # TAB 1: Old vs New (WCAG 2.2 vs 3.0 Evolution Matrix)
    # ----------------------------------------------------
    ws1 = wb.active
    ws1.title = "Old vs New (2.2 vs 3.0)"
    ws1.views.sheetView[0].showGridLines = True

    headers_tab1 = [
        ("WCAG 2.2 SC #", 14, align_center),
        ("WCAG 2.2 SC Title", 26, align_left),
        ("Level", 10, align_center),
        ("Principle", 16, align_center),
        ("Mapping Status", 22, align_center),
        ("Successor Count", 15, align_center),
        ("Successor Provisions (Title & Type)", 36, align_left),
        ("Successor Normative Draft Text", 55, align_left),
        ("Mapping Analysis & Notes", 42, align_left),
        ("Related Provisions (Non-Successors)", 35, align_left),
        ("WCAG 2.2 Floor (Bare Minimum)", 45, align_left),
        ("WCAG 2.2 Usability Gap", 45, align_left),
        ("WCAG 2.2 Understanding URL", 32, align_left),
        ("WCAG 2.2 Spec URL", 30, align_left),
        ("Plain English 2.2 Guide", 26, align_left),
    ]

    # Write Header Row
    ws1.row_dimensions[1].height = 32
    for col_idx, (head_text, width, align) in enumerate(headers_tab1, start=1):
        cell = ws1.cell(row=1, column=col_idx, value=head_text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_header_center if align == align_center else align_header_left
        cell.border = header_border
        col_letter = get_column_letter(col_idx)
        ws1.column_dimensions[col_letter].width = width

    # Write Data Rows
    for row_idx, item in enumerate(matrix, start=2):
        ws1.row_dimensions[row_idx].height = 42 # generous default height, wrap_text will expand
        fill = row_odd_fill if row_idx % 2 == 1 else row_even_fill

        num = item.get("num", "")
        name = item.get("name", "")
        level = "Obsolete" if item.get("obsolete") else f"Level {item.get('level', '')}"
        principle = item.get("principle", "")
        change_badge = item.get("changeAnalysis", {}).get("changeBadge", "No provision in draft")
        mapping_note = item.get("changeAnalysis", {}).get("note", "")

        provisions = item.get("provisions", [])
        prov_count = len(provisions)

        prov_titles_types = "\n".join([f"• {p.get('title')} ({p.get('typeLabel')})" for p in provisions])
        prov_texts = "\n\n".join([f"[{p.get('title')}]:\n\"{p.get('text')}\"" for p in provisions])

        related = item.get("related", [])
        related_str = "\n".join([f"• {r.get('title')} ({r.get('typeLabel')}): \"{r.get('text')}\"" for r in related])

        summary = item.get("summary", "")
        why = item.get("whyItMatters", "")
        und_url = item.get("understandingUrl", "")
        tr_url = item.get("trUrl", "")
        guide_path = item.get("guideUrl", "")

        row_data = [
            num,
            name,
            level,
            principle,
            change_badge,
            prov_count,
            prov_titles_types,
            prov_texts,
            mapping_note,
            related_str,
            summary,
            why,
            und_url,
            tr_url,
            guide_path
        ]

        for col_idx, val in enumerate(row_data, start=1):
            cell = ws1.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name=font_name, size=10)
            cell.fill = fill
            cell.border = border_thin
            cell.alignment = headers_tab1[col_idx - 1][2]

            # Bold the SC number
            if col_idx == 1:
                cell.font = Font(name=font_name, size=10, bold=True)
            # Soft tint for mapping status
            elif col_idx == 5:
                if "Successor" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="047857")
                    cell.fill = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")
                elif "Related" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="B45309")
                    cell.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
                elif "Obsolete" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="475569")
                    cell.fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
                elif "No provision" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="BE123C")
            # Hyperlink URLs
            elif col_idx in (13, 14) and val and str(val).startswith("http"):
                cell.hyperlink = val
                cell.font = Font(name=font_name, size=10, color="0369A1", underline="single")

    ws1.freeze_panes = "A2"
    ws1.auto_filter.ref = ws1.dimensions

    # ----------------------------------------------------
    # TAB 2: WCAG 3 Explorer (All 245 W3C Draft Provisions)
    # ----------------------------------------------------
    ws2 = wb.create_sheet(title="WCAG 3 Explorer")
    ws2.views.sheetView[0].showGridLines = True

    headers_tab2 = [
        ("WCAG 3 Provision Title", 32, align_left),
        ("Functional Category", 26, align_left),
        ("Outcome / Guideline", 26, align_left),
        ("Requirement Type", 24, align_center),
        ("W3C Draft Status", 18, align_center),
        ("Plain English Summary", 48, align_left),
        ("Why It Matters", 48, align_left),
        ("Normative Statement (W3C Draft)", 55, align_left),
        ("Applies When", 35, align_left),
        ("Except When", 35, align_left),
        ("WCAG 2.2 Predecessors (Direct)", 28, align_left),
        ("WCAG 2.2 Predecessors (Via Guideline)", 28, align_left),
        ("Provision Slug", 26, align_left),
        ("Upstream W3C Source File", 45, align_left),
        ("Plain English Guide Path", 32, align_left),
    ]

    # Write Header Row
    ws2.row_dimensions[1].height = 32
    for col_idx, (head_text, width, align) in enumerate(headers_tab2, start=1):
        cell = ws2.cell(row=1, column=col_idx, value=head_text)
        cell.font = header_font
        cell.fill = header_fill_accent
        cell.alignment = align_header_center if align == align_center else align_header_left
        cell.border = header_border
        col_letter = get_column_letter(col_idx)
        ws2.column_dimensions[col_letter].width = width

    # Write Data Rows
    for row_idx, item in enumerate(catalog, start=2):
        ws2.row_dimensions[row_idx].height = 42
        fill = row_odd_fill if row_idx % 2 == 1 else row_even_fill

        title = item.get("title", "")
        group_slug = item.get("groupSlug", "")
        category_name = GROUP_NAMES.get(group_slug, group_slug.replace("-", " ").title())
        guideline_slug = item.get("guidelineSlug", "")
        guideline_name = guideline_slug.replace("-", " ").title()

        req_type = provision_type_label(item.get("type", ""))
        status = (item.get("status", "") or "exploratory").capitalize()

        ann = item.get("annotation", {}).get("plainEnglish", {})
        summary = ann.get("summary", "")
        why = ann.get("whyItMatters", "")

        # Extract normative statement without markdown directives
        raw = item.get("rawBody", "")
        normative_statement = raw.split(":::")[0].strip()

        # Applies / Except
        applies = clean_html_to_text(item.get("derived", {}).get("appliesWhen", []))
        excepts = clean_html_to_text(item.get("derived", {}).get("exceptWhen", []))

        # Predecessors
        inbound = item.get("wcag22Inbound", {})
        direct_list = inbound.get("direct", [])
        direct_str = ", ".join([f"{d.get('num')} {d.get('name')}" if isinstance(d, dict) else str(d) for d in direct_list])

        via_list = inbound.get("viaGuideline", [])
        via_str = ", ".join([f"{v.get('num')} {v.get('name')}" if isinstance(v, dict) else str(v) for v in via_list])

        slug = item.get("slug", "")
        source_file = item.get("derived", {}).get("sources", {}).get("provision", "")
        guide_path = f"/plain-english/provision/{slug}/"

        row_data = [
            title,
            category_name,
            guideline_name,
            req_type,
            status,
            summary,
            why,
            normative_statement,
            applies,
            excepts,
            direct_str,
            via_str,
            slug,
            source_file,
            guide_path
        ]

        for col_idx, val in enumerate(row_data, start=1):
            cell = ws2.cell(row=row_idx, column=col_idx, value=val)
            cell.font = Font(name=font_name, size=10)
            cell.fill = fill
            cell.border = border_thin
            cell.alignment = headers_tab2[col_idx - 1][2]

            # Bold the provision title
            if col_idx == 1:
                cell.font = Font(name=font_name, size=10, bold=True)
            # Soft tint for Requirement Type
            elif col_idx == 4:
                if "Core" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="1D4ED8")
                    cell.fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid")
                elif "Supplemental" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="7E22CE")
                    cell.fill = PatternFill(start_color="FAF5FF", end_color="FAF5FF", fill_type="solid")
                elif "Assertion" in str(val):
                    cell.font = Font(name=font_name, size=10, bold=True, color="B45309")
                    cell.fill = PatternFill(start_color="FFFBEB", end_color="FFFBEB", fill_type="solid")
            # Soft tint for Status
            elif col_idx == 5:
                if str(val).lower() == "mature":
                    cell.font = Font(name=font_name, size=10, bold=True, color="047857")
                    cell.fill = PatternFill(start_color="ECFDF5", end_color="ECFDF5", fill_type="solid")
                elif str(val).lower() == "refining":
                    cell.font = Font(name=font_name, size=10, bold=True, color="0369A1")
                    cell.fill = PatternFill(start_color="E0F2FE", end_color="E0F2FE", fill_type="solid")
                elif str(val).lower() == "developing":
                    cell.font = Font(name=font_name, size=10, bold=True, color="92400E")
                    cell.fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
                elif str(val).lower() == "exploratory":
                    cell.font = Font(name=font_name, size=10, bold=True, color="BE123C")
                    cell.fill = PatternFill(start_color="FFF1F2", end_color="FFF1F2", fill_type="solid")
            # Hyperlink W3C source file
            elif col_idx == 14 and val:
                cell.hyperlink = f"https://github.com/w3c/wcag3/blob/main/{val}"
                cell.font = Font(name=font_name, size=10, color="0369A1", underline="single")

    ws2.freeze_panes = "A2"
    ws2.auto_filter.ref = ws2.dimensions

    # Save workbook to root and public/data/
    wb.save(OUTPUT_XLSX)
    public_xlsx = os.path.join(ROOT_DIR, "public", "data", "WCAG_Old_vs_New_and_WCAG3_Explorer.xlsx")
    wb.save(public_xlsx)
    print(f"Successfully generated:\n - {OUTPUT_XLSX}\n - {public_xlsx}\nwith {len(matrix)} rows in Tab 1 and {len(catalog)} rows in Tab 2.")

if __name__ == "__main__":
    main()
