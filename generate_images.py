# -*- coding: utf-8 -*-
"""
サクラ整骨院 デジタルサイネージ用 サービスイメージ画像生成スクリプト
Pillow のみ使用（外部依存なし）
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1280, 720
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
os.makedirs(OUT_DIR, exist_ok=True)

# ── フォント読み込み ──────────────────────────────────────────────────────
def load_font(size):
    for path in [
        "C:/Windows/Fonts/YuGothB.ttc",
        "C:/Windows/Fonts/YuGothic.ttf",
        "C:/Windows/Fonts/meiryo.ttc",
        "C:/Windows/Fonts/NotoSansJP-VF.ttf",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

# ── グラデーション背景ヘルパー ────────────────────────────────────────────
def make_gradient(color1, color2, direction="diagonal"):
    """2色グラデーション背景を生成"""
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        for x in range(W):
            if direction == "diagonal":
                t = (x / W * 0.5 + y / H * 0.5)
            elif direction == "vertical":
                t = y / H
            elif direction == "horizontal":
                t = x / W
            elif direction == "radial":
                cx, cy = W / 2, H / 2
                d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                t = min(d / (math.sqrt(cx ** 2 + cy ** 2)), 1.0)
            else:
                t = y / H
            r = int(color1[0] * (1 - t) + color2[0] * t)
            g = int(color1[1] * (1 - t) + color2[1] * t)
            b = int(color1[2] * (1 - t) + color2[2] * t)
            draw.point((x, y), fill=(r, g, b))
    return img


def make_gradient_fast(color1, color2, direction="vertical"):
    """高速グラデーション（行単位）"""
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    if direction == "vertical":
        for y in range(H):
            t = y / H
            r = int(color1[0] * (1 - t) + color2[0] * t)
            g = int(color1[1] * (1 - t) + color2[1] * t)
            b = int(color1[2] * (1 - t) + color2[2] * t)
            draw.line([(0, y), (W, y)], fill=(r, g, b))
    elif direction == "horizontal":
        for x in range(W):
            t = x / W
            r = int(color1[0] * (1 - t) + color2[0] * t)
            g = int(color1[1] * (1 - t) + color2[1] * t)
            b = int(color1[2] * (1 - t) + color2[2] * t)
            draw.line([(x, 0), (x, H)], fill=(r, g, b))
    return img


def add_circles(img, circles):
    """装飾的な円を追加"""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for (cx, cy, r, color, alpha) in circles:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, alpha))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    return img.convert("RGB")


def add_text_center(draw, text, y, font, fill=(255, 255, 255), shadow=True):
    """中央揃えテキスト（影付き）"""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    if shadow:
        draw.text((x + 3, y + 3), text, font=font, fill=(0, 0, 0, 80))
    draw.text((x, y), text, font=font, fill=fill)


def add_overlay_rect(img, alpha=120):
    """半透明オーバーレイ（テキスト可読性向上）"""
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle([0, H // 2 - 20, W, H], fill=(0, 0, 0, alpha))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    return img.convert("RGB")


# ── 各サービス画像 ────────────────────────────────────────────────────────

def make_hero():
    """桜メイン – hero.png"""
    img = make_gradient_fast((255, 182, 193), (255, 105, 180), "vertical")
    img = add_circles(img, [
        (200, 150, 180, (255, 255, 255), 30),
        (900, 100, 250, (255, 220, 230), 40),
        (1100, 500, 200, (255, 160, 200), 35),
        (150, 550, 160, (255, 230, 240), 45),
        (640, 360, 300, (255, 255, 255), 20),
    ])
    # 桜の花びら模様（円）
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    petals = [
        (300, 200), (500, 80), (750, 130), (950, 250),
        (1050, 400), (820, 580), (450, 600), (200, 450),
    ]
    for (px, py) in petals:
        for i in range(5):
            ang = i * 72 * math.pi / 180
            ex, ey = px + math.cos(ang) * 25, py + math.sin(ang) * 25
            d.ellipse([ex - 15, ey - 20, ex + 15, ey + 20], fill=(255, 255, 255, 60))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")

    draw = ImageDraw.Draw(img)
    font_l = load_font(72)
    font_m = load_font(42)
    font_s = load_font(32)
    add_text_center(draw, "サクラ整骨院", 200, font_l, fill=(255, 255, 255))
    add_text_center(draw, "神戸市北区の整骨院", 310, font_m, fill=(255, 240, 245))
    add_text_center(draw, "体の痛み・歪みをプロが丁寧に改善します", 390, font_s, fill=(255, 230, 240))
    # 下部バー
    draw.rectangle([0, H - 80, W, H], fill=(220, 50, 100))
    add_text_center(draw, "保険診療対応  ●  予約優先  ●  平日・土曜診療", H - 60, load_font(28), fill=(255, 255, 255))
    img.save(os.path.join(OUT_DIR, "hero.png"), "PNG")
    print("hero.png 生成完了")


def make_treatment():
    """施術イメージ – treatment.png"""
    img = make_gradient_fast((100, 60, 120), (180, 100, 160), "vertical")
    img = add_circles(img, [
        (200, 200, 200, (150, 80, 180), 50),
        (1000, 400, 250, (120, 60, 150), 60),
        (640, 100, 150, (200, 150, 220), 30),
    ])
    draw = ImageDraw.Draw(img)
    # 手のひら・施術イメージの幾何学模様
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # 流れる曲線
    for i in range(8):
        y_base = 100 + i * 70
        d.arc([100, y_base - 50, 500, y_base + 50], start=180, end=360, fill=(255, 255, 255, 25), width=3)
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(70)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "整骨院の施術", 180, font_l, fill=(255, 230, 255))
    add_text_center(draw, "国家資格者による本格施術", 290, font_m, fill=(220, 200, 255))
    add_text_center(draw, "肩こり・腰痛・関節痛・慢性痛", 370, font_s, fill=(200, 180, 240))
    add_text_center(draw, "ひとりひとりの体に合わせた丁寧なケアをご提供", 430, font_s, fill=(200, 180, 240))
    draw.rectangle([0, H - 80, W, H], fill=(80, 40, 100))
    add_text_center(draw, "初回お試し  ●  保険診療対応  ●  完全予約制", H - 60, load_font(28), fill=(255, 220, 255))
    img.save(os.path.join(OUT_DIR, "treatment.png"), "PNG")
    print("treatment.png 生成完了")


def make_postnatal():
    """産後骨盤矯正 – postnatal.png"""
    img = make_gradient_fast((255, 210, 210), (255, 160, 180), "vertical")
    img = add_circles(img, [
        (300, 150, 220, (255, 255, 255), 40),
        (1000, 300, 280, (255, 200, 210), 50),
        (640, 580, 180, (255, 255, 255), 35),
    ])
    draw = ImageDraw.Draw(img)
    # ハート形
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    hearts = [(200, 100), (1050, 200), (100, 450), (1150, 500)]
    for (hx, hy) in hearts:
        d.ellipse([hx - 25, hy - 15, hx + 5, hy + 20], fill=(255, 100, 120, 40))
        d.ellipse([hx - 5, hy - 15, hx + 25, hy + 20], fill=(255, 100, 120, 40))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(68)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "産後骨盤矯正", 170, font_l, fill=(180, 60, 80))
    add_text_center(draw, "ゆがんだ骨盤をやさしく正します", 280, font_m, fill=(160, 50, 70))
    add_text_center(draw, "産後の体形戻し・腰痛・尿もれ・冷えに効果的", 360, font_s, fill=(160, 60, 80))
    add_text_center(draw, "産後2ヶ月〜1年が施術の黄金期です", 415, font_s, fill=(160, 60, 80))
    draw.rectangle([0, H - 80, W, H], fill=(200, 80, 100))
    add_text_center(draw, "赤ちゃん連れOK  ●  授乳スペースあり  ●  女性スタッフ対応", H - 60, load_font(26), fill=(255, 255, 255))
    img.save(os.path.join(OUT_DIR, "postnatal.png"), "PNG")
    print("postnatal.png 生成完了")


def make_oxygen():
    """酸素カプセル – oxygen.png"""
    img = make_gradient_fast((10, 20, 60), (20, 80, 160), "vertical")
    img = add_circles(img, [
        (640, 360, 300, (30, 120, 255), 40),
        (200, 200, 150, (50, 150, 255), 30),
        (1000, 200, 200, (20, 100, 220), 35),
        (300, 500, 180, (40, 130, 255), 25),
        (900, 500, 160, (60, 160, 255), 30),
    ])
    # 光の粒子
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    import random
    random.seed(42)
    for _ in range(120):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.randint(2, 8)
        alpha = random.randint(80, 200)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(150, 220, 255, alpha))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(68)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "酸素カプセル", 170, font_l, fill=(100, 220, 255))
    add_text_center(draw, "高濃度酸素で細胞を活性化", 280, font_m, fill=(150, 230, 255))
    add_text_center(draw, "疲労回復・肌荒れ・集中力アップ・免疫強化", 360, font_s, fill=(120, 210, 255))
    add_text_center(draw, "45分の施術で体の中から元気になります", 415, font_s, fill=(120, 210, 255))
    draw.rectangle([0, H - 80, W, H], fill=(10, 60, 140))
    add_text_center(draw, "スポーツ選手も愛用  ●  完全個室  ●  着替え不要", H - 60, load_font(28), fill=(150, 220, 255))
    img.save(os.path.join(OUT_DIR, "oxygen.png"), "PNG")
    print("oxygen.png 生成完了")


def make_ems():
    """楽トレEMS – ems.png"""
    img = make_gradient_fast((10, 30, 20), (20, 80, 40), "vertical")
    img = add_circles(img, [
        (640, 360, 280, (0, 180, 80), 30),
        (100, 300, 200, (0, 150, 60), 40),
        (1100, 300, 220, (20, 200, 80), 35),
    ])
    # 電気パルス波形
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for row in range(6):
        y_base = 80 + row * 100
        points = []
        for x in range(0, W, 5):
            wave = math.sin(x * 0.05 + row) * 30
            points.append((x, int(y_base + wave)))
        if len(points) > 1:
            d.line(points, fill=(0, 255, 100, 40), width=2)
    # 明るいパルス点
    import random
    random.seed(99)
    for _ in range(80):
        x = random.randint(0, W)
        y = random.randint(0, H)
        r = random.randint(2, 6)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(100, 255, 150, 150))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(68)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "楽トレEMS", 170, font_l, fill=(100, 255, 150))
    add_text_center(draw, "寝ているだけで深部筋トレーニング", 280, font_m, fill=(80, 230, 130))
    add_text_center(draw, "インナーマッスル強化・姿勢改善・代謝アップ", 360, font_s, fill=(60, 210, 110))
    add_text_center(draw, "運動が苦手な方・時間がない方に最適", 415, font_s, fill=(60, 210, 110))
    draw.rectangle([0, H - 80, W, H], fill=(10, 60, 30))
    add_text_center(draw, "体験無料  ●  1回20分  ●  お着替え不要", H - 60, load_font(28), fill=(100, 255, 150))
    img.save(os.path.join(OUT_DIR, "ems.png"), "PNG")
    print("ems.png 生成完了")


def make_pollen():
    """花粉症ケア – pollen.png"""
    img = make_gradient_fast((180, 230, 150), (100, 200, 80), "vertical")
    img = add_circles(img, [
        (300, 150, 200, (255, 255, 200), 50),
        (900, 200, 250, (200, 255, 150), 40),
        (640, 550, 180, (255, 255, 180), 45),
    ])
    # 花びら
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    flowers = [(150, 100), (400, 50), (750, 80), (1100, 150), (100, 400), (1150, 450), (500, 600), (900, 580)]
    for (fx, fy) in flowers:
        for i in range(6):
            ang = i * 60 * math.pi / 180
            ex = fx + math.cos(ang) * 20
            ey = fy + math.sin(ang) * 20
            d.ellipse([ex - 12, ey - 18, ex + 12, ey + 18], fill=(255, 250, 150, 60))
        d.ellipse([fx - 8, fy - 8, fx + 8, fy + 8], fill=(255, 220, 50, 80))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(68)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "花粉症ケア", 170, font_l, fill=(60, 120, 30))
    add_text_center(draw, "鍼灸・整体で症状を根本から改善", 280, font_m, fill=(50, 100, 20))
    add_text_center(draw, "くしゃみ・鼻水・目のかゆみを自然療法でケア", 360, font_s, fill=(40, 90, 20))
    add_text_center(draw, "薬に頼らない体作りをサポートします", 415, font_s, fill=(40, 90, 20))
    draw.rectangle([0, H - 80, W, H], fill=(60, 140, 40))
    add_text_center(draw, "花粉症専門ケア  ●  自律神経調整  ●  免疫力アップ", H - 60, load_font(28), fill=(255, 255, 200))
    img.save(os.path.join(OUT_DIR, "pollen.png"), "PNG")
    print("pollen.png 生成完了")


def make_keto():
    """ケトジェニック – keto.png"""
    img = make_gradient_fast((60, 40, 20), (140, 90, 40), "vertical")
    img = add_circles(img, [
        (300, 200, 200, (180, 120, 50), 50),
        (950, 300, 240, (140, 90, 30), 45),
        (640, 560, 180, (200, 140, 60), 40),
    ])
    # 食材を表すカラフルな円
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    foods = [
        (200, 200, 50, (80, 180, 50, 100)),    # avocado green
        (350, 180, 40, (255, 80, 50, 100)),     # tomato
        (250, 280, 35, (255, 200, 50, 100)),    # lemon
        (1050, 200, 55, (255, 150, 50, 100)),   # salmon
        (1000, 320, 40, (150, 200, 80, 100)),   # lettuce
        (1100, 400, 35, (255, 50, 50, 100)),    # chili
    ]
    for (fx, fy, fr, fc) in foods:
        d.ellipse([fx - fr, fy - fr, fx + fr, fy + fr], fill=fc)
    # 炎エフェクト
    for i in range(5):
        x = 580 + i * 30
        d.polygon([(x, 500), (x - 15, 580), (x + 15, 580)], fill=(255, 120, 0, 60))
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(66)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "ケトジェニックダイエット", 170, font_l, fill=(255, 210, 100))
    add_text_center(draw, "脂肪を燃やす体に変える食事法", 280, font_m, fill=(240, 190, 80))
    add_text_center(draw, "糖質制限で体脂肪を効率よく燃焼させます", 360, font_s, fill=(220, 170, 60))
    add_text_center(draw, "当院の管理指導のもと安全に実践できます", 415, font_s, fill=(220, 170, 60))
    draw.rectangle([0, H - 80, W, H], fill=(100, 60, 20))
    add_text_center(draw, "栄養指導込み  ●  体組成測定あり  ●  月額プランあり", H - 60, load_font(26), fill=(255, 210, 100))
    img.save(os.path.join(OUT_DIR, "keto.png"), "PNG")
    print("keto.png 生成完了")


def make_accident():
    """交通事故治療 – accident.png"""
    img = make_gradient_fast((20, 40, 80), (60, 100, 180), "vertical")
    img = add_circles(img, [
        (640, 360, 320, (80, 140, 220), 35),
        (150, 200, 180, (50, 100, 200), 40),
        (1100, 400, 220, (60, 120, 210), 35),
    ])
    # 光の放射
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cx, cy = W // 2, H // 2
    for i in range(24):
        ang = i * 15 * math.pi / 180
        x2 = cx + math.cos(ang) * 400
        y2 = cy + math.sin(ang) * 400
        d.line([(cx, cy), (int(x2), int(y2))], fill=(255, 220, 150, 15), width=3)
    img = img.convert("RGBA")
    img.alpha_composite(overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    font_l = load_font(66)
    font_m = load_font(44)
    font_s = load_font(30)
    add_text_center(draw, "交通事故治療", 170, font_l, fill=(255, 220, 100))
    add_text_center(draw, "事故後の痛みは当院にお任せください", 280, font_m, fill=(220, 200, 150))
    add_text_center(draw, "むちうち・腰痛・頭痛・しびれに対応", 360, font_s, fill=(200, 180, 130))
    add_text_center(draw, "自賠責保険で窓口負担0円で治療できます", 415, font_s, fill=(200, 180, 130))
    draw.rectangle([0, H - 80, W, H], fill=(20, 50, 120))
    add_text_center(draw, "自賠責保険対応  ●  示談交渉サポート  ●  通院証明書発行", H - 60, load_font(24), fill=(255, 220, 100))
    img.save(os.path.join(OUT_DIR, "accident.png"), "PNG")
    print("accident.png 生成完了")


# ── メイン ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== サクラ整骨院 サービスイメージ画像生成 ===")
    make_hero()
    make_treatment()
    make_postnatal()
    make_oxygen()
    make_ems()
    make_pollen()
    make_keto()
    make_accident()
    print("\n全8枚の生成が完了しました！")
    print(f"保存先: {OUT_DIR}")
