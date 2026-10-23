from PIL import Image, ImageDraw
from pathlib import Path
P = Path(__file__).resolve().parents[1] / "assets"
P.mkdir(exist_ok=True)

def logo(size, bg=(15,15,17,255)):
    im=Image.new("RGBA",(size,size),bg)
    d=ImageDraw.Draw(im)
    s=size/100
    def box(coords, radius, fill):
        d.rounded_rectangle(tuple(int(v*s) for v in coords), radius=int(radius*s), fill=fill)
    box((8,8,92,92),24,(229,9,20,255))
    box((27,19,73,81),7,(255,255,255,255))
    # checklist strokes
    d.line([(int(38*s),int(36*s)),(int(43*s),int(41*s)),(int(52*s),int(31*s))],fill=(229,9,20,255),width=max(2,int(5*s)))
    d.line([(int(38*s),int(52*s)),(int(43*s),int(57*s)),(int(52*s),int(47*s))],fill=(229,9,20,255),width=max(2,int(5*s)))
    d.line([(int(57*s),int(36*s)),(int(64*s),int(36*s))],fill=(24,24,27,255),width=max(2,int(4*s)))
    d.line([(int(57*s),int(52*s)),(int(64*s),int(52*s))],fill=(24,24,27,255),width=max(2,int(4*s)))
    d.ellipse((int(51*s),int(53*s),int(81*s),int(83*s)),fill=(24,24,27,255))
    d.line([(int(58*s),int(68*s)),(int(64*s),int(74*s)),(int(75*s),int(61*s))],fill=(255,46,77,255),width=max(2,int(5*s)))
    return im

logo(1024).save(P/"icon.png")
logo(1024).save(P/"adaptive-icon.png")
logo(512).save(P/"splash.png")
logo(96).save(P/"notification-icon.png")
print("Assets gerados em", P)
