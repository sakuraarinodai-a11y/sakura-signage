"""
サクラ整骨院 デジタルサイネージ用動画生成スクリプト
Python + Pillow + imageio-ffmpeg で MP4 を生成
"""
import os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

# ── 設定 ────────────────────────────────────────────────────────
W, H = 1280, 720
FPS = 24
SECS = 8
FRAMES = FPS * SECS
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "videos")
os.makedirs(OUT_DIR, exist_ok=True)

FONT_PATH     = "C:/Windows/Fonts/NotoSansJP-VF.ttf"
FONT_PATH_B   = "C:/Windows/Fonts/YuGothB.ttc"

def load_font(size, bold=False):
    try:
        return ImageFont.truetype(FONT_PATH_B if bold else FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()

def lerp(a, b, t):
    return a + (b - a) * t

def lerp_color(c1, c2, t):
    return tuple(int(lerp(c1[i], c2[i], t)) for i in range(3))

def ease_in_out(t):
    return t * t * (3 - 2 * t)

def gradient_bg(draw, color_top, color_bot):
    for y in range(H):
        t = y / H
        c = lerp_color(color_top, color_bot, ease_in_out(t))
        draw.line([(0, y), (W, y)], fill=c)

def overlay_text(draw, text, x, y, size, color, bold=False, alpha_mul=1.0, center=False):
    font = load_font(size, bold)
    if center:
        bbox = font.getbbox(text)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
    r, g, b = color
    a = int(255 * alpha_mul)
    draw.text((x, y), text, font=font, fill=(r, g, b, a))

def save_video(frames, name):
    path = os.path.join(OUT_DIR, name)
    writer = imageio.get_writer(path, fps=FPS, codec="libx264",
                                 output_params=["-pix_fmt", "yuv420p", "-crf", "23"])
    for f in frames:
        writer.append_data(np.array(f.convert("RGB")))
    writer.close()
    print(f"  ✅ 保存: {name} ({len(frames)}フレーム)")

# ════════════════════════════════════════════════════════════════
# 01. hero.mp4 — 桜メインビジュアル
# ════════════════════════════════════════════════════════════════
def make_hero():
    print("🌸 hero.mp4 生成中...")
    rng = random.Random(42)
    petals = [{"x": rng.randint(0, W), "y": rng.randint(-H, 0),
               "vx": rng.uniform(-1.5, 1.5), "vy": rng.uniform(2.5, 5.5),
               "r": rng.randint(8, 18), "rot": rng.uniform(0, 360),
               "alpha": rng.uniform(0.4, 0.9)} for _ in range(60)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        # 背景：深紫→濃いピンク→深紫 サイクル
        ct = (math.sin(t * math.pi * 2) + 1) / 2
        top = lerp_color((45, 20, 80), (100, 10, 60), ct)
        bot = lerp_color((20, 5, 45), (60, 5, 40), ct)
        gradient_bg(draw, top, bot)
        # 桜の花びら
        for p in petals:
            px = (p["x"] + p["vx"] * fi) % (W + 40) - 20
            py = (p["y"] + p["vy"] * fi) % (H + 40) - 20
            rot = (p["rot"] + fi * 2) % 360
            a = int(255 * p["alpha"])
            r = p["r"]
            # 花びら（楕円）を回転
            petal_img = Image.new("RGBA", (r*4, r*4), (0,0,0,0))
            pd = ImageDraw.Draw(petal_img)
            pd.ellipse([r//2, r, r*3 + r//2, r*3], fill=(255, 180, 200, a))
            petal_img = petal_img.rotate(rot, expand=False)
            img.paste(petal_img, (int(px)-r*2, int(py)-r*2), petal_img)
        # テキスト（フェードイン）
        text_alpha = min(1.0, (t - 0.2) / 0.4) if t > 0.2 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "サクラ整骨院", 0, 260, 96, (255, 220, 240), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "神戸市北区  ／  LINE予約受付中", 0, 380, 38, (255, 190, 210),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "hero.mp4")

# ════════════════════════════════════════════════════════════════
# 02. morning.mp4 — 朝の散歩向け（8-9時）
# ════════════════════════════════════════════════════════════════
def make_morning():
    print("🌅 morning.mp4 生成中...")
    rng = random.Random(7)
    sparkles = [{"x": rng.randint(0, W), "y": rng.randint(0, H),
                 "phase": rng.uniform(0, math.pi*2), "size": rng.randint(3,10)} for _ in range(40)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        # 夜明けオレンジ→黄金グラジェント
        top = lerp_color((200, 80, 20), (255, 160, 50), t)
        bot = lerp_color((120, 40, 10), (200, 100, 30), t)
        gradient_bg(draw, top, bot)
        # 太陽の光（中央下から広がる）
        cx, cy = W // 2, H + 100
        for r in range(300, 0, -30):
            alpha = int(40 * (1 - r/300) * (0.3 + 0.7 * t))
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(255, 200, 80, alpha))
        # 光のきらめき
        for sp in sparkles:
            bri = (math.sin(fi * 0.15 + sp["phase"]) + 1) / 2
            s = sp["size"]
            a = int(180 * bri)
            draw.ellipse([sp["x"]-s, sp["y"]-s, sp["x"]+s, sp["y"]+s],
                         fill=(255, 240, 180, a))
        # テキスト
        text_alpha = min(1.0, (t - 0.15) / 0.3) if t > 0.15 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "朝の散歩帰りに", 0, 230, 80, (255, 250, 220), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "体をリセット  ─  サクラ整骨院", 0, 340, 44, (255, 230, 180),
                         alpha_mul=text_alpha * 0.85, center=True)
        frames.append(img)
    save_video(frames, "morning.mp4")

# ════════════════════════════════════════════════════════════════
# 03. oxygen.mp4 — 酸素カプセル
# ════════════════════════════════════════════════════════════════
def make_oxygen():
    print("🫁 oxygen.mp4 生成中...")
    rng = random.Random(13)
    bubbles = [{"x": rng.randint(0, W), "y": rng.randint(H, H*2),
                "vy": rng.uniform(1.5, 4.0), "r": rng.randint(4, 20),
                "alpha": rng.uniform(0.3, 0.7)} for _ in range(80)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        ct = (math.sin(t * math.pi) + 1) / 2
        top = lerp_color((0, 10, 40), (0, 30, 80), ct)
        bot = lerp_color((0, 20, 60), (0, 60, 120), ct)
        gradient_bg(draw, top, bot)
        # 酸素の泡
        for b in bubbles:
            by = (b["y"] - b["vy"] * fi) % (H + 100)
            bx = b["x"] + math.sin(fi * 0.05 + b["y"]) * 15
            r = b["r"]
            a = int(255 * b["alpha"])
            draw.ellipse([bx-r, by-r, bx+r, by+r], outline=(100, 200, 255, a), width=2)
            draw.ellipse([bx-r+3, by-r+3, bx-r+7, by-r+7], fill=(200, 240, 255, a//2))
        # 中央の光
        glow_r = int(150 + 50 * math.sin(t * math.pi * 2))
        cx, cy = W//2, H//2
        for r in range(glow_r, 0, -20):
            a = int(30 * (1 - r/glow_r))
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(80, 160, 255, a))
        text_alpha = min(1.0, (t - 0.2) / 0.35) if t > 0.2 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "酸素カプセル", 0, 240, 88, (160, 220, 255), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "1時間  ＝  睡眠3時間分の疲労回復", 0, 355, 42, (120, 200, 255),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "oxygen.mp4")

# ════════════════════════════════════════════════════════════════
# 04. treatment.mp4 — 施術・癒しのイメージ
# ════════════════════════════════════════════════════════════════
def make_treatment():
    print("💆 treatment.mp4 生成中...")
    rng = random.Random(99)
    particles = [{"x": rng.randint(0, W), "y": rng.randint(0, H),
                  "vx": rng.uniform(-0.5, 0.5), "vy": rng.uniform(-1.0, -0.2),
                  "size": rng.randint(2, 8), "phase": rng.uniform(0, math.pi*2)} for _ in range(50)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        # 深紫→青紫グラジェント
        ct = ease_in_out((math.sin(t * math.pi * 1.5) + 1) / 2)
        top = lerp_color((20, 5, 50), (40, 15, 80), ct)
        bot = lerp_color((60, 10, 90), (90, 20, 130), ct)
        gradient_bg(draw, top, bot)
        # 波紋（中央から広がる）
        for n in range(4):
            phase = t * 3 + n * 0.8
            r = int((phase % 1.5) / 1.5 * 400)
            a = int(60 * (1 - (phase % 1.5) / 1.5))
            if a > 5:
                cx, cy = W//2, H//2
                draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=(200, 150, 255, a), width=2)
        # 光の粒子
        for p in particles:
            px = (p["x"] + p["vx"] * fi) % W
            py = (p["y"] + p["vy"] * fi) % H
            bri = (math.sin(fi * 0.1 + p["phase"]) + 1) / 2
            s = p["size"]
            a = int(180 * bri)
            draw.ellipse([px-s, py-s, px+s, py+s], fill=(220, 180, 255, a))
        text_alpha = min(1.0, (t - 0.2) / 0.35) if t > 0.2 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "体の痛みを、根本から", 0, 240, 76, (230, 200, 255), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "サクラ整骨院  ─  神戸市北区", 0, 345, 44, (200, 170, 255),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "treatment.mp4")

# ════════════════════════════════════════════════════════════════
# 05. postnatal.mp4 — 産後骨盤矯正
# ════════════════════════════════════════════════════════════════
def make_postnatal():
    print("🤱 postnatal.mp4 生成中...")
    rng = random.Random(55)
    petals = [{"x": rng.randint(0, W), "y": rng.randint(-H, 0),
               "vx": rng.uniform(-1.0, 1.0), "vy": rng.uniform(1.5, 3.5),
               "r": rng.randint(5, 14), "phase": rng.uniform(0, math.pi*2)} for _ in range(45)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        ct = ease_in_out(t)
        top = lerp_color((60, 10, 40), (100, 20, 70), ct)
        bot = lerp_color((30, 5, 25), (60, 10, 45), ct)
        gradient_bg(draw, top, bot)
        # 優しいピンクの光の輪
        cx, cy = W//2, H//2 + 50
        for r in range(250, 0, -25):
            a = int(25 * (1 - r/250) * (0.5 + 0.5*math.sin(t*math.pi*2)))
            draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(255, 160, 180, a))
        # 花びら
        for p in petals:
            px = (p["x"] + p["vx"] * fi + math.sin(fi*0.05+p["phase"])*20) % (W+20)
            py = (p["y"] + p["vy"] * fi) % (H+20)
            r = p["r"]
            a = int(200 * (0.5 + 0.5*math.sin(fi*0.08+p["phase"])))
            draw.ellipse([px-r, py-r*1.6, px+r, py+r*1.6], fill=(255, 190, 210, a))
        text_alpha = min(1.0, (t - 0.2) / 0.35) if t > 0.2 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "産後骨盤矯正", 0, 230, 88, (255, 210, 230), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "産後6ヶ月がゴールデンタイム", 0, 345, 48, (255, 185, 210),
                         alpha_mul=text_alpha * 0.85, center=True)
        frames.append(img)
    save_video(frames, "postnatal.mp4")

# ════════════════════════════════════════════════════════════════
# 06. night.mp4 — 夜・LINE予約
# ════════════════════════════════════════════════════════════════
def make_night():
    print("🌙 night.mp4 生成中...")
    rng = random.Random(21)
    stars = [{"x": rng.randint(0, W), "y": rng.randint(0, H*2//3),
              "size": rng.choice([1,1,1,2,3]), "phase": rng.uniform(0, math.pi*2)} for _ in range(120)]
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        top = lerp_color((5, 5, 20), (10, 8, 35), ease_in_out(t))
        bot = lerp_color((15, 10, 40), (25, 15, 60), ease_in_out(t))
        gradient_bg(draw, top, bot)
        # 星のきらめき
        for s in stars:
            bri = (math.sin(fi * 0.12 + s["phase"]) + 1) / 2
            a = int(220 * bri)
            sz = s["size"]
            draw.ellipse([s["x"]-sz, s["y"]-sz, s["x"]+sz, s["y"]+sz],
                         fill=(220, 230, 255, a))
        # 月（右上）
        mx, my = W - 160, 120
        for r in range(80, 0, -10):
            a = int(30 * (1 - r/80))
            draw.ellipse([mx-r, my-r, mx+r, my+r], fill=(255, 240, 180, a))
        draw.ellipse([mx-45, my-45, mx+45, my+45], fill=(255, 245, 200, 200))
        # LINE緑の光
        lx, ly = W//2, H - 80
        for r in range(120, 0, -15):
            a = int(20 * (1 - r/120) * (0.4 + 0.6*math.sin(t*math.pi*3)))
            draw.ellipse([lx-r, ly-r, lx+r, ly+r], fill=(6, 199, 85, a))
        text_alpha = min(1.0, (t - 0.15) / 0.3) if t > 0.15 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "24時間  LINE予約受付中", 0, 230, 72, (160, 255, 180), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "深夜のご予約も翌朝すぐ確認  ─  @520myepf", 0, 330, 38, (120, 220, 150),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "night.mp4")

# ════════════════════════════════════════════════════════════════
# 07. accident.mp4 — 交通事故治療
# ════════════════════════════════════════════════════════════════
def make_accident():
    print("🚗 accident.mp4 生成中...")
    rng = random.Random(77)
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        # 暗赤→希望の光へのグラジェント遷移
        tr = ease_in_out(t)
        top = lerp_color((40, 5, 5), (10, 20, 40), tr)
        bot = lerp_color((20, 3, 3), (5, 15, 30), tr)
        gradient_bg(draw, top, bot)
        # 希望の光（右側から入ってくる）
        lx = int(W * (0.3 + 0.7 * ease_in_out(t)))
        for r in range(300, 0, -30):
            a = int(35 * (1 - r/300) * t)
            draw.ellipse([lx-r, H//2-r, lx+r, H//2+r], fill=(255, 200, 100, a))
        text_alpha = min(1.0, (t - 0.25) / 0.35) if t > 0.25 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "交通事故治療  負担0円", 0, 235, 80, (255, 220, 120), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "自損事故の同乗者も対象  ─  お気軽にご相談を", 0, 345, 40, (255, 200, 100),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "accident.mp4")

# ════════════════════════════════════════════════════════════════
# 08. ems.mp4 — 楽トレ EMS
# ════════════════════════════════════════════════════════════════
def make_ems():
    print("⚡ ems.mp4 生成中...")
    rng = random.Random(33)
    frames = []
    for fi in range(FRAMES):
        t = fi / FRAMES
        img = Image.new("RGBA", (W, H))
        draw = ImageDraw.Draw(img)
        top = lerp_color((0, 20, 5), (0, 40, 10), ease_in_out(t))
        bot = lerp_color((0, 10, 3), (0, 25, 8), ease_in_out(t))
        gradient_bg(draw, top, bot)
        # 電気パルスの波形
        pulse = (math.sin(fi * 0.4) + 1) / 2
        for i in range(8):
            py = 100 + i * 70
            amplitude = int(30 * pulse)
            pts = []
            for x in range(0, W, 4):
                wave = math.sin(x * 0.04 + fi * 0.3 + i * 0.8) * amplitude
                pts.append((x, py + int(wave)))
            if len(pts) > 1:
                a = int(100 + 100 * pulse)
                draw.line(pts, fill=(80, 255, 150, a), width=2)
        # 電撃エフェクト
        if fi % 8 < 2:
            for _ in range(3):
                sx, sy = rng.randint(W//3, W*2//3), rng.randint(H//4, H*3//4)
                for _ in range(5):
                    ex = sx + rng.randint(-60, 60)
                    ey = sy + rng.randint(-60, 60)
                    draw.line([(sx, sy), (ex, ey)], fill=(150, 255, 100, 180), width=1)
                    sx, sy = ex, ey
        text_alpha = min(1.0, (t - 0.2) / 0.35) if t > 0.2 else 0.0
        if text_alpha > 0:
            overlay_text(draw, "楽トレ EMS", 0, 235, 92, (100, 255, 160), bold=True,
                         alpha_mul=text_alpha, center=True)
            overlay_text(draw, "30分で9,000回の筋収縮  ─  寝たまま体幹強化", 0, 350, 40, (80, 230, 140),
                         alpha_mul=text_alpha * 0.8, center=True)
        frames.append(img)
    save_video(frames, "ems.mp4")

# ════════════════════════════════════════════════════════════════
# メイン実行
# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print(f"\n🎬 サクラ整骨院 動画生成開始 ({W}x{H} / {FPS}fps / {SECS}秒)\n")
    make_hero()
    make_morning()
    make_oxygen()
    make_treatment()
    make_postnatal()
    make_night()
    make_accident()
    make_ems()
    print(f"\n✨ 全動画生成完了 → {OUT_DIR}\n")
