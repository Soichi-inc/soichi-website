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
    """Use the production News shell; retain the established Markdown authoring flow."""
    template = NEWS.read_text(encoding="utf-8")
    title = html.escape(a["title"])
    dot = html.escape(str(a["date"]).replace("-", "."))
    body = re.sub(r' class="[^"]*"', '', to_html(a["body"]))
    main = (f'<article class="article-page"><a class="eyebrow" href="/news.html">← ALL NEWS</a>'
            f'<p class="article-date">{dot} / {html.escape(a["category"])}</p>'
            f'<h1>{title}</h1><div class="prose">{body}</div></article>')
    template = re.sub(r'<main id="main">[\s\S]*?</main>', lambda _: '<main id="main">' + main + '</main>', template)
    template = re.sub(r'<title>[\s\S]*?</title>', lambda _: f'<title>{title} — Soichi</title>', template)
    template = re.sub(r'<link rel="canonical"[^>]+>', lambda _: f'<link rel="canonical" href="https://soichi.tokyo/articles/{a["slug"]}.html">', template)
    return template.replace('</head>', f'<meta name="description" content="{html.escape(a["excerpt"], quote=True)}"></head>')


def news_item(a: dict) -> str:
    dot = html.escape(str(a["date"]).replace("-", "."))
    return (f'<article class="news-row"><div><time>{dot}</time><small>{html.escape(a["category"])}</small></div>'
            f'<div><h3>{html.escape(a["title"])}</h3><p>{html.escape(a["excerpt"])}</p>'
            f'<a class="text-link" href="/articles/{a["slug"]}.html"><span>READ MORE</span>'
            '<span class="arrow" aria-hidden="true">↗</span></a></div></article>')


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
