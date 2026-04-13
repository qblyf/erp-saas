#!/usr/bin/env python3
"""
软著源代码 PDF 生成器
使用 reportlab.platypus.Preformatted 高效渲染代码
"""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Preformatted, Spacer, PageBreak, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

PROJ_DIR = Path("/Users/fan/www/AI/erp-saas")
SRC_TXT = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.txt"
OUTPUT_PDF = PROJ_DIR / "docs" / "云ERP零售批发版_源代码.pdf"

FONT_NAME = "Courier"
FONT_SIZE = 8.5
LINE_H = FONT_SIZE * 1.3

def main():
    print("📄 正在生成源代码 PDF...")

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="云ERP零售批发版 源代码",
        author="晋城市掌上乾坤网络科技有限公司",
    )

    story = []

    # 封面
    cover_s = ParagraphStyle('cover', fontName=FONT_NAME, fontSize=14, leading=20)
    cover2_s = ParagraphStyle('cover2', fontName=FONT_NAME, fontSize=11, leading=16)
    cover_sm_s = ParagraphStyle('coversm', fontName=FONT_NAME, fontSize=9, leading=13)

    story.append(Spacer(1, 1.5 * cm))
    story.append(Preformatted("云ERP（零售批发版）源代码", cover_s))
    story.append(Spacer(1, 0.4 * cm))
    story.append(Preformatted("版本号：v1.0.0", cover2_s))
    story.append(Preformatted("著作权人：晋城市掌上乾坤网络科技有限公司", cover2_s))
    story.append(Preformatted("源程序量：约 8700 行", cover2_s))
    story.append(Preformatted("前端：React 18 + TypeScript，后端：NestJS + TypeScript + Prisma + PostgreSQL", cover_sm_s))
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1))
    story.append(Spacer(1, 0.3 * cm))
    story.append(PageBreak())

    # 读取源代码
    with open(SRC_TXT, 'r', encoding='utf-8') as f:
        content = f.read()

    code_s = ParagraphStyle('code', fontName=FONT_NAME, fontSize=FONT_SIZE, leading=LINE_H)
    header_s = ParagraphStyle('header', fontName=FONT_NAME, fontSize=FONT_SIZE, leading=LINE_H,
                              textColor='#555555')
    empty_s = ParagraphStyle('empty', fontName=FONT_NAME, fontSize=FONT_SIZE, leading=LINE_H * 0.3)

    # 按文件分隔符（====）分块
    blocks = content.split('=' * 70)
    total_blocks = len(blocks)
    print(f"  共有 {total_blocks} 个代码块")

    for idx, block in enumerate(blocks):
        block = block.strip()
        if not block:
            continue

        # 文件分隔线
        story.append(Spacer(1, 0.15 * cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color='#bbb', spaceAfter=3))

        lines = block.split('\n')
        for line in lines:
            if not line.strip():
                # 空行用小间距
                story.append(Spacer(1, LINE_H * 0.25))
            elif line.startswith('  ') and any(c in line for c in ['(', ')', '/', '\\', '.ts', '.tsx']):
                # 文件路径行（灰色）
                story.append(Preformatted(line, header_s))
            elif line.startswith('='):
                continue  # 跳过多余分隔符
            else:
                # 截断超长行（>120字符）
                display = line[:120] + ('...（截断）' if len(line) > 120 else '')
                story.append(Preformatted(display, code_s))

        if (idx + 1) % 15 == 0:
            print(f"  处理中：{idx + 1}/{total_blocks} 块")

    print(f"  正在构建 PDF...")
    doc.build(story)

    size_mb = OUTPUT_PDF.stat().st_size / 1024 / 1024
    print(f"✅ PDF 生成完成！")
    print(f"   文件：{OUTPUT_PDF}")
    print(f"   大小：{size_mb:.1f} MB")

if __name__ == "__main__":
    main()
