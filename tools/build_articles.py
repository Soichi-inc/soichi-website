#!/usr/bin/env python3
"""build_articles.py ── content/articles/*.md から記事ページと News 一覧を組み立てる。

なぜこの形か:
  このサイトは静的HTMLで、ビルドの仕組みもCMSも無い。そこへ記事を継続的に足すために、
  「記事の実体はマークダウン1枚、HTMLは毎回そこから組み直す」形にした。
  外部の部品を一切増やさないため、マークダウンの変換もこのファイル内で完結させている
  （使えるのは見出し・段落・箇条書き・番号付き・強調・リンク・引用・表・区切り線）。

手を触れない約束:
  - news.html は LAB:ARTICLES:START / END の間だけを書き換える。既存のプレスリリースには触らない。
  - articles/ 配下は、content/articles/ に元があるものだけを作り直す。手で置いたHTMLは消さない。

使い方:
  tools/build_articles.py            組み直す
  tools/build_articles.py --check    差分が出るかだけ見る（書き込まない）
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "content/articles"
OUT = ROOT / "articles"
NEWS = ROOT / "news.html"
START = "<!-- LAB:ARTICLES:START -->"
END = "<!-- LAB:ARTICLES:END -->"


# ── マークダウンの変換（使う記法だけを扱う） ──────────────────────────────
def inline(text: str) -> str:
    """行の中の記法。エスケープしてから、決めた記法だけを戻す。"""
    t = html.escape(text, quote=False)
    t = re.sub(r"`([^`]+)`", r'<code class="px-1 bg-gray-100 rounded text-[0.9em]">\1</code>', t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)",
               r'<a href="\2" class="underline decoration-2 underline-offset-4 hover:text-gray-600"'
               r' target="_blank" rel="noopener noreferrer">\1</a>', t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    return t


def to_html(md: str) -> str:
    lines = md.split("\n")
    out: list[str] = []
    i = 0
    P = 'class="text-lg leading-loose text-gray-800 mb-8"'
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            i += 1
        elif ln.startswith("### "):
            out.append(f'<h3 class="text-xl md:text-2xl font-bold mt-14 mb-5">{inline(ln[4:])}</h3>')
            i += 1
        elif ln.startswith("## "):
            out.append(f'<h2 class="text-2xl md:text-3xl font-bold mt-20 mb-6 leading-tight">{inline(ln[3:])}</h2>')
            i += 1
        elif ln.startswith("# "):            # 記事内のh1は題名と重複するのでh2に落とす
            out.append(f'<h2 class="text-2xl md:text-3xl font-bold mt-20 mb-6 leading-tight">{inline(ln[2:])}</h2>')
            i += 1
        elif re.match(r"^(-{3,}|\*{3,})$", ln.strip()):
            out.append('<hr class="my-16 border-gray-200">')
            i += 1
        elif ln.startswith("> "):
            buf = []
            while i < len(lines) and lines[i].startswith("> "):
                buf.append(inline(lines[i][2:].rstrip())); i += 1
            out.append('<blockquote class="border-l-4 border-black pl-6 py-1 my-10 text-gray-700 '
                       f'text-lg leading-loose">{"<br>".join(buf)}</blockquote>')
        elif ln.lstrip().startswith(("- ", "* ")):
            buf = []
            while i < len(lines) and lines[i].lstrip().startswith(("- ", "* ")):
                buf.append(f'<li class="mb-3">{inline(lines[i].lstrip()[2:].rstrip())}</li>'); i += 1
            out.append('<ul class="list-disc pl-6 text-lg leading-loose text-gray-800 mb-8">'
                       + "".join(buf) + "</ul>")
        elif re.match(r"^\s*\d+\.\s", ln):
            buf = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s", lines[i]):
                cell = inline(re.sub(r"^\s*\d+\.\s", "", lines[i]).rstrip())
                buf.append(f'<li class="mb-3">{cell}</li>'); i += 1
            out.append('<ol class="list-decimal pl-6 text-lg leading-loose text-gray-800 mb-8">'
                       + "".join(buf) + "</ol>")
        elif ln.lstrip().startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            head = [c.strip() for c in ln.strip().strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            th = "".join(f'<th class="border-b-2 border-black py-3 px-4 text-left font-bold">{inline(c)}</th>'
                         for c in head)
            tb = "".join("<tr>" + "".join(
                f'<td class="border-b border-gray-200 py-3 px-4 align-top">{inline(c)}</td>' for c in r) + "</tr>"
                for r in rows)
            out.append('<div class="overflow-x-auto my-10"><table class="w-full text-base">'
                       f"<thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table></div>")
        else:
            buf = []
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", ">", "|")) \
                    and not lines[i].lstrip().startswith(("- ", "* ")) and not re.match(r"^\s*\d+\.\s", lines[i]):
                buf.append(inline(lines[i].rstrip())); i += 1
            out.append(f"<p {P}>" + "<br>".join(buf) + "</p>")
    return "\n            ".join(out)


# ── 記事ファイルの読み取り ────────────────────────────────────────────
def parse(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        sys.exit(f"[中止] 冒頭に --- で囲んだ見出し情報がありません: {path.name}")
    _, fm, body = text.split("---", 2)
    meta = {"slug": path.stem, "category": "INSIGHT", "tags": []}
    for line in fm.strip().split("\n"):
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        k, v = k.strip(), v.strip().strip('"').strip("'")
        meta[k] = [t.strip() for t in v.split(",") if t.strip()] if k == "tags" else v
    for need in ("title", "date", "excerpt"):
        if not meta.get(need):
            sys.exit(f"[中止] {need} が空です: {path.name}")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(meta["date"])):
        sys.exit(f"[中止] date は YYYY-MM-DD で書いてください: {path.name}")
    meta["body"] = body.strip()
    return meta


def shell(a: dict, base: str = "../") -> str:
    """記事1ページ。news.html と同じ外枠を使う（トンマナを別に持たないため）。"""
    dot = str(a["date"]).replace("-", ".")
    tags = "".join(f'<span class="inline-block px-3 py-1 text-xs font-bold border border-gray-300 '
                   f'text-gray-600 mr-2 mb-2">{html.escape(t)}</span>' for t in a.get("tags", []))
    return f"""<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(a['title'])} | Soichi Inc.</title>
    <meta name="description" content="{html.escape(a['excerpt'])}">
    <meta property="og:title" content="{html.escape(a['title'])}">
    <meta property="og:description" content="{html.escape(a['excerpt'])}">
    <meta property="og:type" content="article">
    <link rel="icon" href="{base}images/favicon.png" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
        rel="stylesheet">
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    fontFamily: {{ sans: ['Inter', 'Noto Sans JP', 'sans-serif'] }},
                    colors: {{
                        'soichi-black': '#1a1a1a',
                        'soichi-gray': '#f5f5f7',
                        'soichi-blue': '#0066cc',
                        'soichi-red': '#cc0000',
                        'soichi-yellow': '#FFD700',
                    }}
                }}
            }}
        }}
    </script>
    <link href="{base}css/custom.css" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', 'Noto Sans JP', sans-serif; -webkit-font-smoothing: antialiased; }}
    </style>
