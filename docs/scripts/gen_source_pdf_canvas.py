#!/usr/bin/env python3
"""
软著源代码 PDF 生成器 - 使用 reportlab canvas 直接绘制
精确控制每个字符位置，避免 Paragraph 换行问题
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

PROJ_DIR = Path("/Users/fan/www/AI/erp-saas")
SRC_TXT = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.txt"
OUTPUT_PDF = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.pdf"

PAGE_W, PAGE_H = A4  # 595.27 x 841.89 points
MARGIN_LEFT = 50     # points
MARGIN_RIGHT = 50
MARGIN_TOP = 60
MARGIN_BOTTOM = 50
FONT_NAME = "Courier"
FONT_SIZE = 8.5
LINE_HEIGHT = FONT_SIZE * 1.25
CHAR_WIDTH = FONT_SIZE * 0.6  # Courier 约 0.6 倍字宽

MAX_CHARS = int((PAGE_W - MARGIN_LEFT - MARGIN_RIGHT) / CHAR_WIDTH)
MAX_LINES_PER_PAGE = int((PAGE_H - MARGIN_TOP - MARGIN_BOTTOM) / LINE_HEIGHT)

def draw_page_header(c, page_num):
    """页眉"""
    c.setFont(FONT_NAME, 7)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawString(MARGIN_LEFT, PAGE_H - 35, f"Gaoyuan ERP (Retail/Wholesale) v1.0.0 - Page {page_num}")

def draw_cover_page(c, w, h):
    """封面"""
    c.setFont(FONT_NAME, 18)
    c.drawCentredString(w/2, h - 100, "Gaoyuan ERP (Retail/Wholesale) Source Code")
    c.setFont(FONT_NAME, 12)
    c.drawCentredString(w/2, h - 130, "Version: v1.0.0")
    c.drawCentredString(w/2, h - 148, "Copyright Owner: Jincheng ZhangShangQianKun Network Technology Co., Ltd.")
    c.drawCentredString(w/2, h - 166, "Lines of Code: approx. 8700")
    c.setFont(FONT_NAME, 9)
    c.drawCentredString(w/2, h - 195, "Frontend: React 18 + TypeScript  |  Backend: NestJS + TypeScript + Prisma + PostgreSQL")
    c.line(50, h - 215, w - 50, h - 215)
    c.setFont(FONT_NAME, 8)
    c.drawCentredString(w/2, h - 240, "This document contains all source code of the system.")
    c.drawCentredString(w/2, h - 255, "Frontend: apps/web/src (44 files)  |  Backend: apps/api/src (49 files)")

def main():
    print("📄 正在生成源代码 PDF（canvas直接绘制）...")

    c = canvas.Canvas(str(OUTPUT_PDF), pagesize=A4)
    c.setTitle("Gaoyuan ERP (Retail/Wholesale) Source Code")
    c.setAuthor("Jincheng ZhangShangQianKun Network Technology Co., Ltd.")

    # 封面
    c.showPage()
    draw_cover_page(c, PAGE_W, PAGE_H)

    # 读取源代码
    with open(SRC_TXT, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = content.split('=' * 70)
    print(f"  共有 {len(blocks)} 个代码块")

    page_num = 1
    line_count = 0
    y = 0

    def new_page():
        nonlocal page_num, y
        page_num += 1
        c.showPage()
        draw_page_header(c, page_num)
        y = PAGE_H - MARGIN_TOP

    def check_page():
        nonlocal y
        if y - LINE_HEIGHT < MARGIN_BOTTOM:
            new_page()

    # 从顶部开始第一页
    draw_page_header(c, page_num)
    y = PAGE_H - MARGIN_TOP

    for idx, block in enumerate(blocks):
        block = block.strip()
        if not block:
            continue

        lines = block.split('\n')

        # 块分隔线
        check_page()
        c.setStrokeColorRGB(0.7, 0.7, 0.7)
        c.line(MARGIN_LEFT, y, PAGE_W - MARGIN_RIGHT, y)
        y -= 2

        for line in lines:
            if line.startswith('=='):
                continue

            if not line.strip():
                y -= LINE_HEIGHT * 0.3
                check_page()
            else:
                # 文件路径行用灰色
                is_path = line.startswith('  ') and any(x in line for x in ['/', '(apps', 'src'])
                if is_path:
                    c.setFillColorRGB(0.4, 0.4, 0.4)
                else:
                    c.setFillColorRGB(0, 0, 0)

                c.setFont(FONT_NAME, FONT_SIZE)

                # 截断超长行
                if len(line) > MAX_CHARS:
                    line = line[:MAX_CHARS]

                check_page()
                c.drawString(MARGIN_LEFT, y, line)
                y -= LINE_HEIGHT

        if (idx + 1) % 20 == 0:
            print(f"  处理中: {idx + 1}/{len(blocks)} 块")

    # 保存
    c.save()

    size_mb = OUTPUT_PDF.stat().st_size / 1024 / 1024
    print(f"✅ PDF 生成完成！")
    print(f"   文件: {OUTPUT_PDF}")
    print(f"   大小: {size_mb:.1f} MB")
    print(f"   总页数: {page_num}")

if __name__ == "__main__":
    main()
