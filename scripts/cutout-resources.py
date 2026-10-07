"""Append supplied cutouts to freshly generated lab packets (called by build-resources.py)."""
from pathlib import Path
from io import BytesIO
import subprocess
from PIL import Image
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'resources/source'
PHOTO=SOURCE/'Photosynthesis_Color_Cutouts.pdf'
RESP=SOURCE/'Cellular_Respiration_Add_On_Cutouts.pdf'
TEACHER=SOURCE/'Cellular_Respiration_Teacher_Instructions.pdf'

def introduction(resp, teacher):
    output=BytesIO(); c=canvas.Canvas(output,pagesize=(612,792))
    c.setFont('Helvetica-Bold',20);c.drawString(54,740,'Cut & sort: matter and energy')
    text=[
      'Optional introduction or extension | 10-15 minutes | Biology 2e, chapters 7 and 8.',
      'Use the optional Build the equation activity on the lab prediction page, or arrange the printed cards on chart paper. The online activity groups identical molecules; the paper activity uses all 19 molecule cards.',
      'Print cutout pages in color, single-sided, at 100% scale. Cut along dashed lines. Use scissors safely. Group work: one person arranges, one counts atoms, and one explains; then rotate roles.',
      ('Model aerobic cellular respiration. Reuse the molecule cards from the photosynthesis sheets and add the three respiration symbols. Set aside any symbols not needed.' if resp else 'Model photosynthesis. Sort all the molecule cards into reactants and products. Add plus signs and the arrow, and decide where light and chlorophyll belong.'),
      'Count carbon, hydrogen, and oxygen atoms separately on each side. Explain how your arrangement shows conservation of matter and the transfer of energy. Energy symbols are annotations, not part of this simplified atom inventory.',
      ('This equation models aerobic respiration, not yeast fermentation. Fermentation does not use oxygen. Respiration begins in the cytoplasm; most later stages in plant and animal cells occur in mitochondria. Plants respire too.' if resp else 'This is an overall net equation, not a sequence of reaction stages. The glucose diagram shows an atom inventory, not a molecular structure.'),
    ]
    if teacher:text += ['Teacher use: assign this before prediction or after analysis. Accept either order of molecule groups on the same side. Ask students to explain placement, not just match a key. In the online model, each correct bundle or symbol earns practice feedback only; no grade is submitted.', 'The supplied originals follow, including answer keys. Student packets omit the photosynthesis teacher page and the answer text under the respiration cutouts. For respiration, the ATP symbol does not specify yield; ADP and phosphate are not shown.']
    else:text += ['Name: _______________________  Class: __________  Date: __________', 'My equation and symbol placement:', '__________________________________________________________________', 'Atom counts: Reactants C ____ H ____ O ____ | Products C ____ H ____ O ____', 'Explain where energy enters, is stored, or leaves this process:', '__________________________________________________________________', '__________________________________________________________________']
    y=703
    for t in text:
      p=Paragraph(t,getSampleStyleSheet()['BodyText']);w,h=p.wrap(504,700);p.drawOn(c,54,y-h);y-=h+14
    assert y>50,'Introduction overflow'
    c.setFont('Helvetica',9);c.drawString(54,30,'Companion activity | Supplied classroom cutouts | Development classroom pilot')
    c.save();output.seek(0);return PdfReader(output)

def append_cutouts(lab_id,guide_only=False):
    if lab_id not in ('light-photosynthesis','yeast-fermentation'):return
    resp=lab_id=='yeast-fermentation'
    for teacher in (False,True):
      if guide_only and not teacher:continue
      path=ROOT/'public/resources'/f'{lab_id}-{"teacher-guide" if teacher else "worksheet"}.pdf'
      writer=PdfWriter();writer.append(PdfReader(path));writer.append(introduction(resp,teacher))
      writer.append(PdfReader(PHOTO),pages=None if teacher else (0,3))
      if resp:
        if teacher:
          writer.append(PdfReader(RESP));writer.append(PdfReader(TEACHER))
        else:
          # Rasterize only the card area so hidden PDF text cannot expose the key.
          prefix=ROOT/'tmp/pdfs/respiration-cards-source'
          subprocess.run(['pdftoppm','-r','200','-singlefile','-png',str(RESP),str(prefix)],check=True)
          im=Image.open(str(prefix)+'.png');im=im.crop((0,0,im.width,round(im.height*330/792)))
          out=BytesIO();c=canvas.Canvas(out,pagesize=(612,792))
          c.drawImage(ImageReader(im),0,462,width=612,height=330)
          c.setFont('Helvetica',11);c.drawString(42,422,'Arrange these symbols with the molecule cards. Explain each placement.')
          c.drawString(42,402,'Reuse the molecule cards; set aside symbols not needed for this process.')
          c.setFont('Helvetica',9);c.drawString(42,30,'Student cutouts | Print in color, single-sided, at 100% scale')
          c.save();out.seek(0);writer.append(PdfReader(out))
      with path.open('wb') as target:writer.write(target)