</head>

<body class="bg-white text-black">

    <nav class="fixed w-full z-50 bg-white/90 backdrop-blur-md text-black transition-all duration-300 border-b border-gray-100"
        id="navbar">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="flex justify-between h-24 items-center">
                <a href="{base}index.html" class="block">
                    <img src="{base}images/logo.png" alt="SOICHI" class="h-8 md:h-10 w-auto">
                </a>
                <div class="hidden md:flex space-x-12">
                    <a href="{base}about.html" class="nav-link text-sm uppercase">About</a>
                    <a href="{base}services.html" class="nav-link text-sm uppercase">Services</a>
                    <a href="{base}news.html" class="nav-link text-sm uppercase">News</a>
                    <a href="{base}contact.html" class="nav-link text-sm uppercase">Contact</a>
                </div>
                <button id="mobile-menu-btn" class="md:hidden text-black focus:outline-none">
                    <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
        <div id="mobile-menu"
            class="hidden md:hidden bg-black text-white absolute w-full h-screen top-0 left-0 flex flex-col justify-center items-center space-y-8 z-40">
            <button id="mobile-menu-close" class="absolute top-8 right-6 text-white">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <a href="{base}about.html" class="text-2xl font-bold">ABOUT</a>
            <a href="{base}services.html" class="text-2xl font-bold">SERVICES</a>
            <a href="{base}news.html" class="text-2xl font-bold">NEWS</a>
            <a href="{base}contact.html" class="text-2xl font-bold">CONTACT</a>
        </div>
    </nav>

    <main class="pt-32 pb-24">
        <article class="max-w-3xl mx-auto px-6 lg:px-0">
            <header class="mb-16">
                <div class="flex items-center gap-4 mb-6">
                    <time class="text-sm font-mono text-gray-500">{dot}</time>
                    <span class="inline-block px-3 py-1 text-xs font-bold text-white bg-black">{html.escape(a['category'])}</span>
                </div>
                <h1 class="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-8">{html.escape(a['title'])}</h1>
                <p class="text-lg text-gray-600 leading-relaxed border-l-4 border-soichi-yellow pl-5">{html.escape(a['excerpt'])}</p>
            </header>

            <div class="article-body">
            {to_html(a['body'])}
            </div>

            <div class="mt-16 pt-8 border-t border-gray-200">
                {tags}
            </div>

            <div class="mt-16">
                <a href="{base}news.html" class="inline-flex items-center text-lg font-bold hover:underline decoration-2 underline-offset-4">
                    <span class="mr-2">←</span> News 一覧へ
                </a>
            </div>
        </article>

        <section class="py-24 bg-black text-white text-center mt-24">
            <div class="max-w-4xl mx-auto px-4">
                <h2 class="text-3xl md:text-4xl font-bold mb-8">Contact</h2>
                <p class="text-gray-400 mb-10 text-lg">
                    記事の内容についてのご相談、お仕事のご依頼はこちらからお願いいたします。
                </p>
                <a href="{base}contact.html"
                    class="inline-block px-12 py-5 text-lg font-bold text-black bg-soichi-yellow rounded-full hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Contact Us
                </a>
            </div>
        </section>
    </main>

    <footer class="bg-black text-white py-24 px-6 lg:px-12">
        <div class="max-w-7xl mx-auto">
            <div class="grid md:grid-cols-2 gap-16 mb-24">
                <div>
                    <h2 class="text-4xl font-black mb-8">SOICHI</h2>
                    <p class="text-gray-400 font-medium leading-relaxed max-w-md">
                        〒107-0061<br>東京都港区北青山二丁目14番4号
                    </p>
                </div>
                <div class="flex flex-col space-y-6 items-start md:items-end">
                    <a href="{base}about.html" class="text-3xl font-bold hover:text-gray-400 transition-colors">ABOUT</a>
                    <a href="{base}services.html" class="text-3xl font-bold hover:text-gray-400 transition-colors">SERVICES</a>
                    <a href="{base}news.html" class="text-3xl font-bold hover:text-gray-400 transition-colors">NEWS</a>
                    <a href="{base}contact.html" class="text-3xl font-bold hover:text-gray-400 transition-colors">CONTACT</a>
                </div>
            </div>
            <div
                class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <div class="flex flex-col md:flex-row md:space-x-8 items-center mb-4 md:mb-0">
                    <p>&copy; 2025 Soichi, Inc.</p>
                    <a href="{base}privacy.html" class="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="{base}tokushoho.html" class="hover:text-white transition-colors">特定商取引法に基づく表記</a>
                </div>
                <p>Technology x Creative</p>
            </div>
        </div>
    </footer>

    <script>
        const btn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('mobile-menu-close');
        const menu = document.getElementById('mobile-menu');
        btn.addEventListener('click', () => menu.classList.remove('hidden'));
        closeBtn.addEventListener('click', () => menu.classList.add('hidden'));
    </script>
