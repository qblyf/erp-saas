#!/bin/bash
# 软著材料一键生成脚本
# 运行后生成：软件说明书(word版) + 源代码文档

PROJ_DIR="/Users/fan/www/AI/erp-saas"
DOCS_DIR="$PROJ_DIR/docs"

echo "============================================"
echo "  云ERP（零售批发版）软著材料生成器"
echo "============================================"
echo ""

# Step 1: 生成源代码文档
echo "📄 Step 1: 生成源代码文档..."
python3 "$DOCS_DIR/scripts/gen_source_doc.py"
echo ""

# Step 2: 复制说明书模板
echo "📄 Step 2: 复制软件说明书模板..."
if [ -f "$DOCS_DIR/3.云ERP零售批发版_软件说明书.md" ]; then
  cp "$DOCS_DIR/3.云ERP零售批发版_软件说明书.md" "$DOCS_DIR/云ERP零售批发版_软件说明书_待填写.md"
  echo "  ✅ 已复制说明书模板：云ERP零售批发版_软件说明书_待填写.md"
fi
echo ""

# Step 3: 列出所有材料
echo "📋 Step 3: 材料清单"
echo ""
echo "  需要你填写的文件："
echo "  1. $DOCS_DIR/2.软著登记已填写示例_云ERP零售批发版.md"
echo "     → 填写公司名称、日期等信息"
echo ""
echo "  2. $DOCS_DIR/云ERP零售批发版_软件说明书_待填写.md"
echo "     → 填写著作权人、完成日期"
echo ""
echo "  已自动生成的文件："
echo "  3. $DOCS_DIR/云ERP零售批发版_源代码.txt"
echo "     → 复制到 Word，Courier New 10pt，导出 PDF"
echo ""
echo "  参考文件："
echo "  4. $DOCS_DIR/4.源代码PDF生成说明.md"
echo "     → 源代码转 PDF 的详细说明"
echo ""

# Step 4: 告知Word转换说明
echo "============================================"
echo "  Word 转 PDF 方法（将 .txt 转为登记用 PDF）"
echo "============================================"
echo ""
echo "  1. 打开 Word 新建文档"
echo "  2. 将 源代码.txt 全部内容 Ctrl+A → Ctrl+C → Ctrl+V 粘贴进去"
echo "  3. 选中全文，设置字体为 'Courier New'，字号 '10pt'"
echo "  4. 文件 → 打印 → 选择 'Microsoft Print to PDF' 或直接 '导出为PDF'"
echo "  5. 保存为：云ERP零售批发版_源代码.pdf"
echo ""
echo "  建议页数：≥ 60 页"
echo "============================================"
