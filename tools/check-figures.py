#!/usr/bin/env python3
"""Check figure SVGs against the standard in CLAUDE.md ("Figure standard").

Usage:
    python3 tools/check-figures.py some-figure.sql        # check one file
    python3 tools/check-figures.py *.sql                  # check many
    cat fig.svg | python3 tools/check-figures.py -        # check a raw SVG

Exits non-zero if any figure fails, so it can gate a change. Renderers silently
drop unparseable SVG, so "it vanished" is the failure this catches earliest.
"""
import re
import sys
import glob
from xml.dom.minidom import parseString

CANVAS_W = 320.0
RENDER_W = 340.0   # what the renderers cap a figure's width at, in px
MIN_FONT = 12.0    # minimum readable text size ON SCREEN, in px
RETIRED = ['#11302a', '#1a1208', '#5d685f', '#e5e0d5', '#fbf9f3', '#334155', '#475569']
ALLOWED = ['#1f2933', '#52606d', '#0f766e', '#d3f0ec', '#ffffff', '#fff']


def figures_from(text):
    """Pull SVGs out of a .sql file ($svg$...$svg$ or '...') or take raw SVG."""
    hits = re.findall(r"(?:\$svg\$|')(<svg.*?</svg>)(?:\$svg\$|')", text, re.S)
    if hits:
        return hits
    t = text.strip()
    return [t] if t[:4].lower() == '<svg' else []


def check(svg):
    errs = []

    # Parses as XML — renderers reject anything that doesn't.
    try:
        parseString(svg)
    except Exception as e:
        return ['does not parse as XML (renderers will silently drop it): %s' % e]

    open_tag = re.search(r'<svg[^>]*>', svg).group(0)

    # Canvas
    vb = re.search(r'viewBox="([\d.\-]+) ([\d.\-]+) ([\d.]+) ([\d.]+)"', open_tag)
    if not vb:
        errs.append('no viewBox')
    else:
        w, h = float(vb.group(3)), float(vb.group(4))
        if w != CANVAS_W:
            errs.append('viewBox width is %g, must be %g (else text renders at the '
                        'wrong size; grow taller, not wider)' % (w, CANVAS_W))
        # width/height attrs must exist and match the viewBox
        aw = re.search(r'<svg[^>]*\swidth="([\d.]+)"', open_tag)
        ah = re.search(r'<svg[^>]*\sheight="([\d.]+)"', open_tag)
        if not aw or not ah:
            errs.append('missing width/height on <svg> (collapses where CSS does not '
                        'reach — this is the Bagmati Q11 bug)')
        else:
            if float(aw.group(1)) != w or float(ah.group(1)) != h:
                errs.append('width/height (%s x %s) do not match viewBox (%g x %g)'
                            % (aw.group(1), ah.group(1), w, h))

    # Root attributes
    if 'xmlns=' not in open_tag:
        errs.append('missing xmlns')
    if 'role="img"' not in open_tag:
        errs.append('missing role="img"')
    # Only matters if the figure actually has Devanagari in it.
    if re.search(r'[ऀ-ॿ]', svg) and 'Noto Sans Devanagari' not in open_tag:
        errs.append('has Nepali labels but font-family omits Noto Sans Devanagari')
    if '<title>' not in svg:
        errs.append('missing <title>')
    if '<desc>' not in svg:
        errs.append('missing <desc>')

    # Palette
    for c in sorted(set(re.findall(r'#[0-9a-fA-F]{3,6}', svg))):
        if c.lower() in RETIRED:
            errs.append('retired palette colour %s (use #1f2933 ink / #52606d muted / '
                        '#0f766e teal / #d3f0ec fill)' % c)
        elif c.lower() not in ALLOWED:
            errs.append('off-palette colour %s' % c)

    # Legibility — what matters is the size ON SCREEN, which depends on how much
    # the canvas is scaled to fit the ~340px render cap. font-size 13 on a 640-wide
    # canvas lands at ~7px (unreadable); font-size 10 on a 170-wide canvas is ~20px.
    if vb:
        scale = RENDER_W / float(vb.group(3))
        sizes = [float(f) for f in re.findall(r'font-size="([\d.]+)"', svg)]
        if sizes:
            smallest = min(sizes)
            on_screen = smallest * scale
            if on_screen < MIN_FONT:
                errs.append('smallest text renders at ~%.1fpx on screen (font-size %g on a '
                            '%g-wide canvas) — below the %gpx minimum, unreadable on a phone'
                            % (on_screen, smallest, float(vb.group(3)), MIN_FONT))

    # IDs collide across figures on one page
    if re.search(r'\sid="', svg):
        errs.append('uses id= (IDs are page-global and can collide with another '
                    'figure — draw arrowheads as <polyline> instead)')
    for tag in ('<defs', '<marker', '<script', '<foreignObject', '<image'):
        if tag in svg:
            errs.append('contains %s> — not allowed' % tag)
    if re.search(r'(href|src)="(https?:)?//', svg):
        errs.append('references an external URL (blocked by the CSP)')

    return errs


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2

    if args == ['-']:
        sources = [('<stdin>', sys.stdin.read())]
    else:
        paths = []
        for a in args:
            paths.extend(glob.glob(a))
        sources = [(p, open(p, encoding='utf-8', errors='replace').read()) for p in paths]

    total = failed = 0
    for name, text in sources:
        figs = figures_from(text)
        for i, svg in enumerate(figs):
            total += 1
            errs = check(svg)
            label = '%s%s' % (name, (' [figure %d]' % (i + 1)) if len(figs) > 1 else '')
            if errs:
                failed += 1
                print('FAIL  %s' % label)
                for e in errs:
                    print('        - %s' % e)
            else:
                print('ok    %s' % label)

    print('\n%d figure(s) checked, %d passed, %d failed' % (total, total - failed, failed))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
