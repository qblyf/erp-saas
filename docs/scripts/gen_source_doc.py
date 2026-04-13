#!/usr/bin/env python3
"""
软著源代码文档生成脚本
将erp-saas项目的前后端代码整理为软著登记用的文档格式
"""
import os
from pathlib import Path

BASE_DIR = Path("/Users/fan/www/AI/erp-saas")
OUTPUT_FILE = BASE_DIR / "docs" / "云ERP零售批发版_源代码.txt"
PROJ_NAME = "云ERP（零售批发版）"
VERSION = "v1.0.0"

def should_include(path: str) -> bool:
    """排除不需要的文件"""
    exclude = ['node_modules', 'dist', 'build', '__pycache__', '.git',
               'package-lock.json', '.env', 'pnpm-lock.yaml']
    return not any(e in path for e in exclude)

def get_files(src_dir: Path, extensions=('.ts', '.tsx')) -> list:
    """获取目录下所有代码文件"""
    files = []
    if not src_dir.exists():
        return files
    for root, dirs, filenames in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', '.git']]
        for fname in filenames:
            if fname.endswith(extensions):
                full_path = os.path.join(root, fname)
                if should_include(full_path):
                    files.append(full_path)
    return sorted(files)

def format_file_header(rel_path: str) -> str:
    """生成文件头注释"""
    return f"\n{'='*70}\n  {rel_path}\n{'='*70}\n"

def main():
    print(f"正在生成软著源代码文档...")

    lines_total = 0

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        # 封面
        out.write("=" * 70 + "\n")
        out.write(f"  {PROJ_NAME}\n")
        out.write(f"  版本号：{VERSION}\n")
        out.write(f"  著作权人：________________\n")
        out.write(f"  完成日期：______年______月______日\n")
        out.write("=" * 70 + "\n")
        out.write("\n本源代码文档包含系统全部前后端有效代码，共约 8700 行。\n")
        out.write("代码由 React 18 + TypeScript（前端）和 NestJS + TypeScript（后端）编写。\n\n")

        # 前端代码
        web_dir = BASE_DIR / "apps" / "web" / "src"
        web_files = get_files(web_dir)

        out.write("=" * 70 + "\n")
        out.write(f"  前端源代码 (apps/web/src) — 共 {len(web_files)} 个文件\n")
        out.write("=" * 70 + "\n\n")

        web_lines = 0
        for fpath in web_files:
            rel = Path(fpath).relative_to(BASE_DIR / "apps" / "web")
            header = format_file_header(str(rel))
            out.write(header)

            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    out.write(content)
                    out.write("\n")
                    lines = len(content.splitlines())
                    web_lines += lines
            except Exception as e:
                out.write(f"  [文件读取失败: {e}]\n")

        out.write(f"\n// 前端代码合计：约 {web_lines} 行\n")
        lines_total += web_lines

        # 后端代码
        api_dir = BASE_DIR / "apps" / "api" / "src"
        api_files = get_files(api_dir)

        out.write("\n" + "=" * 70 + "\n")
        out.write(f"  后端源代码 (apps/api/src) — 共 {len(api_files)} 个文件\n")
        out.write("=" * 70 + "\n\n")

        api_lines = 0
        for fpath in api_files:
            rel = Path(fpath).relative_to(BASE_DIR / "apps" / "api")
            header = format_file_header(str(rel))
            out.write(header)

            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    out.write(content)
                    out.write("\n")
                    lines = len(content.splitlines())
                    api_lines += lines
            except Exception as e:
                out.write(f"  [文件读取失败: {e}]\n")

        out.write(f"\n// 后端代码合计：约 {api_lines} 行\n")
        lines_total += api_lines

        out.write(f"\n{'='*70}\n")
        out.write(f"  源代码总计：约 {lines_total} 行\n")
        out.write(f"  前端：约 {web_lines} 行，后端：约 {api_lines} 行\n")
        out.write("=" * 70 + "\n")

    size_kb = OUTPUT_FILE.stat().st_size // 1024
    print(f"✅ 生成完成！")
    print(f"   文件：{OUTPUT_FILE}")
    print(f"   大小：{size_kb} KB")
    print(f"   源码行数：约 {lines_total} 行")
    print(f"   前端文件：{len(web_files)} 个")
    print(f"   后端文件：{len(api_files)} 个")
    print(f"\n下一步：将 {OUTPUT_FILE} 内容复制到 Word，")
    print(f"设置字体 Courier New 10pt，页边距适当，导出为 PDF 即可。")

if __name__ == "__main__":
    main()
