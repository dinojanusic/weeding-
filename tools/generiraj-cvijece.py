"""Generator SVG grančica gipsofile (šlajer) — deterministički, po sjemenu.
Kratke stabljike koje se granaju u gusti oblak sitnih bijelih cvjetića."""
import math, random, pathlib

STEM, BUD, CORE, SHADE = '#9aab80', '#c6d0a9', '#e7dcb6', '#e4e0cd'

def defs():
    out = ['<defs>']
    for name, n in (('f5', 5), ('f6', 6)):
        p = [f'<g id="{name}"><circle r="1.05" fill="{SHADE}"/>']
        for i in range(n):
            a = i * math.tau / n
            p.append(f'<circle cx="{math.cos(a)*.5:.2f}" cy="{math.sin(a)*.5:.2f}" r=".58" fill="#fff"/>')
        p.append(f'<circle r=".4" fill="{CORE}" opacity=".8"/></g>')
        out.append(''.join(p))
    out.append(f'<circle id="bd" r="1" fill="{BUD}"/>')
    out.append('</defs>')
    return out

def branch(x, y, ang, length, depth, rnd, stems, tips):
    """Kratka stabljika koja se grana; vrhovi se skupljaju u 'tips'."""
    tx, ty = x + math.cos(ang)*length, y + math.sin(ang)*length
    c = rnd.uniform(-.3, .3)
    mx = (x+tx)/2 + math.cos(ang+math.pi/2)*length*c
    my = (y+ty)/2 + math.sin(ang+math.pi/2)*length*c
    stems.append(f'M{x:.0f} {y:.0f}Q{mx:.0f} {my:.0f} {tx:.0f} {ty:.0f}')
    if depth <= 0:
        tips.append((tx, ty))
        return
    for i in range(rnd.randint(2, 3)):
        side = 1 if i % 2 else -1
        branch(tx, ty, ang + side*rnd.uniform(.35, .85) + rnd.uniform(-.15, .15),
               length*rnd.uniform(.5, .72), depth-1, rnd, stems, tips)

def cluster(x, y, ang, n, length, rnd, stems, tips, scale=1.0):
    for _ in range(n):
        branch(x, y, ang + rnd.uniform(-.7, .7), length*rnd.uniform(.8, 1.2), 3, rnd, stems, tips)

def bloom(tips, rnd, out, rmin=3.4, rmax=6.4):
    """Cvjetić na svakom vrhu + nekoliko satelita, da nastane gusti oblak."""
    for (tx, ty) in tips:
        r = rnd.uniform(rmin, rmax)
        if rnd.random() < .9:
            out.append(f'<use href="#{rnd.choice(("f5","f5","f6"))}" '
                       f'transform="translate({tx:.0f} {ty:.0f}) scale({r:.1f})"/>')
        else:
            out.append(f'<use href="#bd" transform="translate({tx:.0f} {ty:.0f}) scale({r*.45:.1f})"/>')
        for _ in range(rnd.randint(1, 3)):
            a, d = rnd.uniform(0, math.tau), rnd.uniform(5, 16)
            out.append(f'<use href="#{rnd.choice(("f5","f6"))}" '
                       f'transform="translate({tx+math.cos(a)*d:.0f} {ty+math.sin(a)*d:.0f}) '
                       f'scale({rnd.uniform(2.2, 4.4):.1f})"/>')

def svg(w, h, stems, flowers):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'fill="none">' + ''.join(defs()) +
            f'<path d="{"".join(stems)}" stroke="{STEM}" stroke-width="1.1" stroke-linecap="round" '
            f'opacity=".48"/><g>' + ''.join(flowers) + '</g></svg>\n')

def side_piece(seed, w=240, h=820):
    rnd = random.Random(seed); stems, tips = [], []
    for by in (h*.06, h*.30, h*.54, h*.80):
        cluster(-10, by, rnd.uniform(-.45, .45), 3, 95, rnd, stems, tips)
        cluster(25, by + h*.11, rnd.uniform(-.5, .5), 2, 80, rnd, stems, tips)
    cluster(-12, h-4, -1.1, 2, 80, rnd, stems, tips)
    cluster(-12, 4, 1.1, 2, 80, rnd, stems, tips)
    out = []; bloom(tips, rnd, out)
    return svg(w, h, stems, out)

def corner_piece(seed, w=480, h=380):
    rnd = random.Random(seed); stems, tips = [], []
    cluster(-15, -15, .72, 4, 120, rnd, stems, tips)
    cluster(90, -25, 1.1, 3, 105, rnd, stems, tips)
    cluster(-25, 70, .2, 3, 100, rnd, stems, tips)
    out = []; bloom(tips, rnd, out)
    return svg(w, h, stems, out)

d = pathlib.Path('assets/img')
(d/'cvijece-rub.svg').write_text(side_piece(11), encoding='utf-8')
(d/'cvijece-kut.svg').write_text(corner_piece(23), encoding='utf-8')
(d/'cvijece-kut2.svg').write_text(corner_piece(47), encoding='utf-8')
for f in ('cvijece-rub.svg','cvijece-kut.svg','cvijece-kut2.svg'):
    print(f, round((d/f).stat().st_size/1024, 1), 'KB')
