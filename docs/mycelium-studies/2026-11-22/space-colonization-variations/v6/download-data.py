from pathlib import Path
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import shutil,json
BASE=Path(__file__).parent
FRAMES=[6193,6216,6239,6262,6285,6308,6331,6354,6377,6398]
COMMIT='2fd578d8adbb749dbb7b609291b9e9112b5968cc'
def download(item):
    frame,kind=item
    name=f'{kind}_745A{frame}-results.csv'
    path=BASE/'data'/name
    if path.exists():return name,path.stat().st_size
    if frame==6398:
        shutil.copyfile(BASE.parent.parent/'references-github-2026-11-22'/'original-synosys'/'data'/'neurospora'/name,path)
    else:
        with urlopen(f'https://raw.githubusercontent.com/synosys/animated-fungal-network-growth/{COMMIT}/data/neurospora/{name}',timeout=40) as response:path.write_bytes(response.read())
    return name,path.stat().st_size
if __name__=='__main__':
    with ThreadPoolExecutor(max_workers=5) as pool:
        results=list(pool.map(download,[(frame,kind)for frame in FRAMES for kind in ['spatial','edges']]))
    (BASE/'data'/'manifest.json').write_text(json.dumps({'commit':COMMIT,'frames':[f'745A{f}'for f in FRAMES],'files':[{'file':f,'bytes':n}for f,n in results]},indent=2)+'\n')
    print(len(results),'files',sum(n for _,n in results),'bytes')
