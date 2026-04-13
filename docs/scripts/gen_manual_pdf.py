#!/usr/bin/env python3
"""
软件说明书 PDF 生成器 - fpdf2 中文版
"""
from pathlib import Path
from fpdf import FPDF

PROJ_DIR = Path("/Users/fan/www/AI/erp-saas")
MANUAL_MD = PROJ_DIR / "docs" / "3.云ERP零售批发版_软件说明书.md"
OUTPUT_PDF = PROJ_DIR / "docs" / "云ERP零售批发版_软件说明书.pdf"

# A4: 210 x 297mm
MARGIN = 15
FONT_CN = "Heiti"  # macOS 黑体（支持中文）
FONT_EN = "Courier"

class ManualPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font(FONT_CN, '', 8)
            self.set_text_color(120, 120, 120)
            self.cell(0, 8, f"云ERP（零售批发版）软件说明书  v1.0.0  |  第 {self.page_no()} 页", align="C")
            self.ln(12)
            self.set_text_color(0, 0, 0)

    def footer(self):
        pass

def parse_markdown(md_text):
    """解析 Markdown 为带格式的结构化数据"""
    blocks = []
    lines = md_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        # 代码块
        if line.strip().startswith('```'):
            lang = line.strip()[3:]
            content = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                content.append(lines[i])
                i += 1
            blocks.append(('code', '\n'.join(content), lang))
            i += 1
            continue
        # H1
        if line.startswith('# ') and not line.startswith('##'):
            blocks.append(('h1', line[2:].strip()))
        # H2
        elif line.startswith('## ') and not line.startswith('###'):
            blocks.append(('h2', line[3:].strip()))
        # H3
        elif line.startswith('### '):
            blocks.append(('h3', line[4:].strip()))
        # 分隔线
        elif line.strip() in ('---', '***', '___'):
            blocks.append(('hr', ''))
        # 表格行（跳过）
        elif line.startswith('|'):
            i += 1
            continue
        # 空行
        elif line.strip() == '':
            blocks.append(('blank', ''))
        # 普通段落（合并连续空行内的段落）
        else:
            blocks.append(('para', line))
        i += 1
    return blocks

def main():
    with open(MANUAL_MD, 'r', encoding='utf-8') as f:
        content = f.read()

    pdf = ManualPDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # 添加中文字体
    pdf.add_font(FONT_CN, '', '/System/Library/Fonts/STHeiti Medium.ttc')
    pdf.add_font(FONT_CN, 'B', '/System/Library/Fonts/STHeiti Medium.ttc')

    # 封面
    pdf.set_font(FONT_CN, '', 22)
    pdf.ln(30)
    pdf.cell(0, 12, "云ERP（零售批发版）", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font(FONT_CN, '', 16)
    pdf.cell(0, 10, "软件说明书", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    pdf.set_font(FONT_CN, '', 12)
    pdf.cell(0, 8, "版本号：v1.0.0", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, "著作权人：晋城市掌上乾坤网络科技有限公司", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, "完成日期：2024年", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    pdf.set_draw_color(100, 100, 100)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(6)
    pdf.set_font(FONT_CN, '', 10)
    pdf.multi_cell(0, 6, "本说明书由云ERP团队编制，用于计算机软件著作权登记申请。", align="C")

    # 正文
    pdf.add_page()
    blocks = parse_markdown(content)

    in_code = False
    blank_count = 0

    for block in blocks:
        if len(block) == 2:
            blk_type, blk_text = block
            blk_lang = ''
        else:
            blk_type, blk_text, blk_lang = block
        # 跳过封面信息（已处理）
        if blk_text and ('著作权人' in blk_text or '完成日期' in blk_text or '说明' in blk_text) and '##' not in blk_type:
            if blk_type == 'para' and any(k in blk_text for k in ['晋城市', '2024年', '由云ERP']):
                continue

        if blk_type == 'h1':
            blank_count = 0
            pdf.ln(5)
            pdf.set_font(FONT_CN, 'B', 15)
            pdf.set_text_color(0, 0, 0)
            pdf.cell(0, 8, blk_text, new_x="LMARGIN", new_y="NEXT")
            pdf.set_draw_color(200, 200, 200)
            pdf.line(MARGIN, pdf.get_y(), 210-MARGIN, pdf.get_y())
            pdf.ln(3)

        elif blk_type == 'h2':
            blank_count = 0
            pdf.ln(3)
            pdf.set_font(FONT_CN, 'B', 12)
            pdf.set_text_color(30, 30, 30)
            pdf.cell(0, 7, blk_text, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)

        elif blk_type == 'h3':
            blank_count = 0
            pdf.ln(2)
            pdf.set_font(FONT_CN, 'B', 11)
            pdf.set_text_color(50, 50, 50)
            pdf.cell(0, 6, blk_text, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)

        elif blk_type == 'code':
            blank_count = 0
            pdf.ln(2)
            pdf.set_fill_color(248, 248, 248)
            code_lines = blk_text.strip().split('\n')
            for codeline in code_lines:
                pdf.set_font(FONT_CN, '', 7.5)
                pdf.set_text_color(50, 50, 50)
                # 截断超长行
                display = codeline[:120] + ('...' if len(codeline) > 120 else '')
                pdf.cell(0, 3.5, display, fill=True)
                pdf.ln(3.5)
            pdf.ln(2)

        elif blk_type == 'hr':
            blank_count = 0
            pdf.set_draw_color(220, 220, 220)
            pdf.line(MARGIN, pdf.get_y(), 210-MARGIN, pdf.get_y())
            pdf.ln(3)

        elif blk_type == 'blank':
            blank_count += 1
            if blank_count <= 1:
                pdf.ln(2)

        elif blk_type == 'para':
            blank_count = 0
            # 清理 Markdown 格式
            text = blk_text
            # **bold**
            import re
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
            # `code`
            text = re.sub(r'`(.*?)`', r'\1', text)
            # [text](url)
            text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)

            pdf.set_font(FONT_CN, '', 10)
            pdf.set_text_color(0, 0, 0)
            # 手动换行
            chars_per_line = 85
            while len(text) > chars_per_line:
                pdf.cell(0, 5.5, text[:chars_per_line])
                pdf.ln(5.5)
                text = text[chars_per_line:]
            if text.strip():
                pdf.cell(0, 5.5, text)
                pdf.ln(5.5)

    pdf.output(str(OUTPUT_PDF))

    size_kb = OUTPUT_PDF.stat().st_size / 1024
    print(f"✅ 软件说明书 PDF 生成完成！")
    print(f"   文件：{OUTPUT_PDF}")
    print(f"   大小：{size_kb:.0f} KB")

if __name__ == "__main__":
    main()
