#!/usr/bin/env python3
"""
软著源代码 PDF 生成器 - 使用 fpdf2
支持 UTF-8、等宽字体、自动分页
"""
from pathlib import Path
from fpdf import FPDF

PROJ_DIR = Path("/Users/fan/www/AI/erp-saas")
SRC_TXT = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.txt"
OUTPUT_PDF = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.pdf"

# A4: 210 x 297mm
# 边距: 左15mm, 右15mm, 上15mm, 下15mm
# 可用宽度: 180mm, 字号9pt, Courier, 每字符宽约 2.5mm/char → 72字符/行
PAGE_W_MM = 210
PAGE_H_MM = 297
MARGIN_MM = 15
FONT_SIZE = 9
# fpdf2 Courier 每个字符约 0.5 * font_size in mm for 96dpi → 4.5mm/char
# 可用宽度 180mm, 每行约 40字符... 这太少
# 试试更小的字号
FONT_SIZE_SM = 8

class CodePDF(FPDF):
    def header(self):
        # 每页顶部留空
        pass
    def footer(self):
        # 页脚
        self.set_y(-15)
        self.set_font('Courier', '', 7)
        self.cell(0, 5, f'云ERP（零售批发版）源代码  v1.0.0  - {self.page_no()}', align='C')

def main():
    print("📄 正在生成源代码 PDF（fpdf2）...")

    pdf = CodePDF(orientation='P', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=15)

    # 封面页
    pdf.add_page()
    pdf.set_margins(15, 15, 15)
    pdf.add_font('Courier', '', '/System/Library/Fonts/Supplemental/Courier.dfont', uni=True)
    pdf.set_font('Courier', '', 14)
    pdf.ln(20)
    pdf.cell(0, 8, '云ERP（零售批发版）源代码', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(5)
    pdf.set_font('Courier', '', 11)
    pdf.cell(0, 6, '版本号: v1.0.0', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 6, '著作权人: 晋城市掌上乾坤网络科技有限公司', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 6, '源程序量: 约 8700 行', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(3)
    pdf.set_font('Courier', '', 9)
    pdf.cell(0, 5, '前端: React 18 + TypeScript', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.cell(0, 5, '后端: NestJS + TypeScript + Prisma + PostgreSQL', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(10)
    pdf.set_draw_color(0, 0, 0)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    pdf.set_font('Courier', '', 8)
    pdf.multi_cell(0, 4, '本源代码文档包含系统全部前后端有效代码，共约 8700 行。')
    pdf.ln(3)
    pdf.multi_cell(0, 4, '说明: 本文档由原始代码文本自动生成，用于计算机软件著作权登记。')
    pdf.ln(3)
    pdf.multi_cell(0, 4, '前端: apps/web/src (44个文件)  |  后端: apps/api/src (49个文件)')

    # 读取源代码并逐块添加
    with open(SRC_TXT, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = content.split('=' * 70)
    print(f"  共有 {len(blocks)} 个代码块")

    pdf.add_page()
    pdf.set_margins(10, 10, 10)
    pdf.set_font('Courier', '', FONT_SIZE_SM)

    chars_per_line = 100  # 保守估计可用字符数
    block_count = 0

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        block_count += 1
        lines = block.split('\n')

        # 检测是否是封面后的第一块（已有封面信息）
        # 添加分隔线
        pdf.ln(2)
        pdf.set_draw_color(150, 150, 150)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(1.5)

        for line in lines:
            # 跳过分隔符行
            if line.startswith('=='):
                continue
            # 空行
            if not line.strip():
                pdf.ln(FONT_SIZE_SM * 0.4)
                continue

            # 文件路径行（灰色斜体效果用下划线提示）
            if line.startswith('  ') and any(c in line for c in ['/', '\\', '(apps', 'src']):
                pdf.set_font('Courier', '', FONT_SIZE_SM)
                pdf.set_text_color(80, 80, 80)
                # 截断超长行
                display = line[:chars_per_line] + ('...' if len(line) > chars_per_line else '')
                pdf.multi_cell(0, FONT_SIZE_SM * 0.35, display)
                pdf.set_text_color(0, 0, 0)
            else:
                pdf.set_font('Courier', '', FONT_SIZE_SM)
                # 截断超长行
                display = line[:chars_per_line] + ('...' if len(line) > chars_per_line else '')
                pdf.multi_cell(0, FONT_SIZE_SM * 0.35, display)

        if block_count % 20 == 0:
            print(f"  处理中: {block_count}/{len(blocks)} 块")

    print(f"  正在保存 PDF...")
    pdf.output(str(OUTPUT_PDF))

    size_mb = OUTPUT_PDF.stat().st_size / 1024 / 1024
    print(f"✅ PDF 生成完成！")
    print(f"   文件: {OUTPUT_PDF}")
    print(f"   大小: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()
