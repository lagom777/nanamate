import json
P={'phys1':([2,5,1,3,1,4,3,5,4,3,2,1,1,3,5,4,5,3,5,2],[2,2,3,3,2,3,2,2,3,2,3,2,3,3,2,3,2,3,3,2]),
   'bio1':([5,1,4,2,1,3,3,2,4,2,5,4,2,5,1,4,2,3,1,5],[2,3,2,3,3,2,2,2,3,3,2,3,2,3,2,3,3,2,3,2])}
m=json.load(open('out/manifest.json'))
for k,(a,p) in P.items():
    assert sum(p)==50
    d={'answers':a,'points':p}
    json.dump(d,open(f'out/2025-csat/{k}/meta.json','w')); m['2025-csat'][k]=d
json.dump(m,open('out/manifest.json','w'),ensure_ascii=False)
bad=[(k,s) for k,v in m.items() for s in ('phys1','bio1') if None in v[s]['answers'] or sum(v[s]['points'])!=50]
print('bad',bad,len(m),'exams')
