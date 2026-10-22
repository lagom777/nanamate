"""한국사 정답표 손보정: 글자가 그림인 2025학년도 수능 정답표(홀수형)를 이미지에서 옮긴 값, 2017학년도 수능 14번 복수정답."""
import json
m = json.load(open('manifest_hist.json'))
m['2025-csat']['hist'] = {'answers': [5, 1, 3, 3, 1, 4, 5, 2, 5, 3, 5, 4, 1, 3, 2, 2, 4, 3, 2, 1],
                          'points': [2, 3, 3, 2, 2, 3, 2, 3, 3, 2, 3, 2, 3, 3, 2, 2, 3, 2, 3, 2]}
h = m['2017-csat']['hist']; h['answers'][13] = [1, 5]; h['points'][13] = 2
for k, v in m.items():
    a, p = v['hist']['answers'], v['hist']['points']
    assert len(a) == 20 and None not in a and sum(p) == 50, k
json.dump(m, open('manifest_hist.json', 'w'), ensure_ascii=False)
print(len(m), 'exams ok')
