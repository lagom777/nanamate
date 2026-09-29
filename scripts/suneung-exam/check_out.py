import sys,json,os,re
from html.parser import HTMLParser
ALLOWED={'p','ul','ol','li','b','sub','sup','span'}
class P(HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.err=[]
    def handle_starttag(s,t,a):
        if t not in ALLOWED: s.err.append('tag:'+t)
        if t=='span' and dict(a).get('class')!='k': s.err.append('span-class')
        if any(k=='style' for k,_ in a): s.err.append('style')
        s.st.append(t)
    def handle_endtag(s,t):
        if not s.st or s.st[-1]!=t: s.err.append('mismatch:'+t)
        else: s.st.pop()
def check(name):
    p=f'grok-out/{name}.json'
    if not os.path.exists(p): return None
    d=json.load(open(p)); off=json.load(open(f'grok-official/{name}.json'))['answers']
    rep={'name':name,'n':len(d),'match':[], 'mismatch':[], 'bad_html':[], 'conf':{}, 'missing':[]}
    for i in range(1,21):
        e=d.get(str(i))
        if not e: rep['missing'].append(i); continue
        h=e.get('html','')
        pr=P(); pr.feed(h)
        if pr.err or pr.st or len(h)<40: rep['bad_html'].append((i,(pr.err or ['unclosed' if pr.st else 'short'])[0]))
        c=e.get('confidence','?'); rep['conf'][c]=rep['conf'].get(c,0)+1
        (rep['match'] if e.get('answer')==off[i-1] else rep['mismatch']).append(i)
    return rep
if __name__=='__main__':
    for name in sys.argv[1:]:
        r=check(name)
        if r is None: print(name,'no output'); continue
        print(name,'n=',r['n'],'match',len(r['match']),'mismatch',r['mismatch'],'missing',r['missing'],'bad_html',r['bad_html'],'conf',r['conf'])
