"""Preserve scientific Unicode with a pinned, licensed fallback in handouts."""
from functools import lru_cache
from html import escape
from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

@lru_cache(maxsize=1)
def fallback_font():
    path=Path(__file__).resolve().parents[1]/'src/assets/fonts/DejaVuSans.ttf'
    pdfmetrics.registerFont(TTFont('LabResourceSymbols',str(path)))
    return pdfmetrics.getFont('LabResourceSymbols')

def resource_text(value,font_name):
    primary=pdfmetrics.getFont(font_name).face.charToGlyph
    result=[]
    for char in str(value):
        if primary.get(ord(char)) or char in '\n\r\t':
            result.append(escape(char))
        elif fallback_font().face.charToGlyph.get(ord(char)):
            result.append('<font name="LabResourceSymbols">'+escape(char)+'</font>')
        else:
            raise ValueError(f'No handout font supports U+{ord(char):04X}')
    return ''.join(result)
