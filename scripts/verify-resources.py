"""Check public handout parity with the current lab definitions and asset hashes."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import unicodedata
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
query="""
import {investigations} from './src/investigations/content.js';
import {extendedLabs,sordariaExtension} from './src/investigations/extended-content.js';
import {predictionPrompt,reasoningQuestions} from './src/data/osmosis-learning.js';
import {explanationQuestions} from './src/investigations/extraction-report.js';
import {checkpoints} from './src/investigations/extraction-model.js';
import {checks,explanationPrompts,limits} from './src/investigations/genetics-model.js';
import {labs} from './src/catalog.js';
import {embryoContent} from './src/investigations/embryo-content.js';
import {habitatContent} from './src/investigations/habitat-content.js';
import {populationContent} from './src/investigations/population-content.js';
import {energyContent} from './src/investigations/energy-content.js';
import {reserveContent} from './src/investigations/reserve-content.js';
import {immuneContent} from './src/investigations/immune-content.js';
import {nephContent} from './src/investigations/neph-content.js';
import {flowContent} from './src/investigations/flow-content.js';
import {breathContent} from './src/investigations/breath-content.js';
import {leverContent} from './src/investigations/lever-content.js';
import {glucoseContent} from './src/investigations/glucose-content.js';
import {blindContent} from './src/investigations/blind-content.js';
import {reactionContent} from './src/investigations/reaction-content.js';
import {starchContent} from './src/investigations/starch-content.js';
import {heatContent} from './src/investigations/heat-content.js';
import {flowerContent} from './src/investigations/flower-content.js';
import {soilContent} from './src/investigations/soil-content.js';
import {transpContent} from './src/investigations/transp-content.js';
import {limbsContent} from './src/investigations/limbs-content.js';
import {keyContent} from './src/investigations/key-content.js';
import {bodyplansContent} from './src/investigations/bodyplans-content.js';
import {dispersalContent} from './src/investigations/dispersal-content.js';
import {seedlessContent} from './src/investigations/seedless-content.js';
import {fungalContent} from './src/investigations/fungal-content.js';
import {protistContent} from './src/investigations/protist-content.js';
import {prokContent} from './src/investigations/prok-content.js';
import {viralContent} from './src/investigations/viral-content.js';
import {phyloContent} from './src/investigations/phylo-content.js';
import {driftContent} from './src/investigations/drift-content.js';
import {selectionContent} from './src/investigations/selection-content.js';
import {foodContent} from './src/investigations/food-content.js';
import {surfaceContent} from './src/investigations/surface-content.js';
import {seedContent} from './src/investigations/seed-content.js';
console.log(JSON.stringify({
 embryo:embryoContent,habitat:habitatContent, population:populationContent, energy:energyContent, reserve:reserveContent,immune:immuneContent,neph:nephContent,flow:flowContent,breath:breathContent,lever:leverContent,glucose:glucoseContent,blind:blindContent,reaction:reactionContent,starch:starchContent,heat:heatContent,flower:flowerContent,soil:soilContent,transp:transpContent,limbs:limbsContent,key:keyContent,bodyplans:bodyplansContent,dispersal:dispersalContent,seedless:seedlessContent,fungal:fungalContent,protist:protistContent,prok:prokContent,viral:viralContent,phylo:phyloContent,drift:driftContent,selection:selectionContent,food:foodContent,surface:surfaceContent,seed:seedContent,core:Object.values(investigations),extended:[...extendedLabs,sordariaExtension],
 osmosis:[predictionPrompt,...reasoningQuestions.map(question=>question.prompt)],
 extraction:[...explanationQuestions,...Object.values(checkpoints).map(question=>question.question)],
 genetics:[...explanationPrompts,limits,...Object.values(checks).map(question=>question.prompt)],
 catalog:labs.filter(lab=>lab.status==='available')
}));
"""
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',query],cwd=ROOT,encoding='utf-8'))
issues=[]
texts={}

def normalized(text):
    text=unicodedata.normalize('NFKC',text).lower().translate(str.maketrans({'µ':'u','μ':'u','×':'x'}))
    return re.sub(r'[^a-z0-9]+',' ',text).strip()

def require_text(name,fragment,label):
    if normalized(fragment) not in normalized(texts.get(name,'')):
        issues.append(f'{name} missing {label}')

for path in sorted((ROOT/'public/resources').glob('*.pdf')):
    reader=PdfReader(path)
    pages=[page.extract_text() or '' for page in reader.pages]
    texts[path.name]='\n'.join(pages)
    if any('\x00' in page or '\ufffd' in page for page in pages):
        issues.append(f'{path.name} has unsupported extracted glyphs')
    if not pages or any(not page.strip() for page in pages):
        issues.append(f'{path.name} has an empty page')
    for word in ['PDF','print','report']:
        require_text(path.name,word,'report direction '+word)

for c in data['core']+data['extended']:
    if c['kind']=='extraction':
        continue
    name=c['id']+'-worksheet.pdf'
    require_text(name,c['question'],'investigation question')
    for question in c.get('questions',c.get('analysis',[])):
        require_text(name,question,'current explanation prompt')
    require_text(name,c['learningPlan']['note'],'workload and sampling rationale')
    for condition in c['conditions']:
        label=condition['label'] if isinstance(condition,dict) else condition
        require_text(name,label,'condition '+label)

for id,questions in [('osmosis-homeostasis',data['osmosis']),('dna-replication',data['extraction'])]:
    for question in questions:
        require_text(id+'-worksheet.pdf',question,'shared prompt')
for question in data['genetics']:
    require_text('genetic-information-teacher-guide.pdf',question,'shared genetics content')

for method in ['balloon','cylinder','syringe','classroom']:
    for kind in ['worksheet','teacher-guide']:
        name=f'yeast-fermentation-{method}-{kind}.pdf'
        require_text(name,'20 g yeast','current yeast recipe')
        require_text(name,'80 g','current sugar recipe')
        require_text(name,'1,000 mL','recipe water basis')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['seed']['question'],data['seed']['limits'],*[q['prompt'] for q in data['seed']['explanations']]]:
        require_text('seed-germination-'+kind+'.pdf',fragment,'current Seed Germination content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['surface']['question'],data['surface']['limits'],*[q['prompt'] for q in data['surface']['explanations']]]:
        require_text('water-surface-tension-'+kind+'.pdf',fragment,'current surface tension content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['food']['question'],data['food']['limits'],*[q['prompt'] for q in data['food']['explanations']]]:
        require_text('food-macromolecules-'+kind+'.pdf',fragment,'current food-assay content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['selection']['question'],data['selection']['limits'],*[q['prompt'] for q in data['selection']['explanations']]]:
        require_text('natural-selection-'+kind+'.pdf',fragment,'current selection content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['drift']['question'],data['drift']['limits'],*[q['prompt'] for q in data['drift']['explanations']]]:
        require_text('genetic-drift-'+kind+'.pdf',fragment,'current drift content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['phylo']['question'],data['phylo']['limits'],*[q['prompt'] for q in data['phylo']['explanations']]]:
        require_text('phylogenetic-trees-'+kind+'.pdf',fragment,'current phylogenetic-tree content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['viral']['question'],data['viral']['limits'],*[q['prompt'] for q in data['viral']['explanations']]]:
        require_text('viral-spread-'+kind+'.pdf',fragment,'current viral-spread content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['prok']['question'],data['prok']['limits'],*[q['prompt'] for q in data['prok']['explanations']]]:
        require_text('unknown-prokaryote-'+kind+'.pdf',fragment,'current prokaryote content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['protist']['question'],data['protist']['limits'],*[q['prompt'] for q in data['protist']['explanations']]]:
        require_text('protist-movement-'+kind+'.pdf',fragment,'current protist content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['fungal']['question'],data['fungal']['limits'],*[q['prompt'] for q in data['fungal']['explanations']]]:
        require_text('fungal-structures-'+kind+'.pdf',fragment,'current fungal content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['seedless']['question'],data['seedless']['limits'],*[q['prompt'] for q in data['seedless']['explanations']]]:
        require_text('moss-fern-'+kind+'.pdf',fragment,'current moss/fern content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['dispersal']['question'],data['dispersal']['limits'],*[q['prompt'] for q in data['dispersal']['explanations']]]:
        require_text('seed-dispersal-'+kind+'.pdf',fragment,'current dispersal content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['bodyplans']['question'],data['bodyplans']['limits'],*[q['prompt'] for q in data['bodyplans']['explanations']]]:
        require_text('animal-body-plans-'+kind+'.pdf',fragment,'current body plans content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['key']['question'],data['key']['limits'],*[q['prompt'] for q in data['key']['explanations']]]:
        require_text('invertebrate-key-'+kind+'.pdf',fragment,'current identification key content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['limbs']['question'],data['limbs']['limits'],*[q['prompt'] for q in data['limbs']['explanations']]]:
        require_text('vertebrate-limbs-'+kind+'.pdf',fragment,'current vertebrate limb content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['transp']['question'],data['transp']['limits'],*[q['prompt'] for q in data['transp']['explanations']]]:
        require_text('transpiration-'+kind+'.pdf',fragment,'current transpiration content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['soil']['question'],data['soil']['limits'],*[q['prompt'] for q in data['soil']['explanations']]]:
        require_text('soil-water-'+kind+'.pdf',fragment,'current soil-water content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['flower']['question'],data['flower']['limits'],data['flower']['pollinationCheck']['prompt'],*[q['prompt'] for q in data['flower']['explanations']]]:
        require_text('flower-pollination-'+kind+'.pdf',fragment,'current flower-pollination content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['heat']['question'],data['heat']['limits'],*[q['prompt'] for q in data['heat']['explanations']]]:
        require_text('body-heat-'+kind+'.pdf',fragment,'current body-heat content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['starch']['question'],data['starch']['limits'],*[q['prompt'] for q in data['starch']['explanations']]]:
        require_text('starch-digestion-'+kind+'.pdf',fragment,'current starch-digestion content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['reaction']['question'],data['reaction']['limits'],*[q['prompt'] for q in data['reaction']['explanations']]]:
        require_text('reaction-time-'+kind+'.pdf',fragment,'current reaction-time content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['blind']['question'],data['blind']['limits'],*[q['prompt'] for q in data['blind']['explanations']]]:
        require_text('blind-spot-'+kind+'.pdf',fragment,'current blind-spot content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['glucose']['question'],data['glucose']['limits'],*[q['prompt'] for q in data['glucose']['explanations']]]:
        require_text('glucose-feedback-'+kind+'.pdf',fragment,'current glucose-feedback content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['lever']['question'],data['lever']['limits'],*[q['prompt'] for q in data['lever']['explanations']]]:
        require_text('muscle-levers-'+kind+'.pdf',fragment,'current muscle-levers content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['breath']['question'],data['breath']['limits'],*[q['prompt'] for q in data['breath']['explanations']]]:
        require_text('breathing-'+kind+'.pdf',fragment,'current breathing content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['flow']['question'],data['flow']['limits'],*[q['prompt'] for q in data['flow']['explanations']]]:
        require_text('blood-flow-'+kind+'.pdf',fragment,'current blood-flow content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['neph']['question'],data['neph']['limits'],*[q['prompt'] for q in data['neph']['explanations']]]:
        require_text('nephron-'+kind+'.pdf',fragment,'current nephron content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['immune']['question'],data['immune']['limits'],*[q['prompt'] for q in data['immune']['explanations']]]:
        require_text('immune-memory-'+kind+'.pdf',fragment,'current immune content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['embryo']['question'],data['embryo']['limits'],*[q['prompt'] for q in data['embryo']['explanations']]]:
        require_text('embryonic-development-'+kind+'.pdf',fragment,'current embryo content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['habitat']['question'],data['habitat']['limits'],*[q['prompt'] for q in data['habitat']['explanations']]]:
        require_text('microhabitats-'+kind+'.pdf',fragment,'current habitat content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['population']['question'],data['population']['limits'],*[q['prompt'] for q in data['population']['explanations']]]:
        require_text('population-estimates-'+kind+'.pdf',fragment,'current population content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['energy']['question'],data['energy']['limits'],*[q['prompt'] for q in data['energy']['explanations']]]:
        require_text('food-web-energy-'+kind+'.pdf',fragment,'current energy content')

for kind in ['worksheet','teacher-guide']:
    for fragment in [data['reserve']['question'],data['reserve']['limits'],*[q['prompt'] for q in data['reserve']['explanations']]]:
        require_text('reserve-design-'+kind+'.pdf',fragment,'current reserve content')

for lab in data['catalog']:
    for resource in lab['resources']:
        path=ROOT/'public'/resource['url'].removeprefix('./')
        if not path.is_file() or path.read_bytes()[:5]!=b'%PDF-':
            issues.append(f'{lab["id"]} has an unavailable PDF resource')

inventory=json.loads((ROOT/'ASSET_INVENTORY.json').read_text(encoding='utf-8-sig'))
indexed={item['path']:item for item in inventory}
for path in (ROOT/'public/resources').glob('*.pdf'):
    relative=path.relative_to(ROOT).as_posix()
    entry=indexed.get(relative)
    content=path.read_bytes()
    if not entry or entry['sha256']!=hashlib.sha256(content).hexdigest() or entry['bytes']!=len(content):
        issues.append(f'{relative} has an absent or stale asset hash')

if issues:
    raise SystemExit('\n'.join(issues))
print(f'Verified {len(texts)} resource PDFs, current prompts and conditions, classroom recipes, catalog downloads, and asset hashes.')
