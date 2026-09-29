import json
P={
 'chem1':([5,4,3,2,1,3,1,5,5,2,3,1,3,5,3,2,4,4,2,5],[2,3,2,2,2,3,2,3,2,3,2,3,2,3,2,3,3,3,2,3]),
 'earth1':([4,5,4,3,4,2,2,3,1,1,3,5,2,5,1,5,5,2,4,2],[2,2,2,3,2,2,2,2,3,3,3,2,3,3,2,3,3,3,3,2]),
 'phys2':([1,1,2,4,4,2,3,2,3,5,5,1,3,4,5,2,4,3,2,1],[2,2,2,3,2,3,2,3,3,3,2,3,3,3,2,2,2,2,3,3]),
 'chem2':([3,4,5,5,3,1,1,2,3,2,1,4,4,1,5,2,2,4,2,1],[2,3,2,2,3,3,2,2,2,3,3,2,3,3,2,2,3,2,3,3]),
 'bio2':([4,5,1,2,3,5,5,4,4,2,3,2,3,1,4,2,2,1,1,5],[3,2,2,3,2,3,2,3,2,2,2,3,3,2,2,3,3,3,3,2]),
 'earth2':([3,3,5,2,4,1,4,4,3,2,5,1,1,4,5,1,2,3,5,5],[2,2,3,2,3,2,3,2,3,2,3,2,3,2,2,3,3,3,3,2]),
}
m=json.load(open('out/manifest_more.json'))
for sub,(a,p) in P.items():
    assert sum(p)==50,sub
    d={'answers':a,'points':p}
    json.dump(d,open(f'out/2025-csat/{sub}/meta.json','w')); m['2025-csat'][sub]=d
# 정답 없음(모두 정답 처리): 0
for key,sub,idx in (('2022-csat','bio2',19),('2023-jun','earth2',13)):
    d=m[key][sub]; d['answers'][idx]=0; d['points'][idx]=2
    json.dump(d,open(f'out/{key}/{sub}/meta.json','w'))
bad=[(k,s) for k,v in m.items() for s in v if s!='title' and (None in v[s]['answers'] or None in v[s]['points'] or sum(v[s]['points'])!=50)]
print('bad',bad,len(m),'exams')
json.dump(m,open('out/manifest_more.json','w'),ensure_ascii=False)