</body>

</html>
"""


def news_item(a: dict) -> str:
    dot = str(a["date"]).replace("-", ".")
    return f"""                <article class="border-t border-gray-200 py-12 fade-up group">
                    <div class="grid md:grid-cols-12 gap-8">
                        <div class="md:col-span-3">
                            <time class="text-sm font-mono text-gray-500">{dot}</time>
                            <div class="mt-2">
                                <span class="inline-block px-3 py-1 text-xs font-bold text-white bg-black">{html.escape(a['category'])}</span>
                            </div>
                        </div>
                        <div class="md:col-span-9">
                            <h2
                                class="text-2xl md:text-3xl font-bold mb-6 leading-tight group-hover:text-gray-600 transition-colors">
                                {html.escape(a['title'])}
                            </h2>
                            <p class="text-gray-600 mb-8 leading-relaxed">
                                {html.escape(a['excerpt'])}
                            </p>
                            <a href="articles/{a['slug']}.html"
                                class="inline-flex items-center text-lg font-bold hover:underline decoration-2 underline-offset-4">
                                READ MORE <span class="ml-2">→</span>
                            </a>
                        </div>
                    </div>
                </article>"""


def main() -> int:
    check = "--check" in sys.argv
    if not SRC.exists():
        sys.exit(f"[中止] {SRC} がありません。")
    arts = sorted((parse(p) for p in SRC.glob("*.md")), key=lambda a: str(a["date"]), reverse=True)
    # 記事が0件でも一覧の中身は組み直す（記事を消したのに一覧に残る事故を防ぐ）

    news = NEWS.read_text(encoding="utf-8")
    if START not in news or END not in news:
        sys.exit(f"[中止] news.html に {START} と {END} の目印がありません。先に入れてください。")
    body = "\n" + "\n\n".join(news_item(a) for a in arts) + "\n                " if arts else "\n                "
    block = START + body + END
    head, rest = news.split(START, 1)
    _, tail = rest.split(END, 1)
    new_news = head + block + tail

    changed = []
    for a in arts:
        page = OUT / f"{a['slug']}.html"
        body = shell(a)
        if not page.exists() or page.read_text(encoding="utf-8") != body:
            changed.append(page.name)
            if not check:
                OUT.mkdir(exist_ok=True)
                page.write_text(body, encoding="utf-8")
    if new_news != news:
        changed.append("news.html")
        if not check:
            NEWS.write_text(new_news, encoding="utf-8")

    print(f"記事 {len(arts)}件。" + (f"更新: {', '.join(changed)}" if changed else "変更なし。"))
    if check and changed:
        print("（--check なので書き込んでいません）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
