#!/usr/bin/env python3
"""Comprime os vídeos do Higgsfield para o site e cria as imagens de capa.

Uso:  python3 videos-higgsfield/preparar.py
Lê   videos-higgsfield/N-nome.mp4
Gera assets/video/hf/nome.mp4, nome.webm e nome-poster.jpg
"""
import glob
import os
import re
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRADA = os.path.join(RAIZ, "videos-higgsfield")
SAIDA = os.path.join(RAIZ, "assets", "video", "hf")


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def main():
    ff = ffmpeg()
    os.makedirs(SAIDA, exist_ok=True)
    fontes = sorted(glob.glob(os.path.join(ENTRADA, "*.mp4")))
    if not fontes:
        sys.exit("Nenhum .mp4 encontrado em videos-higgsfield/")
    for fonte in fontes:
        nome = re.sub(r"^\d+-", "", os.path.splitext(os.path.basename(fonte))[0])
        mp4 = os.path.join(SAIDA, nome + ".mp4")
        webm = os.path.join(SAIDA, nome + ".webm")
        capa = os.path.join(SAIDA, nome + "-poster.jpg")
        comum = ["-y", "-loglevel", "error", "-i", fonte, "-vf", "scale=1280:-2", "-an"]
        subprocess.run([ff, *comum, "-c:v", "libx264", "-preset", "slow", "-crf", "26",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], check=True)
        subprocess.run([ff, *comum, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38",
                        "-row-mt", "1", "-deadline", "good", webm], check=True)
        subprocess.run([ff, "-y", "-loglevel", "error", "-i", fonte, "-vf", "scale=1280:-2",
                        "-frames:v", "1", "-q:v", "4", capa], check=True)
        print(f"ok {nome}: {os.path.getsize(mp4)//1024} KB mp4, {os.path.getsize(webm)//1024} KB webm")


if __name__ == "__main__":
    main()
