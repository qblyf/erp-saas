#!/usr/bin/env python3
"""
软著源代码 PDF 生成器 - 最终版（全中文支持）
"""
from pathlib import Path
from fpdf import FPDF
import re

PROJ_DIR = Path("/Users/fan/www/AI/erp-saas")
SRC_TXT = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.txt"
OUTPUT_PDF = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.pdf"

FONT = "Heiti"

class CodePDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font(FONT, "", 7)
            self.set_text_color(120, 120, 120)
            self.cell(0, 6, f"云ERP（零售批发版）  v1.0.0  |  第 {self.page_no()} 页", align="C")
            self.ln(8)
            self.set_text_color(220, 220, 220)
            self.line(10, self.get_y(), 200, self.get_y())
            self.set_text_color(0, 0, 0)
            self.ln(3)

def wrap_line(text, max_chars):
    lines = []
    while len(text) > max_chars:
        lines.append(text[:max_chars])
        text = text[max_chars:]
    lines.append(text)
    return lines

def main():
    print("📄 正在生成源代码 PDF（全中文支持版）...")

    pdf = CodePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_font(FONT, "", "/System/Library/Fonts/STHeiti Medium.ttc")
    pdf.add_font(FONT, "B", "/System/Library/Fonts/STHeiti Medium.ttc")

    # 封面
    pdf.add_page()
    pdf.set_font(FONT, "B", 20)
    pdf.ln(25)
    pdf.cell(0, 12, "云ERP（零售批发版）源代码", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(FONT, "", 12)
    pdf.ln(4)
    pdf.cell(0, 8, "版本号：v1.0.0", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, "著作权人：晋城市掌上乾坤网络科技有限公司", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, "源程序量：约 8700 行", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    pdf.set_font(FONT, "", 9)
    pdf.cell(0, 6, "前端：React 18 + TypeScript  |  后端：NestJS + TypeScript + Prisma + PostgreSQL", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)
    pdf.set_draw_color(100, 100, 100)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(6)
    pdf.set_font(FONT, "", 9)
    pdf.multi_cell(0, 5.5, "本源代码文档包含系统全部前后端有效代码，用于计算机软件著作权登记。", align="C")
    pdf.ln(2)
    pdf.multi_cell(0, 5.5, "前端：apps/web/src（44个文件）  后端：apps/api/src（49个文件）", align="C")

    # 正文
    with open(SRC_TXT, "r", encoding="utf-8") as f:
        content = f.read()

    blocks = content.split("=" * 70)
    print(f"  共 {len(blocks)} 个代码块")

    pdf.add_page()
    pdf.set_margins(10, 10, 10)

    MAX_CHARS = 100

    for idx, block in enumerate(blocks):
        block = block.strip()
        if not block:
            continue

        lines = block.split("\n")

        # 块分隔线
        pdf.ln(1.5)
        pdf.set_draw_color(160, 160, 160)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(1.5)

        for raw_line in lines:
            line = raw_line.rstrip()
            if line.startswith("=="):
                continue
            if not line.strip():
                pdf.ln(1.2)
                continue

            # 文件路径行（灰色）
            is_path = (
                line.startswith("  ")
                and len(line) > 3
                and any(c in line for c in ["/", "(", "apps", "src", "\\", "版本"])
            )

            if is_path:
                pdf.set_font(FONT, "", 7.5)
                pdf.set_text_color(80, 80, 80)
            else:
                pdf.set_font(FONT, "", 7.5)
                pdf.set_text_color(0, 0, 0)

            # 截断超长行
            display = line[:120] + ("...[截断]" if len(line) > 120 else "")
            wrapped = wrap_line(display, MAX_CHARS)
            for wl in wrapped:
                pdf.cell(0, 3.2, wl)
                pdf.ln(3.2)

        pdf.set_text_color(0, 0, 0)

        if (idx + 1) % 20 == 0:
            print(f"  处理中: {idx+1}/{len(blocks)} 块")

    pdf.output(str(OUTPUT_PDF))

    size_kb = OUTPUT_PDF.stat().st_size / 1024
    print(f"✅ PDF 生成完成！")
    print(f"   文件: {OUTPUT_PDF}")
    print(f"   大小: {size_kb:.0f} KB")

if __name__ == "__main__":
    main()
